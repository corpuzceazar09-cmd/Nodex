"use client";

import React from "react";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  COLUMNS,
  RAILS,
  RAIL_COLOR,
  RAIL_LABEL,
  ROWS,
  holeId,
  holeX,
  holeY,
  splitHole,
} from "@/lib/breadboard";
import type {
  SandboxComponent,
  SandboxWire,
  SimResult,
} from "@/lib/sandboxSimulation";

export type SandboxMode = "select" | "place" | "wire" | "delete";

export type DraftWire = { from: string; x: number; y: number } | null;

export type GhostChip = { label: string; pins: number } | null;

type Props = {
  wires: SandboxWire[];
  parts: SandboxComponent[];
  sim: SimResult;
  mode: SandboxMode;
  hoverHole: string | null;
  selectedId: string | null;
  draft: DraftWire;
  ghostChip: GhostChip;
  ghostLabel?: string | null;
  onHolePointerDown: (hole: string, e: React.PointerEvent) => void;
  onHoleEnter: (hole: string) => void;
  onHoleLeave: () => void;
  onPartPointerDown: (id: string, e: React.PointerEvent) => void;
  onWirePointerDown: (id: string, e: React.PointerEvent) => void;
  onBackgroundPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  children?: React.ReactNode;
};

const WIRE_COLORS = [
  "#c0392b",
  "#111111",
  "#1d7a35",
  "#1414d2",
  "#c78a00",
  "#8a2fbf",
];

const COLS = Array.from({ length: COLUMNS }, (_, index) => index + 1);
const CHIP_BODY_TOP = 179;
const CHIP_BODY_HEIGHT = 38;

function pointOf(hole: string): { x: number; y: number } | null {
  const parts = splitHole(hole);
  if (!parts) return null;
  return { x: holeX(parts.col), y: holeY(parts.row) };
}

function wirePath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = Math.abs(b.x - a.x);
  const bend = Math.max(24, Math.min(110, dx * 0.35));
  const dir = b.x >= a.x ? 1 : -1;
  return `M ${a.x} ${a.y} C ${a.x + bend * dir} ${a.y}, ${
    b.x - bend * dir
  } ${b.y}, ${b.x} ${b.y}`;
}

function zigzag(
  a: { x: number; y: number },
  b: { x: number; y: number },
): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  const lead = Math.min(10, length / 4);
  const start = { x: a.x + ux * lead, y: a.y + uy * lead };
  const end = { x: b.x - ux * lead, y: b.y - uy * lead };
  const span = Math.max(1, length - lead * 2);
  const amp = 4.5;
  const points: Array<{ x: number; y: number }> = [start];
  const segments = 6;
  for (let i = 1; i < segments; i += 1) {
    const t = i / segments;
    const sign = i % 2 === 0 ? -1 : 1;
    points.push({
      x: start.x + ux * span * t + px * amp * sign,
      y: start.y + uy * span * t + py * amp * sign,
    });
  }
  points.push(end);
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

export default function Breadboard({
  wires,
  parts,
  sim,
  mode,
  hoverHole,
  selectedId,
  draft,
  ghostChip,
  ghostLabel = null,
  onHolePointerDown,
  onHoleEnter,
  onHoleLeave,
  onPartPointerDown,
  onWirePointerDown,
  onBackgroundPointerDown,
  onPointerMove,
  onPointerUp,
  svgRef,
  children,
}: Props) {
  const cursor =
    mode === "place" ? "copy" : mode === "delete" ? "not-allowed" : "crosshair";

  const renderHole = (row: string, col: number) => {
    const id = holeId(row, col);
    const x = holeX(col);
    const y = holeY(row);
    const active = hoverHole === id;
    return (
      <g key={id}>
        <circle cx={x} cy={y} r={2.1} fill="#8f8f8f" pointerEvents="none" />
        {active && (
          <circle
            cx={x}
            cy={y}
            r={5}
            fill="none"
            stroke="#1414d2"
            strokeWidth={1.4}
            pointerEvents="none"
          />
        )}
        <circle
          cx={x}
          cy={y}
          r={6.5}
          fill="transparent"
          style={{ cursor }}
          onPointerDown={(e) => {
            e.stopPropagation();
            onHolePointerDown(id, e);
          }}
          onPointerEnter={() => onHoleEnter(id)}
          onPointerLeave={onHoleLeave}
        />
      </g>
    );
  };

  const renderPart = (component: SandboxComponent) => {
    if (!component.hole) return null;
    const point = pointOf(component.hole);
    if (!point) return null;
    const { x, y } = point;
    const isSelected = selectedId === component.id;
    const outline = isSelected ? "#1414d2" : "#111111";
    const outlineWidth = isSelected ? 3 : 2;
    const grab = { cursor: "grab" as const };
    const label = (
      <text
        x={x}
        y={y - 16}
        textAnchor="middle"
        fontSize={5.6}
        fontWeight={700}
        fill="#222222"
        pointerEvents="none"
      >
        {component.label}
      </text>
    );

    if (component.kind === "switch") {
      const on = component.state === 1;
      return (
        <g key={component.id}>
          <line
            x1={x}
            y1={y}
            x2={x}
            y2={y - 8}
            stroke="#111111"
            strokeWidth={2}
            pointerEvents="none"
          />
          <rect
            x={x - 15}
            y={y - 26}
            width={30}
            height={20}
            rx={4}
            fill={on ? "#b7e7bf" : "#d3d3d3"}
            stroke={outline}
            strokeWidth={outlineWidth}
            style={grab}
            onPointerDown={(e) => {
              e.stopPropagation();
              onPartPointerDown(component.id, e);
            }}
          />
          <text
            x={x}
            y={y - 12}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fill="#111111"
            pointerEvents="none"
          >
            {on ? "1" : "0"}
          </text>
          {label}
        </g>
      );
    }

    if (component.kind === "led") {
      const on = sim.ledOn[component.id];
      if (component.hole2) {
        const other = pointOf(component.hole2);
        if (!other) return null;
        return (
          <g key={component.id}>
            <path
              d={zigzag({ x, y }, other)}
              fill="none"
              stroke={outline}
              strokeWidth={outlineWidth + 0.5}
              style={grab}
              onPointerDown={(e) => {
                e.stopPropagation();
                onPartPointerDown(component.id, e);
              }}
            />
            {on && (
              <circle
                cx={(x + other.x) / 2}
                cy={(y + other.y) / 2}
                r={10}
                fill="#6fd97f"
                opacity={0.35}
                pointerEvents="none"
              />
            )}
            <circle
              cx={(x + other.x) / 2}
              cy={(y + other.y) / 2}
              r={6}
              fill={on ? "#6fd97f" : "#a8a8a8"}
              stroke={outline}
              strokeWidth={outlineWidth}
              pointerEvents="none"
            />
            <text
              x={(x + other.x) / 2}
              y={(y + other.y) / 2 - 10}
              textAnchor="middle"
              fontSize={5.6}
              fontWeight={700}
              fill="#222222"
              pointerEvents="none"
            >
              {component.label}
            </text>
          </g>
        );
      }
      return (
        <g key={component.id}>
          <line
            x1={x}
            y1={y}
            x2={x}
            y2={y - 8}
            stroke="#111111"
            strokeWidth={2}
            pointerEvents="none"
          />
          {on && (
            <circle
              cx={x}
              cy={y - 16}
              r={12}
              fill="#6fd97f"
              opacity={0.35}
              pointerEvents="none"
            />
          )}
          <circle
            cx={x}
            cy={y - 16}
            r={7}
            fill={on ? "#6fd97f" : "#a8a8a8"}
            stroke={outline}
            strokeWidth={outlineWidth}
            style={grab}
            onPointerDown={(e) => {
              e.stopPropagation();
              onPartPointerDown(component.id, e);
            }}
          />
          {label}
        </g>
      );
    }

    if (component.kind === "resistor") {
      if (!component.hole2) return null;
      const other = pointOf(component.hole2);
      if (!other) return null;
      return (
        <g key={component.id}>
          <path
            d={zigzag({ x, y }, other)}
            fill="none"
            stroke={outline}
            strokeWidth={outlineWidth + 0.5}
            style={grab}
            onPointerDown={(e) => {
              e.stopPropagation();
              onPartPointerDown(component.id, e);
            }}
          />
          <text
            x={(x + other.x) / 2}
            y={(y + other.y) / 2 - 6}
            textAnchor="middle"
            fontSize={5.6}
            fontWeight={700}
            fill="#222222"
            pointerEvents="none"
          >
            {component.label}
          </text>
        </g>
      );
    }

    const tone =
      component.kind === "power"
        ? { fill: "#c0392b", text: "#ffffff", glyph: "5V" }
        : component.kind === "ground"
          ? { fill: "#111111", text: "#ffffff", glyph: "GND" }
          : component.kind === "high"
            ? { fill: "#c0392b", text: "#ffffff", glyph: "1" }
            : { fill: "#1414d2", text: "#ffffff", glyph: "0" };

    return (
      <g key={component.id}>
        <line
          x1={x}
          y1={y}
          x2={x}
          y2={y - 8}
          stroke="#111111"
          strokeWidth={2}
          pointerEvents="none"
        />
        <rect
          x={x - 14}
          y={y - 25}
          width={28}
          height={18}
          rx={3}
          fill={tone.fill}
          stroke={outline}
          strokeWidth={outlineWidth}
          style={grab}
          onPointerDown={(e) => {
            e.stopPropagation();
            onPartPointerDown(component.id, e);
          }}
        />
        <text
          x={x}
          y={y - 12.5}
          textAnchor="middle"
          fontSize={6.4}
          fontWeight={700}
          fill={tone.text}
          pointerEvents="none"
        >
          {tone.glyph}
        </text>
        {component.label !== tone.glyph && label}
      </g>
    );
  };

  const wireHitLayer = (
    <g>
      {wires.map((wire) => {
        const a = pointOf(wire.from);
        const b = pointOf(wire.to);
        if (!a || !b) return null;
        return (
          <path
            key={wire.id}
            d={wirePath(a, b)}
            fill="none"
            stroke="transparent"
            strokeWidth={13}
            pointerEvents={
              mode === "wire" || mode === "place" ? "none" : undefined
            }
            style={{
              cursor:
                mode === "delete"
                  ? "not-allowed"
                  : mode === "select"
                    ? "pointer"
                    : undefined,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onWirePointerDown(wire.id, e);
            }}
          />
        );
      })}
    </g>
  );

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
      width="100%"
      style={{ display: "block", touchAction: "none", userSelect: "none" }}
      onPointerDown={onBackgroundPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <defs>
        <pattern
          id="sandbox-grid"
          width={12}
          height={12}
          patternUnits="userSpaceOnUse"
        >
          <rect width={12} height={12} fill="#f4f4f4" />
          <circle cx={6} cy={6} r={0.7} fill="#e2e2e2" />
        </pattern>
      </defs>

      <rect
        x={20}
        y={8}
        width={BOARD_WIDTH - 40}
        height={BOARD_HEIGHT - 16}
        rx={10}
        fill="#fbfbfb"
        stroke="#111111"
        strokeWidth={3}
      />
      <rect
        x={24}
        y={12}
        width={BOARD_WIDTH - 48}
        height={BOARD_HEIGHT - 24}
        rx={8}
        fill="url(#sandbox-grid)"
        pointerEvents="none"
      />

      {mode !== "delete" && wireHitLayer}

      {RAILS.map((rail) => {
        const y = holeY(rail);
        return (
          <g key={rail}>
            <rect
              x={holeX(1) - 18}
              y={y - 7}
              width={holeX(COLUMNS) - holeX(1) + 36}
              height={14}
              rx={7}
              fill={RAIL_COLOR[rail]}
              opacity={0.16}
              pointerEvents="none"
            />
            <text
              x={30}
              y={y + 4}
              fontSize={12}
              fontWeight={700}
              fill={RAIL_COLOR[rail]}
              pointerEvents="none"
            >
              {RAIL_LABEL[rail]}
            </text>
            <text
              x={holeX(COLUMNS) + 32}
              y={y + 4}
              fontSize={11}
              fontWeight={700}
              fill={RAIL_COLOR[rail]}
              pointerEvents="none"
            >
              {RAIL_LABEL[rail]}
            </text>
            {COLS.map((col) => renderHole(rail, col))}
          </g>
        );
      })}

      {COLS.map((col) => (
        <g key={`num-${col}`}>
          <text
            x={holeX(col)}
            y={70}
            textAnchor="middle"
            fontSize={6}
            fontWeight={col % 5 === 0 ? 700 : 400}
            fill="#555555"
            pointerEvents="none"
          >
            {col}
          </text>
          <text
            x={holeX(col)}
            y={338}
            textAnchor="middle"
            fontSize={6}
            fontWeight={col % 5 === 0 ? 700 : 400}
            fill="#555555"
            pointerEvents="none"
          >
            {col}
          </text>
        </g>
      ))}

      <rect
        x={holeX(1) - 16}
        y={190}
        width={holeX(COLUMNS) - holeX(1) + 32}
        height={16}
        rx={8}
        fill="#e1e1e1"
        pointerEvents="none"
      />
      <text
        x={holeX(1) - 26}
        y={201}
        textAnchor="middle"
        fontSize={6}
        fill="#777777"
        pointerEvents="none"
      >
        TRENCH
      </text>

      {ROWS.map((row) => (
        <g key={row}>
          <text
            x={44}
            y={holeY(row) + 3}
            textAnchor="end"
            fontSize={8}
            fontWeight={700}
            fill="#333333"
            pointerEvents="none"
          >
            {row}
          </text>
          <text
            x={holeX(COLUMNS) + 34}
            y={holeY(row) + 3}
            fontSize={8}
            fontWeight={700}
            fill="#333333"
            pointerEvents="none"
          >
            {row}
          </text>
          {COLS.map((col) => renderHole(row, col))}
        </g>
      ))}

      {/* Chips and DIP switches sit in the background layer: seated on the
          board, underneath jumper wires and other parts. */}
      {children}

      {mode === "delete" && wireHitLayer}

      {wires.map((wire, index) => {
        const a = pointOf(wire.from);
        const b = pointOf(wire.to);
        if (!a || !b) return null;
        const d = wirePath(a, b);
        const color = wire.color ?? WIRE_COLORS[index % WIRE_COLORS.length];
        const isSelectedWire = selectedId === wire.id;
        return (
          <g key={wire.id}>
            {isSelectedWire && (
              <g pointerEvents="none">
                <path
                  d={d}
                  fill="none"
                  stroke="#1414d2"
                  strokeWidth={7}
                  strokeLinecap="round"
                  opacity={0.3}
                />
                <circle cx={a.x} cy={a.y} r={4} fill="#1414d2" opacity={0.3} />
                <circle cx={b.x} cy={b.y} r={4} fill="#1414d2" opacity={0.3} />
              </g>
            )}
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              pointerEvents="none"
            />
            <circle cx={a.x} cy={a.y} r={2.8} fill={color} pointerEvents="none" />
            <circle cx={b.x} cy={b.y} r={2.8} fill={color} pointerEvents="none" />
          </g>
        );
      })}

      {parts.map((part) => renderPart(part))}

      {ghostChip && hoverHole && (() => {
        const partsOfHover = splitHole(hoverHole);
        if (!partsOfHover) return null;
        const bottomCount = Math.ceil(ghostChip.pins / 2);
        const start = Math.max(
          1,
          Math.min(
            COLUMNS - bottomCount + 1,
            partsOfHover.col - Math.floor(bottomCount / 2),
          ),
        );
        const x1 = holeX(start) - 13;
        const x2 = holeX(start + bottomCount - 1) + 13;
        return (
          <g pointerEvents="none" opacity={0.5}>
            <rect
              x={x1}
              y={CHIP_BODY_TOP}
              width={x2 - x1}
              height={CHIP_BODY_HEIGHT}
              rx={3}
              fill="#d9d9d9"
              stroke="#1414d2"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
            <text
              x={(x1 + x2) / 2}
              y={CHIP_BODY_TOP + 20}
              textAnchor="middle"
              fontSize={8}
              fontWeight={700}
              fill="#1414d2"
            >
              {ghostChip.label}
            </text>
          </g>
        );
      })()}

      {!ghostChip && ghostLabel && hoverHole && (() => {
        const p = pointOf(hoverHole);
        if (!p) return null;
        return (
          <g pointerEvents="none">
            <circle cx={p.x} cy={p.y} r={7} fill="#1414d2" opacity={0.25} />
            <rect x={p.x - 26} y={p.y - 30} width={52} height={14} rx={3} fill="#1414d2" opacity={0.85} />
            <text x={p.x} y={p.y - 20} textAnchor="middle" fontSize={7} fontWeight={700} fill="#ffffff">
              {ghostLabel}
            </text>
          </g>
        );
      })()}

      {draft && (() => {
        const from = pointOf(draft.from);
        if (!from) return null;
        return (
          <g pointerEvents="none">
            <path
              d={wirePath(from, { x: draft.x, y: draft.y })}
              fill="none"
              stroke="#1414d2"
              strokeWidth={2.5}
              strokeDasharray="6 4"
            />
            <circle cx={draft.x} cy={draft.y} r={4} fill="#1414d2" />
          </g>
        );
      })()}
    </svg>
  );
}
