import type { ComponentProps } from "react";

/**
 * Markdown tables in lessons. Wide tables scroll sideways inside this region on narrow screens;
 * it is focusable so keyboard users can scroll it too (WCAG scrollable-region-focusable).
 */
export function LessonTable(props: ComponentProps<"table">) {
  return (
    <div className="table-scroll" role="region" aria-label="Bảng" tabIndex={0}>
      <table {...props} />
    </div>
  );
}
