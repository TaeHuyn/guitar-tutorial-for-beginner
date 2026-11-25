/**
 * Pure look-ahead beat scheduler (research R6). No Web Audio here: given the current audio
 * clock time it returns the beats to schedule in the next `lookAhead` seconds, so it can be
 * tested with a fake clock.
 */

export type BeatsPerBar = 2 | 3 | 4 | 6;
export type Accent = "strong" | "light" | "none";

export interface SchedulerState {
  bpm: number;
  beatsPerBar: BeatsPerBar;
  /** Audio-clock time of the next beat to schedule. */
  nextBeatTime: number;
  /** Index (0-based) of that beat within the bar. */
  nextBeatIndex: number;
}

export interface ScheduledBeat {
  time: number;
  index: number;
  accent: Accent;
}

export const MIN_BPM = 30;
export const MAX_BPM = 250;
export const DEFAULT_BPM = 80;

export function clampBpm(bpm: number): number {
  if (!Number.isFinite(bpm)) return DEFAULT_BPM;
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)));
}

export function accentFor(index: number, beatsPerBar: BeatsPerBar): Accent {
  if (index === 0) return "strong";
  if (beatsPerBar === 6 && index === 3) return "light";
  return "none";
}

export function createSchedulerState(opts: {
  bpm: number;
  beatsPerBar: BeatsPerBar;
  startTime: number;
}): SchedulerState {
  return {
    bpm: clampBpm(opts.bpm),
    beatsPerBar: opts.beatsPerBar,
    nextBeatTime: opts.startTime,
    nextBeatIndex: 0,
  };
}

/** Changes tempo; the already-computed next beat keeps its time, spacing changes after it. */
export function setSchedulerBpm(state: SchedulerState, bpm: number): SchedulerState {
  return { ...state, bpm: clampBpm(bpm) };
}

export function setSchedulerBeatsPerBar(
  state: SchedulerState,
  beatsPerBar: BeatsPerBar,
): SchedulerState {
  return { ...state, beatsPerBar, nextBeatIndex: state.nextBeatIndex % beatsPerBar };
}

/** Max beats per call — guards against runaway loops. */
const MAX_BEATS_PER_CALL = 64;

export function scheduleBeats(
  state: SchedulerState,
  now: number,
  lookAhead: number,
): { beats: ScheduledBeat[]; next: SchedulerState } {
  let { nextBeatTime, nextBeatIndex } = state;
  const interval = 60 / state.bpm;

  // After a long stall (frozen tab, sleep), skip missed beats instead of firing them late.
  if (nextBeatTime < now - interval) {
    const missed = Math.ceil((now - nextBeatTime) / interval);
    nextBeatTime += missed * interval;
    nextBeatIndex = (nextBeatIndex + missed) % state.beatsPerBar;
  }

  const beats: ScheduledBeat[] = [];
  while (nextBeatTime < now + lookAhead && beats.length < MAX_BEATS_PER_CALL) {
    if (nextBeatTime >= now) {
      beats.push({
        time: nextBeatTime,
        index: nextBeatIndex,
        accent: accentFor(nextBeatIndex, state.beatsPerBar),
      });
    }
    nextBeatTime += interval;
    nextBeatIndex = (nextBeatIndex + 1) % state.beatsPerBar;
  }
  return { beats, next: { ...state, nextBeatTime, nextBeatIndex } };
}
