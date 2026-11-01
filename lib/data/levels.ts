// 40 levels: 10 per logic tier plus the 10-level cabling path (9 regular + 1
// final each). Every challenge carries its correct answer; checking is plain
// equality against it.

import type { CableMode } from "./cabling";
import type { GateId } from "./gates";
import type { TierId } from "./tiers";

export type BlockKind =
  | "input"
  | "output"
  | "buffer"
  | GateId;

export type McChallenge = {
  kind: "mc";
  prompt: string;
  visualGate?: GateId;
  /** Shows both ends of a cable wired as this type (cabling questions). */
  visualCable?: CableMode;
  choices: string[];
  correct: number;
  explanation: string;
};

export type BuildChallenge = {
  kind: "build";
  prompt: string;
  palette: BlockKind[];
  slots: number;
  correctSlots: BlockKind[];
  /** Input columns given to the player, one entry per truth-table row. */
  table: number[][];
  /** Canned output for each row — compared by equality, never evaluated. */
  correctTable: number[];
  explanation: string;
};

/** Put the 8 UTP wires in the right pin order for a wiring standard. */
export type OrderChallenge = {
  kind: "order";
  prompt: string;
  /** Wire indices (into WIRES) for pins 1–8. */
  correctOrder: number[];
  explanation: string;
};

/** Wire an RJ45 cable end-to-end on the drag-and-drop board. */
export type WireChallenge = {
  kind: "wire";
  prompt: string;
  mode: CableMode;
  explanation: string;
};

export type Challenge = McChallenge | BuildChallenge | OrderChallenge | WireChallenge;

export type Level = {
  id: string;
  tierId: TierId;
  index: number;
  isFinal: boolean;
  title: string;
  rewardXp: number;
  challenge: Challenge;
};

const NEWBIE_PALETTE: BlockKind[] = ["input", "output", "and", "or", "not"];
const INTER_PALETTE: BlockKind[] = [
  "input",
  "output",
  "and",
  "or",
  "not",
  "nand",
  "nor",
  "xor",
];
const ADV_PALETTE: BlockKind[] = [
  "input",
  "output",
  "and",
  "or",
  "not",
  "nand",
  "nor",
  "xor",
  "xnor",
];

const TWO_INPUT_ROWS = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

const newbie: Challenge[] = [
  {
    kind: "mc",
    prompt: "WHICH GATE IS THIS?",
    visualGate: "and",
    choices: ["AND", "OR", "NOT"],
    correct: 0,
    explanation:
      "The AND gate has a flat back and a round nose. Output is 1 only when both inputs are 1.",
  },
  {
    kind: "mc",
    prompt: "Which gate outputs 1 ONLY when BOTH inputs are 1?",
    choices: ["OR", "AND", "NOT"],
    correct: 1,
    explanation: "That's the AND gate — both inputs must be 1 for a 1 output.",
  },
  {
    kind: "mc",
    prompt: "Which gate has only ONE input?",
    choices: ["AND", "NOT", "OR"],
    correct: 1,
    explanation: "The NOT gate takes a single input and flips it.",
  },
  {
    kind: "mc",
    prompt: "An OR gate has inputs A = 0, B = 1. What is the output?",
    choices: ["0", "1", "Cannot tell"],
    correct: 1,
    explanation: "OR outputs 1 when at least one input is 1. Here B is 1.",
  },
  {
    kind: "mc",
    prompt: "A NOT gate receives 1. What does it output?",
    choices: ["1", "0"],
    correct: 1,
    explanation: "NOT inverts its input, so 1 becomes 0.",
  },
  {
    kind: "mc",
    prompt:
      "A door only unlocks when BOTH guards press their button. Which gate is this?",
    choices: ["AND", "OR", "XOR"],
    correct: 0,
    explanation: "Both conditions must be true at once — that's an AND gate.",
  },
  {
    kind: "build",
    prompt:
      "SET UP THIS CIRCUIT: the output must be 1 only when both inputs are 1.",
    palette: NEWBIE_PALETTE,
    slots: 3,
    correctSlots: ["input", "and", "output"],
    table: TWO_INPUT_ROWS,
    correctTable: [0, 0, 0, 1],
    explanation: "The AND gate outputs 1 only for inputs 1,1 — table rows 0,0,0,1.",
  },
  {
    kind: "build",
    prompt:
      "SET UP THIS CIRCUIT: the output must be 1 when at least one input is 1.",
    palette: NEWBIE_PALETTE,
    slots: 3,
    correctSlots: ["input", "or", "output"],
    table: TWO_INPUT_ROWS,
    correctTable: [0, 1, 1, 1],
    explanation: "The OR gate outputs 1 whenever any input is 1.",
  },
  {
    kind: "mc",
    prompt: "An AND gate has inputs A = 1, B = 1. What is the output?",
    choices: ["0", "1"],
    correct: 1,
    explanation: "Both inputs are 1, so the AND gate outputs 1.",
  },
  {
    kind: "mc",
    prompt: "FINAL CHALLENGE: A NOT gate receives input 1. What is the output?",
    visualGate: "not",
    choices: ["0", "1"],
    correct: 0,
    explanation:
      "NOT flips 1 to 0. You've completed the Newbie tier — great start!",
  },
];

const intermediate: Challenge[] = [
  {
    kind: "mc",
    prompt: "A NAND gate has inputs A = 1, B = 1. What is the output?",
    choices: ["0", "1"],
    correct: 0,
    explanation: "NAND is AND inverted — only 1,1 gives a 0 output.",
  },
  {
    kind: "mc",
    prompt: "A NOR gate has inputs A = 0, B = 0. What is the output?",
    choices: ["0", "1"],
    correct: 1,
    explanation: "NOR is OR inverted — only 0,0 gives a 1 output.",
  },
  {
    kind: "mc",
    prompt: "An XOR gate has inputs A = 1, B = 0. What is the output?",
    choices: ["0", "1"],
    correct: 1,
    explanation: "XOR outputs 1 when the inputs are different.",
  },
  {
    kind: "mc",
    prompt: "Which gate outputs 0 ONLY when both inputs are 1?",
    choices: ["AND", "NAND", "NOT"],
    correct: 1,
    explanation: "NAND — AND flipped — is 0 only for inputs 1,1.",
  },
  {
    kind: "build",
    prompt: "SET UP THIS CIRCUIT: build a NAND gate connection.",
    palette: INTER_PALETTE,
    slots: 3,
    correctSlots: ["input", "nand", "output"],
    table: TWO_INPUT_ROWS,
    correctTable: [1, 1, 1, 0],
    explanation: "NAND outputs 1 everywhere except inputs 1,1.",
  },
  {
    kind: "build",
    prompt: "SET UP THIS CIRCUIT: build an XOR gate connection.",
    palette: INTER_PALETTE,
    slots: 3,
    correctSlots: ["input", "xor", "output"],
    table: TWO_INPUT_ROWS,
    correctTable: [0, 1, 1, 0],
    explanation: "XOR outputs 1 when inputs differ: rows 01 and 10.",
  },
  {
    kind: "mc",
    prompt: "Complete the truth table: NOR gate with A = 1, B = 1 → ?",
    choices: ["0", "1"],
    correct: 0,
    explanation: "OR gives 1 for 1,1; NOR inverts it to 0.",
  },
  {
    kind: "mc",
    prompt: "In an XOR truth table, when is the output 1?",
    choices: [
      "When the inputs are the same",
      "When the inputs are different",
      "Never",
    ],
    correct: 1,
    explanation: "XOR means 'exclusive OR' — exactly one input must be 1.",
  },
  {
    kind: "build",
    prompt: "SET UP THIS CIRCUIT: build a NOR gate connection.",
    palette: INTER_PALETTE,
    slots: 3,
    correctSlots: ["input", "nor", "output"],
    table: TWO_INPUT_ROWS,
    correctTable: [1, 0, 0, 0],
    explanation: "NOR outputs 1 only when both inputs are 0.",
  },
  {
    kind: "build",
    prompt:
      "FINAL CHALLENGE: set up an XOR circuit and complete its truth table.",
    palette: INTER_PALETTE,
    slots: 3,
    correctSlots: ["input", "xor", "output"],
    table: TWO_INPUT_ROWS,
    correctTable: [0, 1, 1, 0],
    explanation:
      "XOR: 1 when inputs differ. You've mastered output-finding — Intermediate done!",
  },
];

const advanced: Challenge[] = [
  {
    kind: "mc",
    prompt: "An XNOR gate has inputs A = 1, B = 1. What is the output?",
    choices: ["0", "1"],
    correct: 1,
    explanation: "XNOR outputs 1 when the inputs are the SAME.",
  },
  {
    kind: "mc",
    prompt: "Which gate is the INVERSE of XOR?",
    choices: ["XNOR", "NAND", "OR"],
    correct: 0,
    explanation: "XNOR is XOR with the output flipped.",
  },
  {
    kind: "mc",
    prompt: "Simplify: NOT (NOT A) = ?",
    choices: ["A", "0", "1"],
    correct: 0,
    explanation: "Two inversions cancel out — you're back to A.",
  },
  {
    kind: "mc",
    prompt: "De Morgan's law: NOT(A AND B) equals…",
    choices: [
      "(NOT A) OR (NOT B)",
      "(NOT A) AND (NOT B)",
      "A OR B",
    ],
    correct: 0,
    explanation:
      "De Morgan: flipping an AND turns it into an OR of the flipped inputs.",
  },
  {
    kind: "build",
    prompt: "SET UP THIS CIRCUIT: build an XNOR gate connection.",
    palette: ADV_PALETTE,
    slots: 3,
    correctSlots: ["input", "xnor", "output"],
    table: TWO_INPUT_ROWS,
    correctTable: [1, 0, 0, 1],
    explanation: "XNOR outputs 1 for 0,0 and 1,1 — the inputs match.",
  },
  {
    kind: "mc",
    prompt: "The Boolean expression (A · B)̅ describes which gate?",
    choices: ["NAND", "NOR", "XOR"],
    correct: 0,
    explanation: "AND, then inverted — that's NAND.",
  },
  {
    kind: "mc",
    prompt: "A ⊕ B equals 0 when…",
    choices: ["the inputs are equal", "the inputs differ", "A is 1"],
    correct: 0,
    explanation: "XOR is 0 when both inputs match (0,0 or 1,1).",
  },
  {
    kind: "build",
    prompt:
      "SET UP THIS CIRCUIT: NOT on the first input, then an AND — output is 1 only when A = 0 and B = 1.",
    palette: ADV_PALETTE,
    slots: 4,
    correctSlots: ["input", "not", "and", "output"],
    table: TWO_INPUT_ROWS,
    correctTable: [0, 1, 0, 0],
    explanation:
      "NOT A gives 1 only when A = 0; AND with B = 1 gives the single 1 row.",
  },
  {
    kind: "build",
    prompt: "SET UP THIS CIRCUIT: two inverters in a row (NOT → NOT).",
    palette: ADV_PALETTE,
    slots: 4,
    correctSlots: ["input", "not", "not", "output"],
    table: [[0], [1]],
    correctTable: [0, 1],
    explanation:
      "Two NOTs cancel: 0 → 1 → 0 and 1 → 0 → 1. The signal passes unchanged.",
  },
  {
    kind: "mc",
    prompt: "FINAL CHALLENGE: which expression is equivalent to XNOR?",
    choices: ["(A ⊕ B)̅", "A ⊕ B", "(A · B)̅"],
    correct: 0,
    explanation:
      "XNOR is XOR inverted — (A ⊕ B)̅. You've beaten the Advanced tier!",
  },
];

// Network cabling path (paper scope: RJ45 connectors, straight-through and
// crossover cables, modular connectors, wire order and choosing the right cable).
const cabling: Challenge[] = [
  {
    kind: "mc",
    prompt: "Which connector is crimped onto the ends of an Ethernet (UTP) cable?",
    choices: ["RJ45", "USB-C", "HDMI"],
    correct: 0,
    explanation:
      "RJ45 is the 8-pin modular plug used on Ethernet cables. USB-C and HDMI carry data and video, not Ethernet.",
  },
  {
    kind: "mc",
    prompt: "How many wires are inside a Cat5e / Cat6 UTP cable?",
    choices: ["4", "8", "12"],
    correct: 1,
    explanation:
      "8 wires, twisted into 4 pairs (orange, green, blue, brown) — one wire for each RJ45 pin.",
  },
  {
    kind: "order",
    prompt: "Put the wires in T568B order, pin 1 to pin 8.",
    correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
    explanation:
      "T568B: white-orange, orange, white-green, blue, white-blue, green, white-brown, brown.",
  },
  {
    kind: "mc",
    prompt: "Compare both ends of this cable. What type of cable is it?",
    visualCable: "straight",
    choices: ["Straight-through", "Crossover"],
    correct: 0,
    explanation:
      "Same standard on both ends (T568B to T568B), so every pin goes straight to the same pin: straight-through.",
  },
  {
    kind: "wire",
    prompt: "Wire a STRAIGHT-THROUGH cable: T568B on both ends.",
    mode: "straight",
    explanation: "In a straight-through cable, pin 1 goes to pin 1, pin 2 to pin 2, and so on.",
  },
  {
    kind: "mc",
    prompt: "Compare both ends of this cable. What type of cable is it now?",
    visualCable: "crossover",
    choices: ["Straight-through", "Crossover"],
    correct: 1,
    explanation:
      "The orange and green pairs swap places between the ends (pins 1↔3 and 2↔6), so it's a crossover cable.",
  },
  {
    kind: "mc",
    prompt: "Which cable connects a PC to a network switch?",
    choices: ["Straight-through", "Crossover"],
    correct: 0,
    explanation:
      "PC and switch are DIFFERENT kinds of device, so a straight-through cable is used.",
  },
  {
    kind: "mc",
    prompt:
      "The socket in a wall plate or patch panel that an RJ45 plug clicks into is called a…",
    choices: ["Modular jack", "Crimping tool", "Cable tester"],
    correct: 0,
    explanation:
      "A modular (keystone) jack is the female RJ45 socket. The crimper and tester are tools, not connectors.",
  },
  {
    kind: "mc",
    prompt: "Two PCs are connected directly, with no switch in between. Which cable is needed?",
    choices: ["Straight-through", "Crossover"],
    correct: 1,
    explanation:
      "PC to PC is the SAME kind of device, so the transmit and receive pairs must cross: crossover.",
  },
  {
    kind: "wire",
    prompt: "FINAL CHALLENGE: wire a CROSSOVER cable — T568B on the left, T568A on the right.",
    mode: "crossover",
    explanation:
      "Pins 1↔3 and 2↔6 swap; pins 4, 5, 7 and 8 go straight. You've completed the Cabling path!",
  },
];

function build(tierId: TierId, challenges: Challenge[]): Level[] {
  return challenges.map((challenge, index) => ({
    id: `${tierId}-${String(index + 1).padStart(2, "0")}`,
    tierId,
    index,
    isFinal: index === challenges.length - 1,
    title: `${tierId.toUpperCase()} ${String(index + 1).padStart(2, "0")}`,
    rewardXp: index === challenges.length - 1 ? 150 : 50,
    challenge,
  }));
}

export const LEVELS: Level[] = [
  ...build("newbie", newbie),
  ...build("intermediate", intermediate),
  ...build("advanced", advanced),
  ...build("cabling", cabling),
];

export function getLevel(levelId: string): Level | undefined {
  return LEVELS.find((l) => l.id === levelId);
}

export function levelsForTier(tierId: TierId): Level[] {
  return LEVELS.filter((l) => l.tierId === tierId);
}