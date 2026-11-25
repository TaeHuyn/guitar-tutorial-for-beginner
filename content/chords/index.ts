/**
 * Chord library: 12 roots × 7 qualities (FR-011).
 *
 * Strings are listed 6 (low E) → 1 (high E). frets: -1 = muted (X), 0 = open (O).
 * fingers: 0 = none, 1 index … 4 pinky. The first voicing is the easiest for beginners.
 *
 * Open-position voicings are written by hand below. Every chord also gets movable barre
 * voicings (E-shape with the root on string 6, A-shape with the root on string 5).
 * Every voicing is verified against music theory by tests/unit/content/chord-library.test.ts.
 */

type Quality = "major" | "minor" | "7" | "m7" | "maj7" | "sus2" | "sus4";
type Root = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";

interface V {
  frets: number[];
  fingers: number[];
  difficulty: number;
  baseFret?: number;
  barre?: { fret: number; fromString: number; toString: number };
}

const ROOTS: Root[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const QUALITIES: Quality[] = ["major", "minor", "7", "m7", "maj7", "sus2", "sus4"];
const SUFFIX: Record<Quality, string> = {
  major: "",
  minor: "m",
  "7": "7",
  m7: "m7",
  maj7: "maj7",
  sus2: "sus2",
  sus4: "sus4",
};
const ID_SUFFIX: Record<Quality, string> = {
  major: "",
  minor: "m",
  "7": "7",
  m7: "m7",
  maj7: "maj7",
  sus2: "sus2",
  sus4: "sus4",
};
const FLAT_OF: Partial<Record<Root, string>> = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb",
};

/** Lessons that teach a chord (FR-013). */
const LESSONS: Record<string, string> = {
  em: "hop-am-em",
  am: "hop-am-am",
  e: "hop-am-e",
  a: "hop-am-a",
  d: "hop-am-d",
  dm: "hop-am-dm",
  g: "hop-am-g",
  c: "hop-am-c",
};

const v = (frets: number[], fingers: number[], difficulty: number): V => ({
  frets,
  fingers,
  difficulty,
});

/** Hand-written open / easy voicings, keyed by display name. */
const OPEN: Record<string, V[]> = {
  // C
  C: [v([-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0], 2)],
  C7: [v([-1, 3, 2, 3, 1, 0], [0, 3, 2, 4, 1, 0], 2)],
  Cmaj7: [v([-1, 3, 2, 0, 0, 0], [0, 3, 2, 0, 0, 0], 1)],
  Csus2: [v([-1, 3, 0, 0, 3, 3], [0, 2, 0, 0, 3, 4], 2)],
  Csus4: [v([-1, 3, 3, 0, 1, 1], [0, 3, 4, 0, 1, 1], 3)],
  // D
  D: [v([-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2], 2)],
  Dm: [v([-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1], 2)],
  D7: [v([-1, -1, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3], 2)],
  Dm7: [v([-1, -1, 0, 2, 1, 1], [0, 0, 0, 2, 1, 1], 2)],
  Dmaj7: [v([-1, -1, 0, 2, 2, 2], [0, 0, 0, 1, 2, 3], 2)],
  Dsus2: [v([-1, -1, 0, 2, 3, 0], [0, 0, 0, 1, 3, 0], 1)],
  Dsus4: [v([-1, -1, 0, 2, 3, 3], [0, 0, 0, 1, 2, 3], 2)],
  // E
  E: [v([0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0], 1)],
  Em: [v([0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0], 1)],
  E7: [v([0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0], 1)],
  Em7: [v([0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0], 1)],
  Emaj7: [v([0, 2, 1, 1, 0, 0], [0, 3, 1, 2, 0, 0], 2)],
  Esus2: [v([0, 2, 4, 4, 0, 0], [0, 1, 3, 4, 0, 0], 3)],
  Esus4: [v([0, 2, 2, 2, 0, 0], [0, 2, 3, 4, 0, 0], 1)],
  // F (small shapes on the top 4 strings)
  F: [v([-1, -1, 3, 2, 1, 1], [0, 0, 3, 2, 1, 1], 3)],
  Fm: [v([-1, -1, 3, 1, 1, 1], [0, 0, 3, 1, 1, 1], 3)],
  Fmaj7: [v([-1, -1, 3, 2, 1, 0], [0, 0, 3, 2, 1, 0], 2)],
  Fsus2: [v([-1, -1, 3, 0, 1, 1], [0, 0, 3, 0, 1, 1], 2)],
  Fsus4: [v([-1, -1, 3, 3, 1, 1], [0, 0, 3, 4, 1, 1], 3)],
  // G
  G: [v([3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3], 2), v([3, 2, 0, 0, 3, 3], [2, 1, 0, 0, 3, 4], 3)],
  G7: [v([3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1], 2)],
  Gmaj7: [v([3, 2, 0, 0, 0, 2], [3, 2, 0, 0, 0, 1], 2)],
  Gsus2: [v([3, -1, 0, 2, 3, 3], [2, 0, 0, 1, 3, 4], 3)],
  Gsus4: [v([3, -1, 0, 0, 1, 3], [3, 0, 0, 0, 1, 4], 2)],
  // A
  A: [v([-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0], 2)],
  Am: [v([-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0], 1)],
  A7: [v([-1, 0, 2, 0, 2, 0], [0, 0, 2, 0, 3, 0], 1)],
  Am7: [v([-1, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0], 1)],
  Amaj7: [v([-1, 0, 2, 1, 2, 0], [0, 0, 3, 1, 2, 0], 2)],
  Asus2: [v([-1, 0, 2, 2, 0, 0], [0, 0, 1, 2, 0, 0], 1)],
  Asus4: [v([-1, 0, 2, 2, 3, 0], [0, 0, 1, 2, 3, 0], 2)],
  // B
  B7: [v([-1, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4], 3)],
  Bm7: [v([-1, 2, 0, 2, 0, 2], [0, 2, 0, 3, 0, 4], 2)],
};

/** Movable shapes. `b` = fret of the root (barre) on the root string. */
const E_SHAPE: Partial<Record<Quality, (b: number) => V>> = {
  major: (b) => barre([b, b + 2, b + 2, b + 1, b, b], [1, 3, 4, 2, 1, 1], b, 6),
  minor: (b) => barre([b, b + 2, b + 2, b, b, b], [1, 3, 4, 1, 1, 1], b, 6),
  "7": (b) => barre([b, b + 2, b, b + 1, b, b], [1, 3, 1, 2, 1, 1], b, 6),
  m7: (b) => barre([b, b + 2, b, b, b, b], [1, 3, 1, 1, 1, 1], b, 6),
  maj7: (b) => ({
    frets: [b, -1, b + 1, b + 1, b, -1],
    fingers: [1, 0, 3, 4, 2, 0],
    difficulty: 3,
    baseFret: b,
  }),
  sus4: (b) => barre([b, b + 2, b + 2, b + 2, b, b], [1, 2, 3, 4, 1, 1], b, 6),
};

const A_SHAPE: Record<Quality, (b: number) => V> = {
  major: (b) => barre([-1, b, b + 2, b + 2, b + 2, b], [0, 1, 2, 3, 4, 1], b, 5),
  minor: (b) => barre([-1, b, b + 2, b + 2, b + 1, b], [0, 1, 3, 4, 2, 1], b, 5),
  "7": (b) => barre([-1, b, b + 2, b, b + 2, b], [0, 1, 3, 1, 4, 1], b, 5),
  m7: (b) => barre([-1, b, b + 2, b, b + 1, b], [0, 1, 3, 1, 2, 1], b, 5),
  maj7: (b) => barre([-1, b, b + 2, b + 1, b + 2, b], [0, 1, 3, 2, 4, 1], b, 5),
  sus2: (b) => barre([-1, b, b + 2, b + 2, b, b], [0, 1, 3, 4, 1, 1], b, 5),
  sus4: (b) => barre([-1, b, b + 2, b + 2, b + 3, b], [0, 1, 2, 3, 4, 1], b, 5),
};

function barre(frets: number[], fingers: number[], b: number, fromString: number): V {
  return {
    frets,
    fingers,
    difficulty: 4,
    baseFret: b,
    barre: { fret: b, fromString, toString: 1 },
  };
}

const semitone = (root: Root) => ROOTS.indexOf(root);
/** Fret of `root` on the low E string (E = 0) and on the A string (A = 0), kept in 1–12. */
const fretOnE = (root: Root) => (semitone(root) - semitone("E") + 12) % 12 || 12;
const fretOnA = (root: Root) => (semitone(root) - semitone("A") + 12) % 12 || 12;

function chordId(root: Root, q: Quality): string {
  const r = root.length === 2 ? `${root[0].toLowerCase()}-sharp` : root.toLowerCase();
  const s = ID_SUFFIX[q];
  if (!s) return r;
  return root.length === 2 ? `${r}-${s}` : `${r}${s}`;
}

function build() {
  const out: unknown[] = [];
  for (const root of ROOTS) {
    for (const quality of QUALITIES) {
      const name = `${root}${SUFFIX[quality]}`;
      const id = chordId(root, quality);
      const voicings: V[] = [...(OPEN[name] ?? [])];
      const eShape = E_SHAPE[quality];
      if (eShape) voicings.push(eShape(fretOnE(root)));
      voicings.push(A_SHAPE[quality](fretOnA(root)));
      // Easiest first; ties keep the lower position first.
      voicings.sort((a, b) => a.difficulty - b.difficulty || (a.baseFret ?? 1) - (b.baseFret ?? 1));
      const flat = FLAT_OF[root];
      out.push({
        id,
        name,
        root,
        quality,
        aliases: flat ? [`${flat}${SUFFIX[quality]}`] : [],
        lessonSlug: LESSONS[id],
        voicings: voicings.map((x) => ({
          ...x,
          baseFret: x.baseFret && x.baseFret > 1 ? x.baseFret : 1,
        })),
      });
    }
  }
  return out;
}

export const chords: unknown[] = build();
