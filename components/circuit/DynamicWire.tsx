"use client";

export type WirePoint = { x: number; y: number };

/** SVG cubic bezier “wire” between two pins. Active (1) wires are solid green. */
export default function DynamicWire({
  start,
  end,
  state,
}: {
  start: WirePoint;
  end: WirePoint;
  state: number;
}) {
  const dx = Math.max(30, Math.abs(end.x - start.x) * 0.5);
  const d = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y} ${end.x - dx} ${end.y} ${end.x} ${end.y}`;
  const active = state === 1;
  const color = active ? "#2f9e44" : "#8a8a8a";

  return (
    <g>
      <path d={d} fill="none" stroke="#111" strokeWidth={active ? 7 : 5} opacity={0.18} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={active ? 4 : 3}
        strokeDasharray={active ? undefined : "7 5"}
      />
      <circle cx={start.x} cy={start.y} r={4} fill={color} stroke="#111" strokeWidth={1.5} />
      <circle cx={end.x} cy={end.y} r={4} fill={color} stroke="#111" strokeWidth={1.5} />
    </g>
  );
}
