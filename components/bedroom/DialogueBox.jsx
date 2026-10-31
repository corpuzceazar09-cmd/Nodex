"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TYPE_SPEED_MS = 25;
// Ignore a second click that lands within this window, so spam-clicking
// can't skip a line the player never got to see.
const CLICK_COOLDOWN_MS = 180;

// Sprite sheets are 180x352: 3 frames x 4 directions, 60x88 per frame.
// `height` is any CSS length; the frame scales from it (pixel-perfect look).
function SpriteFrame({ src, height, frame = 1, row = 0, style }) {
  const h = `(${height})`;
  return (
    <div aria-hidden="true" style={{
      height: `calc${h}`, width: `calc(${h} * 60 / 88)`,
      backgroundImage: `url(${src})`, backgroundRepeat: "no-repeat",
      backgroundSize: `calc(${h} * 180 / 88) calc(${h} * 352 / 88)`,
      backgroundPosition: `calc(${h} * ${-frame * 60} / 88) calc(${h} * ${-row * 88} / 88)`,
      imageRendering: "pixelated", ...style,
    }} />
  );
}

// Full-body character size on the intro screen.
const CHAR_HEIGHT = "min(50dvh, 44vw, 470px)";
const GENDERS = [
  { id: "boy", label: "BOY" },
  { id: "girl", label: "GIRL" },
];

export default function DialogueBox({ dialogue = [], currentIndex = 0, onNext, onComplete,
  onGender, onName, onConfirm, nameValue = "", selectedGender = "boy", visible = false, theme = "classic" }) {
  const currentLine = dialogue[currentIndex];
  const text = currentLine?.text ?? "";
  const [shownLength, setShownLength] = useState(0);
  const [draftName, setDraftName] = useState("");
  const [error, setError] = useState("");
  const [hoverGender, setHoverGender] = useState(null);
  const [walkTick, setWalkTick] = useState(0);
  // Character highlighted on the selection screen (confirmed with a button).
  const [pickedGender, setPickedGender] = useState(selectedGender);
  const timerRef = useRef(null);
  const lastActionRef = useRef(0);
  const mode = currentLine?.mode;
  const isTyping = visible && shownLength < text.length;

  const stopTyping = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // Typewriter. A single interval per line, always cleared before a new one
  // starts and when the player skips — so skipped text never "re-types".
  useEffect(() => {
    stopTyping();
    setShownLength(0);
    setError("");
    if (!visible || !text) return;
    timerRef.current = setInterval(() => {
      setShownLength(length => {
        const next = length + 1;
        if (next >= text.length) stopTyping();
        return Math.min(next, text.length);
      });
    }, TYPE_SPEED_MS);
    return stopTyping;
  }, [visible, currentIndex, text, stopTyping]);

  // Hovered character card plays its walk cycle.
  useEffect(() => {
    if (!hoverGender && mode !== "gender") return;
    const id = setInterval(() => setWalkTick(t => t + 1), 160);
    return () => clearInterval(id);
  }, [hoverGender, mode]);

  useEffect(() => { if (mode === "name") setDraftName(nameValue); }, [mode, nameValue]);
  useEffect(() => { if (mode === "gender") setPickedGender(selectedGender); }, [mode, selectedGender]);

  // Left/right arrows switch characters on the selection screen.
  useEffect(() => {
    if (!visible || mode !== "gender") return;
    const onKey = e => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") setPickedGender("boy");
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") setPickedGender("girl");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, mode]);

  const advance = useCallback(() => {
    if (!currentLine) return;
    const now = performance.now();
    if (now - lastActionRef.current < CLICK_COOLDOWN_MS) return;
    lastActionRef.current = now;
    if (isTyping) { stopTyping(); setShownLength(text.length); return; }
    if (mode) return; // selection steps need a real answer
    if (currentIndex === dialogue.length - 1) onComplete();
    else onNext();
  }, [currentLine, isTyping, stopTyping, text.length, mode, currentIndex, dialogue.length, onComplete, onNext]);

  useEffect(() => {
    if (!visible) return;
    const handleKey = e => {
      if (e.target instanceof HTMLElement && e.target.closest("input,textarea,select,button")) return;
      if (!["Enter", " ", "e", "E"].includes(e.key) || e.repeat) return;
      // While a selection step is still typing, keys may finish the text.
      if (mode && !isTyping) return;
      e.preventDefault(); advance();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [visible, mode, isTyping, advance]);

  if (!visible || !currentLine) return null;
  const actionStyle = { border: "3px solid #252037", background: "#fff", padding: "9px 16px", color: "#231f30", fontFamily: "inherit", fontSize: 14, cursor: "pointer", fontWeight: 700 };
  const submitName = e => {
    e.preventDefault();
    const safeName = draftName.trim().replace(/\s+/g, " ").slice(0, 16);
    if (!safeName) { setError("Please enter your name."); return; }
    onName(safeName);
  };
  const sheet = name => `/assets/bedroom/${theme}/characters/${name}-sheet.png`;

  const genderStep = dialogue.findIndex(line => line.mode === "gender");
  const choosing = mode === "gender" && !isTyping;
  // From the gender question on, the player's character stands on the left.
  const showPlayer = genderStep >= 0 && currentIndex >= genderStep;
  const shownGender = mode === "gender" ? pickedGender : selectedGender;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1500, pointerEvents: "none",
      display: "flex", flexDirection: "column", fontFamily: "monospace" }}>

      {/* ---- Character stage: player choice on the LEFT, professor on the RIGHT ---- */}
      <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex",
        alignItems: "flex-end", justifyContent: "space-between", padding: "0 max(2vw, 8px)" }}>

        {/* Left: the boy/girl characters */}
        <div style={{ position: "relative", display: "flex", alignItems: "flex-end", height: "100%" }}>

          {showPlayer && mode === "gender" && (
            <div role="radiogroup" aria-label="Choose your character"
              style={{ position: "relative", display: "flex", alignItems: "flex-end", pointerEvents: "auto" }}>
              {GENDERS.map((g, i) => {
                const active = pickedGender === g.id;
                const hover = hoverGender === g.id;
                return (
                  <button key={g.id} type="button" role="radio" aria-checked={active} aria-label={g.label}
                    disabled={!choosing}
                    onMouseEnter={() => setHoverGender(g.id)} onMouseLeave={() => setHoverGender(null)}
                    onFocus={() => setHoverGender(g.id)} onBlur={() => setHoverGender(null)}
                    onClick={() => setPickedGender(g.id)}
                    style={{ position: "relative", padding: 0, border: 0, background: "none",
                      cursor: choosing ? "pointer" : "default",
                      // The two characters overlap slightly, like a character-select screen.
                      marginLeft: i === 0 ? 0 : `calc(${CHAR_HEIGHT} * -0.16)`,
                      zIndex: active ? 2 : 1,
                      transform: active ? "translateY(0) scale(1)" : "translateY(-2%) scale(.9)",
                      transformOrigin: "bottom center",
                      filter: active
                        ? "drop-shadow(0 0 14px rgba(140,120,255,.85)) drop-shadow(5px 8px 0 rgba(10,10,20,.35))"
                        : `grayscale(${hover ? .2 : .65}) brightness(${hover ? .95 : .7})`,
                      transition: "transform .18s, filter .18s" }}>
                    <SpriteFrame src={sheet(`player-${g.id}`)} height={CHAR_HEIGHT}
                      frame={active || hover ? [0, 1, 2, 1][walkTick % 4] : 1} />
                    <span style={{ position: "absolute", left: "50%", bottom: -4, transform: "translateX(-50%)",
                      padding: "4px 14px", fontWeight: 900, fontSize: 15, letterSpacing: 2,
                      color: active ? "#fff" : "#231f30", background: active ? "#514097" : "#f4eddb",
                      border: "3px solid #292235", whiteSpace: "nowrap" }}>
                      {active ? "▶ " : ""}{g.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {showPlayer && mode !== "gender" && (
            <div style={{ position: "relative", filter: "drop-shadow(5px 8px 0 rgba(10,10,20,.35))" }}>
              <SpriteFrame src={sheet(`player-${shownGender === "girl" ? "girl" : "boy"}`)} height={CHAR_HEIGHT} />
            </div>
          )}
        </div>

        {/* Right: the professor */}
        <div style={{ position: "relative", display: "flex", alignItems: "flex-end", height: "100%" }}>
          <div style={{ position: "relative", filter: "drop-shadow(-5px 8px 0 rgba(10,10,20,.35))" }}>
            {/* row 1 = facing left, toward the player */}
            <SpriteFrame src={sheet("npc-guide")} height={`${CHAR_HEIGHT} * 1.04`} frame={1} row={1} />
          </div>
        </div>
      </div>

      {/* ---- Dialogue box ---- */}
      <div role="dialog" aria-modal="true" aria-label="Conversation with PROF. LOGIC" style={{
        position: "relative", alignSelf: "center", margin: "0 0 22px", width: "min(820px, 94vw)",
        background: "#f4eddb", border: "5px solid #292235", boxShadow: "6px 6px 0 #0c0c14",
        padding: 18, color: "#242031", pointerEvents: "auto"
      }}>
        <div style={{ fontWeight: 900, color: "#514097", fontSize: 15, marginBottom: 10, textAlign: "right" }}>
          {currentLine.speaker} ◀
        </div>
        <div aria-live="polite" style={{ minHeight: 46, fontSize: 16, lineHeight: 1.55 }}>
          {text.slice(0, shownLength)}{isTyping ? "▌" : ""}
        </div>

        {choosing && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#5c5468" }}>Click a character (or ◀ ▶), then confirm.</span>
            <button type="button" autoFocus style={{ ...actionStyle, marginLeft: "auto", background: "#514097", color: "#fff" }}
              onClick={() => onGender(pickedGender)}>
              Choose {pickedGender === "girl" ? "GIRL" : "BOY"} ▶
            </button>
          </div>
        )}

        {!isTyping && mode === "name" && (
          <form onSubmit={submitName} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <input aria-label="Your player name" autoFocus maxLength={16} value={draftName} onChange={e => { setDraftName(e.target.value); setError(""); }} placeholder="Enter your name" style={{ ...actionStyle, minWidth: 180, flex: 1, fontWeight: 400 }} />
            <button type="submit" style={actionStyle}>Confirm name</button>
            {error && <div role="alert" style={{ width: "100%", color: "#b32935" }}>{error}</div>}
          </form>
        )}

        {!isTyping && mode === "confirm" && (
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button type="button" style={actionStyle} onClick={() => onConfirm(true)}>Yes, that&apos;s me!</button>
            <button type="button" style={actionStyle} onClick={() => onConfirm(false)}>No, change it</button>
          </div>
        )}

        {(!mode || isTyping) && (
          <button type="button" onClick={advance} style={{ ...actionStyle, display: "block", marginLeft: "auto", marginTop: 10 }}>
            {isTyping ? "Skip ▸▸" : currentIndex === dialogue.length - 1 ? "Finish ▶" : "Next ▶"}
          </button>
        )}
      </div>
    </div>
  );
}
