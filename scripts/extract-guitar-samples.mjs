/**
 * One-off: extracts single-note MP3s (E2–C#6) from the Musyng Kite "acoustic_guitar_steel"
 * soundfont published by gleitz/midi-js-soundfonts, unmodified, into public/audio/guitar/<midi>.mp3.
 * The input file is parsed as text (regex) — it is never executed.
 *
 * Usage: node scripts/extract-guitar-samples.mjs <path/to/acoustic_guitar_steel-mp3.js>
 * Source: https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_guitar_steel-mp3.js
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const input = process.argv[2];
if (!input) throw new Error("Pass the path to acoustic_guitar_steel-mp3.js");
const text = readFileSync(input, "utf8");
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const LOW = 40; // E2
const HIGH = 85; // C#6
mkdirSync("public/audio/guitar", { recursive: true });
let count = 0;
let bytes = 0;
for (const m of text.matchAll(/"([A-G])(b?)(\d)":\s*"data:audio\/mp3;base64,([A-Za-z0-9+/=]+)"/g)) {
  const midi = (Number(m[3]) + 1) * 12 + PC[m[1]] - (m[2] ? 1 : 0);
  if (midi < LOW || midi > HIGH) continue;
  const buf = Buffer.from(m[4], "base64");
  if (buf.length < 1000) throw new Error(`Suspiciously small sample for ${m[1]}${m[2]}${m[3]}`);
  writeFileSync(`public/audio/guitar/${midi}.mp3`, buf);
  count++;
  bytes += buf.length;
}
if (count !== HIGH - LOW + 1) throw new Error(`Expected ${HIGH - LOW + 1} notes, got ${count}`);
console.log(`Wrote ${count} samples, ${Math.round(bytes / 1024)} KB`);
