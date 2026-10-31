"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/components/GameProvider";

export default function ComputerBoot({ visible, onComplete }) {
  const router = useRouter();
  const { onboarded } = useGame();
  // First boot: PROF. LOGIC is waiting on the computer. After that, straight to the menu.
  const destination = onboarded ? "/menu" : "/intro";
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    if (!visible) {
      setStage(0);
      return;
    }
    
    const timers = [
      setTimeout(() => setStage(1), 500),   // screen on
      setTimeout(() => setStage(2), 1000),  // loading
      setTimeout(() => setStage(3), 1500),  // nodex logo
      setTimeout(() => {
        setStage(4);
        setTimeout(() => {
          if (onComplete) onComplete();
          router.push(destination);
        }, 800);
      }, 2000)
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, [visible, onComplete, router, destination]);
  
  if (!visible) return null;
  
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      fontFamily: "monospace"
    }}>
      <div style={{
        width: "80%",
        maxWidth: 600,
        height: "60%",
        background: stage >= 1 ? "#001100" : "#000",
        border: "8px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "#00ff00"
      }}>
        {stage === 0 && <div>POWERING ON...</div>}
        {stage === 1 && <div style={{ fontSize: 12 }}>BIOS LOADING...</div>}
        {stage === 2 && (
          <div>
            <div style={{ marginBottom: 10 }}>LOADING NODEX OS...</div>
            <div style={{ 
              width: 200, 
              height: 8, 
              background: "#003300",
              border: "1px solid #00ff00"
            }}>
              <div style={{
                width: "70%",
                height: "100%",
                background: "#00ff00",
                animation: "load 0.5s ease-in-out"
              }} />
            </div>
          </div>
        )}
        {stage >= 3 && (
          <div style={{ textAlign: "center", fontSize: 32, fontWeight: "bold" }}>
            NODEX
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes load {
          from { width: 0%; }
          to { width: 70%; }
        }
      `}</style>
    </div>
  );
}
