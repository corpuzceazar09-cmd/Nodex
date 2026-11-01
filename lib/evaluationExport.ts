// Turns one participant's save into files the researchers can collect.
// CSV: a header plus ONE row, so rows from every participant's file can be
// pasted under one header in a spreadsheet. JSON: the full save, for backup.

import {
  SURVEY_ITEMS,
  TEST_QUESTIONS,
  type SurveyCriterion,
  type TestResult,
} from "./data/assessment";
import { TOPICS, topicAccuracy } from "./data/topics";
import { subjectProgress } from "./progress";
import type { SaveData } from "./storage";

type Cell = string | number | null | undefined;

function csvCell(value: Cell): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function testColumns(prefix: string, test: TestResult | null): [string, Cell][] {
  const cols: [string, Cell][] = [
    [`${prefix}_taken_at`, test?.takenAt],
    [`${prefix}_score`, test?.score],
    [`${prefix}_total`, test?.total],
    [`${prefix}_logic`, test?.sectionScores.logic.score],
    [`${prefix}_cabling`, test?.sectionScores.cabling.score],
  ];
  for (const q of TEST_QUESTIONS) {
    const answer = test?.answers[q.id];
    cols.push([`${prefix}_${q.id}`, test ? (answer === q.correct ? 1 : 0) : null]);
  }
  return cols;
}

function criterionMean(save: SaveData, criterion: SurveyCriterion): Cell {
  const ratings = save.evaluation.survey?.ratings;
  if (!ratings) return null;
  const values = SURVEY_ITEMS.filter((i) => i.criterion === criterion)
    .map((i) => ratings[i.id])
    .filter((v): v is number => typeof v === "number");
  if (!values.length) return null;
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
}

export function evaluationColumns(save: SaveData): [string, Cell][] {
  const { evaluation: ev } = save;
  const pre = ev.preTest;
  const post = ev.postTest;
  const criteria = [...new Set(SURVEY_ITEMS.map((i) => i.criterion))];
  return [
    ["participant_id", ev.participantId],
    ["player_name", save.profile?.name ?? save.name],
    ["role", ev.survey?.role],
    ["exported_at", new Date().toISOString()],
    ["total_xp", save.xp],
    ["logic_level", subjectProgress(save.completed, "logic").level],
    ["cabling_level", subjectProgress(save.completed, "cabling").level],
    ["logic_levels_cleared", save.completed.newbie.length + save.completed.intermediate.length + save.completed.advanced.length],
    ["cabling_levels_cleared", save.completed.cabling.length],
    ["circuit_challenges_cleared", save.completed.circuits.length],
    ["total_stars", Object.values(save.stars).reduce((a, b) => a + b, 0)],
    ["badges", save.badges.length],
    ...testColumns("pre", pre),
    ...testColumns("post", post),
    ["score_gain", pre && post ? post.score - pre.score : null],
    ["survey_submitted_at", ev.survey?.submittedAt],
    ...SURVEY_ITEMS.map((i): [string, Cell] => [`survey_${i.id}`, ev.survey?.ratings[i.id]]),
    ...criteria.map((c): [string, Cell] => [`survey_mean_${c}`, criterionMean(save, c)]),
    ["survey_comments", ev.survey?.comments],
    ...TOPICS.flatMap((t): [string, Cell][] => {
      const stat = save.topicStats[t.id];
      return [
        [`topic_${t.id}_accuracy`, topicAccuracy(stat)],
        [`topic_${t.id}_right`, stat?.right ?? 0],
        [`topic_${t.id}_wrong`, stat?.wrong ?? 0],
      ];
    }),
  ];
}

export function evaluationCsv(save: SaveData): string {
  const cols = evaluationColumns(save);
  const header = cols.map(([name]) => name).join(",");
  const row = cols.map(([, value]) => csvCell(value)).join(",");
  return `${header}\r\n${row}\r\n`;
}

export function downloadFile(filename: string, contents: string, type: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportBaseName(save: SaveData): string {
  const who = (save.evaluation.participantId || save.profile?.name || "player")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .toLowerCase();
  return `nodex-${who}-${new Date().toISOString().slice(0, 10)}`;
}
