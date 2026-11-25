"use client";

import { useEffect, useRef, useState } from "react";
import { Hand, Music2, Play, Rows3, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Chord } from "@/content/schema";
import { vi } from "@/i18n/vi";
import { voicingToNotes } from "@/lib/music/voicing";
import { cn } from "@/lib/utils";
import { ChordDiagram, type DiagramLabels } from "./ChordDiagram";
import { Fretboard, fretboardFocus } from "./Fretboard";
import { animatePluck, soundingStrings } from "./pluck-animation";

type View = "diagram" | "fretboard";
interface Prefs {
  view: View;
  labels: DiagramLabels;
  leftHanded: boolean;
}

const PREFS_KEY = "gt:v1:chord-view";
const DEFAULT_PREFS: Prefs = { view: "diagram", labels: "fingers", leftHanded: false };
const FINGER_NAMES = ["", "ngón trỏ (1)", "ngón giữa (2)", "ngón áp út (3)", "ngón út (4)"];

function readPrefs(): Prefs {
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") as Partial<Prefs>;
    return {
      view: raw.view === "fretboard" ? "fretboard" : "diagram",
      labels: raw.labels === "notes" ? "notes" : "fingers",
      leftHanded: raw.leftHanded === true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

/** Step-by-step fingering in words — also what screen-reader users get for the diagram. */
function describeVoicing(chord: Chord, index: number): string[] {
  const v = chord.voicings[index];
  const steps: string[] = [];
  if (v.barre) {
    steps.push(
      `Chặn ngón trỏ (1) ngang ngăn ${v.barre.fret}, từ dây ${v.barre.fromString} đến dây ${v.barre.toString}.`,
    );
  }
  v.frets.forEach((f, i) => {
    const s = 6 - i;
    const onBarre =
      v.barre &&
      f === v.barre.fret &&
      v.fingers[i] === 1 &&
      s <= v.barre.fromString &&
      s >= v.barre.toString;
    if (f > 0 && !onBarre) steps.push(`Dây ${s}, ngăn ${f}: ${FINGER_NAMES[v.fingers[i]]}.`);
  });
  const open = v.frets
    .map((f, i) => (f === 0 ? 6 - i : null))
    .filter((x): x is number => x !== null);
  const muted = v.frets
    .map((f, i) => (f < 0 ? 6 - i : null))
    .filter((x): x is number => x !== null);
  if (open.length) steps.push(`Gảy buông dây ${open.join(", ")}.`);
  if (muted.length) steps.push(`Không gảy dây ${muted.join(", ")}.`);
  return steps;
}

export function ChordExplorer({ chord }: { chord: Chord }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [selected, setSelected] = useState(0);
  const neckRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // On narrow screens the neck scrolls: bring the fingered frets into view.
  useEffect(() => {
    const el = neckRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const center = fretboardFocus(chord, selected, prefs.leftHanded) * el.scrollWidth;
    el.scrollLeft = Math.max(0, center - el.clientWidth / 2);
  }, [chord, selected, prefs.leftHanded, prefs.view]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate per-device preferences after mount
    setPrefs(readPrefs());
  }, []);

  function update(patch: Partial<Prefs>) {
    setPrefs((p) => {
      const next = { ...p, ...patch };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }

  async function play(index: number, mode: "strum" | "arpeggio" = "strum") {
    const { playChord } = await import("@/lib/audio/pluck");
    const { frets } = chord.voicings[index];
    const delays = await playChord(voicingToNotes(frets), mode);
    // Light up the drawing that is on screen for this voicing, string by string.
    const root = rootRef.current;
    const svg =
      prefs.view === "fretboard"
        ? root?.querySelector("[data-fretboard]")
        : root?.querySelector(`[data-voicing="${index}"] svg`);
    animatePluck(svg, soundingStrings(frets), delays);
  }

  function choose(index: number) {
    setSelected(index);
    void play(index);
  }

  return (
    <div data-chord-explorer ref={rootRef}>
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-2"
        role="toolbar"
        aria-label="Tùy chọn hiển thị hợp âm"
      >
        <Button type="button" size="lg" className="min-h-11 px-4" onClick={() => play(selected)}>
          <Play aria-hidden />
          Chơi hợp âm
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="min-h-11 px-4"
          onClick={() => play(selected, "arpeggio")}
        >
          <Waves aria-hidden />
          Rải từng dây
        </Button>

        <div role="radiogroup" aria-label="Kiểu xem" className="bg-muted flex rounded-lg p-1">
          {(
            [
              ["diagram", "Sơ đồ", Rows3],
              ["fretboard", "Cần đàn", Music2],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={prefs.view === value}
              onClick={() => update({ view: value })}
              className={cn(
                "flex min-h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium",
                prefs.view === value ? "bg-background shadow-sm" : "text-muted-foreground",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </button>
          ))}
        </div>

        <Button
          type="button"
          size="lg"
          variant={prefs.labels === "notes" ? "secondary" : "outline"}
          className="min-h-11 px-4"
          aria-pressed={prefs.labels === "notes"}
          onClick={() => update({ labels: prefs.labels === "notes" ? "fingers" : "notes" })}
        >
          {prefs.labels === "notes" ? "Hiện số ngón tay" : "Hiện tên nốt"}
        </Button>

        <label className="flex min-h-11 items-center gap-2 text-sm">
          <Hand aria-hidden className="text-muted-foreground size-4" />
          <span className="sr-only">Tay bấm hợp âm</span>
          <select
            value={prefs.leftHanded ? "left" : "right"}
            onChange={(e) => update({ leftHanded: e.target.value === "left" })}
            className="bg-background h-11 rounded-lg border px-3"
            aria-label="Tay bấm hợp âm"
          >
            <option value="right">Thuận tay phải</option>
            <option value="left">Thuận tay trái</option>
          </select>
        </label>
      </div>

      {/* Views */}
      {prefs.view === "diagram" ? (
        <ul
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          aria-label={vi.chord.voicing}
        >
          {chord.voicings.map((v, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => choose(i)}
                aria-pressed={selected === i}
                className={cn(
                  "bg-card hover:bg-muted flex w-full flex-col items-center rounded-xl border p-3 transition-colors",
                  selected === i && "border-primary ring-primary/40 ring-2",
                )}
                data-voicing={i}
              >
                <ChordDiagram
                  chord={chord}
                  voicingIndex={i}
                  size="lg"
                  showName={false}
                  leftHanded={prefs.leftHanded}
                  labels={prefs.labels}
                />
                <span className="text-muted-foreground mt-1 text-xs">
                  {vi.chord.voicing} {i + 1} · {vi.chord.difficulty} {"●".repeat(v.difficulty)}
                  {"○".repeat(5 - v.difficulty)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 space-y-4">
          <Fretboard
            ref={neckRef}
            chord={chord}
            voicingIndex={selected}
            leftHanded={prefs.leftHanded}
            labels={prefs.labels}
            className="border"
          />
          {chord.voicings.length > 1 && (
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={vi.chord.voicing}>
              {chord.voicings.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={selected === i}
                  onClick={() => choose(i)}
                  className={cn(
                    "bg-card hover:bg-muted rounded-lg border p-1",
                    selected === i && "border-primary ring-primary/40 ring-2",
                  )}
                  aria-label={`${vi.chord.voicing} ${i + 1}`}
                  data-voicing={i}
                >
                  <ChordDiagram
                    chord={chord}
                    voicingIndex={i}
                    size="sm"
                    showName={false}
                    leftHanded={prefs.leftHanded}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* How to play the selected voicing, in words */}
      <section className="bg-card mt-6 rounded-xl border p-4" aria-live="polite">
        <h2 className="font-semibold">
          Cách bấm — {vi.chord.voicing} {selected + 1}
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {describeVoicing(chord, selected).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
