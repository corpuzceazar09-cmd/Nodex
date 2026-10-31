"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import { ui } from "@/lib/uiStyles";

const LINES = [
  "PROF. LOGIC: Welcome, rookie! I've been waiting for you.",
  "PROF. LOGIC: This world runs on logic gates — AND, OR, NOT, and their friends.",
  "PROF. LOGIC: Master them all and you'll become a true Nodex!",
  "PROF. LOGIC: Your first task is already waiting. Ready? Let's go!",
];

const CHAR_MS = 22;

export default function IntroPage() {
  const router = useRouter();
  const [lineIdx, setLineIdx] = useState(0);
  const [shown, setShown] = useState(0);
  const line = LINES[lineIdx];
  const typing = shown < line.length;
  const finished = !typing && lineIdx === LINES.length - 1;

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
    if (lineIdx < LINES.length - 1) {
      setLineIdx((i) => i + 1);
      setShown(0);
    }
  }

  return (
    <div className={ui.page}>
      <ScreenFrame title="Nodex — INTRO">
        <div className="flex flex-1 flex-wrap items-stretch gap-4">
          {/* guide character (placeholder pixel NPC) */}
          <div className="flex w-24 shrink-0 flex-col items-center gap-2 sm:w-28">
            <div className="relative h-20 w-20 border-4 border-black bg-[#7a7a9a] sm:h-24 sm:w-24">
              <div className="absolute left-3 top-7 h-3 w-3 bg-black" />
              <div className="absolute right-3 top-7 h-3 w-3 bg-black" />
              <div className="absolute bottom-5 left-1/2 h-2 w-8 -translate-x-1/2 bg-black" />
            </div>
            <span className="text-center text-[10px] font-bold">
              PROF.
              <br />
              LOGIC
            </span>
          </div>

          {/* dialogue box */}
          <div className="flex min-w-[14rem] flex-1 flex-col justify-between gap-4">
            <div className={`${ui.dialogue} ${ui.cursor}`}>
              {line.slice(0, shown)}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button className={ui.button} onClick={() => router.push("/menu")}>
                SKIP ▶▶
              </button>
              {finished ? (
                <Link href="/menu" className={`${ui.button} ${ui.buttonPrimary}`}>
                  START ADVENTURE ▶
                </Link>
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