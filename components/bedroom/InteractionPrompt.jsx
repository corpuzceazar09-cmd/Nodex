"use client";

export default function InteractionPrompt({ prompt, x, y, visible }) {
  if (!visible || !prompt) return null;
  
  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y - 30,
      transform: "translateX(-50%)",
      background: "#d9d9d9",
      border: "2px solid #111",
      padding: "4px 8px",
      fontSize: 11,
      fontFamily: "monospace",
      fontWeight: "bold",
      whiteSpace: "nowrap",
      zIndex: 100,
      imageRendering: "pixelated",
      boxShadow: "2px 2px 0px rgba(0,0,0,0.5)"
    }}>
      {prompt}
    </div>
  );
}
