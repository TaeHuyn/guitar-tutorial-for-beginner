import { Illustration, WOOD } from "./Illustration";

const NUT_Y = 232;
// String n → x position at the nut (6 on the left).
const NUT_X: Record<number, number> = { 6: 171, 5: 186, 4: 201, 3: 219, 2: 234, 1: 249 };
const PEGS = [
  { s: 4, note: "D", name: "Rê", side: "left", y: 60 },
  { s: 5, note: "A", name: "La", side: "left", y: 120 },
  { s: 6, note: "E", name: "Mi", side: "left", y: 180 },
  { s: 3, note: "G", name: "Sol", side: "right", y: 60 },
  { s: 2, note: "B", name: "Si", side: "right", y: 120 },
  { s: 1, note: "E", name: "Mi", side: "right", y: 180 },
] as const;

/** Headstock with 3+3 tuning pegs, each labelled with its string and note. */
export function TuningPegs() {
  return (
    <Illustration
      label="Đầu đàn có 6 khóa. Bên trái từ trên xuống: dây 4 Rê, dây 5 La, dây 6 Mi. Bên phải từ trên xuống: dây 3 Sol, dây 2 Si, dây 1 Mi. Lần theo dây từ lược đàn lên để biết khóa nào của dây nào."
      caption="Mỗi khóa giữ một dây. Vặn cho dây căng hơn thì nốt cao lên, chùng hơn thì nốt thấp xuống. Lần theo dây từ lược đàn lên tới khóa để vặn đúng khóa."
      viewBox="0 0 420 350"
    >
      {/* Headstock */}
      <rect x={150} y={20} width={120} height={214} rx={18} fill={WOOD.dark} />
      {/* Fingerboard below the nut */}
      <rect x={162} y={238} width={96} height={112} fill="#5a3a22" />
      {[282, 322].map((y) => (
        <line key={y} x1={162} x2={258} y1={y} y2={y} stroke="#c8c8c8" strokeWidth={2} />
      ))}
      <rect
        x={160}
        y={230}
        width={100}
        height={8}
        rx={1}
        fill="#f6f1e6"
        stroke="#b89a6c"
        strokeWidth={0.5}
      />

      {PEGS.map((p) => {
        const postX = p.side === "left" ? 175 : 245;
        const buttonX = p.side === "left" ? 108 : 272;
        return (
          <g key={p.s}>
            {/* Tuner button and shaft */}
            <rect
              x={p.side === "left" ? 140 : 262}
              y={p.y - 4}
              width={18}
              height={8}
              fill="#a9a9a9"
            />
            <rect
              x={buttonX}
              y={p.y - 11}
              width={40}
              height={22}
              rx={9}
              fill="#d4d4d4"
              stroke="#8a8a8a"
            />
            {/* String from the nut to its post */}
            <line
              x1={NUT_X[p.s]}
              y1={NUT_Y}
              x2={postX + (p.side === "left" ? -3 : 3)}
              y2={p.y}
              stroke="#d8d8d8"
              strokeWidth={0.8 + (p.s - 1) * 0.3}
            />
            <circle cx={postX} cy={p.y} r={6} fill="#e5e5e5" stroke="#8a8a8a" />
            {/* Label */}
            <text
              x={p.side === "left" ? 98 : 322}
              y={p.y + 5}
              textAnchor={p.side === "left" ? "end" : "start"}
              fontSize={14}
              fill="currentColor"
            >
              <tspan fontWeight={700}>Dây {p.s}</tspan>
              <tspan>
                {" "}
                · {p.note} ({p.name})
              </tspan>
            </text>
          </g>
        );
      })}

      {/* Strings down the neck */}
      {[6, 5, 4, 3, 2, 1].map((s) => (
        <line
          key={s}
          x1={NUT_X[s]}
          x2={NUT_X[s]}
          y1={NUT_Y}
          y2={350}
          stroke="#d8d8d8"
          strokeWidth={0.8 + (s - 1) * 0.3}
        />
      ))}
      {[6, 5, 4, 3, 2, 1].map((s) => (
        <text
          key={`n${s}`}
          x={NUT_X[s]}
          y={300}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="#f3ead8"
        >
          {s}
        </text>
      ))}
    </Illustration>
  );
}
