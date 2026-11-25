# Research: MVP website học guitar (Cấp 0–1)

**Feature**: [spec.md](./spec.md) | **Date**: 2026-11-24

Mỗi mục ghi: Quyết định, Lý do và Các phương án đã cân nhắc. Không còn mục NEEDS CLARIFICATION.

---

## R1. Framework và cách render

- **Decision**: Next.js (App Router, phiên bản ổn định mới nhất ≥ 16) + TypeScript `strict`.
  Trang bài học, lộ trình và thư viện hợp âm được **render tĩnh lúc build** (SSG). Tuner,
  metronome và dashboard là Client Component.
- **Rationale**: Constitution chốt Next.js. Nội dung đọc từ file nên SSG cho tải nhanh
  (LCP < 2.5s, SC-006) và SEO tốt; JS chỉ nạp ở các công cụ cần tương tác.
- **Alternatives**: Astro (nhẹ hơn cho nội dung nhưng kém hơn cho phần app có đăng nhập);
  Vite SPA (SEO kém).

## R2. Lưu và soạn nội dung (FR-008a)

- **Decision**: Bài học là file **MDX** trong `content/lessons/<level>/<slug>.mdx`, mỗi file
  `export const metadata = {...}`. Hợp âm và bài hát là **file dữ liệu TypeScript** trong
  `content/chords/` và `content/songs/`. Tất cả được kiểm tra bằng **zod** schema trong test
  và lúc build; build lỗi nếu thiếu trường hoặc sai liên kết (bài tiên quyết, hợp âm không tồn tại).
- **Rationale**: Theo clarification: không có trang quản trị, sửa file rồi deploy. MDX cho phép
  nhúng `<ChordDiagram>`, `<MetronomeExercise>` ngay trong bài. Dữ liệu dạng TS có type-check.
- **Alternatives**: Headless CMS (thừa cho một người soạn); Contentlayer (không còn bảo trì);
  Velite/content-collections (thêm một lớp phụ thuộc, chưa cần).

## R3. Dữ liệu nhạc lý và kiểm tra hợp âm (Constitution VII)

- **Decision**: Dùng thư viện **tonal** để tính nốt của hợp âm/gam. Một unit test duyệt toàn bộ
  thư viện hợp âm: với mỗi thế bấm, tính nốt từ (dây buông + ngăn) và so với `Chord.get(name).notes`.
- **Rationale**: Thư viện 84+ hợp âm soạn tay dễ sai; kiểm tra tự động là yêu cầu constitution.
  tonal nhỏ, thuần hàm, tree-shake được.
- **Alternatives**: Tự viết bảng nhạc lý (dễ sai, tốn công); dùng API hợp âm bên ngoài (không
  offline, phụ thuộc bản quyền dữ liệu).

## R4. Âm thanh mẫu hợp âm (FR-010)

- **Decision**: Tổng hợp tiếng dây gảy bằng **Tone.js `PluckSynth`** (thuật toán Karplus-Strong)
  từ nốt của thế bấm; hỗ trợ chế độ rải (cách nhau 60 ms) và đánh cả hợp âm (cách nhau 15 ms).
  Tone.js chỉ được nạp động (dynamic import) khi người dùng bấm nghe lần đầu.
- **Rationale**: Không cần 84+ file âm thanh, chạy offline, không có vấn đề bản quyền mẫu âm.
  Nạp động giữ ngân sách JS trang bài học < 200 KB.
- **Alternatives**: File mẫu thu sẵn (âm thật hơn nhưng nặng, phải tự thu); soundfont (nặng).

## R5. Tuner – nhận diện cao độ (FR-014–FR-018, SC-003)

- **Decision**: `getUserMedia` (tắt echoCancellation, noiseSuppression, autoGainControl) →
  `AnalyserNode` (fftSize 4096) → **pitchy** (McLeod Pitch Method) mỗi khung hình
  (`requestAnimationFrame`). Bỏ khung khi clarity < 0.9 hoặc RMS < ngưỡng (để hiện thông báo
  "chưa nghe rõ"). Làm mượt bằng **median của 5 kết quả** gần nhất. Tính cent so với nốt gần nhất
  (A4 = 440 Hz); tự xác định dây gần nhất trong E2–A2–D3–G3–B3–E4. "Chuẩn" khi |cent| ≤ 5.
  Chế độ dự phòng: phát nốt mẫu từng dây bằng PluckSynth.
- **Rationale**: MPM chính xác với tín hiệu đơn âm của guitar, kể cả dây E2 (82 Hz) — 4096 mẫu ở
  48 kHz đủ chứa ~7 chu kỳ. Tắt xử lý giọng nói tránh làm méo tín hiệu. Xử lý hoàn toàn trên
  thiết bị (Constitution IV).
- **Alternatives**: Autocorrelation tự viết (kém ổn định hơn); YIN (tương đương nhưng thư viện
  JS kém bảo trì); FFT peak (sai octave với dây trầm).

## R6. Metronome chính xác (FR-019–FR-024, SC-004)

- **Decision**: Tự viết bộ lập lịch theo mô hình **look-ahead scheduling**: bộ hẹn giờ 25 ms
  chạy trong **Web Worker** (không bị trình duyệt bóp khi tab nền), mỗi tick lên lịch các phách
  trong 100 ms tới bằng `AudioContext.currentTime`. Tiếng click là `OscillatorNode` + envelope
  ngắn (phách mạnh 1500 Hz, phách thường 1000 Hz). Đèn phách được đồng bộ bằng hàng đợi thời
  gian phách, vẽ trong `requestAnimationFrame`. Đổi BPM áp dụng từ phách kế tiếp. Tap tempo:
  trung bình 4–8 khoảng gần nhất, bỏ qua khoảng > 2 s.
- **Rationale**: Đây là kỹ thuật chuẩn để đạt sai lệch < 5 ms (Constitution IV). Logic lập lịch là
  hàm thuần → unit test được với đồng hồ giả.
- **Alternatives**: `Tone.Transport` (được, nhưng nặng hơn cho một tính năng nhỏ và khó kiểm thử
  thời gian); `setInterval` phát trực tiếp (bị constitution cấm).

## R7. Backend, đăng nhập và cơ sở dữ liệu (FR-025–FR-031)

- **Decision**: **Supabase**: Auth với **magic link email** + **Google OAuth**; Postgres với
  **Row Level Security** trên mọi bảng người dùng. Kết nối qua `@supabase/ssr` (cookie session),
  ghi dữ liệu qua **Server Actions** của Next.js.
- **Rationale**: Constitution chốt Supabase; đúng 2 phương thức đăng nhập đã clarify; RLS đảm bảo
  người dùng chỉ đọc/ghi dữ liệu của mình.
- **Alternatives**: Auth.js + Postgres riêng (nhiều việc vận hành hơn); Firebase (không phải SQL,
  lệch constitution).

## R8. Tiến độ khi chưa đăng nhập và đồng bộ offline (FR-026, Edge Cases)

- **Decision**: Lớp `ProgressStore` có 2 backend: `localStorage` (khách) và Supabase (đã đăng nhập).
  Mọi thay đổi được ghi vào **hàng đợi cục bộ** trước, rồi đẩy lên server; nếu mất mạng thì thử lại
  khi có sự kiện `online`. Khi khách đăng nhập lần đầu, gọi `mergeGuestProgress` (upsert, giữ
  `completed_at` sớm nhất) rồi xóa dữ liệu khách. Mọi thao tác **idempotent** nhờ khóa
  `(user_id, lesson_slug)` và `client_id` UUID cho buổi tập.
- **Rationale**: Đáp ứng "học không cần đăng nhập", "chuyển tiến độ khi đăng ký" và "mất mạng vẫn
  giữ thay đổi" với ít thành phần nhất.
- **Alternatives**: IndexedDB + thư viện đồng bộ (thừa cho vài chục bản ghi).

## R9. Chuỗi ngày tập và thống kê (FR-029, FR-030)

- **Decision**: Lưu `practiced_on` là **ngày địa phương** (kiểu `date`) do client tính theo múi giờ
  IANA của người dùng tại thời điểm ghi; `completed_at` của bài học lưu `timestamptz` kèm
  `completed_on` (date địa phương). Chuỗi ngày và tổng 7 ngày được tính bằng **hàm TypeScript
  thuần** `computeStreaks(days: string[], today: string)` từ danh sách ngày duy nhất.
- **Rationale**: Ngày địa phương được chốt lúc ghi nên không bị lệch khi đổi múi giờ; hàm thuần dễ
  test các trường hợp biên (bỏ 1 ngày, qua năm, nhiều buổi/ngày).
- **Alternatives**: Tính trong SQL view (khó test, phụ thuộc múi giờ server).

## R10. PWA và offline (FR-034, FR-035)

- **Decision**: **Serwist** (`@serwist/next`) tạo service worker: precache trang `/tools/*`,
  `/chords`, dữ liệu hợp âm và JS liên quan; trang bài học dùng `StaleWhileRevalidate`. Web App
  Manifest với icon, `display: standalone`, tên tiếng Việt.
- **Rationale**: Constitution yêu cầu PWA; Serwist là kế thừa được bảo trì của next-pwa.
- **Alternatives**: Tự viết service worker (dễ sai cache khi deploy); next-pwa (ngừng bảo trì).
- **Complexity note**: thư viện ngoài danh sách constitution → ghi trong Complexity Tracking.

## R11. Số liệu ẩn danh (FR-036, FR-037)

- **Decision**: Bảng `analytics_events` trong Supabase, ghi qua một Route Handler
  `POST /api/events` chỉ nhận danh sách sự kiện cố định (`page_view`, `tool_open`, `lesson_start`,
  `lesson_complete`). Không cookie, không lưu IP, không user_id; chỉ lưu tên sự kiện, đường dẫn,
  loại thiết bị (mobile/desktop) và thời điểm làm tròn đến giờ. Tỉ lệ hoàn thành/quay lại (SC-007,
  SC-008) tính bằng truy vấn tổng hợp trên `lesson_progress` và `practice_sessions`.
- **Rationale**: Không cần banner đồng ý, không thêm bên thứ ba, đủ đo các chỉ tiêu.
- **Alternatives**: Plausible/Umami (thêm dịch vụ phải trả phí hoặc tự host); Vercel Analytics
  (sự kiện tùy chỉnh cần gói trả phí).

## R12. Video nhúng (FR-008b)

- **Decision**: Component `<YouTubeEmbed id credit>` dạng **facade**: hiển thị ảnh thumbnail + nút
  phát, chỉ nạp iframe `youtube-nocookie.com` khi người dùng bấm; luôn hiện tên kênh và liên kết
  gốc bên dưới.
- **Rationale**: Iframe YouTube nặng ~500 KB+ và đặt cookie; facade giữ ngân sách hiệu năng và
  quyền riêng tư, đồng thời đáp ứng yêu cầu ghi nguồn.
- **Alternatives**: Nhúng iframe trực tiếp (vượt ngân sách JS, phá LCP).

## R13. Giao diện, ngôn ngữ và truy cập

- **Decision**: Tailwind CSS v4 + shadcn/ui; chế độ sáng/tối theo hệ thống. Chuỗi giao diện tập
  trung trong `src/i18n/vi.ts` (một từ điển, chưa dùng thư viện i18n). Kiểm tra a11y bằng
  `@axe-core/playwright` trong E2E.
- **Rationale**: Đúng constitution; từ điển tập trung giúp thêm ngôn ngữ sau này mà không thêm phụ
  thuộc lúc này (YAGNI).
- **Alternatives**: next-intl ngay từ đầu (chưa cần cho một ngôn ngữ).

## R14. Kiểm thử

- **Decision**: **Vitest** (+ Testing Library, jsdom) cho unit/component; **Playwright** cho E2E với
  2 cấu hình: mobile 360×800 và desktop 1280×800. Âm thanh được kiểm thử ở tầng logic thuần (bộ lập
  lịch metronome với đồng hồ giả; tuner với tín hiệu sin tổng hợp ở các tần số/cent đã biết).
  Supabase chạy local bằng Supabase CLI (Docker) cho E2E.
- **Rationale**: Đáp ứng Constitution VII; tín hiệu sin tổng hợp cho phép kiểm chứng SC-003
  (±3 cent) một cách tự động.
- **Alternatives**: Jest (chậm hơn, cấu hình ESM phức tạp hơn); Cypress (kém hỗ trợ đa trình duyệt).

## R15. Triển khai

- **Decision**: Vercel (preview cho mỗi nhánh, production từ `main`); Supabase gói miễn phí; biến
  môi trường `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` (chỉ server, dùng cho xóa tài khoản).
- **Rationale**: Đúng constitution, chi phí 0 đ ở quy mô MVP.
