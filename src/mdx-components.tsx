import type { MDXComponents } from "mdx/types";
import { Tip, Warning } from "@/components/lesson/Callout";

/**
 * Global MDX components. Components that need lesson data (Exercise, ChordDiagram…)
 * are passed per page via the `components` prop in src/app/hoc/[level]/[slug]/page.tsx.
 */
const components: MDXComponents = {
  Tip,
  Warning,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
