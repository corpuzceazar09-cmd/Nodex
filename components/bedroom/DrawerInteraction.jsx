"use client";

import { useEffect, useState } from "react";
import { DRAWERS } from "@/data/drawerContent";

const READ_FONT = "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif";
const INK = "#2a2233";

// Small pixel-style icons for drawer items (inline SVG, 32x32 grid).
function ItemIcon({ type }) {
  const s = { width: 44, height: 44, flex: "none" };
  const k = "#292235";
  const icons = {
    breadboard: <><rect x="2" y="7" width="28" height="18" fill="#f1f1f1" stroke={k} strokeWidth="2" /><rect x="4" y="9" width="24" height="2" fill="#e05050" /><rect x="4" y="21" width="24" height="2" fill="#4a6ae0" />{[7,11,15,19,23,27].map(x => <g key={x}><rect x={x-1} y="13" width="2" height="2" fill="#777" /><rect x={x-1} y="17" width="2" height="2" fill="#777" /></g>)}</>,
    ic: <><rect x="7" y="8" width="18" height="16" fill="#333" stroke={k} strokeWidth="2" />{[10,14,18,22].map(x => <g key={x}><rect x={x-1} y="4" width="2" height="4" fill="#aaa" /><rect x={x-1} y="24" width="2" height="4" fill="#aaa" /></g>)}<circle cx="11" cy="12" r="1.5" fill="#888" /></>,
    dip: <><rect x="5" y="8" width="22" height="16" fill="#d23c3c" stroke={k} strokeWidth="2" /><rect x="9" y="11" width="5" height="10" fill="#fff" /><rect x="18" y="11" width="5" height="10" fill="#fff" /><rect x="9" y="11" width="5" height="5" fill="#eee" stroke={k} /><rect x="18" y="16" width="5" height="5" fill="#eee" stroke={k} /></>,
    led: <><path d="M10 18 V10 a6 6 0 0 1 12 0 V18 Z" fill="#ff5d5d" stroke={k} strokeWidth="2" /><rect x="8" y="18" width="16" height="3" fill="#ff5d5d" stroke={k} strokeWidth="1.5" /><rect x="12" y="21" width="2" height="9" fill="#aaa" /><rect x="18" y="21" width="2" height="7" fill="#aaa" /></>,
    resistor: <><rect x="1" y="15" width="30" height="2" fill="#aaa" /><rect x="8" y="11" width="16" height="10" rx="3" fill="#e2c18b" stroke={k} strokeWidth="2" /><rect x="11" y="11" width="2" height="10" fill="#8b4513" /><rect x="15" y="11" width="2" height="10" fill="#111" /><rect x="19" y="11" width="2" height="10" fill="#d33" /></>,
    jumper: <><path d="M5 26 C 5 6, 27 6, 27 26" fill="none" stroke="#e05050" strokeWidth="3" /><path d="M9 26 C 9 12, 23 12, 23 26" fill="none" stroke="#2d6cdf" strokeWidth="3" /><rect x="3" y="24" width="4" height="5" fill="#333" /><rect x="25" y="24" width="4" height="5" fill="#333" /></>,
    battery: <><rect x="4" y="9" width="22" height="14" fill="#f0c419" stroke={k} strokeWidth="2" /><rect x="26" y="13" width="3" height="6" fill={k} /><text x="15" y="20" textAnchor="middle" fontSize="8" fontWeight="900" fill={k} fontFamily="monospace">5V</text></>,
    cable: <><path d="M3 22 C 10 4, 20 30, 29 10" fill="none" stroke="#2d6cdf" strokeWidth="5" strokeLinecap="round" /><path d="M3 22 C 10 4, 20 30, 29 10" fill="none" stroke="#7fa6ff" strokeWidth="1.5" strokeDasharray="2 3" /></>,
    rj45: <><rect x="8" y="6" width="16" height="20" fill="#dff1ff" fillOpacity=".8" stroke={k} strokeWidth="2" />{[10,12,14,16,18,20,22].map(x => <rect key={x} x={x-0.5} y="8" width="1" height="6" fill="#c9a227" />)}<rect x="12" y="26" width="8" height="4" fill="#9cc" stroke={k} strokeWidth="1.5" /></>,
    stripper: <><rect x="4" y="18" width="12" height="8" rx="2" fill="#f0c419" stroke={k} strokeWidth="2" /><path d="M16 22 L28 8" stroke={k} strokeWidth="4" /><circle cx="22" cy="15" r="3" fill="#ddd" stroke={k} strokeWidth="1.5" /></>,
    crimper: <><path d="M4 28 L14 14 L18 18 L8 30 Z" fill="#d23c3c" stroke={k} strokeWidth="2" /><path d="M14 14 L24 4 L28 8 L18 18 Z" fill="#888" stroke={k} strokeWidth="2" /><rect x="19" y="8" width="4" height="4" fill="#333" /></>,
    tester: <><rect x="6" y="4" width="20" height="24" rx="2" fill="#3a3a3a" stroke={k} strokeWidth="2" />{[9,12,15,18,21,24].map((y, i) => <circle key={y} cx={i % 2 ? 20 : 12} cy={y - 1} r="1.6" fill={i < 4 ? "#6fd97f" : "#555"} />)}</>,
    chart: <><rect x="5" y="3" width="22" height="26" fill="#fff" stroke={k} strokeWidth="2" />{["#f5a623","#f5a623","#6fd97f","#2d6cdf","#2d6cdf","#6fd97f","#8b5a2b","#8b5a2b"].map((c, i) => <rect key={i} x={8 + i * 2} y="8" width="2" height="16" fill={c} opacity={i % 2 === 0 && i !== 3 ? 0.55 : 1} />)}</>,
  };
  return <svg viewBox="0 0 32 32" style={s} aria-hidden="true" shapeRendering="crispEdges">{icons[type]}</svg>;
}

export default function DrawerInteraction({ visible, onClose }) {
  const [openId, setOpenId] = useState(null);

  useEffect(() => { if (!visible) setOpenId(null); }, [visible]);
  useEffect(() => {
    if (!visible) return;
    const onKey = e => { if (e.key === "Escape") { e.preventDefault(); if (openId) setOpenId(null); else onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, openId, onClose]);

  if (!visible) return null;
  const drawer = DRAWERS.find(d => d.id === openId);
  const btn = { border: "3px solid #292235", background: "#fff", color: INK, padding: "9px 14px",
    fontFamily: "monospace", fontWeight: 800, fontSize: 14, cursor: "pointer" };

  return (
    <div role="dialog" aria-modal="true" aria-label="Drawer" style={{ position: "fixed", inset: 0,
      background: "rgba(8,8,14,.78)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16 }}>
      <div style={{ width: "min(720px, 100%)", maxHeight: "92dvh", overflowY: "auto", background: "#fbf6e9",
        border: "5px solid #292235", boxShadow: "8px 8px 0 #0c0c14", color: INK }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          padding: "12px 18px", background: "#6b4423", color: "#fff7dc", fontFamily: "monospace" }}>
          <strong style={{ fontSize: 18, letterSpacing: 1 }}>{drawer ? `${drawer.label} · ${drawer.title}` : "DRAWER"}</strong>
          <button type="button" onClick={onClose} style={{ ...btn, padding: "6px 10px" }} aria-label="Close drawer">✕</button>
        </div>

        {!drawer && (
          <div style={{ padding: 20 }}>
            <p style={{ margin: "0 0 14px", fontFamily: READ_FONT, fontSize: 16 }}>Which drawer do you want to open?</p>
            {/* Dresser front: two drawers stacked */}
            <div style={{ background: "#c8873e", border: "4px solid #4a2e14", padding: 12, display: "grid", gap: 12,
              maxWidth: 460, margin: "0 auto" }}>
              {DRAWERS.map(d => (
                <button key={d.id} type="button" onClick={() => setOpenId(d.id)}
                  style={{ position: "relative", cursor: "pointer", textAlign: "left", padding: "16px 18px",
                    background: "#e2a65c", border: "4px solid #4a2e14", boxShadow: "inset 0 -5px 0 #b77a36" }}>
                  <span style={{ display: "block", fontFamily: "monospace", fontWeight: 900, fontSize: 13, color: "#4a2e14" }}>{d.label}</span>
                  <span style={{ display: "block", fontFamily: READ_FONT, fontWeight: 800, fontSize: 19, color: INK, marginTop: 2 }}>{d.title}</span>
                  <span aria-hidden="true" style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)",
                    width: 46, height: 10, background: "#fff2c7", border: "3px solid #4a2e14" }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {drawer && (
          <div style={{ padding: 20, borderTop: `6px solid ${drawer.accent}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {drawer.items.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 12,
                  background: "#fff", border: "2px solid #d8cfb8" }}>
                  <ItemIcon type={item.icon} />
                  <div>
                    <div style={{ fontFamily: READ_FONT, fontWeight: 800, fontSize: 16 }}>{item.name}</div>
                    <div style={{ fontFamily: READ_FONT, fontSize: 15, lineHeight: 1.5, color: "#4a4256", marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button type="button" style={btn} onClick={() => setOpenId(null)}>◀ Close drawer</button>
              <button type="button" style={btn} onClick={() => setOpenId(drawer.id === "top" ? "bottom" : "top")}>
                Open {drawer.id === "top" ? "bottom" : "top"} drawer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
