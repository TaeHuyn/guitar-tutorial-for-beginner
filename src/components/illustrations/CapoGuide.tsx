import { Illustration, WOOD } from "./Illustration";

const FRET_X = [60, 130, 196, 258, 316, 370]; // nut, frets 1–5
const yOf = (s: number) => 58 + (s - 1) * 22; // string 1 on top

/** A capo on fret 1, with the Em shape played two frets above it. */
export function CapoGuide() {
  const center = (f: number) => (FRET_X[f - 1] + FRET_X[f]) / 2;
  return (
    <Illustration
      label="Cần đàn có capo kẹp ngang ngay sau phím ngăn 1. Capo trở thành lược đàn mới. Bấm thế hợp âm Em với hai ngón ở ngăn 2 tính từ capo, tức ngăn 3 thật, sẽ nghe ra hợp âm Fm."
      caption="Capo ở ngăn 1 giống như lược đàn mới. Bấm thế Em tính từ capo → nghe ra Fm."
      viewBox="0 0 460 250"
    >
      {/* Fingerboard, headstock edge and nut */}
      <rect x={20} y={40} width={40} height={146} fill={WOOD.mid} />
      <rect x={60} y={40} width={380} height={146} fill="#5a3a22" />
      <rect x={56} y={40} width={6} height={146} fill="#f6f1e6" />
      {FRET_X.slice(1).map((x) => (
        <line key={x} x1={x} x2={x} y1={40} y2={186} stroke="#c8c8c8" strokeWidth={3} />
      ))}
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <line
          key={s}
          x1={20}
          x2={440}
          y1={yOf(s)}
          y2={yOf(s)}
          stroke="#d8d8d8"
          strokeWidth={0.8 + (s - 1) * 0.35}
        />
      ))}
      {/* Capo */}
      <rect x={112} y={30} width={14} height={166} rx={6} fill="#2b2b2b" />
      <rect x={104} y={14} width={30} height={22} rx={6} fill="#444" />

      {/* Em shape, counted from the capo: strings 5 and 4 on "fret 2" = real fret 3 */}
      {[
        { s: 5, finger: 2 },
        { s: 4, finger: 3 },
      ].map((d) => (
        <g key={d.s}>
          <circle cx={center(3)} cy={yOf(d.s)} r={10} className="fill-diagram-dot" />
          <text
            x={center(3)}
            y={yOf(d.s) + 4}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            className="fill-diagram-dot-foreground"
          >
            {d.finger}
          </text>
        </g>
      ))}

      <g fontSize={13} fill="currentColor">
        <text x={119} y={214} textAnchor="middle" fontWeight={700}>
          Capo ngăn 1
        </text>
        <text x={119} y={230} textAnchor="middle" opacity={0.8}>
          = lược đàn mới
        </text>
        <line
          x1={center(3) + 10}
          y1={yOf(5) + 8}
          x2={300}
          y2={206}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.55}
        />
        <text x={304} y={214} fontWeight={700}>
          Thế Em
        </text>
        <text x={304} y={230} opacity={0.8}>
          ở ngăn 2 tính từ capo
        </text>
        {[1, 2, 3, 4].map((f) => (
          <text key={f} x={center(f + 1)} y={30} textAnchor="middle" fontSize={11} opacity={0.75}>
            {`ngăn ${f}`}
          </text>
        ))}
      </g>
    </Illustration>
  );
}
