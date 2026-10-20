"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";

// Scripted tutorial: "SET UP THIS BUFFER". Every action advances the script;
// the outcome is always the canned success message (no evaluation).

type Block = "input" | "buffer" | "output";

const EXPECTED: Block[] = ["input", "buffer", "output"];
const PALETTE: string[] = ["input", "buffer", "output", "and", "or"];
const TABLE_ROWS = [[0], [1]];
const CORRECT_TABLE = [0, 1];

type Phase = "intro" | "build" | "table" | "done";

export default function TutorialPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [slots, setSlots] = useState<(Block | null)[]>([null, null, null]);
  const [selected, setSelected] = useState<Block | null>(null);
  const [cells, setCells] = useState<(number | null)[]>([null, null]);
  const [hint, setHint] = useState("");

  const targetSlot = slots.findIndex((s) => s === null);
  const expected = targetSlot >= 0 ? EXPECTED[targetSlot] : null;

  function place(index: number, block: Block) {
    if (phase !== "build" || index !== targetSlot) return;
    if (block !== expected) {
      setHint("TAP THE HIGHLIGHTED BLOCK FIRST!");
      return;
    }
    const next = [...slots];
    next[index] = block;
    setSlots(next);
    setSelected(null);
    setHint("");
    if (next.every(Boolean)) setPhase("table");
  }

  function onPalette(block: string) {
    if (phase !== "build") return;
    if (block !== expected) {
      setHint("THAT BLOCK ISN'T NEEDED — USE THE HIGHLIGHTED ONE.");
      return;
    }
    setSelected(block);
    setHint(`NOW TAP SLOT ${targetSlot + 1} TO PLACE IT.`);
  }

  function onSlot(index: number) {
    if (slots[index] !== null) {
      setSlots((prev) => prev.map((s, i) => (i === index ? null : s)));
      return;
    }
    if (selected) place(index, selected);
    else if (expected) setHint(`HIGHLIGHTED BLOCK GOES IN SLOT ${index + 1}.`);
  }

  function cycleCell(i: number) {
    const next = cells.map((c, j) => (j === i ? (c === null ? 0 : c === 0 ? 1 : null) : c));
    setCells(next);
    if (next.every((c) => c !== null)) setPhase("done");
  }

  return (
    <div className="wf-page">
      <ScreenFrame title="TUTORIAL — SET UP THIS BUFFER">
        {phase === "intro" && (
          <>
            <div className="border-4 border-black bg-[#ff5f5f] p-4 text-center font-black">
              Hi! Welcome to Nodex!
            </div>
            <p className="text-center leading-relaxed">
              Before the real levels, let&apos;s build your first circuit:{" "}
              <b>a BUFFER</b>. A buffer simply passes its input through —
              nothing more.
            </p>
            <p className="wf-hint text-center">
              Blocks go into the three slots below, left to right. Ready?
            </p>
            <button
              className="wf-btn wf-btn-primary mx-auto"
              onClick={() => setPhase("build")}
            >
              LET&apos;S BUILD ▶
            </button>
          </>
        )}

        {(phase === "build" || phase === "table" || phase === "done") && (
          <>
            {/* circuit area */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {slots.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`wf-slot ${s ? "wf-slot-filled" : ""} ${
                      phase === "build" && i === targetSlot
                        ? "wf-slot-target"
                        : ""
                    }`}
                    style={{ minWidth: "6.5rem" }}
                    onClick={() => onSlot(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const b = e.dataTransfer.getData("text/plain");
                      if (b) place(i, b as Block);
                    }}
                  >
                    {s ? s.toUpperCase() : i === targetSlot ? "DROP HERE" : "EMPTY"}
                  </div>
                  {i < slots.length - 1 && <span className="font-black">→</span>}
                </div>
              ))}
            </div>

            {phase === "build" && (
              <>
                {/* palette */}
                <div className="flex flex-wrap justify-center gap-2">
                  {PALETTE.map((b) => (
                    <div
                      key={b}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", b)}
                      onClick={() => onPalette(b)}
                      className={`wf-block ${
                        b === expected ? "wf-block-selected" : ""
                      }`}
                      style={{ minWidth: "5rem" }}
                    >
                      {b}
                    </div>
                  ))}
                </div>
                <p className="wf-hint text-center">
                  {hint || `STEP: PLACE THE HIGHLIGHTED BLOCK INTO SLOT ${targetSlot + 1}.`}
                </p>
              </>
            )}

            {phase === "table" && (
              <>
                <p className="wf-hint text-center">
                  NOW SET THE TRUTH TABLE — TAP EACH OUTPUT CELL TO TOGGLE 0 / 1.
                </p>
                <div className="mx-auto">
                  <table className="wf-table">
                    <thead>
                      <tr>
                        <th>A</th>
                        <th className="wf-table-out">OUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TABLE_ROWS.map((row, i) => (
                        <tr key={i}>
                          <td>{row[0]}</td>
                          <td
                            className="wf-cell-clickable"
                            onClick={() => cycleCell(i)}
                          >
                            {cells[i] === null ? "–" : cells[i]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {phase === "done" && (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-full border-4 border-black bg-[#6fd97f] p-3 font-black">
                  NICE! THE BUFFER PASSES THE SIGNAL UNCHANGED.
                </div>
                <p className="leading-relaxed">
                  0 stays 0 and 1 stays 1 — the simplest circuit in the world.
                  That&apos;s how every gate in this game works:{" "}
                  <b>inputs in, output out</b>.
                </p>
                <div className="mx-auto">
                  <table className="wf-table">
                    <thead>
                      <tr>
                        <th>A</th>
                        <th className="wf-table-out">OUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TABLE_ROWS.map((row, i) => (
                        <tr key={i}>
                          <td>{row[0]}</td>
                          <td>{CORRECT_TABLE[i]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="wf-btn wf-btn-primary"
                  onClick={() => router.push("/difficulty")}
                >
                  CONTINUE ▶
                </button>
              </div>
            )}
          </>
        )}

        {phase !== "done" && phase !== "intro" && (
          <button
            className="wf-btn mx-auto mt-auto text-xs"
            onClick={() => router.push("/difficulty")}
          >
            SKIP TUTORIAL ▶▶
          </button>
        )}
      </ScreenFrame>
    </div>
  );
}