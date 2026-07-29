import { useState, useEffect } from "react";
import { PAGES, SIDEBAR_GROUPS } from "../utils/helpers";

const MOBILE_BREAKPOINT = 768;

export default function Sidebar({ sidebarOpen, onToggle, page, onNavigate, footer }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleNavigate = (id) => {
    onNavigate(id);
    if (isMobile) onToggle();
  };

  const sidebarWidth = isMobile ? (sidebarOpen ? 260 : 0) : (sidebarOpen ? 240 : 68);

  return (
    <>
      {isMobile && sidebarOpen && (
        <div
          onClick={onToggle}
          style={{
            position: "fixed", inset: 0, zIndex: 19,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          }}
        />
      )}
      {isMobile && !sidebarOpen && (
        <button
          onClick={onToggle}
          style={{
            position: "fixed", top: 12, left: 12, zIndex: 18,
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(200,255,0,0.08)", border: "1px solid rgba(200,255,0,0.15)",
            color: "#C8FF00", fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          aria-label="Open menu"
        >☰</button>
      )}
      <div style={{
        width: sidebarWidth, flexShrink: 0, background: "#0F0F0F",
        borderRight: "1px solid rgba(200,255,0,0.06)", display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden",
        position: isMobile ? "fixed" : "relative", zIndex: 20, top: 0, left: 0, bottom: 0,
      }}>
      <div style={{ padding: "16px 12px", borderBottom: "1px solid rgba(200,255,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚡</div>
        {sidebarOpen && <span style={{ fontSize: 15, fontWeight: 800, background: "linear-gradient(135deg, #C8FF00, #A5E600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>AI Fitness</span>}
      </div>
      <div style={{ padding: "8px 12px", display: "flex", justifyContent: sidebarOpen ? "flex-end" : "center" }}>
        <button onClick={onToggle} title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} style={{
          background: "rgba(200,255,0,0.06)", color: "#A0A0A0", fontSize: 14,
          padding: 7, borderRadius: 8, border: "1px solid rgba(200,255,0,0.08)", transition: "all 0.2s",
          width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,255,0,0.12)"; e.currentTarget.style.color = "#C8FF00"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(200,255,0,0.06)"; e.currentTarget.style.color = "#A0A0A0"; }}
        >{sidebarOpen ? "◀" : "▶"}</button>
      </div>

      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 0, overflowY: "auto" }}>
        {SIDEBAR_GROUPS.map(g => {
          const items = PAGES.filter(p => p.group === g.key);
          if (!items.length) return null;
          return (
            <div key={g.key} className="dash-sidebar-group">
              {sidebarOpen && g.label && <div className="dash-sidebar-label">{g.label}</div>}
              {items.map(p => (
                <button key={p.id} className={`dash-sidebar-btn ${page === p.id ? "active" : ""}`} onClick={() => handleNavigate(p.id)}>
                  <span className="nav-icon">{p.icon}</span>
                  {sidebarOpen && <span>{p.label}</span>}
                </button>
              ))}
            </div>
          );
        })}
      </nav>

      {sidebarOpen && footer}
    </div>
    </>
  );
}
