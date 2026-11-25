import { expect, test } from "./fixtures";
import { SAMPLE_CENTS_ERROR, SAMPLE_MIDI_RANGE } from "../../src/lib/audio/sample-tuning";

/**
 * Every recorded note, played back with its tuning correction, must be in tune (±3 cents).
 * Decoding MP3 needs a browser, so this runs in Playwright with an in-page pitch detector.
 */
test.describe("recorded guitar samples", () => {
  test("are in tune after correction", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one browser is enough");
    test.setTimeout(120_000);
    await page.goto("/hop-am");
    const results = await page.evaluate(
      async ({ low, high, errors }) => {
        // Normalised square difference function (McLeod) with parabolic interpolation.
        function pitch(x: Float32Array, sr: number): { hz: number; clarity: number } {
          const n = x.length;
          const maxLag = Math.floor(sr / 60);
          const nsdf = new Float32Array(maxLag);
          for (let tau = 1; tau < maxLag; tau++) {
            let acf = 0;
            let m = 0;
            for (let i = 0; i < n - tau; i++) {
              acf += x[i] * x[i + tau];
              m += x[i] * x[i] + x[i + tau] * x[i + tau];
            }
            nsdf[tau] = m > 0 ? (2 * acf) / m : 0;
          }
          let best = -1;
          let bestVal = 0;
          let globalMax = 0;
          for (let t = 2; t < maxLag - 1; t++) globalMax = Math.max(globalMax, nsdf[t]);
          let t = 1;
          while (t < maxLag - 1 && nsdf[t] > 0) t++;
          for (; t < maxLag - 1; t++) {
            if (nsdf[t] > nsdf[t - 1] && nsdf[t] >= nsdf[t + 1] && nsdf[t] > 0.9 * globalMax) {
              best = t;
              bestVal = nsdf[t];
              break;
            }
          }
          if (best < 0) return { hz: 0, clarity: 0 };
          const a = nsdf[best - 1];
          const b = nsdf[best];
          const c = nsdf[best + 1];
          const shift = (a - c) / (2 * (a - 2 * b + c));
          return { hz: sr / (best + shift), clarity: bestVal };
        }

        const out: { midi: number; cents: number; clarity: number }[] = [];
        for (let midi = low; midi <= high; midi++) {
          const bytes = await (await fetch(`/audio/guitar/${midi}.mp3`)).arrayBuffer();
          const decodeCtx = new OfflineAudioContext(1, 1, 44100);
          const buffer = await decodeCtx.decodeAudioData(bytes);
          const sr = buffer.sampleRate;
          const render = new OfflineAudioContext(1, Math.round(sr * 1.2), sr);
          const src = render.createBufferSource();
          src.buffer = buffer;
          src.detune.value = -(errors[midi] ?? 0);
          src.connect(render.destination);
          src.start();
          const data = (await render.startRendering()).getChannelData(0);
          const target = 440 * 2 ** ((midi - 69) / 12);
          const cents: number[] = [];
          let clarity = 0;
          for (const at of [0.2, 0.35, 0.5, 0.65]) {
            const s = Math.round(at * sr);
            const r = pitch(data.slice(s, s + 4096), sr);
            if (r.clarity > 0.9) {
              cents.push(1200 * Math.log2(r.hz / target));
              clarity = Math.max(clarity, r.clarity);
            }
          }
          cents.sort((p, q) => p - q);
          out.push({
            midi,
            cents: cents.length ? cents[Math.floor(cents.length / 2)] : NaN,
            clarity,
          });
        }
        return out;
      },
      { low: SAMPLE_MIDI_RANGE.low, high: SAMPLE_MIDI_RANGE.high, errors: SAMPLE_CENTS_ERROR },
    );

    // B5 (83) has no clear pitch in the recording; every other note must be within ±3 cents.
    const off = results.filter((r) => r.midi !== 83 && !(Math.abs(r.cents) <= 3));
    expect(off, JSON.stringify(off)).toEqual([]);
  });

  test("playing a chord loads the recordings for its notes", async ({ page }) => {
    const requested: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/audio/guitar/")) requested.push(r.url().split("/").pop()!);
    });
    await page.goto("/hop-am/c");
    await page.getByRole("button", { name: "Chơi hợp âm" }).click();
    // C (x32010) → C3 E3 G3 C4 E4 = MIDI 48 52 55 60 64.
    await expect
      .poll(() => [...new Set(requested)].sort())
      .toEqual(["48.mp3", "52.mp3", "55.mp3", "60.mp3", "64.mp3"].sort());
  });
});
