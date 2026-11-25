import { clampBpm } from "./scheduler";

const MAX_GAP_MS = 2000;
const MAX_INTERVALS = 8;
const MIN_TAPS = 4;

/**
 * Estimates BPM from tap timestamps (ms). Needs ≥ 4 taps since the last pause (> 2 s);
 * averages at most the last 8 intervals. Returns null when there are not enough taps.
 */
export function tapTempo(tapsMs: readonly number[]): number | null {
  let start = 0;
  for (let i = 1; i < tapsMs.length; i++) {
    if (tapsMs[i] - tapsMs[i - 1] > MAX_GAP_MS) start = i;
  }
  const taps = tapsMs.slice(start);
  if (taps.length < MIN_TAPS) return null;
  const intervals = taps
    .slice(1)
    .map((t, i) => t - taps[i])
    .slice(-MAX_INTERVALS);
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  return clampBpm(60_000 / avg);
}
