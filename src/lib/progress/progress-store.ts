import type { Result } from "@/actions/result";
import { localDate } from "./streaks";

/**
 * One progress store for guests and signed-in users (research R8).
 * - Every change is applied locally first (works offline, instant UI).
 * - Signed in: changes are also queued in `pendingOps` and sent to the server by `flush()`;
 *   network failures keep the op for later, validation failures drop it.
 * - Operations are idempotent (lesson slug key, client-generated session id).
 */

export interface CompletedEntry {
  completedAt: string;
  completedOn: string;
}

export interface PracticeSession {
  id: string;
  practicedOn: string;
  durationMinutes: number;
  lessonSlug?: string;
  note?: string;
  bpmReached?: number;
}

export type Op =
  | { type: "complete"; lessonSlug: string; completedAt: string; completedOn: string }
  | { type: "uncomplete"; lessonSlug: string }
  | { type: "logSession"; session: PracticeSession }
  | { type: "deleteSession"; id: string };

export interface Snapshot {
  version: 1;
  completed: Record<string, CompletedEntry>;
  sessions: PracticeSession[];
  pendingOps: Op[];
}

export interface RemoteApi {
  markLessonComplete(i: {
    lessonSlug: string;
    completedAt: string;
    completedOn: string;
  }): Promise<Result<unknown>>;
  unmarkLessonComplete(i: { lessonSlug: string }): Promise<Result<unknown>>;
  logPracticeSession(s: PracticeSession): Promise<Result<unknown>>;
  deletePracticeSession(i: { id: string }): Promise<Result<unknown>>;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const GUEST_KEY = "gt:v1:guest";
export const userKey = (userId: string) => `gt:v1:user:${userId}`;

const empty = (): Snapshot => ({ version: 1, completed: {}, sessions: [], pendingOps: [] });

export class DurationError extends Error {
  constructor() {
    super("Thời lượng phải từ 1 đến 600 phút");
  }
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // RFC4122 v4 fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export class ProgressStore {
  private state: Snapshot;
  private flushing: Promise<void> | null = null;
  private listeners = new Set<() => void>();
  private readonly storage: StorageLike;
  private readonly key: string;
  private readonly now: () => Date;
  readonly remote: RemoteApi | null;
  timeZone: string;

  constructor(opts: {
    storage: StorageLike;
    key: string;
    timeZone: string;
    now?: () => Date;
    remote?: RemoteApi | null;
  }) {
    this.storage = opts.storage;
    this.key = opts.key;
    this.timeZone = opts.timeZone;
    this.now = opts.now ?? (() => new Date());
    this.remote = opts.remote ?? null;
    this.state = this.read();
  }

  snapshot(): Snapshot {
    return this.state;
  }

  subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  setTimeZone(tz: string): void {
    this.timeZone = tz;
  }

  today(): string {
    return localDate(this.timeZone, this.now());
  }

  markComplete(lessonSlug: string): void {
    const existing = this.state.completed[lessonSlug];
    const entry = existing ?? { completedAt: this.now().toISOString(), completedOn: this.today() };
    this.commit(
      { ...this.state, completed: { ...this.state.completed, [lessonSlug]: entry } },
      existing ? null : { type: "complete", lessonSlug, ...entry },
    );
  }

  unmarkComplete(lessonSlug: string): void {
    if (!this.state.completed[lessonSlug]) return;
    const completed = { ...this.state.completed };
    delete completed[lessonSlug];
    this.commit({ ...this.state, completed }, { type: "uncomplete", lessonSlug });
  }

  logSession(
    input: Omit<PracticeSession, "id" | "practicedOn"> & { practicedOn?: string },
  ): PracticeSession {
    if (
      !Number.isInteger(input.durationMinutes) ||
      input.durationMinutes < 1 ||
      input.durationMinutes > 600
    ) {
      throw new DurationError();
    }
    const session: PracticeSession = {
      id: uuid(),
      practicedOn: input.practicedOn ?? this.today(),
      ...stripUndefined(input),
    };
    this.commit(
      { ...this.state, sessions: [session, ...this.state.sessions] },
      { type: "logSession", session },
    );
    return session;
  }

  deleteSession(id: string): void {
    this.commit(
      { ...this.state, sessions: this.state.sessions.filter((s) => s.id !== id) },
      { type: "deleteSession", id },
    );
  }

  /** Server data wins, then still-pending local ops are re-applied on top. */
  replaceFromServer(server: {
    completed: Record<string, CompletedEntry>;
    sessions: PracticeSession[];
  }): void {
    let next: Snapshot = {
      ...empty(),
      completed: { ...server.completed },
      sessions: [...server.sessions],
    };
    for (const op of this.state.pendingOps) next = applyOp(next, op);
    next.pendingOps = this.state.pendingOps;
    this.state = next;
    this.write();
    this.emit();
  }

  clear(): void {
    this.state = empty();
    try {
      this.storage.removeItem(this.key);
    } catch {
      /* ignore */
    }
    this.emit();
  }

  /** Sends pending ops in order. Stops at the first network error (retry later). */
  flush(): Promise<void> {
    if (!this.remote) return Promise.resolve();
    this.flushing ??= (async () => {
      try {
        while (this.state.pendingOps.length > 0) {
          const op = this.state.pendingOps[0];
          let result: Result<unknown>;
          try {
            result = await this.send(op);
          } catch {
            return; // offline / network error — keep the op
          }
          if (!result.ok && (result.error === "INTERNAL" || result.error === "RATE_LIMITED"))
            return;
          // ok, or rejected as invalid (VALIDATION/NOT_FOUND/UNAUTHENTICATED) → drop it
          this.state = { ...this.state, pendingOps: this.state.pendingOps.slice(1) };
          this.write();
        }
      } finally {
        this.flushing = null;
        this.emit();
      }
    })();
    return this.flushing;
  }

  private send(op: Op): Promise<Result<unknown>> {
    const r = this.remote!;
    switch (op.type) {
      case "complete":
        return r.markLessonComplete({
          lessonSlug: op.lessonSlug,
          completedAt: op.completedAt,
          completedOn: op.completedOn,
        });
      case "uncomplete":
        return r.unmarkLessonComplete({ lessonSlug: op.lessonSlug });
      case "logSession":
        return r.logPracticeSession(op.session);
      case "deleteSession":
        return r.deletePracticeSession({ id: op.id });
    }
  }

  private commit(next: Snapshot, op: Op | null) {
    this.state = op && this.remote ? { ...next, pendingOps: [...next.pendingOps, op] } : next;
    this.write();
    this.emit();
    if (op && this.remote) void this.flush();
  }

  private read(): Snapshot {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return empty();
      const v = JSON.parse(raw) as Partial<Snapshot>;
      if (v?.version !== 1) return empty();
      return {
        version: 1,
        completed: v.completed ?? {},
        sessions: Array.isArray(v.sessions) ? v.sessions : [],
        pendingOps: Array.isArray(v.pendingOps) ? v.pendingOps : [],
      };
    } catch {
      return empty();
    }
  }

  private write() {
    try {
      this.storage.setItem(this.key, JSON.stringify(this.state));
    } catch {
      /* storage blocked: keep in memory */
    }
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }
}

function applyOp(s: Snapshot, op: Op): Snapshot {
  switch (op.type) {
    case "complete":
      return s.completed[op.lessonSlug]
        ? s
        : {
            ...s,
            completed: {
              ...s.completed,
              [op.lessonSlug]: { completedAt: op.completedAt, completedOn: op.completedOn },
            },
          };
    case "uncomplete": {
      const completed = { ...s.completed };
      delete completed[op.lessonSlug];
      return { ...s, completed };
    }
    case "logSession":
      return s.sessions.some((x) => x.id === op.session.id)
        ? s
        : { ...s, sessions: [op.session, ...s.sessions] };
    case "deleteSession":
      return { ...s, sessions: s.sessions.filter((x) => x.id !== op.id) };
  }
}

function stripUndefined<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== "")) as T;
}

export function nextLessonSlug(
  pathOrder: readonly string[],
  completed: Record<string, CompletedEntry>,
): string | null {
  return pathOrder.find((s) => !completed[s]) ?? null;
}
