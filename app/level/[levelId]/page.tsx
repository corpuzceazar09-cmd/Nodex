"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import GateSymbol from "@/components/GateSymbol";
import { useGame, type CompleteResult } from "@/components/GameProvider";
import { getLevel, type BlockKind, type Level } from "@/lib/data/levels";
import { TIERS } from "@/lib/data/tiers";
import { failureLine, successLine } from "@/lib/data/copy";
import { sounds } from "@/lib/sound";

type Phase = "answering" | "correct" | "wrong" | "reward";

export default function LevelPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = use(params);
  const router = useRouter();
  const level = getLevel(levelId);

  useEffect(() => {
    if (!level) router.replace("/difficulty");
  }, [level, router]);

  if (!level) return null;

  // key → full remount per level, so all UI state starts fresh
  return <LevelFlow key={levelId} level={level} />;
}

function LevelFlow({ level }: { level: Level }) {
  const router = useRouter();
  const { xp, streak, completeLevel } = useGame();

  const [phase, setPhase] = useState<Phase>("answering");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [picked, setPicked] = useState<BlockKind | null>(null);
  const [slots, setSlots] = useState<(BlockKind | null)[]>(() =>
    level.challenge.kind === "build"
      ? Array(level.challenge.slots).fill(null)
      : [],
  );
  const [cells, setCells] = useState<(number | null)[]>(() =>
    level.challenge.kind === "build"
      ? Array(level.challenge.table.length).fill(null)
      : [],
  );
  const [rewarded, setRewarded] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [result, setResult] = useState<CompleteResult | null>(null);

  const challenge = level.challenge;
  const tier = TIERS[level.tierId];

  /* ---------- builder interactions ---------- */

  function placeIn(index: number, block: BlockKind) {
    if (challenge.kind !== "build") return;
    if (index >= challenge.slots) return;
    setSlots((prev) => prev.map((s, i) => (i === index ? block : s)));
    setPicked(null);
  }

  function onSlotClick(index: number) {
    if (picked) placeIn(index, picked);
    else setSlots((prev) => prev.map((s, i) => (i === index ? null : s)));
  }

  function cycleCell(index: number) {
    setCells((prev) =>
      prev.map((c, i) =>
        i === index ? (c === null ? 0 : c === 0 ? 1 : null) : c,
      ),
    );
  }

  /* ---------- answer checking (equality only — no evaluator) ---------- */

  const buildComplete =
    challenge.kind === "build" &&
    slots.length === challenge.slots &&
    slots.every((s) => s !== null) &&
    cells.length === challenge.table.length &&
    cells.every((c) => c !== null);

  function check() {
    if (challenge.kind === "mc") {
      if (selectedChoice === challenge.correct) award();
      else markWrong();
      return;
    }
    const slotsOk = challenge.correctSlots.every((b, i) => slots[i] === b);
    const tableOk = challenge.correctTable.every((v, i) => cells[i] === v);
    if (slotsOk && tableOk) award();
    else markWrong();
  }

  function markWrong() {
    setWrongCount((c) => c + 1);
    sounds.playIncorrect();
    setPhase("wrong");
  }

  function award() {
    const stars = wrongCount === 0 ? 3 : wrongCount === 1 ? 2 : 1;
    const r = completeLevel(level.id, level.tierId, level.rewardXp, stars);
    setResult(r);
    sounds.playCorrect();
    setPhase("correct");
  }

  function rewardContinue() {
    if (rewarded) return;
    setRewarded(true);
    router.push(
      level.isFinal ? `/complete/${level.tierId}` : `/map/${level.tierId}`,
    );
  }

  const inputHeaders =
    challenge.kind === "build" &&
    challenge.table.length > 0 &&
    challenge.table[0].length === 1
      ? ["A"]
      : ["A", "B"];

  /* ---------- render ---------- */

  return (
    <div className="wf-page">
      <ScreenFrame
        title={`${level.title}${level.isFinal ? " — FINAL CHALLENGE" : ""}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/map/${level.tierId}`} className="wf-btn text-xs">
            ◀ LEVEL MAP
          </Link>
          <div className="flex gap-2">
            <span className="wf-chip">{tier.name}</span>
            <span className="wf-chip wf-chip-streak">+{level.rewardXp} XP</span>
          </div>
        </div>

        <p className="text-xs font-black tracking-widest">QUESTION::</p>
        <div className="border-[3px] border-black bg-white p-4 text-center text-lg font-bold leading-relaxed">
          {challenge.prompt}
        </div>

        {challenge.kind === "mc" && challenge.visualGate && (
          <div className="flex justify-center border-[3px] border-black bg-white p-3">
            <GateSymbol gate={challenge.visualGate} className="h-24 w-44" />
          </div>
        )}

        {challenge.kind === "mc" && (
          <>
            <p className="text-xs font-black tracking-widest">CHOICES</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {challenge.choices.map((c, i) => (
                <button
                  key={c}
                  className={`wf-btn ${selectedChoice === i ? "wf-btn-primary" : ""}`}
                  onClick={() => setSelectedChoice(i)}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              className="wf-btn wf-btn-green mx-auto"
              disabled={selectedChoice === null}
              onClick={check}
            >
              CHECK ▶
            </button>
          </>
        )}

        {challenge.kind === "build" && (
          <>
            {/* palette */}
            <div className="flex flex-wrap justify-center gap-2">
              {challenge.palette.map((b) => (
                <div
                  key={b}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", b)}
                  onClick={() => setPicked(picked === b ? null : b)}
                  className={`wf-block ${picked === b ? "wf-block-selected" : ""}`}
                  style={{ minWidth: "5rem" }}
                >
                  {b}
                </div>
              ))}
            </div>

            {/* slots */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {slots.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`wf-slot ${s ? "wf-slot-filled" : ""}`}
                    style={{ minWidth: "6.5rem" }}
                    onClick={() => onSlotClick(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const b = e.dataTransfer.getData(
                        "text/plain",
                      ) as BlockKind;
                      if (b) placeIn(i, b);
                    }}
                  >
                    {s ? s.toUpperCase() : `SLOT ${i + 1}`}
                  </div>
                  {i < slots.length - 1 && <span className="font-black">→</span>}
                </div>
              ))}
            </div>

            {/* truth table to fill in */}
            <div className="mx-auto">
              <table className="wf-table">
                <thead>
                  <tr>
                    {inputHeaders.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                    <th className="wf-table-out">OUT</th>
                  </tr>
                </thead>
                <tbody>
                  {challenge.table.map((row, i) => (
                    <tr key={i}>
                      {row.map((v, j) => (
                        <td key={j}>{v}</td>
                      ))}
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

            <p className="wf-hint text-center">
              TAP A BLOCK, THEN TAP A SLOT (OR DRAG IT) · TAP OUTPUT CELLS TO
              TOGGLE 0 / 1 · TAP A FILLED SLOT TO CLEAR IT
            </p>

            <button
              className="wf-btn wf-btn-green mx-auto"
              disabled={!buildComplete}
              onClick={check}
            >
              CHECK ▶
            </button>
          </>
        )}
      </ScreenFrame>

      {/* ---------- feedback: correct ---------- */}
      {phase === "correct" && (
        <div className="wf-overlay">
          <div className="wf-modal wf-modal-correct">
            <div className="text-3xl font-black">✔ CORRECT!</div>
            <div className="w-full border-4 border-black bg-[#6fd97f] p-2 font-black">
              {successLine(level.index)}
            </div>
            <p className="text-sm leading-relaxed">{challenge.explanation}</p>
            <button
              className="wf-btn wf-btn-green"
              onClick={() => {
                sounds.playFanfare();
                setPhase("reward");
              }}
            >
              CONTINUE ▶
            </button>
          </div>
        </div>
      )}

      {/* ---------- feedback: incorrect ---------- */}
      {phase === "wrong" && (
        <div className="wf-overlay">
          <div className="wf-modal wf-modal-wrong">
            <div className="text-3xl font-black">✘ NOT QUITE</div>
            <div className="w-full border-4 border-black bg-[#ff5f5f] p-2 font-black">
              {failureLine(level.index)}
            </div>
            <p className="text-sm leading-relaxed">{challenge.explanation}</p>
            <div className="flex w-full gap-3">
              <button
                className="wf-btn flex-1"
                onClick={() => {
                  setPhase("answering");
                  if (challenge.kind === "mc") setSelectedChoice(null);
                }}
              >
                TRY AGAIN
              </button>
              <button
                className="wf-btn flex-1 text-xs"
                onClick={() => router.push(`/map/${level.tierId}`)}
              >
                SKIP LEVEL ▶▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- reward modal ---------- */}
      {phase === "reward" && (
        <div className="wf-overlay">
          <div className="wf-modal">
            <div className="text-3xl font-black">CONGRATS!</div>
            <div className="w-full border-4 border-black bg-[#ff5f5f] p-3 font-black">
              {result?.newlyCompleted
                ? `You have earned ${result.xpAwarded} XP!`
                : "REPLAY — no new XP awarded."}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="wf-chip">XP {xp}</span>
              <span className="wf-chip wf-chip-streak">
                +{result?.xpAwarded ?? 0} XP
              </span>
              <span className="wf-chip">
                {"★".repeat(wrongCount === 0 ? 3 : wrongCount === 1 ? 2 : 1)}
              </span>
              <span className="wf-chip wf-chip-streak">STREAK {streak}</span>
            </div>
            {result && result.newBadges.length > 0 && (
              <div className="w-full border-4 border-black bg-[#6fd97f] p-2 text-sm font-black">
                NEW BADGE{result.newBadges.length > 1 ? "S" : ""}:{" "}
                {result.newBadges.join(", ")}
              </div>
            )}
            <button
              className="wf-btn wf-btn-primary"
              onClick={rewardContinue}
            >
              CONTINUE ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}