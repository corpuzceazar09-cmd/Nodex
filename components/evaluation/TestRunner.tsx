"use client";

import Link from "next/link";
import { useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import GateSymbol from "@/components/GateSymbol";
import CableEnds from "@/components/cabling/CableEnds";
import { useGame } from "@/components/GameProvider";
import {
  TEST_QUESTIONS,
  scoreTest,
  type TestKind,
  type TestResult,
} from "@/lib/data/assessment";
import { ui } from "@/lib/uiStyles";

const TITLE: Record<TestKind, string> = { pre: "PRE-TEST", post: "POST-TEST" };

/**
 * One question per screen, no right/wrong feedback until the end, so the test
 * measures what the player already knows rather than teaching it.
 */
export default function TestRunner({ kind }: { kind: TestKind }) {
  const { loaded, evaluation, saveTestResult } = useGame();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<TestResult | null>(null);

  const existing = kind === "pre" ? evaluation.preTest : evaluation.postTest;
  const pre = evaluation.preTest;

  if (!loaded) return null;

  const shown = result ?? existing;
  if (shown) {
    const gain = kind === "post" && pre ? shown.score - pre.score : null;
    return (
      <div className={ui.page}>
        <ScreenFrame title={`NODEX — ${TITLE[kind]} RESULT`}>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="text-4xl font-black">
              {shown.score} / {shown.total}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <span className={ui.chip}>
                LOGIC {shown.sectionScores.logic.score} / {shown.sectionScores.logic.total}
              </span>
              <span className={ui.chip}>
                CABLING {shown.sectionScores.cabling.score} / {shown.sectionScores.cabling.total}
              </span>
            </div>
            {gain !== null && pre && (
              <p className="max-w-md leading-relaxed">
                Pre-test: {pre.score} / {pre.total} → Post-test: {shown.score} / {shown.total}{" "}
                <b>({gain >= 0 ? "+" : ""}{gain})</b>
              </p>
            )}
            <p className={`${ui.hint} max-w-md`}>
              {kind === "pre"
                ? "Thanks! Now play the logic and cabling paths. Take the post-test when you've finished them."
                : "Thanks! Please answer the short survey to finish the evaluation."}
            </p>
            <p className={ui.hint}>Taken {new Date(shown.takenAt).toLocaleString()}</p>
          </div>
          <div className="mt-auto flex flex-wrap justify-center gap-3">
            <Link href="/evaluation" className={`${ui.button} ${ui.buttonPrimary}`}>
              BACK TO EVALUATION ▶
            </Link>
            <Link href="/menu" className={`${ui.button} text-xs`}>MAIN MENU</Link>
          </div>
        </ScreenFrame>
      </div>
    );
  }

  const q = TEST_QUESTIONS[index];
  const chosen = answers[q.id];
  const last = index === TEST_QUESTIONS.length - 1;

  function next() {
    if (!last) {
      setIndex((i) => i + 1);
      return;
    }
    const scored = scoreTest(answers);
    saveTestResult(kind, scored);
    setResult(scored);
  }

  return (
    <div className={ui.page}>
      <ScreenFrame title={`NODEX — ${TITLE[kind]}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={ui.chip}>
            QUESTION {index + 1} / {TEST_QUESTIONS.length}
          </span>
          <span className={ui.chip}>{q.section === "logic" ? "LOGIC GATES" : "NETWORK CABLING"}</span>
        </div>
        <div className={ui.progress} aria-label="test progress">
          <div className={ui.progressFill} style={{ width: `${(index / TEST_QUESTIONS.length) * 100}%` }} />
        </div>
        <div className="border-[3px] border-[#3b3452] bg-white p-4 text-center text-lg font-bold leading-relaxed">
          {q.prompt}
        </div>
        {q.visualGate && (
          <div className="flex justify-center border-[3px] border-[#3b3452] bg-white p-3">
            <GateSymbol gate={q.visualGate} className="h-24 w-44" />
          </div>
        )}
        {q.visualCable && <CableEnds mode={q.visualCable} />}
        <div className="grid gap-3 sm:grid-cols-2">
          {q.choices.map((c, i) => (
            <button
              key={c}
              type="button"
              className={`${ui.button} ${chosen === i ? ui.buttonPrimary : ""}`}
              aria-pressed={chosen === i}
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
            >
              {c}
            </button>
          ))}
        </div>
        <p className={`${ui.hint} text-center`}>
          Answer on your own — there&apos;s no feedback until the end. If you don&apos;t know, pick your best guess.
        </p>
        <div className="mt-auto flex flex-wrap justify-between gap-3">
          <button
            type="button"
            className={`${ui.button} text-xs`}
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
          >
            ◀ BACK
          </button>
          <button
            type="button"
            className={`${ui.button} ${ui.buttonPrimary}`}
            disabled={chosen === undefined}
            onClick={next}
          >
            {last ? "SUBMIT TEST ▶" : "NEXT ▶"}
          </button>
        </div>
      </ScreenFrame>
    </div>
  );
}
