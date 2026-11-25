import { expect, test, type Page } from "@playwright/test";

async function beatSequence(page: Page, count: number): Promise<string[]> {
  const seen: string[] = [];
  const indicator = page.locator("[data-metronome] [data-beat]").first();
  const deadline = Date.now() + 15_000;
  while (seen.length < count && Date.now() < deadline) {
    const b = (await indicator.getAttribute("data-beat")) ?? "";
    if (b && b !== seen[seen.length - 1]) seen.push(b);
    await page.waitForTimeout(20);
  }
  return seen;
}

test.describe("US3 — metronome", () => {
  test("80 BPM 4/4 cycles beats 1-2-3-4 and keeps running when BPM changes", async ({ page }) => {
    await page.goto("/cong-cu/may-dem-nhip");
    const bpm = page.locator("[data-bpm-input]");
    await bpm.fill("80");
    await page.getByRole("radio", { name: "4/4" }).click();
    await page.getByRole("button", { name: "Bắt đầu" }).click();

    const seq = await beatSequence(page, 6);
    expect(seq.length).toBeGreaterThanOrEqual(6);
    // Consecutive beats advance by one, wrapping 4 → 1.
    for (let i = 1; i < seq.length; i++) {
      expect(Number(seq[i])).toBe((Number(seq[i - 1]) % 4) + 1);
    }

    await bpm.fill("100");
    const after = await beatSequence(page, 3);
    expect(after.length).toBeGreaterThanOrEqual(3);
    await expect(page.getByRole("button", { name: "Dừng" })).toBeVisible();
    await page.getByRole("button", { name: "Dừng" }).click();
  });

  test("tap tempo: 4 taps 500 ms apart ≈ 120 BPM", async ({ page }) => {
    await page.goto("/cong-cu/may-dem-nhip");
    const tap = page.getByRole("button", { name: "Gõ nhịp" });
    await expect(tap).toBeVisible();
    // Tap from inside the page so test-runner latency does not distort the 500 ms spacing.
    await tap.evaluate(
      (button) =>
        new Promise<void>((resolve) => {
          let n = 0;
          const press = () => {
            (button as HTMLButtonElement).click();
            if (++n < 4) setTimeout(press, 500);
            else resolve();
          };
          press();
        }),
    );
    await expect(page.locator("[data-bpm-input]")).not.toHaveValue("80");
    const value = Number(await page.locator("[data-bpm-input]").inputValue());
    expect(value).toBeGreaterThanOrEqual(112);
    expect(value).toBeLessThanOrEqual(128);
  });

  test("query string presets BPM and time signature", async ({ page }) => {
    await page.goto("/cong-cu/may-dem-nhip?bpm=60&nhip=3/4");
    await expect(page.locator("[data-bpm-input]")).toHaveValue("60");
    await expect(page.getByRole("radio", { name: "3/4" })).toHaveAttribute("aria-checked", "true");
  });

  test("invalid query falls back to defaults", async ({ page }) => {
    await page.goto("/cong-cu/may-dem-nhip?bpm=999&nhip=7/4");
    await expect(page.locator("[data-bpm-input]")).toHaveValue(/^\d+$/);
    expect(Number(await page.locator("[data-bpm-input]").inputValue())).toBeLessThanOrEqual(250);
  });

  test("exercise opens a metronome preset to its BPM", async ({ page }) => {
    await page.goto("/hoc/level-1/hop-am-g");
    await page.locator("[data-exercise='g-em-chuyen'] [data-metronome-open]").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-bpm-input]")).toHaveValue("60");
  });
});
