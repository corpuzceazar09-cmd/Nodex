"use client";

import { useState } from "react";
import { getDailyPrograms } from "@/data/televisionPrograms";

export default function TelevisionMenu({ visible, onClose }) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const programs = getDailyPrograms();
  
  if (!visible) return null;
  
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      fontFamily: "monospace"
    }}>
      <div style={{
        background: "#1a1a2e",
        border: "4px solid #4a4a4a",
        width: 400,
        maxWidth: "90%",
        padding: 20,
        color: "#00ff00",
        imageRendering: "pixelated"
      }}>
        {!selectedProgram ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 16, fontSize: 18, fontWeight: "bold" }}>
              NODEX TV
            </div>
            <div style={{ marginBottom: 16, fontSize: 11, textAlign: "center", color: "#ffff00" }}>
              TODAY'S PROGRAMMING
            </div>
            {programs.map((prog, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedProgram(prog)}
                style={{
                  width: "100%",
                  background: "#0f0f23",
                  border: "2px solid #333",
                  color: "#00ff00",
                  padding: "10px",
                  marginBottom: 8,
                  cursor: "pointer",
                  fontFamily: "monospace",
                  textAlign: "left",
                  fontSize: 12
                }}
                onMouseOver={(e) => e.target.style.background = "#16213e"}
                onMouseOut={(e) => e.target.style.background = "#0f0f23"}
              >
                {idx + 1}. {prog.title}
              </button>
            ))}
            <button
              onClick={onClose}
              style={{
                width: "100%",
                background: "#2d1b1b",
                border: "2px solid #ff4444",
                color: "#ff4444",
                padding: "8px",
                cursor: "pointer",
                fontFamily: "monospace",
                marginTop: 8
              }}
            >
              EXIT
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 12, fontSize: 16, fontWeight: "bold", color: "#ffff00" }}>
              {selectedProgram.title}
            </div>
            <div style={{
              background: "#000",
              border: "2px solid #333",
              padding: 12,
              minHeight: 120,
              marginBottom: 12,
              fontSize: 11,
              lineHeight: 1.5,
              color: "#00ff00"
            }}>
              {selectedProgram.content}
            </div>
            <button
              onClick={() => setSelectedProgram(null)}
              style={{
                width: "100%",
                background: "#0f0f23",
                border: "2px solid #333",
                color: "#00ff00",
                padding: "8px",
                cursor: "pointer",
                fontFamily: "monospace"
              }}
            >
              BACK TO CHANNELS
            </button>
          </>
        )}
      </div>
    </div>
  );
}
