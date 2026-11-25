import type { Metadata } from "next";
import { Tuner } from "@/components/tools/Tuner";
import { vi } from "@/i18n/vi";

export const metadata: Metadata = { title: vi.tuner.title, description: vi.tuner.intro };

export default function TunerPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold tracking-tight">{vi.tuner.title}</h1>
      <p className="text-muted-foreground mt-2 mb-6">{vi.tuner.intro}</p>
      <Tuner />
    </div>
  );
}
