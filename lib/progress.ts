// Separate Logic and Cabling levels, derived from which levels the player has
// cleared (each counted once), so replays and older saves can't skew them.

import { CIRCUITS } from "./data/circuits";
import { LEVELS } from "./data/levels";
import { TIERS, type TierId } from "./data/tiers";
import type { CompletedMap } from "./storage";

export type Subject = "logic" | "cabling";

/** XP needed per subject level. Cabling has fewer levels, so its steps are smaller. */
const XP_PER_LEVEL: Record<Subject, number> = { logic: 400, cabling: 150 };

const REWARD_BY_ID: Record<string, number> = Object.fromEntries([
  ...LEVELS.map((l) => [l.id, l.rewardXp] as const),
  ...CIRCUITS.map((c) => [c.id, c.rewardXp] as const),
]);

export type SubjectProgress = {
  xp: number;
  level: number;
  /** 0–100 toward the next subject level. */
  pct: number;
};

export function subjectProgress(completed: CompletedMap, subject: Subject): SubjectProgress {
  const xp = (Object.keys(completed) as TierId[])
    .filter((tier) => TIERS[tier]?.subject === subject)
    .flatMap((tier) => completed[tier])
    .reduce((sum, id) => sum + (REWARD_BY_ID[id] ?? 0), 0);
  const step = XP_PER_LEVEL[subject];
  return {
    xp,
    level: Math.floor(xp / step) + 1,
    pct: Math.round(((xp % step) / step) * 100),
  };
}
