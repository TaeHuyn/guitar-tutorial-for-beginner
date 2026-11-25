import { Illustration } from "./Illustration";

const XS = [150, 186, 222, 258, 294, 330]; // strings 6 → 1
const TOP = 92;
const FRET_H = 44;
const fretCenter = (f: number) => TOP + (f - 0.5) * FRET_H;
const NOTE_LINE = { stroke: "currentColor", strokeWidth: 1, opacity: 0.55 } as const;

/** A chord box (C major) with every element explained. */
export function ChordChartGuide() {
  const dots = [
    { s: 5, f: 3, finger: 3 },
    { s: 4, f: 2, finger: 2 },
    { s: 2, f: 1, finger: 1 },
  ];
  const x = (s: number) => XS[6 - s];
  return (
    <Illustration
      label="Sơ đồ hợp âm C có chú thích: 6 đường dọc là 6 dây, dây 6 bên trái và dây 1 bên phải; vạch đậm trên cùng là lược đàn; các ô là ngăn 1, 2, 3; chữ X nghĩa là không gảy dây đó; chữ O nghĩa là gảy buông; số trong chấm tròn là ngón tay bấm."
      caption="Ví dụ: sơ đồ hợp âm C. Nhìn như đang dựng cần đàn đứng thẳng trước mặt."
      viewBox="0 0 480 330"
    >
      {/* Frets and nut */}
      {[0, 1, 2, 3, 4].map((r) => (
        <line
          key={r}
          x1={XS[0]}
          x2={XS[5]}
          y1={TOP + r * FRET_H}
          y2={TOP + r * FRET_H}
          stroke="currentColor"
          strokeWidth={r === 0 ? 0 : 1.5}
          opacity={0.6}
        />
      ))}
      <rect
        x={XS[0] - 1}
        y={TOP - 7}
        width={XS[5] - XS[0] + 2}
        height={7}
        rx={1.5}
        fill="currentColor"
      />
      {/* Strings */}
      {XS.map((sx, i) => (
        <line
          key={sx}
          x1={sx}
          x2={sx}
          y1={TOP}
          y2={TOP + 4 * FRET_H}
          stroke="currentColor"
          strokeWidth={2.2 - i * 0.25}
        />
      ))}
      {/* X and O */}
      <text
        x={x(6)}
        y={TOP - 16}
        textAnchor="middle"
        fontSize={18}
        fontWeight={700}
        fill="currentColor"
      >
        X
      </text>
      {[3, 1].map((s) => (
        <text
          key={s}
          x={x(s)}
          y={TOP - 16}
          textAnchor="middle"
          fontSize={18}
          fontWeight={700}
          fill="currentColor"
        >
          O
        </text>
      ))}
      {/* Finger dots */}
      {dots.map((d) => (
        <g key={d.s}>
          <circle cx={x(d.s)} cy={fretCenter(d.f)} r={14} className="fill-diagram-dot" />
          <text
            x={x(d.s)}
            y={fretCenter(d.f) + 5}
            textAnchor="middle"
            fontSize={15}
            fontWeight={700}
            className="fill-diagram-dot-foreground"
          >
            {d.finger}
          </text>
        </g>
      ))}

      {/* Explanations */}
      <g fontSize={13} fill="currentColor">
        <line x1={x(6) - 6} y1={TOP - 26} x2={118} y2={32} {...NOTE_LINE} />
        <text x={14} y={26}>
          <tspan fontWeight={700}>X</tspan> = không gảy dây này
        </text>

        <line x1={x(1) + 6} y1={TOP - 26} x2={364} y2={30} {...NOTE_LINE} />
        <text x={368} y={26}>
          <tspan fontWeight={700}>O</tspan> = gảy buông
        </text>

        <line x1={XS[5] + 4} y1={TOP - 4} x2={364} y2={TOP - 4} {...NOTE_LINE} />
        <text x={368} y={TOP}>
          Lược đàn
        </text>

        {[1, 2, 3].map((f) => (
          <text key={f} x={XS[0] - 14} y={fretCenter(f) + 5} textAnchor="end" fontWeight={600}>
            Ngăn {f}
          </text>
        ))}

        <line x1={x(5) + 16} y1={fretCenter(3)} x2={364} y2={fretCenter(3)} {...NOTE_LINE} />
        <text x={368} y={fretCenter(3) - 4}>
          Số = ngón tay
        </text>
        <text x={368} y={fretCenter(3) + 13} opacity={0.75}>
          (3 = áp út)
        </text>

        <text x={x(6)} y={TOP + 4 * FRET_H + 26} textAnchor="middle" fontWeight={600}>
          Dây 6
        </text>
        <text x={x(6)} y={TOP + 4 * FRET_H + 42} textAnchor="middle" opacity={0.75}>
          to nhất
        </text>
        <text x={x(1)} y={TOP + 4 * FRET_H + 26} textAnchor="middle" fontWeight={600}>
          Dây 1
        </text>
        <text x={x(1)} y={TOP + 4 * FRET_H + 42} textAnchor="middle" opacity={0.75}>
          nhỏ nhất
        </text>
      </g>
    </Illustration>
  );
}
