"use client";

import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";
import type { LevelTestCriterion } from "@/content/schema";
import { vi } from "@/i18n/vi";

interface Props {
  level: number;
  criteria: LevelTestCriterion[];
}

const key = (level: number) => `gt:v1:leveltest:${level}`;

function read(level: number): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(key(level)) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Self-assessment checklist that ends each level (FR-006). */
export function LevelTest({ level, criteria }: Props) {
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from per-device storage after mount
    setChecked(read(level));
  }, [level]);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(key(level), JSON.stringify(next));
      } catch {
        /* storage unavailable — keep state in memory only */
      }
      return next;
    });
  }

  const done = criteria.every((c) => checked.includes(c.id));

  return (
    <section data-level-test className="not-prose bg-card my-6 rounded-xl border p-4">
      <h2 className="text-lg font-semibold">{vi.learn.levelTestTitle}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{vi.learn.levelTestIntro}</p>
      <ul className="mt-4 space-y-2">
        {criteria.map((c) => (
          <li key={c.id}>
            <label className="hover:bg-muted flex min-h-11 cursor-pointer items-start gap-3 rounded-lg p-2">
              <input
                type="checkbox"
                className="mt-1 size-5 accent-[var(--primary)]"
                checked={checked.includes(c.id)}
                onChange={() => toggle(c.id)}
              />
              <span>
                {c.description}
                {c.target && <span className="font-semibold"> — {c.target}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p role="status" className="text-success mt-4 min-h-6 font-medium">
        {done && (
          <>
            <PartyPopper aria-hidden className="mr-2 inline size-5" />
            {vi.learn.levelTestReady(level + 1)}
          </>
        )}
      </p>
    </section>
  );
}
