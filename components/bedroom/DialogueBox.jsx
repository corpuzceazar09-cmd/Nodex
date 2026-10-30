"use client";

import { useEffect, useState } from "react";

export default function DialogueBox({ dialogue = [], currentIndex = 0, onNext, onComplete,
  onGender, onName, onConfirm, nameValue = "", selectedGender = "boy", visible = false }) {
  const currentLine = dialogue[currentIndex];
  const [shownText, setShownText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [error, setError] = useState("");
  const mode = currentLine?.mode;

  useEffect(() => {
    if (!visible || !currentLine) { setShownText(""); setIsTyping(false); return; }
    const text = currentLine.text;
    setShownText("");
    setIsTyping(true);
    setError("");
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setShownText(text.slice(0, index));
      if (index >= text.length) { setIsTyping(false); clearInterval(timer); }
    }, 25);
    return () => clearInterval(timer);
  }, [visible, currentIndex, currentLine?.text]);

  useEffect(() => { if (mode === "name") setDraftName(nameValue); }, [mode, nameValue]);

  const advance = () => {
    if (!currentLine) return;
    if (isTyping) { setShownText(currentLine.text); setIsTyping(false); return; }
    if (mode) return; // selection requires an actual answer
    if (currentIndex === dialogue.length - 1) onComplete();
    else onNext();
  };

  useEffect(() => {
    if (!visible) return;
    const handleKey = e => {
      if (mode || e.target instanceof HTMLElement && e.target.closest("input,textarea,select,button")) return;
      if (["Enter", " ", "e", "E"].includes(e.key) && !e.repeat) {
        e.preventDefault(); advance();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (!visible || !currentLine) return null;
  const actionStyle = { border: "3px solid #252037", background: "#fff", padding: "9px 16px", color: "#231f30", fontFamily: "inherit", fontSize: 14, cursor: "pointer", fontWeight: 700 };
  const submitName = e => {
    e.preventDefault();
    const safeName = draftName.trim().replace(/\s+/g, " ").slice(0, 16);
    if (!safeName) { setError("Please enter your name."); return; }
    onName(safeName);
  };
  return (
    <div role="dialog" aria-modal="true" aria-label="NODEX guide conversation" style={{
      position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", width: "min(660px, 94vw)",
      background: "#f4eddb", border: "5px solid #292235", boxShadow: "6px 6px 0 #0c0c14",
      padding: 18, fontFamily: "monospace", zIndex: 1500, color: "#242031"
    }}>
      <div style={{ fontWeight: 900, color: "#514097", fontSize: 15, marginBottom: 10 }}>{currentLine.speaker}</div>
      <div aria-live="polite" style={{ minHeight: 46, fontSize: 16, lineHeight: 1.55 }}>{shownText}{isTyping ? "▌" : ""}</div>
      {!isTyping && mode === "gender" && <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        {["boy", "girl"].map(option => <button key={option} type="button" autoFocus={option === selectedGender} style={{ ...actionStyle, background: selectedGender === option ? "#dcd7fc" : "#fff" }} onClick={() => onGender(option)}>{option === "boy" ? "Boy" : "Girl"}</button>)}
      </div>}
      {!isTyping && mode === "name" && <form onSubmit={submitName} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        <input aria-label="Your player name" autoFocus maxLength={16} value={draftName} onChange={e => { setDraftName(e.target.value); setError(""); }} placeholder="Enter your name" style={{ ...actionStyle, minWidth: 180, flex: 1, fontWeight: 400 }} />
        <button type="submit" style={actionStyle}>Confirm name</button>
        {error && <div role="alert" style={{ width: "100%", color: "#b32935" }}>{error}</div>}
      </form>}
      {!isTyping && mode === "confirm" && <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button style={actionStyle} onClick={() => onConfirm(true)}>Yes, that's me!</button>
        <button style={actionStyle} onClick={() => onConfirm(false)}>No, change it</button>
      </div>}
      {(!mode || isTyping) && <button type="button" onClick={advance} style={{ ...actionStyle, display: "block", marginLeft: "auto", marginTop: 10 }}>
        {isTyping ? "Show text" : currentIndex === dialogue.length - 1 ? "Finish ▶" : "Next ▶"}
      </button>}
    </div>
  );
}
