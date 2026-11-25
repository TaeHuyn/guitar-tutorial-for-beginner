import Link from "next/link";
import type { Chord } from "@/content/schema";
import { ChordDiagram } from "./ChordDiagram";

/** A row of small chord diagrams, each linking to its detail page. */
export function ChordProgression({ chords }: { chords: Chord[] }) {
  return (
    <ul className="my-4 flex flex-wrap gap-3" aria-label="Vòng hợp âm">
      {chords.map((c, i) => (
        <li key={`${c.id}-${i}`}>
          <Link
            href={`/hop-am/${c.id}`}
            className="bg-card hover:bg-muted block rounded-lg border p-2"
          >
            <ChordDiagram chord={c} size="sm" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
