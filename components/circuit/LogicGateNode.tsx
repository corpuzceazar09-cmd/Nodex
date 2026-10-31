"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import GateSymbol from "@/components/GateSymbol";
import type { GateId } from "@/lib/data/gates";
import type { CircuitNode } from "@/lib/logic";
import { ui } from "@/lib/uiStyles";

const SYMBOL_IDS: Record<string, GateId> = {
  BUFFER: "buffer",
  NOT: "not",
  AND: "and",
  OR: "or",
  NAND: "nand",
  NOR: "nor",
  XOR: "xor",
  XNOR: "xnor",
};

/** A draggable logic gate with a live output indicator. */
export default function LogicGateNode({
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
  const key = (node.gateType ?? "").toUpperCase();
  const symbolId = SYMBOL_IDS[key] ?? "and";

  return (
    <div
      className={`${ui.circuitNode} flex h-[88px] w-[148px] cursor-grab flex-col items-center justify-center p-1`}
      style={{ left: node.x, top: node.y, opacity: isDragging ? 0.8 : 1, borderColor: isDragging ? "#1414d2" : "#111" }}
      onPointerDown={(e) => onStartDrag(node.id, e)}
    >
      <span className="text-[11px] font-black tracking-widest">
        {key || "GATE"} <span className={calculatedState ? "text-[#2f9e44]" : "text-[#999]"}>{calculatedState}</span>
      </span>
      <GateSymbol gate={symbolId} className="h-12 w-24" />
      <span className="absolute -right-1.5 top-[46px] h-3 w-3 -translate-y-1/2 rounded-full border-2 border-black bg-[#8a8a8a]" />
    </div>
  );
}
