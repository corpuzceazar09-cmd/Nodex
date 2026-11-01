"use client";

import Link from "next/link";
import { useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import { useGame } from "@/components/GameProvider";
import {
  CRITERION_LABEL,
  LIKERT,
  SURVEY_ITEMS,
  type SurveyCriterion,
  type SurveyResponse,
} from "@/lib/data/assessment";
import { ui } from "@/lib/uiStyles";

const CRITERIA = [...new Set(SURVEY_ITEMS.map((i) => i.criterion))] as SurveyCriterion[];

export default function SurveyPage() {
  const { loaded, evaluation } = useGame();
  // Mount the form only once the save is loaded, so a saved response pre-fills it.
  if (!loaded) return null;
  return <SurveyForm initial={evaluation.survey} />;
}

function SurveyForm({ initial }: { initial: SurveyResponse | null }) {
  const { saveSurvey } = useGame();
  const [role, setRole] = useState<SurveyResponse["role"]>(initial?.role ?? "student");
  const [ratings, setRatings] = useState<Record<string, number>>(initial?.ratings ?? {});
  const [comments, setComments] = useState(initial?.comments ?? "");
  const [submitted, setSubmitted] = useState(false);

  const answered = SURVEY_ITEMS.filter((i) => ratings[i.id] !== undefined).length;
  const complete = answered === SURVEY_ITEMS.length;

  function submit() {
    saveSurvey({
      submittedAt: new Date().toISOString(),
      role,
      ratings,
      comments: comments.trim().slice(0, 1000),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={ui.page}>
        <ScreenFrame title="NODEX — SURVEY">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="text-3xl font-black">THANK YOU!</div>
            <p className="max-w-md leading-relaxed">
              Your answers are saved. You can change them any time from the Evaluation screen.
            </p>
          </div>
          <div className="mt-auto flex flex-wrap justify-center gap-3">
            <Link href="/evaluation" className={`${ui.button} ${ui.buttonPrimary}`}>
              BACK TO EVALUATION ▶
            </Link>
          </div>
        </ScreenFrame>
      </div>
    );
  }

  return (
    <div className={ui.page}>
      <ScreenFrame title="NODEX — SURVEY">
        <p className={`${ui.hint} text-center`}>
          Rate each statement from 1 (strongly disagree) to 5 (strongly agree). There are no
          right or wrong answers.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm font-black">I AM A:</span>
          {(["student", "teacher"] as const).map((r) => (
            <button
              key={r}
              type="button"
              className={`${ui.button} text-xs ${role === r ? ui.buttonPrimary : ""}`}
              aria-pressed={role === r}
              onClick={() => setRole(r)}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        {CRITERIA.map((criterion) => (
          <section key={criterion} className="flex flex-col gap-2">
            <h2 className="text-sm font-black tracking-widest">{CRITERION_LABEL[criterion]}</h2>
            {SURVEY_ITEMS.filter((i) => i.criterion === criterion).map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 border-[3px] border-[#3b3452] bg-[#fdf9ef] p-2"
              >
                <span className="text-sm">
                  <b>{item.id}.</b> {item.text}
                </span>
                <div role="radiogroup" aria-label={item.text} className="flex flex-wrap gap-1">
                  {[...LIKERT].reverse().map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={ratings[item.id] === option.value}
                      title={option.label}
                      className={`${ui.button} !px-2 !py-1 text-[10px] ${
                        ratings[item.id] === option.value ? ui.buttonPrimary : ""
                      }`}
                      onClick={() => setRatings((prev) => ({ ...prev, [item.id]: option.value }))}
                    >
                      {option.value} · {option.label.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        <label className="flex flex-col gap-1 text-sm font-black">
          COMMENTS OR SUGGESTIONS (OPTIONAL)
          <textarea
            className="min-h-24 border-[3px] border-[#3b3452] bg-white p-2 font-normal"
            maxLength={1000}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/evaluation" className={`${ui.button} text-xs`}>
            ◀ BACK
          </Link>
          <span className={ui.hint}>
            {answered} / {SURVEY_ITEMS.length} ANSWERED
          </span>
          <button
            type="button"
            className={`${ui.button} ${ui.buttonPrimary}`}
            disabled={!complete}
            onClick={submit}
          >
            SUBMIT SURVEY ▶
          </button>
        </div>
      </ScreenFrame>
    </div>
  );
}
