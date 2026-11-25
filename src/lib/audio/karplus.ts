/**
 * Plucked-string synthesis (extended Karplus-Strong), pure and testable.
 *
 * The classic algorithm is out of tune at higher pitches because the delay line can only be a
 * whole number of samples and the averaging filter adds half a sample. Here the loop delay is
 * made exact with a first-order all-pass fractional delay (Jaffe & Smith), so every note is
 * within a fraction of a cent of equal temperament.
 */

export interface PluckOptions {
  /** Seconds of audio to render. */
  duration?: number;
  /** Seconds for the note to decay by 60 dB (scaled by pitch when omitted). */
  t60?: number;
  /** 0–1: how bright the pick attack is. */
  brightness?: number;
  /** 0–1: pluck position along the string (0.13 ≈ near the bridge, typical for strumming). */
  pickPosition?: number;
  /** Seed for the deterministic noise burst. */
  seed?: number;
  /** Peak level of the rendered note (0–1). */
  level?: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function renderPluck(
  freq: number,
  sampleRate: number,
  opts: PluckOptions = {},
): Float32Array<ArrayBuffer> {
  const duration = opts.duration ?? 2.5;
  // Low strings ring longer than high ones, like a real acoustic guitar.
  const t60 = opts.t60 ?? Math.max(1.2, Math.min(4.5, 4.5 * Math.pow(110 / freq, 0.45)));
  const brightness = opts.brightness ?? 0.55;
  const pickPosition = opts.pickPosition ?? 0.13;
  const level = opts.level ?? 0.9;
  const rand = mulberry32(opts.seed ?? Math.round(freq * 1000));

  const total = Math.max(1, Math.round(duration * sampleRate));
  const out = new Float32Array(total);

  // Loop delay P = N (delay line) + 0.5 (two-point average) + d (all-pass).
  const period = sampleRate / freq;
  let n = Math.floor(period - 0.5);
  let d = period - 0.5 - n;
  if (d < 0.1) {
    n -= 1;
    d += 1;
  }
  const c = (1 - d) / (1 + d);

  // Per-period loss so the note decays by 60 dB in t60 seconds.
  const loss = Math.pow(10, -3 / (t60 * freq));

  // Excitation: low-passed noise with a pick-position comb (removes harmonics at the node).
  const line = new Float32Array(n);
  const smooth = 1 - brightness;
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const white = rand() * 2 - 1;
    lp = (1 - smooth) * white + smooth * lp;
    line[i] = lp;
  }
  const pickOffset = Math.max(1, Math.round(pickPosition * n));
  const excitation = Float32Array.from(line);
  for (let i = 0; i < n; i++) line[i] = excitation[i] - excitation[(i + n - pickOffset) % n];
  // Remove DC and normalise the burst.
  let mean = 0;
  for (const v of line) mean += v;
  mean /= n;
  let peak = 0;
  for (let i = 0; i < n; i++) {
    line[i] -= mean;
    peak = Math.max(peak, Math.abs(line[i]));
  }
  if (peak > 0) for (let i = 0; i < n; i++) line[i] /= peak;

  let idx = 0;
  let prev = 0;
  let apIn = 0;
  let apOut = 0;
  for (let t = 0; t < total; t++) {
    const y = line[idx];
    out[t] = y;
    const avg = 0.5 * (y + prev) * loss;
    prev = y;
    const ap = c * (avg - apOut) + apIn;
    apIn = avg;
    apOut = ap;
    line[idx] = ap;
    idx = idx + 1 === n ? 0 : idx + 1;
  }

  // Gentle DC blocker, short fade-in (no click) and fade-out at the end.
  let x1 = 0;
  let y1 = 0;
  for (let t = 0; t < total; t++) {
    const x = out[t];
    const y = x - x1 + 0.995 * y1;
    x1 = x;
    y1 = y;
    out[t] = y;
  }
  const fadeIn = Math.min(total, Math.round(0.002 * sampleRate));
  for (let t = 0; t < fadeIn; t++) out[t] *= t / fadeIn;
  const fadeOut = Math.min(total, Math.round(0.08 * sampleRate));
  for (let t = 0; t < fadeOut; t++) out[total - 1 - t] *= t / fadeOut;

  let max = 0;
  for (const v of out) max = Math.max(max, Math.abs(v));
  if (max > 0) {
    const g = level / max;
    for (let t = 0; t < total; t++) out[t] *= g;
  }
  return out;
}
