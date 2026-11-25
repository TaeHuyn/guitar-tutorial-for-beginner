import "server-only";
import type { ComponentType } from "react";
import type { MDXProps } from "mdx/types";
import { levels as rawLevels } from "@content/levels";
import { chords as rawChords } from "@content/chords";
import { songs as rawSongs } from "@content/songs";
import { lessonModules } from "@content/lessons";
import type { Chord, LessonMeta, Level, Song } from "./schema";
import { validateContent, type ValidContent } from "./validate";

let cache: ValidContent | null = null;

/** Loads and validates all content once. Throws (failing the build) if content is invalid. */
function content(): ValidContent {
  if (cache) return cache;
  const result = validateContent({
    levels: rawLevels,
    lessons: lessonModules.map((m) => ({ file: m.file, metadata: m.module.metadata })),
    chords: rawChords,
    songs: rawSongs,
  });
  if (!result.ok) {
    throw new Error(`Invalid content:\n- ${result.errors.join("\n- ")}`);
  }
  cache = result.content;
  return cache;
}

export function getLevels(): Level[] {
  return content().levels;
}

export function getLevel(id: number): Level | undefined {
  return content().levels.find((l) => l.id === id);
}

/** Lessons in path order. */
export function getPath(): LessonMeta[] {
  const { levels, lessons } = content();
  const bySlug = new Map(lessons.map((l) => [l.slug, l]));
  return levels.flatMap((lv) => lv.lessons.map((s) => bySlug.get(s)!));
}

export function getLessonsByLevel(level: number): LessonMeta[] {
  return getPath().filter((l) => l.level === level);
}

export function getLesson(slug: string): LessonMeta | undefined {
  return content().lessons.find((l) => l.slug === slug);
}

export function getLessonComponent(slug: string): ComponentType<MDXProps> | undefined {
  return lessonModules.find((m) => (m.module.metadata as { slug?: string })?.slug === slug)?.module
    .default as ComponentType<MDXProps> | undefined;
}

export function getAdjacentLessons(slug: string): { previous?: LessonMeta; next?: LessonMeta } {
  const path = getPath();
  const i = path.findIndex((l) => l.slug === slug);
  if (i < 0) return {};
  return { previous: path[i - 1], next: path[i + 1] };
}

export function getAllChords(): Chord[] {
  return content().chords;
}

export function getChord(id: string): Chord | undefined {
  return content().chords.find((c) => c.id === id);
}

export function getAllSongs(): Song[] {
  return content().songs;
}

export function getSong(id: string): Song | undefined {
  return content().songs.find((s) => s.id === id);
}

export function lessonHref(lesson: Pick<LessonMeta, "level" | "slug">): string {
  return `/hoc/level-${lesson.level}/${lesson.slug}`;
}
