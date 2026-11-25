import { expect, test } from "@playwright/test";

/** Constitution IV / FR-017 / FR-036. */
test.describe("privacy", () => {
  test("the tuner never sends audio over the network", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        const ctx = new AudioContext();
        const dest = ctx.createMediaStreamDestination();
        const o = ctx.createOscillator();
        o.frequency.value = 110;
        o.connect(dest);
        o.start();
        return dest.stream;
      };
    });
    const bodies: { url: string; size: number; type: string }[] = [];
    page.on("request", (r) => {
      const post = r.postDataBuffer();
      if (post)
        bodies.push({ url: r.url(), size: post.length, type: r.headers()["content-type"] ?? "" });
    });
    await page.goto("/cong-cu/len-day");
    await page.getByRole("button", { name: /Bật micro/ }).click();
    await expect(page.locator("[data-tuner-note]")).toHaveText("A", { timeout: 10_000 });
    await page.waitForTimeout(2000);
    const suspicious = bodies.filter(
      (b) =>
        /audio|octet-stream|multipart/.test(b.type) ||
        (b.size > 2000 && !b.url.includes("/api/events")),
    );
    expect(suspicious).toEqual([]);
  });

  test("guests get no cookies", async ({ page, context }) => {
    for (const path of [
      "/",
      "/hoc/level-0/cau-tao-dan",
      "/hop-am",
      "/cong-cu/may-dem-nhip",
      "/tong-quan",
    ]) {
      await page.goto(path);
    }
    expect(await context.cookies()).toEqual([]);
  });
});
