"use client";

import React from "react";
import { holeX } from "@/lib/breadboard";
import {
  DIP_PACKAGE_PINS,
  DIP_PAIRS,
  dipPinHole,
  type SandboxComponent,
  type SimResult,
} from "@/lib/sandboxSimulation";

const BODY_TOP = 179;
const BODY_HEIGHT = 38;
const BODY_BOTTOM = BODY_TOP + BODY_HEIGHT;

type Props = {
  component: SandboxComponent;
  sim: SimResult;
  selected: boolean;
  onBodyPointerDown: (id: string, e: React.PointerEvent) => void;
  onToggle: (id: string, index: 0 | 1) => void;
  onPinPointerDown: (
    id: string,
    pin: number,
    e: React.PointerEvent,
  ) => void;
  onPinEnter: (id: string, pin: number) => void;
  onPinLeave: () => void;
};

/**
 * A 4-pin / 2-position DIP switch straddling the breadboard trench.
 * Pins 1 & 4 form switch 1 (left column), pins 2 & 3 form switch 2 (right
 * column). Each position is a passive bridge: ON connects the pair, OFF
 * isolates it. The component never drives HIGH or LOW on its own.
 */
export default function DipSwitchOnBoard({
  component,
  sim,
  selected,
  onBodyPointerDown,
  onToggle,
  onPinPointerDown,
  onPinEnter,
  onPinLeave,
}: Props) {
  if (component.startCol === undefined) return null;
  const start = component.startCol;
  const bottomCount = Math.ceil(DIP_PACKAGE_PINS / 2);
  const positions = component.dipStates ?? [0, 0];
  const reading = sim.dips[component.id];

  const x1 = holeX(start) - 13;
  const x2 = holeX(start + bottomCount - 1) + 13;
  const outline = selected ? "#1414d2" : "#5a1010";
  const outlineWidth = selected ? 3 : 1.5;

  // Pin screen positions for the 4 DIP terminals (E row = top, F row = bottom).
  const pinPositions: Record<number, { x: number; y: number; isTop: boolean }> = {};
  for (let pin = 1; pin <= DIP_PACKAGE_PINS; pin += 1) {
    const hole = dipPinHole(start, pin);
    const row = hole[0];
    const col = Number(hole.slice(1));
    pinPositions[pin] = { x: holeX(col), y: row === "F" ? 220 : 176, isTop: row === "E" };
  }

  // Each switch sits in the column it bridges: SW1 = pins 1 & 4 (left column),
  // SW2 = pins 2 & 3 (right column). The slider moves toward "ON" (top) to
  // connect the top hole to the bottom hole across the trench.
  const slotTop = BODY_TOP + 8;
  const slotHeight = BODY_HEIGHT - 16;
  const knobHeight = slotHeight / 2;

  return (
    <g>
      {/* Legs — background layer, behind the body */}
      {Object.entries(pinPositions).map(([pin, pos]) => (
        <rect
          key={`leg-${pin}`}
          x={pos.x - 3}
          y={pos.isTop ? pos.y - 4 : BODY_BOTTOM - 2}
          width={6}
          height={pos.isTop ? BODY_TOP - pos.y + 6 : pos.y - BODY_BOTTOM + 6}
          rx={1}
          fill="#b9bec4"
          stroke="#6d737a"
          strokeWidth={0.8}
          pointerEvents="none"
        />
      ))}

      {/* DIP body */}
      <rect
        x={x1}
        y={BODY_TOP}
        width={x2 - x1}
        height={BODY_HEIGHT}
        rx={3}
        fill="#d23c3c"
        stroke={outline}
        strokeWidth={outlineWidth}
        style={{ cursor: "grab" }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onBodyPointerDown(component.id, e);
        }}
      />
      {/* "ON ▲" marking between the two slots: slider up = ON */}
      <text
        x={(x1 + x2) / 2}
        y={BODY_TOP + 13}
        textAnchor="middle"
        fontSize={5.5}
        fontWeight={800}
        fill="#ffffff"
        pointerEvents="none"
      >
        ON
      </text>
      <path
        d={`M ${(x1 + x2) / 2} ${BODY_TOP + 4} l 3 4 l -6 0 z`}
        fill="#ffffff"
        pointerEvents="none"
      />

      {DIP_PAIRS.map((pair, index) => {
        const isOn = positions[index] === 1;
        const pos = pinPositions[pair[0]];
        if (!pos) return null;
        const cx = pos.x;
        return (
          <g
            key={index}
            style={{ cursor: "pointer" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onToggle(component.id, index as 0 | 1);
            }}
          >
            <title>{`SW${index + 1} (pins ${pair[0]} & ${pair[1]}) — ${isOn ? "ON" : "OFF"} · click to toggle`}</title>
            <rect
              x={cx - 6}
              y={slotTop}
              width={12}
              height={slotHeight}
              fill="#2a1010"
              stroke="#5a1010"
              strokeWidth={0.8}
            />
            <rect
              x={cx - 5}
              y={isOn ? slotTop + 1 : slotTop + slotHeight - knobHeight - 1}
              width={10}
              height={knobHeight}
              rx={1}
              fill="#f7f7f7"
              stroke="#8c8c8c"
              strokeWidth={0.8}
            />
            <text
              x={cx}
              y={BODY_BOTTOM - 1.8}
              textAnchor="middle"
              fontSize={5.2}
              fontWeight={800}
              fill="#ffffff"
              pointerEvents="none"
            >
              {index + 1}
            </text>
          </g>
        );
      })}

      {/* Interactive pin hit-areas over the 4 breadboard holes */}
      {DIP_PAIRS.flatMap((pair) =>
        pair.map((pin) => {
          const pos = pinPositions[pin];
          if (!pos) return null;
          const pinReading = reading?.pins[pin];
          const active = pinReading?.value === 1;
          return (
            <g key={`pin-${pin}`}>
              {active && (
                <circle
                  cx={pos.x}
                  cy={pos.isTop ? pos.y - 6 : pos.y + 6}
                  r={1.8}
                  fill="#4cd964"
                  pointerEvents="none"
                />
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={6}
                fill="transparent"
                style={{ cursor: "crosshair" }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onPinPointerDown(component.id, pin, e);
                }}
                onPointerEnter={() => onPinEnter(component.id, pin)}
                onPointerLeave={onPinLeave}
              >
                <title>{`DIP pin ${pin}`}</title>
              </circle>
            </g>
          );
        }),
      )}
    </g>
  );
}
