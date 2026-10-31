"use client";

import { levelProgressPct, useGame } from "@/components/GameProvider";
import { BADGES, getRankDetails } from "@/lib/gameState";
import { ui } from "@/lib/uiStyles";

/** Player stats panel: rank, XP, streak, progress and earned badges. */
export default function PlayerPanel({ compact = false }: { compact?: boolean }) {
  const { xp, level, streak, badges, stars } = useGame();
  const pct = levelProgressPct(xp);
  const rank = getRankDetails(xp);
  const totalStars = Object.values(stars).reduce((sum, s) => sum + s, 0);

  return (
    <div className={ui.player}>
      <div className={ui.playerRow}>
        <span className={ui.chip}>LV {level}</span>
        <span className={ui.chip}>XP {xp}</span>
        <span className={`${ui.chip} ${ui.chipStreak}`}>STREAK {streak}</span>
      </div>
      <div className={ui.playerRow}>
        <span className={ui.chip}>
          {rank.current.icon} {rank.current.name.toUpperCase()}
        </span>
        <span className={ui.chip}>★ {totalStars}</span>
      </div>
      <div className={ui.progress} aria-label="level progress">
        <div className={ui.progressFill} style={{ width: `${pct}%` }} />
      </div>
      <div className={ui.playerCaption}>{pct}% TO NEXT LEVEL</div>
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