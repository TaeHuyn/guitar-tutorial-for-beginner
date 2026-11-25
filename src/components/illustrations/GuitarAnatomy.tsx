import { Badge, Illustration, WOOD } from "./Illustration";

const CX = 260;
const FRETS = [128, 151, 173, 194, 214, 233, 251, 268, 284, 299, 313, 326, 338];
const INLAYS = [3, 5, 7, 9].map((f) => (FRETS[f - 2] + FRETS[f - 1]) / 2);
const STRING_X = Array.from({ length: 6 }, (_, i) => 248.5 + i * 4.6); // string 6 → 1

const LEFT = [
  { n: 1, text: "Đầu đàn", y: 70, to: [232, 70] },
  { n: 3, text: "Lược đàn", y: 104, to: [244, 101] },
  { n: 5, text: "Phím đàn", y: 194, to: [246, 194] },
  { n: 7, text: "Lỗ thoát âm", y: 420, to: [232, 420] },
] as const;
const RIGHT = [
  { n: 2, text: "Khóa đàn", y: 36, to: [313, 36] },
  { n: 4, text: "Cần đàn", y: 250, to: [276, 250] },
  { n: 6, text: "Thùng đàn", y: 510, to: [388, 510] },
  { n: 8, text: "Ngựa đàn", y: 560, to: [304, 557] },
] as const;

/** Front view of an acoustic guitar with the 8 parts from the lesson numbered. */
export function GuitarAnatomy() {
  return (
    <Illustration
      label="Cây đàn guitar nhìn từ phía trước, đánh số 8 bộ phận: 1 đầu đàn, 2 khóa đàn, 3 lược đàn, 4 cần đàn, 5 phím đàn, 6 thùng đàn, 7 lỗ thoát âm, 8 ngựa đàn. Dây 6 (to nhất) ở bên trái, dây 1 (nhỏ nhất) ở bên phải."
      caption="8 bộ phận chính của cây đàn. Dây 6 to nhất, dây 1 nhỏ nhất."
      viewBox="0 0 520 680"
    >
      {/* Body: two bouts; the second fill pass hides the inner outline. */}
      <ellipse
        cx={CX}
        cy={405}
        rx={104}
        ry={92}
        fill={WOOD.top}
        stroke={WOOD.dark}
        strokeWidth={4}
      />
      <ellipse
        cx={CX}
        cy={522}
        rx={130}
        ry={104}
        fill={WOOD.top}
        stroke={WOOD.dark}
        strokeWidth={4}
      />
      <ellipse cx={CX} cy={405} rx={102} ry={90} fill={WOOD.top} />
      {/* Sound hole with rosette */}
      <circle cx={CX} cy={420} r={34} fill="none" stroke={WOOD.mid} strokeWidth={4} />
      <circle cx={CX} cy={420} r={28} fill="#3a2614" />
      {/* Bridge and saddle */}
      <rect x={216} y={548} width={88} height={18} rx={4} fill="#5a3a22" />
      <line x1={238} x2={282} y1={553} y2={553} stroke="#f3ead8" strokeWidth={2} />

      {/* Headstock, pegs and nut */}
      <rect x={230} y={18} width={60} height={84} rx={10} fill={WOOD.dark} />
      {[36, 59, 82].map((y) => (
        <g key={y}>
          <circle cx={238} cy={y} r={4} fill="#d9d9d9" />
          <circle cx={282} cy={y} r={4} fill="#d9d9d9" />
          <rect x={206} y={y - 6} width={20} height={12} rx={5} fill="#cfcfcf" stroke="#8a8a8a" />
          <rect x={294} y={y - 6} width={20} height={12} rx={5} fill="#cfcfcf" stroke="#8a8a8a" />
        </g>
      ))}

      {/* Neck (fingerboard), frets and position dots */}
      <rect x={244} y={102} width={32} height={250} fill="#5a3a22" />
      <rect
        x={242}
        y={98}
        width={36}
        height={6}
        rx={1}
        fill="#f6f1e6"
        stroke="#b89a6c"
        strokeWidth={0.5}
      />
      {FRETS.map((y) => (
        <line key={y} x1={244} x2={276} y1={y} y2={y} stroke="#c8c8c8" strokeWidth={1.6} />
      ))}
      {INLAYS.map((y) => (
        <circle key={y} cx={CX} cy={y} r={3} fill="#efe6d2" />
      ))}

      {/* Strings: 6 (thick) on the left → 1 (thin) on the right */}
      {STRING_X.map((x, i) => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1={101}
          y2={553}
          stroke="#b9b9b9"
          strokeWidth={1.6 - i * 0.2}
        />
      ))}

      {/* Part labels */}
      {LEFT.map(({ n, text, y, to }) => (
        <g key={n}>
          <line
            x1={123}
            y1={y}
            x2={to[0]}
            y2={to[1]}
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.5}
          />
          <Badge x={112} y={y} n={n} />
          <text
            x={96}
            y={y + 5}
            textAnchor="end"
            fontSize={14}
            fontWeight={600}
            fill="currentColor"
          >
            {text}
          </text>
        </g>
      ))}
      {RIGHT.map(({ n, text, y, to }) => (
        <g key={n}>
          <line
            x1={to[0]}
            y1={to[1]}
            x2={397}
            y2={y}
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.5}
          />
          <Badge x={408} y={y} n={n} />
          <text x={424} y={y + 5} fontSize={14} fontWeight={600} fill="currentColor">
            {text}
          </text>
        </g>
      ))}

      {/* Which string is which */}
      <g fontSize={13} fontWeight={600} fill="currentColor">
        <line
          x1={248.5}
          y1={570}
          x2={214}
          y2={640}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.5}
        />
        <text x={210} y={658} textAnchor="end">
          Dây 6 (to nhất)
        </text>
        <line
          x1={271.5}
          y1={570}
          x2={306}
          y2={640}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.5}
        />
        <text x={310} y={658}>
          Dây 1 (nhỏ nhất)
        </text>
      </g>
    </Illustration>
  );
}
