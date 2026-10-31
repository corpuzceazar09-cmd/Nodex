"use client";

import { useEffect, useState } from "react";
import { BOOKS } from "@/data/bookshelfContent";

const READ_FONT = "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif";
const INK = "#2a2233";

export default function BookshelfMenu({ visible, onClose }) {
  const [book, setBook] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => { if (!visible) { setBook(null); setPage(0); } }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = e => {
      if (e.key === "Escape") { e.preventDefault(); if (book) setBook(null); else onClose(); }
      if (!book) return;
      if (e.key === "ArrowRight") setPage(p => Math.min(book.pages.length - 1, p + 1));
      if (e.key === "ArrowLeft") setPage(p => Math.max(0, p - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, book, onClose]);

  if (!visible) return null;
  const btn = { border: "3px solid #292235", background: "#fff", color: INK, padding: "9px 14px",
    fontFamily: "monospace", fontWeight: 800, fontSize: 14, cursor: "pointer" };
  const current = book?.pages[page];

  return (
    <div role="dialog" aria-modal="true" aria-label="Bookshelf" style={{ position: "fixed", inset: 0,
      background: "rgba(8,8,14,.78)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16 }}>
      <div style={{ width: "min(760px, 100%)", maxHeight: "92dvh", overflowY: "auto", background: "#fbf6e9",
        border: "5px solid #292235", boxShadow: "8px 8px 0 #0c0c14", color: INK }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          padding: "12px 18px", background: "#3a2f4d", color: "#fff7dc", fontFamily: "monospace" }}>
          <strong style={{ fontSize: 18, letterSpacing: 1 }}>{book ? book.title : "BOOKSHELF"}</strong>
          <button type="button" onClick={onClose} style={{ ...btn, padding: "6px 10px" }} aria-label="Close bookshelf">✕</button>
        </div>

        {!book && (
          <div style={{ padding: 20, display: "grid", gap: 12 }}>
            <p style={{ margin: 0, fontFamily: READ_FONT, fontSize: 16 }}>Pick a book to read:</p>
            {BOOKS.map(b => (
              <button key={b.id} type="button" onClick={() => { setBook(b); setPage(0); }}
                style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", cursor: "pointer",
                  padding: "12px 14px", background: "#fff", border: "3px solid #292235", boxShadow: "3px 3px 0 #292235" }}>
                <span aria-hidden="true" style={{ width: 16, height: 44, background: b.color, border: "2px solid #292235", flex: "none" }} />
                <span style={{ fontFamily: READ_FONT, fontSize: 18, fontWeight: 700, color: INK }}>{b.title}</span>
                <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 13, color: "#6a6076" }}>{b.pages.length} pages</span>
              </button>
            ))}
          </div>
        )}

        {book && current && (
          <div style={{ padding: "22px 26px 18px", borderLeft: `10px solid ${book.color}` }}>
            <h2 style={{ margin: "0 0 14px", fontFamily: READ_FONT, fontSize: 24, lineHeight: 1.25 }}>{current.heading}</h2>
            {current.body?.map((para, i) => (
              <p key={i} style={{ margin: "0 0 14px", fontFamily: READ_FONT, fontSize: 18, lineHeight: 1.7 }}>{para}</p>
            ))}
            {current.points && (
              <dl style={{ margin: 0, display: "grid", gap: 10 }}>
                {current.points.map(([term, desc]) => (
                  <div key={term} style={{ display: "grid", gridTemplateColumns: "minmax(110px, auto) 1fr", gap: 12,
                    alignItems: "baseline", padding: "10px 12px", background: "#fff", border: "2px solid #d8cfb8" }}>
                    <dt style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 16, color: book.color }}>{term}</dt>
                    <dd style={{ margin: 0, fontFamily: READ_FONT, fontSize: 17, lineHeight: 1.55 }}>{desc}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
              <button type="button" style={btn} onClick={() => setBook(null)}>◀ All books</button>
              <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 14 }}>Page {page + 1} / {book.pages.length}</span>
              <button type="button" style={{ ...btn, opacity: page === 0 ? .4 : 1 }} disabled={page === 0}
                onClick={() => setPage(p => p - 1)}>‹ Prev</button>
              <button type="button" style={{ ...btn, opacity: page === book.pages.length - 1 ? .4 : 1 }}
                disabled={page === book.pages.length - 1} onClick={() => setPage(p => p + 1)}>Next ›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
