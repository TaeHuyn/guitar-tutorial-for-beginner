import type { MDXComponents } from "mdx/types";
import { Tip, Warning } from "@/components/lesson/Callout";
import { LessonTable } from "@/components/lesson/LessonTable";

/**
 * Global MDX components. Components that need lesson data (Exercise, ChordDiagram…)
 * are passed per page via the `components` prop in src/app/hoc/[level]/[slug]/page.tsx.
 */
const components: MDXComponents = {
  Tip,
  Warning,
  table: LessonTable,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
