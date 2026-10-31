"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import PlayerPanel from "@/components/PlayerPanel";
import MovableWorkbench from "@/components/circuit/MovableWorkbench";
import { CIRCUITS } from "@/lib/data/circuits";
import { evaluateCircuit, type CircuitStates } from "@/lib/logic";
import { useGame } from "@/components/GameProvider";
import { sounds } from "@/lib/sound";
import { ui } from "@/lib/uiStyles";

const OPTIONS = ["OFF — output 0", "ON — output 1"];

export default function CircuitsPage() {
  const { completeLevel, completed } = useGame();
  const [index, setIndex] = useState(0);
  const circuit = CIRCUITS[index];

  const correct = useMemo(
    () => evaluateCircuit(circuit.nodes, circuit.connections)[circuit.targetLedId] ?? 0,
    [circuit],
  );

  const [choice, setChoice] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [live, setLive] = useState<CircuitStates>({});

  const doneCount = completed.circuits?.length ?? 0;

  function reset() {
    setChoice(null);
    setStatus("idle");
    setAttempts(0);
    setShowHint(false);
    setLive({});
  }

  function goTo(next: number) {
    setIndex(next);
    reset();
  }

  function pick(i: number) {
    if (status === "correct") return;
    setChoice(i);
    if (i === correct) {
      const stars = attempts === 0 ? 3 : attempts === 1 ? 2 : 1;
      completeLevel(circuit.id, "circuits", circuit.rewardXp, stars);
      setStatus("correct");
      sounds.playCorrect();
    } else {
      setAttempts((a) => a + 1);
      setStatus("wrong");
      sounds.playIncorrect();
    }
  }

  return (
    <div className={ui.page}>
      <ScreenFrame title="CIRCUIT CHALLENGES">
        <PlayerPanel />
        <p className={`${ui.hint} text-center`}>
          Read full multi-gate circuits, predict the output, then experiment on
          the movable workbench.
        </p>

        <div className="flex flex-wrap gap-2">
          {CIRCUITS.map((c, i) => (
            <button
              key={c.id}
              className={`${ui.button} !py-1 !text-[11px] ${
                i === index ? ui.buttonPrimary : ""
              }`}
              onClick={() => goTo(i)}
            >
              {(completed.circuits ?? []).includes(c.id) ? "✓ " : ""}
              {i + 1}. {c.title}
            </button>
          ))}
        </div>
        <p className={ui.hint}>
          PROGRESS: {doneCount} / {CIRCUITS.length} CIRCUITS SOLVED
        </p>

        <div className="flex flex-col gap-3 border-[3px] border-black bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xl font-black">
              {index + 1}. {circuit.title}
            </span>
            <div className="flex gap-2">
              <span className={ui.chip}>{circuit.concept}</span>
              <span className={ui.chip}>+{circuit.rewardXp} XP</span>
            </div>
          </div>

          <p className="text-sm">{circuit.description}</p>

          <MovableWorkbench
            key={circuit.id}
            initialNodes={circuit.nodes}
            initialConnections={circuit.connections}
            onStateChange={(states) => setLive(states)}
            height={400}
          />

          <p className={ui.hint}>
            LIVE OUTPUT: the target LED currently reads{" "}
            <b>{live[circuit.targetLedId] ?? 0}</b> with the shown switches.
          </p>

          <p className="font-bold">{circuit.task}</p>

          <div className="flex flex-wrap gap-2">
            {OPTIONS.map((label, i) => (
              <button
                key={label}
                className={`${ui.button} ${
                  choice === i && status === "correct" ? ui.buttonGreen : ""
                } ${choice === i && status === "wrong" ? ui.buttonRed : ""}`}
                onClick={() => pick(i)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className={`${ui.button} !py-1 !text-[11px]`}
              onClick={() => setShowHint((v) => !v)}
            >
              ? HINT
            </button>
            <button
              className={`${ui.button} !py-1 !text-[11px]`}
              onClick={() => goTo((index + 1) % CIRCUITS.length)}
            >
              NEXT CIRCUIT ▶
            </button>
          </div>

          {showHint && status !== "correct" && (
            <p className={`${ui.hint} border-l-4 border-black pl-3`}>
              {circuit.hint}
            </p>
          )}

          {status === "correct" && (
            <div className="border-[3px] border-[#2f9e44] bg-white p-3">
              <b>CORRECT!</b> {circuit.explanation}
            </div>
          )}
          {status === "wrong" && (
            <div className="border-[3px] border-[#ff5f5f] bg-white p-3">
              <b>NOT QUITE — try again.</b> Use the workbench to explore, then
              re-answer.
            </div>
          )}
        </div>

        <Link href="/menu" className={`${ui.button} ${ui.buttonPrimary} mx-auto`}>
          ◀ BACK TO MENU
        </Link>
      </ScreenFrame>
    </div>
  );
}
