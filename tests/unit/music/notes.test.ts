import { describe, expect, it } from "vitest";
import { frequencyToNote, noteToFrequency, pitchClass, voicingToNotes } from "@/lib/music/notes";

describe("voicingToNotes", () => {
  it("maps an open G chord to its sounding notes (strings 6→1)", () => {
    expect(voicingToNotes([3, 2, 0, 0, 0, 3])).toEqual(["G2", "B2", "D3", "G3", "B3", "G4"]);
  });

  it("skips muted strings (-1)", () => {
    expect(voicingToNotes([-1, 3, 2, 0, 1, 0])).toEqual(["C3", "E3", "G3", "C4", "E4"]);
  });

  it("supports frets above 12", () => {
    expect(voicingToNotes([-1, -1, -1, -1, -1, 12])).toEqual(["E5"]);
  });

  it("rejects voicings that do not have 6 strings", () => {
    expect(() => voicingToNotes([0, 0, 0])).toThrow();
  });
});

describe("frequencyToNote", () => {
  it("returns A4 with 0 cents at 440 Hz", () => {
    const r = frequencyToNote(440);
    expect(r.note).toBe("A");
    expect(r.octave).toBe(4);
    expect(r.midi).toBe(69);
    expect(r.cents).toBeCloseTo(0, 5);
  });

  it("measures cents above the nearest note", () => {
    const r = frequencyToNote(445);
    expect(r.note).toBe("A");
    expect(r.cents).toBeCloseTo(19.56, 1);
  });

  it("recognises the low E string", () => {
    const r = frequencyToNote(82.41);
    expect(`${r.note}${r.octave}`).toBe("E2");
    expect(Math.abs(r.cents)).toBeLessThan(1);
  });

  it("uses sharps for black keys", () => {
    expect(frequencyToNote(277.18).note).toBe("C#");
  });

  it("honours a custom A4 reference", () => {
    expect(frequencyToNote(432, 432).cents).toBeCloseTo(0, 5);
  });
});

describe("noteToFrequency / pitchClass", () => {
  it("converts notes to Hz", () => {
    expect(noteToFrequency("A4")).toBeCloseTo(440, 5);
    expect(noteToFrequency("E2")).toBeCloseTo(82.407, 2);
  });

  it("normalises enharmonics to sharp pitch classes", () => {
    expect(pitchClass("Bb3")).toBe("A#");
    expect(pitchClass("E#")).toBe("F");
    expect(pitchClass("G4")).toBe("G");
  });
});
