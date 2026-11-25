"use client";

import { noteToFrequency } from "@/lib/music/notes";
import { getAudioContext } from "./audio-context";
import { renderPluck } from "./karplus";

/**
 * Chord and note playback using exact-pitch plucked-string samples rendered on the device
 * (karplus.ts). Each string is a voice: re-striking stops the previous ring, like a guitar.
 * A compressor on the bus keeps six strings from clipping.
 */

const NOTE_GAIN = 0.32;
const cache = new Map<string, AudioBuffer>();
let bus: { ctx: AudioContext; input: GainNode } | null = null;
const voices = new Map<number, { src: AudioBufferSourceNode; gain: GainNode }>();

function getBus(ctx: AudioContext) {
  if (bus?.ctx === ctx) return bus.input;
  const input = ctx.createGain();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 10;
  comp.ratio.value = 4;
  comp.attack.value = 0.003;
  comp.release.value = 0.25;
  input.connect(comp).connect(ctx.destination);
  bus = { ctx, input };
  return input;
}

function bufferFor(ctx: AudioContext, note: string): AudioBuffer {
  const key = `${note}@${ctx.sampleRate}`;
  let buf = cache.get(key);
  if (!buf) {
    const data = renderPluck(noteToFrequency(note), ctx.sampleRate, { duration: 3 });
    buf = ctx.createBuffer(1, data.length, ctx.sampleRate);
    buf.copyToChannel(data, 0);
    cache.set(key, buf);
  }
  return buf;
}

function stopVoice(ctx: AudioContext, voice: number, at: number) {
  const v = voices.get(voice);
  if (!v) return;
  v.gain.gain.cancelScheduledValues(at);
  v.gain.gain.setTargetAtTime(0, at, 0.015);
  v.src.stop(at + 0.1);
  voices.delete(voice);
}

function startVoice(ctx: AudioContext, voice: number, note: string, at: number) {
  stopVoice(ctx, voice, at);
  const src = ctx.createBufferSource();
  src.buffer = bufferFor(ctx, note);
  const gain = ctx.createGain();
  gain.gain.value = NOTE_GAIN;
  src.connect(gain).connect(getBus(ctx));
  src.start(at);
  src.onended = () => {
    if (voices.get(voice)?.src === src) voices.delete(voice);
  };
  voices.set(voice, { src, gain });
}

export type StrumMode = "strum" | "arpeggio";

/**
 * Plays chord notes low→high. strum: 15 ms apart; arpeggio: 60 ms apart (contracts/audio-modules.md).
 * `direction: "up"` plays high→low (up-strokes when demonstrating strum patterns).
 */
export async function playChord(
  notes: readonly string[],
  mode: StrumMode = "strum",
  direction: "down" | "up" = "down",
): Promise<void> {
  if (notes.length === 0) return;
  const ctx = await getAudioContext();
  const gap = mode === "strum" ? 0.015 : 0.06;
  const start = ctx.currentTime + 0.02;
  // Strings not in this chord stop ringing (they would be damped by the hand).
  for (const voice of [...voices.keys()]) if (voice >= notes.length) stopVoice(ctx, voice, start);
  const order = notes.map((note, i) => ({ note, voice: i }));
  if (direction === "up") order.reverse();
  order.forEach(({ note, voice }, i) => startVoice(ctx, voice, note, start + i * gap));
}

/** Plays a single reference note, e.g. for ear tuning. */
export async function playNote(note: string): Promise<void> {
  const ctx = await getAudioContext();
  startVoice(ctx, 100, note, ctx.currentTime + 0.02);
}

/** Stops everything that is ringing. */
export async function stopAll(): Promise<void> {
  const ctx = await getAudioContext();
  for (const voice of [...voices.keys()]) stopVoice(ctx, voice, ctx.currentTime);
}
