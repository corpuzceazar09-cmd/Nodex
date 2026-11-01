"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import GateSymbol from "@/components/GateSymbol";
import CableEnds from "@/components/cabling/CableEnds";
import WireSwatch from "@/components/cabling/WireSwatch";
import WiringBoard from "@/components/cabling/WiringBoard";
import { useGame, type CompleteResult } from "@/components/GameProvider";
import { WIRES } from "@/lib/data/cabling";
import { getLevel, type BlockKind, type Level } from "@/lib/data/levels";
import { TIERS } from "@/lib/data/tiers";
import { failureLine, successLine } from "@/lib/data/copy";
import { getBadge } from "@/lib/gameState";
import { LEVEL_TOPICS, TOPIC_MAP } from "@/lib/data/topics";
import { sounds } from "@/lib/sound";
import { ui } from "@/lib/uiStyles";

type Phase = "answering" | "correct" | "wrong" | "reward";

/** Fixed scramble of the 8 wires for "order" levels, so the palette never starts solved. */
const ORDER_PALETTE = [5, 2, 7, 0, 3, 6, 1, 4];

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
  const { xp, streak, completeLevel, recordAnswer } = useGame();
  const topicNames = (LEVEL_TOPICS[level.id] ?? []).map((id) => TOPIC_MAP[id]?.name ?? id);

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
  const [orderSlots, setOrderSlots] = useState<(number | null)[]>(() =>
    level.challenge.kind === "order" ? Array(8).fill(null) : [],
  );
  const [pickedWire, setPickedWire] = useState<number | null>(null);
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

  /* ---------- wire-order interactions ---------- */

  function onOrderSlot(index: number) {
    if (pickedWire !== null) {
      setOrderSlots((prev) => prev.map((s, i) => (i === index ? pickedWire : s)));
      setPickedWire(null);
    } else {
      setOrderSlots((prev) => prev.map((s, i) => (i === index ? null : s)));
    }
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
    if (challenge.kind === "order") {
      if (challenge.correctOrder.every((w, i) => orderSlots[i] === w)) award();
      else markWrong();
      return;
    }
    if (challenge.kind !== "build") return;
    const slotsOk = challenge.correctSlots.every((b, i) => slots[i] === b);
    const tableOk = challenge.correctTable.every((v, i) => cells[i] === v);
    if (slotsOk && tableOk) award();
    else markWrong();
  }

  function markWrong() {
    recordAnswer(level.id, false);
    setWrongCount((c) => c + 1);
    sounds.playIncorrect();
    setPhase("wrong");
  }

  function award() {
    recordAnswer(level.id, true);
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
    <div className={ui.page}>
      <ScreenFrame
        title={`${level.title}${level.isFinal ? " — FINAL CHALLENGE" : ""}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/map/${level.tierId}`} className={`${ui.button} text-xs`}>
            ◀ LEVEL MAP
          </Link>
          <div className="flex gap-2">
            <span className={ui.chip}>{tier.name}</span>
            <span className={`${ui.chip} ${ui.chipStreak}`}>+{level.rewardXp} XP</span>
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

        {challenge.kind === "mc" && challenge.visualCable && (
          <CableEnds mode={challenge.visualCable} />
        )}

        {challenge.kind === "order" && (
          <>
            <p className="text-xs font-black tracking-widest">WIRES</p>
            <div className="flex flex-wrap justify-center gap-2">
              {ORDER_PALETTE.filter((w) => !orderSlots.includes(w)).map((w) => (
                <button
                  key={w}
                  type="button"
                  className={`${ui.block} gap-2 ${pickedWire === w ? ui.blockSelected : ""}`}
                  onClick={() => setPickedWire(pickedWire === w ? null : w)}
                  aria-pressed={pickedWire === w}
                >
                  <WireSwatch index={w} className="h-3 w-6" />
                  {WIRES[w].name}
                </button>
              ))}
            </div>
            <p className="text-xs font-black tracking-widest">RJ45 PINS</p>
            <div className="mx-auto grid w-full max-w-md gap-2">
              {orderSlots.map((w, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${ui.slot} !min-h-10 justify-start gap-3 px-3 ${w !== null ? ui.slotFilled : ""} ${pickedWire !== null && w === null ? ui.slotTarget : ""}`}
                  onClick={() => onOrderSlot(i)}
                >
                  <span className="w-12 text-left">PIN {i + 1}</span>
                  {w !== null ? (
                    <>
                      <WireSwatch index={w} className="h-3 w-8" />
                      <span>{WIRES[w].name}</span>
                    </>
                  ) : (
                    <span className="opacity-60">EMPTY</span>
                  )}
                </button>
              ))}
            </div>
            <p className={`${ui.hint} text-center`}>
              TAP A WIRE, THEN TAP A PIN · TAP A FILLED PIN TO CLEAR IT
            </p>
            <button
              className={`${ui.button} ${ui.buttonGreen} mx-auto`}
              disabled={orderSlots.some((w) => w === null)}
              onClick={check}
            >
              CHECK ▶
            </button>
          </>
        )}

        {challenge.kind === "wire" && (
          <WiringBoard
            mode={challenge.mode}
            onCheck={(allCorrect) => (allCorrect ? award() : markWrong())}
          />
        )}

        {challenge.kind === "mc" && (
          <>
            <p className="text-xs font-black tracking-widest">CHOICES</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {challenge.choices.map((c, i) => (
                <button
                  key={c}
                  className={`${ui.button} ${selectedChoice === i ? ui.buttonPrimary : ""}`}
                  onClick={() => setSelectedChoice(i)}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              className={`${ui.button} ${ui.buttonGreen} mx-auto`}
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
                <button
                  key={b}
                  type="button"
                  draggable
                  aria-pressed={picked === b}
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", b)}
                  onClick={() => setPicked(picked === b ? null : b)}
                  className={`${ui.block} ${picked === b ? ui.blockSelected : ""}`}
                  style={{ minWidth: "5rem" }}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* slots */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {slots.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={`Slot ${i + 1}: ${s ? s.toUpperCase() : "empty"}`}
                    className={`${ui.slot} ${s ? ui.slotFilled : ""}`}
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
                  </button>
                  {i < slots.length - 1 && <span className="font-black">→</span>}
                </div>
              ))}
            </div>

            {/* truth table to fill in */}
            <div className="mx-auto">
              <table className={ui.table}>
                <thead>
                  <tr>
                    {inputHeaders.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                    <th className={ui.tableOutputHeader} data-output>OUT</th>
                  </tr>
                </thead>
                <tbody>
                  {challenge.table.map((row, i) => (
                    <tr key={i}>
                      {row.map((v, j) => (
                        <td key={j}>{v}</td>
                      ))}
                      <td className={ui.cellClickable}>
                        <button
                          type="button"
                          className="h-full w-full font-bold"
                          aria-label={`Output for row ${i + 1}: ${cells[i] === null ? "not set" : cells[i]}. Press to change.`}
                          onClick={() => cycleCell(i)}
                        >
                          {cells[i] === null ? "–" : cells[i]}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className={`${ui.hint} text-center`}>
              TAP A BLOCK, THEN TAP A SLOT (OR DRAG IT) · TAP OUTPUT CELLS TO
              TOGGLE 0 / 1 · TAP A FILLED SLOT TO CLEAR IT
            </p>

            <button
              className={`${ui.button} ${ui.buttonGreen} mx-auto`}
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
        <div className={ui.overlay}>
          <div className={`${ui.modal} ${ui.modalCorrect}`}>
            <div className="text-3xl font-black">✔ CORRECT!</div>
            <div className="w-full border-4 border-black bg-[#6fd97f] p-2 font-black">
              {successLine(level.index)}
            </div>
            <p className="text-sm leading-relaxed">{challenge.explanation}</p>
            <button
              className={`${ui.button} ${ui.buttonGreen}`}
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
        <div className={ui.overlay}>
          <div className={`${ui.modal} ${ui.modalWrong}`}>
            <div className="text-3xl font-black">✘ NOT QUITE</div>
            <div className="w-full border-4 border-black bg-[#ff5f5f] p-2 font-black">
              {failureLine(level.index, tier.subject)}
            </div>
            <p className="text-sm leading-relaxed">{challenge.explanation}</p>
            {topicNames.length > 0 && (
              <p className={ui.hint}>
                TOPIC{topicNames.length > 1 ? "S" : ""} TO REVIEW: {topicNames.join(" · ")} —
                see <Link href="/progress" className="underline">MY PROGRESS</Link>
              </p>
            )}
            <div className="flex w-full gap-3">
              <button
                className={`${ui.button} flex-1`}
                onClick={() => {
                  setPhase("answering");
                  if (challenge.kind === "mc") setSelectedChoice(null);
                }}
              >
                TRY AGAIN
              </button>
              <button
                className={`${ui.button} flex-1 text-xs`}
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
        <div className={ui.overlay}>
          <div className={ui.modal}>
            <div className="text-3xl font-black">CONGRATS!</div>
            <div className="w-full border-4 border-black bg-[#ff5f5f] p-3 font-black">
              {result?.newlyCompleted
                ? `You have earned ${result.xpAwarded} XP!`
                : "REPLAY — no new XP awarded."}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <span className={ui.chip}>XP {xp}</span>
              <span className={`${ui.chip} ${ui.chipStreak}`}>
                +{result?.xpAwarded ?? 0} XP
              </span>
              <span className={ui.chip}>
                {"★".repeat(wrongCount === 0 ? 3 : wrongCount === 1 ? 2 : 1)}
              </span>
              <span className={`${ui.chip} ${ui.chipStreak}`}>STREAK {streak}</span>
            </div>
            {result && result.newBadges.length > 0 && (
              <div className="w-full border-4 border-black bg-[#6fd97f] p-2 text-sm font-black">
                NEW BADGE{result.newBadges.length > 1 ? "S" : ""}:{" "}
                {result.newBadges.map((id) => getBadge(id)?.name ?? id).join(", ")}
              </div>
            )}
            <button
              className={`${ui.button} ${ui.buttonPrimary}`}
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