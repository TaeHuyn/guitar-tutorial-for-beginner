<!--
Sync Impact Report
- Version change: (template) → 1.0.0
- Modified principles: tất cả placeholder → 7 nguyên tắc cụ thể (I–VII)
- Added sections: "Ràng buộc kỹ thuật", "Quy trình phát triển & Cổng chất lượng"
- Removed sections: none
- Templates: plan/spec/tasks templates đọc constitution lúc chạy — không cần sửa
- Deferred TODOs: none
-->

# GuitarTutorial Constitution

## Core Principles

### I. Lộ trình là trung tâm (Learner-First Progression)

- Mọi nội dung PHẢI thuộc về đúng một cấp độ (0–5) và có vị trí thứ tự rõ ràng trong lộ trình.
- Mỗi bài học PHẢI nêu: mục tiêu đầu ra đo được, kiến thức tiên quyết, thời lượng tập gợi ý.
- Người học PHẢI luôn biết "hôm nay tập gì tiếp theo" từ dashboard mà không cần tự tìm.
- Mỗi cấp độ PHẢI kết thúc bằng một bài kiểm tra lên cấp với tiêu chí đạt cụ thể
  (ví dụ: chuyển G→C ≥ 30 lần/phút, giữ nhịp ổn định ở 80 BPM).

Lý do: người tự học bỏ cuộc chủ yếu vì không biết bước tiếp theo, không phải vì thiếu tài liệu.

### II. Nội dung nguyên bản & Tôn trọng bản quyền (NON-NEGOTIABLE)

- Bài học, bài tập, tab và audio PHẢI do dự án tự soạn hoặc có giấy phép rõ ràng.
- KHÔNG ĐƯỢC sao chép văn bản, hình ảnh, tab, video của JustinGuitar, Hal Leonard, Mel Bay
  hay bất kỳ giáo trình thương mại nào. Chỉ được tham khảo cấu trúc lộ trình và dẫn link.
- Bài hát có bản quyền: chỉ hiển thị tên, hợp âm và điệu đệm; KHÔNG đăng toàn bộ lời bài hát
  hay bản ghi âm gốc.
- Video bên ngoài chỉ được nhúng qua trình phát chính thức (ví dụ YouTube embed).

Lý do: rủi ro pháp lý có thể khiến cả dự án bị gỡ bỏ.

### III. Luyện tập hơn xem (Practice Over Consumption)

- Mỗi bài học PHẢI có ít nhất một hoạt động thực hành: bài tập có metronome, sơ đồ hợp âm
  tương tác, bài hát áp dụng hoặc quiz.
- Thời gian luyện tập PHẢI được ghi nhận (practice log) và hiển thị lại cho người học.
- Tính năng mới PHẢI trả lời được câu hỏi: "Nó giúp người học tập nhiều hơn hoặc tốt hơn thế nào?"

Lý do: kỹ năng guitar đến từ luyện tập có chủ đích, không đến từ việc đọc.

### IV. Âm thanh chạy trên trình duyệt & Quyền riêng tư

- Tuner, metronome, luyện tai và nhận diện cao độ PHẢI chạy phía client bằng Web Audio API.
- Âm thanh từ micro KHÔNG ĐƯỢC tải lên server trừ khi người dùng chủ động đồng ý cho từng lần
  (ví dụ: đăng video nhờ góp ý).
- Xin quyền micro PHẢI đi kèm giải thích ngắn và có đường lui khi người dùng từ chối.
- Metronome PHẢI lập lịch bằng đồng hồ AudioContext (look-ahead scheduling), KHÔNG dùng
  `setInterval` để phát âm; độ lệch nhịp mục tiêu < 5 ms.

Lý do: độ trễ thấp, hoạt động offline, và bảo vệ dữ liệu nhạy cảm của người dùng.

### V. Mobile-first, Truy cập được & Nhanh

- Mọi trang PHẢI dùng tốt ở chiều rộng 360px; người học thường đặt điện thoại cạnh đàn.
- Nút bấm trong công cụ luyện tập PHẢI ≥ 44×44px và bấm được bằng một tay.
- Tuân thủ WCAG 2.1 AA: tương phản màu, nhãn cho trình đọc màn hình, điều khiển bằng bàn phím.
- Ngân sách hiệu năng: LCP < 2.5s trên 4G; JS ban đầu của trang bài học < 200 KB (gzip).
- Giao diện mặc định tiếng Việt; kiến trúc PHẢI cho phép thêm ngôn ngữ khác (i18n) về sau.

### VI. Đơn giản trước (Simplicity / YAGNI)

- Xây theo giai đoạn: MVP (cấp 0–1, hợp âm, tuner, metronome, tiến độ) PHẢI hoàn chỉnh
  trước khi làm tính năng giai đoạn sau.
- Không thêm thư viện, dịch vụ hay lớp trừu tượng nếu chưa có nhu cầu cụ thể đã ghi trong spec.
- Mọi độ phức tạp vượt mức PHẢI được ghi lý do trong mục "Complexity Tracking" của plan.

### VII. Kiểm thử phần cốt lõi

- Logic âm thanh và nhạc lý (nhận diện cao độ, tính nốt trên cần đàn, chuyển giọng, lập lịch
  metronome) PHẢI có unit test.
- Các luồng chính (đăng ký → học bài → đánh dấu hoàn thành → xem tiến độ) PHẢI có test E2E.
- Dữ liệu nhạc lý (hợp âm, thế bấm) PHẢI được kiểm tra tự động: nốt trong sơ đồ khớp với tên
  hợp âm.

## Ràng buộc kỹ thuật

- **Framework**: Next.js (App Router) + TypeScript ở chế độ `strict`.
- **Giao diện**: Tailwind CSS + shadcn/ui.
- **Nội dung bài học**: MDX lưu trong `content/`, quản lý bằng git; dữ liệu người dùng ở database.
- **Backend/DB/Auth**: Supabase (Postgres + Row Level Security bật cho mọi bảng chứa dữ liệu
  người dùng).
- **Âm thanh**: Web Audio API; thư viện được phép: `pitchy` (cao độ), `Tone.js` (tổng hợp âm),
  `alphaTab` (tab). Thư viện khác cần ghi lý do trong plan.
- **Triển khai**: Vercel; ứng dụng PHẢI hoạt động như PWA (cài được, công cụ chạy offline).
- **Bí mật**: khóa API chỉ để trong biến môi trường, KHÔNG commit vào repo.

## Quy trình phát triển & Cổng chất lượng

- Mỗi tính năng đi theo chu trình Spec Kit:
  `/speckit-specify` → `/speckit-clarify` (khi còn mơ hồ) → `/speckit-plan` → `/speckit-tasks`
  → `/speckit-implement`.
- Trước khi merge, PHẢI đạt: type-check, lint, unit test, E2E của luồng bị ảnh hưởng đều qua.
- Thay đổi UI PHẢI được kiểm tra trên khung mobile (360px) và desktop, cả chế độ sáng và tối.
- Nội dung bài học mới PHẢI được rà soát về độ chính xác nhạc lý và tính nguyên bản (Nguyên tắc II).

## Governance

- Constitution này có hiệu lực cao hơn mọi quy ước khác trong dự án. Mỗi plan PHẢI có mục
  "Constitution Check" xác nhận tuân thủ hoặc ghi rõ ngoại lệ có lý do.
- Sửa đổi: cập nhật file này qua `/speckit-constitution`, ghi Sync Impact Report, và tăng phiên bản
  theo semver — MAJOR khi bỏ/định nghĩa lại nguyên tắc, MINOR khi thêm nguyên tắc/mục,
  PATCH khi sửa câu chữ.
- Rà soát tuân thủ khi kết thúc mỗi giai đoạn (MVP, Giai đoạn 2, Giai đoạn 3).

**Version**: 1.0.0 | **Ratified**: 2026-11-24 | **Last Amended**: 2026-11-24
