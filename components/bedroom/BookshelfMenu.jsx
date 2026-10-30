"use client";

import { useState } from "react";
import { BOOKS } from "@/data/bookshelfContent";

export default function BookshelfMenu({ visible, onClose }) {
  const [selectedBook, setSelectedBook] = useState(null);
  
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
        width: 500,
        maxWidth: "90%",
        padding: 20,
        maxHeight: "80%",
        overflowY: "auto"
      }}>
        {!selectedBook ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 16, fontSize: 18, fontWeight: "bold" }}>
              BOOKSHELF
            </div>
            {BOOKS.map((book) => (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book)}
                style={{
                  width: "100%",
                  background: "#cfcfcf",
                  border: "2px solid #111",
                  color: "#111",
                  padding: "10px",
                  marginBottom: 8,
                  cursor: "pointer",
                  fontFamily: "monospace",
                  textAlign: "left",
                  fontWeight: "bold"
                }}
              >
                📚 {book.title}
              </button>
            ))}
            <button
              onClick={onClose}
              style={{
                width: "100%",
                background: "#cfcfcf",
                border: "2px solid #111",
                color: "#111",
                padding: "8px",
                cursor: "pointer",
                fontFamily: "monospace",
                marginTop: 8
              }}
            >
              CLOSE
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 12, fontSize: 16, fontWeight: "bold" }}>
              {selectedBook.title}
            </div>
            <div style={{
              background: "#fff",
              border: "2px solid #111",
              padding: 12,
              marginBottom: 12,
              fontSize: 12,
              lineHeight: 1.6,
              minHeight: 150
            }}>
              {selectedBook.content}
            </div>
            <button
              onClick={() => setSelectedBook(null)}
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
              BACK TO BOOKS
            </button>
          </>
        )}
      </div>
    </div>
  );
}
