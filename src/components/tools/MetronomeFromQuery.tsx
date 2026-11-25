"use client";

import { useSearchParams } from "next/navigation";
import { MAX_BPM, MIN_BPM, type BeatsPerBar } from "@/lib/audio/scheduler";
import { Metronome } from "./Metronome";

const SIGNATURE_BEATS: Record<string, BeatsPerBar> = { "2/4": 2, "3/4": 3, "4/4": 4, "6/8": 6 };

/** Reads ?bpm=&nhip= from exercise links (FR-024); invalid values fall back to defaults. */
export function parseMetronomeQuery(params: URLSearchParams): {
  bpm?: number;
  beatsPerBar?: BeatsPerBar;
} {
  const out: { bpm?: number; beatsPerBar?: BeatsPerBar } = {};
  const bpm = Number(params.get("bpm"));
  if (Number.isInteger(bpm) && bpm >= MIN_BPM && bpm <= MAX_BPM) out.bpm = bpm;
  const sig = params.get("nhip");
  if (sig && SIGNATURE_BEATS[sig]) out.beatsPerBar = SIGNATURE_BEATS[sig];
  return out;
}

export function MetronomeFromQuery() {
  const params = useSearchParams();
  const initial = parseMetronomeQuery(new URLSearchParams(params.toString()));
  // Remount when the query changes so the initial values apply.
  return <Metronome key={params.toString()} initial={initial} />;
}
