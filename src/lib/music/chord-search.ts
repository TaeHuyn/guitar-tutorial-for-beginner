import type { Chord } from "@/content/schema";

type Letter = "c" | "d" | "e" | "f" | "g" | "a" | "b";
const NATURAL_SEMITONE: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const SHARP_IDS = [
  "c",
  "c-sharp",
  "d",
  "d-sharp",
  "e",
  "f",
  "f-sharp",
  "g",
  "g-sharp",
  "a",
  "a-sharp",
  "b",
];

const QUALITY_ALIASES: [RegExp, string][] = [
  [/^(maj7|ma7|Δ7?)$/, "maj7"],
  [/^(m7|min7|-7)$/, "m7"],
  [/^(m|min|-)$/, "m"],
  [/^(7|dom7)$/, "7"],
  [/^sus2$/, "sus2"],
  [/^(sus4|sus)$/, "sus4"],
  [/^(maj)?$/, ""],
];

/**
 * Normalises user input to a chord id: "bm" → "bm", "B♭" → "a-sharp", "a#m7" → "a-sharp-m7".
 * Case-insensitive (FR-012), so "M" means minor like "m". Returns null when the text is not a
 * chord name.
 */
export function normalizeChordQuery(query: string): string | null {
  const q = query.trim().replace(/♯/g, "#").replace(/♭/g, "b");
  const m = /^([A-Ga-g])([#b]?)(.*)$/.exec(q);
  if (!m) return null;
  const letter = m[1].toLowerCase() as Letter;
  const accidental = m[2];
  let rest = m[3];
  // "Bb" vs "bm": a lowercase "b" accidental is only valid right after the letter.
  let semitone = NATURAL_SEMITONE[letter];
  if (accidental === "#") semitone += 1;
  if (accidental === "b") semitone -= 1;
  semitone = (semitone + 12) % 12;

  rest = rest.toLowerCase();
  const quality = QUALITY_ALIASES.find(([re]) => re.test(rest))?.[1];
  if (quality === undefined) return null;

  const root = SHARP_IDS[semitone];
  if (!quality) return root;
  return root.includes("-") ? `${root}-${quality}` : `${root}${quality}`;
}

function normalizeText(s: string) {
  return s.trim().toLowerCase().replace(/♯/g, "#").replace(/♭/g, "b");
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

/** "Did you mean" suggestions by edit distance on names and aliases. German "H" is mapped to B. */
export function suggestChords(chords: Chord[], query: string, limit = 4): Chord[] {
  const q = normalizeText(query).replace(/^h/, "b");
  return [...chords]
    .map((c) => ({
      c,
      d: Math.min(...[c.name, ...c.aliases].map((n) => levenshtein(q, normalizeText(n)))),
    }))
    .filter((x) => x.d <= 2)
    .sort((a, b) => a.d - b.d || a.c.name.length - b.c.name.length)
    .slice(0, limit)
    .map((x) => x.c);
}

export function searchChords(
  chords: Chord[],
  query: string,
): { results: Chord[]; suggestions: Chord[] } {
  const q = normalizeText(query);
  if (!q) return { results: chords, suggestions: [] };

  const exactId = normalizeChordQuery(query);
  const exact = exactId ? chords.filter((c) => c.id === exactId) : [];
  const partial = chords.filter(
    (c) => !exact.includes(c) && [c.name, ...c.aliases].some((n) => normalizeText(n).startsWith(q)),
  );
  const results = [...exact, ...partial];
  return { results, suggestions: results.length ? [] : suggestChords(chords, query) };
}

export function filterChords(
  chords: Chord[],
  { root, quality }: { root?: Chord["root"]; quality?: Chord["quality"] },
): Chord[] {
  return chords.filter((c) => (!root || c.root === root) && (!quality || c.quality === quality));
}
