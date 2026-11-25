"use client";

import { useEffect, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_BPM, MIN_BPM } from "@/lib/audio/scheduler";
import { vi } from "@/i18n/vi";

function tempoName(bpm: number) {
  if (bpm < 60) return "Largo — rất chậm";
  if (bpm < 76) return "Adagio — chậm";
  if (bpm < 108) return "Andante — vừa phải";
  if (bpm < 120) return "Moderato — hơi nhanh";
  if (bpm < 168) return "Allegro — nhanh";
  return "Presto — rất nhanh";
}

interface Props {
  bpm: number;
  onChange: (bpm: number) => void;
}

/** Slider 30–250, −/+ buttons (hold to repeat) and a number input (FR-019). */
export function BpmControl({ bpm, onChange }: Props) {
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(bpm);
  useEffect(() => {
    valueRef.current = bpm;
  }, [bpm]);

  function startHold(delta: number) {
    valueRef.current += delta;
    onChange(valueRef.current);
    const repeat = (delay: number) => {
      holdRef.current = setTimeout(() => {
        valueRef.current += delta;
        onChange(valueRef.current);
        repeat(Math.max(40, delay * 0.85));
      }, delay);
    };
    repeat(400);
  }

  function endHold() {
    if (holdRef.current) clearTimeout(holdRef.current);
    holdRef.current = null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="size-14 rounded-full"
          aria-label={vi.metronome.slower}
          onPointerDown={() => startHold(-1)}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onChange(bpm - 1)}
        >
          <Minus aria-hidden className="size-6" />
        </Button>
        <label className="flex flex-col items-center">
          <span className="sr-only">{vi.metronome.bpm}</span>
          <input
            type="number"
            inputMode="numeric"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v) && v >= MIN_BPM) onChange(v);
            }}
            onBlur={(e) => onChange(Number(e.target.value))}
            className="focus-visible:ring-ring w-32 bg-transparent text-center text-6xl font-bold tabular-nums outline-none focus-visible:ring-2"
            data-bpm-input
          />
          <span aria-hidden className="text-muted-foreground text-sm">
            {vi.metronome.bpm}
          </span>
        </label>
        <Button
          type="button"
          variant="outline"
          className="size-14 rounded-full"
          aria-label={vi.metronome.faster}
          onPointerDown={() => startHold(1)}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onChange(bpm + 1)}
        >
          <Plus aria-hidden className="size-6" />
        </Button>
      </div>
      <p className="text-muted-foreground mt-1 text-center text-sm">{tempoName(bpm)}</p>
      <input
        type="range"
        min={MIN_BPM}
        max={MAX_BPM}
        value={bpm}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${vi.metronome.bpm} (${MIN_BPM}–${MAX_BPM})`}
        className="mt-4 h-11 w-full accent-[var(--primary)]"
      />
    </div>
  );
}
