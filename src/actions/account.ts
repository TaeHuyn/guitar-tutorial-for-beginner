"use server";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { fail, MESSAGES, ok, type Result } from "./result";
import { DeleteAccountSchema, UpdateProfileSchema } from "./schemas";
import { requireUser, validationMessage } from "./session";

export async function updateProfile(
  input: unknown,
): Promise<Result<{ displayName?: string; timezone?: string }>> {
  const parsed = UpdateProfileSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", validationMessage(parsed.error.issues));
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const patch: Record<string, string> = {};
  if (parsed.data.displayName !== undefined) patch.display_name = parsed.data.displayName;
  if (parsed.data.timezone !== undefined) patch.timezone = parsed.data.timezone;
  const { error } = await auth.supabase.from("profiles").update(patch).eq("user_id", auth.user.id);
  if (error) return fail("INTERNAL", MESSAGES.INTERNAL);
  return ok(parsed.data);
}

/** Deletes the auth user; ON DELETE CASCADE removes every row of their data (FR-031). */
export async function deleteAccount(input: unknown): Promise<Result<{ deleted: true }>> {
  const parsed = DeleteAccountSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", "Hãy gõ đúng XOA TAI KHOAN để xác nhận");
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const admin = getAdminSupabase();
  if (!admin) return fail("DISABLED", MESSAGES.DISABLED);
  const { error } = await admin.auth.admin.deleteUser(auth.user.id);
  if (error) return fail("INTERNAL", MESSAGES.INTERNAL);
  await auth.supabase.auth.signOut();
  return ok({ deleted: true });
}
