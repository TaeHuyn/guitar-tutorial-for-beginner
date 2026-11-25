import { Illustration } from "./Illustration";

const LINES = ["e", "B", "G", "D", "A", "E"]; // top = string 1
const Y0 = 70;
const GAP = 24;
const yOf = (string: number) => Y0 + (string - 1) * GAP;
const NOTE_LINE = { stroke: "currentColor", strokeWidth: 1, opacity: 0.55 } as const;

function Num({ x, s, v }: { x: number; s: number; v: number }) {
  return (
    <g>
      <rect x={x - 9} y={yOf(s) - 10} width={18} height={20} className="fill-card" />
      <text
        x={x}
        y={yOf(s) + 6}
        textAnchor="middle"
        fontSize={17}
        fontWeight={700}
        fill="currentColor"
      >
        {v}
      </text>
    </g>
  );
}

/** Six-line tab with notes explaining lines, numbers, stacked numbers and reading direction. */
export function TabGuide() {
  return (
    <Illustration
      label="Khung tab 6 dòng. Dòng trên cùng là dây 1 (nhỏ nhất), dòng dưới cùng là dây 6 (to nhất). Số 0 nghĩa là gảy buông, số 3 nghĩa là bấm ngăn 3. Các số thẳng hàng dọc được gảy cùng lúc. Đọc từ trái sang phải."
      caption="Tab: mỗi dòng là một dây, mỗi số là ngăn cần bấm. Đọc từ trái sang phải."
      viewBox="0 0 600 260"
    >
      {LINES.map((name, i) => (
        <g key={name + i}>
          <line
            x1={80}
            x2={430}
            y1={yOf(i + 1)}
            y2={yOf(i + 1)}
            stroke="currentColor"
            strokeWidth={1.4}
            opacity={0.7}
          />
          <text
            x={66}
            y={yOf(i + 1) + 5}
            textAnchor="end"
            fontSize={14}
            fontWeight={700}
            fill="currentColor"
          >
            {name}
          </text>
        </g>
      ))}
      <line x1={80} x2={80} y1={yOf(1)} y2={yOf(6)} stroke="currentColor" strokeWidth={2} />

      <Num x={140} s={1} v={0} />
      <Num x={220} s={1} v={3} />
      <Num x={300} s={2} v={1} />
      {/* Stacked = played together */}
      <Num x={380} s={1} v={0} />
      <Num x={380} s={2} v={1} />
      <Num x={380} s={3} v={0} />

      <g fontSize={13} fill="currentColor">
        <line x1={140} y1={yOf(1) - 12} x2={140} y2={36} {...NOTE_LINE} />
        <text x={140} y={30} textAnchor="middle">
          <tspan fontWeight={700}>0</tspan> = gảy buông
        </text>
        <line x1={220} y1={yOf(1) - 12} x2={240} y2={20} {...NOTE_LINE} />
        <text x={244} y={18}>
          <tspan fontWeight={700}>3</tspan> = bấm ngăn 3
        </text>
        <line x1={392} y1={yOf(2)} x2={440} y2={yOf(3) + 4} {...NOTE_LINE} />
        <text x={444} y={yOf(3) + 8}>
          Thẳng hàng
        </text>
        <text x={444} y={yOf(3) + 24}>
          = gảy cùng lúc
        </text>

        <text x={444} y={yOf(1) + 5} opacity={0.8}>
          ← dây 1 (nhỏ nhất)
        </text>
        <text x={444} y={yOf(6) + 5} opacity={0.8}>
          ← dây 6 (to nhất)
        </text>

        <line
          x1={110}
          x2={400}
          y1={yOf(6) + 40}
          y2={yOf(6) + 40}
          stroke="currentColor"
          strokeWidth={1.5}
        />
        <path
          d={`M 400 ${yOf(6) + 34} L 412 ${yOf(6) + 40} L 400 ${yOf(6) + 46} Z`}
          fill="currentColor"
        />
        <text x={255} y={yOf(6) + 60} textAnchor="middle" fontWeight={600}>
          Đọc từ trái sang phải
        </text>
      </g>
    </Illustration>
  );
}
