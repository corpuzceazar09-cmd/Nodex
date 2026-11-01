"use client";

import Link from "next/link";
import { useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import { useGame } from "@/components/GameProvider";
import { downloadFile, evaluationCsv, exportBaseName } from "@/lib/evaluationExport";
import { ui } from "@/lib/uiStyles";

/**
 * Study hub: participant ID, pre-test → play → post-test → survey, and the
 * export researchers collect from each participant (paper: SOP 10–11).
 */
export default function EvaluationPage() {
  const { loaded, evaluation, snapshot, completed, setParticipantId } = useGame();
  const [draftId, setDraftId] = useState<string | null>(null);

  if (!loaded) return null;

  const { preTest, postTest, survey } = evaluation;
  const levelsCleared =
    completed.newbie.length + completed.intermediate.length + completed.advanced.length + completed.cabling.length;
  const idValue = draftId ?? evaluation.participantId;

  const steps = [
    {
      title: "1. PRE-TEST",
      body: "14 questions on logic gates and cabling, taken BEFORE playing. No feedback until the end.",
      done: !!preTest,
      status: preTest ? `DONE · ${preTest.score} / ${preTest.total}` : "NOT TAKEN",
      href: "/evaluation/pre-test",
      action: preTest ? "VIEW RESULT" : "START PRE-TEST",
    },
    {
      title: "2. PLAY NODEX",
      body: "Play the logic tiers and the Network Cabling path.",
      done: levelsCleared >= 10,
      status: `${levelsCleared} LEVELS CLEARED`,
      href: "/menu",
      action: "GO TO MENU",
    },
    {
      title: "3. POST-TEST",
      body: "The same 14 questions, taken AFTER playing, to measure what changed.",
      done: !!postTest,
      status: postTest
        ? `DONE · ${postTest.score} / ${postTest.total}${preTest ? ` (${postTest.score - preTest.score >= 0 ? "+" : ""}${postTest.score - preTest.score})` : ""}`
        : preTest
          ? "NOT TAKEN"
          : "TAKE THE PRE-TEST FIRST",
      href: "/evaluation/post-test",
      action: postTest ? "VIEW RESULT" : "START POST-TEST",
      locked: !preTest,
    },
    {
      title: "4. SURVEY",
      body: "17 statements on functionality, usability, accessibility, effectiveness, learning experience and usefulness.",
      done: !!survey,
      status: survey ? `DONE · ${survey.role.toUpperCase()}` : "NOT ANSWERED",
      href: "/evaluation/survey",
      action: survey ? "REVIEW ANSWERS" : "START SURVEY",
    },
  ];

  return (
    <div className={ui.page}>
      <ScreenFrame title="NODEX — EVALUATION">
        <p className={`${ui.hint} text-center`}>
          For the Nodex study. Your answers stay on this device until you export them and send
          the file to the researchers.
        </p>

        <label className="flex flex-wrap items-center justify-center gap-2 text-sm font-black">
          PARTICIPANT ID
          <input
            className="w-40 border-[3px] border-[#3b3452] bg-white px-2 py-1 font-normal"
            placeholder="e.g. S-07"
            maxLength={24}
            value={idValue}
            onChange={(e) => setDraftId(e.target.value)}
            onBlur={() => {
              if (draftId !== null) setParticipantId(draftId);
              setDraftId(null);
            }}
          />
          <span className={ui.hint}>(given by the researchers)</span>
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex flex-col gap-2 border-[3px] border-[#3b3452] bg-[#fdf9ef] p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-black">{step.title}</span>
                <span className={`${ui.chip} ${step.done ? "!bg-[#8fd86a]" : ""}`}>{step.status}</span>
              </div>
              <p className="text-xs leading-snug">{step.body}</p>
              {step.locked ? (
                <span className={`${ui.button} mt-auto self-start text-xs opacity-50`}>{step.action}</span>
              ) : (
                <Link href={step.href} className={`${ui.button} mt-auto self-start text-xs`}>
                  {step.action} ▶
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-[3px] border-[#3b3452] bg-[#fdf9ef] p-3">
          <span className="font-black">5. EXPORT RESULTS</span>
          <p className="text-xs leading-snug">
            The CSV has one row per participant: test scores (per question), survey ratings and
            averages, levels cleared and topic accuracy. Paste the rows from every participant
            under one header in a spreadsheet. The JSON file is a full backup of this save.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`${ui.button} ${ui.buttonPrimary} text-xs`}
              onClick={() =>
                downloadFile(`${exportBaseName(snapshot)}.csv`, evaluationCsv(snapshot), "text/csv;charset=utf-8")
              }
            >
              DOWNLOAD CSV
            </button>
            <button
              type="button"
              className={`${ui.button} text-xs`}
              onClick={() =>
                downloadFile(
                  `${exportBaseName(snapshot)}.json`,
                  JSON.stringify(snapshot, null, 2),
                  "application/json",
                )
              }
            >
              DOWNLOAD JSON BACKUP
            </button>
          </div>
        </div>

        <Link href="/menu" className={`${ui.button} mx-auto text-xs`}>
          ◀ MAIN MENU
        </Link>
      </ScreenFrame>
    </div>
  );
}
