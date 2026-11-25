import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("US1 — learning path without an account", () => {
  test("home → first level-0 lesson in under 30 seconds, no sign-in", async ({ page }) => {
    const started = Date.now();
    await page.goto("/");
    await page.getByRole("link", { name: "Bắt đầu học" }).first().click();
    await expect(page).toHaveURL(/\/hoc\/level-0\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(Date.now() - started).toBeLessThan(30_000);
    await expect(page).not.toHaveURL(/dang-nhap/);
  });

  test("every lesson has objective, practice time, an exercise and next navigation, up to the level-1 test", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.goto("/hoc");
    await page.getByRole("link", { name: "Bắt đầu học" }).first().click();

    const visited: string[] = [];
    for (let i = 0; i < 60; i++) {
      visited.push(new URL(page.url()).pathname);
      await expect(page.getByText("Mục tiêu", { exact: false }).first()).toBeVisible();
      await expect(page.getByText("Thời gian tập gợi ý", { exact: false }).first()).toBeVisible();
      await expect(page.locator("[data-exercise]").first()).toBeVisible();

      const next = page.getByRole("link", { name: /Bài tiếp theo/ });
      if ((await next.count()) === 0) break;
      const href = await next.first().getAttribute("href");
      expect(href).toBeTruthy();
      expect(visited).not.toContain(href);
      await page.goto(href!);
    }

    expect(visited.some((p) => p.startsWith("/hoc/level-0/"))).toBe(true);
    expect(visited.some((p) => p.startsWith("/hoc/level-1/"))).toBe(true);
    await expect(page.getByRole("heading", { name: /Kiểm tra lên cấp/ }).first()).toBeVisible();
    await expect(
      page
        .locator("[data-level-test] input[type=checkbox], [data-level-test] [role=checkbox]")
        .first(),
    ).toBeVisible();
  });

  test("chord lesson shows a playable chord diagram", async ({ page }) => {
    await page.goto("/hoc/level-1/hop-am-g");
    await expect(page.getByRole("img", { name: /Hợp âm G/ }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Đánh|Nghe/ }).first()).toBeVisible();
  });

  test("lesson page has no serious accessibility violations", async ({ page }) => {
    await page.goto("/hoc/level-1/hop-am-g");
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("song pages show capo, chords and an official link but no lyrics", async ({ page }) => {
    await page.goto("/hoc/level-1/bai-hat-phia-sau-mot-co-gai");
    await page.locator('a[href="/bai-hat/phia-sau-mot-co-gai"]').first().click();
    await expect(page).toHaveURL(/\/bai-hat\/phia-sau-mot-co-gai$/);
    await expect(page.getByText("Kẹp capo ngăn 1").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("img", { name: /Hợp âm Em/ }).first()).toBeVisible();
    const official = page.getByRole("link", { name: /Nghe bản chính thức/ });
    await expect(official).toHaveAttribute("href", /youtube\.com\/watch/);
    await expect(page.locator("[data-lyrics]")).toHaveCount(0);
  });
});
