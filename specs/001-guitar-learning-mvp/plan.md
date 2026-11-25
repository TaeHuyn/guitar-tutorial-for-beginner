# Implementation Plan: MVP website học guitar cho người mới (Cấp 0–1)

**Branch**: `001-guitar-learning-mvp` | **Date**: 2026-11-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-guitar-learning-mvp/spec.md`

## Summary

Xây một web app tiếng Việt, ưu tiên điện thoại, giúp người mới học theo lộ trình Cấp 0–1 (8 hợp âm
mở, quạt chả, 5 ballad Việt bản đệm đơn giản), kèm 3 công cụ luyện tập chạy hoàn toàn trên trình
duyệt (tuner, metronome, thư viện hợp âm có âm mẫu) và tài khoản để lưu tiến độ, nhật ký tập,
chuỗi ngày tập.

Hướng kỹ thuật: Next.js render tĩnh các trang nội dung từ file MDX/TS có kiểm tra schema; công cụ âm
thanh dùng Web Audio (pitchy cho tuner, bộ lập lịch look-ahead trong Web Worker cho metronome,
Tone.js PluckSynth cho âm mẫu); Supabase cho đăng nhập (magic link + Google) và lưu tiến độ có RLS;
tiến độ khách lưu trên thiết bị và gộp vào tài khoản khi đăng ký; PWA để cài đặt và dùng công cụ
offline. Chi tiết quyết định: [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.x (`strict`), Node.js ≥ 20 (máy dev: v26)

**Primary Dependencies**: Next.js ≥ 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui,
`@next/mdx`, zod, tonal, pitchy, Tone.js (nạp động), `@supabase/supabase-js` + `@supabase/ssr`,
`@serwist/next`

**Storage**: Supabase Postgres (profiles, lesson_progress, practice_sessions, analytics_events) có
RLS; nội dung là file trong repo; `localStorage` cho tiến độ khách và hàng đợi offline

**Testing**: Vitest + Testing Library (unit/component), Playwright + @axe-core/playwright (E2E,
mobile 360px & desktop), Supabase CLI local cho E2E

**Target Platform**: Trình duyệt hiện đại trên điện thoại (Chrome Android, Safari iOS ≥ 16) và máy
tính; triển khai Vercel

**Project Type**: Web application (một dự án Next.js full-stack)

**Performance Goals**: LCP < 2.5s trên 4G; JS ban đầu trang bài học < 200 KB gzip; metronome lệch
< 5 ms/phách; tuner cập nhật ≥ 30 lần/giây, lệch ≤ 3 cent

**Constraints**: âm thanh micro không rời thiết bị; tuner/metronome/hợp âm dùng được offline;
không cookie theo dõi; giao diện tiếng Việt; dùng tốt ở 360px; WCAG 2.1 AA

**Scale/Scope**: ~25–35 bài học, 84+ hợp âm, 5 bài hát; ~15 trang; mục tiêu đến vài nghìn người
dùng (vừa gói miễn phí Supabase/Vercel)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Nguyên tắc | Cách plan tuân thủ | Trạng thái |
|---|---|---|---|
| I | Lộ trình là trung tâm | `levels.ts` định thứ tự bài; mỗi bài bắt buộc có objective, practiceMinutes, prerequisites (schema); dashboard "bài tiếp theo"; tiêu chí kiểm tra lên cấp | ✅ |
| II | Nội dung nguyên bản (NON-NEGOTIABLE) | Schema bài hát không có trường lời/âm thanh; video chỉ nhúng có ghi nguồn; âm mẫu tự tổng hợp; giáo trình ngoài chỉ ở `references` | ✅ |
| III | Luyện tập hơn xem | Schema bắt buộc ≥ 1 exercise; nút "Tập với metronome"; nhật ký tập | ✅ |
| IV | Âm thanh trên trình duyệt & riêng tư | Tuner/metronome client-side; không gửi âm thanh; giải thích quyền micro + chế độ dự phòng; metronome look-ahead, không `setInterval` phát âm | ✅ |
| V | Mobile-first, a11y, nhanh | E2E chạy ở 360px; axe trong E2E; ngân sách JS/LCP kiểm bằng Lighthouse; nút ≥ 44px; từ điển `vi.ts` | ✅ |
| VI | Đơn giản trước | Không CMS, không thư viện i18n, không thư viện state; metronome tự viết thay vì Tone.Transport | ✅ (1 ngoại lệ ghi dưới) |
| VII | Kiểm thử phần cốt lõi | Unit test nhạc lý, tuner (sóng sin), metronome (đồng hồ giả), streak; E2E luồng học; kiểm tra hợp âm tự động | ✅ |
| — | Ràng buộc kỹ thuật | Next.js, TS strict, Tailwind+shadcn, MDX, Supabase+RLS, pitchy/Tone.js, Vercel, PWA, secret trong env | ✅ |

**Kết quả trước Phase 0**: ĐẠT. **Kiểm tra lại sau Phase 1** (data-model, contracts): ĐẠT — RLS
trên mọi bảng người dùng, `analytics_events` không có dữ liệu cá nhân, schema nội dung thực thi
Nguyên tắc II và III.

## Project Structure

### Documentation (this feature)

```text
specs/001-guitar-learning-mvp/
├── spec.md
├── plan.md              # File này
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── content-schema.md
│   ├── server-api.md
│   └── audio-modules.md
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — chưa tạo)
```

### Source Code (repository root)

```text
content/
├── levels.ts
├── lessons/level-0/*.mdx
├── lessons/level-1/*.mdx
├── chords/index.ts
└── songs/*.ts

src/
├── app/
│   ├── page.tsx                      # Trang chủ
│   ├── hoc/page.tsx                  # Lộ trình
│   ├── hoc/[level]/[slug]/page.tsx   # Bài học (SSG)
│   ├── hop-am/page.tsx               # Thư viện hợp âm
│   ├── hop-am/[id]/page.tsx
│   ├── bai-hat/[id]/page.tsx
│   ├── cong-cu/len-day/page.tsx      # Tuner
│   ├── cong-cu/may-dem-nhip/page.tsx # Metronome
│   ├── tong-quan/page.tsx            # Dashboard
│   ├── nhat-ky/page.tsx              # Nhật ký tập
│   ├── tai-khoan/page.tsx
│   ├── dang-nhap/page.tsx
│   ├── auth/callback/route.ts
│   ├── api/events/route.ts
│   ├── manifest.ts
│   └── sw.ts                         # Serwist service worker
├── actions/                          # Server Actions (progress, practice, account)
├── components/
│   ├── ui/                           # shadcn/ui
│   ├── chord/ChordDiagram.tsx …
│   ├── lesson/Exercise.tsx, StrumPattern.tsx, YouTubeEmbed.tsx …
│   ├── tools/Tuner.tsx, Metronome.tsx
│   └── dashboard/…
├── content/                          # loader + zod schema + validate
├── hooks/                            # useTuner, useMetronome, usePluck, useProgress
├── lib/
│   ├── music/                        # nhạc lý thuần
│   ├── audio/                        # tuner, metronome (+ worker), pluck
│   ├── progress/                     # ProgressStore, hàng đợi offline, computeStreaks
│   ├── supabase/                     # client/server helpers
│   └── analytics.ts
└── i18n/vi.ts

supabase/
├── migrations/*.sql                  # bảng, RLS, trigger profile
└── seed.sql

tests/
├── unit/                             # music, audio, progress, content
└── e2e/                              # learn-path, tuner, metronome, chords, account, offline
```

**Structure Decision**: Một dự án Next.js full-stack duy nhất (frontend + Server Actions), cộng thư
mục `content/` cho nội dung soạn tay và `supabase/` cho schema DB. Không tách backend riêng vì toàn
bộ logic server chỉ là vài action CRUD có RLS.

## Phân pha triển khai (gợi ý cho /speckit-tasks)

1. **Nền tảng**: khởi tạo Next.js, Tailwind/shadcn, lint/test, Supabase local + migration, layout,
   từ điển `vi.ts`.
2. **US1 Lộ trình** (P1): content loader + schema + `content:check`, ChordDiagram, trang lộ trình/
   bài học, nội dung Cấp 0–1.
3. **US2 Tuner** (P2) và **US3 Metronome** (P3): lõi thuần + test trước, rồi UI.
4. **US4 Thư viện hợp âm** (P4): dữ liệu 84 hợp âm + test nhạc lý, tìm kiếm/lọc, âm mẫu.
5. **US5 Tài khoản & tiến độ** (P5): auth, ProgressStore, merge khách, nhật ký, dashboard, xóa
   tài khoản.
6. **Hoàn thiện**: PWA/offline, analytics ẩn danh, a11y, Lighthouse, triển khai Vercel.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Thêm `@serwist/next` (ngoài danh sách thư viện của constitution) | FR-034/035 và constitution yêu cầu PWA chạy offline | Tự viết service worker dễ sai cache giữa các lần deploy; next-pwa đã ngừng bảo trì |
| Thêm `tonal` (ngoài danh sách) | Kiểm tra tự động 84+ hợp âm đúng nhạc lý (Constitution VII) | Tự viết bảng nhạc lý dễ sai chính ở chỗ cần kiểm tra |
