import { describe, expect, it } from "vitest";
import { PitchDetector } from "pitchy";
import { renderPluck } from "@/lib/audio/karplus";
import { noteToFrequency, voicingToNotes } from "@/lib/music/notes";
import { chords } from "@content/chords";
import { ChordSchema } from "@/content/schema";

const SR = 48_000;
const cents = (hz: number, ref: number) => 1200 * Math.log2(hz / ref);

function measure(buf: Float32Array, from: number) {
  const frame = buf.slice(from, from + 8192);
  return PitchDetector.forFloat32Array(8192).findPitch(frame, SR);
}

describe("renderPluck (Karplus-Strong with fractional-delay tuning)", () => {
  // Every pitch a chord in the library can sound: E2 … C#6.
  const allNotes = [
    ...new Set(
      chords.flatMap((c) => ChordSchema.parse(c).voicings.flatMap((v) => voicingToNotes(v.frets))),
    ),
  ];

  it("covers the whole range used by the chord library", () => {
    expect(allNotes.length).toBeGreaterThan(30);
  });

  for (const note of allNotes) {
    it(`${note} is within ±2 cents and clearly pitched`, () => {
      const hz = noteToFrequency(note);
      const buf = renderPluck(hz, SR, { duration: 1 });
      // Measure after the pick transient (~120 ms) like a listener would.
      const [got, clarity] = measure(buf, Math.round(0.12 * SR));
      expect(clarity).toBeGreaterThan(0.9);
      expect(Math.abs(cents(got, hz))).toBeLessThanOrEqual(2);
    });
  }

  it("never clips and decays towards silence", () => {
    const buf = renderPluck(82.41, SR, { duration: 2 });
    let peak = 0;
    for (const x of buf) peak = Math.max(peak, Math.abs(x));
    expect(peak).toBeLessThanOrEqual(1);
    expect(peak).toBeGreaterThan(0.5);
    const tail = buf.slice(buf.length - 2000);
    expect(Math.max(...tail.map(Math.abs))).toBeLessThan(0.02);
  });

  it("is deterministic for the same seed", () => {
    const a = renderPluck(196, SR, { duration: 0.2, seed: 7 });
    const b = renderPluck(196, SR, { duration: 0.2, seed: 7 });
    expect(Array.from(a.slice(0, 500))).toEqual(Array.from(b.slice(0, 500)));
  });
});
