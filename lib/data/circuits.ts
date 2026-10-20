import type { CircuitConnection, CircuitNode } from "@/lib/logic";

export type CircuitChallenge = {
  id: string;
  title: string;
  concept: string;
  description: string;
  rewardXp: number;
  task: string;
  targetLedId: string;
  hint: string;
  explanation: string;
  nodes: CircuitNode[];
  connections: CircuitConnection[];
};

function sw(id: string, label: string, x: number, y: number, state: number): CircuitNode {
  return { id, type: "switch", label, state, x, y };
}
function gate(id: string, gateType: string, x: number, y: number): CircuitNode {
  return { id, type: "gate", label: gateType.toUpperCase(), gateType: gateType.toUpperCase(), x, y };
}
function led(id: string, label: string, x: number, y: number): CircuitNode {
  return { id, type: "led", label, x, y };
}
function wire(from: string, to: string, pin?: "input-0" | "input-1"): CircuitConnection {
  return { from, to, pin };
}

export const CIRCUITS: CircuitChallenge[] = [
  {
    id: "circuits-01",
    title: "HALF ADDER",
    concept: "XOR + AND",
    description:
      "A half adder produces a SUM (XOR) and a CARRY (AND) from two bits.",
    rewardXp: 120,
    task: "Switches: A = 1, B = 0. What does the SUM LED show?",
    targetLedId: "led-sum",
    hint: "XOR outputs 1 only when its two inputs are different.",
    explanation:
      "With A=1 and B=0 the inputs differ, so XOR (SUM) = 1 while the AND (CARRY) stays 0.",
    nodes: [
      sw("sw-a", "INPUT A", 20, 40, 1),
      sw("sw-b", "INPUT B", 20, 170, 0),
      gate("g-xor", "xor", 250, 50),
      gate("g-and", "and", 250, 200),
      led("led-sum", "SUM", 540, 60),
      led("led-carry", "CARRY", 540, 210),
    ],
    connections: [
      wire("sw-a", "g-xor", "input-0"),
      wire("sw-b", "g-xor", "input-1"),
      wire("sw-a", "g-and", "input-0"),
      wire("sw-b", "g-and", "input-1"),
      wire("g-xor", "led-sum"),
      wire("g-and", "led-carry"),
    ],
  },
  {
    id: "circuits-02",
    title: "2:1 MULTIPLEXER",
    concept: "NOT + AND + OR",
    description:
      "A multiplexer selects one of two data inputs based on a SELECT line: Y = D0·S̄ + D1·S.",
    rewardXp: 140,
    task: "Switches: D0 = 1, SELECT = 0, D1 = 0. What does the OUT LED show?",
    targetLedId: "led-out",
    hint: "SELECT = 0 routes D0 to the output.",
    explanation:
      "With SELECT = 0 the NOT gate enables the upper AND branch (D0 = 1), so the OR output is 1.",
    nodes: [
      sw("sw-d0", "DATA 0", 20, 20, 1),
      sw("sw-s", "SELECT", 20, 130, 0),
      sw("sw-d1", "DATA 1", 20, 240, 0),
      gate("g-not", "not", 240, 130),
      gate("g-and0", "and", 240, 20),
      gate("g-and1", "and", 240, 240),
      gate("g-or", "or", 460, 120),
      led("led-out", "OUT", 660, 130),
    ],
    connections: [
      wire("sw-s", "g-not"),
      wire("sw-d0", "g-and0", "input-0"),
      wire("g-not", "g-and0", "input-1"),
      wire("sw-d1", "g-and1", "input-0"),
      wire("sw-s", "g-and1", "input-1"),
      wire("g-and0", "g-or", "input-0"),
      wire("g-and1", "g-or", "input-1"),
      wire("g-or", "led-out"),
    ],
  },
  {
    id: "circuits-03",
    title: "MAJORITY VOTE",
    concept: "AB + C(A+B)",
    description:
      "The output is 1 when a majority (at least two) of the three inputs is 1.",
    rewardXp: 160,
    task: "All three switches are 1 (A = B = C = 1). What does the LED show?",
    targetLedId: "led-out",
    hint: "Two or more 1s means the majority is reached.",
    explanation:
      "Every branch is satisfied, so the final OR outputs 1 — the majority is 3 of 3.",
    nodes: [
      sw("sw-a", "INPUT A", 20, 40, 1),
      sw("sw-b", "INPUT B", 20, 150, 1),
      sw("sw-c", "INPUT C", 20, 260, 1),
      gate("g-and1", "and", 200, 20),
      gate("g-or1", "or", 200, 150),
      gate("g-and2", "and", 410, 160),
      gate("g-or2", "or", 410, 20),
      led("led-out", "OUT", 640, 40),
    ],
    connections: [
      wire("sw-a", "g-and1", "input-0"),
      wire("sw-b", "g-and1", "input-1"),
      wire("sw-a", "g-or1", "input-0"),
      wire("sw-b", "g-or1", "input-1"),
      wire("sw-c", "g-and2", "input-0"),
      wire("g-or1", "g-and2", "input-1"),
      wire("g-and1", "g-or2", "input-0"),
      wire("g-and2", "g-or2", "input-1"),
      wire("g-or2", "led-out"),
    ],
  },
  {
    id: "circuits-04",
    title: "PARITY CHECKER",
    concept: "XOR cascade",
    description:
      "Chaining XOR gates checks parity: the output is 1 when an odd number of inputs is 1.",
    rewardXp: 160,
    task: "A = 1, B = 1, C = 1. What does the LED show?",
    targetLedId: "led-out",
    hint: "Three 1s is an odd count.",
    explanation:
      "A⊕B = 0, then 0⊕C = 1. An odd number of inputs are high, so parity is 1.",
    nodes: [
      sw("sw-a", "INPUT A", 20, 40, 1),
      sw("sw-b", "INPUT B", 20, 150, 1),
      sw("sw-c", "INPUT C", 20, 260, 1),
      gate("g-x1", "xor", 210, 80),
      gate("g-x2", "xor", 430, 180),
      led("led-out", "PARITY", 640, 200),
    ],
    connections: [
      wire("sw-a", "g-x1", "input-0"),
      wire("sw-b", "g-x1", "input-1"),
      wire("g-x1", "g-x2", "input-0"),
      wire("sw-c", "g-x2", "input-1"),
      wire("g-x2", "led-out"),
    ],
  },
  {
    id: "circuits-05",
    title: "SIGNAL MASK (ACTIVE-LOW)",
    concept: "NOT + AND",
    description:
      "An active-low enable passes the signal only while the enable line is 0.",
    rewardXp: 120,
    task: "ENABLE = 0 and SIGNAL = 1. What does the OUT LED show?",
    targetLedId: "led-out",
    hint: "The NOT gate flips the active-low enable into a passing 1.",
    explanation:
      "ENABLE=0 is inverted to 1, and 1 AND 1 = 1, so the signal passes through.",
    nodes: [
      sw("sw-en", "ENABLE", 20, 60, 0),
      sw("sw-sig", "SIGNAL", 20, 190, 1),
      gate("g-not", "not", 220, 60),
      gate("g-and", "and", 440, 130),
      led("led-out", "OUT", 650, 150),
    ],
    connections: [
      wire("sw-en", "g-not"),
      wire("g-not", "g-and", "input-0"),
      wire("sw-sig", "g-and", "input-1"),
      wire("g-and", "led-out"),
    ],
  },
  {
    id: "circuits-06",
    title: "NAND AS INVERTER",
    concept: "NAND (tied inputs)",
    description:
      "Tying a NAND gate's two inputs together turns it into a NOT gate — a trick used in real chips.",
    rewardXp: 140,
    task: "INPUT A = 1. What does the OUT LED show?",
    targetLedId: "led-out",
    hint: "NAND outputs 0 only when BOTH inputs are 1.",
    explanation:
      "Both NAND inputs are 1, so NAND = 0 — the same as NOT 1. This is why NAND is universal.",
    nodes: [
      sw("sw-a", "INPUT A", 20, 100, 1),
      gate("g-nand", "nand", 300, 100),
      led("led-out", "OUT", 560, 120),
    ],
    connections: [
      wire("sw-a", "g-nand", "input-0"),
      wire("sw-a", "g-nand", "input-1"),
      wire("g-nand", "led-out"),
    ],
  },
  {
    id: "circuits-07",
    title: "DIGITAL CORE MATRIX",
    concept: "AND + XOR + NOR",
    description:
      "A compact combinational block implementing Y = ¬((A·B) + (C⊕D)).",
    rewardXp: 220,
    task: "A = 1, B = 1, C = 0, D = 1. What does the OUT LED show?",
    targetLedId: "led-out",
    hint: "AND = 1 and XOR = 1, so the NOR sees two 1s.",
    explanation:
      "A·B = 1 and C⊕D = 1, so their OR is 1 and the final NOR inverts it to 0.",
    nodes: [
      sw("sw-a", "INPUT A", 20, 20, 1),
      sw("sw-b", "INPUT B", 20, 110, 1),
      sw("sw-c", "INPUT C", 20, 210, 0),
      sw("sw-d", "INPUT D", 20, 300, 1),
      gate("g-and", "and", 210, 20),
      gate("g-xor", "xor", 210, 210),
      gate("g-nor", "nor", 440, 110),
      led("led-out", "OUT", 650, 130),
    ],
    connections: [
      wire("sw-a", "g-and", "input-0"),
      wire("sw-b", "g-and", "input-1"),
      wire("sw-c", "g-xor", "input-0"),
      wire("sw-d", "g-xor", "input-1"),
      wire("g-and", "g-nor", "input-0"),
      wire("g-xor", "g-nor", "input-1"),
      wire("g-nor", "led-out"),
    ],
  },
];

export function getCircuit(id: string) {
  return CIRCUITS.find((c) => c.id === id);
}
