/** Zod-free content constants, safe to import from client components. */
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export const QUALITIES = ["major", "minor", "7", "m7", "maj7", "sus2", "sus4"] as const;
export const TIME_SIGNATURES = ["2/4", "3/4", "4/4", "6/8"] as const;
export const LEVEL_1_CHORDS = ["em", "am", "d", "a", "e", "g", "c", "dm"] as const;
