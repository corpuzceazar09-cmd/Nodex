"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import GateSymbol from "@/components/GateSymbol";
import TruthTable from "@/components/TruthTable";
import IcChip from "@/components/IcChip";
import MovableWorkbench from "@/components/circuit/MovableWorkbench";
import LiveTruthTable from "@/components/circuit/LiveTruthTable";
import { useGame } from "@/components/GameProvider";
import { GATES, GATE_ORDER, type GateId } from "@/lib/data/gates";
import type { CircuitConnection, CircuitNode, CircuitStates } from "@/lib/logic";
import { ui } from "@/lib/uiStyles";

function buildCircuit(gateId: GateId) {
  const gate = GATES[gateId];
  const twoInput = gate.inputs >= 2;
  const nodes: CircuitNode[] = [
    { id: "sw-a", type: "switch", label: "INPUT A", state: 0, x: 30, y: 40 },
    ...(twoInput
      ? [
          {
            id: "sw-b",
            type: "switch" as const,
            label: "INPUT B",
            state: 0,
            x: 30,
            y: 160,
          },
        ]
      : []),
    {
      id: "gate-lab",
      type: "gate",
      label: "GATE",
      gateType: gateId.toUpperCase(),
      x: 280,
      y: 80,
    },
    { id: "led-lab", type: "led", label: "OUT", x: 520, y: 96 },
  ];
  const connections: CircuitConnection[] = [
    { from: "sw-a", to: "gate-lab", pin: "input-0" },
    ...(twoInput
      ? [{ from: "sw-b", to: "gate-lab", pin: "input-1" as const }]
      : []),
    { from: "gate-lab", to: "led-lab" },
  ];
  return { nodes, connections };
}

export default function LabClient({ initialGate }: { initialGate: GateId }) {
  const { markGateExplored } = useGame();
  const [gateId, setGateId] = useState<GateId>(initialGate);
  const gate = GATES[gateId];
  const [live, setLive] = useState<CircuitStates>({});

  useEffect(() => {
    markGateExplored(gateId);
  }, [gateId, markGateExplored]);

  const circuit = useMemo(() => buildCircuit(gateId), [gateId]);

  return (
    <div className={ui.page}>
      <ScreenFrame title="LOGIC GATE LAB — INTERACTIVE">
        <p className={`${ui.hint} text-center`}>
          Flip the switches and drag components: symbols, expressions, truth
          tables and live circuits for every gate.
        </p>

        <div className="grid flex-1 gap-4 md:grid-cols-[11rem_1fr]">
          <div className="flex flex-col gap-2">
            {GATE_ORDER.map((id) => (
              <button
                key={id}
                className={`${ui.button} ${id === gateId ? ui.buttonPrimary : ""}`}
                onClick={() => setGateId(id)}
              >
                {GATES[id].name}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-[3px] border-black bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-2xl font-black">{gate.name} GATE</span>
              <div className="flex gap-2">
                <span className={ui.chip}>{gate.category}</span>
                <span className={ui.chip}>{gate.expression}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 border-[3px] border-dashed border-black p-3">
              <GateSymbol gate={gate.id} className="h-24 w-44" />
              <IcChip
                label={gate.ic.split("—")[0].trim()}
                className="h-24 w-48"
              />
            </div>

            <p className="leading-relaxed">{gate.description}</p>

            <div className="flex flex-col gap-1 border-l-4 border-black pl-3">
              <p className="text-xs font-black tracking-widest">HOW IT WORKS</p>
              <p className="text-sm">{gate.rule}</p>
              <p className={ui.hint}>ANALOGY: {gate.analogy}</p>
              <p className={ui.hint}>HINT: {gate.hint}</p>
            </div>

            <div className="flex flex-wrap items-start gap-6">
              <div>
                <p className="mb-1 text-xs font-black tracking-widest">
                  TRUTH TABLE
                </p>
                <TruthTable gate={gate} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-black tracking-widest">IC PINS</p>
                <p className={ui.hint}>{gate.ic}</p>
                <p className={ui.hint}>INPUTS: {gate.inputs}</p>
                <p className={ui.hint}>VCC: PIN 14 — GND: PIN 7</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <MovableWorkbench
            key={gateId}
            initialNodes={circuit.nodes}
            initialConnections={circuit.connections}
            onStateChange={(states) => setLive(states)}
            height={300}
          />
          <div className="flex flex-col gap-2">
            <LiveTruthTable
              gateType={gateId}
              currentInputA={live["sw-a"] ?? 0}
              currentInputB={live["sw-b"] ?? 0}
            />
            <p className={`${ui.hint} max-w-[14rem]`}>
              The highlighted row tracks the live switch inputs.
            </p>
          </div>
        </div>

        <Link href="/sandbox" className={`${ui.button} text-xs`}>
          OPEN BREADBOARD SANDBOX
        </Link>

        <Link href="/menu" className={`${ui.button} mx-auto text-xs`}>
          ◀ BACK TO MENU
        </Link>
      </ScreenFrame>
    </div>
  );
}
