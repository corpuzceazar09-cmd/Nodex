"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import { useGame } from "@/components/GameProvider";
<<<<<<< Updated upstream
=======
import { getSavedTheme, saveTheme } from "@/utils/themeStorage";
import { BEDROOM_THEMES } from "@/data/bedroomThemes";
import { ui } from "@/lib/uiStyles";
>>>>>>> Stashed changes

function ToggleRow({
  label,
  value,
  onToggle,
  note,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-[3px] border-black bg-white p-3">
      <span>
        <b>{label}</b>
        {note && <span className="block text-xs opacity-70">{note}</span>}
      </span>
      <button
        className={`${ui.button} w-24 ${value ? ui.buttonGreen : ""}`}
        onClick={onToggle}
        aria-pressed={!value}
      >
        {value ? "ON" : "OFF"}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const {
    resetProgress,
    soundMuted,
    musicMuted,
    setSoundMuted,
    setMusicMuted,
  } = useGame();
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2400);
    return () => clearTimeout(t);
  }, [msg]);

  return (
    <div className={ui.page}>
      <ScreenFrame title="SETTINGS">
        <p className={`${ui.hint} text-center`}>
          Settings and progress are saved to this browser and persist across
          reloads.
        </p>

        <div className="flex flex-col gap-3">
<<<<<<< Updated upstream
=======
          <div className="border-[3px] border-black bg-white p-3">
            <b>BEDROOM APPEARANCE</b>
            <p className="mb-3 text-xs opacity-70">
              Choose your bedroom theme.
            </p>
            <div className="flex gap-2">
              {Object.values(BEDROOM_THEMES).map((theme) => (
                <button
                  key={theme.id}
                  className={`${ui.button} flex-1 ${bedroomTheme === theme.id ? ui.buttonPrimary : ""}`}
                  onClick={() => handleThemeChange(theme.id)}
                >
                  {theme.name}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs opacity-60">
              {(BEDROOM_THEMES as any)[bedroomTheme]?.description}
            </p>
          </div>
>>>>>>> Stashed changes
          <ToggleRow
            label="SOUND EFFECTS"
            value={!soundMuted}
            onToggle={() => setSoundMuted(!soundMuted)}
            note="Clicks, switches, correct/incorrect stings and fanfares."
          />
          <ToggleRow
            label="MUSIC"
            value={!musicMuted}
            onToggle={() => setMusicMuted(!musicMuted)}
            note="Preference is saved (no background track in this build)."
          />
          <div className="border-[3px] border-black bg-white p-3">
            <b>SAVED PROGRESS</b>
            <p className="mb-3 text-xs opacity-70">
              XP, stars, badges and unlocks are stored locally. Resetting starts
              a fresh adventure.
            </p>
            <button
<<<<<<< Updated upstream
              className="wf-btn wf-btn-red w-full"
=======
              className={`${ui.button} ${ui.buttonRed} mb-2 w-full`}
>>>>>>> Stashed changes
              onClick={() => {
                resetProgress();
                setMsg("PROGRESS RESET — BACK TO LEVEL 1!");
              }}
            >
              RESET PROGRESS
            </button>
<<<<<<< Updated upstream
=======
            <button
              className={`${ui.button} ${ui.buttonRed} w-full`}
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("nodex_tutorial_completed");
                  setMsg("TUTORIAL RESET - GO TO BEDROOM!");
                }
              }}
            >
              RESET TUTORIAL
            </button>
>>>>>>> Stashed changes
          </div>
        </div>

        <Link href="/menu" className={`${ui.button} ${ui.buttonPrimary} mx-auto`}>
          ◀ BACK TO MENU
        </Link>
      </ScreenFrame>

      {msg && <div className={ui.toast}>{msg}</div>}
    </div>
  );
}
