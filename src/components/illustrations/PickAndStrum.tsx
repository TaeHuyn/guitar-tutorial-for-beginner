import { Illustration } from "./Illustration";

const SKIN = "#f1c9a5";
const SKIN_EDGE = "#c79470";
const PICK = "#e0743b";
const NOTE_LINE = { stroke: "currentColor", strokeWidth: 1, opacity: 0.55 } as const;

/** Side view of a pick held between the thumb and the side of the index finger. */
export function PickGrip() {
  return (
    <Illustration
      label="Cách cầm pick nhìn từ bên cạnh: pick đặt trên cạnh đốt đầu ngón trỏ, ngón cái đè lên trên, chỉ để lộ khoảng 2 đến 3 mi-li-mét mũi pick."
      caption="Pick kẹp giữa ngón cái và cạnh đốt đầu ngón trỏ, chỉ lộ 2–3 mm mũi pick."
      viewBox="0 0 520 230"
    >
      {/* Index finger, curled */}
      <rect
        x={70}
        y={112}
        width={190}
        height={42}
        rx={21}
        fill={SKIN}
        stroke={SKIN_EDGE}
        strokeWidth={2}
      />
      {/* Pick (between finger and thumb) */}
      <path
        d="M 196 92 L 266 92 Q 270 92 268 97 L 236 176 Q 231 184 226 176 L 194 97 Q 192 92 196 92 Z"
        fill={PICK}
        stroke="#a8501f"
        strokeWidth={1.5}
      />
      {/* Thumb on top */}
      <rect
        x={150}
        y={74}
        width={140}
        height={38}
        rx={19}
        fill={SKIN}
        stroke={SKIN_EDGE}
        strokeWidth={2}
      />
      <ellipse cx={272} cy={93} rx={10} ry={13} fill="#f6dcc4" stroke={SKIN_EDGE} strokeWidth={1} />

      <g fontSize={13} fill="currentColor">
        <line x1={232} y1={180} x2={300} y2={200} {...NOTE_LINE} />
        <text x={304} y={204}>
          Chỉ lộ <tspan fontWeight={700}>2–3 mm</tspan> mũi pick
        </text>
        <line x1={250} y1={80} x2={310} y2={40} {...NOTE_LINE} />
        <text x={314} y={40} fontWeight={600}>
          Ngón cái đè lên pick
        </text>
        <line x1={110} y1={154} x2={80} y2={196} {...NOTE_LINE} />
        <text x={30} y={212}>
          Cạnh đốt đầu ngón trỏ
        </text>
      </g>
    </Illustration>
  );
}

/** Strings seen from above with the down-stroke and up-stroke directions. */
export function StrumGuide() {
  const ys = [50, 76, 102, 128, 154, 180]; // string 6 (top, nearest your face) → string 1
  return (
    <Illustration
      label="Sáu dây nhìn từ trên xuống khi ôm đàn: dây 6 ở trên gần mặt bạn, dây 1 ở dưới. Quạt xuống đi từ dây 6 tới dây 1 qua cả 6 dây. Quạt lên đi từ dây 1 ngược lên và thường chỉ chạm 3 đến 4 dây mỏng."
      caption="Quạt xuống qua cả 6 dây; quạt lên nhẹ hơn, thường chỉ chạm 3–4 dây mỏng."
      viewBox="0 0 460 240"
    >
      {ys.map((y, i) => (
        <g key={y}>
          <line x1={90} x2={430} y1={y} y2={y} stroke="#9a9a9a" strokeWidth={3 - i * 0.4} />
          <text
            x={78}
            y={y + 5}
            textAnchor="end"
            fontSize={13}
            fontWeight={600}
            fill="currentColor"
          >
            Dây {6 - i}
          </text>
        </g>
      ))}
      {/* Down stroke */}
      <line
        x1={200}
        x2={200}
        y1={34}
        y2={194}
        className="stroke-primary"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path d="M 186 188 L 200 214 L 214 188 Z" className="fill-primary" />
      <text x={200} y={232} textAnchor="middle" fontSize={14} fontWeight={700} fill="currentColor">
        ↓ Quạt xuống
      </text>
      {/* Up stroke: only the thin strings */}
      <line
        x1={330}
        x2={330}
        y1={194}
        y2={122}
        className="stroke-diagram-dot"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path d="M 316 124 L 330 98 L 344 124 Z" className="fill-diagram-dot" />
      <text x={330} y={232} textAnchor="middle" fontSize={14} fontWeight={700} fill="currentColor">
        ↑ Quạt lên
      </text>
    </Illustration>
  );
}

/** Cross-section of the neck: thumb behind, curved finger pressing with its tip. */
export function NeckGrip() {
  // Finger: rises from the palm (bottom left), arches over and comes straight down onto string 3.
  const finger = "M 92 250 C 70 140, 130 34, 210 42 C 246 46, 254 72, 246 96";
  return (
    <Illustration
      label="Mặt cắt cần đàn: ngón cái đặt ở mặt sau cần đàn, khoảng giữa. Ngón bấm cong lên như cầm quả cam nhỏ, đầu ngón dựng đứng ấn thẳng xuống dây, không chạm vào dây bên cạnh."
      caption="Ngón cái ở sau cần đàn; ngón bấm cong, đầu ngón dựng đứng ấn thẳng xuống dây."
      viewBox="0 0 520 290"
    >
      {/* Neck cross-section */}
      <path
        d="M 150 112 L 330 112 L 330 122 Q 330 210 240 216 Q 150 210 150 122 Z"
        fill="#c99a5e"
        stroke="#9c6a3a"
        strokeWidth={2}
      />
      <rect x={146} y={102} width={188} height={12} rx={2} fill="#5a3a22" />
      {[164, 194, 224, 254, 284, 314].map((x) => (
        <circle key={x} cx={x} cy={99} r={3} fill="#9a9a9a" />
      ))}
      {/* Thumb behind the neck */}
      <ellipse cx={240} cy={232} rx={36} ry={18} fill={SKIN} stroke={SKIN_EDGE} strokeWidth={2} />
      {/* Curved finger */}
      <path d={finger} fill="none" stroke={SKIN_EDGE} strokeWidth={30} strokeLinecap="round" />
      <path d={finger} fill="none" stroke={SKIN} strokeWidth={26} strokeLinecap="round" />
      {/* Nail line near the tip */}
      <path d="M 238 70 Q 252 72 256 84" fill="none" stroke={SKIN_EDGE} strokeWidth={2} />

      <g fontSize={13} fill="currentColor">
        <line
          x1={262}
          y1={92}
          x2={350}
          y2={56}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.55}
        />
        <text x={354} y={52} fontWeight={600}>
          Đầu ngón ấn thẳng xuống
        </text>
        <text x={354} y={68} opacity={0.8}>
          không chạm dây bên cạnh
        </text>
        <line
          x1={84}
          y1={150}
          x2={40}
          y2={118}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.55}
        />
        <text x={14} y={108} fontWeight={600}>
          Ngón cong
        </text>
        <line
          x1={278}
          y1={234}
          x2={350}
          y2={252}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.55}
        />
        <text x={354} y={250} fontWeight={600}>
          Ngón cái sau cần
        </text>
        <text x={354} y={266} opacity={0.8}>
          (khoảng giữa)
        </text>
      </g>
    </Illustration>
  );
}
