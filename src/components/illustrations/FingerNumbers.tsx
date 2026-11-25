import { Badge, Illustration } from "./Illustration";

const SKIN = "#f1c9a5";
const SKIN_EDGE = "#c79470";

const FINGERS = [
  { name: "Út", n: 4, x: 84, w: 28, top: 88 },
  { name: "Áp út", n: 3, x: 116, w: 30, top: 58 },
  { name: "Giữa", n: 2, x: 150, w: 30, top: 46 },
  { name: "Trỏ", n: 1, x: 184, w: 30, top: 64 },
] as const;

/** Left hand (palm towards you) with the finger numbers used in chord diagrams. */
export function FingerNumbers() {
  return (
    <Illustration
      label="Bàn tay trái, lòng bàn tay hướng về phía bạn. Ngón trỏ là số 1, ngón giữa số 2, ngón áp út số 3, ngón út số 4. Ngón cái không đánh số."
      caption="Số trên sơ đồ hợp âm là số ngón tay trái: 1 trỏ · 2 giữa · 3 áp út · 4 út. Ngón cái đặt sau cần đàn, không đánh số."
      viewBox="0 0 330 290"
      width="max-w-xs"
    >
      {/* Thumb */}
      <rect
        x={-16}
        y={-88}
        width={32}
        height={98}
        rx={16}
        fill={SKIN}
        stroke={SKIN_EDGE}
        strokeWidth={2}
        transform="translate(214 228) rotate(52)"
      />
      {/* Fingers */}
      {FINGERS.map((f) => (
        <rect
          key={f.n}
          x={f.x}
          y={f.top}
          width={f.w}
          height={175 - f.top}
          rx={f.w / 2}
          fill={SKIN}
          stroke={SKIN_EDGE}
          strokeWidth={2}
        />
      ))}
      {/* Palm (drawn last so the finger bases blend in) */}
      <rect
        x={80}
        y={150}
        width={140}
        height={122}
        rx={42}
        fill={SKIN}
        stroke={SKIN_EDGE}
        strokeWidth={2}
      />
      <rect x={86} y={146} width={126} height={30} fill={SKIN} />

      {FINGERS.map((f) => (
        <g key={`label-${f.n}`}>
          <Badge x={f.x + f.w / 2} y={f.top + 18} n={f.n} />
          <text
            x={f.x + f.w / 2}
            y={f.top - 8}
            textAnchor="middle"
            fontSize={12}
            fontWeight={600}
            fill="currentColor"
          >
            {f.name}
          </text>
        </g>
      ))}
      <text x={292} y={150} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">
        Cái
      </text>
      <text x={150} y={240} textAnchor="middle" fontSize={13} fill={SKIN_EDGE} fontWeight={600}>
        Tay trái
      </text>
    </Illustration>
  );
}
