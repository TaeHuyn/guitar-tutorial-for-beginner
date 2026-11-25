# Quickstart: Chạy và kiểm chứng MVP

Hướng dẫn chạy dự án và các kịch bản chứng minh MVP hoạt động end-to-end. Chi tiết dữ liệu xem
[data-model.md](./data-model.md); giao diện lập trình xem [contracts/](./contracts/).

## Yêu cầu

- Node.js ≥ 20 (máy hiện có v26), npm
- Docker Desktop (để chạy Supabase local)
- Supabase CLI: `brew install supabase/tap/supabase`
- Tài khoản Google Cloud (OAuth client) — chỉ cần khi thử đăng nhập Google

## Cài đặt

```bash
npm install
```

```bash
supabase start
```

```bash
cp .env.example .env.local   # điền URL và key do `supabase start` in ra
```

```bash
supabase db reset            # chạy migration + seed
```

```bash
npm run dev                  # http://localhost:3000
```

Email magic link ở môi trường local được bắt bởi Inbucket: http://localhost:54324

## Lệnh kiểm tra

| Lệnh | Kiểm tra |
|---|---|
| `npm run typecheck` | TypeScript strict |
| `npm run lint` | ESLint |
| `npm run content:check` | Nội dung khớp [content-schema](./contracts/content-schema.md), hợp âm đúng nhạc lý |
| `npm test` | Unit test (nhạc lý, tuner, metronome, streak, server actions) |
| `npm run test:e2e` | Playwright, mobile 360px + desktop, có kiểm tra a11y (axe) |
| `npm run build && npm start` | Bản production (để thử PWA/offline) |

Tất cả phải qua trước khi merge (Constitution: Cổng chất lượng).

## Kịch bản kiểm chứng

### K1 – Học lộ trình không cần đăng nhập (US1)
1. Mở `/` → bấm "Bắt đầu học" → mở bài đầu Cấp 0 trong ≤ 30 giây (SC-001).
2. Bài có: mục tiêu, thời lượng, nội dung, ≥ 1 bài tập, nút "Bài tiếp theo".
3. Đi "Bài tiếp theo" đến hết Cấp 1; bài hợp âm G có sơ đồ + nút nghe.
4. Bài cuối Cấp 1 có danh sách tiêu chí kiểm tra lên cấp.
5. Bài hát không có lời đầy đủ; có capo, hợp âm, điệu, liên kết bản chính thức.

**Mong đợi**: E2E `learn-path.spec.ts` qua ở cả mobile và desktop.

### K2 – Tuner (US2)
1. Mở `/cong-cu/len-day` → thấy giải thích quyền micro → cho phép.
2. Phát nốt 110 Hz (A2) từ một thiết bị khác hoặc gảy dây A → hiện "A", trạng thái "Chuẩn".
3. Phát 107 Hz → hiện "A", "thấp", chỉ dẫn vặn lên.
4. Chặn quyền micro → hiện chế độ nghe nốt mẫu.

**Tự động**: unit test sóng sin (±1 cent). **Thủ công**: so với một tuner chuẩn, lệch ≤ 3 cent (SC-003).

### K3 – Metronome (US3)
1. Mở `/cong-cu/may-dem-nhip`, đặt 80 BPM, 4/4, bấm bắt đầu → phách 1 nhấn mạnh, đèn chớp theo.
2. Đổi sang 100 BPM khi đang chạy → không ngắt nhịp.
3. Gõ "Tap tempo" 4 lần cách 500 ms → BPM ≈ 120.
4. Từ một bài tập có `bpm: 60` bấm "Tập với metronome" → mở sẵn 60 BPM.
5. Chuyển tab khác 1 phút rồi quay lại → vẫn đều nhịp.

**Tự động**: unit test 10 phút @120 BPM = 1200 phách (SC-004).

### K4 – Thư viện hợp âm (US4)
1. `/hop-am` → gõ "bm" → thấy Bm; gõ "Db" → thấy C#/D♭.
2. Lọc nốt gốc A → thấy đủ 7 loại.
3. Mở G → có liên kết đến bài "Hợp âm G".
4. Gõ "H7" → "Không tìm thấy" + gợi ý.

### K5 – Tài khoản và tiến độ (US5)
1. Khi là khách, đánh dấu xong 2 bài → đăng nhập bằng magic link (Inbucket) → 2 bài vẫn hoàn thành.
2. Ghi buổi tập 20 phút, BPM 70 → xuất hiện trong lịch sử; dashboard hiện tổng 7 ngày, chuỗi = 1.
3. Ghi 0 phút → bị từ chối với thông báo tiếng Việt.
4. Tắt mạng (DevTools offline) → đánh dấu 1 bài → bật mạng → bài được đồng bộ.
5. Đăng nhập trên trình duyệt khác → thấy đúng dữ liệu.
6. Xóa tài khoản → đăng nhập lại bằng email đó → tài khoản mới, không còn dữ liệu cũ.

**Tự động**: unit test `computeStreaks` (gồm kịch bản 3 ngày tập, bỏ 1 ngày → chuỗi 0, dài nhất 3).

### K6 – PWA, offline và hiệu năng
1. `npm run build && npm start`, mở trên Chrome mobile emulation → cài được lên màn hình chính.
2. Bật offline → `/cong-cu/len-day`, `/cong-cu/may-dem-nhip`, `/hop-am` vẫn dùng được.
3. Lighthouse (mobile, 4G) trang bài học: LCP < 2.5s, JS ban đầu < 200 KB gzip (SC-006).

### K7 – Quyền riêng tư
1. Mở tuner, theo dõi tab Network → **không** có request nào mang dữ liệu âm thanh.
2. Kiểm tra cookie sau khi duyệt trang khi chưa đăng nhập → không có cookie theo dõi.
3. `POST /api/events` → hàng mới trong `analytics_events` không có user_id/IP.
