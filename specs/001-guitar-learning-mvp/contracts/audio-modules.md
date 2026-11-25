# Contract: Module âm thanh (client)

Phần logic **thuần** (không chạm Web Audio) tách riêng để unit test. Phần gắn Web Audio là lớp
mỏng bên ngoài.

## Nhạc lý thuần — `src/lib/music/`

```ts
frequencyToNote(hz: number, a4 = 440): { note: string; octave: number; cents: number; midi: number }
nearestGuitarString(hz: number): { stringNumber: 1|2|3|4|5|6; name: "E2"|"A2"|"D3"|"G3"|"B3"|"E4"; cents: number }
tuningState(cents: number): "flat" | "in-tune" | "sharp"     // |cents| ≤ 5 → in-tune
voicingToNotes(frets: number[]): string[]                     // ví dụ [3,2,0,0,0,3] → ["G2","B2","D3","G3","B3","G4"]
normalizeChordQuery(q: string): string                         // "bm", "Bb", "B♭", "a#m7" → id chuẩn
```

## Tuner — `src/lib/audio/tuner.ts`

```ts
interface Tuner {
  start(): Promise<void>        // xin quyền micro; reject với TunerError
  stop(): void                   // tắt mọi track micro, đóng AudioContext
  subscribe(cb: (r: TunerReading) => void): () => void
}
type TunerReading =
  | { kind: "pitch"; hz: number; note: string; octave: number; cents: number; string: 1|2|3|4|5|6; state: "flat"|"in-tune"|"sharp" }
  | { kind: "quiet" }            // RMS thấp hoặc clarity < 0.9 → UI: "Chưa nghe rõ…"
type TunerError = "permission-denied" | "no-microphone" | "unsupported"
```

**Bất biến**: không bao giờ gửi dữ liệu âm thanh ra mạng; `stop()` được gọi khi rời trang hoặc tab
ẩn quá 60 giây.

**Kiểm thử**: đưa sóng sin tổng hợp ở tần số = nốt dây ± {0, 3, 10, 30} cent → kết quả lệch ≤ 1 cent
so với giá trị đúng (SC-003 yêu cầu ≤ 3 cent trên thiết bị thật).

## Metronome — `src/lib/audio/metronome.ts`

```ts
interface MetronomeOptions { bpm: number; beatsPerBar: 2|3|4|6; subdivision?: 1; volume?: number }
interface Metronome {
  start(opts?: Partial<MetronomeOptions>): Promise<void>
  stop(): void
  setBpm(bpm: number): void      // 30–250, clamp; áp dụng từ phách kế tiếp
  setBeatsPerBar(n: 2|3|4|6): void
  onBeat(cb: (beat: { index: number; accent: boolean; time: number }) => void): () => void
  readonly running: boolean
}

// Lõi thuần, kiểm thử với đồng hồ giả:
scheduleBeats(state: SchedulerState, now: number, lookAhead: number): { beats: ScheduledBeat[]; next: SchedulerState }
tapTempo(tapsMs: number[]): number | null     // cần ≥ 4 lần gõ; bỏ khoảng > 2000 ms; trả BPM làm tròn
```

6/8 được hiểu là 6 phách, nhấn phách 1 và nhấn nhẹ phách 4.

**Kiểm thử**: mô phỏng 10 phút ở 120 BPM với tick không đều (jitter 0–20 ms) → đúng 1200 phách,
khoảng cách giữa các phách đúng 500 ms ± 0.001 ms (SC-004, Constitution IV < 5 ms).

## Âm mẫu — `src/lib/audio/pluck.ts`

```ts
playChord(notes: string[], mode: "strum" | "arpeggio"): Promise<void>   // strum: cách 15 ms; arpeggio: 60 ms
playNote(note: string, durationSec?: number): Promise<void>             // dùng cho tuner dự phòng
```

Tone.js được nạp động ở lần gọi đầu tiên; `AudioContext` chỉ được tạo/resume sau thao tác của
người dùng (chính sách autoplay của trình duyệt).

## Hook React — `src/hooks/`

`useTuner()`, `useMetronome(initial?)`, `usePluck()` — bọc các interface trên, tự dọn dẹp khi
unmount.
