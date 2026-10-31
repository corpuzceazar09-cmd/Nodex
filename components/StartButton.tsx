"use client";

import Link from "next/link";
import { useGame } from "@/components/GameProvider";

/** PRESS START: new players wake up in the bedroom, returning players go to the menu. */
export default function StartButton() {
  const { loaded, onboarded } = useGame();
  const href = loaded && onboarded ? "/menu" : "/bedroom";

  return (
    <Link href={href} className="wf-btn wf-btn-primary wf-blink mt-1">
      ▶ PRESS START
    </Link>
  );
}
