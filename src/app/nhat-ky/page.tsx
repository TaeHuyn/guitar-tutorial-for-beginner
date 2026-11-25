import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeLogFromQuery } from "@/components/progress/PracticeLogFromQuery";
import { getPath } from "@/content/loader";
import { vi } from "@/i18n/vi";

export const metadata: Metadata = { title: vi.practice.title };

export default function PracticeLogPage() {
  const lessons = getPath().map((l) => ({ slug: l.slug, title: l.title }));
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{vi.practice.title}</h1>
      <Suspense fallback={<div className="h-96" />}>
        <PracticeLogFromQuery lessons={lessons} />
      </Suspense>
    </div>
  );
}
