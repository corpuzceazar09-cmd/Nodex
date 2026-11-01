// Evaluation instruments for the study (paper: SOP 10–11).
// - The same 14-question test is given before playing (pre-test) and after
//   (post-test); the score difference measures effectiveness.
// - The survey rates Nodex on the paper's five criteria plus usefulness as a
//   supplementary tool, on a 5-point Likert scale.

import type { CableMode } from "./cabling";
import type { GateId } from "./gates";

export type TestSection = "logic" | "cabling";

export type TestQuestion = {
  id: string;
  section: TestSection;
  /** Topic id from lib/data/topics.ts, for item analysis in the export. */
  topic: string;
  prompt: string;
  visualGate?: GateId;
  visualCable?: CableMode;
  choices: string[];
  correct: number;
};

export const TEST_QUESTIONS: TestQuestion[] = [
  // logic gates: identify, outputs, truth tables
  { id: "q01", section: "logic", topic: "identify", prompt: "Which gate is this?", visualGate: "or", choices: ["AND", "OR", "XOR", "NOR"], correct: 1 },
  { id: "q02", section: "logic", topic: "identify", prompt: "Which gate is this?", visualGate: "nand", choices: ["AND", "NOT", "NAND", "NOR"], correct: 2 },
  { id: "q03", section: "logic", topic: "identify", prompt: "Which gate outputs 1 only when its two inputs are DIFFERENT?", choices: ["XNOR", "OR", "AND", "XOR"], correct: 3 },
  { id: "q04", section: "logic", topic: "outputs", prompt: "An AND gate has inputs A = 1, B = 0. What is the output?", choices: ["0", "1"], correct: 0 },
  { id: "q05", section: "logic", topic: "outputs", prompt: "A NOR gate has inputs A = 0, B = 0. What is the output?", choices: ["0", "1"], correct: 1 },
  { id: "q06", section: "logic", topic: "outputs", prompt: "An XNOR gate has inputs A = 1, B = 1. What is the output?", choices: ["0", "1"], correct: 1 },
  { id: "q07", section: "logic", topic: "truth-tables", prompt: "In the truth table of a 2-input OR gate, how many rows have an output of 1?", choices: ["1", "2", "3", "4"], correct: 2 },
  { id: "q08", section: "logic", topic: "truth-tables", prompt: "For inputs 00, 01, 10, 11 a gate outputs 1, 1, 1, 0. Which gate is it?", choices: ["AND", "NAND", "NOR", "XOR"], correct: 1 },
  // network cabling: connectors, wire order, cable types, choosing a cable
  { id: "q09", section: "cabling", topic: "rj45", prompt: "Which connector is used on the ends of an Ethernet UTP cable?", choices: ["BNC", "RJ45", "USB-A", "HDMI"], correct: 1 },
  { id: "q10", section: "cabling", topic: "wire-order", prompt: "In the T568B standard, which wire goes on pin 1?", choices: ["White / green", "Orange", "White / orange", "Blue"], correct: 2 },
  { id: "q11", section: "cabling", topic: "crossover", prompt: "Compare both ends of this cable. What type of cable is it?", visualCable: "crossover", choices: ["Straight-through", "Crossover"], correct: 1 },
  { id: "q12", section: "cabling", topic: "cable-selection", prompt: "Which cable connects a switch to a router?", choices: ["Straight-through", "Crossover"], correct: 0 },
  { id: "q13", section: "cabling", topic: "cable-selection", prompt: "Which cable directly connects two switches (older switches without auto-MDIX)?", choices: ["Straight-through", "Crossover"], correct: 1 },
  { id: "q14", section: "cabling", topic: "modular-jack", prompt: "What is a modular jack?", choices: ["A tool that presses pins onto wires", "The female RJ45 socket in a wall plate or patch panel", "A device that tests cable continuity", "The plastic jacket around a UTP cable"], correct: 1 },
];

export type SurveyCriterion =
  | "functionality"
  | "usability"
  | "accessibility"
  | "effectiveness"
  | "learning"
  | "usefulness";

export const CRITERION_LABEL: Record<SurveyCriterion, string> = {
  functionality: "FUNCTIONALITY",
  usability: "USABILITY",
  accessibility: "ACCESSIBILITY",
  effectiveness: "EFFECTIVENESS",
  learning: "LEARNING EXPERIENCE",
  usefulness: "USEFULNESS AS A SUPPLEMENTARY TOOL",
};

export type SurveyItem = { id: string; criterion: SurveyCriterion; text: string };

export const SURVEY_ITEMS: SurveyItem[] = [
  { id: "F1", criterion: "functionality", text: "The activities worked without errors." },
  { id: "F2", criterion: "functionality", text: "My answers were checked correctly and feedback appeared right away." },
  { id: "F3", criterion: "functionality", text: "My progress (XP, levels, stars, badges) was saved correctly." },
  { id: "U1", criterion: "usability", text: "It was easy to learn how to play." },
  { id: "U2", criterion: "usability", text: "Menus and buttons were easy to find and use." },
  { id: "U3", criterion: "usability", text: "The instructions were clear." },
  { id: "A1", criterion: "accessibility", text: "The text was easy to read." },
  { id: "A2", criterion: "accessibility", text: "Colours, symbols and wires were easy to tell apart." },
  { id: "A3", criterion: "accessibility", text: "I could play on my device without problems." },
  { id: "E1", criterion: "effectiveness", text: "Nodex helped me identify logic gates and determine their outputs." },
  { id: "E2", criterion: "effectiveness", text: "Nodex helped me understand and complete truth tables." },
  { id: "E3", criterion: "effectiveness", text: "Nodex helped me identify cable types, connectors and wiring arrangements." },
  { id: "L1", criterion: "learning", text: "I enjoyed learning with Nodex." },
  { id: "L2", criterion: "learning", text: "The levels, scores and rewards made me want to keep practicing." },
  { id: "L3", criterion: "learning", text: "The feedback showed me which topics I need to review." },
  { id: "S1", criterion: "usefulness", text: "Nodex is useful as a supplement to classroom lessons and lab activities." },
  { id: "S2", criterion: "usefulness", text: "I would use (or recommend) Nodex to review these topics outside class." },
];

/** 5-point Likert scale; the stored value is the number. */
export const LIKERT = [
  { value: 5, label: "Strongly agree" },
  { value: 4, label: "Agree" },
  { value: 3, label: "Neutral" },
  { value: 2, label: "Disagree" },
  { value: 1, label: "Strongly disagree" },
];

export type TestKind = "pre" | "post";

export type TestResult = {
  takenAt: string;
  /** Chosen choice index per question id. */
  answers: Record<string, number>;
  score: number;
  total: number;
  sectionScores: Record<TestSection, { score: number; total: number }>;
};

export type SurveyResponse = {
  submittedAt: string;
  role: "student" | "teacher";
  /** Likert value per survey item id. */
  ratings: Record<string, number>;
  comments: string;
};

export function scoreTest(answers: Record<string, number>): TestResult {
  const sectionScores: TestResult["sectionScores"] = {
    logic: { score: 0, total: 0 },
    cabling: { score: 0, total: 0 },
  };
  let score = 0;
  for (const q of TEST_QUESTIONS) {
    const right = answers[q.id] === q.correct;
    sectionScores[q.section].total += 1;
    if (right) {
      sectionScores[q.section].score += 1;
      score += 1;
    }
  }
  return {
    takenAt: new Date().toISOString(),
    answers,
    score,
    total: TEST_QUESTIONS.length,
    sectionScores,
  };
}
