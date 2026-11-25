import type { Metadata } from "next";
import { Suspense } from "react";
import { ChordLibrary } from "@/components/chord/ChordLibrary";
import { getAllChords } from "@/content/loader";
import { vi } from "@/i18n/vi";

export const metadata: Metadata = {
  title: vi.chord.libraryTitle,
  description: "84 hợp âm guitar có sơ đồ thế bấm và âm thanh mẫu.",
};

export default function ChordLibraryPage() {
  const chords = getAllChords();
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{vi.chord.libraryTitle}</h1>
      <p className="text-muted-foreground mt-2 mb-6">
        Tìm theo tên (không phân biệt hoa thường, dùng được cả ♯/♭ như C#, Db), hoặc lọc theo nốt
        gốc và loại.
      </p>
      <Suspense fallback={<div className="h-96" />}>
        <ChordLibrary chords={chords} />
      </Suspense>
    </div>
  );
}
