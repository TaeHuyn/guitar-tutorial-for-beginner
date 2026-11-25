"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import type { ReactNode } from "react";

/** Registers the service worker in production only (dev reloads would fight the cache). */
export function ServiceWorker({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      disable={process.env.NODE_ENV !== "production"}
      // cacheOnNavigation patches history.pushState, which makes the Next router render
      // routes twice. Visited pages are cached by the worker's runtime caching instead.
      cacheOnNavigation={false}
      reloadOnOnline={false}
    >
      {children}
    </SerwistProvider>
  );
}
