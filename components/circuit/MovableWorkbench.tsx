"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import DynamicWire from "./DynamicWire";
import InputSwitchNode from "./InputSwitchNode";
import LogicGateNode from "./LogicGateNode";
import OutputLedNode from "./OutputLedNode";
import {
  evaluateCircuit,
  type CircuitConnection,
  type CircuitNode,
  type CircuitStates,
} from "@/lib/logic";
import { sounds } from "@/lib/sound";

const SIZE: Record<CircuitNode["type"], { w: number; h: number }> = {
  switch: { w: 136, h: 72 },
  gate: { w: 148, h: 88 },
  led: { w: 96, h: 64 },
};

function outputPin(node: CircuitNode) {
  if (node.type === "gate") return { x: node.x + 148, y: node.y + 44 };
  return { x: node.x + SIZE[node.type].w, y: node.y + 36 };
}

function inputPin(node: CircuitNode, pin?: string) {
  if (node.type === "led") return { x: node.x, y: node.y + 36 };
  if (node.type === "gate") {
    const key = (node.gateType ?? "").toUpperCase();
    if (key === "NOT" || key === "BUFFER") return { x: node.x, y: node.y + 44 };
    return pin === "input-1"
      ? { x: node.x, y: node.y + 60 }
      : { x: node.x, y: node.y + 34 };
  }
  return { x: node.x, y: node.y + 36 };
}

export default function MovableWorkbench({
  initialNodes = [],
  initialConnections = [],
  onStateChange,
  height = 360,
  interactive = true,
}: {
  initialNodes?: CircuitNode[];
  initialConnections?: CircuitConnection[];
  onStateChange?: (states: CircuitStates, nodes: CircuitNode[]) => void;
  height?: number;
  interactive?: boolean;
}) {
  const [nodes, setNodes] = useState<CircuitNode[]>(initialNodes);
  const [connections] = useState<CircuitConnection[]>(initialConnections);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const states = evaluateCircuit(nodes, connections);

  useEffect(() => {
    onStateChange?.(states, nodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, connections]);

  const toggleSwitch = useCallback((nodeId: string) => {
    sounds.playSwitch();
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, state: n.state === 1 ? 0 : 1 } : n,
      ),
    );
  }, []);

  const startDrag = useCallback(
    (nodeId: string, e: ReactPointerEvent) => {
      if (!interactive || !containerRef.current) return;
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const rect = containerRef.current.getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y,
      };
      containerRef.current.setPointerCapture(e.pointerId);
      setActiveDragId(nodeId);
    },
    [interactive, nodes],
  );

  const moveDrag = useCallback(
    (e: ReactPointerEvent) => {
      if (!activeDragId || !containerRef.current) return;
      const node = nodes.find((n) => n.id === activeDragId);
      if (!node) return;
      const rect = containerRef.current.getBoundingClientRect();
      const size = SIZE[node.type];
      const rawX = e.clientX - rect.left - dragOffsetRef.current.x;
      const rawY = e.clientY - rect.top - dragOffsetRef.current.y;
      const x = Math.max(8, Math.min(rect.width - size.w - 8, rawX));
      const y = Math.max(8, Math.min(rect.height - size.h - 8, rawY));
      setNodes((prev) =>
        prev.map((n) =>
          n.id === activeDragId ? { ...n, x: Math.round(x), y: Math.round(y) } : n,
        ),
      );
    },
    [activeDragId, nodes],
  );

  const endDrag = useCallback(() => {
    if (activeDragId) {
      setActiveDragId(null);
      sounds.playSnap();
    }
  }, [activeDragId]);

  const resetLayout = useCallback(() => {
    setNodes(initialNodes);
    sounds.playBtn();
  }, [initialNodes]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="wf-hint">
          Grab &amp; drag any component. Click a switch to flip it.
        </span>
        <button type="button" className="wf-btn !py-1 !text-[11px]" onClick={resetLayout}>
          ⟲ RESET LAYOUT
        </button>
      </div>
      <div
        ref={containerRef}
        className="wf-workbench"
        style={{ height }}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full">
          {connections.map((conn, idx) => {
            const from = nodes.find((n) => n.id === conn.from);
            const to = nodes.find((n) => n.id === conn.to);
            if (!from || !to) return null;
            return (
              <DynamicWire
                key={`${conn.from}-${conn.to}-${conn.pin ?? "in"}-${idx}`}
                start={outputPin(from)}
                end={inputPin(to, conn.pin)}
                state={states[conn.from] ?? 0}
              />
            );
          })}
        </svg>

        {nodes.map((node) => {
          if (node.type === "switch") {
            return (
              <InputSwitchNode
                key={node.id}
                node={node}
                onToggle={toggleSwitch}
                onStartDrag={startDrag}
                isDragging={activeDragId === node.id}
              />
            );
          }
          if (node.type === "gate") {
            return (
              <LogicGateNode
                key={node.id}
                node={node}
                calculatedState={states[node.id] ?? 0}
                onStartDrag={startDrag}
                isDragging={activeDragId === node.id}
              />
            );
          }
          return (
            <OutputLedNode
              key={node.id}
              node={node}
              calculatedState={states[node.id] ?? 0}
              onStartDrag={startDrag}
              isDragging={activeDragId === node.id}
            />
          );
        })}
      </div>
    </div>
  );
}
