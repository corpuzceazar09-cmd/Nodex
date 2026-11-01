import type { GateId } from "./gates";

export type TierId = "newbie" | "intermediate" | "advanced" | "circuits" | "cabling";

export type Tier = {
  id: TierId;
  /** Logic tiers are picked on /difficulty; the cabling path is its own track. */
  subject: "logic" | "cabling";
  name: string;
  levelLabel: string;
  blurb: string;
  gateIds: GateId[];
  /** Extra briefing cards beyond the per-gate cards (advanced tier topics). */
  topics: { title: string; body: string }[];
};

export const TIERS: Record<TierId, Tier> = {
  newbie: {
    id: "newbie",
    subject: "logic",
    name: "NEWBIE",
    levelLabel: "LEVEL 1 / NEWBIE",
    blurb: "What logic gates are and how to identify them.",
    gateIds: ["buffer", "and", "or", "not"],
    topics: [],
  },
  intermediate: {
    id: "intermediate",
    subject: "logic",
    name: "INTERMEDIATE",
    levelLabel: "LEVEL 2 / INTERMEDIATE",
    blurb: "Find outputs and read truth tables.",
    gateIds: ["nand", "nor", "xor"],
    topics: [],
  },
  advanced: {
    id: "advanced",
    subject: "logic",
    name: "ADVANCED",
    levelLabel: "LEVEL 3 / ADVANCED",
    blurb: "Combined gates, Boolean expressions and full circuits.",
    gateIds: ["xnor"],
    topics: [
      {
        title: "COMBINED GATES",
        body: "Chain gates together to build bigger circuits — NOT into AND, AND into OR, and so on.",
      },
      {
        title: "BOOLEAN EXPRESSIONS",
        body: "Read and simplify expressions such as (A · B)̅ and A ⊕ B.",
      },
    ],
  },
  circuits: {
    id: "circuits",
    subject: "logic",
    name: "CIRCUITS",
    levelLabel: "BONUS / CIRCUIT CHALLENGES",
    blurb: "Read and reason about full multi-gate circuits.",
    gateIds: ["buffer", "not", "and", "or", "nand", "nor", "xor", "xnor"],
    topics: [],
  },
  cabling: {
    id: "cabling",
    subject: "cabling",
    name: "CABLING",
    levelLabel: "NETWORK CABLING PATH",
    blurb: "RJ45 connectors, wire order, straight-through and crossover cables.",
    gateIds: [],
    topics: [
      {
        title: "RJ45 CONNECTOR",
        body: "The 8-pin plug crimped onto each end of an Ethernet (UTP) cable. Hold it clip-down, pins facing you: pin 1 is on the left.",
      },
      {
        title: "UTP CABLE",
        body: "Unshielded twisted pair: 8 copper wires twisted into 4 colour pairs — orange, green, blue and brown.",
      },
      {
        title: "T568A & T568B",
        body: "The two standard wire orders. T568B: white-orange, orange, white-green, blue, white-blue, green, white-brown, brown. T568A swaps the orange and green pairs.",
      },
      {
        title: "STRAIGHT-THROUGH",
        body: "Both ends use the same standard (B to B). Connects DIFFERENT kinds of device: PC to switch, router to switch.",
      },
      {
        title: "CROSSOVER",
        body: "One end T568B, the other T568A, so transmit meets receive. Connects devices of the SAME kind: PC to PC, switch to switch.",
      },
      {
        title: "MODULAR JACK",
        body: "The female socket an RJ45 plug clicks into — in wall outlets, patch panels and network cards. Keystone jacks snap into wall plates.",
      },
    ],
  },
};

export const TIER_ORDER: TierId[] = ["newbie", "intermediate", "advanced"];

export function isTierId(value: string): value is TierId {
  return (
    value === "newbie" ||
    value === "intermediate" ||
    value === "advanced" ||
    value === "cabling"
  );
}