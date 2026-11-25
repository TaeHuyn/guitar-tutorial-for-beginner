"use server";

import { getLesson } from "@/content/loader";
import { fail, MESSAGES, ok, type Result } from "./result";
import {
  DeleteSessionSchema,
  practiceSessionSchemaFor,
  type PracticeSessionInput,
} from "./schemas";
import { requireUser, validationMessage } from "./session";

/** Idempotent by client-generated id: sending the same session twice stores it once. */
export async function logPracticeSession(input: unknown): Promise<Result<PracticeSessionInput>> {
  const parsed = practiceSessionSchemaFor(new Date()).safeParse(input);
  if (!parsed.success) return fail("VALIDATION", validationMessage(parsed.error.issues));
  const s = parsed.data;
  if (s.lessonSlug && !getLesson(s.lessonSlug)) return fail("NOT_FOUND", MESSAGES.NOT_FOUND);
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const { error } = await auth.supabase.from("practice_sessions").upsert(
    {
      id: s.id,
      user_id: auth.user.id,
      practiced_on: s.practicedOn,
      duration_minutes: s.durationMinutes,
      lesson_slug: s.lessonSlug ?? null,
      note: s.note ?? null,
      bpm_reached: s.bpmReached ?? null,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (error) return fail("INTERNAL", MESSAGES.INTERNAL);
  return ok(s);
}

export async function deletePracticeSession(input: unknown): Promise<Result<{ id: string }>> {
  const parsed = DeleteSessionSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", validationMessage(parsed.error.issues));
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { error } = await auth.supabase
    .from("practice_sessions")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("id", parsed.data.id);
  if (error) return fail("INTERNAL", MESSAGES.INTERNAL);
  return ok({ id: parsed.data.id });
}
