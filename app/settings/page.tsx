"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import { useGame } from "@/components/GameProvider";
import { getSavedTheme, saveTheme } from "@/utils/themeStorage";
import { BEDROOM_THEMES } from "@/data/bedroomThemes";
import { ui } from "@/lib/uiStyles";

const BEDROOM_THEME_CHANGE_EVENT = "nodex:bedroom-theme-change";

function isBedroomTheme(theme: string): theme is keyof typeof BEDROOM_THEMES {
  return Object.prototype.hasOwnProperty.call(BEDROOM_THEMES, theme);
}

function subscribeToBedroomTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(BEDROOM_THEME_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(BEDROOM_THEME_CHANGE_EVENT, onChange);
  };
}

function getBedroomThemeSnapshot(): keyof typeof BEDROOM_THEMES {
  const savedTheme = getSavedTheme();
  return isBedroomTheme(savedTheme) ? savedTheme : "classic";
}

function getDefaultBedroomThemeSnapshot(): keyof typeof BEDROOM_THEMES {
  return "classic";
}

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
  const bedroomTheme = useSyncExternalStore(
    subscribeToBedroomTheme,
    getBedroomThemeSnapshot,
    getDefaultBedroomThemeSnapshot,
  );

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2400);
    return () => clearTimeout(t);
  }, [msg]);

  const handleThemeChange = (theme: keyof typeof BEDROOM_THEMES) => {
    saveTheme(theme);
    window.dispatchEvent(new Event(BEDROOM_THEME_CHANGE_EVENT));
    setMsg("BEDROOM THEME UPDATED!");
  };

  return (
    <div className={ui.page}>
      <ScreenFrame title="SETTINGS">
        <p className={`${ui.hint} text-center`}>
          Settings and progress are saved to this browser and persist across
          reloads.
        </p>

        <div className="flex flex-col gap-3">
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
                  onClick={() => {
                    if (isBedroomTheme(theme.id)) {
                      handleThemeChange(theme.id);
                    }
                  }}
                >
                  {theme.name}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs opacity-60">
              {BEDROOM_THEMES[bedroomTheme].description}
            </p>
          </div>
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
              className={`${ui.button} ${ui.buttonRed} mb-2 w-full`}
              onClick={() => {
                resetProgress();
                setMsg("PROGRESS RESET — BACK TO LEVEL 1!");
              }}
            >
              RESET PROGRESS
            </button>
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
