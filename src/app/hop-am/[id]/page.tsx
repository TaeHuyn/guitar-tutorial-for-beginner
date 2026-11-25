import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { ChordExplorer } from "@/components/chord/ChordExplorer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getAllChords, getChord, getLesson, lessonHref } from "@/content/loader";
import { vi } from "@/i18n/vi";
import { chordPitchClasses } from "@/lib/music/chord-check";
import { toSolfege } from "@/lib/music/solfege";
import { cn } from "@/lib/utils";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return getAllChords().map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const chord = getChord((await params).id);
  return chord
    ? {
        title: `Hợp âm ${chord.name} trên đàn guitar`,
        description: `Các thế bấm hợp âm ${chord.name}, xem trên sơ đồ hoặc cần đàn, nghe âm thanh mẫu.`,
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
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{chord.name} trên đàn guitar</h1>
      <p className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{vi.chord.qualities[chord.quality]}</Badge>
        <span>Gồm các nốt: {notes.map((n) => `${n} (${toSolfege(n)})`).join(" – ")}</span>
        {chord.aliases.length > 0 && <span>· Còn gọi là {chord.aliases.join(", ")}</span>}
      </p>

      <div className="mt-6">
        <ChordExplorer chord={chord} />
      </div>

      {lesson && (
        <Link
          href={lessonHref(lesson)}
          className={cn(buttonVariants({ size: "lg", variant: "outline" }), "mt-6 min-h-11 px-5")}
        >
          <GraduationCap aria-hidden />
          {vi.chord.learnThis}
        </Link>
      )}
    </article>
  );
}
