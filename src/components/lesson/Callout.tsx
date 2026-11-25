import type { ReactNode } from "react";
import { Lightbulb, TriangleAlert } from "lucide-react";

export function Tip({ children }: { children: ReactNode }) {
  return (
    <aside className="border-success/30 bg-success/5 my-4 flex gap-3 rounded-lg border p-4">
      <Lightbulb aria-hidden className="text-success mt-1 size-5 shrink-0" />
      <div className="[&>p]:my-0">
        <span className="sr-only">Mẹo: </span>
        {children}
      </div>
    </aside>
  );
}

export function Warning({ children }: { children: ReactNode }) {
  return (
    <aside className="border-warning/40 bg-warning/10 my-4 flex gap-3 rounded-lg border p-4">
      <TriangleAlert aria-hidden className="text-warning mt-1 size-5 shrink-0" />
      <div className="[&>p]:my-0">
        <span className="sr-only">Lưu ý: </span>
        {children}
      </div>
    </aside>
  );
}
