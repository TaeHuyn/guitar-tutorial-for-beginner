import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { ChordCard } from "@/components/chord/ChordCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getAllChords, getChord, getLesson, lessonHref } from "@/content/loader";
import { vi } from "@/i18n/vi";
import { chordPitchClasses } from "@/lib/music/chord-check";
import { cn } from "@/lib/utils";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return getAllChords().map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const chord = getChord((await params).id);
  return chord
    ? {
        title: `Hợp âm ${chord.name}`,
        description: `Sơ đồ thế bấm hợp âm ${chord.name} và âm thanh mẫu.`,
      }
    : {};
}

export default async function ChordPage({ params }: { params: Promise<Params> }) {
  const chord = getChord((await params).id);
  if (!chord) notFound();
  const lesson = chord.lessonSlug ? getLesson(chord.lessonSlug) : undefined;
  const notes = chordPitchClasses(chord);

  return (
    <article>
      <Link
        href="/hop-am"
        className="text-muted-foreground inline-flex min-h-11 items-center gap-1 text-sm hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {vi.chord.libraryTitle}
      </Link>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{chord.name}</h1>
      <p className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{vi.chord.qualities[chord.quality]}</Badge>
        <span>Nốt: {notes.join(" – ")}</span>
        {chord.aliases.length > 0 && <span>· Còn gọi là {chord.aliases.join(", ")}</span>}
      </p>

      {lesson && (
        <Link
          href={lessonHref(lesson)}
          className={cn(buttonVariants({ size: "lg" }), "mt-4 min-h-11 px-5")}
        >
          <GraduationCap aria-hidden />
          {vi.chord.learnThis}
        </Link>
      )}

      <h2 className="mt-8 text-xl font-semibold">
        {vi.chord.voicing} ({chord.voicings.length})
      </h2>
      <ul className="mt-2 flex flex-wrap gap-4">
        {chord.voicings.map((v, i) => (
          <li key={i} className="flex flex-col items-center">
            <ChordCard chord={chord} voicingIndex={i} size="lg" />
            <span className="text-muted-foreground text-sm">
              {vi.chord.voicing} {i + 1} · {vi.chord.difficulty} {"●".repeat(v.difficulty)}
              {"○".repeat(5 - v.difficulty)}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
