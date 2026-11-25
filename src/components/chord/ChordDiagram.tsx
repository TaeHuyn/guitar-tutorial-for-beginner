import type { Chord } from "@/content/schema";
import { vi } from "@/i18n/vi";
import { voicingToNotes } from "@/lib/music/voicing";
import { stripOctave, toSolfege } from "@/lib/music/solfege";
import { cn } from "@/lib/utils";

export type DiagramLabels = "fingers" | "notes";

interface Props {
  chord: Chord;
  voicingIndex?: number;
  /** "md" for lessons/detail pages, "sm" for grids and progressions. */
  size?: "sm" | "md" | "lg";
  className?: string;
  showName?: boolean;
  /** Mirror the diagram for left-handed players (string 1 on the left). */
  leftHanded?: boolean;
  /** Show finger numbers (default) or note names (Đô, Rê, Mi…) on the dots. */
  labels?: DiagramLabels;
}

const W = 132;
const SIDE = 24;
const TOP = 30;
const FRET_H = 24;
const STRING_GAP = (W - SIDE * 2) / 5;

/**
 * Pure SVG chord box. Right-handed: strings left→right are 6 (low E) → 1 (high E) and the
 * starting fret number sits on the left; left-handed mirrors both.
 */
export function ChordDiagram({
  chord,
  voicingIndex = 0,
  size = "md",
  className,
  showName = true,
  leftHanded = false,
  labels = "fingers",
}: Props) {
  const v = chord.voicings[voicingIndex] ?? chord.voicings[0];
  const base = v.baseFret ?? 1;
  const rel = (fret: number) => fret - base + 1;
  const rows = Math.max(4, ...v.frets.filter((f) => f > 0).map(rel));
  const H = TOP + rows * FRET_H + 10;
  // i = index in `frets` (0 = string 6). Left-handed players see string 1 on the left.
  const xOf = (i: number) => SIDE + (leftHanded ? 5 - i : i) * STRING_GAP;
  const yOfFretCenter = (fret: number) => TOP + (rel(fret) - 0.5) * FRET_H;

  const sounding = voicingToNotes(v.frets);
  const noteOf: (string | null)[] = [];
  let k = 0;
  v.frets.forEach((f) => noteOf.push(f < 0 ? null : toSolfege(stripOctave(sounding[k++]))));

  const barre = v.barre;
  const isOnBarre = (i: number) =>
    barre !== undefined &&
    v.frets[i] === barre.fret &&
    6 - i <= barre.fromString &&
    6 - i >= barre.toString &&
    v.fingers[i] === 1;

  const widths = { sm: "w-20", md: "w-32", lg: "w-40" } as const;
  const showFretNumber = base > 1;
  const fretLabelX = leftHanded ? W - SIDE + 8 : SIDE - 8;

  return (
    <figure className={cn("inline-flex flex-col items-center", className)}>
      {showName && <figcaption className="mb-1 text-center font-semibold">{chord.name}</figcaption>}
      <svg
        role="img"
        aria-label={`${vi.chord.diagramLabel(chord.name)} — Hợp âm ${chord.name}${leftHanded ? " (thuận tay trái)" : ""}`}
        viewBox={`0 0 ${W} ${H}`}
        className={cn(widths[size], "text-diagram-line h-auto")}
        data-left-handed={leftHanded || undefined}
      >
        {/* Nut (open position) or starting fret number */}
        {!showFretNumber && (
          <rect
            x={SIDE - 1}
            y={TOP - 4}
            width={STRING_GAP * 5 + 2}
            height={4}
            fill="currentColor"
            rx={1}
          />
        )}
        {showFretNumber && (
          <text
            data-base-fret
            x={fretLabelX}
            y={TOP + FRET_H * 0.5 + 4}
            textAnchor={leftHanded ? "start" : "end"}
            fontSize={11}
            fontWeight={600}
            fill="currentColor"
          >
            {base}
          </text>
        )}

        {/* Frets */}
        {Array.from({ length: rows + 1 }, (_, r) => (
          <line
            key={`fret-${r}`}
            x1={SIDE}
            x2={SIDE + STRING_GAP * 5}
            y1={TOP + r * FRET_H}
            y2={TOP + r * FRET_H}
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.55}
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
              fontWeight={700}
              fill="currentColor"
            >
              {f === 0 ? "O" : "X"}
            </text>
          ) : null,
        )}

        {/* Barre */}
        {barre && (
          <g data-barre>
            <rect
              x={Math.min(xOf(6 - barre.fromString), xOf(6 - barre.toString)) - 9}
              y={yOfFretCenter(barre.fret) - 9}
              width={Math.abs(xOf(6 - barre.toString) - xOf(6 - barre.fromString)) + 18}
              height={18}
              rx={9}
              className="fill-diagram-dot"
            />
            {labels === "fingers" && (
              <text
                x={(xOf(6 - barre.fromString) + xOf(6 - barre.toString)) / 2}
                y={yOfFretCenter(barre.fret) + 4}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                className="fill-diagram-dot-foreground"
              >
                1
              </text>
            )}
          </g>
        )}

        {/* Finger dots (and note names on barre strings when showing notes) */}
        {v.frets.map((f, i) => {
          if (f <= 0) return null;
          const onBarre = isOnBarre(i);
          if (onBarre && labels === "fingers") return null;
          const text = labels === "notes" ? noteOf[i] : String(v.fingers[i] || "");
          return (
            <g
              key={`dot-${i}`}
              data-dot={onBarre ? undefined : true}
              data-string={6 - i}
              data-fret={f}
            >
              {!onBarre && (
                <circle cx={xOf(i)} cy={yOfFretCenter(f)} r={9} className="fill-diagram-dot" />
              )}
              <text
                x={xOf(i)}
                y={yOfFretCenter(f) + (labels === "notes" ? 3 : 4)}
                textAnchor="middle"
                fontSize={labels === "notes" ? 7 : 10}
                fontWeight={600}
                className="fill-diagram-dot-foreground"
              >
                {text}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
