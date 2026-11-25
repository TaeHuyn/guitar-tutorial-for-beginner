import Link from "next/link";
import type { Chord } from "@/content/schema";
import { voicingToNotes } from "@/lib/music/notes";
import { ChordDiagram } from "./ChordDiagram";
import { ChordPlayButton } from "./ChordPlayButton";

interface Props {
  chord: Chord;
  voicingIndex?: number;
  size?: "sm" | "md" | "lg";
  /** Link the diagram to the chord detail page. */
  linkToDetail?: boolean;
}

/** Diagram + play buttons. Server component; only the buttons hydrate. */
export function ChordCard({ chord, voicingIndex = 0, size = "md", linkToDetail = false }: Props) {
  const voicing = chord.voicings[voicingIndex] ?? chord.voicings[0];
  const notes = voicingToNotes(voicing.frets);
  const diagram = <ChordDiagram chord={chord} voicingIndex={voicingIndex} size={size} />;
  return (
    <div className="bg-card my-4 inline-flex flex-col items-center gap-2 rounded-xl border p-3">
      {linkToDetail ? (
        <Link href={`/hop-am/${chord.id}`} className="rounded-md focus-visible:ring-2">
          {diagram}
        </Link>
      ) : (
        diagram
      )}
      <ChordPlayButton notes={notes} chordName={chord.name} compact={size === "sm"} />
    </div>
  );
}
