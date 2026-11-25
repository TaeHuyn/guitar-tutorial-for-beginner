import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Info } from "lucide-react";
import { ChordProgression } from "@/components/chord/ChordProgression";
import { StrumPattern } from "@/components/lesson/StrumPattern";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getAllSongs, getChord, getSong } from "@/content/loader";
import { songChords, type Chord } from "@/content/schema";
import { vi } from "@/i18n/vi";
import { cn } from "@/lib/utils";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  const songs = getAllSongs();
  // Next requires at least one param for static export of a dynamic route; a placeholder 404s.
  return songs.length ? songs.map((s) => ({ id: s.id })) : [{ id: "_" }];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const song = getSong((await params).id);
  return song ? { title: `${song.title} — ${song.artist}` } : {};
}

/** Song page: chords, strum, tempo, capo and an official link — never lyrics (FR-005). */
export default async function SongPage({ params }: { params: Promise<Params> }) {
  const song = getSong((await params).id);
  if (!song) notFound();
  const chords = songChords(song)
    .map(getChord)
    .filter((c): c is Chord => Boolean(c));

  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">{song.title}</h1>
      <p className="text-muted-foreground mt-1">
        {vi.song.artist}: {song.artist} · {vi.song.composer}: {song.composer}
      </p>

      <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="bg-card rounded-xl border p-3">
          <dt className="text-muted-foreground text-xs">{vi.song.capo}</dt>
          <dd className={cn("text-xl font-bold", song.capo > 0 && "text-primary")}>
            {song.capo > 0 ? `Ngăn ${song.capo}` : "—"}
          </dd>
        </div>
        <div className="bg-card rounded-xl border p-3">
          <dt className="text-muted-foreground text-xs">{vi.song.tempo}</dt>
          <dd className="text-xl font-bold">{song.bpm} BPM</dd>
        </div>
        <div className="bg-card rounded-xl border p-3">
          <dt className="text-muted-foreground text-xs">{vi.song.strum}</dt>
          <dd className="font-mono text-lg font-bold">{song.strumPattern}</dd>
        </div>
      </dl>
      {song.capo > 0 && (
        <p className="text-primary mt-3 font-medium">{vi.song.capoAt(song.capo)}</p>
      )}

      <h2 className="mt-8 text-xl font-semibold">Hợp âm trong bài</h2>
      <ChordProgression chords={chords} />

      <StrumPattern pattern={song.strumPattern} bpm={song.bpm} />

      <h2 className="mt-8 text-xl font-semibold">Cấu trúc bài</h2>
      <ol className="mt-3 space-y-3">
        {song.sections.map((section, i) => (
          <li key={i} className="bg-card rounded-xl border p-4">
            <p className="font-medium">{section.name}</p>
            <p className="mt-2 flex flex-wrap gap-2">
              {section.chords.map((c, j) => (
                <Badge key={j} variant="secondary" className="px-3 py-1 text-base">
                  {getChord(c)?.name ?? c}
                </Badge>
              ))}
            </p>
          </li>
        ))}
      </ol>

      {song.simplifiedFrom && (
        <p className="mt-4 flex gap-2 rounded-xl border border-dashed p-4 text-sm">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong>{vi.song.simplified}:</strong> {song.simplifiedFrom}
          </span>
        </p>
      )}

      <p className="text-muted-foreground mt-6 text-sm">{vi.song.lyricsNote}</p>
      <a
        href={song.officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ size: "lg" }), "mt-3 min-h-11 px-5")}
      >
        <ExternalLink aria-hidden />
        {vi.song.listenOfficial}
      </a>
    </article>
  );
}
