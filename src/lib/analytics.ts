"use client";

/** Cookie-less, anonymous event counting (FR-036). Batches events and sends with sendBeacon. */

export type EventName = "page_view" | "tool_open" | "lesson_start" | "lesson_complete";

const queue: { name: EventName; path: string; device: "mobile" | "desktop" }[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function device(): "mobile" | "desktop" {
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

function send() {
  timer = null;
  if (queue.length === 0) return;
  const body = JSON.stringify({ events: queue.splice(0, 20) });
  try {
    if (!navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/events", { method: "POST", body, keepalive: true, credentials: "omit" });
    }
  } catch {
    /* analytics must never break the app */
  }
  if (queue.length) timer = setTimeout(send, 1000);
}

export function track(name: EventName, path: string = window.location.pathname) {
  if (process.env.NODE_ENV !== "production") return;
  queue.push({ name, path: path.split(/[?#]/)[0], device: device() });
  timer ??= setTimeout(send, 2000);
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", send);
}
