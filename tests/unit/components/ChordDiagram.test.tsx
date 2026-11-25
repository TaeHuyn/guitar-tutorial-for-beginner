import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChordDiagram } from "@/components/chord/ChordDiagram";
import { Fretboard } from "@/components/chord/Fretboard";
import { ChordSchema } from "@/content/schema";

const G = ChordSchema.parse({
  id: "g",
  name: "G",
  root: "G",
  quality: "major",
  voicings: [{ frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], difficulty: 2 }],
});

const C = ChordSchema.parse({
  id: "c",
  name: "C",
  root: "C",
  quality: "major",
  voicings: [{ frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], difficulty: 2 }],
});

const Bm = ChordSchema.parse({
  id: "bm",
  name: "Bm",
  root: "B",
  quality: "minor",
  voicings: [
    {
      frets: [-1, 2, 4, 4, 3, 2],
      fingers: [0, 1, 3, 4, 2, 1],
      barre: { fret: 2, fromString: 5, toString: 1 },
      baseFret: 1,
      difficulty: 4,
    },
    {
      frets: [7, 9, 9, 7, 7, 7],
      fingers: [1, 3, 4, 1, 1, 1],
      barre: { fret: 7, fromString: 6, toString: 1 },
      baseFret: 7,
      difficulty: 4,
    },
  ],
});

describe("ChordDiagram", () => {
  it("has an accessible name", () => {
    render(<ChordDiagram chord={G} />);
    expect(screen.getByRole("img", { name: /Hợp âm G/ })).toBeInTheDocument();
  });

  it("draws 6 strings", () => {
    const { container } = render(<ChordDiagram chord={G} />);
    expect(container.querySelectorAll("line[data-string-line]")).toHaveLength(6);
  });

  it("places finger dots on the right frets with finger numbers 2-1-3", () => {
    const { container } = render(<ChordDiagram chord={G} />);
    const dots = [...container.querySelectorAll("[data-dot]")];
    expect(
      dots.map((d) => `${d.getAttribute("data-string")}:${d.getAttribute("data-fret")}`),
    ).toEqual(["6:3", "5:2", "1:3"]);
    expect(dots.map((d) => d.textContent)).toEqual(["2", "1", "3"]);
  });

  it("marks open (O) and muted (X) strings", () => {
    const { container } = render(<ChordDiagram chord={C} />);
    const markers = [...container.querySelectorAll("[data-marker]")].map(
      (m) => `${m.getAttribute("data-string")}${m.textContent}`,
    );
    expect(markers).toEqual(["6X", "3O", "1O"]);
  });

  it("shows the base fret when the voicing starts above fret 1", () => {
    render(<ChordDiagram chord={Bm} voicingIndex={1} />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("draws a barre", () => {
    const { container } = render(<ChordDiagram chord={Bm} />);
    expect(container.querySelector("[data-barre]")).not.toBeNull();
  });

  it("mirrors strings for left-handed players", () => {
    const xOf = (c: HTMLElement) =>
      [...c.querySelectorAll("line[data-string-line]")].map((l) => [
        l.getAttribute("data-string-line"),
        Number(l.getAttribute("x1")),
      ]);
    const right = render(<ChordDiagram chord={G} />).container;
    const left = render(<ChordDiagram chord={G} leftHanded />).container;
    const r = Object.fromEntries(xOf(right));
    const l = Object.fromEntries(xOf(left));
    expect(r["6"]).toBeLessThan(r["1"]);
    expect(l["6"]).toBeGreaterThan(l["1"]);
  });

  it("puts the starting fret number on the outer side for each hand", () => {
    const right = render(<ChordDiagram chord={Bm} voicingIndex={1} />).container;
    const left = render(<ChordDiagram chord={Bm} voicingIndex={1} leftHanded />).container;
    const x = (c: HTMLElement) => Number(c.querySelector("[data-base-fret]")!.getAttribute("x"));
    expect(x(right)).toBeLessThan(30);
    expect(x(left)).toBeGreaterThan(100);
  });

  it("shows note names (solfège) instead of finger numbers", () => {
    const { container } = render(<ChordDiagram chord={G} labels="notes" />);
    const dots = [...container.querySelectorAll("[data-dot]")].map((d) => d.textContent);
    expect(dots).toEqual(["Sol", "Si", "Sol"]);
  });
});

describe("Fretboard", () => {
  it("draws 6 strings, inlays and the voicing's dots", () => {
    const { container } = render(<Fretboard chord={G} />);
    expect(container.querySelectorAll("[data-string-line]")).toHaveLength(6);
    expect(container.querySelector('[data-inlay="12"]')).not.toBeNull();
    const dots = [...container.querySelectorAll("[data-dot]")].map(
      (d) => `${d.getAttribute("data-string")}:${d.getAttribute("data-fret")}:${d.textContent}`,
    );
    expect(dots.sort()).toEqual(["1:3:3", "5:2:1", "6:3:2"]);
  });

  it("labels open strings with note names and muted strings with X", () => {
    const { container } = render(<Fretboard chord={C} labels="notes" />);
    const markers = [...container.querySelectorAll("[data-marker]")].map(
      (m) => `${m.getAttribute("data-string")}${m.textContent ?? ""}`,
    );
    expect(markers.sort()).toEqual(["1Mi", "3Sol", "6"]);
  });

  it("puts the headstock on the right for left-handed players", () => {
    const pos = (left: boolean) => {
      const { container } = render(<Fretboard chord={G} leftHanded={left} />);
      const dot = container.querySelector('[data-dot][data-string="6"] circle')!;
      return Number(dot.getAttribute("cx"));
    };
    expect(pos(false)).toBeLessThan(pos(true));
  });

  it("draws a barre as one bar", () => {
    const { container } = render(<Fretboard chord={Bm} voicingIndex={1} />);
    expect(container.querySelectorAll("[data-barre]")).toHaveLength(1);
  });
});
