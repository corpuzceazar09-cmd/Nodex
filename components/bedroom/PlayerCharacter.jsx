"use client";

import { useEffect, useState } from "react";

const FRAME_WIDTH = 78;
const FRAME_HEIGHT = 114;
const DIRECTION_ROW = { down: 0, left: 1, right: 2, up: 3 };
// Step-stand-step-stand reads much smoother than looping 0→1→2→0.
const WALK_CYCLE = [0, 1, 2, 1];

export default function PlayerCharacter({ x, y, direction = "down", isMoving = false,
  state = "idle", theme = "classic", gender = "boy" }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!isMoving || state === "lying_down") { setStep(0); return; }
    setStep(1);
    const id = setInterval(() => setStep(i => i + 1), 130);
    return () => clearInterval(id);
  }, [isMoving, state]);
  const frame = isMoving ? WALK_CYCLE[step % WALK_CYCLE.length] : 1;

  const row = DIRECTION_ROW[direction] ?? 0;
  return (
    <div role="img" aria-label={`${gender} character facing ${direction}`}
      style={{position: "absolute", left: Math.round(x), top: Math.round(y), width: FRAME_WIDTH, height: FRAME_HEIGHT,
        backgroundImage: `url(/assets/bedroom/${theme}/characters/player-${gender === "girl" ? "girl" : "boy"}-sheet.png)`,
        backgroundPosition: `${-frame * FRAME_WIDTH}px ${-row * FRAME_HEIGHT}px`,
        backgroundRepeat: "no-repeat", backgroundSize: "234px 456px", imageRendering: "pixelated", zIndex: 20,
        filter: "drop-shadow(0 4px 1px rgba(18,18,20,.38))" }} />
  );
}
