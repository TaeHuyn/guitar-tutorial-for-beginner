# Data Model: MVP website học guitar (Cấp 0–1)

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Dữ liệu chia 2 nhóm:

1. **Nội dung** (file trong repo, chỉ đọc lúc chạy): Level, Lesson, Exercise, Chord, Song.
   Schema chi tiết: [contracts/content-schema.md](./contracts/content-schema.md).
2. **Dữ liệu người dùng** (Supabase Postgres, có RLS): Profile, LessonProgress, PracticeSession,
   AnalyticsEvent.

Nội dung và dữ liệu người dùng liên kết qua **slug** (chuỗi bất biến), không qua khóa ngoại.

```text
Level 1──* Lesson 1──* Exercise
Lesson *──* Chord        (lesson.chords[])
Lesson *──* Song         (lesson.songs[])
Song   *──* Chord        (song.chords[])
User   1──1 Profile
User   1──* LessonProgress ──> Lesson (qua lesson_slug)
User   1──* PracticeSession ──> Lesson? (qua lesson_slug, tùy chọn)
AnalyticsEvent            (không liên kết người dùng)
```

---

## 1. Nội dung (file)

### Level

| Trường | Kiểu | Ràng buộc |
|---|---|---|
| `id` | số nguyên | 0–5; MVP chỉ có 0 và 1 |
| `slug` | string | `level-0`, `level-1` |
| `title` | string | "Chuẩn bị", "Nền tảng" |
| `description` | string | ≤ 300 ký tự |
| `lessons` | string[] | slug bài học theo **thứ tự** lộ trình; mọi slug phải tồn tại |
| `levelTest` | LevelTestCriterion[] | ≥ 1 tiêu chí (FR-006) |

**LevelTestCriterion**: `{ id, description, target? }`, ví dụ
`{ id: "g-c-switch", description: "Chuyển G→C", target: "≥ 30 lần/phút" }`.

### Lesson

| Trường | Kiểu | Ràng buộc |
|---|---|---|
| `slug` | string | duy nhất toàn site, kebab-case, **không đổi** sau khi phát hành |
| `level` | 0–5 | khớp Level chứa nó |
| `title` | string | bắt buộc |
| `type` | `theory` \| `technique` \| `song` | |
| `objective` | string | mục tiêu đầu ra đo được (FR-002) |
| `practiceMinutes` | số nguyên | 5–60 |
| `prerequisites` | string[] | slug bài học; không tạo vòng lặp; phải đứng trước trong lộ trình |
| `chords` | string[] | id hợp âm có trong thư viện |
| `songs` | string[] | id bài hát |
| `video` | `{ youtubeId, channel, url }?` | tùy chọn; nếu có thì bắt buộc đủ `channel` + `url` (FR-008b) |
| `exercises` | Exercise[] | **≥ 1** (FR-002, Constitution III) |
| `references` | `{ title, author, url? }[]` | tài liệu tham khảo bên ngoài (FR-007) |
| body | MDX | nội dung chính |

### Exercise

| Trường | Kiểu | Ràng buộc |
|---|---|---|
| `id` | string | duy nhất trong bài |
| `instruction` | string | việc cần tập |
| `bpm` | số nguyên? | 30–250 (FR-019) |
| `timeSignature` | `2/4` \| `3/4` \| `4/4` \| `6/8`? | mặc định `4/4` |
| `durationMinutes` | số nguyên? | |
| `passCriterion` | string? | ví dụ "Chuyển 20 lần không dừng" |

Bài tập có `bpm` sẽ hiển thị nút "Tập với metronome" mở metronome cài sẵn (FR-024).

### Chord

| Trường | Kiểu | Ràng buộc |
|---|---|---|
| `id` | string | dạng URL-safe: `c`, `cm`, `c-sharp-m7`, `b-flat-maj7` |
| `name` | string | ký hiệu hiển thị: `C`, `Cm`, `C#m7`, `B♭maj7` |
| `root` | 1 trong 12 nốt | lưu dạng thăng (C, C#, D…); hiển thị kèm tên giáng tương đương |
| `quality` | `major` \| `minor` \| `7` \| `m7` \| `maj7` \| `sus2` \| `sus4` | FR-011 |
| `aliases` | string[] | dùng cho tìm kiếm: `Db`, `C#`, `Bb`… |
| `voicings` | Voicing[] | ≥ 1; **phần tử đầu là thế dễ nhất** (US4-AS3) |
| `lessonSlug` | string? | bài dạy hợp âm này (FR-013) |

**Voicing**

| Trường | Kiểu | Ràng buộc |
|---|---|---|
| `frets` | 6 phần tử, dây 6→1 | `-1` = không đánh (X), `0` = buông (O), `1–15` = ngăn |
| `fingers` | 6 phần tử | `0` = không bấm, `1–4` = ngón trỏ→út |
| `barre` | `{ fret, fromString, toString }?` | |
| `baseFret` | số nguyên | ≥ 1; > 1 thì sơ đồ hiển thị số ngăn bắt đầu |
| `difficulty` | 1–5 | |

**Quy tắc kiểm tra (unit test, Constitution VII)**: tập nốt sinh ra từ `frets` (dây buông chuẩn
E2 A2 D3 G3 B3 E4) phải **bằng** tập nốt của hợp âm theo `tonal` (cho phép thiếu quãng 5);
nốt thấp nhất phải là nốt gốc (trừ khi voicing được đánh dấu là đảo).

### Song

| Trường | Kiểu | Ràng buộc |
|---|---|---|
| `id` | string | |
| `title`, `artist`, `composer` | string | |
| `officialUrl` | URL | liên kết bản chính thức (FR-005) |
| `level` | 0–5 | |
| `capo` | số nguyên | 0–7; > 0 thì hiển thị nổi bật |
| `bpm` | số nguyên | |
| `strumPattern` | string | ví dụ `D-DU-UDU` |
| `sections` | `{ name, chords: string[] }[]` | ví dụ `{ name: "Điệp khúc", chords: ["c","g","am","em"] }` |
| `simplifiedFrom` | string? | ghi chú hợp âm gốc đã được thay (Edge Case) |
| `chords` | string[] | suy ra từ `sections`; với bài Cấp 1 **phải ⊆ 8 hợp âm Cấp 1** (FR-004) |

**Không có** trường lời bài hát hay file âm thanh (FR-005, Constitution II).

---

## 2. Dữ liệu người dùng (Postgres)

Mọi bảng bật **RLS**; chính sách mặc định: người dùng chỉ `select/insert/update/delete` các
hàng có `user_id = auth.uid()`. Xóa người dùng ở `auth.users` → `on delete cascade` xóa toàn bộ
dữ liệu (FR-031).

### profiles

| Cột | Kiểu | Ràng buộc |
|---|---|---|
| `user_id` | uuid PK | FK → `auth.users.id`, on delete cascade |
| `display_name` | text | ≤ 50 ký tự, mặc định lấy từ email/Google |
| `timezone` | text | tên IANA, mặc định `Asia/Ho_Chi_Minh` |
| `current_level` | smallint | 0–5, mặc định 0 |
| `created_at` | timestamptz | default now() |

Tạo tự động bằng trigger khi có người dùng mới trong `auth.users`.

### lesson_progress

| Cột | Kiểu | Ràng buộc |
|---|---|---|
| `user_id` | uuid | FK → profiles, on delete cascade |
| `lesson_slug` | text | phải là slug hợp lệ (kiểm tra ở server action) |
| `status` | text | `completed` |
| `completed_at` | timestamptz | |
| `completed_on` | date | ngày địa phương của người dùng (R9) |
| `updated_at` | timestamptz | |

- **PK** `(user_id, lesson_slug)` → thao tác idempotent.
- **Chuyển trạng thái**: *(chưa có hàng)* ⇄ `completed`. Bỏ đánh dấu (FR-027) = xóa hàng.
- **Gộp dữ liệu khách**: upsert, giữ `completed_at` **sớm hơn**.
- Trạng thái "đang học" không lưu; được suy ra là bài đầu tiên chưa hoàn thành trong lộ trình.

### practice_sessions

| Cột | Kiểu | Ràng buộc |
|---|---|---|
| `id` | uuid PK | do client sinh (`client_id`) → idempotent khi gửi lại lúc có mạng |
| `user_id` | uuid | FK → profiles, on delete cascade |
| `practiced_on` | date | ngày địa phương; không ở tương lai (> hôm nay + 1 để chịu lệch múi giờ) |
| `duration_minutes` | smallint | **CHECK 1–600** (FR-028) |
| `lesson_slug` | text? | |
| `note` | text? | ≤ 500 ký tự |
| `bpm_reached` | smallint? | 30–250 |
| `created_at` | timestamptz | |

Index: `(user_id, practiced_on desc)`.

### analytics_events

| Cột | Kiểu | Ràng buộc |
|---|---|---|
| `id` | bigint identity | |
| `name` | text | CHECK ∈ {`page_view`,`tool_open`,`lesson_start`,`lesson_complete`} |
| `path` | text | ≤ 200 ký tự, không có query string |
| `device` | text | `mobile` \| `desktop` |
| `occurred_hour` | timestamptz | làm tròn xuống theo giờ |

**Không có** user_id, IP hay user agent (FR-036). RLS: không ai đọc được qua API công khai; chỉ ghi
qua Route Handler bằng service role.

---

## 3. Dữ liệu cục bộ trên thiết bị (khách / offline)

`localStorage` khóa `gt:v1:guest`:

```text
{
  version: 1,
  completed: { [lessonSlug]: { completedAt: ISO, completedOn: "YYYY-MM-DD" } },
  sessions: PracticeSession[] (cùng hình dạng như bảng, có id),
  pendingOps: Op[]   // hàng đợi gửi server khi đã đăng nhập nhưng mất mạng
}
```

Cài đặt công cụ (`gt:v1:metronome`, `gt:v1:tuner`): BPM, nhịp, âm lượng gần nhất — chỉ là tiện
ích, mất cũng không sao.

## 4. Giá trị suy ra (không lưu)

| Giá trị | Cách tính |
|---|---|
| Bài tiếp theo | bài đầu tiên chưa hoàn thành theo thứ tự lộ trình |
| % hoàn thành cấp | số bài hoàn thành / tổng bài của cấp |
| Phút tập 7 ngày | tổng `duration_minutes` có `practiced_on` ∈ [hôm nay−6, hôm nay] |
| Chuỗi hiện tại / dài nhất | `computeStreaks(ngày duy nhất từ practiced_on ∪ completed_on, hôm nay)`; chuỗi hiện tại vẫn giữ nếu hôm nay chưa tập nhưng hôm qua có tập |
