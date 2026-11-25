import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LessonCheck, LevelProgress } from "@/components/progress/PathProgress";
import { Badge } from "@/components/ui/badge";
import { getLessonsByLevel, getLevels, getPath, lessonHref } from "@/content/loader";
import { vi } from "@/i18n/vi";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: vi.learn.pathTitle };

export default function PathPage() {
  const levels = getLevels();
  const first = getPath()[0];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">{vi.learn.pathTitle}</h1>
      <p className="text-muted-foreground mt-2">{vi.learn.pathIntro}</p>
      {first && (
        <Link
          href={lessonHref(first)}
          className={cn(buttonVariants({ size: "lg" }), "mt-4 min-h-11 px-5")}
        >
          {vi.home.start}
        </Link>
      )}

      <ol className="mt-8 space-y-8">
        {levels.map((level) => {
          const lessons = getLessonsByLevel(level.id);
          return (
            <li key={level.id} aria-labelledby={`level-${level.id}`}>
              <section
                className={cn(
                  "bg-card rounded-2xl border p-5",
                  level.comingSoon && "border-dashed bg-transparent",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 id={`level-${level.id}`} className="text-xl font-semibold">
                    {vi.learn.level} {level.id}: {level.title}
                  </h2>
                  {level.comingSoon ? (
                    <Badge variant="outline">{vi.common.comingSoon}</Badge>
                  ) : (
                    <Badge variant="secondary">
                      {lessons.length} {vi.learn.lessons}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-sm">{level.description}</p>
                {!level.comingSoon && <LevelProgress slugs={lessons.map((l) => l.slug)} />}
                {lessons.length > 0 && (
                  <ol className="mt-4 divide-y">
                    {lessons.map((lesson, i) => (
                      <li key={lesson.slug}>
                        <Link
                          href={lessonHref(lesson)}
                          className="hover:bg-muted/50 flex min-h-14 items-center gap-3 py-2"
                        >
                          <LessonCheck slug={lesson.slug} index={i + 1} />
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium">{lesson.title}</span>
                            <span className="text-muted-foreground block text-xs">
                              {vi.learn.lessonType[lesson.type]} · {lesson.practiceMinutes}{" "}
                              {vi.common.minutes}
                            </span>
                          </span>
                          <ChevronRight aria-hidden className="text-muted-foreground size-4" />
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
