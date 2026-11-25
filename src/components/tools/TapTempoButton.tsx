"use client";

import { useRef } from "react";
import { Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tapTempo } from "@/lib/audio/tap-tempo";
import { vi } from "@/i18n/vi";

/** Tap ≥ 4 times along with music to set the BPM (FR-022). */
export function TapTempoButton({ onTempo }: { onTempo: (bpm: number) => void }) {
  const taps = useRef<number[]>([]);

  function tap() {
    const now = performance.now();
    taps.current = [...taps.current, now].slice(-12);
    const bpm = tapTempo(taps.current);
    if (bpm !== null) onTempo(bpm);
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      className="min-h-12 px-5"
      onClick={tap}
      title={vi.metronome.tapHint}
    >
      <Hand aria-hidden />
      {vi.metronome.tap}
    </Button>
  );
}
