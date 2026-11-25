import { expect, test } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

test.describe("US2 — tuner", () => {
  test("explains why the microphone is needed before asking", async ({ page }) => {
    await page.goto("/cong-cu/len-day");
    await expect(page.locator("[data-mic-explainer]")).toContainText("không gửi đi đâu");
    await expect(page.getByRole("button", { name: /Bật micro/ })).toBeVisible();
  });

  test("falls back to reference tones when the microphone is blocked", async ({ browser }) => {
    const context = await browser.newContext({ permissions: [] });
    const page = await context.newPage();
    // Simulate a denied permission regardless of browser flags.
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = () =>
        Promise.reject(new DOMException("denied", "NotAllowedError"));
    });
    await page.goto(`${BASE}/cong-cu/len-day`);
    await page.getByRole("button", { name: /Bật micro/ }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Không dùng được micro" }),
    ).toBeVisible();
    const tones = page.locator("[data-reference-tones]");
    await expect(tones).toBeVisible();
    await expect(tones.getByRole("button")).toHaveCount(6);
    await context.close();
  });

  test("detects A2 from a (synthetic) microphone and shows 'Chuẩn'", async ({ page }) => {
    // Headless Chromium cannot open a fake capture device reliably, so we replace getUserMedia
    // with a synthetic 110 Hz guitar-like stream. Everything after the mic (AnalyserNode,
    // pitch detection, smoothing, UI) runs for real.
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        const ctx = new AudioContext();
        await ctx.resume();
        const dest = ctx.createMediaStreamDestination();
        const gain = ctx.createGain();
        gain.gain.value = 0.3;
        [1, 2, 3].forEach((h, i) => {
          const o = ctx.createOscillator();
          o.frequency.value = 110 * h;
          const g = ctx.createGain();
          g.gain.value = [1, 0.5, 0.25][i];
          o.connect(g).connect(gain);
          o.start();
        });
        gain.connect(dest);
        return dest.stream;
      };
    });
    await page.goto("/cong-cu/len-day");
    await page.getByRole("button", { name: /Bật micro/ }).click();
    await expect(page.locator("[data-tuner-note]")).toHaveText("A", { timeout: 10_000 });
    await expect(page.locator('[data-tuner-state="in-tune"]')).toBeVisible();
    await expect(page.getByText("Chuẩn", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Dừng" }).click();
    await expect(page.getByRole("button", { name: /Bật micro/ })).toBeVisible();
  });
});
