"use client";

import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/hooks/useProgress";
import { vi } from "@/i18n/vi";

/** Numbered badge that turns into a check mark once the lesson is completed. */
export function LessonCheck({ slug, index }: { slug: string; index: number }) {
  const { isCompleted } = useProgress();
  const done = isCompleted(slug);
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
        done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
      }`}
    >
      {done ? <Check aria-label={vi.learn.completed} className="size-4" /> : index}
    </span>
  );
}

/** Percentage of a level's lessons completed. */
export function LevelProgress({ slugs }: { slugs: string[] }) {
  const { isCompleted } = useProgress();
  const done = slugs.filter(isCompleted).length;
  const percent = slugs.length ? Math.round((done / slugs.length) * 100) : 0;
  return (
    <div className="mt-3 flex items-center gap-3">
      <Progress value={percent} aria-label={`Hoàn thành ${percent}%`} className="flex-1" />
      <span className="text-muted-foreground w-12 text-right text-sm tabular-nums">{percent}%</span>
    </div>
  );
}
