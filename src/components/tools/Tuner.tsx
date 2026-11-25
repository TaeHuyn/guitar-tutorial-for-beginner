"use client";

import { useEffect, useState } from "react";
import { Mic, MicOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTuner } from "@/hooks/useTuner";
import { vi } from "@/i18n/vi";
import { ReferenceTones } from "./ReferenceTones";
import { TunerGauge } from "./TunerGauge";

const QUIET_HINT_MS = 1500;

export function Tuner() {
  const { status, error, reading, quietSince, start, stop } = useTuner();
  const [now, setNow] = useState(0);

  // Re-render periodically while quiet so the "pluck harder" hint can appear.
  useEffect(() => {
    if (quietSince === null) return;
    const t = setTimeout(() => setNow(performance.now()), QUIET_HINT_MS + 50);
    return () => clearTimeout(t);
  }, [quietSince]);

  const showQuietHint =
    status === "listening" && quietSince !== null && now - quietSince > QUIET_HINT_MS;
  const errorText =
    error === "permission-denied"
      ? vi.tuner.denied
      : error === "no-microphone"
        ? vi.tuner.noMic
        : vi.tuner.unsupported;

  return (
    <div className="space-y-6">
      {status !== "listening" && (
        <section className="bg-card rounded-2xl border p-5" data-mic-explainer>
          <div className="flex items-start gap-3">
            <ShieldCheck aria-hidden className="text-success mt-0.5 size-6 shrink-0" />
            <div>
              <h2 className="font-semibold">{vi.tuner.micTitle}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{vi.tuner.micBody}</p>
            </div>
          </div>
          <Button
            type="button"
            size="lg"
            className="mt-4 min-h-12 w-full sm:w-auto"
            onClick={start}
            disabled={status === "starting"}
          >
            <Mic aria-hidden />
            {vi.tuner.micStart}
          </Button>
          {status === "error" && (
            <p
              role="alert"
              className="text-destructive mt-3 flex items-center gap-2 text-sm font-medium"
            >
              <MicOff aria-hidden className="size-4" />
              {errorText}
            </p>
          )}
        </section>
      )}

      {status === "listening" && (
        <section className="bg-card rounded-2xl border p-5">
          <TunerGauge reading={reading} />
          <p role="status" className="text-muted-foreground mt-4 min-h-5 text-center text-sm">
            {showQuietHint ? vi.tuner.quiet : ""}
          </p>
          <div className="mt-2 flex justify-center">
            <Button type="button" variant="outline" onClick={stop}>
              {vi.tuner.stop}
            </Button>
          </div>
        </section>
      )}

      {(status === "error" || status === "idle") && <ReferenceTones />}
    </div>
  );
}
