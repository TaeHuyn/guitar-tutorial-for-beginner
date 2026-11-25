"use client";

import Link from "next/link";
import { useEffect } from "react";
import { NotebookPen, Pause, Play, Volume1 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMetronome, type MetronomeSettings } from "@/hooks/useMetronome";
import type { BeatsPerBar } from "@/lib/audio/scheduler";
import { vi } from "@/i18n/vi";
import { cn } from "@/lib/utils";
import { BeatIndicator } from "./BeatIndicator";
import { BpmControl } from "./BpmControl";
import { TapTempoButton } from "./TapTempoButton";

const SIGNATURES: { label: string; beats: BeatsPerBar }[] = [
  { label: "2/4", beats: 2 },
  { label: "3/4", beats: 3 },
  { label: "4/4", beats: 4 },
  { label: "6/8", beats: 6 },
];

interface Props {
  initial?: Partial<MetronomeSettings>;
  compact?: boolean;
}

export function Metronome({ initial, compact = false }: Props) {
  const { settings, update, running, beat, toggle } = useMetronome(initial);

  // Space toggles start/stop (unless typing in an input).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (e.code !== "Space" || target?.closest("input, textarea, select, button")) return;
      e.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6",
        compact ? "py-2" : "bg-card rounded-2xl border p-5 sm:p-8",
      )}
      data-metronome
    >
      <BeatIndicator beatsPerBar={settings.beatsPerBar} beat={beat} />
      <BpmControl bpm={settings.bpm} onChange={(bpm) => update({ bpm })} />

      <fieldset className="w-full">
        <legend className="text-muted-foreground mb-2 text-center text-sm">
          {vi.metronome.timeSignature}
        </legend>
        <div className="grid grid-cols-4 gap-2" role="radiogroup">
          {SIGNATURES.map((s) => (
            <Button
              key={s.label}
              type="button"
              role="radio"
              aria-checked={settings.beatsPerBar === s.beats}
              variant={settings.beatsPerBar === s.beats ? "default" : "outline"}
              onClick={() => update({ beatsPerBar: s.beats })}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </fieldset>

      <div className="flex w-full flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          size="lg"
          className="min-h-14 min-w-40 text-lg"
          onClick={toggle}
          aria-pressed={running}
        >
          {running ? <Pause aria-hidden /> : <Play aria-hidden />}
          {running ? vi.metronome.stop : vi.metronome.start}
        </Button>
        <TapTempoButton onTempo={(bpm) => update({ bpm })} />
      </div>

      <label className="flex w-full max-w-xs items-center gap-3 text-sm">
        <Volume1 aria-hidden className="text-muted-foreground size-5 shrink-0" />
        <span className="sr-only">{vi.metronome.volume}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={settings.volume}
          onChange={(e) => update({ volume: Number(e.target.value) })}
          className="h-11 w-full accent-[var(--primary)]"
          aria-label={vi.metronome.volume}
        />
      </label>
      {!compact && (
        <>
          <Link
            href={`/nhat-ky?bpm=${settings.bpm}`}
            className="text-primary inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-2"
          >
            <NotebookPen aria-hidden className="size-4" />
            {vi.metronome.logSession}
          </Link>
          <p className="text-muted-foreground hidden text-xs sm:block">
            {vi.metronome.keyboardHint}
          </p>
        </>
      )}
    </div>
  );
}
