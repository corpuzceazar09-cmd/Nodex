// Versioned localStorage persistence with a safe migration path.
// If an earlier save (from this app or the reference game) already exists, we
// merge it onto the defaults rather than discarding valid progress.

import type { TierId } from "./data/tiers";

export const SAVE_VERSION = 2;
export const STORAGE_KEY = "nodex_save_v2";
/** Keys used by earlier builds / the reference project. */
export const LEGACY_KEYS = [
  "logicians_save_v2",
  "logicians_save_v1",
  "logicable_game_save_v1",
];

export type CompletedMap = Record<TierId, string[]>;

export type SaveData = {
  version: number;
  name: string;
  xp: number;
  streak: number;
  selectedTier: TierId | null;
  completed: CompletedMap;
  /** levelId -> best star rating (1..3). */
  stars: Record<string, number>;
  badges: string[];
  /** Gate ids the player has opened in the Logic Gate Lab. */
  exploredGates: string[];
  soundMuted: boolean;
  musicMuted: boolean;
};

export const EMPTY_COMPLETED: CompletedMap = {
  newbie: [],
  intermediate: [],
  advanced: [],
  circuits: [],
};

/**
 * Fresh-install save. Keeps the original wireframe's demo seed so the first
 * paint matches the previous behaviour.
 */
export const DEFAULT_SAVE: SaveData = {
  version: SAVE_VERSION,
  name: "PLAYER 1",
  xp: 1250,
  streak: 5,
  selectedTier: null,
  completed: {
    newbie: ["newbie-01", "newbie-02"],
    intermediate: [],
    advanced: [],
    circuits: [],
  },
  stars: { "newbie-01": 3, "newbie-02": 2 },
  badges: ["first_spark", "and_specialist"],
  exploredGates: [],
  soundMuted: false,
  musicMuted: false,
};

function isTierId(value: unknown): value is TierId {
  return value === "newbie" || value === "intermediate" || value === "advanced";
}

function coerceCompleted(value: unknown): CompletedMap {
  const result: CompletedMap = {
    newbie: [],
    intermediate: [],
    advanced: [],
    circuits: [],
  };
  if (value && typeof value === "object") {
    for (const key of Object.keys(result) as TierId[]) {
      const list = (value as Record<string, unknown>)[key];
      if (Array.isArray(list)) {
        result[key] = list.filter((item): item is string => typeof item === "string");
      }
    }
  }
  return result;
}

function coerceStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/** Merge any partial/legacy record onto DEFAULT_SAVE, field by field. */
export function migrateSave(raw: unknown): SaveData {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SAVE };
  const data = raw as Record<string, unknown>;

  const selectedTier = isTierId(data.selectedTier) ? data.selectedTier : null;

  return {
    version: SAVE_VERSION,
    name: typeof data.name === "string" ? data.name : DEFAULT_SAVE.name,
    xp: typeof data.xp === "number" && Number.isFinite(data.xp) ? data.xp : DEFAULT_SAVE.xp,
    streak:
      typeof data.streak === "number" && Number.isFinite(data.streak)
        ? data.streak
        : DEFAULT_SAVE.streak,
    selectedTier,
    completed: coerceCompleted(data.completed),
    stars:
      data.stars && typeof data.stars === "object"
        ? Object.fromEntries(
            Object.entries(data.stars as Record<string, unknown>).filter(
              (entry): entry is [string, number] => typeof entry[1] === "number",
            ),
          )
        : {},
    badges: coerceStringArray(data.badges),
    exploredGates: coerceStringArray(data.exploredGates),
    soundMuted: Boolean(data.soundMuted),
    musicMuted: Boolean(data.musicMuted),
  };
}

export function loadSave(): SaveData | null {
  if (typeof window === "undefined") return null;
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current) return migrateSave(JSON.parse(current));

    for (const key of LEGACY_KEYS) {
      const legacy = window.localStorage.getItem(key);
      if (legacy) return migrateSave(JSON.parse(legacy));
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSave(data: SaveData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full / unavailable — keep running in memory
  }
}

export function clearSave(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    for (const key of LEGACY_KEYS) window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
