import { z } from "zod";
import { getAdminSupabase } from "@/lib/supabase/admin";

/**
 * Anonymous analytics sink (FR-036, research R11). Reads only the JSON body — never cookies,
 * IP or user agent — and always answers 204 so it reveals nothing.
 */
const EventsSchema = z.object({
  events: z
    .array(
      z.object({
        name: z.enum(["page_view", "tool_open", "lesson_start", "lesson_complete"]),
        path: z.string().min(1).max(500),
        device: z.enum(["mobile", "desktop"]),
      }),
    )
    .min(1)
    .max(20),
});

// Tiny per-instance rate limit: at most 600 events per minute.
let windowStart = 0;
let windowCount = 0;

export async function POST(request: Request) {
  const done = () => new Response(null, { status: 204 });
  let body: unknown;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return done();
  }
  const parsed = EventsSchema.safeParse(body);
  if (!parsed.success) return done();

  const now = Date.now();
  if (now - windowStart > 60_000) {
    windowStart = now;
    windowCount = 0;
  }
  windowCount += parsed.data.events.length;
  if (windowCount > 600) return done();

  const admin = getAdminSupabase();
  if (!admin) return done();

  const hour = new Date(now);
  hour.setUTCMinutes(0, 0, 0);
  await admin.from("analytics_events").insert(
    parsed.data.events.map((e) => ({
      name: e.name,
      path: e.path.split(/[?#]/)[0].slice(0, 200),
      device: e.device,
      occurred_hour: hour.toISOString(),
    })),
  );
  return done();
}
