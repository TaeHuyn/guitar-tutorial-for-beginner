"use client";

import dynamic from "next/dynamic";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { BeatsPerBar } from "@/lib/audio/scheduler";
import { vi } from "@/i18n/vi";

// Loaded only when the dialog opens — keeps lesson pages within the JS budget.
const Metronome = dynamic(() => import("@/components/tools/Metronome").then((m) => m.Metronome), {
  ssr: false,
  loading: () => <div className="h-96" />,
});

const SIGNATURE_BEATS: Record<string, BeatsPerBar> = { "2/4": 2, "3/4": 3, "4/4": 4, "6/8": 6 };

/** "Practice with metronome" opens a pre-configured metronome on top of the lesson (FR-024). */
export function ExerciseMetronome({
  bpm,
  timeSignature = "4/4",
  instruction,
}: {
  bpm: number;
  timeSignature?: string;
  instruction: string;
}) {
  return (
    <Dialog>
      <DialogTrigger render={<Button className="mt-3 min-h-11" data-metronome-open />}>
        <Timer aria-hidden />
        {vi.exercise.practiceWithMetronome}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogTitle>{vi.metronome.title}</DialogTitle>
        <DialogDescription>{instruction}</DialogDescription>
        <Metronome compact initial={{ bpm, beatsPerBar: SIGNATURE_BEATS[timeSignature] ?? 4 }} />
      </DialogContent>
    </Dialog>
  );
}
