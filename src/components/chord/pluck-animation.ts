/**
 * Animates a chord diagram or fretboard SVG in time with playback: each sounding string lights
 * up and vibrates, and its finger dot (or open-string marker) pulses, at the moment its note is
 * heard. Works on the rendered SVG through data attributes, so server-rendered diagrams
 * (ChordCard) can be animated by a small client button without hydrating the diagram.
 *
 * Elements used: `[data-string-line=s]` (the string), `[data-dot][data-string=s] circle`,
 * `[data-marker][data-string=s]` and `[data-barre] rect`.
 */

const VIBRATE_MS = 1100;
const PULSE_MS = 650;
/** Decaying side-to-side offsets (in SVG units) for a plucked string. */
const WOBBLE = [0, -2.6, 2.3, -1.9, 1.5, -1.1, 0.8, -0.5, 0.3, -0.15, 0];

/** Strings (6…1) that sound in a voicing, in the order playChord plays them (low → high). */
export function soundingStrings(frets: readonly number[]): number[] {
  return frets.flatMap((f, i) => (f >= 0 ? [6 - i] : []));
}

function primaryColor(el: Element): string {
  return getComputedStyle(el).getPropertyValue("--primary").trim() || "#b5541c";
}

function pulse(el: Element, delayMs: number, scale: number) {
  if (!(el instanceof SVGGraphicsElement)) return;
  el.style.transformBox = "fill-box";
  el.style.transformOrigin = "center";
  el.animate(
    [
      { transform: "scale(1)" },
      { transform: `scale(${scale})`, offset: 0.25 },
      { transform: "scale(1)" },
    ],
    { duration: PULSE_MS, delay: delayMs, easing: "ease-out" },
  );
}

/**
 * @param svg the diagram/fretboard `<svg>`
 * @param strings sounding strings (6…1), in the same order as `delays`
 * @param delays seconds from now until each string sounds (from `playChord`)
 */
export function animatePluck(
  svg: Element | null | undefined,
  strings: readonly number[],
  delays: readonly number[],
) {
  if (!svg || typeof Element.prototype.animate !== "function") return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const color = primaryColor(svg);
  let firstBarreDelay = Infinity;

  strings.forEach((s, i) => {
    const delayMs = (delays[i] ?? 0) * 1000;
    const line = svg.querySelector<SVGGraphicsElement>(`[data-string-line="${s}"]`);
    if (line) {
      const isRect = line.tagName.toLowerCase() === "rect";
      const prop = isRect ? "fill" : "stroke";
      // Horizontal strings (fretboard) move up/down; vertical ones (diagram) move sideways.
      const box = line.getBBox();
      const axis = box.width >= box.height ? "Y" : "X";
      const style = getComputedStyle(line);
      // While ringing the string is drawn thicker: rects (fretboard) scale, lines get a wider stroke.
      line.style.transformBox = "fill-box";
      line.style.transformOrigin = "center";
      const thick = isRect ? ` scale${axis}(2)` : "";
      const frames: Keyframe[] = WOBBLE.map((d, k) => {
        const last = k === WOBBLE.length - 1;
        const frame: Keyframe = {
          transform: reduceMotion || last ? "none" : `translate${axis}(${d}px)${thick}`,
          [prop]: last ? style[prop] : color,
        };
        if (!isRect) frame.strokeWidth = last ? style.strokeWidth : "2.4";
        return frame;
      });
      line.animate(frames, { duration: VIBRATE_MS, delay: delayMs, easing: "linear" });
    }
    if (reduceMotion) return;
    svg
      .querySelectorAll(`[data-dot][data-string="${s}"] circle, [data-marker][data-string="${s}"]`)
      .forEach((el) => pulse(el, delayMs, 1.3));
    // Held only by the barre: no dot of its own and no open-string marker.
    if (!svg.querySelector(`[data-dot][data-string="${s}"], [data-marker][data-string="${s}"]`))
      firstBarreDelay = Math.min(firstBarreDelay, delayMs);
  });

  const barre = svg.querySelector("[data-barre] rect");
  if (barre && !reduceMotion && Number.isFinite(firstBarreDelay))
    pulse(barre, firstBarreDelay, 1.12);
}
