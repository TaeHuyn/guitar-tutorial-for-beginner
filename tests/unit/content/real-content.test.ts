import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { levels } from "@content/levels";
import { chords } from "@content/chords";
import { songs } from "@content/songs";
import { lessonModules } from "@content/lessons";
import { validateContent } from "@/content/validate";

/** `npm run content:check` — the real content in /content must be valid. */
describe("content/ (real content)", () => {
  it("passes every content rule", () => {
    const result = validateContent({
      levels,
      chords,
      songs,
      lessons: lessonModules.map((m) => ({
        file: m.file,
        metadata: m.module.metadata,
        body: readFileSync(path.resolve("content/lessons", m.file), "utf8"),
      })),
    });
    expect(result.errors).toEqual([]);
  });

  it("level 0 and level 1 exist with lessons", () => {
    expect(levels.map((l) => l.id)).toEqual(expect.arrayContaining([0, 1]));
    for (const l of levels.filter((l) => l.id <= 1)) expect(l.lessons.length).toBeGreaterThan(0);
  });
});
