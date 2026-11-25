"use client";

import { useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vi } from "@/i18n/vi";
import type { StrumMode } from "@/lib/audio/pluck";
import { animatePluck } from "./pluck-animation";

interface Props {
  /** Sounding notes low→high, precomputed on the server (keeps tonal out of the client bundle). */
  notes: string[];
  chordName: string;
  /** Sounding strings (6…1) in the same order as `notes`, for the string animation. */
  strings?: number[];
  compact?: boolean;
}

export function ChordPlayButton({ notes, chordName, strings, compact = false }: Props) {
  const [error, setError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function play(mode: StrumMode) {
    try {
      const { playChord } = await import("@/lib/audio/pluck");
      const delays = await playChord(notes, mode);
      if (strings) {
        const svg = ref.current?.closest("[data-chord-card]")?.querySelector("svg[role=img]");
        animatePluck(svg, strings, delays);
      }
      setError(false);
    } catch {
      setError(true);
    }
  }

  return (
    <div ref={ref} className="flex flex-wrap items-center justify-center gap-2">
      <Button
        type="button"
        size={compact ? "sm" : "default"}
        variant="secondary"
        onClick={() => play("strum")}
        aria-label={`${vi.chord.play} hợp âm ${chordName}`}
      >
        <Volume2 aria-hidden />
        {vi.chord.play}
      </Button>
      <Button
        type="button"
        size={compact ? "sm" : "default"}
        variant="outline"
        onClick={() => play("arpeggio")}
        aria-label={`${vi.chord.arpeggio} hợp âm ${chordName}`}
      >
        {vi.chord.arpeggio}
      </Button>
      {error && (
        <p role="status" className="text-muted-foreground w-full text-center text-sm">
          {vi.tuner.mutedHint}
        </p>
      )}
    </div>
  );
}
