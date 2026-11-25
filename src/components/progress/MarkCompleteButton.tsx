"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/hooks/useProgress";
import { track } from "@/lib/analytics";
import { vi } from "@/i18n/vi";

/** Marks a lesson complete / incomplete (FR-027). Works for guests too (stored on device). */
export function MarkCompleteButton({ slug }: { slug: string }) {
  const { isCompleted, markComplete, unmarkComplete } = useProgress();
  const done = isCompleted(slug);

  return (
    <div
      className="bg-card mt-10 flex flex-col items-center gap-2 rounded-2xl border p-5 text-center"
      data-mark-complete
    >
      {done ? (
        <>
          <p className="text-success flex items-center gap-2 font-semibold">
            <CheckCircle2 aria-hidden className="size-5" />
            {vi.learn.completed}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={() => unmarkComplete(slug)}>
            {vi.learn.undoComplete}
          </Button>
        </>
      ) : (
        <Button
          type="button"
          size="lg"
          className="min-h-12 px-6"
          onClick={() => {
            markComplete(slug);
            track("lesson_complete");
          }}
        >
          <Circle aria-hidden />
          {vi.learn.markComplete}
        </Button>
      )}
    </div>
  );
}
