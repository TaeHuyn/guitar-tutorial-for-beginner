import { describe, expect, it } from "vitest";
import { GUITAR_STRINGS, nearestGuitarString, tuningState } from "@/lib/music/tuning";

describe("nearestGuitarString", () => {
  it("maps 110 Hz to string 5 (A2) with 0 cents", () => {
    const r = nearestGuitarString(110);
    expect(r.stringNumber).toBe(5);
    expect(r.name).toBe("A2");
    expect(r.cents).toBeCloseTo(0, 5);
  });

  it("reports a flat A string as negative cents", () => {
    const r = nearestGuitarString(107);
    expect(r.stringNumber).toBe(5);
    expect(r.cents).toBeLessThan(0);
  });

  it("finds every open string", () => {
    const hz = [82.41, 110, 146.83, 196, 246.94, 329.63];
    expect(hz.map((f) => nearestGuitarString(f).stringNumber)).toEqual([6, 5, 4, 3, 2, 1]);
  });

  it("picks the closest string for a very sharp low E (between E2 and A2)", () => {
    expect(nearestGuitarString(90).stringNumber).toBe(6);
    expect(nearestGuitarString(100).stringNumber).toBe(5);
  });

  it("exposes the 6 strings low → high", () => {
    expect(GUITAR_STRINGS.map((s) => s.name)).toEqual(["E2", "A2", "D3", "G3", "B3", "E4"]);
  });
});

describe("tuningState", () => {
  it("is in tune within ±5 cents", () => {
    expect(tuningState(0)).toBe("in-tune");
    expect(tuningState(4.9)).toBe("in-tune");
    expect(tuningState(-5)).toBe("in-tune");
  });

  it("is flat below −5 and sharp above +5", () => {
    expect(tuningState(-5.1)).toBe("flat");
    expect(tuningState(6)).toBe("sharp");
  });
});
