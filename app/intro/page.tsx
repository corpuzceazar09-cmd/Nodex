"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import { useGame } from "@/components/GameProvider";
import { ui } from "@/lib/uiStyles";

const CHAR_MS = 22;

// PROF. LOGIC's sprite sheet: 3 columns x 4 rows of 60x88 frames; row 0 faces the viewer.
const SHEET = { width: 180, height: 352, frameWidth: 60, frameHeight: 88 };
const PORTRAIT_SCALE = 1.6;

function introLines(name: string) {
  return [
    `PROF. LOGIC: Welcome to the NODEX lab, ${name}! Told you I'd meet you here.`,
    "PROF. LOGIC: This world runs on logic gates — AND, OR, NOT, and their friends.",
    "PROF. LOGIC: Master them all and you'll become a true Nodex!",
    "PROF. LOGIC: Your first task is already waiting. Ready? Let's go!",
  ];
}

function ProfLogicPortrait() {
  const w = SHEET.frameWidth * PORTRAIT_SCALE;
  const h = SHEET.frameHeight * PORTRAIT_SCALE;
  return (
    <div
      role="img"
      aria-label="PROF. LOGIC"
      className="border-4 border-[#3b3452] bg-[#e9e5fe] shadow-[4px_4px_0_#2a2540]"
      style={{
        width: w,
        height: h,
        backgroundImage: "url(/assets/bedroom/nodex/characters/npc-guide-sheet.png)",
        backgroundSize: `${SHEET.width * PORTRAIT_SCALE}px ${SHEET.height * PORTRAIT_SCALE}px`,
        backgroundPosition: `${-w}px 0px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
      }}
    />
  );
}

export default function IntroPage() {
  const router = useRouter();
  const { profile, completeOnboarding } = useGame();
  const lines = introLines(profile?.name ?? "rookie");
  const [lineIdx, setLineIdx] = useState(0);
  const [shown, setShown] = useState(0);
  const line = lines[lineIdx];
  const typing = shown < line.length;
  const finished = !typing && lineIdx === lines.length - 1;

  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => setShown((s) => s + 1), CHAR_MS);
    return () => clearTimeout(t);
  }, [typing, shown]);

  function next() {
    if (typing) {
      setShown(line.length);
      return;
    }
    if (lineIdx < lines.length - 1) {
      setLineIdx((i) => i + 1);
      setShown(0);
    }
  }

  // Finishing or skipping the intro both count as onboarded: next time,
  // PRESS START and the bedroom computer go straight to the menu.
  function enterMenu() {
    completeOnboarding();
    router.push("/menu");
  }

  return (
    <div className={ui.page}>
      <ScreenFrame title="Nodex — INTRO">
        <div className="flex flex-1 flex-wrap items-stretch gap-4">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <ProfLogicPortrait />
            <span className="text-center text-[10px] font-bold">PROF. LOGIC</span>
          </div>

          {/* dialogue box */}
          <div className="flex min-w-[14rem] flex-1 flex-col justify-between gap-4">
            <div className={`${ui.dialogue} ${ui.cursor}`}>
              {line.slice(0, shown)}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button className={ui.button} onClick={enterMenu}>
                SKIP ▶▶
              </button>
              {finished ? (
                <button className={`${ui.button} ${ui.buttonPrimary}`} onClick={enterMenu}>
                  START ADVENTURE ▶
                </button>
              ) : (
                <button className={`${ui.button} ${ui.buttonPrimary}`} onClick={next}>
                  {typing ? "..." : "NEXT ▶"}
                </button>
              )}
            </div>
          </div>
        </div>
      </ScreenFrame>
    </div>
  );
}
