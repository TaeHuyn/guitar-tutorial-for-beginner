---

description: "Task list for MVP website học guitar cho người mới (Cấp 0–1)"
---

# Tasks: MVP website học guitar cho người mới (Cấp 0–1)

**Input**: Design documents from `/specs/001-guitar-learning-mvp/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: CÓ. Constitution Nguyên tắc VII bắt buộc unit test cho logic âm thanh/nhạc lý, kiểm tra
dữ liệu hợp âm tự động và E2E cho luồng chính. Test được viết TRƯỚC và phải FAIL trước khi cài đặt.

**Organization**: Nhóm theo user story để mỗi story cài đặt và kiểm thử độc lập.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Chạy song song được (khác file, không phụ thuộc task chưa xong)
- **[Story]**: US1–US5 theo spec.md
- Đường dẫn tính từ gốc repo `GuitarTutorial/` (một dự án Next.js, xem plan.md › Project Structure)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Khởi tạo dự án và công cụ

- [X] T001 Chạy `git init` ở gốc repo, tạo nhánh `001-guitar-learning-mvp`; tạo `.gitignore` gồm `node_modules/`, `.next/`, `.env*.local`, `.claude/settings.local.json`, `public/sw.js`, `test-results/`, `playwright-report/`
- [X] T002 Khởi tạo Next.js (App Router, TypeScript, Tailwind, ESLint, thư mục `src/`, alias `@/*`) tại gốc repo bằng `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`; bật `"strict": true` trong `tsconfig.json`
- [X] T003 Cài phụ thuộc runtime trong `package.json`: `@next/mdx @mdx-js/react zod tonal pitchy tone @supabase/supabase-js @supabase/ssr @serwist/next`
- [X] T004 [P] Cài và cấu hình Vitest + Testing Library + jsdom trong `vitest.config.ts` (alias `@/`, môi trường jsdom cho `tests/unit/**/*.test.tsx`, node cho `*.test.ts`)
- [X] T005 [P] Cài Playwright + `@axe-core/playwright`; tạo `playwright.config.ts` với 2 project `mobile` (viewport 360×800, isMobile) và `desktop` (1280×800), `webServer: npm run dev`, Chromium có flag `--use-fake-ui-for-media-stream`
- [X] T006 [P] Khởi tạo shadcn/ui (`npx shadcn@latest init`) và thêm component `button card input slider tabs dialog badge progress toast` vào `src/components/ui/`
- [X] T007 [P] Cấu hình Prettier (`.prettierrc`, plugin tailwind) và thêm rule ESLint cấm `setInterval` trong `src/lib/audio/**` (`no-restricted-syntax`) trong `eslint.config.mjs`
- [X] T008 Thêm scripts vào `package.json`: `typecheck` (tsc --noEmit), `lint`, `test` (vitest run), `test:e2e` (playwright test), `content:check` (tsx scripts/content-check.ts)
- [X] T009 [P] Chạy `supabase init` tạo `supabase/config.toml`; bật provider email (magic link) và Google trong config; tạo `.env.example` với `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hạ tầng dùng chung cho mọi user story

**⚠️ CRITICAL**: Chưa làm user story nào trước khi phase này xong

- [X] T010 [P] Tạo từ điển giao diện tiếng Việt `src/i18n/vi.ts` (export `const vi = {...} as const` + hàm `t(key)`), gồm nhãn điều hướng, nút chung, thông báo lỗi chung
- [X] T011 [P] Tạo design tokens sáng/tối trong `src/app/globals.css` (biến màu `:root` + `@media (prefers-color-scheme: dark)`), cỡ chữ cơ sở 16px, `min-height: 44px` cho nút tương tác
- [X] T012 Tạo `src/app/layout.tsx`: `<html lang="vi">`, font hỗ trợ tiếng Việt (Be Vietnam Pro qua `next/font`), header trên desktop + thanh điều hướng dưới trên mobile (`src/components/layout/SiteNav.tsx`) với các mục Học, Hợp âm, Công cụ, Tổng quan; skip link "Bỏ qua đến nội dung"
- [X] T013 [P] Viết test `tests/unit/music/notes.test.ts` cho `voicingToNotes([3,2,0,0,0,3])` = `["G2","B2","D3","G3","B3","G4"]`, `-1` bỏ dây, và `frequencyToNote(440)` = A4 0 cent, `frequencyToNote(445)` ≈ +19.6 cent, `frequencyToNote(82.41)` = E2
- [X] T014 Cài đặt `src/lib/music/notes.ts`: `frequencyToNote(hz, a4=440)`, `voicingToNotes(frets)` với dây buông chuẩn E2 A2 D3 G3 B3 E4, `noteToFrequency(note)` (dùng `tonal`) — làm T013 pass
- [X] T015 [P] Cài đặt `src/lib/audio/audio-context.ts`: singleton `getAudioContext()` chỉ tạo/resume sau thao tác người dùng; `isLikelyMuted()` trả gợi ý khi `AudioContext.state` bị chặn
- [X] T016 Cài đặt `src/lib/audio/pluck.ts` theo contracts/audio-modules.md: `playChord(notes, mode)` (strum cách 15 ms, arpeggio cách 60 ms) và `playNote(note, durationSec)` dùng `Tone.PluckSynth` nạp động (`await import("tone")`)
- [X] T017 Tạo zod schema nội dung trong `src/content/schema.ts`: `LevelSchema`, `LessonMetaSchema`, `ExerciseSchema`, `ChordSchema`, `VoicingSchema`, `SongSchema` đúng ràng buộc data-model.md §1 (ví dụ `practiceMinutes` "5–60", `exercises` "≥ 1", `bpm` "30–250", `capo` "0–7", `frets` 6 phần tử "-1 = X, 0 = O, 1–15", `fingers` "0–4", `video` nếu có thì bắt buộc `channel` + `url`)
- [X] T018 Cài đặt loader `src/content/loader.ts`: `getLevels()`, `getLesson(slug)`, `getLessonsByLevel(level)`, `getAdjacentLessons(slug)`, `getChord(id)`, `getAllChords()`, `getSong(id)`; đọc `content/levels.ts`, `content/chords/index.ts`, `content/songs/*.ts` và `metadata` của các file MDX; parse bằng schema T017
- [X] T019 Cấu hình MDX: `next.config.ts` dùng `@next/mdx` (`pageExtensions` gồm `mdx`), tạo `src/mdx-components.tsx` (đăng ký component MDX — ban đầu chỉ `Tip`, `Warning` từ `src/components/lesson/Callout.tsx`)

**Checkpoint**: Nền tảng xong — có thể bắt đầu các user story

---

## Phase 3: User Story 1 - Học theo lộ trình Cấp 0 và Cấp 1 (Priority: P1) 🎯 MVP

**Goal**: Người mới đi từ bài đầu Cấp 0 đến bài kiểm tra lên cấp Cấp 1 bằng nút "Bài tiếp theo",
mỗi bài có mục tiêu, nội dung, bài tập, sơ đồ hợp âm nghe được; không cần đăng nhập.

**Independent Test**: quickstart.md › K1 — E2E `tests/e2e/learn-path.spec.ts` pass ở mobile và desktop.

### Tests for User Story 1 ⚠️

- [X] T020 [P] [US1] Viết `tests/unit/content/content-check.test.ts`: dựng nội dung giả trong bộ nhớ và kiểm tra validator báo lỗi khi slug trùng, prerequisite không tồn tại/đứng sau/vòng lặp, bài không có exercise, video thiếu `channel`, bài hát Cấp 1 dùng hợp âm ngoài {em, am, d, a, e, g, c, dm}, `<Exercise id>` trỏ id không có
- [X] T021 [P] [US1] Viết `tests/unit/content/chords-level1.test.ts`: với 8 hợp âm Cấp 1, tập nốt từ `voicingToNotes(voicing.frets)` khớp `Chord.get(name).notes` của tonal (cho phép thiếu quãng 5), nốt thấp nhất là nốt gốc
- [X] T022 [P] [US1] Viết `tests/unit/components/ChordDiagram.test.tsx`: render G có 6 dây, chấm ở đúng ngăn, nhãn ngón 2-1-3, ký hiệu O trên dây buông, X trên dây không đánh, hiển thị `baseFret` khi > 1, có `aria-label` "Hợp âm G"
- [X] T023 [P] [US1] Viết E2E `tests/e2e/learn-path.spec.ts`: trang chủ → "Bắt đầu học" → bài đầu Cấp 0 (≤ 30 s, không yêu cầu đăng nhập); mỗi bài có mục tiêu, thời lượng, ≥ 1 bài tập, nút "Bài tiếp theo"; đi hết lộ trình đến bài kiểm tra Cấp 1; trang bài hát không có khối lời bài hát và có liên kết bản chính thức; chạy axe không có vi phạm nghiêm trọng

### Implementation for User Story 1

- [X] T024 [US1] Cài đặt `scripts/content-check.ts` + `src/content/validate.ts` (6 quy tắc trong contracts/content-schema.md › Kiểm tra tự động) và gọi validate trong `next.config.ts` lúc build — làm T020 pass
- [X] T025 [P] [US1] Tạo `content/chords/index.ts` với 8 hợp âm Cấp 1 (Em, Am, D, A, E, G, C, Dm), mỗi hợp âm ≥ 1 voicing dễ nhất đứng đầu, `lessonSlug` trỏ bài tương ứng — làm T021 pass
- [X] T026 [P] [US1] Cài đặt `src/components/chord/ChordDiagram.tsx` (SVG thuần, responsive, dùng màu từ token, hiển thị barre) + nút `ChordPlayButton.tsx` gọi `playChord` hai chế độ "Đánh" và "Rải" — làm T022 pass
- [X] T027 [P] [US1] Cài đặt `src/components/lesson/Exercise.tsx` (thẻ bài tập: hướng dẫn, BPM, nhịp, tiêu chí đạt; nếu có `bpm` hiển thị liên kết "Tập với metronome" đến `/cong-cu/may-dem-nhip?bpm={bpm}&nhip={timeSignature}`)
- [X] T028 [P] [US1] Cài đặt `src/components/lesson/StrumPattern.tsx` (chuỗi như `D-DU-UDU` → mũi tên ↓↑ theo phách, có nút nghe mẫu bằng `playChord`) và `src/components/lesson/Tab.tsx` (khối tab đơn cách, cuộn ngang trong khối, không làm tràn trang)
- [X] T029 [P] [US1] Cài đặt `src/components/lesson/YouTubeEmbed.tsx` dạng facade: ảnh thumbnail + nút phát, chỉ nạp iframe `youtube-nocookie.com` khi bấm; luôn hiện "Video: {channel}" + liên kết gốc (FR-008b)
- [X] T030 [P] [US1] Cài đặt `src/components/song/SongCard.tsx` và trang `src/app/bai-hat/[id]/page.tsx`: tên bài, ca sĩ, tác giả, capo nổi bật, BPM, điệu quạt, các đoạn với `ChordProgression`, ghi chú `simplifiedFrom`, liên kết "Nghe bản chính thức"; KHÔNG có lời bài hát (FR-005)
- [X] T031 [US1] Đăng ký đầy đủ component MDX (`ChordDiagram`, `ChordProgression`, `Exercise`, `StrumPattern`, `Tab`, `SongCard`, `Tip`, `Warning`) trong `src/mdx-components.tsx`; `Exercise` nhận `metadata.exercises` qua React context của trang bài học
- [X] T032 [US1] Tạo trang bài học `src/app/hoc/[level]/[slug]/page.tsx` (SSG qua `generateStaticParams`): breadcrumb cấp, tiêu đề, mục tiêu, thời lượng tập, khối "Cần học trước" khi có prerequisites (Edge Case nhảy cóc), nội dung MDX, video, tài liệu tham khảo, nút Bài trước/Bài tiếp theo; `generateMetadata` cho SEO
- [X] T033 [P] [US1] Tạo `src/components/lesson/LevelTest.tsx`: danh sách tiêu chí lên cấp dạng checkbox tự đánh giá (lưu tạm vào `localStorage` khóa `gt:v1:leveltest:{level}`), hiển thị "Bạn đã sẵn sàng lên Cấp {n+1}" khi tick đủ
- [X] T034 [US1] Tạo trang lộ trình `src/app/hoc/page.tsx`: các cấp dạng thẻ, danh sách bài có số thứ tự, loại bài và thời lượng; Cấp 2–5 hiển thị "Sắp ra mắt"
- [X] T035 [US1] Tạo trang chủ `src/app/page.tsx`: giới thiệu ngắn, nút chính "Bắt đầu học" → bài đầu Cấp 0, lối tắt đến Lên dây, Máy đếm nhịp, Hợp âm
- [X] T036 [US1] Tạo `content/levels.ts`: Cấp 0 "Chuẩn bị" và Cấp 1 "Nền tảng" với thứ tự slug và tiêu chí kiểm tra lên cấp (Cấp 1 gồm "Chuyển G→C ≥ 30 lần/phút", "Đệm trọn một bài hát ở 80 BPM không dừng", "Bấm 8 hợp âm sạch không rè")
- [X] T037 [P] [US1] Viết nội dung Cấp 0 trong `content/lessons/level-0/`: `cau-tao-dan.mdx`, `tu-the-cam-dan.mdx`, `len-day-dan.mdx`, `doc-so-do-hop-am.mdx`, `doc-tab.mdx`, `cam-pick-va-gay.mdx` (nội dung nguyên bản, mỗi bài ≥ 1 exercise)
- [X] T038 [P] [US1] Viết bài hợp âm Cấp 1 trong `content/lessons/level-1/`: `hop-am-em.mdx`, `hop-am-am.mdx`, `hop-am-e.mdx`, `hop-am-a.mdx`, `hop-am-d.mdx`, `hop-am-dm.mdx`, `hop-am-g.mdx`, `hop-am-c.mdx`, mỗi bài có bài tập chuyển hợp âm theo cặp kèm BPM
- [X] T039 [P] [US1] Viết bài kỹ thuật Cấp 1 trong `content/lessons/level-1/`: `quat-cha-co-ban-1.mdx` (D-D-D-D), `quat-cha-co-ban-2.mdx` (D-DU-DU), `quat-cha-co-ban-3.mdx` (D-DU-UDU), `chuyen-hop-am-mot-phut.mdx`, `kiem-tra-cap-1.mdx` (dùng `<LevelTest>`)
- [X] T040 [US1] Tạo 5 file bài hát ballad Việt trong `content/songs/` (bản đệm đơn giản chỉ dùng 8 hợp âm Cấp 1, có `capo`, `simplifiedFrom`, `officialUrl`; KHÔNG có lời) và 5 bài áp dụng `content/lessons/level-1/bai-hat-1.mdx`…`bai-hat-5.mdx` — **cần chủ dự án duyệt danh sách 5 bài trước khi soạn**
- [X] T041 [US1] Chạy `npm run content:check` và `npx playwright test tests/e2e/learn-path.spec.ts` cho đến khi pass

**Checkpoint**: US1 dùng được độc lập — có thể demo MVP

---

## Phase 4: User Story 2 - Lên dây đàn bằng tuner (Priority: P2)

**Goal**: Lên đủ 6 dây E–A–D–G–B–E bằng micro, có chế độ nghe nốt mẫu khi không dùng micro.

**Independent Test**: quickstart.md › K2 — unit test sóng sin ±1 cent và E2E `tests/e2e/tuner.spec.ts` pass.

### Tests for User Story 2 ⚠️

- [X] T042 [P] [US2] Viết `tests/unit/music/tuning.test.ts`: `nearestGuitarString(110)` = dây 5 A2 0 cent; `nearestGuitarString(107)` cent < 0; `tuningState(4.9)` = "in-tune", `tuningState(-5.1)` = "flat", `tuningState(6)` = "sharp"
- [X] T043 [P] [US2] Viết `tests/unit/audio/pitch-detector.test.ts`: tạo sóng sin (kèm 3 họa âm và nhiễu nhẹ) ở 48 kHz, khung 4096 mẫu, cho từng dây ± {0, 3, 10, 30} cent → `detectPitch()` lệch ≤ 1 cent; tín hiệu RMS thấp → `{ kind: "quiet" }`; median 5 khung loại được 1 khung sai octave
- [X] T044 [P] [US2] Viết E2E `tests/e2e/tuner.spec.ts`: lần đầu thấy giải thích quyền micro; khi quyền bị từ chối (context không cấp `microphone`) hiển thị chế độ "Nghe nốt mẫu" với 6 nút dây; dùng `--use-file-for-fake-audio-capture=tests/fixtures/a2-110hz.wav` thì hiện "A" và "Chuẩn"

### Implementation for User Story 2

- [X] T045 [P] [US2] Cài đặt `src/lib/music/tuning.ts`: `nearestGuitarString(hz)`, `tuningState(cents)` (|cents| ≤ 5 → in-tune) — làm T042 pass
- [X] T046 [US2] Cài đặt `src/lib/audio/pitch-detector.ts` (thuần): `detectPitch(buffer, sampleRate)` dùng `pitchy` `PitchDetector.forFloat32Array(4096)`, bỏ khi clarity < 0.9 hoặc RMS < 0.01, lớp `MedianSmoother(5)` — làm T043 pass
- [X] T047 [US2] Cài đặt `src/lib/audio/tuner.ts` theo contracts/audio-modules.md: `getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })` → `AnalyserNode(fftSize 4096)` → `detectPitch` mỗi `requestAnimationFrame`; `subscribe`, `stop()` tắt mọi track; tự `stop()` khi tab ẩn > 60 s; ánh xạ lỗi thành `permission-denied | no-microphone | unsupported`; KHÔNG gửi âm thanh ra mạng
- [X] T048 [P] [US2] Tạo fixture `tests/fixtures/a2-110hz.wav` (2 giây, 48 kHz mono) bằng script `scripts/make-test-tone.ts`
- [X] T049 [US2] Cài đặt hook `src/hooks/useTuner.ts` (trạng thái idle/listening/error, reading mới nhất, dọn dẹp khi unmount)
- [X] T050 [P] [US2] Cài đặt `src/components/tools/TunerGauge.tsx`: kim từ −50 đến +50 cent, vùng xanh ±5, tên nốt lớn, chữ "Thấp — vặn lên" / "Cao — vặn xuống" / "Chuẩn" (màu + chữ, không chỉ màu), 6 dây với dây đang lên được tô sáng, `aria-live="polite"` thông báo trạng thái
- [X] T051 [P] [US2] Cài đặt `src/components/tools/MicPermissionExplainer.tsx` ("Cần micro để nghe tiếng đàn. Âm thanh chỉ xử lý trên máy bạn, không gửi đi đâu.") và `src/components/tools/ReferenceTones.tsx` (6 nút phát nốt mẫu bằng `playNote`, FR-018)
- [X] T052 [US2] Tạo trang `src/app/cong-cu/len-day/page.tsx` ghép Explainer → Gauge; thông báo "Chưa nghe rõ, hãy gảy mạnh hơn hoặc đưa đàn lại gần" khi `quiet` kéo dài > 1.5 s; tự chuyển sang ReferenceTones khi lỗi; nhắc kiểm tra chế độ im lặng trên điện thoại
- [X] T053 [US2] Chạy `npm test -- tuning pitch-detector` và `npx playwright test tests/e2e/tuner.spec.ts` cho đến khi pass

**Checkpoint**: US1 và US2 hoạt động độc lập

---

## Phase 5: User Story 3 - Tập theo máy đếm nhịp (Priority: P3)

**Goal**: Metronome 30–250 BPM, nhịp 2/4·3/4·4/4·6/8, đèn phách, tap tempo, mở sẵn từ bài tập.

**Independent Test**: quickstart.md › K3 — unit test 10 phút @120 BPM = 1200 phách và E2E `tests/e2e/metronome.spec.ts` pass.

### Tests for User Story 3 ⚠️

- [X] T054 [P] [US3] Viết `tests/unit/audio/scheduler.test.ts`: mô phỏng đồng hồ giả, gọi `scheduleBeats` mỗi 25 ms ± jitter ngẫu nhiên 0–20 ms, lookAhead 0.1 s, 120 BPM trong 600 s → đúng 1200 phách, khoảng cách 0.5 s ± 0.000001; phách 1 mỗi ô `accent: true`; 6/8 nhấn phách 1 (mạnh) và 4 (nhẹ); đổi BPM giữa chừng áp dụng từ phách kế tiếp, không trùng/mất phách; BPM ngoài khoảng bị kẹp về "30–250"
- [X] T055 [P] [US3] Viết `tests/unit/audio/tap-tempo.test.ts`: < 4 lần gõ → `null`; 4 lần cách 500 ms → 120; bỏ khoảng > 2000 ms; dùng tối đa 8 khoảng gần nhất
- [X] T056 [P] [US3] Viết E2E `tests/e2e/metronome.spec.ts`: đặt 80 BPM 4/4, bấm Bắt đầu → chỉ báo phách đổi theo thứ tự 1-2-3-4 (đọc `data-beat`); đổi BPM khi chạy vẫn chạy; tap 4 lần → BPM ≈ 120; mở `/cong-cu/may-dem-nhip?bpm=60&nhip=3/4` → giá trị cài sẵn; từ bài `hop-am-g` bấm "Tập với metronome" → đúng BPM của bài tập

### Implementation for User Story 3

- [X] T057 [P] [US3] Cài đặt lõi thuần `src/lib/audio/scheduler.ts` (`SchedulerState`, `scheduleBeats(state, now, lookAhead)`, `clampBpm`) — làm T054 pass
- [X] T058 [P] [US3] Cài đặt `src/lib/audio/tap-tempo.ts` (`tapTempo(tapsMs)`) — làm T055 pass
- [X] T059 [US3] Cài đặt `src/lib/audio/metronome.worker.ts` (gửi `tick` mỗi 25 ms — được phép dùng timer trong worker vì không phát âm; thêm ngoại lệ ESLint chỉ cho file này) và `src/lib/audio/metronome.ts` theo contracts/audio-modules.md: mỗi tick gọi `scheduleBeats` theo `AudioContext.currentTime`, tạo click `OscillatorNode` + gain envelope 30 ms (phách mạnh 1500 Hz, thường 1000 Hz), hàng đợi phách cho `onBeat`
- [X] T060 [US3] Cài đặt hook `src/hooks/useMetronome.ts` (start/stop/setBpm/setBeatsPerBar, phách hiện tại đồng bộ qua `requestAnimationFrame` so với `currentTime`, lưu/đọc cài đặt `localStorage` khóa `gt:v1:metronome` trong try/catch)
- [X] T061 [P] [US3] Cài đặt `src/components/tools/BpmControl.tsx`: thanh trượt 30–250, nút −/+ (giữ để lặp), ô nhập số, tên tempo (Largo/Andante/Moderato/Allegro); nút ≥ 44×44 px
- [X] T062 [P] [US3] Cài đặt `src/components/tools/BeatIndicator.tsx` (n chấm, chấm đầu to hơn, `data-beat` cho E2E, tôn trọng `prefers-reduced-motion`) và `src/components/tools/TapTempoButton.tsx`
- [X] T063 [US3] Cài đặt `src/components/tools/Metronome.tsx` ghép các phần trên + chọn nhịp 2/4·3/4·4/4·6/8 + âm lượng; phím Space bật/tắt
- [X] T064 [US3] Tạo trang `src/app/cong-cu/may-dem-nhip/page.tsx` đọc query `bpm` và `nhip` (kiểm tra hợp lệ, sai thì dùng mặc định 80 và 4/4)
- [X] T065 [US3] Thêm metronome thu gọn vào `src/components/lesson/Exercise.tsx`: nút "Tập với metronome" mở `Metronome` trong `Dialog` ngay trên trang bài học với BPM/nhịp cài sẵn (giữ liên kết trang đầy đủ làm phương án dự phòng)
- [X] T066 [US3] Chạy `npm test -- scheduler tap-tempo` và `npx playwright test tests/e2e/metronome.spec.ts` cho đến khi pass

**Checkpoint**: US1–US3 hoạt động độc lập

---

## Phase 6: User Story 4 - Tra cứu thư viện hợp âm (Priority: P4)

**Goal**: Thư viện 12 nốt gốc × 7 loại, tìm theo tên (không phân biệt hoa/thường, thăng/giáng), lọc, nghe thử, liên kết bài học.

**Independent Test**: quickstart.md › K4 — test dữ liệu 84 hợp âm và E2E `tests/e2e/chords.spec.ts` pass.

### Tests for User Story 4 ⚠️

- [X] T067 [P] [US4] Viết `tests/unit/content/chord-library.test.ts`: đủ 12 nốt gốc × 7 loại `major | minor | 7 | m7 | maj7 | sus2 | sus4`; mọi voicing của mọi hợp âm khớp nốt theo tonal; voicing đầu có `difficulty` nhỏ nhất; id duy nhất
- [X] T068 [P] [US4] Viết `tests/unit/music/chord-search.test.ts`: `normalizeChordQuery` với "bm", "BM", "Bb", "B♭", "a#m7", "Db" → id chuẩn; `searchChords("Db")` trả C#/D♭; `filterChords({ root: "A" })` trả 7 hợp âm; `searchChords("H7")` trả rỗng kèm gợi ý gần đúng (ví dụ B7)
- [X] T069 [P] [US4] Viết E2E `tests/e2e/chords.spec.ts`: gõ "bm" thấy Bm + nút nghe; lọc A thấy A, Am, A7, Am7, Amaj7, Asus2, Asus4; mở G có liên kết "Học hợp âm này" đến `/hoc/level-1/hop-am-g`; gõ "H7" thấy "Không tìm thấy" + gợi ý

### Implementation for User Story 4

- [X] T070 [US4] Mở rộng `content/chords/index.ts` lên đủ 84 hợp âm (giữ 8 hợp âm Cấp 1), mỗi hợp âm có `aliases` tên giáng/thăng tương đương, thế dễ nhất đứng đầu, thêm thế barre khi phù hợp — làm T067 pass
- [X] T071 [P] [US4] Cài đặt `src/lib/music/chord-search.ts`: `normalizeChordQuery`, `searchChords(query)`, `filterChords({ root?, quality? })`, `suggestChords(query)` (khoảng cách chỉnh sửa trên tên + alias) — làm T068 pass
- [X] T072 [US4] Tạo trang `src/app/hop-am/page.tsx` (SSG dữ liệu, tìm/lọc phía client trong `src/components/chord/ChordLibrary.tsx`): ô tìm kiếm, chip nốt gốc, chip loại, lưới thẻ sơ đồ nhỏ; trạng thái "Không tìm thấy" + gợi ý; giữ bộ lọc trong URL query
- [X] T073 [US4] Tạo trang chi tiết `src/app/hop-am/[id]/page.tsx` (SSG): sơ đồ lớn, chuyển giữa các thế bấm, nút Đánh/Rải, cấp độ, liên kết "Học hợp âm này" khi có `lessonSlug` (FR-013)
- [X] T074 [US4] Chạy `npm test -- chord` và `npx playwright test tests/e2e/chords.spec.ts` cho đến khi pass

**Checkpoint**: US1–US4 hoạt động độc lập

---

## Phase 7: User Story 5 - Tài khoản, tiến độ và nhật ký tập (Priority: P5)

**Goal**: Đăng nhập email magic link/Google, đánh dấu bài, nhật ký tập, chuỗi ngày, dashboard, gộp tiến độ khách, đồng bộ offline, xóa tài khoản.

**Independent Test**: quickstart.md › K5 — unit test streak/actions và E2E `tests/e2e/account.spec.ts` pass.

### Tests for User Story 5 ⚠️

- [X] T075 [P] [US5] Viết `tests/unit/progress/streaks.test.ts` cho `computeStreaks(days, today)`: tập ngày 1–3, bỏ ngày 4, hôm nay là ngày 5 → hiện tại 0, dài nhất 3; hôm nay chưa tập nhưng hôm qua có → giữ chuỗi; nhiều buổi cùng ngày tính 1; qua năm 31/12 → 1/1; mảng rỗng → 0/0
- [X] T076 [P] [US5] Viết `tests/unit/progress/progress-store.test.ts`: store khách ghi/đọc `localStorage` khóa `gt:v1:guest`; khi offline thao tác vào `pendingOps` và được gửi lại khi sự kiện `online`; gửi lại cùng `id` buổi tập không tạo trùng; `nextLesson` = bài đầu chưa hoàn thành theo lộ trình
- [X] T077 [P] [US5] Viết `tests/unit/actions/validation.test.ts` cho zod schema của server actions: `durationMinutes` "1–600" (0 và 601 bị từ chối với message "Thời lượng phải từ 1 đến 600 phút"), `note` "≤ 500 ký tự", `bpmReached` "30–250", `practicedOn` không ở tương lai quá hôm nay + 1, `lessonSlug` phải tồn tại, `deleteAccount` yêu cầu `confirm: "XOA TAI KHOAN"`
- [X] T078 [P] [US5] Viết E2E `tests/e2e/account.spec.ts` (Supabase local + Inbucket): khách đánh dấu 2 bài → đăng nhập magic link → 2 bài vẫn hoàn thành; ghi buổi tập 20 phút BPM 70 → có trong lịch sử, dashboard chuỗi = 1; ghi 0 phút → thông báo lỗi tiếng Việt; offline đánh dấu 1 bài → online → đã đồng bộ (kiểm tra bằng context trình duyệt mới); xóa tài khoản → đăng nhập lại không còn dữ liệu

### Implementation for User Story 5

- [X] T079 [US5] Tạo migration `supabase/migrations/0001_user_data.sql`: bảng `profiles` (`display_name` "≤ 50 ký tự", `timezone` mặc định `'Asia/Ho_Chi_Minh'`, `current_level` "0–5" mặc định 0), `lesson_progress` (PK `(user_id, lesson_slug)`, `status` = 'completed', `completed_at timestamptz`, `completed_on date`, `updated_at`), `practice_sessions` (`id uuid` do client sinh, `duration_minutes` CHECK "1–600", `note` "≤ 500 ký tự", `bpm_reached` "30–250", index `(user_id, practiced_on desc)`); mọi FK `on delete cascade`; bật RLS với chính sách `user_id = auth.uid()` cho select/insert/update/delete; trigger tạo `profiles` khi có `auth.users` mới
- [X] T080 [P] [US5] Tạo `supabase/seed.sql` với 1 người dùng thử (email `hocvien@example.test`) và vài buổi tập mẫu cho phát triển local
- [X] T081 [P] [US5] Cài đặt `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` (dùng `@supabase/ssr` với cookies của Next), `src/lib/supabase/admin.ts` (service role, chỉ import ở server) và `src/middleware.ts` làm mới session
- [X] T082 [P] [US5] Cài đặt `src/lib/progress/streaks.ts` (`computeStreaks`, `minutesLastNDays`, `localDate(timezone)`) — làm T075 pass
- [X] T083 [US5] Cài đặt `src/actions/schemas.ts` (zod theo contracts/server-api.md) và `src/actions/result.ts` (`Result<T>`, `ErrorCode`) — làm T077 pass
- [X] T084 [US5] Cài đặt server actions `src/actions/progress.ts` (`markLessonComplete` giữ `completed_at` cũ, `unmarkLessonComplete`, `mergeGuestProgress` trong một transaction qua RPC `merge_guest_progress` thêm vào migration `0002_merge_guest.sql`, tối đa 500 mỗi loại, bỏ qua slug không hợp lệ)
- [X] T085 [US5] Cài đặt server actions `src/actions/practice.ts` (`logPracticeSession` idempotent theo `id`, `deletePracticeSession`) và `src/actions/account.ts` (`updateProfile` kiểm tra timezone IANA bằng `Intl.supportedValuesOf("timeZone")`, `deleteAccount` dùng admin client rồi đăng xuất)
- [X] T086 [US5] Cài đặt `src/lib/progress/progress-store.ts`: interface chung, backend `localStorage` (khách) và backend Supabase (gọi actions), hàng đợi `pendingOps` + thử lại khi `online` — làm T076 pass; và hook `src/hooks/useProgress.ts`
- [X] T087 [US5] Tạo trang `src/app/dang-nhap/page.tsx` (form email gửi magic link với thông báo "Kiểm tra hộp thư", nút "Tiếp tục với Google"), route `src/app/auth/callback/route.ts` (đổi code → session → chuyển `/tong-quan?merge=1`), route `src/app/auth/signout/route.ts`; client tại `/tong-quan` thấy `merge=1` thì gọi `mergeGuestProgress` rồi xóa `gt:v1:guest`
- [X] T088 [US5] Thêm `src/components/lesson/MarkCompleteButton.tsx` vào trang bài học (T032) và dấu ✓ hoàn thành + thanh % mỗi cấp vào trang lộ trình (T034), dùng `useProgress` (hoạt động cả khi là khách)
- [X] T089 [US5] Tạo trang `src/app/nhat-ky/page.tsx`: form ghi buổi tập (ngày mặc định hôm nay theo giờ địa phương, thời lượng, chọn bài học hoặc ghi chú, BPM) và lịch sử 30 ngày có xóa; nút "Ghi buổi tập" cũng xuất hiện cuối trang metronome
- [X] T090 [US5] Tạo trang `src/app/tong-quan/page.tsx` theo `getDashboard` trong contracts/server-api.md: thẻ "Học tiếp" (bài tiếp theo), % hoàn thành từng cấp, phút tập 7 ngày, chuỗi hiện tại và dài nhất, 10 buổi tập gần nhất; khách thấy cùng nội dung từ dữ liệu cục bộ + lời mời đăng ký để lưu tiến độ
- [X] T091 [US5] Tạo trang `src/app/tai-khoan/page.tsx`: đổi tên hiển thị, chọn múi giờ, đăng xuất, "Xóa tài khoản" với hộp thoại yêu cầu gõ `XOA TAI KHOAN` (FR-031)
- [X] T092 [US5] Chạy `npm test -- progress actions` và `npx playwright test tests/e2e/account.spec.ts` cho đến khi pass

**Checkpoint**: Toàn bộ 5 user story hoạt động độc lập

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: PWA/offline, số liệu ẩn danh, a11y, hiệu năng, triển khai

- [X] T093 [P] Tạo migration `supabase/migrations/0003_analytics.sql`: bảng `analytics_events` (`name` CHECK ∈ {`page_view`,`tool_open`,`lesson_start`,`lesson_complete`}, `path` "≤ 200 ký tự, không có query string", `device` `mobile | desktop`, `occurred_hour` làm tròn theo giờ); bật RLS không có chính sách đọc công khai; KHÔNG có cột user_id/IP
- [X] T094 Cài đặt `src/app/api/events/route.ts` (zod, ≤ 20 sự kiện, bỏ query string, làm tròn giờ, ghi bằng admin client, luôn trả `204`, không đọc cookie/IP) và `src/lib/analytics.ts` (`track(name)` gom và gửi bằng `navigator.sendBeacon`); gắn `page_view` trong layout, `tool_open` ở trang công cụ, `lesson_start`/`lesson_complete` ở trang bài học
- [X] T095 [P] Viết `supabase/queries/success-metrics.sql`: tỉ lệ người dùng hoàn thành toàn bộ Cấp 0 trong 14 ngày đầu (SC-007) và tỉ lệ quay lại tập trong 7 ngày (SC-008) dưới dạng số tổng hợp (FR-037)
- [X] T096 Cấu hình PWA: `src/app/manifest.ts` (tên "Học Guitar", `display: standalone`, `lang: vi`, màu chủ đề), icon 192/512/maskable trong `public/icons/`, service worker `src/app/sw.ts` với Serwist precache `/cong-cu/len-day`, `/cong-cu/may-dem-nhip`, `/hop-am` và chunk liên quan, `StaleWhileRevalidate` cho `/hoc/*`; bọc `next.config.ts` bằng `withSerwist`
- [X] T097 [P] Viết E2E `tests/e2e/offline.spec.ts` (chạy trên `npm run build && npm start`): sau lần truy cập đầu, `context.setOffline(true)` → tuner (chế độ nốt mẫu), metronome, thư viện hợp âm vẫn dùng được; trang bài học đã xem vẫn mở được
- [X] T098 [P] Viết E2E `tests/e2e/a11y.spec.ts`: chạy axe trên trang chủ, lộ trình, 1 bài học, bài hát, tuner, metronome, hợp âm, dashboard, đăng nhập ở cả mobile và desktop, cả sáng và tối — 0 vi phạm `serious`/`critical`; điều khiển metronome và tuner hoàn toàn bằng bàn phím
- [X] T099 [P] Viết E2E `tests/e2e/privacy.spec.ts`: khi dùng tuner, không request mạng nào có body nhị phân/âm thanh; khi duyệt chưa đăng nhập không có cookie nào ngoài cookie phiên Supabase (không có khi là khách)
- [X] T100 Kiểm tra ngân sách hiệu năng: chạy Lighthouse CI (`@lhci/cli`, cấu hình `lighthouserc.json` preset mobile) cho 1 trang bài học — LCP < 2.5 s, JS tải ban đầu < 200 KB gzip; sửa bằng dynamic import nếu vượt (Tone.js, pitchy, Dialog metronome)
- [X] T101 [P] Tạo trang lỗi tiếng Việt `src/app/not-found.tsx` và `src/app/error.tsx`, cùng trạng thái loading `src/app/hoc/[level]/[slug]/loading.tsx`
- [X] T102 [P] Viết `README.md`: giới thiệu, cách chạy (dẫn quickstart.md), cách soạn nội dung (dẫn contracts/content-schema.md), các lệnh kiểm tra
- [X] T103 Cấu hình triển khai: `vercel.json` (nếu cần), hướng dẫn tạo dự án Supabase cloud + OAuth Google redirect URL và biến môi trường trên Vercel trong `docs/deploy.md`
- [ ] T104 Chạy toàn bộ quickstart.md K1–K7 (`typecheck`, `lint`, `content:check`, `test`, `test:e2e`, build) và ghi kết quả kiểm tra thủ công (tuner so với tuner chuẩn ≤ 3 cent, SC-003) vào `specs/001-guitar-learning-mvp/checklists/validation.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: bắt đầu ngay
- **Foundational (Phase 2)**: sau Setup — CHẶN mọi user story
- **US1–US5 (Phase 3–7)**: sau Foundational; làm tuần tự P1 → P5 (dự án 1 người)
- **Polish (Phase 8)**: sau các story mong muốn; T093–T095 chỉ cần US5 (Supabase), T096–T097 chỉ cần US2–US4

### User Story Dependencies

- **US1 (P1)**: chỉ cần Foundational
- **US2 (P2)**: chỉ cần Foundational (dùng `pluck.ts` T016, `notes.ts` T014)
- **US3 (P3)**: chỉ cần Foundational; T065 sửa `Exercise.tsx` của US1 — nếu US1 chưa có thì bỏ qua T065, trang metronome vẫn độc lập
- **US4 (P4)**: cần `ChordDiagram` (T026) và `content/chords/index.ts` (T025) của US1
- **US5 (P5)**: T088 gắn vào trang bài học/lộ trình của US1; phần tài khoản, nhật ký, dashboard độc lập

### Within Each User Story

- Test viết trước và phải FAIL → lõi thuần → hook/service → component → trang → chạy test
- Commit sau mỗi task hoặc nhóm task logic

### Parallel Opportunities

- Setup: T004, T005, T006, T007, T009
- Foundational: T010, T011, T013, T015 song song; T014 sau T013; T016 sau T015; T018 sau T017
- US1: test T020–T023 song song; T025–T030 và T033 song song; nội dung T037–T039 song song
- US2: T042–T044 song song; T045, T048, T050, T051 song song
- US3: T054–T056 song song; T057, T058, T061, T062 song song
- US4: T067–T069 song song; T071 song song với T070
- US5: T075–T078 song song; T080, T081, T082 song song
- Polish: T093, T095, T097, T098, T099, T101, T102 song song

---

## Parallel Example: User Story 1

```bash
# Viết test US1 cùng lúc:
Task: "Content validator test in tests/unit/content/content-check.test.ts"
Task: "Level-1 chord voicing test in tests/unit/content/chords-level1.test.ts"
Task: "ChordDiagram component test in tests/unit/components/ChordDiagram.test.tsx"
Task: "Learn-path E2E in tests/e2e/learn-path.spec.ts"

# Component độc lập cùng lúc:
Task: "ChordDiagram + ChordPlayButton in src/components/chord/"
Task: "Exercise card in src/components/lesson/Exercise.tsx"
Task: "YouTubeEmbed facade in src/components/lesson/YouTubeEmbed.tsx"
Task: "SongCard + song page in src/components/song/ and src/app/bai-hat/[id]/page.tsx"

# Nội dung cùng lúc:
Task: "Level 0 lessons in content/lessons/level-0/"
Task: "Level 1 chord lessons in content/lessons/level-1/hop-am-*.mdx"
Task: "Level 1 technique lessons in content/lessons/level-1/quat-cha-*.mdx"
```

## Parallel Example: User Story 3

```bash
Task: "Scheduler test in tests/unit/audio/scheduler.test.ts"
Task: "Tap tempo test in tests/unit/audio/tap-tempo.test.ts"
Task: "BpmControl in src/components/tools/BpmControl.tsx"
Task: "BeatIndicator + TapTempoButton in src/components/tools/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 US1 (lộ trình + nội dung Cấp 0–1)
3. **DỪNG và KIỂM TRA**: chạy K1 trong quickstart.md
4. Triển khai bản xem thử lên Vercel (chưa cần Supabase)

### Incremental Delivery

1. Setup + Foundational → nền tảng sẵn sàng
2. US1 → kiểm tra → demo (lộ trình học)
3. US2 Tuner → kiểm tra → demo
4. US3 Metronome → kiểm tra → demo
5. US4 Thư viện hợp âm → kiểm tra → demo
6. US5 Tài khoản & tiến độ → kiểm tra → demo
7. Polish → PWA, analytics, a11y, hiệu năng → **ra mắt beta**

### Lưu ý cho dự án một người

- Viết nội dung (T037–T040) tốn thời gian nhất; có thể làm song song với code các story sau.
- T040 cần chủ dự án chọn 5 bài hát trước.
- Mỗi checkpoint là một điểm có thể triển khai và nhận phản hồi.

---

## Notes

- **[P]** = khác file, không phụ thuộc task chưa xong
- Nhãn [USn] ánh xạ task về user story để truy vết
- Xác nhận test FAIL trước khi cài đặt
- Tránh: task mơ hồ, hai task cùng sửa một file song song, phụ thuộc chéo phá tính độc lập của story
