"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock, Flame, LogIn, Trophy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/hooks/useProgress";
import { nextLessonSlug } from "@/lib/progress/progress-store";
import { computeStreaks, minutesLastNDays } from "@/lib/progress/streaks";
import { vi } from "@/i18n/vi";
import { cn } from "@/lib/utils";

export interface PathItem {
  slug: string;
  title: string;
  level: number;
  href: string;
}

export interface LevelSummary {
  id: number;
  title: string;
  slugs: string[];
}

/** Dashboard (FR-029) — same view for guests (device data) and signed-in users (synced data). */
export function Dashboard({ path, levels }: { path: PathItem[]; levels: LevelSummary[] }) {
  const { ready, snapshot, user, accountsEnabled, today } = useProgress();
  const todayStr = today();
  if (!todayStr) return <div className="bg-muted h-96 animate-pulse rounded-2xl" aria-busy />;
  const nextSlug = nextLessonSlug(
    path.map((p) => p.slug),
    snapshot.completed,
  );
  const next = path.find((p) => p.slug === nextSlug);
  const days = [
    ...snapshot.sessions.map((s) => s.practicedOn),
    ...Object.values(snapshot.completed).map((c) => c.completedOn),
  ];
  const { current, longest } = computeStreaks(days, todayStr);
  const minutes = minutesLastNDays(snapshot.sessions, todayStr, 7);
  const recent = snapshot.sessions.slice(0, 10);
  const titleOf = new Map(path.map((p) => [p.slug, p.title]));

  return (
    <div className={cn("space-y-6", !ready && "opacity-60")} aria-busy={!ready}>
      {!user && accountsEnabled && (
        <Link
          href="/dang-nhap"
          className="hover:bg-muted flex items-center gap-3 rounded-2xl border border-dashed p-4 text-sm"
        >
          <LogIn aria-hidden className="text-primary size-5" />
          {vi.dashboard.guestCta}
        </Link>
      )}

      <section className="border-primary/40 bg-primary/5 rounded-2xl border-2 p-5" data-next-lesson>
        <h2 className="text-muted-foreground text-sm font-medium">{vi.dashboard.continue}</h2>
        {next ? (
          <>
            <p className="mt-1 text-xl font-semibold">{next.title}</p>
            <p className="text-muted-foreground text-sm">
              {vi.learn.level} {next.level}
            </p>
            <Link
              href={next.href}
              className={cn(buttonVariants({ size: "lg" }), "mt-3 min-h-12 px-5")}
            >
              {vi.dashboard.continue}
              <ArrowRight aria-hidden />
            </Link>
          </>
        ) : (
          <p className="mt-1 text-lg font-semibold">{vi.dashboard.allDone}</p>
        )}
      </section>

      <dl className="grid grid-cols-3 gap-3">
        <Stat
          icon={Clock}
          label={vi.dashboard.minutes7}
          value={`${minutes}`}
          unit={vi.common.minutes}
          testId="minutes7"
        />
        <Stat
          icon={Flame}
          label={vi.dashboard.currentStreak}
          value={`${current}`}
          unit={vi.dashboard.days}
          testId="streak"
        />
        <Stat
          icon={Trophy}
          label={vi.dashboard.longestStreak}
          value={`${longest}`}
          unit={vi.dashboard.days}
          testId="longest"
        />
      </dl>

      <section className="bg-card rounded-2xl border p-5">
        <h2 className="font-semibold">{vi.learn.pathTitle}</h2>
        <ul className="mt-3 space-y-3">
          {levels.map((l) => {
            const done = l.slugs.filter((s) => snapshot.completed[s]).length;
            const pct = l.slugs.length ? Math.round((done / l.slugs.length) * 100) : 0;
            return (
              <li key={l.id}>
                <div className="flex justify-between text-sm">
                  <span>
                    {vi.learn.level} {l.id}: {l.title}
                  </span>
                  <span className="text-muted-foreground tabular-nums" data-level-percent={l.id}>
                    {pct}%
                  </span>
                </div>
                <Progress
                  value={pct}
                  className="mt-1"
                  aria-label={`${vi.learn.level} ${l.id}: ${pct}%`}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-card rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{vi.dashboard.recent}</h2>
          <Link href="/nhat-ky" className="text-primary text-sm underline underline-offset-2">
            {vi.practice.submit}
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-muted-foreground mt-3 text-sm">{vi.dashboard.noSessions}</p>
        ) : (
          <ul className="mt-3 divide-y text-sm">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-2">
                <CalendarCheck aria-hidden className="text-muted-foreground size-4 shrink-0" />
                <span className="w-24 tabular-nums">{formatDay(s.practicedOn)}</span>
                <span className="font-medium">
                  {s.durationMinutes} {vi.common.minutes}
                </span>
                <span className="text-muted-foreground min-w-0 flex-1 truncate">
                  {(s.lessonSlug && titleOf.get(s.lessonSlug)) || s.note || ""}
                  {s.bpmReached ? ` · ${s.bpmReached} BPM` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  unit,
  testId,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  unit: string;
  testId: string;
}) {
  return (
    <div className="bg-card rounded-2xl border p-3 text-center">
      <dt className="text-muted-foreground flex flex-col items-center gap-1 text-xs">
        <Icon aria-hidden className="text-primary size-4" />
        {label}
      </dt>
      <dd className="mt-1">
        <span className="text-2xl font-bold tabular-nums" data-stat={testId}>
          {value}
        </span>{" "}
        <span className="text-muted-foreground text-xs">{unit}</span>
      </dd>
    </div>
  );
}

export function formatDay(day: string) {
  const [y, m, d] = day.split("-");
  return `${d}/${m}/${y}`;
}
