"use client";

import type { TunerReading } from "@/lib/audio/tuner";
import { GUITAR_STRINGS } from "@/lib/music/tuning";
import { vi } from "@/i18n/vi";
import { cn } from "@/lib/utils";

interface Props {
  reading: TunerReading | null;
}

const RANGE = 50; // cents shown on each side

/** Needle gauge −50…+50 cents, big note name, state text and the 6 strings (FR-014, FR-016). */
export function TunerGauge({ reading }: Props) {
  const pitch = reading?.kind === "pitch" ? reading : null;
  const cents = pitch ? Math.max(-RANGE, Math.min(RANGE, pitch.stringCents)) : 0;
  const angle = (cents / RANGE) * 60; // degrees
  const target = pitch ? GUITAR_STRINGS.find((s) => s.stringNumber === pitch.string) : null;
  const stateText = !pitch
    ? vi.tuner.listening
    : pitch.state === "in-tune"
      ? vi.tuner.inTune
      : pitch.state === "flat"
        ? vi.tuner.flat
        : vi.tuner.sharp;

  return (
    <div className="flex flex-col items-center" data-tuner-state={pitch?.state ?? "idle"}>
      <svg viewBox="0 0 240 140" className="w-full max-w-sm" aria-hidden>
        {/* in-tune zone ±5 cents */}
        <path
          d={arc(120, 125, 100, -6, 6)}
          className="stroke-success fill-none"
          strokeWidth={14}
          strokeLinecap="round"
          opacity={0.35}
        />
        <path d={arc(120, 125, 100, -60, 60)} className="stroke-border fill-none" strokeWidth={4} />
        {[-50, -25, 0, 25, 50].map((c) => {
          const a = ((c / RANGE) * 60 * Math.PI) / 180;
          return (
            <line
              key={c}
              x1={120 + 92 * Math.sin(a)}
              y1={125 - 92 * Math.cos(a)}
              x2={120 + 108 * Math.sin(a)}
              y2={125 - 108 * Math.cos(a)}
              className="stroke-muted-foreground"
              strokeWidth={c === 0 ? 3 : 2}
            />
          );
        })}
        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: "120px 125px",
            transition: "transform 90ms linear",
          }}
        >
          <line
            x1={120}
            y1={125}
            x2={120}
            y2={32}
            strokeWidth={4}
            strokeLinecap="round"
            className={cn(
              pitch?.state === "in-tune"
                ? "stroke-success"
                : pitch
                  ? "stroke-warning"
                  : "stroke-muted-foreground",
            )}
          />
        </g>
        <circle cx={120} cy={125} r={8} className="fill-foreground" />
      </svg>

      <p className="mt-2 text-6xl font-bold tabular-nums" data-tuner-note>
        {target ? target.name.replace(/\d/, "") : "—"}
      </p>
      <p className="text-muted-foreground mt-1 h-5 text-sm tabular-nums">
        {pitch
          ? `${pitch.hz.toFixed(1)} Hz · ${pitch.stringCents > 0 ? "+" : ""}${pitch.stringCents.toFixed(0)} cent`
          : ""}
      </p>
      <p
        aria-live="polite"
        className={cn(
          "mt-3 rounded-full px-4 py-1.5 text-lg font-semibold",
          pitch?.state === "in-tune" && "bg-success text-success-foreground",
          pitch && pitch.state !== "in-tune" && "bg-warning/20 text-foreground",
        )}
      >
        {stateText}
      </p>

      <ol className="mt-6 grid w-full max-w-sm grid-cols-6 gap-2" aria-label="6 dây đàn">
        {GUITAR_STRINGS.map((s) => {
          const active = pitch?.string === s.stringNumber;
          return (
            <li
              key={s.stringNumber}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex flex-col items-center rounded-lg border py-2",
                active && "border-primary bg-primary text-primary-foreground",
              )}
            >
              <span className="text-lg font-semibold">{s.name.replace(/\d/, "")}</span>
              <span className={cn("text-xs", active ? "opacity-90" : "text-muted-foreground")}>
                {vi.tuner.string} {s.stringNumber}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function arc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const p = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${cx + r * Math.sin(a)} ${cy - r * Math.cos(a)}`;
  };
  return `M ${p(fromDeg)} A ${r} ${r} 0 0 1 ${p(toDeg)}`;
}
