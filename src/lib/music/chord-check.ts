import { Chord as TonalChord, Interval, Note } from "tonal";
import type { Chord, Voicing } from "@/content/schema";
import { pitchClass, voicingToNotes } from "./notes";

const SUFFIX: Record<Chord["quality"], string> = {
  major: "",
  minor: "m",
  "7": "7",
  m7: "m7",
  maj7: "maj7",
  sus2: "sus2",
  sus4: "sus4",
};

export function chordSymbol(chord: Pick<Chord, "root" | "quality">): string {
  return `${chord.root}${SUFFIX[chord.quality]}`;
}

/** Pitch classes (sharps) of a chord according to tonal, e.g. G → [G, B, D]. */
export function chordPitchClasses(chord: Pick<Chord, "root" | "quality">): string[] {
  const c = TonalChord.get(chordSymbol(chord));
  if (c.empty) throw new Error(`Unknown chord symbol ${chordSymbol(chord)}`);
  return c.notes.map(pitchClass);
}

/**
 * Checks a voicing against music theory (Constitution VII). Returns a list of problems;
 * an empty list means the voicing is correct. The perfect fifth may be omitted.
 */
export function checkVoicing(
  chord: Pick<Chord, "root" | "quality" | "name">,
  voicing: Voicing,
): string[] {
  const problems: string[] = [];
  const sounding = voicingToNotes(voicing.frets);
  if (sounding.length < 3) problems.push(`${chord.name}: fewer than 3 strings sound`);

  const soundingPcs = sounding.map(pitchClass);
  const expected = chordPitchClasses(chord);
  const root = pitchClass(chord.root);
  const symbol = TonalChord.get(chordSymbol(chord));

  for (const pc of new Set(soundingPcs)) {
    if (!expected.includes(pc)) problems.push(`${chord.name}: ${pc} is not part of the chord`);
  }
  symbol.intervals.forEach((ivl, i) => {
    const pc = expected[i];
    const optional = Interval.get(ivl).name === "5P";
    if (!soundingPcs.includes(pc as (typeof soundingPcs)[number]) && !optional)
      problems.push(`${chord.name}: missing ${pc} (${ivl})`);
  });

  if (!voicing.inversion && soundingPcs.length > 0 && soundingPcs[0] !== root) {
    problems.push(`${chord.name}: bass note is ${soundingPcs[0]}, expected root ${root}`);
  }

  voicing.frets.forEach((f, i) => {
    const finger = voicing.fingers[i];
    if (f <= 0 && finger !== 0)
      problems.push(`${chord.name}: string ${6 - i} is not fretted but has finger ${finger}`);
    if (f > 0 && finger === 0)
      problems.push(`${chord.name}: string ${6 - i} is fretted but has no finger`);
  });

  return problems;
}

/** Display helper: "C#" → "C♯/D♭". */
export function enharmonicLabel(root: string): string {
  if (!root.includes("#")) return root;
  const flat = Note.enharmonic(root);
  return `${root.replace("#", "♯")}/${flat.replace("b", "♭")}`;
}
