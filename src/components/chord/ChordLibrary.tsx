"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Search } from "lucide-react";
import { QUALITIES, ROOTS } from "@/content/constants";
import type { Chord } from "@/content/schema";
import { filterChords, searchChords } from "@/lib/music/chord-search";
import { vi } from "@/i18n/vi";
import { cn } from "@/lib/utils";
import { ChordDiagram } from "./ChordDiagram";

const ROOT_LABEL: Record<string, string> = {
  "C#": "C♯/D♭",
  "D#": "D♯/E♭",
  "F#": "F♯/G♭",
  "G#": "G♯/A♭",
  "A#": "A♯/B♭",
};

export function ChordLibrary({ chords }: { chords: Chord[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const q = params.get("q") ?? "";
  const root = (ROOTS as readonly string[]).includes(params.get("goc") ?? "")
    ? (params.get("goc") as Chord["root"])
    : undefined;
  const quality = (QUALITIES as readonly string[]).includes(params.get("loai") ?? "")
    ? (params.get("loai") as Chord["quality"])
    : undefined;

  function setParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }

  const { results, suggestions } = useMemo(() => {
    const s = searchChords(chords, q);
    return { results: filterChords(s.results, { root, quality }), suggestions: s.suggestions };
  }, [chords, q, root, quality]);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">{vi.chord.searchLabel}</span>
        <Search
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setParam("q", e.target.value || undefined)}
          placeholder={vi.chord.searchPlaceholder}
          className="bg-card focus-visible:ring-ring h-12 w-full rounded-xl border pr-3 pl-11 text-base outline-none focus-visible:ring-2"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </label>

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-medium">{vi.chord.root}</legend>
        <div className="flex flex-wrap gap-2">
          <Chip active={!root} onClick={() => setParam("goc", undefined)}>
            {vi.chord.all}
          </Chip>
          {ROOTS.map((r) => (
            <Chip
              key={r}
              active={root === r}
              onClick={() => setParam("goc", root === r ? undefined : r)}
            >
              {ROOT_LABEL[r] ?? r}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-3">
        <legend className="mb-2 text-sm font-medium">{vi.chord.quality}</legend>
        <div className="flex flex-wrap gap-2">
          <Chip active={!quality} onClick={() => setParam("loai", undefined)}>
            {vi.chord.all}
          </Chip>
          {QUALITIES.map((t) => (
            <Chip
              key={t}
              active={quality === t}
              onClick={() => setParam("loai", quality === t ? undefined : t)}
            >
              {vi.chord.qualities[t]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <p role="status" className="text-muted-foreground mt-4 text-sm">
        {results.length > 0 ? `${results.length} hợp âm` : ""}
      </p>

      {results.length === 0 ? (
        <div className="mt-2 rounded-xl border border-dashed p-6 text-center" data-chord-empty>
          <p className="font-medium">{vi.chord.notFound}</p>
          {suggestions.length > 0 && (
            <p className="mt-2 text-sm">
              {vi.chord.didYouMean}{" "}
              {suggestions.map((s, i) => (
                <span key={s.id}>
                  {i > 0 && ", "}
                  <Link href={`/hop-am/${s.id}`} className="text-primary font-semibold underline">
                    {s.name}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>
      ) : (
        <ul
          className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6"
          data-chord-results
        >
          {results.map((c) => (
            <li key={c.id}>
              <Link
                href={`/hop-am/${c.id}`}
                className="bg-card hover:bg-muted flex flex-col items-center rounded-xl border p-2"
                data-chord={c.name}
              >
                <ChordDiagram chord={c} size="sm" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
