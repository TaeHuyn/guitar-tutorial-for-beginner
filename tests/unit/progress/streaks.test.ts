import { describe, expect, it } from "vitest";
import { addDays, computeStreaks, localDate, minutesLastNDays } from "@/lib/progress/streaks";

describe("computeStreaks", () => {
  it("3 days practised, 1 day skipped, today is day 5 → current 0, longest 3", () => {
    expect(computeStreaks(["2026-11-01", "2026-11-02", "2026-11-03"], "2026-11-05")).toEqual({
      current: 0,
      longest: 3,
    });
  });

  it("keeps the streak if today is not practised yet but yesterday was", () => {
    expect(computeStreaks(["2026-11-03", "2026-11-04"], "2026-11-05")).toEqual({
      current: 2,
      longest: 2,
    });
  });

  it("counts today", () => {
    expect(computeStreaks(["2026-11-04", "2026-11-05"], "2026-11-05").current).toBe(2);
  });

  it("counts several sessions on the same day once", () => {
    expect(computeStreaks(["2026-11-05", "2026-11-05", "2026-11-04"], "2026-11-05")).toEqual({
      current: 2,
      longest: 2,
    });
  });

  it("crosses a year boundary", () => {
    expect(computeStreaks(["2026-12-31", "2027-01-01"], "2027-01-01").current).toBe(2);
  });

  it("handles empty input", () => {
    expect(computeStreaks([], "2026-11-05")).toEqual({ current: 0, longest: 0 });
  });

  it("finds the longest run among several", () => {
    const days = [
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
      "2026-10-10",
      "2026-11-05",
    ];
    expect(computeStreaks(days, "2026-11-05")).toEqual({ current: 1, longest: 4 });
  });
});

describe("date helpers", () => {
  it("addDays works across months", () => {
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("localDate uses the given time zone", () => {
    const instant = new Date("2026-11-24T18:30:00Z"); // 01:30 next day in Hanoi
    expect(localDate("Asia/Ho_Chi_Minh", instant)).toBe("2026-11-25");
    expect(localDate("America/New_York", instant)).toBe("2026-11-24");
  });
});

describe("minutesLastNDays", () => {
  it("sums sessions within the last 7 days including today", () => {
    const sessions = [
      { practicedOn: "2026-11-05", durationMinutes: 20 },
      { practicedOn: "2026-10-30", durationMinutes: 15 },
      { practicedOn: "2026-10-29", durationMinutes: 99 }, // 7 days before → excluded
    ];
    expect(minutesLastNDays(sessions, "2026-11-05", 7)).toBe(35);
  });
});
