"use server";

import { getLesson } from "@/content/loader";
import { fail, MESSAGES, ok, type Result } from "./result";
import { LessonCompleteSchema, LessonSlugSchema, MergeGuestSchema } from "./schemas";
import { requireUser, validationMessage } from "./session";

export interface ProgressSnapshotDTO {
  completed: Record<string, { completedAt: string; completedOn: string }>;
  sessions: {
    id: string;
    practicedOn: string;
    durationMinutes: number;
    lessonSlug?: string;
    note?: string;
    bpmReached?: number;
  }[];
  profile: { displayName: string | null; timezone: string };
}

/** Everything the dashboard/path needs for the signed-in user (contracts › getDashboard). */
export async function getProgressSnapshot(): Promise<Result<ProgressSnapshotDTO>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;
  const since = new Date(Date.now() - 400 * 86_400_000).toISOString().slice(0, 10);
  const [progress, sessions, profile] = await Promise.all([
    supabase.from("lesson_progress").select("lesson_slug, completed_at, completed_on"),
    supabase
      .from("practice_sessions")
      .select("id, practiced_on, duration_minutes, lesson_slug, note, bpm_reached")
      .gte("practiced_on", since)
      .order("practiced_on", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("display_name, timezone").eq("user_id", user.id).maybeSingle(),
  ]);
  if (progress.error || sessions.error || profile.error) return fail("INTERNAL", MESSAGES.INTERNAL);

  return ok({
    completed: Object.fromEntries(
      progress.data.map((r) => [
        r.lesson_slug,
        { completedAt: r.completed_at, completedOn: r.completed_on },
      ]),
    ),
    sessions: sessions.data.map((r) => ({
      id: r.id,
      practicedOn: r.practiced_on,
      durationMinutes: r.duration_minutes,
      lessonSlug: r.lesson_slug ?? undefined,
      note: r.note ?? undefined,
      bpmReached: r.bpm_reached ?? undefined,
    })),
    profile: {
      displayName: profile.data?.display_name ?? null,
      timezone: profile.data?.timezone ?? "Asia/Ho_Chi_Minh",
    },
  });
}

export async function markLessonComplete(
  input: unknown,
): Promise<Result<{ lessonSlug: string; completedAt: string }>> {
  const parsed = LessonCompleteSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", validationMessage(parsed.error.issues));
  if (!getLesson(parsed.data.lessonSlug)) return fail("NOT_FOUND", MESSAGES.NOT_FOUND);
  const auth = await requireUser();
  if (!auth.ok) return auth;

  // Insert-or-ignore keeps the original completion time (idempotent).
  const { error } = await auth.supabase.from("lesson_progress").upsert(
    {
      user_id: auth.user.id,
      lesson_slug: parsed.data.lessonSlug,
      completed_at: parsed.data.completedAt,
      completed_on: parsed.data.completedOn,
    },
    { onConflict: "user_id,lesson_slug", ignoreDuplicates: true },
  );
  if (error) return fail("INTERNAL", MESSAGES.INTERNAL);
  return ok({ lessonSlug: parsed.data.lessonSlug, completedAt: parsed.data.completedAt });
}

export async function unmarkLessonComplete(
  input: unknown,
): Promise<Result<{ lessonSlug: string }>> {
  const parsed = LessonSlugSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", validationMessage(parsed.error.issues));
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { error } = await auth.supabase
    .from("lesson_progress")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("lesson_slug", parsed.data.lessonSlug);
  if (error) return fail("INTERNAL", MESSAGES.INTERNAL);
  return ok({ lessonSlug: parsed.data.lessonSlug });
}

/** Moves a guest's local progress into the account in one transaction (FR-026). */
export async function mergeGuestProgress(
  input: unknown,
): Promise<Result<{ mergedLessons: number; mergedSessions: number; skipped: number }>> {
  const parsed = MergeGuestSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", validationMessage(parsed.error.issues));
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const completed = parsed.data.completed.filter((c) => getLesson(c.lessonSlug));
  const sessions = parsed.data.sessions.map((s) =>
    s.lessonSlug && !getLesson(s.lessonSlug) ? { ...s, lessonSlug: undefined } : s,
  );
  const skipped = parsed.data.completed.length - completed.length;

  const { data, error } = await auth.supabase.rpc("merge_guest_progress", {
    p_completed: completed,
    p_sessions: sessions,
  });
  if (error) return fail("INTERNAL", MESSAGES.INTERNAL);
  const r = data as { mergedLessons: number; mergedSessions: number };
  return ok({ mergedLessons: r.mergedLessons, mergedSessions: r.mergedSessions, skipped });
}
