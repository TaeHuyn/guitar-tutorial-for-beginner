"use client";

import { noteToFrequency } from "@/lib/music/notes";
import { getAudioContext } from "./audio-context";
import { renderPluck } from "./karplus";
import { SAMPLE_CENTS_ERROR } from "./sample-tuning";

/**
 * Chord and note playback using recorded steel-string guitar notes (Musyng Kite soundfont,
 * CC BY-SA 3.0 — see public/audio/guitar/README.md), one file per note, fetched on demand and
 * cached (also by the service worker for offline use). If a recording cannot be loaded, the
 * exact-pitch synth (karplus.ts) is used instead. Each string is a voice: re-striking stops the
 * previous ring, like a guitar.
 *
 * Levels follow reference players: notes go out unprocessed through a master gain of about
 * −5 dB. A compressor is NOT used for loudness — the browser's compressor adds automatic make-up
 * gain, which made chords sound loud and dense. A transparent limiter only guards against clipping.
 */

/** Per-note level. Recordings peak around 0.5; the synth fallback is rendered at the same level. */
const NOTE_GAIN = 1;
const SYNTH_LEVEL = 0.5;
export const SAMPLE_BASE_URL = "/audio/guitar";
/** Master volume (0–1); ≈ −5 dB like the reference. */
let masterVolume = 0.56;
/**
 * Gap between strings in a strum. Reference players use ~30 ms; listening tests here preferred a
 * little more so each string stays audible (15 ms blurred notes together).
 */
export const STRUM_GAP = 0.04;
/** Gap between strings when playing the chord one string at a time. */
export const ARPEGGIO_GAP = 0.12;
interface Sound {
  buffer: AudioBuffer;
  /** Cents to apply at playback so the note is exactly in tune. */
  detune: number;
}
const cache = new Map<string, Promise<Sound>>();
let bus: { ctx: AudioContext; input: GainNode; master: GainNode } | null = null;
const voices = new Map<number, { src: AudioBufferSourceNode; gain: GainNode }>();

function getBus(ctx: AudioContext) {
  if (bus?.ctx === ctx) return bus.input;
  const input = ctx.createGain();
  const master = ctx.createGain();
  master.gain.value = masterVolume;
  // Brick-wall-ish limiter just below 0 dBFS: inactive at normal levels, so no make-up pumping.
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -1;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.1;
  input.connect(master).connect(limiter).connect(ctx.destination);
  bus = { ctx, input, master };
  return input;
}

const PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "C#3" → 49. */
export function noteToMidi(note: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(note);
  if (!m) throw new RangeError(`Invalid note: ${note}`);
  return (Number(m[3]) + 1) * 12 + PC[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
}

export function sampleUrl(note: string): string {
  return `${SAMPLE_BASE_URL}/${noteToMidi(note)}.mp3`;
}

function synthBuffer(ctx: AudioContext, note: string): AudioBuffer {
  const data = renderPluck(noteToFrequency(note), ctx.sampleRate, {
    duration: 4,
    level: SYNTH_LEVEL,
  });
  const buf = ctx.createBuffer(1, data.length, ctx.sampleRate);
  buf.copyToChannel(data, 0);
  return buf;
}

async function loadBuffer(ctx: AudioContext, note: string): Promise<Sound> {
  try {
    const res = await fetch(sampleUrl(note));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await ctx.decodeAudioData(await res.arrayBuffer());
    return { buffer, detune: -(SAMPLE_CENTS_ERROR[noteToMidi(note)] ?? 0) };
  } catch {
    return { buffer: synthBuffer(ctx, note), detune: 0 };
  }
}

function bufferFor(ctx: AudioContext, note: string): Promise<Sound> {
  const key = `${note}@${ctx.sampleRate}`;
  let buf = cache.get(key);
  if (!buf) {
    buf = loadBuffer(ctx, note);
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

function startVoice(ctx: AudioContext, voice: number, sound: Sound, at: number) {
  stopVoice(ctx, voice, at);
  const src = ctx.createBufferSource();
  src.buffer = sound.buffer;
  src.detune.value = sound.detune;
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

/** Sets the master volume (0–1). */
export function setVolume(volume: number) {
  masterVolume = Math.min(1, Math.max(0, volume));
  bus?.master.gain.setTargetAtTime(masterVolume, bus.ctx.currentTime, 0.02);
}

/**
 * Plays chord notes low→high. strum: 30 ms apart; arpeggio: 120 ms apart (contracts/audio-modules.md).
 * `direction: "up"` plays high→low (up-strokes when demonstrating strum patterns).
 */
export async function playChord(
  notes: readonly string[],
  mode: StrumMode = "strum",
  direction: "down" | "up" = "down",
  options: { gapSeconds?: number } = {},
): Promise<void> {
  if (notes.length === 0) return;
  const ctx = await getAudioContext();
  const gap = options.gapSeconds ?? (mode === "strum" ? STRUM_GAP : ARPEGGIO_GAP);
  const buffers = await Promise.all(notes.map((n) => bufferFor(ctx, n)));
  const start = ctx.currentTime + 0.02;
  // Strings not in this chord stop ringing (they would be damped by the hand).
  for (const voice of [...voices.keys()]) if (voice >= notes.length) stopVoice(ctx, voice, start);
  const order = buffers.map((sound, i) => ({ sound, voice: i }));
  if (direction === "up") order.reverse();
  order.forEach(({ sound, voice }, i) => startVoice(ctx, voice, sound, start + i * gap));
}

/** Plays a single reference note, e.g. for ear tuning. */
export async function playNote(note: string): Promise<void> {
  const ctx = await getAudioContext();
  const sound = await bufferFor(ctx, note);
  startVoice(ctx, 100, sound, ctx.currentTime + 0.02);
}

/** Starts downloading the recordings for these notes so the first click plays instantly. */
export async function preload(notes: readonly string[]): Promise<void> {
  const ctx = await getAudioContext();
  await Promise.all(notes.map((n) => bufferFor(ctx, n)));
}

/** Stops everything that is ringing. */
export async function stopAll(): Promise<void> {
  const ctx = await getAudioContext();
  for (const voice of [...voices.keys()]) stopVoice(ctx, voice, ctx.currentTime);
}
