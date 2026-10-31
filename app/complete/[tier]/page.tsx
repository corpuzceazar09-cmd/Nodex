"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import { useGame } from "@/components/GameProvider";
import { TIER_ORDER, TIERS, isTierId } from "@/lib/data/tiers";
import { ui } from "@/lib/uiStyles";

export default function CompletePage({
  params,
}: {
  params: Promise<{ tier: string }>;
}) {
  const { tier } = use(params);
  const router = useRouter();
  const { xp, streak, selectTier } = useGame();
  const valid = isTierId(tier);

  useEffect(() => {
    if (!valid) router.replace("/difficulty");
  }, [valid, router]);

  if (!valid) return null;

  const t = TIERS[tier];
  const idx = TIER_ORDER.indexOf(tier);
  const nextTier =
    idx < TIER_ORDER.length - 1 ? TIERS[TIER_ORDER[idx + 1]] : null;
  const lastTier = idx === TIER_ORDER.length - 1;

  return (
    <div className={ui.page}>
      <ScreenFrame title={`${t.name} TIER COMPLETE`}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center border-4 border-black bg-[#6fd97f] text-5xl font-black">
            ★
          </div>
          <h1 className="text-2xl font-black tracking-wider">
            PATH CLEARED: {t.name}
          </h1>
          <p className="max-w-md leading-relaxed">
            {lastTier
              ? "Every tier, every node, every gate — you are a TRUE NODEX!"
              : `You finished all 10 nodes of the ${t.name} path. The next tier is waiting.`}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <span className={ui.chip}>TOTAL XP {xp}</span>
            <span className={`${ui.chip} ${ui.chipStreak}`}>STREAK {streak}</span>
            <span className={ui.chip}>10/10 NODES ★</span>
          </div>
        </div>

        <div className="mt-auto flex flex-col items-center gap-3">
          {nextTier && (
            <button
              className={`${ui.button} ${ui.buttonPrimary}`}
              onClick={() => {
                selectTier(nextTier.id);
                router.push(`/briefing/${nextTier.id}`);
              }}
            >
              NEXT: {nextTier.name} ▶
            </button>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`/map/${tier}`} className={`${ui.button} text-xs`}>
              REPLAY PATH
            </Link>
            <Link href="/menu" className={`${ui.button} text-xs`}>
              MAIN MENU
            </Link>
          </div>
        </div>
      </ScreenFrame>
    </div>
  );
}