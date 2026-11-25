import Link from "next/link";
import { Dumbbell } from "lucide-react";
import type { Exercise as ExerciseData } from "@/content/schema";
import { vi } from "@/i18n/vi";
import { ExerciseMetronome } from "./ExerciseMetronome";

export function metronomeHref(ex: Pick<ExerciseData, "bpm" | "timeSignature">): string {
  const params = new URLSearchParams();
  if (ex.bpm) params.set("bpm", String(ex.bpm));
  params.set("nhip", ex.timeSignature ?? "4/4");
  return `/cong-cu/may-dem-nhip?${params.toString()}`;
}

/** Exercise card used in lessons (FR-002, FR-024). */
export function Exercise({ exercise }: { exercise: ExerciseData }) {
  return (
    <section
      data-exercise={exercise.id}
      aria-label={`${vi.learn.exercises}: ${exercise.instruction}`}
      className="not-prose border-primary/30 bg-primary/5 my-5 rounded-xl border-2 p-4"
    >
      <div className="flex items-start gap-3">
        <Dumbbell aria-hidden className="text-primary mt-1 size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{exercise.instruction}</p>
          <dl className="text-muted-foreground mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {exercise.bpm && (
              <div className="flex gap-1">
                <dt>{vi.exercise.bpm}:</dt>
                <dd className="text-foreground font-medium">{exercise.bpm}</dd>
              </div>
            )}
            {exercise.bpm && (
              <div className="flex gap-1">
                <dt>{vi.exercise.timeSignature}:</dt>
                <dd className="text-foreground font-medium">{exercise.timeSignature ?? "4/4"}</dd>
              </div>
            )}
            {exercise.durationMinutes && (
              <div className="flex gap-1">
                <dt>{vi.exercise.duration}:</dt>
                <dd className="text-foreground font-medium">
                  {exercise.durationMinutes} {vi.common.minutes}
                </dd>
              </div>
            )}
          </dl>
          {exercise.passCriterion && (
            <p className="mt-2 text-sm">
              <span className="font-medium">{vi.exercise.pass}:</span> {exercise.passCriterion}
            </p>
          )}
          {exercise.bpm && (
            <div className="flex flex-wrap items-center gap-x-4">
              <ExerciseMetronome
                bpm={exercise.bpm}
                timeSignature={exercise.timeSignature}
                instruction={exercise.instruction}
              />
              <Link
                href={metronomeHref(exercise)}
                className="text-primary mt-3 text-sm underline underline-offset-2"
                data-metronome-link
              >
                Mở trang máy đếm nhịp
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
