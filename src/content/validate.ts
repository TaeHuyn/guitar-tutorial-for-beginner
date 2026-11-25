import {
  ChordSchema,
  LEVEL_1_CHORDS,
  LessonMetaSchema,
  LevelSchema,
  SongSchema,
  songChords,
  type Chord,
  type LessonMeta,
  type Level,
  type Song,
} from "./schema";

/** Components lesson MDX may use (contracts/content-schema.md). */
export const ALLOWED_MDX_COMPONENTS = new Set([
  "ChordDiagram",
  "ChordProgression",
  "Exercise",
  "StrumPattern",
  "Tab",
  "SongCard",
  "Tip",
  "Warning",
  "LevelTest",
]);

export interface RawContent {
  levels: unknown[];
  lessons: { file: string; metadata: unknown; body?: string }[];
  chords: unknown[];
  songs: unknown[];
}

export interface ValidContent {
  levels: Level[];
  lessons: LessonMeta[];
  chords: Chord[];
  songs: Song[];
}

export type ValidationResult =
  { ok: true; content: ValidContent; errors: [] } | { ok: false; content: null; errors: string[] };

function zodErrors(where: string, error: { issues: { path: PropertyKey[]; message: string }[] }) {
  return error.issues.map(
    (i) => `${where}: ${i.path.map(String).join(".") || "(root)"} — ${i.message}`,
  );
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const v of values) (seen.has(v) ? dup : seen).add(v);
  return [...dup];
}

/**
 * Validates all hand-authored content. Pure function: used by `npm run content:check`
 * (via Vitest) and by the loader at build time so broken content never ships.
 */
export function validateContent(raw: RawContent): ValidationResult {
  const errors: string[] = [];

  // 1. Schemas
  const levels: Level[] = [];
  raw.levels.forEach((l, i) => {
    const r = LevelSchema.safeParse(l);
    if (r.success) levels.push(r.data);
    else errors.push(...zodErrors(`levels[${i}]`, r.error));
  });
  const lessons: (LessonMeta & { __file: string; __body?: string })[] = [];
  raw.lessons.forEach(({ file, metadata, body }) => {
    const r = LessonMetaSchema.safeParse(metadata);
    if (r.success) lessons.push({ ...r.data, __file: file, __body: body });
    else errors.push(...zodErrors(file, r.error));
  });
  const chords: Chord[] = [];
  raw.chords.forEach((c, i) => {
    const r = ChordSchema.safeParse(c);
    if (r.success) chords.push(r.data);
    else errors.push(...zodErrors(`chords[${i}]`, r.error));
  });
  const songs: Song[] = [];
  raw.songs.forEach((s, i) => {
    const r = SongSchema.safeParse(s);
    if (r.success) songs.push(r.data);
    else errors.push(...zodErrors(`songs[${i}]`, r.error));
  });

  // 2. Uniqueness and references
  for (const d of duplicates(lessons.map((l) => l.slug)))
    errors.push(`Duplicate lesson slug: ${d}`);
  for (const d of duplicates(chords.map((c) => c.id))) errors.push(`Duplicate chord id: ${d}`);
  for (const d of duplicates(songs.map((s) => s.id))) errors.push(`Duplicate song id: ${d}`);
  for (const d of duplicates(levels.map((l) => l.slug))) errors.push(`Duplicate level: ${d}`);

  const lessonBySlug = new Map(lessons.map((l) => [l.slug, l]));
  const chordIds = new Set(chords.map((c) => c.id));
  const songIds = new Set(songs.map((s) => s.id));

  // Order of lessons along the path.
  const position = new Map<string, number>();
  let idx = 0;
  for (const level of [...levels].sort((a, b) => a.id - b.id)) {
    for (const slug of level.lessons) {
      const lesson = lessonBySlug.get(slug);
      if (!lesson) errors.push(`${level.slug} lists unknown lesson "${slug}"`);
      else if (lesson.level !== level.id)
        errors.push(`Lesson "${slug}" has level ${lesson.level} but is listed in ${level.slug}`);
      if (position.has(slug)) errors.push(`Lesson "${slug}" appears more than once in the path`);
      position.set(slug, idx++);
    }
  }
  for (const l of lessons) {
    if (!position.has(l.slug))
      errors.push(`Lesson "${l.slug}" (${l.__file}) is not listed in any level`);
  }

  for (const l of lessons) {
    // 3. Prerequisites exist, come earlier in the path (which also rules out cycles).
    for (const p of l.prerequisites) {
      if (!lessonBySlug.has(p)) errors.push(`${l.slug}: prerequisite "${p}" does not exist`);
      else if (p === l.slug) errors.push(`${l.slug}: lesson cannot be its own prerequisite`);
      else if ((position.get(p) ?? -1) >= (position.get(l.slug) ?? Infinity))
        errors.push(`${l.slug}: prerequisite "${p}" must come earlier in the path`);
    }
    for (const c of l.chords) if (!chordIds.has(c)) errors.push(`${l.slug}: unknown chord "${c}"`);
    for (const s of l.songs) if (!songIds.has(s)) errors.push(`${l.slug}: unknown song "${s}"`);

    // 4. Exercise ids are unique and MDX only references known ones/components.
    for (const d of duplicates(l.exercises.map((e) => e.id)))
      errors.push(`${l.slug}: duplicate exercise id "${d}"`);
    if (l.__body) {
      const exerciseIds = new Set(l.exercises.map((e) => e.id));
      const placed = new Set<string>();
      for (const m of l.__body.matchAll(/<Exercise\s+id=["']([^"']+)["']/g)) {
        placed.add(m[1]);
        if (!exerciseIds.has(m[1]))
          errors.push(`${l.slug}: <Exercise id="${m[1]}"> is not in metadata.exercises`);
      }
      for (const id of exerciseIds) {
        if (!placed.has(id))
          errors.push(`${l.slug}: exercise "${id}" is never placed with <Exercise id="${id}" />`);
      }
      for (const m of l.__body.matchAll(/<ChordDiagram\s+chord=["']([^"']+)["']/g)) {
        if (!chordIds.has(m[1]))
          errors.push(`${l.slug}: <ChordDiagram chord="${m[1]}"> is not a known chord`);
      }
      for (const m of l.__body.matchAll(/<SongCard\s+id=["']([^"']+)["']/g)) {
        if (!songIds.has(m[1]))
          errors.push(`${l.slug}: <SongCard id="${m[1]}"> is not a known song`);
      }
      // Ignore code fences when looking for components.
      const withoutCode = l.__body.replace(/```[\s\S]*?```/g, "");
      for (const m of withoutCode.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) {
        if (!ALLOWED_MDX_COMPONENTS.has(m[1]))
          errors.push(`${l.slug}: component <${m[1]}> is not allowed`);
      }
    }
  }

  for (const c of chords) {
    if (c.lessonSlug && !lessonBySlug.has(c.lessonSlug))
      errors.push(`chord ${c.id}: lessonSlug "${c.lessonSlug}" does not exist`);
  }

  // 6. Level-1 songs only use the 8 level-1 chords.
  const level1 = new Set<string>(LEVEL_1_CHORDS);
  for (const s of songs) {
    for (const c of songChords(s)) {
      if (!chordIds.has(c)) errors.push(`song ${s.id}: unknown chord "${c}"`);
      if (s.level === 1 && !level1.has(c))
        errors.push(
          `song ${s.id}: level-1 songs may only use ${LEVEL_1_CHORDS.join(", ")} (found "${c}")`,
        );
    }
  }

  if (errors.length > 0) return { ok: false, content: null, errors };
  return {
    ok: true,
    errors: [],
    content: {
      levels: [...levels].sort((a, b) => a.id - b.id),
      lessons: lessons.map((l) => {
        const rest: LessonMeta & { __file?: string; __body?: string } = { ...l };
        delete rest.__file;
        delete rest.__body;
        return rest;
      }),
      chords,
      songs,
    },
  };
}
