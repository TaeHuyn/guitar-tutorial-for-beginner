import type { Chord } from "@/content/schema";
import { noteAt } from "@/lib/music/voicing";
import { stripOctave, toSolfege } from "@/lib/music/solfege";
import { cn } from "@/lib/utils";
import type { DiagramLabels } from "./ChordDiagram";

interface Props {
  chord: Chord;
  voicingIndex?: number;
  leftHanded?: boolean;
  labels?: DiagramLabels;
  className?: string;
  /** The horizontal scroll container (narrow screens scroll the neck). */
  ref?: React.Ref<HTMLDivElement>;
}

const NUT_W = 56; // label area on the headstock side
const FRET_W = 62;
const GAP = 34; // between strings
const PAD_Y = 22;
const BOARD_H = PAD_Y * 2 + GAP * 5;
const NUMBERS_H = 22;
const SINGLE_INLAYS = [3, 5, 7, 9, 15];

/**
 * Horizontal fretboard showing one voicing, as the player sees the neck from the front:
 * string 1 (high E) on top, headstock on the left for right-handed players and on the right
 * for left-handed players.
 */
function layout(chord: Chord, voicingIndex: number) {
  const v = chord.voicings[voicingIndex] ?? chord.voicings[0];
  const maxFret = Math.max(0, ...v.frets);
  const frets = Math.min(15, Math.max(12, maxFret + 2));
  return { v, frets, W: NUT_W + frets * FRET_W + 8 };
}

/**
 * Where (0 = left edge, 1 = right edge) the fingered part of the voicing sits, so a narrow
 * screen can scroll the neck to it.
 */
export function fretboardFocus(chord: Chord, voicingIndex: number, leftHanded: boolean): number {
  const { v, W } = layout(chord, voicingIndex);
  const fretted = v.frets.filter((f) => f > 0);
  const lo = fretted.length ? Math.min(...fretted) : 1;
  const hi = fretted.length ? Math.max(...fretted) : 1;
  // Include the nut for open-position chords so open/muted labels stay visible.
  const from = lo <= 4 ? 0 : NUT_W + (lo - 1) * FRET_W;
  const to = NUT_W + hi * FRET_W;
  const center = (from + to) / 2 / W;
  return leftHanded ? 1 - center : center;
}

export function Fretboard({
  chord,
  voicingIndex = 0,
  leftHanded = false,
  labels = "fingers",
  className,
  ref,
}: Props) {
  const { v, frets, W } = layout(chord, voicingIndex);
  const H = BOARD_H + NUMBERS_H;
  const X = (x: number) => (leftHanded ? W - x : x);
  const yOf = (stringNumber: number) => PAD_Y + (stringNumber - 1) * GAP;
  const fretCenter = (fret: number) => NUT_W + (fret - 0.5) * FRET_W;
  const noteLabel = (stringNumber: number, fret: number) =>
    toSolfege(stripOctave(noteAt(stringNumber, fret)));

  const barre = v.barre;
  const onBarre = (i: number) =>
    barre !== undefined &&
    v.frets[i] === barre.fret &&
    6 - i <= barre.fromString &&
    6 - i >= barre.toString &&
    v.fingers[i] === 1;

  return (
    <div
      ref={ref}
      // Scrolls sideways on narrow screens; focusable so keyboard users can scroll it too.
      tabIndex={0}
      role="region"
      aria-label={`Cần đàn hợp âm ${chord.name} (cuộn ngang được)`}
      className={cn(
        "focus-visible:ring-ring overflow-x-auto rounded-xl outline-none focus-visible:ring-2",
        className,
      )}
    >
      <svg
        role="img"
        aria-label={`Cần đàn: hợp âm ${chord.name}, thế bấm ${voicingIndex + 1}${leftHanded ? " (thuận tay trái)" : ""}`}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full min-w-[640px]"
        data-fretboard
        data-left-handed={leftHanded || undefined}
      >
        <defs>
          <linearGradient id="fb-wood" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ecd0a2" />
            <stop offset="55%" stopColor="#ddb27a" />
            <stop offset="100%" stopColor="#c99a5e" />
          </linearGradient>
          <linearGradient id="fb-string" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9c9c9" />
            <stop offset="50%" stopColor="#8c8c8c" />
            <stop offset="100%" stopColor="#5f5f5f" />
          </linearGradient>
        </defs>

        {/* Fingerboard and headstock/nut area */}
        <rect
          x={Math.min(X(NUT_W), X(W - 8))}
          y={0}
          width={W - 8 - NUT_W}
          height={BOARD_H}
          className="fill-muted"
        />
        <rect
          x={Math.min(X(0), X(NUT_W))}
          y={0}
          width={NUT_W}
          height={BOARD_H}
          fill="url(#fb-wood)"
        />
        <rect
          x={Math.min(X(NUT_W - 6), X(NUT_W))}
          y={0}
          width={6}
          height={BOARD_H}
          fill="#f6f1e6"
          stroke="#b89a6c"
          strokeWidth={0.5}
        />

        {/* Fret wires */}
        {Array.from({ length: frets }, (_, f) => (
          <line
            key={`fret-${f}`}
            x1={X(NUT_W + (f + 1) * FRET_W)}
            x2={X(NUT_W + (f + 1) * FRET_W)}
            y1={0}
            y2={BOARD_H}
            stroke="#9b9b9b"
            strokeWidth={3}
          />
        ))}

        {/* Position markers (inlays) */}
        {SINGLE_INLAYS.filter((f) => f <= frets).map((f) => (
          <circle
            key={`inlay-${f}`}
            data-inlay={f}
            cx={X(fretCenter(f))}
            cy={(yOf(3) + yOf(4)) / 2}
            r={9}
            className="fill-muted-foreground"
            opacity={0.45}
          />
        ))}
        {frets >= 12 &&
          [yOf(2) + GAP / 2, yOf(4) + GAP / 2].map((cy) => (
            <circle
              key={`inlay-12-${cy}`}
              data-inlay={12}
              cx={X(fretCenter(12))}
              cy={cy}
              r={9}
              className="fill-muted-foreground"
              opacity={0.45}
            />
          ))}

        {/* Strings: 1 (thin, top) → 6 (thick, bottom) */}
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <rect
            key={`string-${s}`}
            data-string-line={s}
            x={Math.min(X(NUT_W - 6), X(W - 8))}
            y={yOf(s) - (0.8 + s * 0.45) / 2}
            width={W - 8 - (NUT_W - 6)}
            height={0.8 + s * 0.45}
            fill="url(#fb-string)"
          />
        ))}

        {/* Fret numbers */}
        {[1, 3, 5, 7, 9, 12, 15]
          .filter((f) => f <= frets)
          .map((f) => (
            <text
              key={`num-${f}`}
              x={X(fretCenter(f))}
              y={BOARD_H + 16}
              textAnchor="middle"
              fontSize={12}
              className="fill-muted-foreground"
            >
              {f}
            </text>
          ))}

        {/* Open / muted strings, labelled on the nut */}
        {v.frets.map((f, i) => {
          const s = 6 - i;
          if (f > 0) return null;
          return f < 0 ? (
            <g key={`marker-${s}`} data-marker data-string={s} aria-hidden>
              <path
                d={`M ${X(NUT_W / 2 - 8)} ${yOf(s) - 8} L ${X(NUT_W / 2 + 8)} ${yOf(s) + 8} M ${X(NUT_W / 2 + 8)} ${yOf(s) - 8} L ${X(NUT_W / 2 - 8)} ${yOf(s) + 8}`}
                stroke="#c0392b"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </g>
          ) : (
            <text
              key={`marker-${s}`}
              data-marker
              data-string={s}
              x={X(NUT_W / 2 - 3)}
              y={yOf(s) + 6}
              textAnchor="middle"
              fontSize={labels === "notes" ? 15 : 17}
              fontWeight={600}
              fill="#4a3218"
            >
              {labels === "notes" ? noteLabel(s, 0) : "O"}
            </text>
          );
        })}

        {/* Barre: a vertical bar across the strings it holds */}
        {barre && (
          <g data-barre>
            <rect
              x={X(fretCenter(barre.fret)) - 16}
              y={yOf(barre.toString) - 16}
              width={32}
              height={yOf(barre.fromString) - yOf(barre.toString) + 32}
              rx={16}
              className="fill-diagram-dot"
            />
            {labels === "fingers" && (
              <text
                x={X(fretCenter(barre.fret))}
                y={(yOf(barre.toString) + yOf(barre.fromString)) / 2 + 6}
                textAnchor="middle"
                fontSize={17}
                fontWeight={600}
                className="fill-diagram-dot-foreground"
              >
                1
              </text>
            )}
          </g>
        )}

        {/* Finger dots */}
        {v.frets.map((f, i) => {
          if (f <= 0) return null;
          const s = 6 - i;
          const barred = onBarre(i);
          if (barred && labels === "fingers") return null;
          return (
            <g key={`dot-${s}`} data-dot={barred ? undefined : true} data-string={s} data-fret={f}>
              {!barred && (
                <circle cx={X(fretCenter(f))} cy={yOf(s)} r={15} className="fill-diagram-dot" />
              )}
              <text
                x={X(fretCenter(f))}
                y={yOf(s) + (labels === "notes" ? 5 : 6)}
                textAnchor="middle"
                fontSize={labels === "notes" ? 12 : 16}
                fontWeight={600}
                className="fill-diagram-dot-foreground"
              >
                {labels === "notes" ? noteLabel(s, f) : v.fingers[i] || ""}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
