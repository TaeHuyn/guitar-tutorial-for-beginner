declare module "*.mdx" {
  import type { MDXProps } from "mdx/types";
  import type { JSX } from "react";

  /** Lesson metadata, validated by LessonMetaSchema at load time. */
  export const metadata: unknown;
  export default function MDXContent(props: MDXProps): JSX.Element;
}
