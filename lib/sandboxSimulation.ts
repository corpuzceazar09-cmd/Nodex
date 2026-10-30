// Digital simulation for the breadboard sandbox.
//
// The simulator builds a netlist from the breadboard's internal hole groups,
// user wires and passive components. Chips only drive their outputs when their
// VCC pin sits on a HIGH net and their GND pin sits on a LOW net. Gate outputs
// then propagate around the board until the circuit settles.

import {
  CHIPS,
  type ChipDef,
  type ChipId,
  type ChipPin,
  type GateFunction,
} from "./data/chips";
import { DSU, baseNetOf, chipPinHole } from "./breadboard";

export type SandboxKind =
  | "chip"
  | "switch"
  | "high"
  | "low"
  | "led"
  | "resistor"
  | "power"
  | "ground"
  | "dip";

export type SandboxComponent = {
  id: string;
  kind: SandboxKind;
  label: string;
  chipId?: ChipId;
  /** Left-most column of a chip straddling the centre trench. */
  startCol?: number;
  /** Anchor hole for single-hole components. */
  hole?: string;
  /** Second hole for two-terminal passives such as resistors/LEDs. */
  hole2?: string;
  /** Switch position, 0 or 1. */
  state?: number;
  /** DIP switch positions: [switch1 (pins 1&4), switch2 (pins 2&3)]. */
  dipStates?: [number, number];
};

export type SandboxWire = {
  id: string;
  from: string;
  to: string;
};

export type SandboxState = {
  components: SandboxComponent[];
  wires: SandboxWire[];
};

export type PinReading = {
  pin: number;
  label: string;
  role: ChipPin["role"];
  value: number;
  net: string;
  connected: boolean;
};

export type ChipReading = {
  componentId: string;
  chipId: ChipId;
  powered: boolean;
  pins: Record<number, PinReading>;
};

export type SimResult = {
  netValues: Record<string, number>;
  chips: Record<string, ChipReading>;
  dips: Record<string, DipReading>;
  ledOn: Record<string, boolean>;
  componentNets: Record<string, string>;
};

export const MAX_INPUTS = 13;

// --- 4-pin / 2-position DIP switch -----------------------------------------
// A DIP switch is a PASSIVE component: it bridges two pin pairs when a
// position is ON and isolates them when OFF. It never drives HIGH or LOW by
// itself — students must wire it to a source or ground.
export const DIP_PACKAGE_PINS = 4;
/** Terminal pairs: switch 1 joins pins 1 & 4, switch 2 joins pins 2 & 3. */
export const DIP_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 4],
  [2, 3],
];

/** Breadboard hole for a DIP switch pin, reusing the DIP straddle geometry. */
export function dipPinHole(startCol: number, pin: number): string {
  return chipPinHole(startCol, DIP_PACKAGE_PINS, pin);
}

export type DipPinReading = {
  pin: number;
  label: string;
  role: "passive";
  switchIndex: 0 | 1;
  value: number;
  net: string;
  connected: boolean;
};

export type DipReading = {
  componentId: string;
  positions: [number, number];
  pins: Record<number, DipPinReading>;
};

/** Evaluate any supported gate over an arbitrary number of inputs. */
export function evalGate(type: GateFunction, values: number[]): number {
  switch (type) {
    case "AND":
      return values.every((value) => value === 1) ? 1 : 0;
    case "NAND":
      return values.every((value) => value === 1) ? 0 : 1;
    case "OR":
      return values.some((value) => value === 1) ? 1 : 0;
    case "NOR":
      return values.some((value) => value === 1) ? 0 : 1;
    case "XOR":
      return values.reduce((acc, value) => acc ^ (value === 1 ? 1 : 0), 0);
    case "XNOR":
      return values.reduce((acc, value) => acc ^ (value === 1 ? 1 : 0), 0)
        ? 0
        : 1;
    case "NOT":
      return values[0] === 1 ? 0 : 1;
    default:
      return 0;
  }
}

function sourceValue(component: SandboxComponent): number | null {
  if (component.kind === "switch") return component.state === 1 ? 1 : 0;
  if (component.kind === "high" || component.kind === "power") return 1;
  if (component.kind === "low" || component.kind === "ground") return 0;
  return null;
}

function pinsOf(
  component: SandboxComponent,
  def: ChipDef,
): Array<{ pin: number; hole: string }> {
  if (component.startCol === undefined) return [];
  return def.pins.map((pin) => ({
    pin: pin.pin,
    hole: chipPinHole(component.startCol as number, def.packagePins, pin.pin),
  }));
}

/** Run the full breadboard simulation and return net + pin readings. */
export function simulate(state: SandboxState): SimResult {
  const dsu = new DSU();

  // Register every base net that appears anywhere on the board.
  const baseNets = new Set<string>();
  const addBase = (hole?: string) => {
    if (!hole) return;
    const base = baseNetOf(hole);
    if (base) baseNets.add(base);
  };

  for (const component of state.components) {
    addBase(component.hole);
    addBase(component.hole2);
    if (component.kind === "chip" && component.chipId) {
      const def = CHIPS[component.chipId];
      for (const pin of pinsOf(component, def)) addBase(baseNetOf(pin.hole) ?? undefined);
    }
    if (component.kind === "dip" && component.startCol !== undefined) {
      for (let pin = 1; pin <= DIP_PACKAGE_PINS; pin += 1) {
        addBase(baseNetOf(dipPinHole(component.startCol, pin)) ?? undefined);
      }
    }
  }
  for (const wire of state.wires) {
    addBase(wire.from);
    addBase(wire.to);
  }
  baseNets.forEach((base) => dsu.find(base));

  // User wires merge hole groups; resistors act as passive links.
  for (const wire of state.wires) {
    const a = baseNetOf(wire.from);
    const b = baseNetOf(wire.to);
    if (a && b) dsu.union(a, b);
  }
  for (const component of state.components) {
    if (
      (component.kind === "resistor" || component.kind === "led") &&
      component.hole &&
      component.hole2
    ) {
      const a = baseNetOf(component.hole);
      const b = baseNetOf(component.hole2);
      if (a && b) dsu.union(a, b);
    }
  }

  // DIP switches bridge their terminal pairs only while that position is ON.
  for (const component of state.components) {
    if (component.kind !== "dip" || component.startCol === undefined) continue;
    const start = component.startCol;
    const positions = component.dipStates ?? [0, 0];
    DIP_PAIRS.forEach((pair, index) => {
      if (positions[index] !== 1) return;
      const a = baseNetOf(dipPinHole(start, pair[0]));
      const b = baseNetOf(dipPinHole(start, pair[1]));
      if (a && b) dsu.union(a, b);
    });
  }

  const rootOfHole = (hole?: string): string | null => {
    if (!hole) return null;
    const base = baseNetOf(hole);
    return base ? dsu.find(base) : null;
  };

  const netValues: Record<string, number> = {};
  const sourceRoots = new Set<string>();
  const highRoots = new Set<string>();
  const lowRoots = new Set<string>();

  for (const component of state.components) {
    const value = sourceValue(component);
    if (value === null) continue;
    const root = rootOfHole(component.hole);
    if (!root) continue;
    netValues[root] = value;
    sourceRoots.add(root);
    if (value === 1) highRoots.add(root);
    else lowRoots.add(root);
  }

  // Track how many terminals touch each net so a pin with no wiring can be
  // reported as floating rather than silently treated as a real 0.
  const attachments = new Map<string, number>();
  const touch = (root: string | null) => {
    if (!root) return;
    attachments.set(root, (attachments.get(root) ?? 0) + 1);
  };
  for (const component of state.components) {
    touch(rootOfHole(component.hole));
    touch(rootOfHole(component.hole2));
    if (component.kind === "chip" && component.chipId) {
      const def = CHIPS[component.chipId];
      for (const pin of pinsOf(component, def)) touch(rootOfHole(pin.hole));
    }
    if (component.kind === "dip" && component.startCol !== undefined) {
      for (let pin = 1; pin <= DIP_PACKAGE_PINS; pin += 1) {
        touch(rootOfHole(dipPinHole(component.startCol, pin)));
      }
    }
  }
  for (const wire of state.wires) {
    touch(rootOfHole(wire.from));
    touch(rootOfHole(wire.to));
  }

  // A chip is only powered when VCC is genuinely HIGH and GND is genuinely LOW.
  const powered: Record<string, boolean> = {};
  for (const component of state.components) {
    if (component.kind !== "chip" || !component.chipId) continue;
    const def = CHIPS[component.chipId];
    const vccRoot = rootOfHole(
      chipPinHole(component.startCol as number, def.packagePins, def.vcc),
    );
    const gndRoot = rootOfHole(
      chipPinHole(component.startCol as number, def.packagePins, def.gnd),
    );
    powered[component.id] =
      !!vccRoot &&
      !!gndRoot &&
      vccRoot !== gndRoot &&
      highRoots.has(vccRoot) &&
      lowRoots.has(gndRoot);
  }

  // Propagate gate outputs. Sources always win over gate drivers on a shared
  // net (this models a deliberate logic conflict without crashing).
  const maxIterations = state.components.length * 4 + 12;
  let changed = true;
  let iteration = 0;
  while (changed && iteration < maxIterations) {
    changed = false;
    iteration += 1;
    for (const component of state.components) {
      if (component.kind !== "chip" || !component.chipId) continue;
      if (!powered[component.id]) continue;
      const def = CHIPS[component.chipId];
      const start = component.startCol as number;
      for (const gate of def.gates) {
        const inputs = gate.inputs.map((pin) => {
          const root = rootOfHole(chipPinHole(start, def.packagePins, pin));
          return root ? netValues[root] ?? 0 : 0;
        });
        const output = evalGate(gate.type, inputs);
        const outRoot = rootOfHole(
          chipPinHole(start, def.packagePins, gate.output),
        );
        if (!outRoot || sourceRoots.has(outRoot)) continue;
        if (netValues[outRoot] !== output) {
          netValues[outRoot] = output;
          changed = true;
        }
      }
    }
  }

  const chips: Record<string, ChipReading> = {};
  for (const component of state.components) {
    if (component.kind !== "chip" || !component.chipId) continue;
    const def = CHIPS[component.chipId];
    const start = component.startCol as number;
    const pins: Record<number, PinReading> = {};
    for (const pin of def.pins) {
      const root = rootOfHole(chipPinHole(start, def.packagePins, pin.pin));
      pins[pin.pin] = {
        pin: pin.pin,
        label: pin.label,
        role: pin.role,
        value: root ? netValues[root] ?? 0 : 0,
        net: root ?? "",
        connected: !!(root && (attachments.get(root) ?? 0) > 1),
      };
    }
    chips[component.id] = {
      componentId: component.id,
      chipId: component.chipId,
      powered: powered[component.id] ?? false,
      pins,
    };
  }

  // DIP readings: each of the 4 pins is passive, belonging to one switch
  // position (pair 1 = pins 1&4, pair 2 = pins 2&3). Values come from the
  // net; the DIP itself never contributes a source.
  const dips: Record<string, DipReading> = {};
  for (const component of state.components) {
    if (component.kind !== "dip" || component.startCol === undefined) continue;
    const start = component.startCol;
    const positions: [number, number] = component.dipStates ?? [0, 0];
    const pins: Record<number, DipPinReading> = {};
    DIP_PAIRS.forEach((pair, index) => {
      pair.forEach((pinNum) => {
        const root = rootOfHole(dipPinHole(start, pinNum));
        pins[pinNum] = {
          pin: pinNum,
          label: `${index + 1}${pinNum === pair[0] ? "A" : "B"}`,
          role: "passive",
          switchIndex: index as 0 | 1,
          value: root ? netValues[root] ?? 0 : 0,
          net: root ?? "",
          connected: !!(root && (attachments.get(root) ?? 0) > 1),
        };
      });
    });
    dips[component.id] = { componentId: component.id, positions, pins };
  }

  const ledOn: Record<string, boolean> = {};
  const componentNets: Record<string, string> = {};
  for (const component of state.components) {
    const root = rootOfHole(component.hole);
    if (root) componentNets[component.id] = root;
    if (component.kind === "led") {
      ledOn[component.id] = !!(root && (netValues[root] ?? 0) === 1);
    }
  }

  return { netValues, chips, dips, ledOn, componentNets };
}
