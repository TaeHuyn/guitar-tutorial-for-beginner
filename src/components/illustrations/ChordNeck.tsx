import { Fretboard } from "@/components/chord/Fretboard";
import type { Chord } from "@/content/schema";

/** The chord drawn on a real-looking neck, next to its chord box in lessons. */
export function ChordNeck({ chord }: { chord: Chord }) {
  return (
    <figure className="not-prose bg-card my-6 rounded-xl border p-3">
      <Fretboard chord={chord} />
      <figcaption className="text-muted-foreground mt-2 text-center text-sm">
        Hợp âm {chord.name} trên cần đàn (nhìn từ phía trước, dây 1 ở trên cùng).
      </figcaption>
    </figure>
  );
}
