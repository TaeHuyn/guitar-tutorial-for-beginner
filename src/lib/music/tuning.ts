/** Standard tuning helpers (pure, no audio). */

export const GUITAR_STRINGS = [
  { stringNumber: 6, name: "E2", hz: 82.40689 },
  { stringNumber: 5, name: "A2", hz: 110 },
  { stringNumber: 4, name: "D3", hz: 146.83238 },
  { stringNumber: 3, name: "G3", hz: 195.99772 },
  { stringNumber: 2, name: "B3", hz: 246.94165 },
  { stringNumber: 1, name: "E4", hz: 329.62756 },
] as const;

export type GuitarString = (typeof GUITAR_STRINGS)[number];
export type StringNumber = GuitarString["stringNumber"];
export type TuningState = "flat" | "in-tune" | "sharp";

/** Tolerance for "in tune" (FR-015). */
export const IN_TUNE_CENTS = 5;

const centsBetween = (hz: number, ref: number) => 1200 * Math.log2(hz / ref);

/** The open string closest to `hz` (in cents) and how far `hz` is from it. */
export function nearestGuitarString(hz: number): {
  stringNumber: StringNumber;
  name: GuitarString["name"];
  cents: number;
} {
  let best: GuitarString = GUITAR_STRINGS[0];
  let bestCents = centsBetween(hz, best.hz);
  for (const s of GUITAR_STRINGS) {
    const c = centsBetween(hz, s.hz);
    if (Math.abs(c) < Math.abs(bestCents)) {
      best = s;
      bestCents = c;
    }
  }
  return { stringNumber: best.stringNumber, name: best.name, cents: bestCents };
}

export function tuningState(cents: number): TuningState {
  if (cents < -IN_TUNE_CENTS) return "flat";
  if (cents > IN_TUNE_CENTS) return "sharp";
  return "in-tune";
}
