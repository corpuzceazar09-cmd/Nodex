"use client";

import { useState, useEffect } from "react";

export default function BedInteraction({ 
  visible, 
  onStartRest, 
  onWakeUp,
  isResting = false 
}) {
  if (!visible) return null;
  
  if (isResting) {
    return (
      <div style={{
        position: "fixed",
        bottom: 40,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000
      }}>
        <button
          onClick={onWakeUp}
          style={{
            background: "#d9d9d9",
            border: "3px solid #111",
            padding: "10px 20px",
            fontFamily: "monospace",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Wake Up  [E / Enter / Space]
        </button>
      </div>
    );
  }
  
  return (
    <div style={{
      position: "fixed",
      bottom: 40,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000
    }}>
      <button
        onClick={onStartRest}
        style={{
          background: "#d9d9d9",
          border: "3px solid #111",
          padding: "10px 20px",
          fontFamily: "monospace",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Press [E] to Rest
      </button>
    </div>
  );
}
