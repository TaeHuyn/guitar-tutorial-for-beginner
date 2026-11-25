import { expect, test } from "@playwright/test";

test.describe("US4 — chord library", () => {
  test("search 'bm' finds Bm with a play button on its page", async ({ page }) => {
    await page.goto("/hop-am");
    await page.getByRole("searchbox", { name: "Tìm hợp âm" }).fill("bm");
    const first = page.locator("[data-chord-results] [data-chord]").first();
    await expect(first).toHaveAttribute("data-chord", "Bm");
    await first.click();
    await expect(page).toHaveURL(/\/hop-am\/bm$/);
    await expect(page.getByRole("button", { name: /Đánh hợp âm Bm/ }).first()).toBeVisible();
  });

  test("flat names find the sharp chord", async ({ page }) => {
    await page.goto("/hop-am?q=Db");
    await expect(page.locator("[data-chord-results] [data-chord]").first()).toHaveAttribute(
      "data-chord",
      "C#",
    );
  });

  test("filter by root A shows all 7 qualities", async ({ page }) => {
    await page.goto("/hop-am");
    await page.getByRole("button", { name: "A", exact: true }).click();
    await expect(page.locator("[data-chord-results] [data-chord]")).toHaveCount(7);
    const names = await page
      .locator("[data-chord-results] [data-chord]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-chord")).sort());
    expect(names).toEqual(["A", "A7", "Am", "Am7", "Amaj7", "Asus2", "Asus4"]);
  });

  test("G links to its lesson", async ({ page }) => {
    await page.goto("/hop-am/g");
    await page.getByRole("link", { name: "Học hợp âm này" }).click();
    await expect(page).toHaveURL(/\/hoc\/level-1\/hop-am-g$/);
  });

  test("unknown chord shows 'not found' with suggestions", async ({ page }) => {
    await page.goto("/hop-am");
    await page.getByRole("searchbox", { name: "Tìm hợp âm" }).fill("H7");
    const empty = page.locator("[data-chord-empty]");
    await expect(empty).toContainText("Không tìm thấy");
    await expect(empty.getByRole("link", { name: "B7" })).toBeVisible();
  });
});
