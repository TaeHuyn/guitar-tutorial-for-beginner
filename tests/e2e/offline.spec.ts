import { expect, test } from "@playwright/test";

/** FR-034/035: installable, and the practice tools work offline after the first visit. Needs a production build. */
test.describe("PWA & offline", () => {
  test.skip(
    !process.env.E2E_BASE_URL && !process.env.E2E_PROD,
    "Run against `next start` (E2E_BASE_URL or E2E_PROD=1)",
  );

  test("serves a web app manifest with icons", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.ok()).toBe(true);
    const m = await res.json();
    expect(m.display).toBe("standalone");
    expect(m.lang).toBe("vi");
    expect(m.icons.length).toBeGreaterThanOrEqual(2);
  });

  test("tools and visited lessons open offline", async ({ page, context }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one browser run is enough");
    await page.goto("/");
    // `ready` resolves once the worker is active, i.e. after precaching finished.
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    // Visit a lesson while controlled by the worker so it is cached at runtime.
    await page.goto("/hoc/level-1/hop-am-g");
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    await page.waitForLoadState("networkidle");

    await context.setOffline(true);
    for (const [path, heading] of [
      ["/cong-cu/len-day", "Máy lên dây"],
      ["/cong-cu/may-dem-nhip", "Máy đếm nhịp"],
      ["/hop-am", "Thư viện hợp âm"],
      ["/hoc/level-1/hop-am-g", "Hợp âm G"],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    }
    // The metronome still runs without a network.
    await page.goto("/cong-cu/may-dem-nhip");
    await page.getByRole("button", { name: "Bắt đầu" }).click();
    await expect(page.getByRole("button", { name: "Dừng" })).toBeVisible();
    await context.setOffline(false);
  });
});
