# Contract: Server Actions và Route Handlers

Mọi đầu vào được kiểm tra bằng zod. Kết quả có dạng chung:

```ts
type Result<T> = { ok: true; data: T } | { ok: false; error: ErrorCode; message: string } // message tiếng Việt
type ErrorCode = "UNAUTHENTICATED" | "VALIDATION" | "NOT_FOUND" | "RATE_LIMITED" | "INTERNAL"
```

Các action yêu cầu đăng nhập trả `UNAUTHENTICATED` nếu không có session. Mọi action ghi dữ liệu
đều **idempotent** (gọi lại cùng tham số không tạo bản ghi trùng).

## Tiến độ bài học

### `markLessonComplete(input)`
- **Input**: `{ lessonSlug: string; completedAt: ISO string; completedOn: "YYYY-MM-DD" }`
- **Hành vi**: upsert `lesson_progress`; nếu đã có thì giữ nguyên `completed_at` cũ.
- **Lỗi**: `NOT_FOUND` nếu slug không có trong nội dung.
- **Output**: `{ lessonSlug, completedAt }`

### `unmarkLessonComplete(input)`
- **Input**: `{ lessonSlug: string }` → xóa hàng nếu có. Output: `{ lessonSlug }`.

### `mergeGuestProgress(input)`
- **Input**: `{ completed: {lessonSlug, completedAt, completedOn}[]; sessions: PracticeSessionInput[] }`
  (tối đa 500 mỗi loại)
- **Hành vi**: một transaction; upsert bài học (giữ ngày sớm hơn), insert buổi tập theo `id`
  (bỏ qua id đã tồn tại); bỏ qua slug không hợp lệ thay vì lỗi cả lô.
- **Output**: `{ mergedLessons: number; mergedSessions: number; skipped: number }`

## Nhật ký tập

```ts
type PracticeSessionInput = {
  id: string            // uuid do client sinh
  practicedOn: string   // YYYY-MM-DD, ngày địa phương
  durationMinutes: number // 1–600
  lessonSlug?: string
  note?: string         // ≤ 500
  bpmReached?: number   // 30–250
}
```

### `logPracticeSession(input: PracticeSessionInput)`
- **Lỗi**: `VALIDATION` khi thời lượng ngoài 1–600 (message: "Thời lượng phải từ 1 đến 600
  phút"), ngày ở tương lai, BPM ngoài khoảng.
- **Output**: bản ghi đã lưu.

### `deletePracticeSession(input)` — `{ id }`

## Dashboard

### `getDashboard(input)` — Server Component data loader
- **Input**: `{ today: "YYYY-MM-DD" }` (ngày địa phương do client cung cấp)
- **Output**:
  ```ts
  {
    nextLesson: { slug, title, level } | null,
    levels: { level, completed, total, percent }[],
    minutesLast7Days: number,
    currentStreak: number,
    longestStreak: number,
    recentSessions: PracticeSession[] // 10 gần nhất
  }
  ```
- Khách: cùng hình dạng, được tính ở client từ `localStorage`.

## Tài khoản

### `updateProfile(input)` — `{ displayName?, timezone? }` (timezone phải là IANA hợp lệ)

### `deleteAccount(input)` — `{ confirm: "XOA TAI KHOAN" }`
- Xóa người dùng qua service role → cascade xóa mọi dữ liệu (FR-031); đăng xuất; redirect trang chủ.

## Xác thực (Supabase Auth)

| Luồng | Route |
|---|---|
| Gửi magic link | form ở `/dang-nhap` → `signInWithOtp({ email, emailRedirectTo: /auth/callback })` |
| Google | `signInWithOAuth({ provider: "google", redirectTo: /auth/callback })` |
| Callback | `GET /auth/callback?code=…` đổi code lấy session → chạy merge dữ liệu khách ở client → `/tong-quan` |
| Đăng xuất | `POST /auth/signout` |

## Số liệu ẩn danh

### `POST /api/events`
- **Body**: `{ events: { name: "page_view"|"tool_open"|"lesson_start"|"lesson_complete"; path: string; device: "mobile"|"desktop" }[] }` (≤ 20 sự kiện)
- **Hành vi**: bỏ query string khỏi path, làm tròn thời gian theo giờ, **không** đọc/lưu cookie,
  IP hay user agent. Gửi bằng `navigator.sendBeacon`.
- **Phản hồi**: `204` luôn luôn (kể cả lỗi kiểm tra, để không lộ thông tin); giới hạn tốc độ
  đơn giản theo instance.
