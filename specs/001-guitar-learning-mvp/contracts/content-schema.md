# Contract: Định dạng file nội dung

Người soạn nội dung (không cần biết code) làm việc theo contract này. Build và test **thất bại**
nếu file vi phạm. Định nghĩa trường: xem [data-model.md](../data-model.md) §1.

## Vị trí file

```text
content/
├── levels.ts                     # Level[] (thứ tự bài, tiêu chí kiểm tra lên cấp)
├── lessons/
│   ├── level-0/<slug>.mdx
│   └── level-1/<slug>.mdx
├── chords/index.ts               # Chord[]
└── songs/<id>.ts                 # một file mỗi bài hát
```

## Bài học (MDX)

```mdx
export const metadata = {
  slug: "hop-am-g",
  level: 1,
  title: "Hợp âm G",
  type: "technique",
  objective: "Bấm G sạch cả 6 dây và chuyển G→C 20 lần/phút",
  practiceMinutes: 15,
  prerequisites: ["hop-am-c"],
  chords: ["g"],
  songs: [],
  video: { youtubeId: "xxxxxxxxxxx", channel: "Tên kênh", url: "https://youtube.com/watch?v=xxxxxxxxxxx" },
  exercises: [
    { id: "g-c", instruction: "Chuyển G↔C mỗi 4 phách", bpm: 60, timeSignature: "4/4", passCriterion: "20 lần không dừng" }
  ],
  references: [{ title: "Hal Leonard Guitar Method Book 1", author: "Will Schmid, Greg Koch" }]
}

Nội dung bài học viết bằng Markdown...

<ChordDiagram chord="g" />
<Exercise id="g-c" />
<Tip>Giữ ngón áp út cố định khi chuyển G→C.</Tip>
```

### Component được phép dùng trong MDX

| Component | Props | Hiển thị |
|---|---|---|
| `<ChordDiagram chord voicing?>` | `chord`: id hợp âm; `voicing`: chỉ số, mặc định 0 | Sơ đồ + nút nghe thử |
| `<ChordProgression chords>` | `chords`: id[] | Dãy sơ đồ nhỏ |
| `<Exercise id>` | `id` trong `metadata.exercises` | Thẻ bài tập + nút "Tập với metronome" |
| `<StrumPattern pattern bpm?>` | ví dụ `"D-DU-UDU"` | Ký hiệu mũi tên quạt, phát mẫu nhịp |
| `<Tab>` | nội dung tab ASCII là children | Khối tab đơn giản dạng chữ đơn cách |
| `<SongCard id>` | id bài hát | Thẻ bài hát (xem bên dưới) |
| `<Tip>`, `<Warning>` | children | Hộp ghi chú |

Component lạ hoặc id không tồn tại → lỗi build.

## Hợp âm

```ts
{ id: "g", name: "G", root: "G", quality: "major", aliases: [], lessonSlug: "hop-am-g",
  voicings: [{ frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], baseFret: 1, difficulty: 2 }] }
```

## Bài hát

```ts
{ id: "ten-bai", title: "...", artist: "...", composer: "...", officialUrl: "https://...",
  level: 1, capo: 2, bpm: 72, strumPattern: "D-DU-UDU",
  sections: [{ name: "Đoạn 1", chords: ["c", "g", "am", "em"] }, { name: "Điệp khúc", chords: ["dm", "g", "c"] }],
  simplifiedFrom: "Bản gốc dùng F ở điệp khúc; thay bằng Dm" }
```

- **CẤM**: trường lời bài hát, file âm thanh, tab bản quyền chép từ nguồn khác.
- Với `level: 1`, mọi hợp âm trong `sections` phải thuộc {em, am, d, a, e, g, c, dm}. Hợp âm gốc
  đã bị thay được giải thích ở `simplifiedFrom`.

## Kiểm tra tự động (`npm run content:check`, cũng chạy trong `npm test`)

1. Mọi file khớp zod schema.
2. Slug duy nhất; mọi tham chiếu (prerequisites, chords, songs, lessonSlug, exercise id) tồn tại.
3. Prerequisites đứng trước trong lộ trình, không có vòng lặp.
4. Mỗi bài có ≥ 1 exercise; video nếu có thì đủ `channel` + `url`.
5. Thư viện hợp âm đủ 12 nốt gốc × 7 loại; mọi voicing khớp nốt của hợp âm.
6. Bài hát cấp 1 chỉ dùng 8 hợp âm cấp 1.
