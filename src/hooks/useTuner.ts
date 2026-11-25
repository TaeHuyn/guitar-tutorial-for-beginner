"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tuner, TunerError, type TunerErrorCode, type TunerReading } from "@/lib/audio/tuner";

export type TunerStatus = "idle" | "starting" | "listening" | "error";

export function useTuner() {
  const tunerRef = useRef<Tuner | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<TunerStatus>("idle");
  const [error, setError] = useState<TunerErrorCode | null>(null);
  const [reading, setReading] = useState<TunerReading | null>(null);
  /** Time the signal has been continuously "quiet" (ms since last pitch). */
  const [quietSince, setQuietSince] = useState<number | null>(null);

  const start = useCallback(async () => {
    if (!tunerRef.current) tunerRef.current = new Tuner();
    const tuner = tunerRef.current;
    setStatus("starting");
    setError(null);
    try {
      unsubRef.current?.();
      unsubRef.current = tuner.subscribe((r) => {
        setReading(r);
        setQuietSince((prev) => (r.kind === "quiet" ? (prev ?? performance.now()) : null));
      });
      await tuner.start(() => {
        setStatus("idle");
        setReading(null);
      });
      setStatus("listening");
    } catch (e) {
      setStatus("error");
      setError(e instanceof TunerError ? e.code : "unsupported");
    }
  }, []);

  const stop = useCallback(() => {
    tunerRef.current?.stop();
  }, []);

  // Release the microphone when the component unmounts (or is hidden by <Activity>).
  useEffect(() => () => tunerRef.current?.stop(), []);

  return { status, error, reading, quietSince, start, stop };
}
