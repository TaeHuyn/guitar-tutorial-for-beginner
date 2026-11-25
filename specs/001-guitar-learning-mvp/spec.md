# Feature Specification: MVP website học guitar cho người mới (Cấp 0–1)

**Feature Branch**: `001-guitar-learning-mvp` (dự án chưa có git — tên nhánh dự kiến)

**Created**: 2026-11-24

**Status**: Draft

**Input**: User description: "MVP của website học guitar: bài học cấp 0 (chuẩn bị) và cấp 1
(8 hợp âm mở, quạt chả), thư viện hợp âm có sơ đồ, máy lên dây (tuner), máy đếm nhịp
(metronome), đăng nhập và theo dõi tiến độ — đủ để người mới lên dây → học hợp âm → tập theo
nhịp → đệm được bài hát đầu tiên."

## Clarifications

### Session 2026-11-24

- Q: Trong MVP, ai soạn và cập nhật bài học, bằng cách nào? → A: Người phát triển viết bài dưới
  dạng file văn bản trong dự án và triển khai lại khi sửa; MVP không có trang quản trị.
- Q: Video hướng dẫn trong bài học lấy từ đâu? → A: Ban đầu nhúng video YouTube công khai của kênh
  khác qua trình phát chính thức, ghi rõ nguồn; dần thay bằng video tự quay. Video là tùy chọn.
- Q: Người dùng đăng nhập bằng những cách nào? → A: Email (liên kết đăng nhập, không mật khẩu) và
  Google; Facebook/Zalo để sau MVP.
- Q: 5 bài hát áp dụng ở Cấp 1 nên là loại nào? → A: Cả 5 bài là ballad Việt Nam nổi tiếng (hàng
  triệu lượt xem) của ca sĩ hàng đầu như Soobin, Sơn Tùng; dùng bản đệm đơn giản hóa (có thể kẹp
  capo) để chỉ cần các hợp âm Cấp 1.
- Q: Có thu thập số liệu sử dụng để đo chỉ tiêu thành công không? → A: Có, ở dạng ẩn danh, không
  cookie theo dõi, không cần banner đồng ý; tỉ lệ hoàn thành/quay lại tính từ dữ liệu tiến độ tài
  khoản.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Học theo lộ trình Cấp 0 và Cấp 1 (Priority: P1)

Một người chưa từng chơi guitar mở website, thấy ngay lộ trình gồm Cấp 0 "Chuẩn bị" và Cấp 1
"Nền tảng", bấm vào bài đầu tiên và học lần lượt: cấu tạo đàn, tư thế cầm đàn, cách đọc sơ đồ
hợp âm và tab, rồi đến từng hợp âm mở (Em, Am, D, A, E, G, C, Dm — xem FR-004),
các điệu quạt cơ bản và bài hát áp dụng. Mỗi bài có giải thích, hình minh họa/sơ đồ, một bài tập
thực hành và (nếu có) video hướng dẫn.

**Why this priority**: Đây là giá trị cốt lõi của sản phẩm — một lộ trình rõ ràng cho người mới.
Không có phần này, website chỉ là tập hợp công cụ.

**Independent Test**: Người thử nghiệm chưa biết chơi đàn có thể đi từ bài đầu tiên đến bài cuối
Cấp 1 chỉ bằng nút "Bài tiếp theo", và mỗi bài đều có mục tiêu, nội dung và bài tập.

**Acceptance Scenarios**:

1. **Given** người dùng lần đầu vào trang chủ, **When** họ bấm "Bắt đầu học", **Then** họ được đưa
   đến bài đầu tiên của Cấp 0 mà không bắt buộc đăng ký.
2. **Given** người dùng đang ở một bài học, **When** họ xem trang, **Then** họ thấy mục tiêu bài,
   thời lượng tập gợi ý, nội dung, ít nhất một bài tập thực hành và nút "Bài tiếp theo".
3. **Given** người dùng đang xem bài về hợp âm G, **When** họ nhìn sơ đồ hợp âm, **Then** sơ đồ
   hiển thị vị trí ngón, số ngón tay, dây buông/dây không đánh và họ có thể nghe âm thanh mẫu.
4. **Given** người dùng ở bài cuối Cấp 1, **When** họ mở bài kiểm tra lên cấp, **Then** họ thấy danh
   sách tiêu chí tự đánh giá cụ thể (ví dụ: chuyển G→C ít nhất 30 lần/phút; đệm trọn một bài hát
   ở 80 BPM không dừng).

---

### User Story 2 - Lên dây đàn bằng tuner (Priority: P2)

Người dùng cầm đàn, mở công cụ lên dây, cho phép dùng micro, gảy từng dây và nhìn kim chỉ báo
cho biết nốt đang thấp, cao hay đã chuẩn, cho đến khi cả 6 dây đúng E–A–D–G–B–E.

**Why this priority**: Đàn lạc dây khiến người mới tập sai tai và nản ngay từ đầu; đây là bước
đầu tiên trước mỗi buổi tập.

**Independent Test**: Gảy một dây đàn đã biết lệch cao độ trước micro và xác nhận công cụ báo
đúng tên nốt và hướng chỉnh (lên/xuống).

**Acceptance Scenarios**:

1. **Given** người dùng mở tuner lần đầu, **When** trang yêu cầu quyền micro, **Then** có giải thích
   ngắn vì sao cần micro và cam kết âm thanh không rời khỏi thiết bị.
2. **Given** quyền micro đã được cấp, **When** người dùng gảy dây Mi trầm hơi chùng, **Then** tuner
   hiển thị nốt E, báo "thấp" và chỉ dẫn vặn lên.
3. **Given** dây đã đúng cao độ (sai lệch trong ±5 cent), **When** người dùng gảy, **Then** tuner
   hiển thị trạng thái "Chuẩn" rõ ràng bằng màu và chữ.
4. **Given** người dùng từ chối quyền micro, **When** họ ở trang tuner, **Then** họ được cung cấp
   chế độ lên dây bằng tai: nghe nốt mẫu của từng dây.

---

### User Story 3 - Tập theo máy đếm nhịp (Priority: P3)

Người dùng mở metronome, chọn tốc độ (BPM) và số phách, bấm bắt đầu và tập chuyển hợp âm hoặc
quạt chả theo tiếng nhịp. Metronome cũng xuất hiện ngay trong các bài tập có yêu cầu tốc độ.

**Why this priority**: Giữ nhịp là kỹ năng nền tảng, và bài tập ở Cấp 1 đều cần nhịp đều.

**Independent Test**: Chạy metronome ở 60 BPM trong 1 phút và đếm được đúng 60 tiếng, phách
mạnh đầu ô nhịp phân biệt rõ.

**Acceptance Scenarios**:

1. **Given** metronome đang dừng, **When** người dùng đặt 80 BPM, nhịp 4/4 và bấm bắt đầu, **Then**
   nghe 4 tiếng mỗi ô nhịp với tiếng đầu nhấn mạnh và chỉ báo hình ảnh nhấp nháy theo phách.
2. **Given** metronome đang chạy, **When** người dùng thay đổi BPM, **Then** tốc độ mới áp dụng ngay
   mà không bị ngắt quãng hay lệch nhịp.
3. **Given** người dùng không biết tốc độ bài hát, **When** họ gõ nút "Tap tempo" theo nhạc ít nhất
   4 lần, **Then** BPM được ước lượng và điền tự động.
4. **Given** một bài tập Cấp 1 yêu cầu "tập ở 60 BPM", **When** người dùng bấm vào bài tập, **Then**
   metronome mở sẵn với 60 BPM.

---

### User Story 4 - Tra cứu thư viện hợp âm (Priority: P4)

Người dùng muốn đệm một bài hát có hợp âm Bm, tìm "Bm" trong thư viện hợp âm, xem sơ đồ, nghe
âm thanh mẫu và biết hợp âm này thuộc cấp độ nào trong lộ trình.

**Why this priority**: Hữu ích ngay cả với người đã biết chơi chút ít; tăng lượt quay lại, nhưng
không quan trọng bằng lộ trình và công cụ cơ bản.

**Independent Test**: Tìm 10 hợp âm thông dụng bất kỳ và mỗi hợp âm đều trả về sơ đồ đúng.

**Acceptance Scenarios**:

1. **Given** người dùng ở thư viện hợp âm, **When** họ gõ "bm" (không phân biệt hoa/thường),
   **Then** thấy hợp âm Bm với sơ đồ thế bấm và nút nghe thử.
2. **Given** người dùng lọc theo nốt gốc "A", **When** kết quả hiển thị, **Then** có A, Am, A7, Am7,
   Asus2, Asus4, Amaj7.
3. **Given** một hợp âm có nhiều thế bấm, **When** người dùng xem hợp âm, **Then** thế bấm dễ nhất
   cho người mới hiển thị đầu tiên.
4. **Given** hợp âm được dạy trong một bài học, **When** người dùng xem hợp âm đó, **Then** có liên
   kết đến bài học tương ứng.

---

### User Story 5 - Tài khoản, tiến độ và nhật ký tập (Priority: P5)

Người dùng tạo tài khoản để lưu tiến độ: đánh dấu bài đã học, ghi lại buổi tập (bao nhiêu phút,
tập gì, đạt bao nhiêu BPM), xem chuỗi ngày tập liên tiếp, và trang tổng quan cho biết "Hôm nay
tập gì tiếp theo".

**Why this priority**: Giữ chân người học và tạo động lực, nhưng người dùng vẫn học được mà
không cần tính năng này.

**Independent Test**: Tạo tài khoản, hoàn thành 3 bài, ghi 2 buổi tập, đăng xuất, đăng nhập trên
thiết bị khác và thấy đúng toàn bộ dữ liệu đó.

**Acceptance Scenarios**:

1. **Given** khách (chưa đăng nhập) đã đánh dấu hoàn thành 2 bài, **When** họ tạo tài khoản,
   **Then** 2 bài đó được chuyển vào tài khoản mới.
2. **Given** người dùng đã đăng nhập, **When** họ bấm "Đã học xong" ở một bài, **Then** bài đó được
   đánh dấu hoàn thành trong lộ trình và thanh tiến độ cấp độ tăng tương ứng.
3. **Given** người dùng mở trang tổng quan, **When** trang hiển thị, **Then** họ thấy bài học tiếp
   theo, tổng số phút tập trong 7 ngày, chuỗi ngày tập liên tiếp và phần trăm hoàn thành từng cấp.
4. **Given** người dùng vừa kết thúc một buổi tập, **When** họ ghi nhật ký với thời lượng, nội dung
   và BPM đạt được, **Then** buổi tập xuất hiện trong lịch sử và được tính vào chuỗi ngày.
5. **Given** người dùng tập liên tục 3 ngày rồi bỏ 1 ngày, **When** họ mở trang tổng quan ở ngày thứ
   5, **Then** chuỗi ngày hiện tại về 0 và chuỗi dài nhất vẫn là 3.

---

### Edge Cases

- Trình duyệt không hỗ trợ micro hoặc người dùng từ chối quyền: tuner chuyển sang chế độ nghe nốt
  mẫu, không báo lỗi khó hiểu.
- Phòng ồn hoặc âm thanh quá nhỏ: tuner hiển thị "Chưa nghe rõ, hãy gảy mạnh hơn hoặc đưa đàn lại
  gần" thay vì nhảy nốt lung tung.
- Người dùng chuyển sang tab khác khi metronome đang chạy: metronome tiếp tục giữ nhịp đúng.
- Điện thoại ở chế độ im lặng: hiển thị nhắc nhở rằng âm thanh có thể bị tắt.
- Video bài học không tải được (mạng yếu): nội dung chữ và sơ đồ vẫn hiển thị đầy đủ.
- Người dùng nhảy thẳng đến bài giữa lộ trình: vẫn được xem, kèm gợi ý các bài tiên quyết chưa học.
- Bản gốc bài hát dùng hợp âm ngoài Cấp 1 (ví dụ F, Bm): hiển thị bản đơn giản hóa (đổi hợp âm
  tương đương hoặc dùng capo) và ghi chú hợp âm gốc sẽ học ở cấp sau.
- Tìm hợp âm không tồn tại (ví dụ "H7"): thông báo không tìm thấy và gợi ý hợp âm gần đúng.
- Ghi nhật ký tập với thời lượng không hợp lệ (0 phút hoặc trên 600 phút): bị từ chối kèm lời
  nhắc.
- Người dùng ở múi giờ khác: chuỗi ngày tập tính theo ngày địa phương của người dùng.
- Mất kết nối khi đánh dấu hoàn thành bài: thay đổi được giữ lại và đồng bộ khi có mạng.

## Requirements *(mandatory)*

### Functional Requirements

**Lộ trình và bài học**

- **FR-001**: Hệ thống PHẢI hiển thị lộ trình gồm Cấp 0 "Chuẩn bị" và Cấp 1 "Nền tảng", mỗi cấp có
  danh sách bài học theo thứ tự cố định.
- **FR-002**: Mỗi bài học PHẢI có: tiêu đề, mục tiêu đầu ra, thời lượng tập gợi ý, kiến thức tiên
  quyết, nội dung chính, ít nhất một bài tập thực hành, và điều hướng bài trước/bài tiếp theo.
- **FR-003**: Cấp 0 PHẢI bao gồm tối thiểu: cấu tạo đàn và chọn đàn, tư thế ngồi và cầm đàn, cách
  lên dây, cách đọc sơ đồ hợp âm, cách đọc tab cơ bản, cách cầm pick và gảy.
- **FR-004**: Cấp 1 PHẢI dạy 8 hợp âm mở: Em, Am, D, A, E, G, C, Dm; ít nhất 3 điệu quạt cơ bản;
  bài tập chuyển hợp âm theo cặp; và 5 bài hát áp dụng là ballad Việt Nam nổi tiếng của các ca sĩ
  hàng đầu (ví dụ Soobin, Sơn Tùng). Mỗi bài hát PHẢI có bản đệm đơn giản hóa chỉ dùng 8 hợp âm
  Cấp 1, được phép dùng capo và PHẢI ghi rõ vị trí capo nếu có.
- **FR-005**: Bài hát áp dụng PHẢI chỉ hiển thị tên bài, ca sĩ, tác giả, hợp âm theo cấu trúc bài
  (đoạn A, điệp khúc...), điệu đệm, tốc độ gợi ý, vị trí capo và liên kết đến bản nhạc chính thức;
  KHÔNG hiển thị toàn bộ lời bài hát có bản quyền và KHÔNG phát lại bản ghi âm gốc.
- **FR-006**: Mỗi cấp PHẢI kết thúc bằng một bài kiểm tra lên cấp gồm các tiêu chí tự đánh giá đo
  được; người dùng tự xác nhận từng tiêu chí.
- **FR-007**: Mọi nội dung bài học PHẢI là nội dung nguyên bản của dự án; các giáo trình bên ngoài
  chỉ xuất hiện dưới dạng "Tài liệu tham khảo" có dẫn nguồn.
- **FR-008**: Người dùng PHẢI xem được mọi bài học mà không cần đăng nhập.
- **FR-008a**: Bài học, bài tập, hợp âm và bài hát PHẢI được soạn dưới dạng file văn bản lưu trong
  dự án; thay đổi nội dung có hiệu lực sau khi triển khai lại. MVP KHÔNG có giao diện quản trị nội
  dung.
- **FR-008b**: Video trong bài học là tùy chọn. Video của bên thứ ba CHỈ được nhúng bằng trình phát
  chính thức của nền tảng, kèm tên kênh và liên kết đến video gốc; KHÔNG tải về hay lưu lại. Bài
  học PHẢI đầy đủ ý nghĩa ngay cả khi không có video.

**Sơ đồ và thư viện hợp âm**

- **FR-009**: Sơ đồ hợp âm PHẢI hiển thị: 6 dây, ngăn đàn, vị trí bấm, số ngón tay, dây buông (O),
  dây không đánh (X), barre nếu có, và ngăn bắt đầu nếu không ở ngăn 1.
- **FR-010**: Mỗi hợp âm PHẢI có âm thanh mẫu nghe được (rải từng dây và đánh cả hợp âm).
- **FR-011**: Thư viện PHẢI chứa ít nhất 12 nốt gốc × 7 loại hợp âm: trưởng, thứ, 7, m7, maj7, sus2,
  sus4.
- **FR-012**: Người dùng PHẢI tìm được hợp âm theo tên (không phân biệt hoa/thường, chấp nhận cả
  ký hiệu thăng/giáng như C#, Db) và lọc theo nốt gốc hoặc loại hợp âm.
- **FR-013**: Hợp âm có trong lộ trình PHẢI liên kết đến bài học dạy hợp âm đó.

**Tuner (máy lên dây)**

- **FR-014**: Tuner PHẢI nhận diện cao độ từ micro và hiển thị tên nốt gần nhất, độ lệch tính bằng
  cent, và hướng chỉnh (thấp/cao/chuẩn).
- **FR-015**: Tuner PHẢI coi là "chuẩn" khi độ lệch trong ±5 cent.
- **FR-016**: Tuner PHẢI hỗ trợ lên dây chuẩn E–A–D–G–B–E và hiển thị dây nào đang được lên.
- **FR-017**: Âm thanh từ micro PHẢI chỉ được xử lý trên thiết bị người dùng và KHÔNG được gửi đi
  đâu.
- **FR-018**: Tuner PHẢI có chế độ thay thế phát nốt mẫu của từng dây khi không dùng được micro.

**Metronome (máy đếm nhịp)**

- **FR-019**: Metronome PHẢI cho chọn tốc độ từ 30 đến 250 BPM, bằng thanh trượt, nút +/− và nhập số.
- **FR-020**: Metronome PHẢI hỗ trợ nhịp 2/4, 3/4, 4/4, 6/8 với phách đầu nhấn mạnh.
- **FR-021**: Metronome PHẢI có chỉ báo hình ảnh theo từng phách, đồng bộ với âm thanh.
- **FR-022**: Metronome PHẢI có chức năng "Tap tempo".
- **FR-023**: Metronome PHẢI giữ nhịp đều, sai lệch mỗi phách không người nghe nhận ra được, kể cả
  khi chạy liên tục 10 phút.
- **FR-024**: Bài tập trong bài học PHẢI mở được metronome với tốc độ và nhịp đã cài sẵn.

**Tài khoản, tiến độ và nhật ký tập**

- **FR-025**: Người dùng PHẢI tạo được tài khoản và đăng nhập bằng email (liên kết đăng nhập gửi
  qua email) hoặc tài khoản Google.
- **FR-026**: Khi chưa đăng nhập, tiến độ PHẢI được lưu trên thiết bị và chuyển vào tài khoản khi
  người dùng đăng ký.
- **FR-027**: Người dùng PHẢI đánh dấu được bài học "Đã học xong" và bỏ đánh dấu.
- **FR-028**: Người dùng PHẢI ghi được buổi tập gồm: ngày, thời lượng (1–600 phút), nội dung tập
  (chọn từ bài học hoặc ghi chú tự do), và BPM đạt được (không bắt buộc).
- **FR-029**: Trang tổng quan PHẢI hiển thị: bài học tiếp theo đề xuất, % hoàn thành mỗi cấp, tổng
  phút tập 7 ngày gần nhất, chuỗi ngày tập hiện tại và dài nhất.
- **FR-030**: Một ngày được tính vào chuỗi khi có ít nhất một buổi tập được ghi hoặc một bài học được
  hoàn thành trong ngày đó, theo giờ địa phương của người dùng.
- **FR-031**: Người dùng PHẢI xóa được tài khoản cùng toàn bộ dữ liệu của mình.

**Chung**

- **FR-032**: Toàn bộ giao diện PHẢI bằng tiếng Việt.
- **FR-033**: Mọi trang và công cụ PHẢI dùng được đầy đủ trên điện thoại màn hình rộng 360px và trên
  máy tính.
- **FR-034**: Tuner, metronome và thư viện hợp âm PHẢI dùng được khi không có mạng sau lần truy cập
  đầu tiên.
- **FR-035**: Website PHẢI cài được lên màn hình chính điện thoại như một ứng dụng.
- **FR-036**: Hệ thống PHẢI ghi nhận số liệu sử dụng ở dạng ẩn danh (lượt xem trang, mở công cụ,
  bắt đầu/hoàn thành bài học) mà KHÔNG dùng cookie theo dõi và KHÔNG lưu dữ liệu nhận dạng cá nhân
  trong số liệu này; không yêu cầu banner đồng ý cookie.
- **FR-037**: Chỉ tiêu tỉ lệ hoàn thành cấp độ và tỉ lệ quay lại PHẢI tính được từ dữ liệu tiến độ
  và nhật ký tập của người dùng đã đăng ký, dưới dạng số tổng hợp.

### Key Entities

- **Cấp độ (Level)**: Một giai đoạn trong lộ trình (0–5; MVP gồm 0 và 1). Có tên, mô tả, thứ tự,
  danh sách bài học và bài kiểm tra lên cấp.
- **Bài học (Lesson)**: Thuộc một cấp độ, có thứ tự, loại (lý thuyết / kỹ thuật / bài hát), mục tiêu,
  thời lượng gợi ý, bài tiên quyết, nội dung, bài tập.
- **Bài tập (Exercise)**: Thuộc một bài học; mô tả việc cần tập, tốc độ và nhịp gợi ý, tiêu chí đạt.
- **Hợp âm (Chord)**: Tên, nốt gốc, loại, một hoặc nhiều thế bấm (vị trí ngón, dây buông/tắt,
  ngăn bắt đầu), độ khó, âm thanh mẫu, bài học liên quan.
- **Bài hát (Song)**: Tên, tác giả, các hợp âm dùng, điệu đệm, tốc độ gợi ý, độ khó, cấp độ.
- **Người dùng (User)**: Thông tin đăng nhập, tên hiển thị, múi giờ, cấp độ hiện tại.
- **Tiến độ bài học (Lesson Progress)**: Người dùng × bài học: trạng thái, ngày hoàn thành.
- **Buổi tập (Practice Session)**: Thuộc người dùng: ngày, thời lượng, nội dung, BPM đạt được, ghi chú.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người mới hoàn toàn bắt đầu bài học đầu tiên trong vòng 30 giây kể từ khi vào trang
  chủ, không cần đăng ký.
- **SC-002**: 90% người thử nghiệm lên dây đủ 6 dây bằng tuner trong dưới 3 phút ở lần dùng đầu tiên.
- **SC-003**: Tuner báo nốt sai lệch không quá ±3 cent so với một tuner chuẩn đối chứng, trong môi
  trường phòng yên tĩnh.
- **SC-004**: Metronome chạy 10 phút ở 120 BPM cho đúng 1200 phách, người nghe không phát hiện phách
  nào lệch.
- **SC-005**: Người dùng tìm được một hợp âm bất kỳ trong thư viện trong dưới 10 giây.
- **SC-006**: Trang bài học hiển thị nội dung chính trong vòng 2,5 giây trên mạng di động 4G.
- **SC-007**: Ít nhất 30% người dùng đăng ký hoàn thành toàn bộ Cấp 0 trong 2 tuần đầu.
- **SC-008**: Ít nhất 40% người dùng đăng ký quay lại tập trong vòng 7 ngày sau lần đầu.
- **SC-009**: Ít nhất 80% người thử nghiệm đánh giá lộ trình "rõ ràng, biết phải học gì tiếp theo"
  (4/5 điểm trở lên trong khảo sát).

## Assumptions

- Người học dùng guitar acoustic hoặc classic, lên dây chuẩn; các kiểu lên dây khác (Drop D,
  half-step down) nằm ngoài MVP.
- Người dùng mặc định thuận tay phải; chế độ sơ đồ cho người thuận tay trái để sau MVP.
- Video bài học được nhúng từ nền tảng video bên ngoài (video công khai của kênh khác có ghi
  nguồn, dần thay bằng video tự quay); MVP không tự lưu trữ video.
- Không bắt buộc đăng nhập để học; tài khoản chỉ dùng để lưu và đồng bộ tiến độ.
- Đăng nhập bằng email qua liên kết (không mật khẩu) và Google là đủ cho MVP; Facebook và Zalo để
  sau MVP.
- Bài kiểm tra lên cấp trong MVP là tự đánh giá; chấm điểm tự động bằng âm thanh để Giai đoạn 3.
- Danh sách 5 bài hát cụ thể do người soạn nội dung chọn trong nhóm ballad Việt nổi tiếng; vì đây
  là bài có bản quyền, chỉ hiển thị tên bài, ca sĩ/tác giả, hợp âm, điệu và liên kết đến bản
  chính thức (theo FR-005).
- MVP miễn phí hoàn toàn; không có thanh toán.
- Ngoài phạm vi MVP: Cấp 2–5, trình phát tab, luyện tai, luyện cần đàn, cộng đồng, huy hiệu,
  ứng dụng di động riêng, đa ngôn ngữ.
