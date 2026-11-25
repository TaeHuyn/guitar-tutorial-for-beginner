/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, ExpirationPlugin, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Precaches the app shell plus the practice tools so the tuner, metronome and chord library
 * work offline after the first visit (FR-034). Lesson pages are cached as they are visited.
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Guitar note recordings never change: keep every note once heard (46 files, ~800 KB).
    {
      matcher: ({ url }) => url.pathname.startsWith("/audio/guitar/"),
      handler: new CacheFirst({
        cacheName: "guitar-samples",
        plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 365 * 24 * 3600 })],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
