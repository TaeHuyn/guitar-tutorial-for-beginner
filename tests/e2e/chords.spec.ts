import { expect, test } from "./fixtures";

test.describe("US4 — chord library", () => {
  test("search 'bm' finds Bm with a play button on its page", async ({ page }) => {
    await page.goto("/hop-am");
    await page.getByRole("searchbox", { name: "Tìm hợp âm" }).fill("bm");
    const first = page.locator("[data-chord-results] [data-chord]").first();
    await expect(first).toHaveAttribute("data-chord", "Bm");
    await first.click();
    await expect(page).toHaveURL(/\/hop-am\/bm$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bm trên đàn guitar");
    await expect(page.getByRole("button", { name: "Chơi hợp âm" })).toBeVisible();
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

  test("chord page: switch to fretboard, show note names, left-handed, remembered", async ({
    page,
  }) => {
    await page.goto("/hop-am/c");
    const explorer = page.locator("[data-chord-explorer]");
    await expect(explorer.locator("[data-voicing]")).not.toHaveCount(0);

    // Diagram view shows finger numbers by default.
    await expect(explorer.locator("svg[role=img]").first()).toBeVisible();
    await page.getByRole("button", { name: "Hiện tên nốt" }).click();
    await expect(explorer.locator("[data-voicing='0'] [data-dot]").first()).toHaveText(/Đô|Mi|Sol/);

    await page.getByRole("radio", { name: "Cần đàn" }).click();
    const board = explorer.locator("[data-fretboard]");
    await expect(board).toBeVisible();
    await expect(board).toHaveAttribute("aria-label", /Cần đàn: hợp âm C/);

    await page.getByLabel("Tay bấm hợp âm").selectOption("left");
    await expect(board).toHaveAttribute("data-left-handed", "true");

    // Fingering is also written out in words.
    await expect(page.getByRole("heading", { name: /Cách bấm/ })).toBeVisible();
    await expect(page.getByText(/Dây 5, ngăn 3/)).toBeVisible();

    await page.reload();
    await expect(page.locator("[data-fretboard]")).toHaveAttribute("data-left-handed", "true");
    await expect(page.getByRole("button", { name: "Hiện số ngón tay" })).toBeVisible();
  });

  test("clicking another voicing selects it", async ({ page }) => {
    await page.goto("/hop-am/g");
    await page.locator("[data-voicing='1']").click();
    await expect(page.locator("[data-voicing='1']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: /Cách bấm — Thế bấm 2/ })).toBeVisible();
  });
});
