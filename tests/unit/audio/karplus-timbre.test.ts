import { describe, expect, it } from "vitest";
import { renderPluck } from "@/lib/audio/karplus";

/**
 * Timbre guard-rails. Targets come from measuring recordings of a steel-string acoustic
 * (C3: spectral centroid ≈ 1050 Hz at 50 ms, ≈ 600 Hz at 400 ms; ~19% of energy above 2 kHz at
 * the attack, ~6.5% later; about half the level remains after 1 s). The first synth was 2.5×
 * brighter and decayed 3× faster, which users heard as harsh.
 */

const SR = 48_000;

function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k];
        const ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr;
        im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr;
        im[i + k + len / 2] = ui - vi;
        const t = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = t;
      }
    }
  }
}

function spectrum(data: Float32Array, atSec: number) {
  const N = 8192;
  const s = Math.round(atSec * SR);
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1));
    re[i] = (data[s + i] ?? 0) * w;
  }
  fft(re, im);
  let num = 0;
  let den = 0;
  let hi = 0;
  for (let k = 1; k < N / 2; k++) {
    const m = Math.hypot(re[k], im[k]);
    const f = (k * SR) / N;
    num += f * m;
    den += m;
    if (f > 2000) hi += m;
  }
  return { centroid: num / den, hiShare: hi / den };
}

function rms(data: Float32Array, atSec: number) {
  const s = Math.round(atSec * SR);
  let r = 0;
  for (let i = 0; i < 2048; i++) r += (data[s + i] ?? 0) ** 2;
  return Math.sqrt(r / 2048);
}

describe("plucked-string timbre (warm, not harsh)", () => {
  const C3 = renderPluck(130.81, SR, { duration: 2 });

  it("C3 attack is not brighter than a real guitar by much", () => {
    const early = spectrum(C3, 0.05);
    expect(early.centroid).toBeLessThan(1600);
    expect(early.hiShare).toBeLessThan(0.3);
  });

  it("C3 sustain is mellow", () => {
    const mid = spectrum(C3, 0.4);
    expect(mid.centroid).toBeLessThan(1000);
    expect(mid.hiShare).toBeLessThan(0.12);
  });

  it("notes ring instead of dying quickly", () => {
    expect(rms(C3, 1.0) / rms(C3, 0.05)).toBeGreaterThan(0.25);
  });

  for (const hz of [82.41, 110, 146.83, 196, 246.94, 329.63, 392]) {
    it(`${hz} Hz has no harsh top end`, () => {
      const buf = renderPluck(hz, SR, { duration: 1 });
      expect(spectrum(buf, 0.05).hiShare).toBeLessThan(0.35);
      expect(spectrum(buf, 0.4).hiShare).toBeLessThan(0.15);
    });
  }
});
