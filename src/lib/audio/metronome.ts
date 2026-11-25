"use client";

import { getAudioContext } from "./audio-context";
import {
  clampBpm,
  createSchedulerState,
  scheduleBeats,
  setSchedulerBeatsPerBar,
  setSchedulerBpm,
  type Accent,
  type BeatsPerBar,
  type SchedulerState,
} from "./scheduler";

export interface MetronomeOptions {
  bpm: number;
  beatsPerBar: BeatsPerBar;
  volume: number; // 0–1
}

export interface Beat {
  index: number;
  accent: Accent;
  /** AudioContext time the click sounds. */
  time: number;
}

const LOOK_AHEAD = 0.1; // seconds

/**
 * Timer-only worker: posts "tick" every 25 ms. Workers are not throttled like background tabs,
 * so scheduling keeps up. No sound is produced in the worker (Constitution IV). It is created
 * from an inline Blob so neither the bundler nor the service-worker cache is involved.
 */
const TICK_WORKER_SOURCE = `let t = null;
self.onmessage = (e) => {
  if (e.data === "start" && t === null) t = setInterval(() => self.postMessage("tick"), 25);
  else if (e.data === "stop" && t !== null) { clearInterval(t); t = null; }
};`;

function createTickWorker(): Worker {
  const url = URL.createObjectURL(new Blob([TICK_WORKER_SOURCE], { type: "text/javascript" }));
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}
const CLICK_FREQ: Record<Accent, number> = { strong: 1500, light: 1250, none: 1000 };

/**
 * Look-ahead metronome (research R6): a worker ticks every 25 ms; each tick schedules clicks
 * for the next 100 ms on the AudioContext clock, so timing is sample-accurate regardless of
 * main-thread jank or background-tab throttling.
 */
export class Metronome {
  private ctx: AudioContext | null = null;
  private worker: Worker | null = null;
  private state: SchedulerState | null = null;
  private master: GainNode | null = null;
  private queue: Beat[] = [];
  private listeners = new Set<(b: Beat) => void>();
  private raf = 0;
  private opts: MetronomeOptions;

  constructor(opts: Partial<MetronomeOptions> = {}) {
    this.opts = {
      bpm: clampBpm(opts.bpm ?? 80),
      beatsPerBar: opts.beatsPerBar ?? 4,
      volume: opts.volume ?? 0.8,
    };
  }

  get running() {
    return this.state !== null;
  }

  get options(): Readonly<MetronomeOptions> {
    return this.opts;
  }

  async start(opts: Partial<MetronomeOptions> = {}): Promise<void> {
    this.opts = { ...this.opts, ...opts, bpm: clampBpm(opts.bpm ?? this.opts.bpm) };
    if (this.running) return;
    this.ctx = await getAudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.opts.volume;
    this.master.connect(this.ctx.destination);
    this.state = createSchedulerState({
      bpm: this.opts.bpm,
      beatsPerBar: this.opts.beatsPerBar,
      startTime: this.ctx.currentTime + 0.05,
    });
    this.worker ??= createTickWorker();
    this.worker.onmessage = () => this.tick();
    this.worker.postMessage("start");
    this.tick();
    this.drawLoop();
  }

  stop(): void {
    this.worker?.postMessage("stop");
    cancelAnimationFrame(this.raf);
    this.master?.disconnect();
    this.master = null;
    this.state = null;
    this.queue = [];
  }

  dispose(): void {
    this.stop();
    this.worker?.terminate();
    this.worker = null;
  }

  setBpm(bpm: number): void {
    this.opts.bpm = clampBpm(bpm);
    if (this.state) this.state = setSchedulerBpm(this.state, this.opts.bpm);
  }

  setBeatsPerBar(n: BeatsPerBar): void {
    this.opts.beatsPerBar = n;
    if (this.state) this.state = setSchedulerBeatsPerBar(this.state, n);
  }

  setVolume(v: number): void {
    this.opts.volume = Math.min(1, Math.max(0, v));
    if (this.master && this.ctx)
      this.master.gain.setTargetAtTime(this.opts.volume, this.ctx.currentTime, 0.01);
  }

  onBeat(cb: (b: Beat) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private tick() {
    if (!this.ctx || !this.state) return;
    const { beats, next } = scheduleBeats(this.state, this.ctx.currentTime, LOOK_AHEAD);
    this.state = next;
    for (const b of beats) {
      this.click(b.time, b.accent);
      this.queue.push(b);
    }
  }

  private click(time: number, accent: Accent) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.frequency.value = CLICK_FREQ[accent];
    const peak = accent === "none" ? 0.6 : 1;
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(peak, time + 0.001);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    osc.connect(env).connect(this.master);
    osc.start(time);
    osc.stop(time + 0.035);
  }

  /** Notifies listeners when each scheduled beat actually sounds (for the beat lights). */
  private drawLoop() {
    const draw = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      while (this.queue.length && this.queue[0].time <= now) {
        const b = this.queue.shift()!;
        this.listeners.forEach((l) => l(b));
      }
      this.raf = requestAnimationFrame(draw);
    };
    this.raf = requestAnimationFrame(draw);
  }
}
