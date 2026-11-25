"use client";

import { vi } from "@/i18n/vi";
import { cn } from "@/lib/utils";

interface Props {
  beatsPerBar: number;
  /** 0-based index of the beat currently sounding, or null when stopped. */
  beat: number | null;
}

/** Beat lights synced to the audio clock (FR-021). Respects prefers-reduced-motion. */
export function BeatIndicator({ beatsPerBar, beat }: Props) {
  return (
    <div
      className="flex items-center justify-center gap-3"
      data-beat={beat === null ? "" : String(beat + 1)}
      role="img"
      aria-label={beat === null ? vi.metronome.title : vi.metronome.beat(beat + 1, beatsPerBar)}
    >
      {Array.from({ length: beatsPerBar }, (_, i) => {
        const accent = i === 0 || (beatsPerBar === 6 && i === 3);
        const active = beat === i;
        return (
          <span
            key={i}
            className={cn(
              "border-primary/40 rounded-full border-2 transition-colors motion-reduce:transition-none",
              accent ? "size-7" : "size-5",
              active && (i === 0 ? "border-primary bg-primary" : "border-primary bg-primary/60"),
            )}
          />
        );
      })}
    </div>
  );
}
