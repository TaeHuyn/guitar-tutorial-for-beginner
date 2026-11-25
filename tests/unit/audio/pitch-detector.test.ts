import { describe, expect, it } from "vitest";
import { MedianSmoother, detectPitch } from "@/lib/audio/pitch-detector";
import { frequencyToNote } from "@/lib/music/notes";

const SR = 48_000;
const N = 4096;

/** Guitar-like test tone: fundamental + 3 harmonics + light noise (deterministic). */
function tone(hz: number, amp = 0.5, offset = 0): Float32Array {
  const buf = new Float32Array(N);
  let seed = 42;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32) * 2 - 1;
  for (let i = 0; i < N; i++) {
    const t = (i + offset) / SR;
    buf[i] =
      (amp *
        (Math.sin(2 * Math.PI * hz * t) +
          0.5 * Math.sin(2 * Math.PI * 2 * hz * t) +
          0.25 * Math.sin(2 * Math.PI * 3 * hz * t) +
          0.12 * Math.sin(2 * Math.PI * 4 * hz * t))) /
        1.87 +
      0.005 * rand();
  }
  return buf;
}

const cents = (hz: number, ref: number) => 1200 * Math.log2(hz / ref);
const STRINGS = [82.407, 110, 146.832, 195.998, 246.942, 329.628];

describe("detectPitch", () => {
  for (const base of STRINGS) {
    for (const offset of [0, 3, -3, 10, -10, 30, -30]) {
      const hz = base * 2 ** (offset / 1200);
      it(`${base.toFixed(1)} Hz ${offset >= 0 ? "+" : ""}${offset} cents → within ±1 cent`, () => {
        const r = detectPitch(tone(hz), SR);
        expect(r.kind).toBe("pitch");
        if (r.kind !== "pitch") return;
        expect(Math.abs(cents(r.hz, hz))).toBeLessThanOrEqual(1);
        expect(frequencyToNote(r.hz).midi).toBe(frequencyToNote(hz).midi);
      });
    }
  }

  it("returns quiet for a near-silent signal", () => {
    expect(detectPitch(tone(110, 0.002), SR).kind).toBe("quiet");
  });

  it("returns quiet for pure noise", () => {
    const noise = new Float32Array(N);
    let seed = 7;
    for (let i = 0; i < N; i++)
      noise[i] = ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32) * 2 - 1;
    expect(detectPitch(noise, SR).kind).toBe("quiet");
  });
});

describe("MedianSmoother", () => {
  it("rejects a single octave error among 5 readings", () => {
    const m = new MedianSmoother(5);
    [110, 110.2, 220, 109.9, 110.1].forEach((v) => m.push(v));
    expect(m.value()).toBeCloseTo(110.1, 1);
  });

  it("resets", () => {
    const m = new MedianSmoother(5);
    m.push(100);
    m.reset();
    expect(m.value()).toBeNull();
  });
});
