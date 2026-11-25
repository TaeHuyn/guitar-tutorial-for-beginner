import { describe, expect, it } from "vitest";
import {
  DeleteAccountSchema,
  LessonCompleteSchema,
  MergeGuestSchema,
  PracticeSessionSchema,
  UpdateProfileSchema,
  practiceSessionSchemaFor,
} from "@/actions/schemas";

const base = {
  id: "7f0e7c3e-7f1b-4d6a-9d4a-2f7f3b1f0a11",
  practicedOn: "2026-11-05",
  durationMinutes: 20,
};

describe("PracticeSessionSchema", () => {
  it("accepts a valid session", () => {
    expect(PracticeSessionSchema.safeParse({ ...base, bpmReached: 70, note: "G↔C" }).success).toBe(
      true,
    );
  });

  it.each([0, 601, 1.5])("rejects duration %s with the Vietnamese message", (d) => {
    const r = PracticeSessionSchema.safeParse({ ...base, durationMinutes: d });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("Thời lượng phải từ 1 đến 600 phút");
  });

  it("limits notes to 500 characters", () => {
    expect(PracticeSessionSchema.safeParse({ ...base, note: "x".repeat(501) }).success).toBe(false);
  });

  it("limits BPM to 30–250", () => {
    expect(PracticeSessionSchema.safeParse({ ...base, bpmReached: 29 }).success).toBe(false);
    expect(PracticeSessionSchema.safeParse({ ...base, bpmReached: 251 }).success).toBe(false);
  });

  it("rejects dates more than one day in the future", () => {
    const schema = practiceSessionSchemaFor(new Date("2026-11-05T00:00:00Z"));
    expect(schema.safeParse({ ...base, practicedOn: "2026-11-06" }).success).toBe(true);
    expect(schema.safeParse({ ...base, practicedOn: "2026-11-08" }).success).toBe(false);
  });

  it("requires a uuid id", () => {
    expect(PracticeSessionSchema.safeParse({ ...base, id: "abc" }).success).toBe(false);
  });
});

describe("LessonCompleteSchema", () => {
  it("validates slug shape and dates", () => {
    expect(
      LessonCompleteSchema.safeParse({
        lessonSlug: "hop-am-g",
        completedAt: "2026-11-05T03:00:00.000Z",
        completedOn: "2026-11-05",
      }).success,
    ).toBe(true);
    expect(
      LessonCompleteSchema.safeParse({ lessonSlug: "Hop Am", completedAt: "x", completedOn: "y" })
        .success,
    ).toBe(false);
  });
});

describe("MergeGuestSchema", () => {
  it("accepts at most 500 of each", () => {
    const tooMany = Array.from({ length: 501 }, () => ({ ...base }));
    expect(MergeGuestSchema.safeParse({ completed: [], sessions: tooMany }).success).toBe(false);
  });
});

describe("account schemas", () => {
  it("requires the exact confirmation phrase to delete", () => {
    expect(DeleteAccountSchema.safeParse({ confirm: "XOA TAI KHOAN" }).success).toBe(true);
    expect(DeleteAccountSchema.safeParse({ confirm: "xoa" }).success).toBe(false);
  });

  it("validates IANA time zones and display name length", () => {
    expect(UpdateProfileSchema.safeParse({ timezone: "Asia/Ho_Chi_Minh" }).success).toBe(true);
    expect(UpdateProfileSchema.safeParse({ timezone: "Mars/Olympus" }).success).toBe(false);
    expect(UpdateProfileSchema.safeParse({ displayName: "x".repeat(51) }).success).toBe(false);
  });
});
