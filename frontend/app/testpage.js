'use client';
import { useState, useRef, useEffect } from "react";

export default function TestPage() {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0" }}>
      <h1>Test Sayfası</h1>
      <button
        style={{ margin: 20, padding: 10, background: "yellow" }}
        onClick={() => alert("Test Butonu Tıklandı!")}
      >
        Test Butonu
      </button>
      <div style={{ position: "relative", display: "inline-block" }} ref={menuRef}>
        <button
          style={{ padding: 10, background: "#007bff", color: "#fff", borderRadius: 4 }}
          onClick={() => setShowMenu(!showMenu)}
        >
          Menü Aç
        </button>
        {showMenu && (
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 0,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 4,
              zIndex: 9999,
              minWidth: 120,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              padding: 8
            }}
          >
            <button onClick={() => alert("Birinci Seçenek")} style={{ display: "block", width: "100%", marginBottom: 4 }}>Birinci Seçenek</button>
            <button onClick={() => alert("İkinci Seçenek")} style={{ display: "block", width: "100%" }}>İkinci Seçenek</button>
          </div>
        )}
      </div>
    </div>
  );
}
