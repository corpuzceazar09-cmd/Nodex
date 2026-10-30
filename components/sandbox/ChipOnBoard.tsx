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

const BODY_TOP = 181;
const BODY_BOTTOM = 215;

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

  return (
    <g>
      <rect
        x={x1}
        y={BODY_TOP}
        width={x2 - x1}
        height={BODY_BOTTOM - BODY_TOP}
        rx={3}
        fill="#d9d9d9"
        stroke={selected ? "#1414d2" : "#111111"}
        strokeWidth={selected ? 3 : 2}
        style={{ cursor: "grab" }}
        onPointerDown={(e) => onBodyPointerDown(component.id, e)}
      />

      <circle
        cx={x1 + 9}
        cy={(BODY_TOP + BODY_BOTTOM) / 2}
        r={4}
        fill="#f4f4f4"
        stroke="#111111"
        strokeWidth={1}
        pointerEvents="none"
      />

      <text
        x={(x1 + x2) / 2}
        y={(BODY_TOP + BODY_BOTTOM) / 2 + 2.5}
        textAnchor="middle"
        fontSize={7}
        fontWeight={700}
        fill="#111111"
        pointerEvents="none"
      >
        {def.id}
      </text>

      {reading && (
        <g pointerEvents="none">
          <circle
            cx={x2 - 8}
            cy={BODY_TOP + 7}
            r={3}
            fill={reading.powered ? "#1d7a35" : "#b02020"}
          />
          <text
            x={x1 + 6}
            y={BODY_BOTTOM - 5}
            fontSize={4.5}
            fontWeight={700}
            fill="#444444"
          >
            1
          </text>
        </g>
      )}

      {def.pins.map((pin) => {
        const hole = chipPinHole(start, def.packagePins, pin.pin);
        const parts = splitHole(hole);
        if (!parts) return null;
        const hx = holeX(parts.col);
        const hy = holeY(parts.row);
        const isTop = parts.row === "E";
        const bodyY = isTop ? BODY_TOP : BODY_BOTTOM;
        const numY = isTop ? BODY_TOP + 8 : BODY_BOTTOM - 8;
        const active =
          hoverPin?.componentId === component.id && hoverPin.pin === pin.pin;
        const color = roleColor(pin.role);
        const value = reading?.pins[pin.pin];

        return (
          <g key={pin.pin}>
            <line
              x1={hx}
              y1={hy}
              x2={hx}
              y2={bodyY}
              stroke={color}
              strokeWidth={active ? 3.5 : 2}
              pointerEvents="none"
            />
            <circle
              cx={hx}
              cy={hy}
              r={active ? 4 : 2.8}
              fill={color}
              stroke="#ffffff"
              strokeWidth={0.8}
              pointerEvents="none"
            />
            <text
              x={hx}
              y={numY}
              textAnchor="middle"
              fontSize={5.4}
              fontWeight={active ? 700 : 600}
              fill={active ? "#1414d2" : "#111111"}
              pointerEvents="none"
            >
              {pin.pin}
            </text>
            {active && (
              <circle
                cx={hx}
                cy={hy}
                r={6.5}
                fill="none"
                stroke="#1414d2"
                strokeWidth={1.3}
                pointerEvents="none"
              />
            )}
            {value && reading?.powered && pin.role === "output" && (
              <circle
                cx={hx}
                cy={hy}
                r={1.4}
                fill={value.value === 1 ? "#1d7a35" : "#ffffff"}
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
