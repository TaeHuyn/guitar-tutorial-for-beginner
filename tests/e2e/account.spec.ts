import { expect, test, type Page } from "@playwright/test";

/**
 * US5. The guest part runs everywhere. The account part needs local Supabase
 * (`npx supabase start`, env vars in .env.local) and runs when E2E_SUPABASE=1.
 */

async function logSession(page: Page, minutes: string, bpm?: string) {
  await page.goto("/nhat-ky");
  await page.getByLabel("Thời lượng (phút)").fill(minutes);
  if (bpm) await page.getByLabel("BPM đạt được").fill(bpm);
  await page.getByRole("button", { name: "Ghi buổi tập" }).click();
}

test.describe("US5 — guest progress (on device)", () => {
  test("mark lessons complete, see them on the path and dashboard", async ({ page }) => {
    await page.goto("/hoc/level-0/cau-tao-dan");
    await page.getByRole("button", { name: "Đã học xong" }).click();
    await expect(page.locator("[data-mark-complete]").filter({ visible: true })).toContainText(
      "Đã hoàn thành",
    );

    await page.goto("/hoc/level-0/tu-the-cam-dan");
    await page.getByRole("button", { name: "Đã học xong" }).click();

    await page.goto("/hoc");
    await expect(page.getByLabel("Đã hoàn thành")).toHaveCount(2);

    await page.goto("/tong-quan");
    await expect(page.locator("[data-next-lesson]")).toContainText("Lên dây đàn");
    await expect(page.locator('[data-level-percent="0"]')).not.toHaveText("0%");
  });

  test("log a practice session; invalid durations are rejected in Vietnamese", async ({ page }) => {
    await logSession(page, "0");
    await expect(
      page.getByRole("alert").filter({ hasText: "Thời lượng phải từ 1 đến 600 phút" }),
    ).toBeVisible();

    await logSession(page, "20", "70");
    await expect(page.locator("[data-practice-history]")).toContainText("20 phút");
    await expect(page.locator("[data-practice-history]")).toContainText("70 BPM");

    await page.goto("/tong-quan");
    await expect(page.locator('[data-stat="minutes7"]')).toHaveText("20");
    await expect(page.locator('[data-stat="streak"]')).toHaveText("1");
  });

  test("progress survives a reload", async ({ page }) => {
    await page.goto("/hoc/level-0/doc-tab");
    await page.getByRole("button", { name: "Đã học xong" }).click();
    await page.reload();
    await expect(page.locator("[data-mark-complete]").filter({ visible: true })).toContainText(
      "Đã hoàn thành",
    );
  });
});

test.describe("US5 — account sync (requires local Supabase)", () => {
  test.skip(!process.env.E2E_SUPABASE, "Set E2E_SUPABASE=1 with `npx supabase start` running");
  const MAILPIT = process.env.E2E_MAILPIT_URL ?? "http://127.0.0.1:54324";

  async function signInWithMagicLink(page: Page, email: string) {
    await page.goto("/dang-nhap");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Gửi liên kết đăng nhập" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Kiểm tra hộp thư" })).toBeVisible();

    let link: string | undefined;
    for (let i = 0; i < 30 && !link; i++) {
      const list = await (
        await fetch(`${MAILPIT}/api/v1/search?query=to:${encodeURIComponent(email)}`)
      ).json();
      const id = list.messages?.[0]?.ID;
      if (id) {
        const msg = await (await fetch(`${MAILPIT}/api/v1/message/${id}`)).json();
        link = /href="([^"]+verify[^"]+)"/.exec(msg.HTML ?? "")?.[1]?.replace(/&amp;/g, "&");
      }
      if (!link) await page.waitForTimeout(500);
    }
    expect(link, "magic link email").toBeTruthy();
    await page.goto(link!);
    await page.waitForURL(/\/tong-quan/);
  }

  test("guest progress moves into the new account and syncs across browsers", async ({
    page,
    browser,
  }) => {
    const email = `e2e-${Date.now()}@example.test`;
    for (const slug of ["cau-tao-dan", "tu-the-cam-dan"]) {
      await page.goto(`/hoc/level-0/${slug}`);
      await page.getByRole("button", { name: "Đã học xong" }).click();
    }
    await signInWithMagicLink(page, email);
    await expect(page.locator("[data-next-lesson]")).toContainText("Lên dây đàn");

    await logSession(page, "20", "70");
    await expect(page.locator("[data-practice-history]")).toContainText("20 phút");

    // Offline change is kept and synced when back online.
    await page.goto("/hoc/level-0/len-day-dan");
    await page.context().setOffline(true);
    await page.getByRole("button", { name: "Đã học xong" }).click();
    await page.context().setOffline(false);
    await page.waitForTimeout(1500);

    // A fresh browser context sees the same data after signing in.
    const other = await browser.newContext();
    const p2 = await other.newPage();
    await signInWithMagicLink(p2, email);
    await expect(p2.locator('[data-stat="minutes7"]')).toHaveText("20");
    await expect(p2.locator("[data-next-lesson]")).toContainText("Cách đọc sơ đồ hợp âm");
    await other.close();
  });

  test("deleting the account removes all data", async ({ page }) => {
    const email = `e2e-del-${Date.now()}@example.test`;
    await signInWithMagicLink(page, email);
    await logSession(page, "15");
    await page.goto("/tai-khoan");
    await page.getByRole("button", { name: "Xóa tài khoản" }).click();
    await page.getByLabel("Gõ XOA TAI KHOAN để xác nhận").fill("XOA TAI KHOAN");
    await page.getByRole("button", { name: "Xóa vĩnh viễn" }).click();
    await page.waitForURL((u) => u.pathname === "/");

    await signInWithMagicLink(page, email);
    await expect(page.locator('[data-stat="minutes7"]')).toHaveText("0");
  });
});
