// Pin-accurate 74-series DIP logic chips used by the breadboard sandbox.
//
// Each definition lists the physical package, its VCC/GND pins, every pin's
// role and label, and the internal gate groups. The simulator only evaluates a
// chip once VCC is tied HIGH and GND is tied LOW on the breadboard.

export type ChipId =
  | "7408"
  | "7432"
  | "7400"
  | "7402"
  | "7486"
  | "74266"
  | "74133"
  | "7404";

export type GateFunction =
  | "AND"
  | "OR"
  | "NAND"
  | "NOR"
  | "XOR"
  | "XNOR"
  | "NOT";

export type ChipPinRole = "power" | "ground" | "input" | "output";

export type ChipPin = {
  pin: number;
  role: ChipPinRole;
  label: string;
  /** Zero-based gate group this pin belongs to, when applicable. */
  gate?: number;
};

export type ChipGate = {
  index: number;
  type: GateFunction;
  inputs: number[];
  output: number;
  label: string;
};

export type ChipDef = {
  id: ChipId;
  name: string;
  short: string;
  packagePins: number;
  vcc: number;
  gnd: number;
  description: string;
  pins: ChipPin[];
  gates: ChipGate[];
};

function quadPins(): ChipPin[] {
  return [
    { pin: 1, role: "input", label: "1A", gate: 0 },
    { pin: 2, role: "input", label: "1B", gate: 0 },
    { pin: 3, role: "output", label: "1Y", gate: 0 },
    { pin: 4, role: "input", label: "2A", gate: 1 },
    { pin: 5, role: "input", label: "2B", gate: 1 },
    { pin: 6, role: "output", label: "2Y", gate: 1 },
    { pin: 7, role: "ground", label: "GND" },
    { pin: 8, role: "output", label: "3Y", gate: 2 },
    { pin: 9, role: "input", label: "3A", gate: 2 },
    { pin: 10, role: "input", label: "3B", gate: 2 },
    { pin: 11, role: "output", label: "4Y", gate: 3 },
    { pin: 12, role: "input", label: "4A", gate: 3 },
    { pin: 13, role: "input", label: "4B", gate: 3 },
    { pin: 14, role: "power", label: "VCC" },
  ];
}

function quadGates(type: GateFunction): ChipGate[] {
  return [
    { index: 0, type, inputs: [1, 2], output: 3, label: "GATE 1" },
    { index: 1, type, inputs: [4, 5], output: 6, label: "GATE 2" },
    { index: 2, type, inputs: [9, 10], output: 8, label: "GATE 3" },
    { index: 3, type, inputs: [12, 13], output: 11, label: "GATE 4" },
  ];
}

function quadChip(
  id: ChipId,
  type: GateFunction,
  name: string,
  description: string,
): ChipDef {
  return {
    id,
    name,
    short: "QUAD 2-IN",
    packagePins: 14,
    vcc: 14,
    gnd: 7,
    description,
    pins: quadPins(),
    gates: quadGates(type),
  };
}

const NOR_PINS: ChipPin[] = [
  { pin: 1, role: "output", label: "1Y", gate: 0 },
  { pin: 2, role: "input", label: "1A", gate: 0 },
  { pin: 3, role: "input", label: "1B", gate: 0 },
  { pin: 4, role: "output", label: "2Y", gate: 1 },
  { pin: 5, role: "input", label: "2A", gate: 1 },
  { pin: 6, role: "input", label: "2B", gate: 1 },
  { pin: 7, role: "ground", label: "GND" },
  { pin: 8, role: "input", label: "3A", gate: 2 },
  { pin: 9, role: "input", label: "3B", gate: 2 },
  { pin: 10, role: "output", label: "3Y", gate: 2 },
  { pin: 11, role: "input", label: "4A", gate: 3 },
  { pin: 12, role: "input", label: "4B", gate: 3 },
  { pin: 13, role: "output", label: "4Y", gate: 3 },
  { pin: 14, role: "power", label: "VCC" },
];

const NOR_GATES: ChipGate[] = [
  { index: 0, type: "NOR", inputs: [2, 3], output: 1, label: "GATE 1" },
  { index: 1, type: "NOR", inputs: [5, 6], output: 4, label: "GATE 2" },
  { index: 2, type: "NOR", inputs: [8, 9], output: 10, label: "GATE 3" },
  { index: 3, type: "NOR", inputs: [11, 12], output: 13, label: "GATE 4" },
];

const HEX_INVERTER_PINS: ChipPin[] = [
  { pin: 1, role: "input", label: "1A", gate: 0 },
  { pin: 2, role: "output", label: "1Y", gate: 0 },
  { pin: 3, role: "input", label: "2A", gate: 1 },
  { pin: 4, role: "output", label: "2Y", gate: 1 },
  { pin: 5, role: "input", label: "3A", gate: 2 },
  { pin: 6, role: "output", label: "3Y", gate: 2 },
  { pin: 7, role: "ground", label: "GND" },
  { pin: 8, role: "output", label: "4Y", gate: 3 },
  { pin: 9, role: "input", label: "4A", gate: 3 },
  { pin: 10, role: "output", label: "5Y", gate: 4 },
  { pin: 11, role: "input", label: "5A", gate: 4 },
  { pin: 12, role: "output", label: "6Y", gate: 5 },
  { pin: 13, role: "input", label: "6A", gate: 5 },
  { pin: 14, role: "power", label: "VCC" },
];

const HEX_INVERTER_GATES: ChipGate[] = [
  { index: 0, type: "NOT", inputs: [1], output: 2, label: "INV 1" },
  { index: 1, type: "NOT", inputs: [3], output: 4, label: "INV 2" },
  { index: 2, type: "NOT", inputs: [5], output: 6, label: "INV 3" },
  { index: 3, type: "NOT", inputs: [9], output: 8, label: "INV 4" },
  { index: 4, type: "NOT", inputs: [11], output: 10, label: "INV 5" },
  { index: 5, type: "NOT", inputs: [13], output: 12, label: "INV 6" },
];

const NAND13_INPUTS = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14];

const NAND13_PINS: ChipPin[] = [
  ...NAND13_INPUTS.map((pin, index) => ({
    pin,
    role: "input" as const,
    label: String.fromCharCode(65 + index),
    gate: 0,
  })),
  { pin: 8, role: "ground", label: "GND" },
  { pin: 15, role: "output", label: "Y", gate: 0 },
  { pin: 16, role: "power", label: "VCC" },
];

export const CHIPS: Record<ChipId, ChipDef> = {
  "7408": quadChip(
    "7408",
    "AND",
    "Quad 2-input AND",
    "Four independent AND gates. Output is HIGH only when both inputs are HIGH.",
  ),
  "7432": quadChip(
    "7432",
    "OR",
    "Quad 2-input OR",
    "Four independent OR gates. Output is HIGH when either input is HIGH.",
  ),
  "7400": quadChip(
    "7400",
    "NAND",
    "Quad 2-input NAND",
    "Four universal NAND gates. Output is LOW only when both inputs are HIGH.",
  ),
  "7486": quadChip(
    "7486",
    "XOR",
    "Quad 2-input XOR",
    "Four exclusive-OR gates. Output is HIGH when the inputs differ.",
  ),
  "74266": quadChip(
    "74266",
    "XNOR",
    "Quad 2-input XNOR",
    "Four exclusive-NOR gates. Output is HIGH when the inputs match.",
  ),
  "7402": {
    id: "7402",
    name: "Quad 2-input NOR",
    short: "QUAD 2-IN",
    packagePins: 14,
    vcc: 14,
    gnd: 7,
    description:
      "Four independent NOR gates with the classic 7402 pin arrangement (outputs on pins 1, 4, 10 and 13).",
    pins: NOR_PINS,
    gates: NOR_GATES,
  },
  "7404": {
    id: "7404",
    name: "Hex inverter (NOT)",
    short: "HEX INV",
    packagePins: 14,
    vcc: 14,
    gnd: 7,
    description:
      "Six independent NOT gates. Each output is the inverse of its input.",
    pins: HEX_INVERTER_PINS,
    gates: HEX_INVERTER_GATES,
  },
  "74133": {
    id: "74133",
    name: "13-input NAND",
    short: "13-IN NAND",
    packagePins: 16,
    vcc: 16,
    gnd: 8,
    description:
      "A single wide NAND gate. The output goes LOW only when all thirteen inputs are HIGH.",
    pins: NAND13_PINS,
    gates: [
      {
        index: 0,
        type: "NAND",
        inputs: NAND13_INPUTS,
        output: 15,
        label: "13-IN NAND",
      },
    ],
  },
};

export const CHIP_ORDER: ChipId[] = [
  "7408",
  "7432",
  "7400",
  "7402",
  "7486",
  "74266",
  "74133",
  "7404",
];

export function isChipId(value: string | null | undefined): value is ChipId {
  return !!value && value in CHIPS;
}
