"use client";

import {
  CHIPS,
  type ChipDef,
  type ChipPinRole,
} from "@/lib/data/chips";
import { chipPinHole, holeX, holeY, splitHole } from "@/lib/breadboard";
import type { ChipReading, SandboxComponent } from "@/lib/sandboxSimulation";

export type PinHover = { componentId: string; pin: number } | null;

const ROLE_COLOR: Record<ChipPinRole, string> = {
  power: "#c0392b",
  ground: "#111111",
  input: "#1414d2",
  output: "#1d7a35",
};

// Body spans the trench and sits over the E/F holes; legs peek out beneath.
export const CHIP_BODY_TOP = 179;
export const CHIP_BODY_BOTTOM = 217;
const BODY_TOP = CHIP_BODY_TOP;
const BODY_BOTTOM = CHIP_BODY_BOTTOM;

type Props = {
  component: SandboxComponent;
  reading?: ChipReading;
  selected: boolean;
  hoverPin: PinHover;
  onBodyPointerDown: (id: string, e: React.PointerEvent) => void;
  onPinPointerDown: (
    id: string,
    pin: number,
    e: React.PointerEvent,
  ) => void;
  onPinEnter: (id: string, pin: number) => void;
  onPinLeave: () => void;
};

export default function ChipOnBoard({
  component,
  reading,
  selected,
  hoverPin,
  onBodyPointerDown,
  onPinPointerDown,
  onPinEnter,
  onPinLeave,
}: Props) {
  const chipId = component.chipId;
  if (!chipId) return null;
  const def: ChipDef = CHIPS[chipId];
  const start = component.startCol ?? 1;
  const bottomCount = Math.ceil(def.packagePins / 2);
  const x1 = holeX(start) - 13;
  const x2 = holeX(start + bottomCount - 1) + 13;

  const roleColor = (role: ChipPinRole) => ROLE_COLOR[role];

  // Pins (legs) are drawn first so they sit BEHIND the chip body, just like a
  // real DIP package seated in the breadboard. Hit targets go on top.
  const pinGeometry = def.pins.map((pin) => {
    const hole = chipPinHole(start, def.packagePins, pin.pin);
    const parts = splitHole(hole);
    if (!parts) return null;
    return {
      pin,
      hx: holeX(parts.col),
      hy: holeY(parts.row),
      isTop: parts.row === "E",
    };
  });

  return (
    <g>
      {/* Legs — background layer */}
      {pinGeometry.map((g) =>
        g ? (
          <rect
            key={`leg-${g.pin.pin}`}
            x={g.hx - 3}
            y={g.isTop ? g.hy - 4 : BODY_BOTTOM - 2}
            width={6}
            height={g.isTop ? BODY_TOP - g.hy + 6 : g.hy - BODY_BOTTOM + 6}
            rx={1}
            fill="#b9bec4"
            stroke="#6d737a"
            strokeWidth={0.8}
            pointerEvents="none"
          />
        ) : null,
      )}

      <rect
        x={x1}
        y={BODY_TOP}
        width={x2 - x1}
        height={BODY_BOTTOM - BODY_TOP}
        rx={3}
        fill="#2b2b30"
        stroke={selected ? "#1414d2" : "#111111"}
        strokeWidth={selected ? 3 : 1.5}
        style={{ cursor: "grab" }}
        onPointerDown={(e) => onBodyPointerDown(component.id, e)}
      />
      <rect
        x={x1 + 2}
        y={BODY_TOP + 2}
        width={x2 - x1 - 4}
        height={3}
        rx={1.5}
        fill="#45454c"
        pointerEvents="none"
      />

      {/* Pin-1 notch */}
      <path
        d={`M ${x1} ${(BODY_TOP + BODY_BOTTOM) / 2 - 5} A 5 5 0 0 1 ${x1} ${(BODY_TOP + BODY_BOTTOM) / 2 + 5}`}
        fill="#f4f4f4"
        stroke="#111111"
        strokeWidth={1}
        pointerEvents="none"
      />
      <circle
        cx={x1 + 9}
        cy={BODY_BOTTOM - 7}
        r={1.8}
        fill="#8a8a92"
        pointerEvents="none"
      />

      <text
        x={(x1 + x2) / 2}
        y={(BODY_TOP + BODY_BOTTOM) / 2 + 3}
        textAnchor="middle"
        fontSize={8}
        fontWeight={700}
        fill="#f1f1f1"
        letterSpacing={0.5}
        pointerEvents="none"
      >
        {def.id}
      </text>

      {reading && (
        <circle
          cx={x2 - 5}
          cy={(BODY_TOP + BODY_BOTTOM) / 2}
          r={2.4}
          fill={reading.powered ? "#4cd964" : "#d23c3c"}
          pointerEvents="none"
        >
          <title>{reading.powered ? "Powered" : "Not powered"}</title>
        </circle>
      )}

      {pinGeometry.map((g) => {
        if (!g) return null;
        const { pin, hx, hy, isTop } = g;
        const numY = isTop ? BODY_TOP + 9 : BODY_BOTTOM - 4;
        const active =
          hoverPin?.componentId === component.id && hoverPin.pin === pin.pin;
        const color = roleColor(pin.role);
        const value = reading?.pins[pin.pin];

        return (
          <g key={pin.pin}>
            <text
              x={hx}
              y={numY}
              textAnchor="middle"
              fontSize={5.4}
              fontWeight={active ? 800 : 600}
              fill={active ? "#9fb4ff" : "#c9c9cf"}
              pointerEvents="none"
            >
              {pin.pin}
            </text>
            {active && (
              <>
                <circle
                  cx={hx}
                  cy={hy}
                  r={6.5}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.6}
                  pointerEvents="none"
                />
                <text
                  x={hx}
                  y={isTop ? hy - 9 : hy + 14}
                  textAnchor="middle"
                  fontSize={6.5}
                  fontWeight={800}
                  fill={color}
                  pointerEvents="none"
                >
                  {pin.label}
                </text>
              </>
            )}
            {value && reading?.powered && pin.role === "output" && (
              <circle
                cx={hx}
                cy={isTop ? BODY_TOP + 15 : BODY_BOTTOM - 12}
                r={1.6}
                fill={value.value === 1 ? "#4cd964" : "#55555c"}
                pointerEvents="none"
              />
            )}
            <circle
              cx={hx}
              cy={hy}
              r={7.5}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onPinPointerDown(component.id, pin.pin, e);
              }}
              onPointerEnter={() => onPinEnter(component.id, pin.pin)}
              onPointerLeave={onPinLeave}
            />
          </g>
        );
      })}
    </g>
  );
}
