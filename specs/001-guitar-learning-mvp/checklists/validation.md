# Validation Log: MVP (001-guitar-learning-mvp)

**Date**: 2026-11-24 · **Build**: Next.js 16.4.6 production (`next build && next start`) · **Browsers**: Playwright Chromium, mobile 360×800 + desktop 1280×800

## Automated checks

| Check | Result |
|---|---|
| `npm run typecheck` | ✅ pass |
| `npm run lint` | ✅ pass |
| `npm test` (Vitest) | ✅ 165/165 |
| `npm run content:check` | ✅ 24 lessons, 84 chords (every voicing verified), 5 songs |
| `npm run test:e2e` against production build | ✅ 104/104 with local Supabase (`E2E_SUPABASE=1`, 3 consecutive runs); 100 passed / 8 skipped without Supabase |

## Quickstart scenarios

| # | Scenario | Status | Evidence |
|---|---|---|---|
| K1 | Learning path without an account (US1) | ✅ | `learn-path.spec.ts` — first lesson ≤ 30 s, full path to level-1 test, axe clean, song page shows capo/chords/official link and no lyrics |
| K2 | Tuner (US2) | ✅ automated / ⏳ manual | Synthetic signals ±1 cent on all 6 strings (unit); E2E with synthetic mic stream; fallback tones when mic blocked. **SC-003 against a reference tuner with a real guitar not yet done** |
| K3 | Metronome (US3) | ✅ | 600 s @120 BPM = 1200 beats exactly, ≤ 1 µs drift (unit); E2E beat order, BPM change, tap tempo, presets, in-lesson dialog |
| K4 | Chord library (US4) | ✅ | 84 chords verified; E2E search (bm, Db), filter A → 7, link to lesson, "H7" → suggestions |
| K5 | Accounts & progress (US5) | ✅ | Guest progress, practice log, validation, dashboard, reload; magic-link sign-in, guest→account merge, offline change synced, second browser sees same data, account deletion removes all rows. RLS verified: anon key reads 0 rows from `lesson_progress` and `analytics_events` |
| K6 | PWA, offline, performance | ✅ | Manifest + icons; tuner/metronome/chords/visited lesson open offline; lesson page LCP 780 ms on emulated slow 4G, initial JS 195.5 KB (< 200 KB) |
| K7 | Privacy | ✅ | No audio/large request bodies while tuning; guests receive no cookies; analytics table has no user/IP columns |

## Skipped in this run

- Without Supabase: the 4 account-sync tests skip by design.
- Offline & performance tests run on one project only by design.

## Bugs found by the account run (fixed)

- Early clicks lost: with accounts enabled, "Đã học xong" pressed before auth resolved was ignored.
  Fix: no `sb-*-auth-token` cookie ⇒ start as guest immediately; actions before the store exists are
  queued and replayed.
- Guest progress sometimes not shown after magic-link sign-in: `getSession` and `SIGNED_IN` both ran
  init concurrently. Fix: identity de-duplication + generation counter; merge finishes before the
  account store is shown.
- Tap-tempo E2E was timing-sensitive under load; taps are now issued inside the page.

## Implementation notes (deviations from plan/tasks)

- **Content check** runs as a Vitest suite (`npm run content:check`) instead of a `tsx` script, because MDX
  metadata is imported directly; the loader also validates at build time.
- **Lesson MDX components** receive lesson data via the MDX `components` prop per page (no React context).
- **Every exercise must be placed inline** with `<Exercise id>` (validator rule) — guarantees none is hidden.
- **Tuner E2E** uses a synthetic `getUserMedia` stream: headless Chromium could not open a fake capture
  device. The WAV fixture/script from T048 was dropped.
- **Metronome worker** is an inline Blob worker (25 ms tick only): the Turbopack-bundled worker failed to
  bootstrap when served via the service worker.
- **PWA** uses `@serwist/turbopack` (Next 16 builds with Turbopack); `cacheOnNavigation` is off because it
  patches `history.pushState` and made the router render routes twice.
- **Dashboard** is computed on the client from the progress snapshot (same code for guests and users);
  `getProgressSnapshot` is the server action behind it.
- **Toasts removed** (inline `role="status"` messages) to keep initial JS under budget; Supabase JS is
  lazy-loaded only when accounts are configured.
- **Chord audio (R4 revised)**: Tone.js `PluckSynth` measured up to 14 cents flat on high notes, unstable
  pitch on some strings and clipping when six strings summed. Replaced by an in-house Karplus-Strong
  with all-pass fractional delay (`src/lib/audio/karplus.ts`): every note the chord library uses is within
  ±2 cents in tests (worst measured 0.08 cents); a compressor on the bus prevents clipping; Tone.js removed.
- **Chord audio (R4, second revision)**: listening tests against Musicca preferred recorded notes.
  Now uses the Musyng Kite steel-string soundfont (CC BY-SA 3.0, attributed in the footer and
  `public/audio/guitar/README.md`), 46 notes E2–C#6 fetched on demand and cached by the service
  worker; each file's measured pitch error (up to −15 cents) is corrected with `detune` and verified
  within ±3 cents (`tests/e2e/samples.spec.ts`). Strum gap 40 ms, master −5 dB, no loudness
  compressor. The Karplus-Strong synth stays as the fallback when a recording can't load.
- **Chord page redesign**: "{chord} trên đàn guitar" with Sơ đồ / Cần đàn views, note names (solfège),
  left-handed mirroring (remembered per device) and written fingering steps.
- **Lighthouse CI (T100)** replaced by a Playwright CDP measurement under slow-4G throttling
  (`tests/e2e/performance.spec.ts`).

## Songs (T040)

Chosen for the shortest path to the 8 level-1 chords; original chords checked against hopamchuan.com
(chord symbols only), official links are the artists' own YouTube channels. `bpm` is a practice tempo.

| Song | Artist | Played as | Substitutions |
|---|---|---|---|
| Chúng Ta Không Thuộc Về Nhau | Sơn Tùng M-TP | Am | F→Dm |
| Nơi Này Có Anh | Sơn Tùng M-TP | C | F→Dm, C7→C |
| Đi Để Trở Về | Soobin Hoàng Sơn | G | Bm→D, Cm→C |
| Phía Sau Một Cô Gái | Soobin Hoàng Sơn | Em, capo 1 (orig. Fm) | Bm→G, G7→G, final key change omitted |
| Em Của Ngày Hôm Qua | Sơn Tùng M-TP | Am, capo 4 (orig. C#m) | F→Dm |

## Open items

- [ ] SC-003 manual check — tuner vs. a reference tuner on a real guitar (≤ 3 cent).
