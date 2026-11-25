import { describe, expect, it } from "vitest";
import { validateContent, type RawContent } from "@/content/validate";

const chord = (id: string, name: string, root: string, quality: string, frets: number[]) => ({
  id,
  name,
  root,
  quality,
  voicings: [{ frets, fingers: [0, 0, 0, 0, 0, 0], difficulty: 1 }],
});

const exercise = { id: "ex-1", instruction: "Tập", bpm: 60 };

const lesson = (slug: string, level: number, extra: Record<string, unknown> = {}) => ({
  file: `${slug}.mdx`,
  metadata: {
    slug,
    level,
    title: slug,
    type: "technique",
    objective: "Mục tiêu",
    practiceMinutes: 10,
    exercises: [exercise],
    ...extra,
  },
  body: `Nội dung\n\n<Exercise id="ex-1" />`,
});

function base(): RawContent {
  return {
    levels: [
      {
        id: 0,
        slug: "level-0",
        title: "Chuẩn bị",
        description: "x",
        lessons: ["a"],
        levelTest: [{ id: "t", description: "x" }],
      },
      {
        id: 1,
        slug: "level-1",
        title: "Nền tảng",
        description: "x",
        lessons: ["b", "c"],
        levelTest: [{ id: "t", description: "x" }],
      },
    ],
    lessons: [
      lesson("a", 0),
      lesson("b", 1, { prerequisites: ["a"] }),
      lesson("c", 1, { prerequisites: ["b"] }),
    ],
    chords: [
      chord("g", "G", "G", "major", [3, 2, 0, 0, 0, 3]),
      chord("c", "C", "C", "major", [-1, 3, 2, 0, 1, 0]),
      chord("f", "F", "F", "major", [1, 3, 3, 2, 1, 1]),
    ],
    songs: [],
  };
}

const song = (chords: string[]) => ({
  id: "bai-hat",
  title: "Bài hát",
  artist: "Ca sĩ",
  composer: "Nhạc sĩ",
  officialUrl: "https://example.com/bai-hat",
  level: 1,
  capo: 2,
  bpm: 72,
  strumPattern: "D-DU-UDU",
  sections: [{ name: "Điệp khúc", chords }],
});

function errorsOf(raw: RawContent): string[] {
  const r = validateContent(raw);
  return r.ok ? [] : r.errors;
}

describe("validateContent", () => {
  it("accepts valid content", () => {
    const r = validateContent(base());
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("rejects duplicate lesson slugs", () => {
    const raw = base();
    raw.lessons.push(lesson("a", 0));
    expect(errorsOf(raw).join("\n")).toMatch(/Duplicate lesson slug: a/);
  });

  it("rejects unknown prerequisites", () => {
    const raw = base();
    raw.lessons[1] = lesson("b", 1, { prerequisites: ["khong-ton-tai"] });
    expect(errorsOf(raw).join("\n")).toMatch(/prerequisite "khong-ton-tai" does not exist/);
  });

  it("rejects prerequisites that come later in the path (and therefore cycles)", () => {
    const raw = base();
    raw.lessons[1] = lesson("b", 1, { prerequisites: ["c"] });
    expect(errorsOf(raw).join("\n")).toMatch(/prerequisite "c" must come earlier/);
  });

  it("requires at least one exercise per lesson", () => {
    const raw = base();
    raw.lessons[0] = { ...lesson("a", 0), body: "x" };
    (raw.lessons[0].metadata as { exercises: unknown[] }).exercises = [];
    expect(errorsOf(raw).join("\n")).toMatch(/at least one exercise/);
  });

  it("requires channel and url when a video is present", () => {
    const raw = base();
    raw.lessons[0] = lesson("a", 0, { video: { youtubeId: "abcdefghijk" } });
    const errs = errorsOf(raw).join("\n");
    expect(errs).toMatch(/video\.channel/);
    expect(errs).toMatch(/video\.url/);
  });

  it("rejects level-1 songs that use chords outside the 8 level-1 chords", () => {
    const raw = base();
    raw.songs = [song(["g", "c", "f"])];
    expect(errorsOf(raw).join("\n")).toMatch(/level-1 songs may only use .* \(found "f"\)/);
  });

  it("rejects songs with a lyrics field (FR-005)", () => {
    const raw = base();
    raw.songs = [{ ...song(["g", "c"]), lyrics: "..." }];
    expect(errorsOf(raw).join("\n")).toMatch(/lyrics|Unrecognized key/i);
  });

  it("rejects <Exercise id> that is not in metadata", () => {
    const raw = base();
    raw.lessons[0] = { ...lesson("a", 0), body: `<Exercise id="khong-co" />` };
    expect(errorsOf(raw).join("\n")).toMatch(
      /<Exercise id="khong-co"> is not in metadata\.exercises/,
    );
  });

  it("rejects components that are not allowed in MDX", () => {
    const raw = base();
    raw.lessons[0] = { ...lesson("a", 0), body: `<Exercise id="ex-1" />\n<Script />` };
    expect(errorsOf(raw).join("\n")).toMatch(/component <Script> is not allowed/);
  });

  it("rejects lessons that are not listed in any level", () => {
    const raw = base();
    raw.lessons.push(lesson("mo-coi", 1));
    expect(errorsOf(raw).join("\n")).toMatch(/"mo-coi".*not listed in any level/);
  });
});
