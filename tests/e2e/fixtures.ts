import { test as base, type Page } from "@playwright/test";

export { expect, type Page } from "@playwright/test";

/**
 * Pages whose content is streamed behind <Suspense> are first sent as a hidden copy that React
 * reveals a moment later. Wait for that after every navigation so locators never see two copies.
 */
async function waitForStreamedContent(page: Page) {
  await page.waitForFunction(() => !document.querySelector('div[hidden][id^="S:"]'));
}

export const test = base.extend({
  page: async ({ page }, provide) => {
    const goto = page.goto.bind(page);
    const reload = page.reload.bind(page);
    page.goto = async (...args) => {
      const res = await goto(...args);
      await waitForStreamedContent(page);
      return res;
    };
    page.reload = async (...args) => {
      const res = await reload(...args);
      await waitForStreamedContent(page);
      return res;
    };
    await provide(page);
  },
});
