"use client";

import { frequencyToNote, type PitchClass } from "@/lib/music/notes";
import {
  nearestGuitarString,
  tuningState,
  type StringNumber,
  type TuningState,
} from "@/lib/music/tuning";
import { getAudioContext } from "./audio-context";
import { FRAME_SIZE, MedianSmoother, detectPitch } from "./pitch-detector";

export type TunerReading =
  | {
      kind: "pitch";
      hz: number;
      note: PitchClass;
      octave: number;
      /** Cents from the nearest chromatic note. */
      cents: number;
      string: StringNumber;
      /** Cents from the nearest open guitar string — what the needle shows. */
      stringCents: number;
      state: TuningState;
    }
  | { kind: "quiet" };

export type TunerErrorCode = "permission-denied" | "no-microphone" | "unsupported";

export class TunerError extends Error {
  constructor(public readonly code: TunerErrorCode) {
    super(code);
  }
}

/** Hidden for longer than this → release the microphone (contracts/audio-modules.md). */
const HIDDEN_STOP_MS = 60_000;

/**
 * Microphone → AnalyserNode → pitchy, once per animation frame. Audio never leaves the
 * device: nothing here performs network I/O (Constitution IV, FR-017).
 */
export class Tuner {
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private raf = 0;
  private hiddenTimer: ReturnType<typeof setTimeout> | null = null;
  private smoother = new MedianSmoother(5);
  private listeners = new Set<(r: TunerReading) => void>();
  private onStop?: () => void;

  get running() {
    return this.stream !== null;
  }

  async start(onStop?: () => void): Promise<void> {
    if (this.running) return;
    this.onStop = onStop;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new TunerError("unsupported");
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        video: false,
      });
    } catch (e) {
      const name = (e as DOMException)?.name;
      if (name === "NotAllowedError" || name === "SecurityError")
        throw new TunerError("permission-denied");
      if (name === "NotFoundError" || name === "OverconstrainedError")
        throw new TunerError("no-microphone");
      throw new TunerError("unsupported");
    }

    const ctx = await getAudioContext();
    this.source = ctx.createMediaStreamSource(this.stream);
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = FRAME_SIZE;
    this.source.connect(this.analyser);
    this.smoother.reset();
    document.addEventListener("visibilitychange", this.onVisibility);
    this.loop(ctx.sampleRate);
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
    if (this.hiddenTimer) clearTimeout(this.hiddenTimer);
    this.hiddenTimer = null;
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.source?.disconnect();
    this.analyser?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.source = null;
    this.analyser = null;
    const cb = this.onStop;
    this.onStop = undefined;
    cb?.();
  }

  subscribe(cb: (r: TunerReading) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private onVisibility = () => {
    if (document.visibilityState === "hidden") {
      this.hiddenTimer = setTimeout(() => this.stop(), HIDDEN_STOP_MS);
    } else if (this.hiddenTimer) {
      clearTimeout(this.hiddenTimer);
      this.hiddenTimer = null;
    }
  };

  private loop(sampleRate: number) {
    const buffer = new Float32Array(FRAME_SIZE);
    const tick = () => {
      if (!this.analyser) return;
      this.analyser.getFloatTimeDomainData(buffer);
      const r = detectPitch(buffer, sampleRate);
      let reading: TunerReading;
      if (r.kind === "quiet") {
        this.smoother.reset();
        reading = { kind: "quiet" };
      } else {
        this.smoother.push(r.hz);
        const hz = this.smoother.value() ?? r.hz;
        const n = frequencyToNote(hz);
        const s = nearestGuitarString(hz);
        reading = {
          kind: "pitch",
          hz,
          note: n.note,
          octave: n.octave,
          cents: n.cents,
          string: s.stringNumber,
          stringCents: s.cents,
          state: tuningState(s.cents),
        };
      }
      this.listeners.forEach((l) => l(reading));
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
}
