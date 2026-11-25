import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  /** Text for screen readers describing what the picture shows. */
  label: string;
  caption?: ReactNode;
  viewBox: string;
  children: ReactNode;
  className?: string;
  /** Max rendered width (Tailwind class). */
  width?: string;
}

/**
 * Frame for lesson illustrations: original SVG drawings that use theme colours, so they stay
 * sharp at any size and follow light/dark mode.
 */
export function Illustration({
  label,
  caption,
  viewBox,
  children,
  className,
  width = "max-w-md",
}: Props) {
  return (
    <figure className={cn("not-prose bg-card my-6 rounded-xl border p-4", className)}>
      <svg
        role="img"
        aria-label={label}
        viewBox={viewBox}
        className={cn("text-foreground mx-auto h-auto w-full", width)}
        fontFamily="inherit"
      >
        {children}
      </svg>
      {caption && (
        <figcaption className="text-muted-foreground mt-3 text-center text-sm">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Numbered badge used to point at parts of a drawing. */
export function Badge({ x, y, n }: { x: number; y: number; n: number | string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} className="fill-primary" />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        className="fill-primary-foreground"
      >
        {n}
      </text>
    </g>
  );
}

export const WOOD = { light: "#e9c896", mid: "#d4a56a", dark: "#9c6a3a", top: "#f0d9b0" };
