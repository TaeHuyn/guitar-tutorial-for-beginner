import { describe, expect, it } from "vitest";
import { tapTempo } from "@/lib/audio/tap-tempo";

describe("tapTempo", () => {
  it("needs at least 4 taps", () => {
    expect(tapTempo([0, 500, 1000])).toBeNull();
  });

  it("4 taps 500 ms apart → 120 BPM", () => {
    expect(tapTempo([0, 500, 1000, 1500])).toBe(120);
  });

  it("ignores gaps longer than 2 s (starts a new tempo)", () => {
    expect(tapTempo([0, 500, 1000, 4000, 4600, 5200, 5800])).toBe(100);
  });

  it("uses at most the last 8 intervals", () => {
    const slow = [0, 1000, 2000, 3000];
    const fast = Array.from({ length: 9 }, (_, i) => 3500 + i * 500);
    expect(tapTempo([...slow, ...fast])).toBe(120);
  });

  it("clamps to 30–250", () => {
    expect(tapTempo([0, 100, 200, 300, 400])).toBe(250);
  });
});
