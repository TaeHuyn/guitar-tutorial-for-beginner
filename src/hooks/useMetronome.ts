"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Metronome } from "@/lib/audio/metronome";
import { clampBpm, type BeatsPerBar } from "@/lib/audio/scheduler";

const STORAGE_KEY = "gt:v1:metronome";

export interface MetronomeSettings {
  bpm: number;
  beatsPerBar: BeatsPerBar;
  volume: number;
}

const DEFAULTS: MetronomeSettings = { bpm: 80, beatsPerBar: 4, volume: 0.8 };

function readSaved(): Partial<MetronomeSettings> {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return typeof v === "object" && v ? v : {};
  } catch {
    return {};
  }
}

function save(s: MetronomeSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}

/**
 * @param initial values from the URL (exercise links) take precedence over saved settings.
 */
export function useMetronome(initial: Partial<MetronomeSettings> = {}) {
  const ref = useRef<Metronome | null>(null);
  const [settings, setSettings] = useState<MetronomeSettings>({ ...DEFAULTS, ...initial });
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState<number | null>(null);
  const hasInitial = initial.bpm !== undefined || initial.beatsPerBar !== undefined;

  // Restore saved settings after mount unless the page was opened with explicit values.
  useEffect(() => {
    if (hasInitial) return;
    const saved = readSaved();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from per-device storage after mount
    setSettings((s) => ({
      bpm: clampBpm(saved.bpm ?? s.bpm),
      beatsPerBar: ([2, 3, 4, 6] as const).includes(saved.beatsPerBar as BeatsPerBar)
        ? (saved.beatsPerBar as BeatsPerBar)
        : s.beatsPerBar,
      volume: typeof saved.volume === "number" ? saved.volume : s.volume,
    }));
  }, [hasInitial]);

  useEffect(() => () => ref.current?.dispose(), []);

  const update = useCallback((patch: Partial<MetronomeSettings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch, bpm: clampBpm(patch.bpm ?? s.bpm) };
      if (patch.bpm !== undefined) ref.current?.setBpm(next.bpm);
      if (patch.beatsPerBar !== undefined) ref.current?.setBeatsPerBar(next.beatsPerBar);
      if (patch.volume !== undefined) ref.current?.setVolume(next.volume);
      save(next);
      return next;
    });
  }, []);

  const start = useCallback(async () => {
    if (!ref.current) {
      ref.current = new Metronome();
      ref.current.onBeat((b) => setBeat(b.index));
    }
    await ref.current.start(settings);
    setRunning(true);
  }, [settings]);

  const stop = useCallback(() => {
    ref.current?.stop();
    setRunning(false);
    setBeat(null);
  }, []);

  const toggle = useCallback(() => (running ? stop() : void start()), [running, start, stop]);

  return { settings, update, running, beat, start, stop, toggle };
}
