// Static reference data for the eight logic gates — the seven basic gates from
// https://en.wikipedia.org/wiki/Logic_gate (NOT, OR, NOR, AND, NAND, XOR,
// XNOR) plus the BUFFER. Descriptions, Boolean expressions and truth tables
// follow that reference and are cross-checked by the live evaluator in
// lib/logic.ts. IC numbers follow the classic 74-series TTL pinout chart
// (7407/7404/7408/7432/7400/7402/7486/74266), all 14-pin DIP:
// Vcc = pin 14, Gnd = pin 7.

export type GateId =
  | "buffer"
  | "and"
  | "or"
  | "not"
  | "nand"
  | "nor"
  | "xor"
  | "xnor";

export type TruthRow = { inputs: number[]; out: number };

export type Gate = {
  id: GateId;
  name: string;
  /** Loose family grouping for the encyclopedia. */
  category: "Basic" | "Universal" | "Arithmetic";
  expression: string;
  description: string;
  /** Short plain-language rule of operation. */
  rule: string;
  /** Real-world analogy. */
  analogy: string;
  /** Study hint shown in the lab / challenges. */
  hint: string;
  ic: string;
  inputs: number;
  table: TruthRow[];
};

const two = (outs: [number, number, number, number]): TruthRow[] => [
  { inputs: [0, 0], out: outs[0] },
  { inputs: [0, 1], out: outs[1] },
  { inputs: [1, 0], out: outs[2] },
  { inputs: [1, 1], out: outs[3] },
];

export const GATES: Record<GateId, Gate> = {
  buffer: {
    id: "buffer",
    name: "BUFFER",
    category: "Basic",
    expression: "Y = A",
    description:
      "Buffer: the output simply follows the input, unchanged. In real hardware it re-drives a weak signal so it can travel further.",
    rule: "Whatever goes in comes straight back out.",
    analogy: "A clear glass window or a signal repeater on a long cable.",
    hint: "Whatever goes in comes straight out without alteration!",
    ic: "7407 — Hex buffers / line drivers",
    inputs: 1,
    table: [
      { inputs: [0], out: 0 },
      { inputs: [1], out: 1 },
    ],
  },
  and: {
    id: "and",
    name: "AND",
    category: "Basic",
    expression: "A · B",
    description: "Conjunction: output is 1 only when BOTH inputs are 1.",
    rule: "Both inputs must be 1 for the output to be 1.",
    analogy: "Two switches wired in series — current only flows when both close.",
    hint: "Think of two switches in a row: both must be ON.",
    ic: "7408 — Quad 2-input AND gates",
    inputs: 2,
    table: two([0, 0, 0, 1]),
  },
  or: {
    id: "or",
    name: "OR",
    category: "Basic",
    expression: "A + B",
    description: "Disjunction: output is 1 when AT LEAST ONE input is 1.",
    rule: "Any single 1 input makes the output 1.",
    analogy: "Two switches wired in parallel — either one closes the circuit.",
    hint: "Think of two switches side by side: either one is enough.",
    ic: "7432 — Quad 2-input OR gates",
    inputs: 2,
    table: two([0, 1, 1, 1]),
  },
  not: {
    id: "not",
    name: "NOT",
    category: "Basic",
    expression: "A̅",
    description: "Negation (inverter): output is always the OPPOSITE of the input.",
    rule: "Flip the bit — 0 becomes 1 and 1 becomes 0.",
    analogy: "A light controlled by a switch: when the switch is off, the light is on.",
    hint: "Invert the input — the output is always the other value.",
    ic: "7404 — Hex NOT gates (inverters)",
    inputs: 1,
    table: [
      { inputs: [0], out: 1 },
      { inputs: [1], out: 0 },
    ],
  },
  nand: {
    id: "nand",
    name: "NAND",
    category: "Universal",
    expression: "(A · B)̅",
    description:
      "Alternative denial (AND inverted): 0 only when BOTH inputs are 1.",
    rule: "The opposite of AND.",
    analogy: "A security door that locks only when both switches are active.",
    hint: "Just invert what AND would do.",
    ic: "7400 — Quad 2-input NAND gates",
    inputs: 2,
    table: two([1, 1, 1, 0]),
  },
  nor: {
    id: "nor",
    name: "NOR",
    category: "Universal",
    expression: "(A + B)̅",
    description: "Joint denial (OR inverted): 1 only when BOTH inputs are 0.",
    rule: "The opposite of OR.",
    analogy: "A warning lamp that lights only when nothing is switched on.",
    hint: "Just invert what OR would do.",
    ic: "7402 — Quad 2-input NOR gates",
    inputs: 2,
    table: two([1, 0, 0, 0]),
  },
  xor: {
    id: "xor",
    name: "XOR",
    category: "Arithmetic",
    expression: "A ⊕ B",
    description: "Exclusive OR: output is 1 only when the inputs are DIFFERENT.",
    rule: "1 when the inputs differ, 0 when they match.",
    analogy: "Two light switches at either end of a hall controlling one lamp.",
    hint: "Different inputs give 1; equal inputs give 0.",
    ic: "7486 — Quad 2-input XOR gates",
    inputs: 2,
    table: two([0, 1, 1, 0]),
  },
  xnor: {
    id: "xnor",
    name: "XNOR",
    category: "Arithmetic",
    expression: "(A ⊕ B)̅",
    description:
      "Biconditional (XOR inverted): 1 only when the inputs are the SAME.",
    rule: "1 when the inputs match, 0 when they differ.",
    analogy: "An equivalence checker that lights up when two values agree.",
    hint: "Same inputs give 1; different inputs give 0.",
    ic: "74266 — Quad 2-input XNOR gates",
    inputs: 2,
    table: two([1, 0, 0, 1]),
  },
};

export const GATE_ORDER: GateId[] = [
  "buffer",
  "and",
  "or",
  "not",
  "nand",
  "nor",
  "xor",
  "xnor",
];

export function isGateId(value: string): value is GateId {
  return (GATE_ORDER as string[]).includes(value);
}
