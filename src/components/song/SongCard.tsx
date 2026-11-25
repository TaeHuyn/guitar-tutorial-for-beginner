import Link from "next/link";
import { Music } from "lucide-react";
import type { Song } from "@/content/schema";
import { vi } from "@/i18n/vi";

/** Compact song teaser used in lessons and lists. No lyrics (FR-005). */
export function SongCard({ song }: { song: Song }) {
  return (
    <Link
      href={`/bai-hat/${song.id}`}
      className="not-prose bg-card hover:bg-muted my-3 flex items-center gap-3 rounded-xl border p-4"
    >
      <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-full">
        <Music aria-hidden className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold">{song.title}</span>
        <span className="text-muted-foreground block text-sm">
          {song.artist} · {song.capo > 0 ? vi.song.capoAt(song.capo) : vi.song.noCapo} · {song.bpm}{" "}
          BPM
        </span>
      </span>
    </Link>
  );
}
