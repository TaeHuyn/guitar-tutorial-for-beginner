import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { fail, MESSAGES, type Result } from "./result";

/** Resolves the signed-in user or returns a typed error result. */
export async function requireUser(): Promise<
  { ok: true; supabase: SupabaseClient; user: User } | Extract<Result<never>, { ok: false }>
> {
  const supabase = await getServerSupabase();
  if (!supabase)
    return fail("DISABLED", MESSAGES.DISABLED) as Extract<Result<never>, { ok: false }>;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user)
    return fail("UNAUTHENTICATED", MESSAGES.UNAUTHENTICATED) as Extract<
      Result<never>,
      { ok: false }
    >;
  return { ok: true, supabase, user: data.user };
}

export function validationMessage(issues: { message: string }[]): string {
  return issues[0]?.message ?? MESSAGES.VALIDATION;
}
