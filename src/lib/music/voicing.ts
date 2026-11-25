/** Tonal-free voicing helpers, safe for client bundles. */

const OPEN_MIDI = [40, 45, 50, 55, 59, 64] as const; // E2 A2 D3 G3 B3 E4
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

function midiToName(midi: number): string {
  return `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

/**
 * Sounding notes of a fretted voicing. `frets` lists strings 6→1;
 * -1 = muted (skipped), 0 = open, n = fret number.
 */
export function voicingToNotes(frets: readonly number[]): string[] {
  if (frets.length !== 6) throw new RangeError("A voicing must list exactly 6 strings");
  const notes: string[] = [];
  frets.forEach((fret, i) => {
    if (fret >= 0) notes.push(midiToName(OPEN_MIDI[i] + fret));
  });
  return notes;
}

/** Note on a given string (6…1) and fret, e.g. (5, 3) → "C3". */
export function noteAt(stringNumber: number, fret: number): string {
  return midiToName(OPEN_MIDI[6 - stringNumber] + fret);
}
