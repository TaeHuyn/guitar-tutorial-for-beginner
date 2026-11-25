import { describe, expect, it } from "vitest";
import { chords as rawChords } from "@content/chords";
import { ChordSchema, QUALITIES, ROOTS } from "@/content/schema";
import { checkVoicing } from "@/lib/music/chord-check";

const chords = rawChords.map((c) => ChordSchema.parse(c));

describe("chord library (FR-011)", () => {
  it("has every root × quality (12 × 7 = 84)", () => {
    for (const root of ROOTS) {
      for (const quality of QUALITIES) {
        expect(
          chords.some((c) => c.root === root && c.quality === quality),
          `${root} ${quality} missing`,
        ).toBe(true);
      }
    }
    expect(chords.length).toBeGreaterThanOrEqual(84);
  });

  it("has unique ids", () => {
    const ids = chords.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every voicing of every chord is musically correct", () => {
    const problems = chords.flatMap((c) => c.voicings.flatMap((v) => checkVoicing(c, v)));
    expect(problems).toEqual([]);
  });

  it("lists the easiest voicing first", () => {
    for (const c of chords) {
      const min = Math.min(...c.voicings.map((v) => v.difficulty));
      expect(c.voicings[0].difficulty, c.name).toBe(min);
    }
  });

  it("gives sharp chords their flat aliases", () => {
    const cs = chords.find((c) => c.root === "C#" && c.quality === "minor")!;
    expect(cs.aliases).toContain("Dbm");
  });
});
