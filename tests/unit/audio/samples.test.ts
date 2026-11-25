import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { chords } from "@content/chords";
import { ChordSchema } from "@/content/schema";
import { noteToMidi, sampleUrl } from "@/lib/audio/pluck";
import { SAMPLE_CENTS_ERROR, SAMPLE_MIDI_RANGE } from "@/lib/audio/sample-tuning";
import { GUITAR_STRINGS } from "@/lib/music/tuning";
import { voicingToNotes } from "@/lib/music/voicing";

describe("noteToMidi", () => {
  it.each([
    ["E2", 40],
    ["A2", 45],
    ["C4", 60],
    ["C#3", 49],
    ["Db3", 49],
    ["C#6", 85],
  ])("%s → %i", (n, m) => expect(noteToMidi(n)).toBe(m));
});

describe("recorded guitar samples", () => {
  const used = new Set<string>([
    ...chords.flatMap((c) => ChordSchema.parse(c).voicings.flatMap((v) => voicingToNotes(v.frets))),
    ...GUITAR_STRINGS.map((s) => s.name),
  ]);

  it("cover every note the site plays", () => {
    for (const note of used) {
      const midi = noteToMidi(note);
      expect(midi, note).toBeGreaterThanOrEqual(SAMPLE_MIDI_RANGE.low);
      expect(midi, note).toBeLessThanOrEqual(SAMPLE_MIDI_RANGE.high);
      const file = path.resolve("public", sampleUrl(note).replace(/^\//, ""));
      expect(existsSync(file), file).toBe(true);
      expect(statSync(file).size).toBeGreaterThan(5_000);
    }
  });

  it("have a tuning correction for every file", () => {
    for (let m = SAMPLE_MIDI_RANGE.low; m <= SAMPLE_MIDI_RANGE.high; m++) {
      expect(SAMPLE_CENTS_ERROR[m], String(m)).toBeTypeOf("number");
      expect(Math.abs(SAMPLE_CENTS_ERROR[m])).toBeLessThan(30);
    }
  });

  it("ship with their license notice", () => {
    expect(existsSync(path.resolve("public/audio/guitar/README.md"))).toBe(true);
  });
});
