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
/** Standalone keys the bedroom used before its state moved into the save. */
const LEGACY_BEDROOM_KEYS = {
  profile: "nodex_player_profile",
  tutorialDone: "nodex_tutorial_completed",
};

export type CompletedMap = Record<TierId, string[]>;

export type PlayerProfile = { name: string; gender: "boy" | "girl" };

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
  /** Character picked in the bedroom intro; null until the guide has met the player. */
  profile: PlayerProfile | null;
  /** True once the player has finished PROF. LOGIC's intro on the computer. */
  onboarded: boolean;
};

export const EMPTY_COMPLETED: CompletedMap = {
  newbie: [],
  intermediate: [],
  advanced: [],
  circuits: [],
};

/** Fresh-install save: a brand-new player with no progress. */
export const DEFAULT_SAVE: SaveData = {
  version: SAVE_VERSION,
  name: "PLAYER 1",
  xp: 0,
  streak: 0,
  selectedTier: null,
  completed: { ...EMPTY_COMPLETED },
  stars: {},
  badges: [],
  exploredGates: [],
  soundMuted: false,
  musicMuted: false,
  profile: null,
  onboarded: false,
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

export function coerceProfile(value: unknown): PlayerProfile | null {
  if (!value || typeof value !== "object") return null;
  const { name, gender } = value as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim()) return null;
  return { name: name.trim().slice(0, 16), gender: gender === "girl" ? "girl" : "boy" };
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
    profile: coerceProfile(data.profile),
    // Saves from before this field existed belong to players who already went
    // through the intro, so they count as onboarded.
    onboarded: typeof data.onboarded === "boolean" ? data.onboarded : true,
  };
}

/**
 * Fold the bedroom's old standalone profile key into the save. The old keys
 * are only deleted by saveSave, once the merged save is safely written.
 */
function absorbLegacyBedroomKeys(save: SaveData | null): SaveData | null {
  const rawProfile = window.localStorage.getItem(LEGACY_BEDROOM_KEYS.profile);
  if (rawProfile === null) return save;

  let profile: PlayerProfile | null = null;
  try {
    profile = coerceProfile(JSON.parse(rawProfile));
  } catch {
    // unreadable profile: nothing to keep
  }

  if (!profile) return save;
  const base = save ?? { ...DEFAULT_SAVE, onboarded: true };
  if (base.profile) return base;
  return { ...base, profile, name: profile.name };
}

export function loadSave(): SaveData | null {
  if (typeof window === "undefined") return null;
  try {
    let loaded: SaveData | null = null;
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current) {
      loaded = migrateSave(JSON.parse(current));
    } else {
      for (const key of LEGACY_KEYS) {
        const legacy = window.localStorage.getItem(key);
        if (legacy) {
          loaded = migrateSave(JSON.parse(legacy));
          break;
        }
      }
    }
    return absorbLegacyBedroomKeys(loaded);
  } catch {
    return null;
  }
}

export function saveSave(data: SaveData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    for (const key of Object.values(LEGACY_BEDROOM_KEYS)) window.localStorage.removeItem(key);
  } catch {
    // storage full / unavailable — keep running in memory
  }
}

export function clearSave(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    for (const key of LEGACY_KEYS) window.localStorage.removeItem(key);
    for (const key of Object.values(LEGACY_BEDROOM_KEYS)) window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
