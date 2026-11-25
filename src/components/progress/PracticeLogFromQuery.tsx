"use client";

import { useSearchParams } from "next/navigation";
import { PracticeLog } from "./PracticeLog";

export function PracticeLogFromQuery({ lessons }: { lessons: { slug: string; title: string }[] }) {
  const p = useSearchParams();
  const num = (k: string) => {
    const n = Number(p.get(k));
    return Number.isInteger(n) && n > 0 ? n : undefined;
  };
  const bai = p.get("bai") ?? undefined;
  return (
    <PracticeLog
      lessons={lessons}
      initial={{
        durationMinutes: num("phut"),
        bpmReached: num("bpm"),
        lessonSlug: bai && lessons.some((l) => l.slug === bai) ? bai : undefined,
      }}
    />
  );
}
