"use client";

export default function DrawerInteraction({ visible, onClose }) {
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
        background: "#d9d9d9",
        border: "4px solid #111",
        width: 400,
        maxWidth: "90%",
        padding: 20
      }}>
        <div style={{ textAlign: "center", marginBottom: 16, fontSize: 18, fontWeight: "bold" }}>
          DRAWER
        </div>
        <div style={{
          background: "#fff",
          border: "2px solid #111",
          padding: 12,
          marginBottom: 12,
          textAlign: "center",
          minHeight: 80
        }}>
          You found some old notes and computer parts.<br/><br/>
          Nothing particularly useful right now, but interesting!
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: "#cfcfcf",
            border: "2px solid #111",
            color: "#111",
            padding: "8px",
            cursor: "pointer",
            fontFamily: "monospace"
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
