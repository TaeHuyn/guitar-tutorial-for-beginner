import type { Chord } from "@/content/schema";
import { vi } from "@/i18n/vi";
import { cn } from "@/lib/utils";

interface Props {
  chord: Chord;
  voicingIndex?: number;
  /** "md" for lessons/detail pages, "sm" for grids and progressions. */
  size?: "sm" | "md" | "lg";
  className?: string;
  showName?: boolean;
}

const W = 120;
const LEFT = 22;
const RIGHT = 14;
const TOP = 30;
const FRET_H = 22;
const STRING_GAP = (W - LEFT - RIGHT) / 5;

/** Pure SVG chord box. Strings left→right are 6 (low E) → 1 (high E). */
export function ChordDiagram({
  chord,
  voicingIndex = 0,
  size = "md",
  className,
  showName = true,
}: Props) {
  const v = chord.voicings[voicingIndex] ?? chord.voicings[0];
  const base = v.baseFret ?? 1;
  const rel = (fret: number) => fret - base + 1;
  const rows = Math.max(4, ...v.frets.filter((f) => f > 0).map(rel));
  const H = TOP + rows * FRET_H + 12;
  const xOf = (stringIdx: number) => LEFT + stringIdx * STRING_GAP; // 0 = string 6
  const yOfFretCenter = (fret: number) => TOP + (rel(fret) - 0.5) * FRET_H;

  const barre = v.barre;
  const isOnBarre = (i: number) =>
    barre !== undefined &&
    v.frets[i] === barre.fret &&
    6 - i <= barre.fromString &&
    6 - i >= barre.toString &&
    v.fingers[i] === 1;

  const widths = { sm: "w-20", md: "w-32", lg: "w-44" } as const;

  return (
    <figure className={cn("inline-flex flex-col items-center", className)}>
      {showName && <figcaption className="mb-1 text-center font-semibold">{chord.name}</figcaption>}
      <svg
        role="img"
        aria-label={`${vi.chord.diagramLabel(chord.name)} — Hợp âm ${chord.name}`}
        viewBox={`0 0 ${W} ${H}`}
        className={cn(widths[size], "text-diagram-line h-auto")}
      >
        {/* Nut or base fret label */}
        {base === 1 ? (
          <rect
            x={LEFT - 1}
            y={TOP - 4}
            width={STRING_GAP * 5 + 2}
            height={4}
            fill="currentColor"
            rx={1}
          />
        ) : (
          <text
            x={LEFT - 6}
            y={TOP + FRET_H * 0.5 + 4}
            textAnchor="end"
            fontSize={10}
            fill="currentColor"
          >
            {`${base}fr`}
          </text>
        )}

        {/* Frets */}
        {Array.from({ length: rows + 1 }, (_, r) => (
          <line
            key={`fret-${r}`}
            x1={LEFT}
            x2={LEFT + STRING_GAP * 5}
            y1={TOP + r * FRET_H}
            y2={TOP + r * FRET_H}
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.6}
          />
        ))}

        {/* Strings */}
        {Array.from({ length: 6 }, (_, i) => (
          <line
            key={`string-${i}`}
            data-string={6 - i}
            x1={xOf(i)}
            x2={xOf(i)}
            y1={TOP}
            y2={TOP + rows * FRET_H}
            stroke="currentColor"
            strokeWidth={1 + (5 - i) * 0.15}
          />
        ))}

        {/* Open / muted markers */}
        {v.frets.map((f, i) =>
          f <= 0 ? (
            <text
              key={`marker-${i}`}
              data-marker
              data-string={6 - i}
              x={xOf(i)}
              y={TOP - 10}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="currentColor"
            >
              {f === 0 ? "O" : "X"}
            </text>
          ) : null,
        )}

        {/* Barre */}
        {barre && (
          <rect
            data-barre
            x={xOf(6 - barre.fromString) - 7}
            y={yOfFretCenter(barre.fret) - 7}
            width={xOf(6 - barre.toString) - xOf(6 - barre.fromString) + 14}
            height={14}
            rx={7}
            className="fill-diagram-dot"
          />
        )}

        {/* Finger dots */}
        {v.frets.map((f, i) =>
          f > 0 && !isOnBarre(i) ? (
            <g key={`dot-${i}`} data-dot data-string={6 - i} data-fret={f}>
              <circle cx={xOf(i)} cy={yOfFretCenter(f)} r={8} className="fill-diagram-dot" />
              <text
                x={xOf(i)}
                y={yOfFretCenter(f) + 4}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                className="fill-diagram-dot-foreground"
              >
                {v.fingers[i] || ""}
              </text>
            </g>
          ) : null,
        )}
      </svg>
    </figure>
  );
}
