import { describe, expect, it } from "vitest";
import {
  clampBpm,
  createSchedulerState,
  scheduleBeats,
  setSchedulerBpm,
  type ScheduledBeat,
} from "@/lib/audio/scheduler";

/** Drives the scheduler like the worker would: ticks every ~25 ms with random jitter. */
function simulate(opts: {
  bpm: number;
  beatsPerBar: 2 | 3 | 4 | 6;
  seconds: number;
  jitterMs?: number;
  onTick?: (
    now: number,
    state: ReturnType<typeof createSchedulerState>,
  ) => ReturnType<typeof createSchedulerState>;
}) {
  let state = createSchedulerState({ bpm: opts.bpm, beatsPerBar: opts.beatsPerBar, startTime: 0 });
  const beats: ScheduledBeat[] = [];
  let seed = 1;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let now = 0;
  while (now < opts.seconds) {
    if (opts.onTick) state = opts.onTick(now, state);
    const r = scheduleBeats(state, now, 0.1);
    beats.push(...r.beats);
    state = r.next;
    now += 0.025 + (rand() * (opts.jitterMs ?? 0)) / 1000;
  }
  return beats.filter((b) => b.time < opts.seconds);
}

describe("scheduleBeats", () => {
  it("10 minutes at 120 BPM → exactly 1200 beats, 0.5 s apart (SC-004)", () => {
    const beats = simulate({ bpm: 120, beatsPerBar: 4, seconds: 600, jitterMs: 20 });
    expect(beats).toHaveLength(1200);
    for (let i = 1; i < beats.length; i++) {
      expect(Math.abs(beats[i].time - beats[i - 1].time - 0.5)).toBeLessThan(0.000001);
    }
  });

  it("accents beat 1 of every bar", () => {
    const beats = simulate({ bpm: 120, beatsPerBar: 4, seconds: 4 });
    expect(beats.map((b) => b.accent)).toEqual([
      "strong",
      "none",
      "none",
      "none",
      "strong",
      "none",
      "none",
      "none",
    ]);
    expect(beats.map((b) => b.index)).toEqual([0, 1, 2, 3, 0, 1, 2, 3]);
  });

  it("6/8 accents beat 1 strongly and beat 4 lightly", () => {
    const beats = simulate({ bpm: 120, beatsPerBar: 6, seconds: 3 });
    expect(beats.map((b) => b.accent)).toEqual(["strong", "none", "none", "light", "none", "none"]);
  });

  it("applies a BPM change from the next beat, without losing or duplicating beats", () => {
    let changed = false;
    const beats = simulate({
      bpm: 60,
      beatsPerBar: 4,
      seconds: 6,
      jitterMs: 15,
      onTick: (now, state) => {
        if (!changed && now >= 2.5) {
          changed = true;
          return setSchedulerBpm(state, 120);
        }
        return state;
      },
    });
    const times = beats.map((b) => b.time);
    expect(new Set(times).size).toBe(times.length);
    // 60 BPM beats at 0,1,2 then (already scheduled ≤ lookahead) 3, then 0.5 s spacing.
    const gaps = times.slice(1).map((t, i) => +(t - times[i]).toFixed(6));
    expect(gaps.slice(0, 3)).toEqual([1, 1, 1]);
    expect(gaps.slice(3).every((g) => g === 0.5)).toBe(true);
  });

  it("never schedules beats in the past after a long stall", () => {
    let state = createSchedulerState({ bpm: 120, beatsPerBar: 4, startTime: 0 });
    state = scheduleBeats(state, 0, 0.1).next;
    const r = scheduleBeats(state, 5, 0.1); // tab was frozen for 5 s
    expect(r.beats.every((b) => b.time >= 5)).toBe(true);
  });
});

describe("clampBpm", () => {
  it("keeps BPM within 30–250", () => {
    expect(clampBpm(10)).toBe(30);
    expect(clampBpm(300)).toBe(250);
    expect(clampBpm(99.6)).toBe(100);
    expect(clampBpm(Number.NaN)).toBe(80);
  });
});
