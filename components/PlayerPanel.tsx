"use client";

import { useGame } from "@/components/GameProvider";
import { BADGES, getRankDetails } from "@/lib/gameState";
import { subjectProgress, type Subject } from "@/lib/progress";
import { ui } from "@/lib/uiStyles";

const SUBJECT_LABEL: Record<Subject, string> = { logic: "LOGIC", cabling: "CABLING" };

/** Player stats panel: rank, XP, streak, separate Logic/Cabling levels and badges. */
export default function PlayerPanel() {
  const { name, xp, streak, badges, stars, completed } = useGame();
  const rank = getRankDetails(xp);
  const totalStars = Object.values(stars).reduce((sum, s) => sum + s, 0);

  return (
    <div className={ui.player}>
      <div className="text-sm font-black tracking-wider">{name}</div>
      <div className={ui.playerRow}>
        <span className={ui.chip}>XP {xp}</span>
        <span className={`${ui.chip} ${ui.chipStreak}`}>STREAK {streak}</span>
        <span className={ui.chip}>★ {totalStars}</span>
      </div>
      <div className={ui.playerRow}>
        <span className={ui.chip}>
          {rank.current.icon} {rank.current.name.toUpperCase()}
        </span>
      </div>
      {(["logic", "cabling"] as Subject[]).map((subject) => {
        const p = subjectProgress(completed, subject);
        return (
          <div key={subject} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className={ui.chip}>
                {SUBJECT_LABEL[subject]} LV {p.level}
              </span>
              <span className={ui.playerCaption}>{p.pct}% TO LV {p.level + 1}</span>
            </div>
            <div className={ui.progress} aria-label={`${SUBJECT_LABEL[subject]} level progress`}>
              <div className={ui.progressFill} style={{ width: `${p.pct}%` }} />
            </div>
          </div>
        );
      })}
      <div className={ui.playerRow} aria-label="earned badges">
        {BADGES.map((b) => (
          <span
            key={b.id}
            className={ui.chip}
            title={`${b.name} — ${b.description}`}
            style={{ opacity: badges.includes(b.id) ? 1 : 0.3 }}
          >
            {b.icon}
          </span>
        ))}
      </div>
    </div>
  );
}
