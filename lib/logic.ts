// Boolean logic engine. Ported and typed from the reference game engine so the
// simulator evaluates real circuits instead of comparing against canned answers.

export type CircuitNodeType = "switch" | "gate" | "led";
export type CircuitPin = "input-0" | "input-1";

export type CircuitNode = {
  id: string;
  type: CircuitNodeType;
  label?: string;
  /** Switch position (0/1). Ignored for gates and LEDs. */
  state?: number;
  /** Gate function name, e.g. "AND", "NAND", "XOR" (case-insensitive). */
  gateType?: string;
  x: number;
  y: number;
};

export type CircuitConnection = {
  from: string;
  to: string;
  pin?: CircuitPin;
};

export type CircuitStates = Record<string, number>;

type GateFn = (a: number, b: number) => number;

/** Gates that take a single input. */
const ONE_INPUT = new Set(["BUFFER", "NOT"]);

const GATE_LOGIC: Record<string, GateFn> = {
  BUFFER: (a) => (a === 1 ? 1 : 0),
  NOT: (a) => (a === 1 ? 0 : 1),
  AND: (a, b) => (a === 1 && b === 1 ? 1 : 0),
  OR: (a, b) => (a === 1 || b === 1 ? 1 : 0),
  NAND: (a, b) => (a === 1 && b === 1 ? 0 : 1),
  NOR: (a, b) => (a === 1 || b === 1 ? 0 : 1),
  XOR: (a, b) => (a !== b ? 1 : 0),
  XNOR: (a, b) => (a === b ? 1 : 0),
};

export function normalizeGateType(type: string | undefined): string {
  return (type ?? "").toUpperCase();
}

/** Evaluate a single gate against its inputs (mirrors reference semantics). */
export function evaluateGate(type: string, inputs: number[] = []): number {
  const key = normalizeGateType(type);
  const fn = GATE_LOGIC[key];
  if (!fn) return 0;
  if (ONE_INPUT.has(key)) return fn(inputs[0] ?? 0, 0);
  return fn(inputs[0] ?? 0, inputs[1] ?? 0);
}

/**
 * Iteratively propagate signals through a circuit until every node settles.
 * Switches seed the state; gates gather their inputs by pin; LEDs read their
 * single incoming signal.
 */
export function evaluateCircuit(
  nodes: CircuitNode[] = [],
  connections: CircuitConnection[] = [],
): CircuitStates {
  const states: CircuitStates = {};

  nodes.forEach((node) => {
    if (node.type === "switch") states[node.id] = Number(node.state || 0);
  });

  const maxIterations = nodes.length + 2;
  for (let iter = 0; iter < maxIterations; iter += 1) {
    let changed = false;

    nodes.forEach((node) => {
      if (node.type === "gate") {
        const incoming = connections.filter((c) => c.to === node.id);
        const pin0 = incoming.find((c) => c.pin === "input-0" || !c.pin);
        const pin1 = incoming.find((c) => c.pin === "input-1");
        const inputs = [
          pin0 && states[pin0.from] !== undefined ? states[pin0.from] : 0,
          pin1 && states[pin1.from] !== undefined ? states[pin1.from] : 0,
        ];
        const result = evaluateGate(node.gateType ?? "", inputs);
        if (states[node.id] !== result) {
          states[node.id] = result;
          changed = true;
        }
      } else if (node.type === "led") {
        const incoming = connections.find((c) => c.to === node.id);
        const result =
          incoming && states[incoming.from] !== undefined
            ? states[incoming.from]
            : 0;
        if (states[node.id] !== result) {
          states[node.id] = result;
          changed = true;
        }
      }
    });

    if (!changed) break;
  }

  return states;
}

export type LiveTruthRow = { a: number; b?: number; y: number };

/** Build the truth table for a gate by actually evaluating it. */
export function generateTruthTable(type: string): LiveTruthRow[] {
  const key = normalizeGateType(type);
  if (ONE_INPUT.has(key)) {
    return [
      { a: 0, y: evaluateGate(key, [0]) },
      { a: 1, y: evaluateGate(key, [1]) },
    ];
  }
  const rows: LiveTruthRow[] = [];
  for (const a of [0, 1]) {
    for (const b of [0, 1]) {
      rows.push({ a, b, y: evaluateGate(key, [a, b]) });
    }
  }
  return rows;
}
