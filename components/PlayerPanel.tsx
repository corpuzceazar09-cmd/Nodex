"use client";

import { levelProgressPct, useGame } from "@/components/GameProvider";
import { BADGES, getRankDetails } from "@/lib/gameState";

/** Player stats panel: rank, XP, streak, progress and earned badges. */
export default function PlayerPanel({ compact = false }: { compact?: boolean }) {
  const { xp, level, streak, badges, stars } = useGame();
  const pct = levelProgressPct(xp);
  const rank = getRankDetails(xp);
  const totalStars = Object.values(stars).reduce((sum, s) => sum + s, 0);

  return (
    <div className={`wf-player ${compact ? "wf-player-compact" : ""}`}>
      <div className="wf-player-row">
        <span className="wf-chip">LV {level}</span>
        <span className="wf-chip">XP {xp}</span>
        <span className="wf-chip wf-chip-streak">STREAK {streak}</span>
      </div>
      <div className="wf-player-row">
        <span className="wf-chip">
          {rank.current.icon} {rank.current.name.toUpperCase()}
        </span>
        <span className="wf-chip">★ {totalStars}</span>
      </div>
      <div className="wf-progress" aria-label="level progress">
        <div className="wf-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="wf-player-caption">{pct}% TO NEXT LEVEL</div>
      <div className="wf-player-row" aria-label="earned badges">
        {BADGES.map((b) => (
          <span
            key={b.id}
            className="wf-chip"
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