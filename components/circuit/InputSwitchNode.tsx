"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import type { CircuitNode } from "@/lib/logic";
import { ui } from "@/lib/uiStyles";

export type NodeHandlers = {
  onToggle: (nodeId: string) => void;
  onStartDrag: (nodeId: string, e: ReactPointerEvent) => void;
  isDragging: boolean;
};

/** A draggable input switch that toggles between 0 and 1. */
export default function InputSwitchNode({
  node,
  onToggle,
  onStartDrag,
  isDragging,
}: NodeHandlers & { node: CircuitNode }) {
  const on = node.state === 1;
  return (
    <div
      className={`${ui.circuitNode} flex h-[72px] w-[136px] cursor-grab flex-col justify-between p-2`}
      style={{ left: node.x, top: node.y, opacity: isDragging ? 0.8 : 1, borderColor: isDragging ? "#1414d2" : "#111" }}
      onPointerDown={(e) => onStartDrag(node.id, e)}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black tracking-widest">{node.label ?? node.id}</span>
        <span
          className={`flex h-5 w-5 items-center justify-center border-2 border-black text-[11px] font-black ${
            on ? "bg-[#6fd97f]" : "bg-white"
          }`}
        >
          {on ? 1 : 0}
        </span>
      </div>
      <button
        type="button"
        className={`${ui.button} !py-0.5 !text-[11px]`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onToggle(node.id)}
      >
        {on ? "SET 0" : "SET 1"}
      </button>
      <span className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-black bg-[#8a8a8a]" />
    </div>
  );
}
