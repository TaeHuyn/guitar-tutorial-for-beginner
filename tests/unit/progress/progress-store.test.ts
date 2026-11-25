import { describe, expect, it, vi } from "vitest";
import { ProgressStore, nextLessonSlug, type RemoteApi } from "@/lib/progress/progress-store";

class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

const NOW = new Date("2026-11-05T03:00:00Z");
const TZ = "Asia/Ho_Chi_Minh";

function remote(overrides: Partial<RemoteApi> = {}): RemoteApi {
  return {
    markLessonComplete: vi.fn(async (i) => ({
      ok: true as const,
      data: { lessonSlug: i.lessonSlug, completedAt: i.completedAt },
    })),
    unmarkLessonComplete: vi.fn(async (i) => ({
      ok: true as const,
      data: { lessonSlug: i.lessonSlug },
    })),
    logPracticeSession: vi.fn(async (s) => ({ ok: true as const, data: s })),
    deletePracticeSession: vi.fn(async (i) => ({ ok: true as const, data: { id: i.id } })),
    ...overrides,
  };
}

describe("ProgressStore (guest)", () => {
  it("persists completions and sessions in localStorage under gt:v1:guest", () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore({ storage, key: "gt:v1:guest", timeZone: TZ, now: () => NOW });
    store.markComplete("cau-tao-dan");
    store.logSession({ durationMinutes: 20, bpmReached: 70 });

    const reloaded = new ProgressStore({
      storage,
      key: "gt:v1:guest",
      timeZone: TZ,
      now: () => NOW,
    });
    const snap = reloaded.snapshot();
    expect(snap.completed["cau-tao-dan"]).toEqual({
      completedAt: NOW.toISOString(),
      completedOn: "2026-11-05",
    });
    expect(snap.sessions).toHaveLength(1);
    expect(snap.sessions[0]).toMatchObject({
      durationMinutes: 20,
      bpmReached: 70,
      practicedOn: "2026-11-05",
    });
    expect(snap.pendingOps).toEqual([]);
  });

  it("keeps the earliest completion when a lesson is completed twice", () => {
    const storage = new MemoryStorage();
    let t = NOW;
    const store = new ProgressStore({ storage, key: "k", timeZone: TZ, now: () => t });
    store.markComplete("a");
    t = new Date("2026-11-07T03:00:00Z");
    store.markComplete("a");
    expect(store.snapshot().completed.a.completedOn).toBe("2026-11-05");
  });

  it("unmarks lessons and deletes sessions", () => {
    const store = new ProgressStore({
      storage: new MemoryStorage(),
      key: "k",
      timeZone: TZ,
      now: () => NOW,
    });
    store.markComplete("a");
    store.unmarkComplete("a");
    const s = store.logSession({ durationMinutes: 5 });
    store.deleteSession(s.id);
    expect(store.snapshot().completed).toEqual({});
    expect(store.snapshot().sessions).toEqual([]);
  });

  it("rejects invalid durations", () => {
    const store = new ProgressStore({
      storage: new MemoryStorage(),
      key: "k",
      timeZone: TZ,
      now: () => NOW,
    });
    expect(() => store.logSession({ durationMinutes: 0 })).toThrow(/1 đến 600/);
    expect(() => store.logSession({ durationMinutes: 601 })).toThrow(/1 đến 600/);
  });

  it("survives broken storage", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {},
    };
    const store = new ProgressStore({ storage: broken, key: "k", timeZone: TZ, now: () => NOW });
    store.markComplete("a");
    expect(store.snapshot().completed.a).toBeDefined();
  });
});

describe("ProgressStore (signed in, offline queue)", () => {
  it("queues operations and sends them on flush", async () => {
    const api = remote();
    const store = new ProgressStore({
      storage: new MemoryStorage(),
      key: "u",
      timeZone: TZ,
      now: () => NOW,
      remote: api,
    });
    store.markComplete("a");
    const s = store.logSession({ durationMinutes: 10 });
    await store.flush();
    expect(api.markLessonComplete).toHaveBeenCalledWith({
      lessonSlug: "a",
      completedAt: NOW.toISOString(),
      completedOn: "2026-11-05",
    });
    expect(api.logPracticeSession).toHaveBeenCalledWith(
      expect.objectContaining({ id: s.id, durationMinutes: 10 }),
    );
    expect(store.snapshot().pendingOps).toEqual([]);
  });

  it("keeps operations while offline and retries later with the same session id (idempotent)", async () => {
    let online = false;
    const api = remote({
      logPracticeSession: vi.fn(async (s) => {
        if (!online) throw new TypeError("Failed to fetch");
        return { ok: true as const, data: s };
      }),
    });
    const storage = new MemoryStorage();
    const store = new ProgressStore({
      storage,
      key: "u",
      timeZone: TZ,
      now: () => NOW,
      remote: api,
    });
    const s = store.logSession({ durationMinutes: 10 });
    await store.flush();
    expect(store.snapshot().pendingOps).toHaveLength(1);

    // Page reload while offline: the queue is persisted.
    const reloaded = new ProgressStore({
      storage,
      key: "u",
      timeZone: TZ,
      now: () => NOW,
      remote: api,
    });
    online = true;
    await reloaded.flush();
    expect(reloaded.snapshot().pendingOps).toEqual([]);
    const ids = (api.logPracticeSession as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0].id);
    expect(ids).toEqual([s.id, s.id]);
  });

  it("drops operations the server rejects as invalid instead of retrying forever", async () => {
    const api = remote({
      markLessonComplete: vi.fn(async () => ({
        ok: false as const,
        error: "NOT_FOUND" as const,
        message: "x",
      })),
    });
    const store = new ProgressStore({
      storage: new MemoryStorage(),
      key: "u",
      timeZone: TZ,
      now: () => NOW,
      remote: api,
    });
    store.markComplete("khong-ton-tai");
    await store.flush();
    expect(store.snapshot().pendingOps).toEqual([]);
  });

  it("replaces local data with the server snapshot but re-applies pending ops", () => {
    const store = new ProgressStore({
      storage: new MemoryStorage(),
      key: "u",
      timeZone: TZ,
      now: () => NOW,
      remote: remote(),
    });
    store.markComplete("local-only");
    store.replaceFromServer({
      completed: { "tu-server": { completedAt: NOW.toISOString(), completedOn: "2026-11-01" } },
      sessions: [],
    });
    expect(Object.keys(store.snapshot().completed).sort()).toEqual(["local-only", "tu-server"]);
  });
});

describe("nextLessonSlug", () => {
  it("is the first lesson in path order that is not completed", () => {
    expect(nextLessonSlug(["a", "b", "c"], { a: { completedAt: "", completedOn: "" } })).toBe("b");
    expect(nextLessonSlug(["a"], { a: { completedAt: "", completedOn: "" } })).toBeNull();
  });
});
