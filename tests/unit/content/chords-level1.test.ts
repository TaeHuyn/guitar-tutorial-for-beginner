import { describe, expect, it } from "vitest";
import { chords } from "@content/chords";
import { ChordSchema, LEVEL_1_CHORDS } from "@/content/schema";
import { checkVoicing } from "@/lib/music/chord-check";

describe("level-1 chords", () => {
  for (const id of LEVEL_1_CHORDS) {
    it(`${id}: every voicing sounds the right notes with the root in the bass`, () => {
      const raw = chords.find((c) => (c as { id: string }).id === id);
      expect(raw, `chord ${id} missing`).toBeDefined();
      const chord = ChordSchema.parse(raw);
      for (const v of chord.voicings) {
        expect(checkVoicing(chord, v)).toEqual([]);
      }
    });
  }

  it("lists the easiest voicing first", () => {
    for (const id of LEVEL_1_CHORDS) {
      const chord = ChordSchema.parse(chords.find((c) => (c as { id: string }).id === id));
      const min = Math.min(...chord.voicings.map((v) => v.difficulty));
      expect(chord.voicings[0].difficulty).toBe(min);
    }
  });
});

describe("checkVoicing", () => {
  const g = ChordSchema.parse({
    id: "g",
    name: "G",
    root: "G",
    quality: "major",
    voicings: [{ frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], difficulty: 2 }],
  });

  it("accepts a correct voicing", () => {
    expect(checkVoicing(g, g.voicings[0])).toEqual([]);
  });

  it("flags notes that are not in the chord", () => {
    const bad = { ...g.voicings[0], frets: [3, 2, 0, 0, 1, 3] }; // C on the B string
    expect(checkVoicing(g, bad).join()).toMatch(/C/);
  });

  it("flags a missing third", () => {
    const bad = { ...g.voicings[0], frets: [3, 5, 5, 4, 3, 3].map((f, i) => (i === 3 ? 7 : f)) };
    expect(checkVoicing(g, bad).length).toBeGreaterThan(0);
  });

  it("flags a non-root bass note unless marked as an inversion", () => {
    const bad = { ...g.voicings[0], frets: [-1, 2, 0, 0, 0, 3], fingers: [0, 1, 0, 0, 0, 3] }; // B in the bass
    expect(checkVoicing(g, bad).join()).toMatch(/bass/);
    expect(checkVoicing(g, { ...bad, inversion: true })).toEqual([]);
  });
});
