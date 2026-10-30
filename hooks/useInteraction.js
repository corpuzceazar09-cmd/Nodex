"use client";

import { useState, useEffect } from "react";
import { getDistance, checkCollision } from "@/utils/collision";
import { INTERACTIVE_OBJECTS } from "@/data/bedroomObjects";

export const useInteraction = (playerPos, playerSize = { width: 24, height: 32 }, disabled = false, objects = INTERACTIVE_OBJECTS) => {
  const [activeObject, setActiveObject] = useState(null);
  const [interactionPrompt, setInteractionPrompt] = useState("");

  useEffect(() => {
    if (disabled) {
      setActiveObject(null);
      setInteractionPrompt("");
      return;
    }

    let closest = null;
    let closestDistance = Infinity;

    for (const obj of Object.values(objects)) {
      if (!obj.prompt) continue;
      
      const objCenterX = obj.x + obj.width / 2;
      const objCenterY = obj.y + obj.height / 2;
      const playerCenterX = playerPos.x + playerSize.width / 2;
      const playerCenterY = playerPos.y + playerSize.height / 2;
      
      // Distance to the nearest point of the object's edge, not its center.
      // Large furniture (especially the bed) must be usable while standing beside it.
      const nearestX = Math.max(obj.x, Math.min(playerCenterX, obj.x + obj.width));
      const nearestY = Math.max(obj.y, Math.min(playerCenterY, obj.y + obj.height));
      const distance = getDistance(playerCenterX, playerCenterY, nearestX, nearestY);
      
      // Check if within interaction distance
      if (distance <= (obj.interactionDistance || 48)) {
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = obj;
        }
      }
    }

    if (closest) {
      setActiveObject(closest);
      setInteractionPrompt(closest.prompt);
    } else {
      setActiveObject(null);
      setInteractionPrompt("");
    }
  }, [playerPos, disabled, playerSize, objects]);

  return {
    activeObject,
    interactionPrompt
  };
};
