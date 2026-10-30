"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import PlayerPanel from "@/components/PlayerPanel";
import { useGame } from "@/components/GameProvider";
import { TIERS, isTierId } from "@/lib/data/tiers";
import { levelsForTier } from "@/lib/data/levels";
import { LOCKED_TOAST } from "@/lib/data/copy";

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden
    >
      <rect x={4} y={10} width={16} height={11} />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function MapPage({
  params,
}: {
  params: Promise<{ tier: string }>;
}) {
  const { tier } = use(params);
  const router = useRouter();
  const { completed, isUnlocked, selectTier } = useGame();
  const [toast, setToast] = useState<string | null>(null);

  const valid = isTierId(tier);

  useEffect(() => {
    if (!valid) router.replace("/difficulty");
    else selectTier(tier);
  }, [valid, tier, router, selectTier]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  if (!valid) return null;

  const t = TIERS[tier];
  const levels = levelsForTier(tier);
  const doneCount = completed[tier].length;
  const pct = Math.round((doneCount / levels.length) * 100);

  function open(levelId: string, unlocked: boolean) {
    if (!unlocked) {
      setToast(LOCKED_TOAST);
      return;
    }
    router.push(`/level/${levelId}`);
  }

  return (
    <div className="wf-page">
      <ScreenFrame title={`${t.name} — LEVEL PATH`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="wf-chip self-start">{t.levelLabel}</span>
            <span className="text-sm font-black">
              PROGRESS: {doneCount}/{levels.length}
            </span>
            <div className="wf-progress w-56">
              <div className="wf-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="w-64 max-w-full">
            <PlayerPanel />
          </div>
        </div>

        {/* node grid: 2 rows × 5, matching the wireframe */}
        <div className="mx-auto grid w-fit grid-cols-5 gap-3">
          {levels.map((level, i) => {
            const done = completed[tier].includes(level.id);
            const unlocked = isUnlocked(tier, i);
            const cls = [
              "wf-node",
              level.isFinal ? "wf-node-final" : "",
              done ? "wf-node-done" : unlocked ? "wf-node-current" : "wf-node-locked",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={level.id}
                className={cls}
                onClick={() => open(level.id, unlocked)}
                aria-label={`Level ${i + 1}${level.isFinal ? " (final)" : ""}`}
                title={unlocked ? level.title : "LOCKED"}
              >
                {done ? "★" : unlocked ? String(i + 1) : <LockIcon />}
              </button>
            );
          })}
        </div>

        <p className="wf-hint text-center">
          ★ = COMPLETED · PULSING = YOUR NEXT LEVEL · {`▣`} = FINAL CHALLENGE
          (150 XP)
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <Link href="/difficulty" className="wf-btn text-xs">
            ◀ CHANGE DIFFICULTY
          </Link>
          <Link href="/menu" className="wf-btn text-xs">
            MAIN MENU
          </Link>
        </div>
      </ScreenFrame>

      {toast && <div className="wf-toast">{toast}</div>}
    </div>
  );
}