"use client";

import { useRouter } from "next/navigation";
import ScreenFrame from "@/components/ScreenFrame";
import { useGame } from "@/components/GameProvider";
import Link from "next/link";
import { GATES } from "@/lib/data/gates";
import { TIER_ORDER, TIERS, type TierId } from "@/lib/data/tiers";
import { ui } from "@/lib/uiStyles";

export default function DifficultyPage() {
  const { selectTier } = useGame();
  const router = useRouter();

  function pick(id: TierId) {
    selectTier(id);
    router.push(`/briefing/${id}`);
  }

  return (
    <div className={ui.page}>
      <ScreenFrame title="SELECT DIFFICULTY">
        <p className="text-center font-black tracking-wider">
          LEVELS OF DIFFICULTY
        </p>
        <p className={`${ui.hint} text-center`}>
          Pick a tier — you&apos;ll see the gates it covers before the path
          unlocks.
        </p>

        <div className="grid flex-1 gap-4 md:grid-cols-3">
          {TIER_ORDER.map((id) => {
            const tier = TIERS[id];
            return (
              <button
                key={id}
                onClick={() => pick(id)}
                className="flex cursor-pointer flex-col items-start gap-3 border-[3px] border-black bg-white p-4 text-left transition-colors hover:bg-[#e8e8ff]"
              >
                <span className={ui.chip}>{tier.levelLabel}</span>
                <span className="text-lg font-black">{tier.name}</span>
                <span className="text-sm leading-snug">{tier.blurb}</span>
                <span className="flex flex-wrap gap-1">
                  {tier.gateIds.map((g) => (
                    <span key={g} className={`${ui.chip} text-[10px]`}>
                      {GATES[g].name}
                    </span>
                  ))}
                </span>
                <span className={`${ui.button} mt-auto w-full`}>SELECT ▶</span>
              </button>
            );
          })}
        </div>

        <Link href="/menu" className={`${ui.button} mx-auto text-xs`}>
          ◀ BACK TO MENU
        </Link>
      </ScreenFrame>
    </div>
  );
}