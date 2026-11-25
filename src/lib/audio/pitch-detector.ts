import { PitchDetector } from "pitchy";

/** Pure pitch detection (no Web Audio) so it can be unit-tested with synthetic signals. */

export const FRAME_SIZE = 4096;
export const MIN_CLARITY = 0.9;
export const MIN_RMS = 0.01;
/** Guitar range we care about for tuning (a little below low E, above high E harmonics). */
const MIN_HZ = 60;
const MAX_HZ = 1200;

export type PitchResult = { kind: "pitch"; hz: number; clarity: number } | { kind: "quiet" };

const detectors = new Map<number, PitchDetector<Float32Array>>();

function detectorFor(size: number) {
  let d = detectors.get(size);
  if (!d) {
    d = PitchDetector.forFloat32Array(size);
    d.minVolumeAbsolute = MIN_RMS / 2;
    detectors.set(size, d);
  }
  return d;
}

export function rms(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
  return Math.sqrt(sum / buffer.length);
}

/**
 * McLeod Pitch Method via pitchy (research R5). Returns "quiet" when the signal is too
 * soft or not clearly pitched, so the UI can ask the user to pluck harder.
 */
export function detectPitch(buffer: Float32Array, sampleRate: number): PitchResult {
  if (rms(buffer) < MIN_RMS) return { kind: "quiet" };
  const [hz, clarity] = detectorFor(buffer.length).findPitch(buffer, sampleRate);
  if (!Number.isFinite(hz) || clarity < MIN_CLARITY || hz < MIN_HZ || hz > MAX_HZ) {
    return { kind: "quiet" };
  }
  return { kind: "pitch", hz, clarity };
}

/** Median of the last N readings — removes occasional octave jumps without adding lag. */
export class MedianSmoother {
  private values: number[] = [];
  constructor(private readonly size = 5) {}

  push(v: number) {
    this.values.push(v);
    if (this.values.length > this.size) this.values.shift();
  }

  value(): number | null {
    if (this.values.length === 0) return null;
    const sorted = [...this.values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  reset() {
    this.values = [];
  }
}
