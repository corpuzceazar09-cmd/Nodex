// Geometry + connectivity model for the solderless breadboard sandbox.
//
// A standard breadboard is modelled with columns 1..COLUMNS and rows A..J.
// Rows A-E above the centre trench are joined vertically per column, and rows
// F-J below the trench are joined per column. The two halves stay isolated.
// Four power rails (top +/-, bottom +/-) run the full width of the board.

export const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;
export type BoardRow = (typeof ROWS)[number];

export const TOP_ROWS: readonly BoardRow[] = ["A", "B", "C", "D", "E"];
export const BOTTOM_ROWS: readonly BoardRow[] = ["F", "G", "H", "I", "J"];

export const COLUMNS = 30;

export const RAILS = ["TP", "TN", "BP", "BN"] as const;
export type Rail = (typeof RAILS)[number];

/** Human readable rail marker shown at the board edges. */
export const RAIL_LABEL: Record<Rail, string> = {
  TP: "+",
  TN: "\u2013",
  BP: "+",
  BN: "\u2013",
};

export const RAIL_COLOR: Record<Rail, string> = {
  TP: "#c0392b",
  TN: "#1414d2",
  BP: "#c0392b",
  BN: "#1414d2",
};

const X0 = 70;
const COL_W = 24;

const ROW_Y: Record<string, number> = {
  TP: 26,
  TN: 48,
  A: 88,
  B: 110,
  C: 132,
  D: 154,
  E: 176,
  F: 220,
  G: 242,
  H: 264,
  I: 286,
  J: 308,
  BP: 354,
  BN: 376,
};

export const BOARD_WIDTH = X0 + (COLUMNS - 1) * COL_W + 70;
export const BOARD_HEIGHT = 412;
export const BOARD_MARGIN = 40;
export const CHIP_MAX_COLUMNS = 8;

export function holeX(col: number): number {
  return X0 + (col - 1) * COL_W;
}

export function holeY(row: string): number {
  return ROW_Y[row] ?? 0;
}

export function holeId(row: string, col: number): string {
  return `${row}${col}`;
}

export function splitHole(id: string): { row: string; col: number } | null {
  const match = /^([A-Z]+)(\d+)$/.exec(id);
  if (!match) return null;
  return { row: match[1], col: Number(match[2]) };
}

export function isValidHole(id: string): boolean {
  const parts = splitHole(id);
  if (!parts) return false;
  if (parts.col < 1 || parts.col > COLUMNS) return false;
  return (
    (ROWS as readonly string[]).includes(parts.row) ||
    (RAILS as readonly string[]).includes(parts.row)
  );
}

/**
 * Collapse a physical hole into the electrical group it belongs to before any
 * user wiring is considered. Wires then union these base groups together.
 */
export function baseNetOf(id: string): string | null {
  const parts = splitHole(id);
  if (!parts) return null;
  const { row, col } = parts;
  if (col < 1 || col > COLUMNS) return null;
  if ((RAILS as readonly string[]).includes(row)) return `rail:${row}`;
  if (!(ROWS as readonly string[]).includes(row)) return null;
  return TOP_ROWS.includes(row as BoardRow) ? `top:${col}` : `bottom:${col}`;
}

export function nearestColumn(x: number): number {
  const raw = Math.round((x - X0) / COL_W) + 1;
  return Math.max(1, Math.min(COLUMNS, raw));
}

/**
 * Snap a board-space point to the closest hole. Returns null when the pointer
 * is further than maxDist from every hole so wire drops can be cancelled.
 */
export function nearestHole(
  x: number,
  y: number,
  options: { rails?: boolean; maxDist?: number } = {},
): string | null {
  const maxDist = options.maxDist ?? 15;
  const rows: string[] =
    options.rails === false ? [...ROWS] : [...ROWS, ...RAILS];

  let bestRow = "";
  let bestDy = Infinity;
  for (const row of rows) {
    const dy = Math.abs(y - holeY(row));
    if (dy < bestDy) {
      bestDy = dy;
      bestRow = row;
    }
  }
  if (!bestRow) return null;

  const col = nearestColumn(x);
  const dx = x - holeX(col);
  const dy = y - holeY(bestRow);
  if (Math.hypot(dx, dy) > maxDist) return null;
  return holeId(bestRow, col);
}

/**
 * Position of an individual DIP pin once the chip is seated across the trench.
 * Pins 1..half sit in row F (bottom) moving right, the remaining pins sit in
 * row E (top) moving left, mirroring a real DIP socket.
 */
export function chipPinHole(
  startCol: number,
  packagePins: number,
  pin: number,
): string {
  const bottomCount = Math.ceil(packagePins / 2);
  if (pin <= bottomCount) {
    return holeId("F", startCol + pin - 1);
  }
  return holeId("E", startCol + (packagePins - pin));
}

/** Highest legal starting column for a chip of the given package size. */
export function maxChipStart(packagePins: number): number {
  const width = Math.ceil(packagePins / 2);
  return Math.max(1, COLUMNS - width + 1);
}

/** Tiny union-find used to merge copper groups joined by wires/resistors. */
export class DSU {
  private parent = new Map<string, string>();

  find(value: string): string {
    const parent = this.parent.get(value);
    if (parent === undefined) {
      this.parent.set(value, value);
      return value;
    }
    if (parent === value) return value;
    const root = this.find(parent);
    this.parent.set(value, root);
    return root;
  }

  union(a: string, b: string): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) this.parent.set(rootA, rootB);
  }
}
