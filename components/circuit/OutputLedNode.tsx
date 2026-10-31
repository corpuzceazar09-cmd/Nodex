"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import type { CircuitNode } from "@/lib/logic";
import { ui } from "@/lib/uiStyles";

/** A draggable output LED that lights when its signal is 1. */
export default function OutputLedNode({
  node,
  calculatedState,
  onStartDrag,
  isDragging,
}: {
  node: CircuitNode;
  calculatedState: number;
  onStartDrag: (nodeId: string, e: ReactPointerEvent) => void;
  isDragging: boolean;
}) {
  const on = calculatedState === 1;
  return (
    <div
      className={`${ui.circuitNode} flex h-[64px] w-[96px] cursor-grab flex-col items-center justify-center gap-1`}
      style={{ left: node.x, top: node.y, opacity: isDragging ? 0.8 : 1, borderColor: isDragging ? "#1414d2" : "#111" }}
      onPointerDown={(e) => onStartDrag(node.id, e)}
    >
      <span className="text-[10px] font-black tracking-widest">{node.label ?? "OUT"}</span>
      <span
        className={`h-6 w-6 rounded-full border-2 border-black ${
          on ? `${ui.ledOn} bg-[#6fd97f]` : "bg-[#5a5a5a]"
        }`}
      />
      <span className="absolute -left-1.5 top-[36px] h-3 w-3 -translate-y-1/2 rounded-full border-2 border-black bg-[#8a8a8a]" />
    </div>
  );
}
