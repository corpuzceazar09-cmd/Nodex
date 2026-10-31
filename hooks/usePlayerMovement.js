"use client";

import { useEffect, useState, useRef } from "react";

export const usePlayerMovement = (initialX = 160, initialY = 300, disabled = false, collisionCheck = null, movementSpeed = 120) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [direction, setDirection] = useState("down");
  const [isMoving, setIsMoving] = useState(false);
  const keysPressed = useRef(new Set());
  const collisionRef = useRef(collisionCheck);
  collisionRef.current = collisionCheck;
  const lastTime = useRef(performance.now());
  const speed = movementSpeed; // pixels per second
  const lastDirectionRef = useRef("down");
  const directionRef = useRef("down");
  const movingRef = useRef(false);

  useEffect(() => {
    if (disabled) {
      keysPressed.current.clear();
      setIsMoving(false);
      movingRef.current = false;
      return;
    }

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key);
        // Update last direction to most recently pressed
        if (key === "w" || key === "arrowup") {
          lastDirectionRef.current = "up";
        } else if (key === "s" || key === "arrowdown") {
          lastDirectionRef.current = "down";
        } else if (key === "a" || key === "arrowleft") {
          lastDirectionRef.current = "left";
        } else if (key === "d" || key === "arrowright") {
          lastDirectionRef.current = "right";
        }
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(key)) {
        keysPressed.current.delete(key);
      }
    };

    const handleBlur = () => {
      keysPressed.current.clear();
      setIsMoving(false);
      movingRef.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    let animationId;
    lastTime.current = performance.now();
    
    const gameLoop = (currentTime) => {
      if (disabled) {
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = Math.min((currentTime - lastTime.current) / 1000, 0.1); // seconds
      lastTime.current = currentTime;

      let dx = 0;
      let dy = 0;
      let moving = false;
      let newDirection = directionRef.current;

      // Check keys in priority order or use last direction
      const hasUp = keysPressed.current.has("w") || keysPressed.current.has("arrowup");
      const hasDown = keysPressed.current.has("s") || keysPressed.current.has("arrowdown");
      const hasLeft = keysPressed.current.has("a") || keysPressed.current.has("arrowleft");
      const hasRight = keysPressed.current.has("d") || keysPressed.current.has("arrowright");

      // Determine movement based on held keys
      if (hasUp && !hasDown) {
        dy = -1;
        moving = true;
        newDirection = "up";
      } else if (hasDown && !hasUp) {
        dy = 1;
        moving = true;
        newDirection = "down";
      } else if (hasLeft && !hasRight) {
        dx = -1;
        moving = true;
        newDirection = "left";
      } else if (hasRight && !hasLeft) {
        dx = 1;
        moving = true;
        newDirection = "right";
      } else if (hasUp) {
        dy = -1;
        moving = true;
        newDirection = "up";
      } else if (hasDown) {
        dy = 1;
        moving = true;
        newDirection = "down";
      } else if (hasLeft) {
        dx = -1;
        moving = true;
        newDirection = "left";
      } else if (hasRight) {
        dx = 1;
        moving = true;
        newDirection = "right";
      }

      // Normalize diagonal if somehow both pressed (though we handle above)
      if (dx !== 0 && dy !== 0) {
        dx *= Math.SQRT1_2;
        dy *= Math.SQRT1_2;
      }

      directionRef.current = newDirection;
      movingRef.current = moving;
      
      if (moving) {
        setDirection(newDirection);
        setIsMoving(true);
        
        // Calculate new position
        const moveX = dx * speed * deltaTime;
        const moveY = dy * speed * deltaTime;
        
        setPosition(prev => {
          const nextX = prev.x + moveX;
          const nextY = prev.y + moveY;
          
          // Check collision if collisionCheck is provided
          if (collisionRef.current) {
            if (collisionRef.current(nextX, nextY, prev.x, prev.y)) {
              return prev; // Don't move if collision
            }
          }
          
          return { x: nextX, y: nextY };
        });
      } else {
        setIsMoving(false);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      cancelAnimationFrame(animationId);
    };
  }, [disabled, movementSpeed]);

  return {
    position,
    setPosition,
    direction,
    isMoving,
    keysPressed: keysPressed.current
  };
};
