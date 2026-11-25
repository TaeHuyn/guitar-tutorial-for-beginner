import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Magic-link / OAuth callback: exchanges the one-time code for a session cookie, then sends
 * the learner to the dashboard. Guest progress is merged client-side by ProgressProvider.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const supabase = await getServerSupabase();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/tong-quan", url.origin));
  }
  return NextResponse.redirect(new URL("/dang-nhap?loi=1", url.origin));
}
