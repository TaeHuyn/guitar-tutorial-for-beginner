import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Target } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import { createElement, type ReactNode } from "react";
import { ChordCard } from "@/components/chord/ChordCard";
import { ChordProgression } from "@/components/chord/ChordProgression";
import { Tip, Warning } from "@/components/lesson/Callout";
import { LessonTable } from "@/components/lesson/LessonTable";
import { Exercise } from "@/components/lesson/Exercise";
import { LevelTest } from "@/components/lesson/LevelTest";
import { StrumPattern } from "@/components/lesson/StrumPattern";
import { Tab } from "@/components/lesson/Tab";
import { YouTubeEmbed } from "@/components/lesson/YouTubeEmbed";
import { MarkCompleteButton } from "@/components/progress/MarkCompleteButton";
import { SongCard } from "@/components/song/SongCard";
import { Badge } from "@/components/ui/badge";
import {
  getAdjacentLessons,
  getChord,
  getLesson,
  getLessonComponent,
  getLevel,
  getPath,
  getSong,
  lessonHref,
} from "@/content/loader";
import type { Chord, Song } from "@/content/schema";
import { vi } from "@/i18n/vi";

type Params = { level: string; slug: string };

export function generateStaticParams(): Params[] {
  return getPath().map((l) => ({ level: `level-${l.level}`, slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return {};
  return { title: lesson.title, description: lesson.objective };
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { level: levelParam, slug } = await params;
  const lesson = getLesson(slug);
  const Content = getLessonComponent(slug);
  if (!lesson || !Content || levelParam !== `level-${lesson.level}`) notFound();

  const level = getLevel(lesson.level)!;
  const { previous, next } = getAdjacentLessons(slug);
  const prerequisites = lesson.prerequisites.map((p) => getLesson(p)!).filter(Boolean);

  const components: MDXComponents = {
    Tip,
    Warning,
    Tab,
    table: LessonTable,
    StrumPattern,
    ChordDiagram: ({ chord, voicing }: { chord: string; voicing?: number }) => {
      const c = getChord(chord);
      return c ? <ChordCard chord={c} voicingIndex={voicing} /> : null;
    },
    ChordProgression: ({ chords }: { chords: string[] }) => (
      <ChordProgression chords={chords.map(getChord).filter((c): c is Chord => Boolean(c))} />
    ),
    Exercise: ({ id }: { id: string }) => {
      const ex = lesson.exercises.find((e) => e.id === id);
      return ex ? <Exercise exercise={ex} /> : null;
    },
    SongCard: ({ id }: { id: string }) => {
      const s: Song | undefined = getSong(id);
      return s ? <SongCard song={s} /> : null;
    },
    LevelTest: () => <LevelTest level={level.id} criteria={level.levelTest} />,
    wrapper: ({ children }: { children: ReactNode }) => (
      <div className="prose-lesson">{children}</div>
    ),
  };

  return (
    <article className="mx-auto max-w-2xl">
      <nav aria-label="Breadcrumb" className="text-muted-foreground mb-4 text-sm">
        <Link href="/hoc" className="hover:underline">
          {vi.learn.pathTitle}
        </Link>{" "}
        /{" "}
        <span>
          {vi.learn.level} {level.id}: {level.title}
        </span>
      </nav>

      <header>
        <Badge variant="secondary">{vi.learn.lessonType[lesson.type]}</Badge>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance">{lesson.title}</h1>
        <dl className="bg-card mt-4 grid gap-3 rounded-xl border p-4 sm:grid-cols-[auto_1fr]">
          <dt className="flex items-center gap-2 font-medium">
            <Target aria-hidden className="text-primary size-4" />
            {vi.learn.objective}
          </dt>
          <dd>{lesson.objective}</dd>
          <dt className="flex items-center gap-2 font-medium">
            <Clock aria-hidden className="text-primary size-4" />
            {vi.learn.practiceTime}
          </dt>
          <dd>
            {lesson.practiceMinutes} {vi.common.minutes} / ngày
          </dd>
        </dl>
      </header>

      {prerequisites.length > 0 && (
        <aside className="mt-4 rounded-xl border border-dashed p-4 text-sm">
          <p className="font-medium">{vi.learn.prerequisites}</p>
          <p className="text-muted-foreground">{vi.learn.prerequisitesHint}</p>
          <ul className="mt-2 list-disc pl-5">
            {prerequisites.map((p) => (
              <li key={p.slug}>
                <Link href={lessonHref(p)} className="text-primary underline underline-offset-2">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {lesson.video && <YouTubeEmbed video={lesson.video} title={lesson.title} />}

      <div className="mt-6">
        {/* createElement: Content comes from a static registry, it is not created per render. */}
        {createElement(Content, { components })}
      </div>

      {lesson.references.length > 0 && (
        <section className="mt-8 text-sm">
          <h2 className="font-semibold">{vi.learn.references}</h2>
          <ul className="text-muted-foreground mt-2 list-disc pl-5">
            {lesson.references.map((r) => (
              <li key={r.title}>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline">
                    {r.title}
                  </a>
                ) : (
                  <cite className="not-italic">{r.title}</cite>
                )}{" "}
                — {r.author}
              </li>
            ))}
          </ul>
        </section>
      )}

      <MarkCompleteButton slug={lesson.slug} />

      <LessonNav previous={previous} next={next} />
    </article>
  );
}

function LessonNav({
  previous,
  next,
}: {
  previous?: { slug: string; level: number; title: string };
  next?: { slug: string; level: number; title: string };
}) {
  return (
    <nav aria-label="Điều hướng bài học" className="mt-10 grid gap-3 sm:grid-cols-2">
      {previous ? (
        <Link
          href={lessonHref(previous)}
          className="hover:bg-muted flex min-h-14 items-center gap-2 rounded-xl border p-4"
        >
          <ArrowLeft aria-hidden className="size-4 shrink-0" />
          <span>
            <span className="text-muted-foreground block text-xs">{vi.learn.previous}</span>
            {previous.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={lessonHref(next)}
          className="border-primary bg-primary/5 hover:bg-primary/10 flex min-h-14 items-center justify-end gap-2 rounded-xl border p-4 text-right"
        >
          <span>
            <span className="text-muted-foreground block text-xs">{vi.learn.next}</span>
            <span className="sr-only">: </span>
            {next.title}
          </span>
          <ArrowRight aria-hidden className="size-4 shrink-0" />
        </Link>
      )}
    </nav>
  );
}
