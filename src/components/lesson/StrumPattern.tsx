"use client";

import { useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  /** e.g. "D-DU-UDU": D = down, U = up, x = muted hit, - = rest. Each char is an 8th note. */
  pattern: string;
  bpm?: number;
}

const LABEL: Record<string, string> = { D: "Xuống", U: "Lên", x: "Chặn tiếng", "-": "Nghỉ" };

/** Visual strumming pattern with an audible demo on a simple E-minor strum. */
export function StrumPattern({ pattern, bpm = 70 }: Props) {
  const steps = pattern.split("");
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const stopRef = useRef(false);

  async function play() {
    if (playing) {
      stopRef.current = true;
      return;
    }
    stopRef.current = false;
    setPlaying(true);
    try {
      const { playChord } = await import("@/lib/audio/pluck");
      const eighth = 60_000 / bpm / 2;
      // Em chord; up-strokes catch only the top four strings, high → low.
      const em = ["E2", "B2", "E3", "G3", "B3", "E4"];
      for (let bar = 0; bar < 2 && !stopRef.current; bar++) {
        for (let i = 0; i < steps.length && !stopRef.current; i++) {
          setActive(i);
          const s = steps[i];
          if (s === "D") void playChord(em, "strum", "down");
          if (s === "U") void playChord(em.slice(2), "strum", "up");
          if (s === "x") void playChord(["E2", "E3"], "strum");
          await new Promise((r) => setTimeout(r, eighth));
        }
      }
    } finally {
      setActive(null);
      setPlaying(false);
    }
  }

  return (
    <div className="not-prose bg-card my-4 rounded-xl border p-4" data-strum-pattern={pattern}>
      <ol className="flex flex-wrap justify-center gap-1" aria-label={`Điệu quạt ${pattern}`}>
        {steps.map((s, i) => (
          <li
            key={i}
            aria-label={`${i % 2 === 0 ? `Phách ${i / 2 + 1}` : "và"}: ${LABEL[s] ?? s}`}
            className={`flex w-9 flex-col items-center rounded-md py-1 text-lg ${
              active === i ? "bg-primary text-primary-foreground" : ""
            }`}
          >
            <span aria-hidden className="font-bold">
              {s === "D" ? "↓" : s === "U" ? "↑" : s === "x" ? "✕" : "·"}
            </span>
            <span aria-hidden className="text-muted-foreground text-xs">
              {i % 2 === 0 ? i / 2 + 1 : "&"}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex justify-center">
        <Button type="button" variant="secondary" onClick={play}>
          {playing ? <Square aria-hidden /> : <Play aria-hidden />}
          {playing ? "Dừng" : `Nghe mẫu (${bpm} BPM)`}
        </Button>
      </div>
    </div>
  );
}
