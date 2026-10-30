"use client";

import Link from "next/link";
import ScreenFrame from "@/components/ScreenFrame";
import PlayerPanel from "@/components/PlayerPanel";
import { useGame } from "@/components/GameProvider";

export default function MenuPage() {
  const { selectedTier } = useGame();
  const continueHref = `/map/${selectedTier ?? "newbie"}`;

  return (
    <div className="wf-page">
      <ScreenFrame title="Nodex — MAIN MENU">
        <h1 className="text-center text-xl font-black tracking-wider">
          WELCOME TO Nodex
        </h1>

        <div className="grid flex-1 gap-6 md:grid-cols-3">
          {/* player-info frame, aligned with the button menu */}
          <div className="flex flex-col justify-center">
            <PlayerPanel />
          </div>

          <div className="flex flex-col justify-center gap-3 md:col-span-2">
            <Link href="/tutorial" className="wf-btn wf-btn-primary">
              START
            </Link>
            <Link href="/bedroom" className="wf-btn">
              RETURN TO BEDROOM
            </Link>
            <Link href={continueHref} className="wf-btn">
              CONTINUE
            </Link>
        <Link href="/circuits" className="wf-btn">
          CIRCUIT CHALLENGES
        </Link>
        <Link href="/sandbox" className="wf-btn">
          BREADBOARD SANDBOX
        </Link>
        <Link href="/cabling" className="wf-btn">
          RJ45 CABLING GAME
        </Link>
            <Link href="/lab" className="wf-btn">
              LOGIC GATE LAB
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/how-to-play" className="wf-btn">
                HOW TO PLAY
              </Link>
              <Link href="/settings" className="wf-btn">
                SETTINGS
              </Link>
            </div>
            <Link href="/" className="wf-btn text-xs">
              EXIT
            </Link>
          </div>
        </div>
      </ScreenFrame>
    </div>
  );
}