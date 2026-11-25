# Học Guitar 🎸

Website học guitar tiếng Việt cho người mới: lộ trình Cấp 0–1 (8 hợp âm mở, quạt chả, bài hát áp dụng),
máy lên dây, máy đếm nhịp, thư viện 84 hợp âm có âm mẫu, và theo dõi tiến độ — chạy tốt trên điện thoại,
dùng được khi không có mạng.

- Đặc tả và kế hoạch: [`specs/001-guitar-learning-mvp/`](specs/001-guitar-learning-mvp/) (Spec Kit)
- Nguyên tắc dự án: [`.specify/memory/constitution.md`](.specify/memory/constitution.md)

## Chạy dự án

```bash
npm install
```

```bash
npm run dev
```

Mở http://localhost:3000. Không cần cấu hình gì thêm: khi chưa có Supabase, mọi tính năng học và công cụ
đều chạy, tiến độ được lưu trên thiết bị.

### Bật tài khoản (đăng nhập, đồng bộ tiến độ)

Cần Docker Desktop đang chạy.

```bash
npx supabase start
```

```bash
cp .env.example .env.local
```

Điền `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` từ kết quả của
`npx supabase status`, rồi chạy lại `npm run dev`. Email đăng nhập (magic link) ở môi trường local xem tại
http://127.0.0.1:54324.

## Kiểm tra

| Lệnh | Nội dung |
|---|---|
| `npm run typecheck` | TypeScript strict |
| `npm run lint` | ESLint (cấm `setInterval` trong code âm thanh) |
| `npm run content:check` | Nội dung bài học/hợp âm/bài hát hợp lệ, hợp âm đúng nhạc lý |
| `npm test` | Unit test (nhạc lý, tuner, metronome, tiến độ, validation) |
| `npm run test:e2e` | Playwright — mobile 360px + desktop, a11y, quyền riêng tư |

E2E đầy đủ (gồm PWA/offline và ngân sách hiệu năng) chạy trên bản production:

```bash
npm run build && npx next start -p 3100
```

```bash
E2E_BASE_URL=http://localhost:3100 npm run test:e2e
```

Phần đồng bộ tài khoản: thêm `E2E_SUPABASE=1` khi Supabase local đang chạy.

## Soạn nội dung

Nội dung nằm trong `content/` và được kiểm tra tự động — xem
[contracts/content-schema.md](specs/001-guitar-learning-mvp/contracts/content-schema.md).

- **Bài học**: `content/lessons/level-N/<slug>.mdx` với `export const metadata = {...}`; đăng ký trong
  `content/lessons/index.ts` và thêm slug vào `content/levels.ts`. Mỗi bài tập trong `metadata.exercises`
  phải được đặt trong bài bằng `<Exercise id="..." />`.
- **Hợp âm**: `content/chords/index.ts` (thế bấm mở viết tay + thế chặn sinh tự động).
- **Bài hát**: một file trong `content/songs/`, đăng ký ở `content/songs/index.ts`. **Không** đăng lời bài
  hát hay bản ghi âm; bài Cấp 1 chỉ dùng Em, Am, E, A, D, Dm, G, C (được kẹp capo).

## Cấu trúc

```text
content/            Nội dung soạn tay (MDX + dữ liệu TS)
src/app/            Trang (Next.js App Router) — /hoc, /hop-am, /cong-cu/*, /tong-quan, /nhat-ky …
src/components/     UI: chord/, lesson/, tools/, progress/, ui/ (shadcn)
src/lib/music/      Nhạc lý thuần (nốt, hợp âm, lên dây, tìm kiếm)
src/lib/audio/      Tuner (pitchy), metronome (look-ahead), âm mẫu (Karplus-Strong đúng cao độ)
src/lib/progress/   Kho tiến độ (khách + tài khoản, hàng đợi offline), chuỗi ngày
src/actions/        Server Actions (Supabase)
supabase/           Migration, seed, truy vấn chỉ tiêu
tests/unit, tests/e2e
```

Triển khai: xem [docs/deploy.md](docs/deploy.md).
# guitar-tutorial-for-beginner
