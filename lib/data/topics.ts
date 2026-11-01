// Learning topics every level is tagged with, so the game can track accuracy
// per topic and tell the player what to review (paper: feedback should "help
// them identify which topics they need to review").

export type TopicGroup = "gates" | "skills" | "cabling";

export type Topic = {
  id: string;
  name: string;
  group: TopicGroup;
  /** Where to study the topic before practising it again. */
  studyHref: string;
  studyLabel: string;
};

export const TOPICS: Topic[] = [
  // the seven basic gates (plus BUFFER, the tutorial gate)
  { id: "and", name: "AND gate", group: "gates", studyHref: "/lab?gate=and", studyLabel: "OPEN IN LAB" },
  { id: "or", name: "OR gate", group: "gates", studyHref: "/lab?gate=or", studyLabel: "OPEN IN LAB" },
  { id: "not", name: "NOT gate", group: "gates", studyHref: "/lab?gate=not", studyLabel: "OPEN IN LAB" },
  { id: "nand", name: "NAND gate", group: "gates", studyHref: "/lab?gate=nand", studyLabel: "OPEN IN LAB" },
  { id: "nor", name: "NOR gate", group: "gates", studyHref: "/lab?gate=nor", studyLabel: "OPEN IN LAB" },
  { id: "xor", name: "XOR gate", group: "gates", studyHref: "/lab?gate=xor", studyLabel: "OPEN IN LAB" },
  { id: "xnor", name: "XNOR gate", group: "gates", studyHref: "/lab?gate=xnor", studyLabel: "OPEN IN LAB" },
  // what the player is asked to do with them
  { id: "identify", name: "Identifying gates", group: "skills", studyHref: "/briefing/newbie", studyLabel: "GATE BRIEFING" },
  { id: "outputs", name: "Determining outputs", group: "skills", studyHref: "/lab", studyLabel: "OPEN IN LAB" },
  { id: "truth-tables", name: "Truth tables", group: "skills", studyHref: "/lab", studyLabel: "OPEN IN LAB" },
  { id: "boolean", name: "Boolean expressions (bonus)", group: "skills", studyHref: "/briefing/advanced", studyLabel: "ADVANCED BRIEFING" },
  // network cabling
  { id: "rj45", name: "RJ45 connector", group: "cabling", studyHref: "/briefing/cabling", studyLabel: "CABLING BRIEFING" },
  { id: "utp", name: "UTP cable", group: "cabling", studyHref: "/briefing/cabling", studyLabel: "CABLING BRIEFING" },
  { id: "wire-order", name: "Wire order (T568A / T568B)", group: "cabling", studyHref: "/cabling", studyLabel: "WIRING LAB" },
  { id: "straight-through", name: "Straight-through cable", group: "cabling", studyHref: "/cabling", studyLabel: "WIRING LAB" },
  { id: "crossover", name: "Crossover cable", group: "cabling", studyHref: "/cabling", studyLabel: "WIRING LAB" },
  { id: "cable-selection", name: "Choosing the right cable", group: "cabling", studyHref: "/briefing/cabling", studyLabel: "CABLING BRIEFING" },
  { id: "modular-jack", name: "Modular jack", group: "cabling", studyHref: "/briefing/cabling", studyLabel: "CABLING BRIEFING" },
];

export const TOPIC_MAP: Record<string, Topic> = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

export const GROUP_LABEL: Record<TopicGroup, string> = {
  gates: "LOGIC GATES",
  skills: "LOGIC SKILLS",
  cabling: "NETWORK CABLING",
};

/** Topics covered by each level. Every level in LEVELS has an entry. */
export const LEVEL_TOPICS: Record<string, string[]> = {
  "newbie-01": ["and", "identify"],
  "newbie-02": ["and", "identify"],
  "newbie-03": ["not", "identify"],
  "newbie-04": ["or", "outputs"],
  "newbie-05": ["not", "outputs"],
  "newbie-06": ["and", "identify"],
  "newbie-07": ["and", "truth-tables"],
  "newbie-08": ["or", "truth-tables"],
  "newbie-09": ["and", "outputs"],
  "newbie-10": ["not", "outputs"],

  "intermediate-01": ["nand", "outputs"],
  "intermediate-02": ["nor", "outputs"],
  "intermediate-03": ["xor", "outputs"],
  "intermediate-04": ["nand", "identify"],
  "intermediate-05": ["nand", "truth-tables"],
  "intermediate-06": ["xor", "truth-tables"],
  "intermediate-07": ["nor", "truth-tables"],
  "intermediate-08": ["xor", "truth-tables"],
  "intermediate-09": ["nor", "truth-tables"],
  "intermediate-10": ["xor", "truth-tables"],

  "advanced-01": ["xnor", "outputs"],
  "advanced-02": ["xnor", "xor", "identify"],
  "advanced-03": ["not", "boolean"],
  "advanced-04": ["nand", "boolean"],
  "advanced-05": ["xnor", "truth-tables"],
  "advanced-06": ["nand", "boolean"],
  "advanced-07": ["xor", "boolean"],
  "advanced-08": ["not", "and", "truth-tables"],
  "advanced-09": ["not", "truth-tables"],
  "advanced-10": ["xnor", "xor", "boolean"],

  "cabling-01": ["rj45"],
  "cabling-02": ["utp"],
  "cabling-03": ["wire-order"],
  "cabling-04": ["straight-through"],
  "cabling-05": ["straight-through", "wire-order"],
  "cabling-06": ["crossover"],
  "cabling-07": ["cable-selection", "straight-through"],
  "cabling-08": ["modular-jack"],
  "cabling-09": ["cable-selection", "crossover"],
  "cabling-10": ["crossover", "wire-order"],
};

export type TopicStat = { right: number; wrong: number };

export type TopicStatus = "unpracticed" | "review" | "improving" | "strong";

export function topicAccuracy(stat: TopicStat | undefined): number | null {
  if (!stat) return null;
  const total = stat.right + stat.wrong;
  return total === 0 ? null : Math.round((stat.right / total) * 100);
}

export function topicStatus(stat: TopicStat | undefined): TopicStatus {
  const accuracy = topicAccuracy(stat);
  if (accuracy === null) return "unpracticed";
  if (accuracy >= 80) return "strong";
  if (accuracy >= 60) return "improving";
  return "review";
}
