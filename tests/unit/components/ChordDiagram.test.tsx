import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChordDiagram } from "@/components/chord/ChordDiagram";
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
    expect(container.querySelectorAll("line[data-string]")).toHaveLength(6);
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
    expect(screen.getByText("7fr")).toBeInTheDocument();
  });

  it("draws a barre", () => {
    const { container } = render(<ChordDiagram chord={Bm} />);
    expect(container.querySelector("[data-barre]")).not.toBeNull();
  });
});
