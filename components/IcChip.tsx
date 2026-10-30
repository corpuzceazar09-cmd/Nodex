/**
 * Wireframe DIP-14 chip graphic modelled on the classic 74-series TTL pinout
 * chart: pins 1–7 along the bottom, 14–8 along the top, Vcc at pin 14,
 * Gnd at pin 7 and a notch on the left edge.
 */
export default function IcChip({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  // Accept either "7408" or a full caption like "7408 — Quad 2-input AND".
  const part = label.split("—")[0].trim();

  const bodyLeft = 55;
  const bodyRight = 185;
  const pinXs = [70, 87, 104, 121, 138, 155, 172];

  return (
    <svg
      viewBox="0 0 240 130"
      className={className}
      role="img"
      aria-label={`Integrated circuit ${part}`}
    >
      {/* leads */}
      <g stroke="#111" strokeWidth={3} strokeLinecap="round">
        {pinXs.map((x) => (
          <g key={x}>
            <line x1={x} y1={28} x2={x} y2={10} />
            <line x1={x} y1={102} x2={x} y2={120} />
          </g>
        ))}
        {/* package body */}
        <rect x={bodyLeft} y={28} width={bodyRight - bodyLeft} height={74} fill="#d4d4d4" />
        {/* notch on the left edge */}
        <path d="M55 52 a13 13 0 0 0 0 26" fill="none" strokeWidth={3} />
      </g>

      {/* top pin numbers: 14 … 8 (left to right) */}
      {pinXs.map((x, i) => (
        <text key={`t${x}`} x={x} y={44} textAnchor="middle" fontSize={12} fontWeight={700} fill="#111">
          {14 - i}
        </text>
      ))}

      {/* bottom pin numbers: 1 … 7 (left to right) */}
      {pinXs.map((x, i) => (
        <text key={`b${x}`} x={x} y={95} textAnchor="middle" fontSize={12} fontWeight={700} fill="#111">
          {i + 1}
        </text>
      ))}

      {/* power pins, like the reference chart */}
      <text x={70} y={62} textAnchor="middle" fontSize={11} fontWeight={700} fill="#111">
        Vcc
      </text>
      <text x={172} y={80} textAnchor="middle" fontSize={11} fontWeight={700} fill="#111">
        Gnd
      </text>

      {/* part number */}
      <text
        x={120}
        y={74}
        textAnchor="middle"
        fontSize={17}
        fontWeight={700}
        fill="#111"
      >
        {part}
      </text>
    </svg>
  );
}