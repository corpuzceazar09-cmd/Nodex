// Shared RJ45 / UTP data for the free wiring lab and the cabling level path.

export type CableMode = "straight" | "crossover" | "rollover";
export type Wire = { name: string; color: string; striped: boolean };

/** The 8 wires in T568B order: index i is the wire on pin i + 1 of a T568B end. */
export const WIRES: Wire[] = [
  { name: "WHITE / ORANGE", color: "#ed891b", striped: true },
  { name: "ORANGE", color: "#ed891b", striped: false },
  { name: "WHITE / GREEN", color: "#39a94d", striped: true },
  { name: "BLUE", color: "#4375b8", striped: false },
  { name: "WHITE / BLUE", color: "#4375b8", striped: true },
  { name: "GREEN", color: "#39a94d", striped: false },
  { name: "WHITE / BROWN", color: "#74504b", striped: true },
  { name: "BROWN", color: "#74504b", striped: false },
];

/** Wire indices (into WIRES) for pins 1–8 of each standard. */
export const T568B = [0, 1, 2, 3, 4, 5, 6, 7];
export const T568A = [2, 5, 0, 3, 4, 1, 6, 7];

/** Left pin n (1-based) connects to right pin WIRE_MAPS[mode][n - 1]. */
export const WIRE_MAPS: Record<CableMode, number[]> = {
  straight: [1, 2, 3, 4, 5, 6, 7, 8],
  crossover: [3, 6, 1, 4, 5, 2, 7, 8],
  rollover: [8, 7, 6, 5, 4, 3, 2, 1],
};

export const MODE_LABELS: Record<CableMode, string> = {
  straight: "STRAIGHT-THROUGH (T568B TO T568B)",
  crossover: "CROSSOVER (T568B TO T568A)",
  rollover: "ROLLOVER (REVERSED)",
};

/** Wire order at the far end of each cable type (the near end is always T568B). */
export const FAR_END: Record<CableMode, number[]> = {
  straight: T568B,
  crossover: T568A,
  rollover: [...T568B].reverse(),
};
