import { expect, test } from "@playwright/test";

/**
 * Constitution V / SC-006 budget, measured under emulated 4G on a production build:
 * lesson page LCP < 2.5 s and initial JavaScript < 200 KB (compressed, transferred).
 */
test.describe("performance budget", () => {
  test.skip(!process.env.E2E_BASE_URL && !process.env.E2E_PROD, "Run against `next start`");

  test("lesson page: LCP < 2.5 s on 4G, initial JS < 200 KB", async ({ page, browserName }, testInfo) => {
    test.skip(browserName !== "chromium" || testInfo.project.name !== "mobile", "CDP throttling, mobile only");
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150, // ms RTT (Lighthouse "Slow 4G")
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });

    const jsBytes = new Map<string, number>();
    cdp.on("Network.loadingFinished", () => {});
    const urls = new Map<string, string>();
    cdp.on("Network.responseReceived", (e) => {
      if (e.type === "Script") urls.set(e.requestId, e.response.url);
    });
    cdp.on("Network.loadingFinished", (e) => {
      const url = urls.get(e.requestId);
      if (url) jsBytes.set(url, e.encodedDataLength);
    });

    await page.goto("/hoc/level-1/hop-am-g", { waitUntil: "load" });
    const lcp = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let value = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) value = entry.startTime;
          }).observe({ type: "largest-contentful-paint", buffered: true });
          setTimeout(() => resolve(value), 500);
        }),
    );
    const totalJs = [...jsBytes.values()].reduce((a, b) => a + b, 0);
    testInfo.annotations.push({ type: "LCP (ms)", description: lcp.toFixed(0) });
    testInfo.annotations.push({ type: "initial JS (KB)", description: (totalJs / 1024).toFixed(1) });
    console.log(`LCP ${lcp.toFixed(0)} ms, initial JS ${(totalJs / 1024).toFixed(1)} KB over ${jsBytes.size} files`);

    expect(lcp).toBeGreaterThan(0);
    expect(lcp).toBeLessThan(2500);
    expect(totalJs).toBeLessThan(200 * 1024);
  });
});
