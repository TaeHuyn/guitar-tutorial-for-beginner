import type { ReactNode } from "react";

function toText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return toText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

/** Plain-text tablature. Scrolls horizontally inside the block, never the page. */
export function Tab({ children, title }: { children: ReactNode; title?: string }) {
  const text = toText(children).replace(/^\n+|\n+$/g, "");
  return (
    <figure className="my-4">
      {title && <figcaption className="mb-1 text-sm font-medium">{title}</figcaption>}
      <pre
        tabIndex={0}
        aria-label={title ? `Tab: ${title}` : "Tab"}
        className="bg-muted max-w-full overflow-x-auto rounded-lg border p-3 font-mono text-sm leading-6"
      >
        {text}
      </pre>
    </figure>
  );
}
