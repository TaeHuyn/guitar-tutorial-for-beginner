import type { Metadata } from "next";
import { Dashboard } from "@/components/progress/Dashboard";
import { getLevels, getPath, lessonHref } from "@/content/loader";
import { vi } from "@/i18n/vi";

export const metadata: Metadata = { title: vi.dashboard.title };

export default function DashboardPage() {
  const path = getPath().map((l) => ({
    slug: l.slug,
    title: l.title,
    level: l.level,
    href: lessonHref(l),
  }));
  const levels = getLevels()
    .filter((l) => !l.comingSoon)
    .map((l) => ({ id: l.id, title: l.title, slugs: l.lessons }));
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{vi.dashboard.title}</h1>
      <Dashboard path={path} levels={levels} />
    </div>
  );
}
