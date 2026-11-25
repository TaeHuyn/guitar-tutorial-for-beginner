/** Vietnamese fixed-do note names: C → Đô, F# → Fa♯. Pure and dependency-free (client-safe). */
const SOLFEGE: Record<string, string> = {
  C: "Đô",
  D: "Rê",
  E: "Mi",
  F: "Fa",
  G: "Sol",
  A: "La",
  B: "Si",
};

/** Accepts a pitch class or a note with octave ("C#4", "Bb"). Sharps stay sharps. */
export function toSolfege(note: string): string {
  const m = /^([A-Ga-g])([#b♯♭]?)/.exec(note);
  if (!m) return note;
  const base = SOLFEGE[m[1].toUpperCase()];
  const acc = m[2] === "#" || m[2] === "♯" ? "♯" : m[2] === "b" || m[2] === "♭" ? "♭" : "";
  return `${base}${acc}`;
}

/** Pitch class (sharps) of a sounding note name, e.g. "G#3" → "G#". */
export function stripOctave(note: string): string {
  return note.replace(/-?\d+$/, "");
}
