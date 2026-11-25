import { describe, expect, it } from "vitest";
import { chords as rawChords } from "@content/chords";
import { ChordSchema } from "@/content/schema";
import { filterChords, normalizeChordQuery, searchChords } from "@/lib/music/chord-search";

const chords = rawChords.map((c) => ChordSchema.parse(c));

describe("normalizeChordQuery", () => {
  it.each([
    ["bm", "bm"],
    ["BM", "bm"],
    ["Bm", "bm"],
    ["Bb", "a-sharp"],
    ["B♭", "a-sharp"],
    ["a#m7", "a-sharp-m7"],
    ["A♯m7", "a-sharp-m7"],
    ["Db", "c-sharp"],
    ["C", "c"],
    ["Cmaj7", "cmaj7"],
    ["C#sus4", "c-sharp-sus4"],
    ["Gmin", "gm"],
    ["  em  ", "em"],
  ])("%s → %s", (q, id) => {
    expect(normalizeChordQuery(q)).toBe(id);
  });

  it("returns null for things that are not chords", () => {
    expect(normalizeChordQuery("H7")).toBeNull();
    expect(normalizeChordQuery("")).toBeNull();
  });
});

describe("searchChords", () => {
  it("finds an exact chord first", () => {
    expect(searchChords(chords, "bm").results[0].name).toBe("Bm");
  });

  it("finds C# when searching its flat name", () => {
    expect(searchChords(chords, "Db").results[0].name).toBe("C#");
  });

  it("partial query lists matching chords", () => {
    const names = searchChords(chords, "am").results.map((c) => c.name);
    expect(names).toContain("Am");
    expect(names).toContain("Am7");
  });

  it("returns suggestions when nothing matches", () => {
    const r = searchChords(chords, "H7");
    expect(r.results).toEqual([]);
    expect(r.suggestions.length).toBeGreaterThan(0);
    expect(r.suggestions.map((c) => c.name)).toContain("B7");
  });

  it("empty query returns everything", () => {
    expect(searchChords(chords, "").results).toHaveLength(chords.length);
  });
});

describe("filterChords", () => {
  it("filters by root", () => {
    const names = filterChords(chords, { root: "A" })
      .map((c) => c.name)
      .sort();
    expect(names).toEqual(["A", "A7", "Am", "Am7", "Amaj7", "Asus2", "Asus4"]);
  });

  it("filters by quality", () => {
    expect(filterChords(chords, { quality: "minor" })).toHaveLength(12);
  });
});
