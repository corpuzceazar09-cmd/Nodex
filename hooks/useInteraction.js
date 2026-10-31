"use client";

import { useMemo } from "react";
import { nearestInteractive } from "@/utils/bedroomGeometry";

// The player must be standing right next to an object's footprint to use it.
export const useInteraction = (playerPos, disabled = false, objects = {}, reach = 34) => {
  const activeObject = useMemo(
    () => (disabled ? null : nearestInteractive(playerPos.x, playerPos.y, objects, reach)),
    [playerPos.x, playerPos.y, disabled, objects, reach]
  );
  return { activeObject, interactionPrompt: activeObject?.prompt ?? "" };
};
