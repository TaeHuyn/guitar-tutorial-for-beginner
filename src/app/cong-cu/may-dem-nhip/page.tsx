import type { Metadata } from "next";
import { Suspense } from "react";
import { MetronomeFromQuery } from "@/components/tools/MetronomeFromQuery";
import { vi } from "@/i18n/vi";

export const metadata: Metadata = { title: vi.metronome.title };

export default function MetronomePage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{vi.metronome.title}</h1>
      {/* Query params (?bpm=60&nhip=3/4) are read on the client so the page stays static. */}
      <Suspense fallback={<div className="bg-card h-[520px] rounded-2xl border" />}>
        <MetronomeFromQuery />
      </Suspense>
    </div>
  );
}
