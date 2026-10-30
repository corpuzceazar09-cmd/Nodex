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

const BODY_TOP = 181;
const BODY_HEIGHT = 34;
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
  const outline = selected ? "#1414d2" : "#111111";
  const outlineWidth = selected ? 3 : 2;
  const bodyWidth = x2 - x1;
  const bodyCenterX = (x1 + x2) / 2;

  // Pin screen positions for the 4 DIP terminals.
  const pinPositions: Record<number, { x: number; y: number }> = {};
  for (let pin = 1; pin <= DIP_PACKAGE_PINS; pin += 1) {
    const hole = dipPinHole(start, pin);
    const parts = hole.split("");
    const row = parts[0];
    const col = Number(hole.slice(1));
    const y = row === "F" ? BODY_BOTTOM : BODY_TOP;
    pinPositions[pin] = { x: holeX(col), y };
  }

  return (
    <g>
      {/* DIP body */}
      <rect
        x={x1}
        y={BODY_TOP}
        width={bodyWidth}
        height={BODY_HEIGHT}
        rx={3}
        fill="#e8e8e8"
        stroke={outline}
        strokeWidth={outlineWidth}
        style={{ cursor: "grab" }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onBodyPointerDown(component.id, e);
        }}
      />
      {/* Pin-1 notch on the left end */}
      <path
        d={`M ${x1 + 4} ${BODY_TOP + BODY_HEIGHT / 2 - 5} A 5 5 0 0 0 ${
          x1 + 4
        } ${BODY_TOP + BODY_HEIGHT / 2 + 5}`}
        fill="none"
        stroke="#555555"
        strokeWidth={1.5}
        pointerEvents="none"
      />
      {/* Pin numbers on the body */}
      {DIP_PAIRS.flatMap((pair) =>
        pair.map((pin) => {
          const pos = pinPositions[pin];
          if (!pos) return null;
          return (
            <text
              key={`num-${pin}`}
              x={pos.x}
              y={pos.y === BODY_TOP ? BODY_TOP - 4 : BODY_BOTTOM + 9}
              textAnchor="middle"
              fontSize={5.5}
              fontWeight={700}
              fill="#555555"
              pointerEvents="none"
            >
              {pin}
            </text>
          );
        }),
      )}
      {/* Package label */}
      <text
        x={bodyCenterX}
        y={BODY_TOP + 12}
        textAnchor="middle"
        fontSize={6}
        fontWeight={700}
        fill="#333333"
        pointerEvents="none"
      >
        {component.label}
      </text>

      {/* Two slider toggles, one per switch position */}
      {DIP_PAIRS.map((pair, index) => {
        const isOn = positions[index] === 1;
        const colX = index === 0 ? x1 + bodyWidth * 0.28 : x1 + bodyWidth * 0.72;
        const trackWidth = bodyWidth * 0.32;
        const trackHeight = 10;
        const trackX = colX - trackWidth / 2;
        const trackY = BODY_TOP + 17;
        const knobX = isOn
          ? trackX + trackWidth - trackHeight / 2 - 1
          : trackX + trackHeight / 2 + 1;
        return (
          <g key={index}>
            {/* ON / OFF labels */}
            <text
              x={trackX - 2}
              y={trackY + trackHeight / 2 + 2}
              textAnchor="end"
              fontSize={4}
              fontWeight={700}
              fill={isOn ? "#999999" : "#1d7a35"}
              pointerEvents="none"
            >
              OFF
            </text>
            <text
              x={trackX + trackWidth + 2}
              y={trackY + trackHeight / 2 + 2}
              textAnchor="start"
              fontSize={4}
              fontWeight={700}
              fill={isOn ? "#1d7a35" : "#999999"}
              pointerEvents="none"
            >
              ON
            </text>
            {/* Slider track */}
            <rect
              x={trackX}
              y={trackY}
              width={trackWidth}
              height={trackHeight}
              rx={trackHeight / 2}
              fill={isOn ? "#b7e7bf" : "#c9c9c9"}
              stroke={outline}
              strokeWidth={1.2}
              pointerEvents="none"
            />
            {/* Slider knob (clickable) */}
            <circle
              cx={knobX}
              cy={trackY + trackHeight / 2}
              r={trackHeight / 2 - 1}
              fill="#ffffff"
              stroke={outline}
              strokeWidth={1.2}
              style={{ cursor: "pointer" }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onToggle(component.id, index as 0 | 1);
              }}
            />
            {/* Switch index caption */}
            <text
              x={colX}
              y={BODY_BOTTOM - 2}
              textAnchor="middle"
              fontSize={4}
              fontWeight={700}
              fill="#777777"
              pointerEvents="none"
            >
              SW{index + 1} (pins {pair[0]}&{pair[1]})
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
              <circle
                cx={pos.x}
                cy={pos.y}
                r={3}
                fill={active ? "#1d7a35" : "#555555"}
                pointerEvents="none"
              />
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
              />
            </g>
          );
        }),
      )}
    </g>
  );
}
