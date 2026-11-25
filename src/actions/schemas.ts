import { z } from "zod";
import { SLUG } from "@/content/schema";
import { addDays } from "@/lib/progress/streaks";

/** Input schemas for server actions (contracts/server-api.md, data-model.md §2). */

const DAY = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ");
const DURATION_MESSAGE = "Thời lượng phải từ 1 đến 600 phút";

function isValidTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const LessonCompleteSchema = z.object({
  lessonSlug: z.string().regex(SLUG),
  completedAt: z.string().datetime(),
  completedOn: DAY,
});
export type LessonCompleteInput = z.infer<typeof LessonCompleteSchema>;

export const LessonSlugSchema = z.object({ lessonSlug: z.string().regex(SLUG) });

/** `now` is injectable for tests; practicedOn may not be after "today + 1" (time-zone slack). */
export function practiceSessionSchemaFor(now: Date = new Date()) {
  const latest = addDays(now.toISOString().slice(0, 10), 1);
  return z.object({
    id: z.string().uuid(),
    practicedOn: DAY.refine((d) => d <= latest, "Ngày tập không được ở tương lai"),
    durationMinutes: z
      .number({ message: DURATION_MESSAGE })
      .int(DURATION_MESSAGE)
      .min(1, DURATION_MESSAGE)
      .max(600, DURATION_MESSAGE),
    lessonSlug: z.string().regex(SLUG).optional(),
    note: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional(),
    bpmReached: z
      .number()
      .int()
      .min(30, "BPM từ 30 đến 250")
      .max(250, "BPM từ 30 đến 250")
      .optional(),
  });
}
export const PracticeSessionSchema = practiceSessionSchemaFor();
export type PracticeSessionInput = z.infer<typeof PracticeSessionSchema>;

export const DeleteSessionSchema = z.object({ id: z.string().uuid() });

export const MergeGuestSchema = z.object({
  completed: z.array(LessonCompleteSchema).max(500),
  sessions: z.array(PracticeSessionSchema).max(500),
});
export type MergeGuestInput = z.infer<typeof MergeGuestSchema>;

export const UpdateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(50, "Tên hiển thị tối đa 50 ký tự").optional(),
  timezone: z.string().refine(isValidTimeZone, "Múi giờ không hợp lệ").optional(),
});

export const DeleteAccountSchema = z.object({ confirm: z.literal("XOA TAI KHOAN") });
