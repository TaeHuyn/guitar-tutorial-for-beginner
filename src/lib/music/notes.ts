import { Note } from "tonal";

/** Standard tuning, string 6 (low E) → string 1 (high E). */
export const STANDARD_TUNING = ["E2", "A2", "D3", "G3", "B3", "E4"] as const;

export const SHARP_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;
export type PitchClass = (typeof SHARP_NAMES)[number];

export interface NoteReading {
  note: PitchClass;
  octave: number;
  midi: number;
  /** Deviation from the nearest equal-tempered note, in cents (−50…+50). */
  cents: number;
}

/** Converts a frequency to the nearest note name (sharps) and its deviation in cents. */
export function frequencyToNote(hz: number, a4 = 440): NoteReading {
  if (!(hz > 0)) throw new RangeError(`Invalid frequency: ${hz}`);
  const exactMidi = 69 + 12 * Math.log2(hz / a4);
  const midi = Math.round(exactMidi);
  const cents = (exactMidi - midi) * 100;
  return {
    note: SHARP_NAMES[((midi % 12) + 12) % 12],
    octave: Math.floor(midi / 12) - 1,
    midi,
    cents,
  };
}

/** "A4" → 440. Throws on unknown note names. */
export function noteToFrequency(note: string, a4 = 440): number {
  const midi = Note.midi(note);
  if (midi === null) throw new RangeError(`Invalid note: ${note}`);
  return a4 * 2 ** ((midi - 69) / 12);
}

/** Pitch class using sharps: "Bb3" → "A#", "E#" → "F". */
export function pitchClass(note: string): PitchClass {
  const chroma = Note.chroma(note);
  if (chroma === undefined || Number.isNaN(chroma)) throw new RangeError(`Invalid note: ${note}`);
  return SHARP_NAMES[chroma];
}

export { voicingToNotes } from "./voicing";
