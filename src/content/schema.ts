import { z } from "zod";

/** Content schemas — see specs/001-guitar-learning-mvp/data-model.md §1. */

import { LEVEL_1_CHORDS, QUALITIES, ROOTS, SLUG, TIME_SIGNATURES } from "./constants";

export { LEVEL_1_CHORDS, QUALITIES, ROOTS, SLUG, TIME_SIGNATURES };

export const ExerciseSchema = z.object({
  id: z.string().regex(SLUG),
  instruction: z.string().min(1),
  bpm: z.number().int().min(30).max(250).optional(),
  timeSignature: z.enum(TIME_SIGNATURES).optional(),
  durationMinutes: z.number().int().min(1).max(120).optional(),
  passCriterion: z.string().min(1).optional(),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

export const VideoSchema = z.object({
  youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/, "youtubeId must be the 11-character video id"),
  channel: z.string().min(1, "video.channel is required (FR-008b)"),
  url: z.string().url("video.url is required (FR-008b)"),
});
export type Video = z.infer<typeof VideoSchema>;

export const ReferenceSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  url: z.string().url().optional(),
});

export const LessonMetaSchema = z.object({
  slug: z.string().regex(SLUG),
  level: z.number().int().min(0).max(5),
  title: z.string().min(1),
  type: z.enum(["theory", "technique", "song"]),
  objective: z.string().min(1),
  practiceMinutes: z.number().int().min(5).max(60),
  prerequisites: z.array(z.string().regex(SLUG)).default([]),
  chords: z.array(z.string()).default([]),
  songs: z.array(z.string()).default([]),
  video: VideoSchema.optional(),
  exercises: z
    .array(ExerciseSchema)
    .min(1, "Every lesson needs at least one exercise (Constitution III)"),
  references: z.array(ReferenceSchema).default([]),
});
export type LessonMeta = z.infer<typeof LessonMetaSchema>;

export const LevelTestCriterionSchema = z.object({
  id: z.string().regex(SLUG),
  description: z.string().min(1),
  target: z.string().min(1).optional(),
});
export type LevelTestCriterion = z.infer<typeof LevelTestCriterionSchema>;

export const LevelSchema = z.object({
  id: z.number().int().min(0).max(5),
  slug: z.string().regex(/^level-[0-5]$/),
  title: z.string().min(1),
  description: z.string().min(1).max(300),
  lessons: z.array(z.string().regex(SLUG)),
  levelTest: z.array(LevelTestCriterionSchema).min(1),
  comingSoon: z.boolean().default(false),
});
export type Level = z.infer<typeof LevelSchema>;

const FretSchema = z.number().int().min(-1).max(15);
const FingerSchema = z.number().int().min(0).max(4);

export const VoicingSchema = z.object({
  /** Strings 6→1. -1 = muted (X), 0 = open (O), 1–15 = fret. */
  frets: z.array(FretSchema).length(6),
  /** 0 = not fretted, 1–4 = index→pinky. */
  fingers: z.array(FingerSchema).length(6),
  barre: z
    .object({
      fret: z.number().int().min(1).max(15),
      fromString: z.number().int().min(1).max(6),
      toString: z.number().int().min(1).max(6),
    })
    .optional(),
  baseFret: z.number().int().min(1).default(1),
  difficulty: z.number().int().min(1).max(5),
  /** True when the lowest note is intentionally not the root (inversion / slash chord). */
  inversion: z.boolean().default(false),
});
export type Voicing = z.infer<typeof VoicingSchema>;

export const ChordSchema = z.object({
  id: z.string().regex(/^[a-g](?:-(?:sharp|flat))?(?:-?(?:m|7|m7|maj7|sus2|sus4))?$/),
  name: z.string().min(1),
  root: z.enum(ROOTS),
  quality: z.enum(QUALITIES),
  aliases: z.array(z.string()).default([]),
  voicings: z.array(VoicingSchema).min(1),
  lessonSlug: z.string().regex(SLUG).optional(),
});
export type Chord = z.infer<typeof ChordSchema>;

export const SongSchema = z
  .object({
    id: z.string().regex(SLUG),
    title: z.string().min(1),
    artist: z.string().min(1),
    composer: z.string().min(1),
    officialUrl: z.string().url(),
    level: z.number().int().min(0).max(5),
    capo: z.number().int().min(0).max(7),
    bpm: z.number().int().min(30).max(250),
    strumPattern: z.string().regex(/^[DUx-]+$/, "Use D, U, x and - only, e.g. D-DU-UDU"),
    sections: z
      .array(z.object({ name: z.string().min(1), chords: z.array(z.string()).min(1) }))
      .min(1),
    simplifiedFrom: z.string().min(1).optional(),
  })
  .strict(); // no lyrics or audio fields allowed (FR-005, Constitution II)
export type Song = z.infer<typeof SongSchema>;

export function songChords(song: Pick<Song, "sections">): string[] {
  return [...new Set(song.sections.flatMap((s) => s.chords))];
}
