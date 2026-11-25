"use client";

import { getAudioContext } from "./audio-context";

type ToneModule = typeof import("tone");
type PluckSynth = import("tone").PluckSynth;

let tonePromise: Promise<ToneModule> | null = null;
let voicesPromise: Promise<PluckSynth[]> | null = null;

/** Lazily loads Tone.js on first use so lesson pages stay inside the JS budget (research R4). */
async function loadTone(): Promise<ToneModule> {
  if (!tonePromise) {
    tonePromise = (async () => {
      const ctx = await getAudioContext();
      const Tone = await import("tone");
      Tone.setContext(ctx);
      await Tone.start();
      return Tone;
    })();
  }
  return tonePromise;
}

/**
 * Six Karplus-Strong plucked-string voices — one per guitar string. PluckSynth is
 * monophonic, so a small pool gives us full chords.
 */
async function getVoices(): Promise<PluckSynth[]> {
  if (!voicesPromise) {
    voicesPromise = (async () => {
      const Tone = await loadTone();
      const out = new Tone.Gain(0.6).toDestination();
      return Array.from({ length: 6 }, () => {
        const v = new Tone.PluckSynth({ attackNoise: 1.2, dampening: 3800, resonance: 0.96 });
        v.connect(out);
        return v;
      });
    })();
  }
  return voicesPromise;
}

export type StrumMode = "strum" | "arpeggio";

/** Plays chord notes low→high. strum: 15 ms apart; arpeggio: 60 ms apart (contracts/audio-modules.md). */
export async function playChord(
  notes: readonly string[],
  mode: StrumMode = "strum",
): Promise<void> {
  if (notes.length === 0) return;
  const Tone = await loadTone();
  const voices = await getVoices();
  const gap = mode === "strum" ? 0.015 : 0.06;
  const start = Tone.now() + 0.03;
  notes.slice(0, voices.length).forEach((note, i) => {
    voices[i].triggerAttack(note, start + i * gap);
  });
}

/** Plays a single reference note, e.g. for ear tuning. */
export async function playNote(note: string): Promise<void> {
  const Tone = await loadTone();
  const voices = await getVoices();
  voices[0].triggerAttack(note, Tone.now() + 0.03);
}
