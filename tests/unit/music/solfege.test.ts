import { describe, expect, it } from "vitest";
import { stripOctave, toSolfege } from "@/lib/music/solfege";

describe("toSolfege", () => {
  it.each([
    ["C", "Đô"],
    ["D3", "Rê"],
    ["E", "Mi"],
    ["F#", "Fa♯"],
    ["G4", "Sol"],
    ["A", "La"],
    ["Bb", "Si♭"],
    ["C#5", "Đô♯"],
  ])("%s → %s", (n, s) => expect(toSolfege(n)).toBe(s));
});

describe("stripOctave", () => {
  it("removes the octave number", () => {
    expect(stripOctave("G#3")).toBe("G#");
    expect(stripOctave("E")).toBe("E");
  });
});
