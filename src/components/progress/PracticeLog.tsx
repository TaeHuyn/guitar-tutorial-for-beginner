"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProgress } from "@/hooks/useProgress";
import { DurationError } from "@/lib/progress/progress-store";
import { addDays } from "@/lib/progress/streaks";
import { vi } from "@/i18n/vi";
import { formatDay } from "./Dashboard";

interface Props {
  lessons: { slug: string; title: string }[];
  /** Prefill from ?phut=&bpm=&bai= (e.g. the metronome's "log session" link). */
  initial?: { durationMinutes?: number; bpmReached?: number; lessonSlug?: string };
}

/** Practice-log form and 30-day history (FR-028). */
export function PracticeLog({ lessons, initial }: Props) {
  const { snapshot, logSession, deleteSession, today } = useProgress();
  const todayStr = today() ?? "";
  const [day, setDay] = useState<string>("");
  const [minutes, setMinutes] = useState(String(initial?.durationMinutes ?? 15));
  const [lesson, setLesson] = useState(initial?.lessonSlug ?? "");
  const [note, setNote] = useState("");
  const [bpm, setBpm] = useState(initial?.bpmReached ? String(initial.bpmReached) : "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const from = todayStr ? addDays(todayStr, -29) : "";
  const history = todayStr ? snapshot.sessions.filter((s) => s.practicedOn >= from) : [];
  const titleOf = new Map(lessons.map((l) => [l.slug, l.title]));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    const duration = Number(minutes);
    const bpmNum = bpm ? Number(bpm) : undefined;
    if (bpmNum !== undefined && (!Number.isInteger(bpmNum) || bpmNum < 30 || bpmNum > 250)) {
      setError("BPM từ 30 đến 250");
      return;
    }
    try {
      logSession({
        practicedOn: day || todayStr || undefined,
        durationMinutes: duration,
        lessonSlug: lesson || undefined,
        note: note.trim() || undefined,
        bpmReached: bpmNum,
      });
      setSaved(true);
      setNote("");
    } catch (err) {
      setError(err instanceof DurationError ? vi.practice.durationError : vi.common.errorGeneric);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={submit}
        className="bg-card grid gap-4 rounded-2xl border p-5 sm:grid-cols-2"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor="pl-day">{vi.practice.date}</Label>
          <Input
            id="pl-day"
            type="date"
            max={todayStr || undefined}
            value={day || todayStr}
            onChange={(e) => setDay(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pl-min">{vi.practice.duration}</Label>
          <Input
            id="pl-min"
            type="number"
            inputMode="numeric"
            min={1}
            max={600}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="h-11"
            aria-invalid={Boolean(error)}
            aria-describedby="pl-error"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="pl-lesson">{vi.practice.lesson}</Label>
          <select
            id="pl-lesson"
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            className="bg-background h-11 w-full rounded-lg border px-3"
          >
            <option value="">{vi.practice.lessonNone}</option>
            {lessons.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pl-bpm">{vi.practice.bpmReached}</Label>
          <Input
            id="pl-bpm"
            type="number"
            inputMode="numeric"
            min={30}
            max={250}
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pl-note">{vi.practice.note}</Label>
          <Input
            id="pl-note"
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-11"
          />
        </div>
        <p id="pl-error" role="alert" className="text-destructive min-h-5 text-sm sm:col-span-2">
          {error}
        </p>
        <p role="status" className="text-success text-sm sm:col-span-2">
          {saved ? vi.practice.saved : ""}
        </p>
        <Button type="submit" size="lg" className="min-h-12 sm:col-span-2">
          {vi.practice.submit}
        </Button>
      </form>

      <section>
        <h2 className="text-xl font-semibold">{vi.practice.history}</h2>
        {history.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-sm">{vi.dashboard.noSessions}</p>
        ) : (
          <ul className="bg-card mt-3 divide-y rounded-2xl border" data-practice-history>
            {history.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                <span className="w-24 tabular-nums">{formatDay(s.practicedOn)}</span>
                <span className="font-medium">
                  {s.durationMinutes} {vi.common.minutes}
                </span>
                <span className="text-muted-foreground min-w-0 flex-1 truncate">
                  {(s.lessonSlug && titleOf.get(s.lessonSlug)) || s.note || ""}
                  {s.bpmReached ? ` · ${s.bpmReached} BPM` : ""}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`${vi.common.delete} buổi tập ${formatDay(s.practicedOn)}`}
                  onClick={() => deleteSession(s.id)}
                >
                  <Trash2 aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
