// RPG progression: ranks and achievement badges. Ported from the reference
// game and shared by the player panel, reward flow and settings.

export type Rank = {
  name: string;
  min: number;
  max: number;
  icon: string;
};

export const RANKS: Rank[] = [
  { name: "Gate Initiate", min: 0, max: 300, icon: "⚡" },
  { name: "Binary Scout", min: 300, max: 800, icon: "🔌" },
  { name: "Circuit Apprentice", min: 800, max: 1600, icon: "💡" },
  { name: "Logic Hacker", min: 1600, max: 2800, icon: "🔬" },
  { name: "Digital Architect", min: 2800, max: 4500, icon: "🧠" },
  { name: "Grandmaster of Logic", min: 4500, max: Number.POSITIVE_INFINITY, icon: "👑" },
];

export type RankDetails = {
  current: Rank;
  nextRank: Rank | null;
  progressToNext: number;
  neededForNext: number;
};

export function getRankDetails(xp = 0): RankDetails {
  const current =
    RANKS.find((rank) => xp >= rank.min && xp < rank.max) ?? RANKS[RANKS.length - 1];
  const index = RANKS.indexOf(current);
  const nextRank = RANKS[index + 1] ?? null;

  if (!nextRank) {
    return { current, nextRank: null, progressToNext: 100, neededForNext: 0 };
  }

  const span = nextRank.min - current.min;
  const progressToNext =
    span <= 0 ? 100 : Math.min(100, Math.round(((xp - current.min) / span) * 100));
  return {
    current,
    nextRank,
    progressToNext,
    neededForNext: Math.max(0, nextRank.min - xp),
  };
}

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export const BADGES: Badge[] = [
  {
    id: "first_spark",
    name: "First Spark",
    description: "Completed your very first logic gate lesson.",
    icon: "⚡",
  },
  {
    id: "and_specialist",
    name: "Conjunction Cadet",
    description: "Finished a Newbie-tier level.",
    icon: "🔷",
  },
  {
    id: "truth_seeker",
    name: "Truth Seeker",
    description: "Explored all 8 gates in the Logic Gate Lab.",
    icon: "📜",
  },
  {
    id: "perfect_circuit",
    name: "Clean Signal",
    description: "Scored a perfect 3-star result on any level.",
    icon: "✨",
  },
  {
    id: "universal_builder",
    name: "Universal Gatekeeper",
    description: "Conquered a NAND or NOR universal logic level.",
    icon: "🌟",
  },
  {
    id: "circuit_architect",
    name: "Master Architect",
    description: "Constructed or solved a multi-stage combinational circuit.",
    icon: "🏆",
  },
];

export const BADGE_MAP: Record<string, Badge> = Object.fromEntries(
  BADGES.map((badge) => [badge.id, badge]),
);

export function getBadge(id: string): Badge | undefined {
  return BADGE_MAP[id];
}

/** Total stars earned across all recorded levels. */
export function getTotalStars(stars: Record<string, number> = {}): number {
  return Object.values(stars).reduce((sum, value) => sum + (value || 0), 0);
}
