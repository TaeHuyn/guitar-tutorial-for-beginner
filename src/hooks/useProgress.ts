"use client";

import { useCallback } from "react";
import { useProgressContext } from "@/components/progress/ProgressProvider";

/** Progress for guests (on device) and signed-in users (synced) behind one API. */
export function useProgress() {
  const ctx = useProgressContext();
  const { store, snapshot } = ctx;

  const isCompleted = useCallback((slug: string) => Boolean(snapshot.completed[slug]), [snapshot]);

  return {
    ...ctx,
    isCompleted,
    markComplete: (slug: string) => ctx.withStore((s) => s.markComplete(slug)),
    unmarkComplete: (slug: string) => ctx.withStore((s) => s.unmarkComplete(slug)),
    logSession: (input: Parameters<NonNullable<typeof store>["logSession"]>[0]) => {
      if (!store) throw new Error("Progress store not ready");
      return store.logSession(input);
    },
    deleteSession: (id: string) => ctx.withStore((s) => s.deleteSession(id)),
    /** Local date of the learner, or null before the store is ready (never during prerender). */
    today: (): string | null => store?.today() ?? null,
  };
}
