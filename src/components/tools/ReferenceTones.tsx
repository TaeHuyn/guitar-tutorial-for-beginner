"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GUITAR_STRINGS } from "@/lib/music/tuning";
import { vi } from "@/i18n/vi";

/** Ear-tuning fallback: play each open string's reference note (FR-018). */
export function ReferenceTones() {
  async function play(note: string) {
    const { playNote } = await import("@/lib/audio/pluck");
    await playNote(note);
  }

  return (
    <section data-reference-tones className="bg-card rounded-2xl border p-5">
      <h2 className="text-lg font-semibold">{vi.tuner.referenceTitle}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{vi.tuner.referenceBody}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {GUITAR_STRINGS.map((s) => (
          <Button
            key={s.stringNumber}
            type="button"
            variant="secondary"
            className="h-16 flex-col gap-0"
            onClick={() => play(s.name)}
          >
            <span className="flex items-center gap-1 text-lg font-semibold">
              <Volume2 aria-hidden className="size-4" />
              {s.name.replace(/\d/, "")}
            </span>
            <span className="text-muted-foreground text-xs">
              {vi.tuner.string} {s.stringNumber}
            </span>
          </Button>
        ))}
      </div>
      <p className="text-muted-foreground mt-3 text-xs">{vi.tuner.mutedHint}</p>
    </section>
  );
}
