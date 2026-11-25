/** Pure date/streak helpers (research R9). Dates are local "YYYY-MM-DD" strings. */

export type LocalDate = string;

/** Today's date in `timeZone` (IANA), e.g. "2026-11-25". */
export function localDate(timeZone: string, at: Date = new Date()): LocalDate {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh";
  } catch {
    return "Asia/Ho_Chi_Minh";
  }
}

export function addDays(day: LocalDate, n: number): LocalDate {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * current: consecutive days ending today — or yesterday, so the streak is not lost before
 * today's practice. longest: longest run of consecutive days ever.
 */
export function computeStreaks(
  days: readonly LocalDate[],
  today: LocalDate,
): { current: number; longest: number } {
  const unique = [...new Set(days)].sort();
  if (unique.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    run = addDays(unique[i - 1], 1) === unique[i] ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const set = new Set(unique);
  let cursor = set.has(today) ? today : addDays(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { current, longest };
}

export function minutesLastNDays(
  sessions: readonly { practicedOn: LocalDate; durationMinutes: number }[],
  today: LocalDate,
  n: number,
): number {
  const from = addDays(today, -(n - 1));
  return sessions
    .filter((s) => s.practicedOn >= from && s.practicedOn <= today)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}
