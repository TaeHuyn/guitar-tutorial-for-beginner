import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

const PAGES = [
  "/",
  "/hoc",
  "/hoc/level-0/len-day-dan",
  "/hoc/level-1/quat-cha-co-ban-3",
  "/cong-cu/len-day",
  "/cong-cu/may-dem-nhip",
  "/hop-am",
  "/hop-am/c-sharp-m7",
  "/tong-quan",
  "/nhat-ky",
  "/dang-nhap",
  "/tai-khoan",
];

/** Constitution V: WCAG 2.1 AA, light and dark, mobile and desktop. */
for (const scheme of ["light", "dark"] as const) {
  test.describe(`a11y (${scheme})`, () => {
    test.use({ colorScheme: scheme });
    for (const path of PAGES) {
      test(`${path} has no serious/critical violations`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        const serious = results.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical",
        );
        expect(
          serious.map(
            (v) =>
              `${v.id}: ${v.nodes
                .map((n) => n.target.join(" "))
                .slice(0, 3)
                .join(" | ")}`,
          ),
        ).toEqual([]);
      });
    }
  });
}

test("metronome is fully keyboard operable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "keyboard test on desktop");
  await page.goto("/cong-cu/may-dem-nhip");
  await page.locator("body").press("Space");
  await expect(page.getByRole("button", { name: "Dừng" })).toBeVisible();
  await page.getByRole("button", { name: "Dừng" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Bắt đầu" })).toBeVisible();
});

test("no horizontal scrolling at 360px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile only");
  for (const path of PAGES) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
