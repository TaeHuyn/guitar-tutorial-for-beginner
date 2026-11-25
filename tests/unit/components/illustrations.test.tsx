import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CapoGuide } from "@/components/illustrations/CapoGuide";
import { ChordChartGuide } from "@/components/illustrations/ChordChartGuide";
import { ChordNeck } from "@/components/illustrations/ChordNeck";
import { FingerNumbers } from "@/components/illustrations/FingerNumbers";
import { GuitarAnatomy } from "@/components/illustrations/GuitarAnatomy";
import { NeckGrip, PickGrip, StrumGuide } from "@/components/illustrations/PickAndStrum";
import { TabGuide } from "@/components/illustrations/TabGuide";
import { TuningPegs } from "@/components/illustrations/TuningPegs";
import { ChordSchema } from "@/content/schema";

const G = ChordSchema.parse({
  id: "g",
  name: "G",
  root: "G",
  quality: "major",
  voicings: [{ frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], difficulty: 2 }],
});

const all = {
  GuitarAnatomy: <GuitarAnatomy />,
  FingerNumbers: <FingerNumbers />,
  TuningPegs: <TuningPegs />,
  ChordChartGuide: <ChordChartGuide />,
  TabGuide: <TabGuide />,
  PickGrip: <PickGrip />,
  StrumGuide: <StrumGuide />,
  NeckGrip: <NeckGrip />,
  CapoGuide: <CapoGuide />,
  ChordNeck: <ChordNeck chord={G} />,
};

describe("lesson illustrations", () => {
  for (const [name, el] of Object.entries(all)) {
    it(`${name} is an accessible image with a caption`, () => {
      const { container } = render(el);
      const svg = container.querySelector("svg[role=img]");
      expect(svg).not.toBeNull();
      expect(svg!.getAttribute("aria-label")!.length).toBeGreaterThan(20);
      expect(
        container.querySelector("figure.not-prose figcaption")?.textContent?.length,
      ).toBeGreaterThan(10);
    });
  }

  it("anatomy numbers the 8 parts from the lesson", () => {
    const { container } = render(<GuitarAnatomy />);
    const text = container.textContent ?? "";
    for (const part of [
      "Đầu đàn",
      "Khóa đàn",
      "Lược đàn",
      "Cần đàn",
      "Phím đàn",
      "Thùng đàn",
      "Lỗ thoát âm",
      "Ngựa đàn",
    ]) {
      expect(text).toContain(part);
    }
  });

  it("tuning pegs map every string to its note", () => {
    const text = render(<TuningPegs />).container.textContent ?? "";
    for (const s of [
      "Dây 6 · E (Mi)",
      "Dây 5 · A (La)",
      "Dây 4 · D (Rê)",
      "Dây 3 · G (Sol)",
      "Dây 2 · B (Si)",
      "Dây 1 · E (Mi)",
    ]) {
      expect(text).toContain(s);
    }
  });
});
