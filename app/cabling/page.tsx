"use client";

import Link from "next/link";
import { useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import WiringBoard from "@/components/cabling/WiringBoard";
import type { CableMode } from "@/lib/data/cabling";
import { ui } from "@/lib/uiStyles";

/** Free-practice wiring lab (no XP). The graded version lives on the Cabling path. */
export default function CablingPage() {
  const [mode, setMode] = useState<CableMode>("straight");

  return (
    <div className={ui.page}>
      <ScreenFrame title="NODEX — RJ45 WIRING LAB">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black tracking-wider">ETHERNET WIRING LAB</h1>
            <p className="text-xs">Free practice: drag each colored wire from the left connector to a pin on the right.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/map/cabling" className={`${ui.button} text-xs`}>CABLING PATH</Link>
            <Link href="/menu" className={`${ui.button} text-xs`}>BACK TO MENU</Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Choose cable wiring mode">
          {(["straight", "crossover", "rollover"] as CableMode[]).map((item) => (
            <button key={item} type="button" className={`${ui.button} text-xs ${mode === item ? ui.buttonPrimary : ""}`} onClick={() => setMode(item)} aria-pressed={mode === item}>
              {item === "straight" ? "STRAIGHT-THROUGH" : item === "rollover" ? "ROLLOVER (BONUS)" : item.toUpperCase()}
            </button>
          ))}
        </div>
        {/* key: switching mode starts a fresh board */}
        <WiringBoard key={mode} mode={mode} successText="PERFECT! All 8 pins are wired correctly. Choose another mode to keep practicing." />
      </ScreenFrame>
    </div>
  );
}
