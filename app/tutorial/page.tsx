"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import { evaluateGate } from "@/lib/logic";
import { ui } from "@/lib/uiStyles";

// Tutorial: "SET UP THIS BUFFER". The player builds the circuit and fills in
// the truth table themselves; CHECK grades both, so mistakes are possible and
// each one gets a hint explaining what went wrong.

type Block = "input" | "buffer" | "output" | "and" | "or";

const EXPECTED: Block[] = ["input", "buffer", "output"];
const PALETTE: Block[] = ["input", "buffer", "output", "and", "or"];
const TABLE_ROWS = [[0], [1]];
const CORRECT_TABLE = TABLE_ROWS.map((row) => evaluateGate("BUFFER", row));

const SLOT_ROLE = ["the signal source", "the gate", "where the result shows"];

function slotHint(index: number, placed: Block): string {
  if (placed === "and" || placed === "or") {
    return `SLOT ${index + 1}: ${placed.toUpperCase()} NEEDS TWO INPUTS — A BUFFER CIRCUIT ONLY HAS ONE SIGNAL.`;
  }
  return `SLOT ${index + 1} SHOULD BE ${SLOT_ROLE[index].toUpperCase()}, NOT ${placed.toUpperCase()}.`;
}

type Phase = "intro" | "build" | "table" | "done";

export default function TutorialPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [slots, setSlots] = useState<(Block | null)[]>([null, null, null]);
  const [selected, setSelected] = useState<Block | null>(null);
  const [cells, setCells] = useState<(number | null)[]>([null, null]);
  const [wrongSlots, setWrongSlots] = useState<number[]>([]);
  const [wrongCells, setWrongCells] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [hint, setHint] = useState("");

  const allPlaced = slots.every(Boolean);
  const allSet = cells.every((c) => c !== null);

  function place(index: number, block: Block) {
    if (phase !== "build") return;
    setSlots((prev) => prev.map((s, i) => (i === index ? block : s)));
    setWrongSlots((prev) => prev.filter((i) => i !== index));
    setSelected(null);
    setHint("");
  }

  function onPalette(block: Block) {
    if (phase !== "build") return;
    setSelected(block);
    setHint(`NOW TAP A SLOT TO PLACE ${block.toUpperCase()}.`);
  }

  function onSlot(index: number) {
    if (phase !== "build") return;
    if (selected) {
      place(index, selected);
      return;
    }
    if (slots[index] !== null) {
      setSlots((prev) => prev.map((s, i) => (i === index ? null : s)));
      setWrongSlots((prev) => prev.filter((i) => i !== index));
      return;
    }
    setHint("PICK A BLOCK FROM THE PALETTE FIRST.");
  }

  function checkCircuit() {
    const wrong = slots
      .map((s, i) => (s === EXPECTED[i] ? -1 : i))
      .filter((i) => i >= 0);
    if (wrong.length === 0) {
      setWrongSlots([]);
      setHint("");
      setPhase("table");
      return;
    }
    setMistakes((m) => m + 1);
    setWrongSlots(wrong);
    setHint(slotHint(wrong[0], slots[wrong[0]] as Block));
  }

  function cycleCell(i: number) {
    if (phase !== "table") return;
    setCells((prev) => prev.map((c, j) => (j === i ? (c === null ? 0 : c === 0 ? 1 : null) : c)));
    setWrongCells((prev) => prev.filter((j) => j !== i));
  }

  function checkTable() {
    const wrong = cells
      .map((c, i) => (c === CORRECT_TABLE[i] ? -1 : i))
      .filter((i) => i >= 0);
    if (wrong.length === 0) {
      setWrongCells([]);
      setHint("");
      setPhase("done");
      return;
    }
    setMistakes((m) => m + 1);
    setWrongCells(wrong);
    const row = wrong[0];
    setHint(
      `ROW A = ${TABLE_ROWS[row][0]}: A BUFFER PASSES ITS INPUT THROUGH UNCHANGED. WHAT COMES OUT?`,
    );
  }

  return (
    <div className={ui.page}>
      <ScreenFrame title="TUTORIAL — SET UP THIS BUFFER">
        {phase === "intro" && (
          <>
            <div className="border-4 border-[#3b3452] bg-[#f2867a] p-4 text-center font-black">
              Hi! Welcome to Nodex!
            </div>
            <p className="text-center leading-relaxed">
              Before the real levels, let&apos;s build your first circuit:{" "}
              <b>a BUFFER</b>. A buffer simply passes its input through —
              nothing more.
            </p>
            <p className={`${ui.hint} text-center`}>
              Pick blocks from the palette and place them into the three slots,
              left to right: a signal source, a gate, and where the result shows.
              Then press CHECK.
            </p>
            <button
              className={`${ui.button} ${ui.buttonPrimary} mx-auto`}
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
                    className={`${ui.slot} ${s ? ui.slotFilled : ""} ${
                      wrongSlots.includes(i) ? "!border-[#f2867a] !bg-[#fde3df]" : ""
                    } ${phase === "build" && selected && !s ? ui.slotTarget : ""}`}
                    style={{ minWidth: "6.5rem" }}
                    onClick={() => onSlot(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const b = e.dataTransfer.getData("text/plain") as Block;
                      if (PALETTE.includes(b)) place(i, b);
                    }}
                  >
                    {s ? s.toUpperCase() : `SLOT ${i + 1}`}
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
                      className={`${ui.block} ${b === selected ? ui.blockSelected : ""}`}
                      style={{ minWidth: "5rem" }}
                    >
                      {b}
                    </div>
                  ))}
                </div>
                <p className={`${ui.hint} text-center`}>
                  {hint || "TAP A BLOCK, THEN A SLOT (OR DRAG IT). TAP A FILLED SLOT TO CLEAR IT."}
                </p>
                <button
                  className={`${ui.button} ${ui.buttonPrimary} mx-auto`}
                  onClick={checkCircuit}
                  disabled={!allPlaced}
                >
                  CHECK CIRCUIT
                </button>
              </>
            )}

            {phase === "table" && (
              <>
                <p className={`${ui.hint} text-center`}>
                  {hint || "NOW SET THE TRUTH TABLE — TAP EACH OUTPUT CELL TO TOGGLE 0 / 1, THEN CHECK."}
                </p>
                <div className="mx-auto">
                  <table className={ui.table}>
                    <thead>
                      <tr>
                        <th>A</th>
                        <th className={ui.tableOutputHeader} data-output>OUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TABLE_ROWS.map((row, i) => (
                        <tr key={i}>
                          <td>{row[0]}</td>
                          <td
                            className={`${ui.cellClickable} ${
                              wrongCells.includes(i) ? "!bg-[#fde3df]" : ""
                            }`}
                            data-output
                            onClick={() => cycleCell(i)}
                          >
                            {cells[i] === null ? "–" : cells[i]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className={`${ui.button} ${ui.buttonPrimary} mx-auto`}
                  onClick={checkTable}
                  disabled={!allSet}
                >
                  CHECK TABLE
                </button>
              </>
            )}

            {phase === "done" && (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-full border-4 border-[#3b3452] bg-[#8fd86a] p-3 font-black">
                  NICE! THE BUFFER PASSES THE SIGNAL UNCHANGED.
                </div>
                <p className="leading-relaxed">
                  0 stays 0 and 1 stays 1 — the simplest circuit in the world.
                  That&apos;s how every gate in this game works:{" "}
                  <b>inputs in, output out</b>.
                </p>
                <p className={ui.hint}>
                  {mistakes === 0
                    ? "PERFECT — NO MISTAKES!"
                    : `FINISHED WITH ${mistakes} MISTAKE${mistakes === 1 ? "" : "S"}. THAT'S HOW YOU LEARN.`}
                </p>
                <div className="mx-auto">
                  <table className={ui.table}>
                    <thead>
                      <tr>
                        <th>A</th>
                        <th className={ui.tableOutputHeader} data-output>OUT</th>
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
                  className={`${ui.button} ${ui.buttonPrimary}`}
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
            className={`${ui.button} mx-auto mt-auto text-xs`}
            onClick={() => router.push("/difficulty")}
          >
            SKIP TUTORIAL ▶▶
          </button>
        )}
      </ScreenFrame>
    </div>
  );
}
