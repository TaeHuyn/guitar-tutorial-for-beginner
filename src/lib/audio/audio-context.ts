"use client";

let ctx: AudioContext | null = null;

/**
 * Shared AudioContext. Browsers only allow audio after a user gesture, so call this
 * from an event handler (click/tap/keydown). Resumes a suspended context.
 */
export async function getAudioContext(): Promise<AudioContext> {
  if (typeof window === "undefined")
    throw new Error("AudioContext is only available in the browser");
  if (!ctx || ctx.state === "closed") {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) throw new Error("Web Audio API is not supported");
    ctx = new Ctor({ latencyHint: "interactive" });
  }
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  return ctx;
}

/** Returns the current context without creating one (may be null). */
export function peekAudioContext(): AudioContext | null {
  return ctx;
}

/**
 * Heuristic: if the context stays suspended after a gesture, audio output is likely
 * blocked (iOS silent switch, autoplay policy). Used to show a "turn off silent mode" hint.
 */
export function isLikelyMuted(): boolean {
  return ctx !== null && ctx.state !== "running";
}
