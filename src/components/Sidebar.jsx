import { useState, useEffect } from "react";
import {
  LayoutDashboard, Dumbbell, BookOpen, ClipboardList, Footprints, CalendarRange,
  Apple, UtensilsCrossed, Droplets, Weight, HeartPulse, BarChart3, Target, Trophy,
  Bot, FileDown, Activity, Menu, ChevronLeft, ChevronRight,
} from "lucide-react";

const MOBILE_BREAKPOINT = 768;

const NAV = [
  { label: "", items: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { label: "Training", items: [
    { id: "workout", label: "Workouts", icon: Dumbbell },
    { id: "exercise-library", label: "Exercise Library", icon: BookOpen },
    { id: "planner", label: "Workout Planner", icon: ClipboardList },
    { id: "running", label: "Running", icon: Footprints },
    { id: "programs", label: "Programs", icon: CalendarRange },
  ]},
  { label: "Health", items: [
    { id: "nutrition", label: "Nutrition", icon: Apple },
    { id: "smart-nutrition", label: "Smart Nutrition", icon: UtensilsCrossed },
    { id: "water-tracker", label: "Water Tracker", icon: Droplets },
    { id: "bodyweight", label: "Body Weight", icon: Weight },
    { id: "recovery", label: "Recovery", icon: HeartPulse },
  ]},
  { label: "Analytics", items: [
    { id: "progress", label: "Progress", icon: BarChart3 },
    { id: "goals", label: "Goals", icon: Target },
    { id: "achievements", label: "Achievements", icon: Trophy },
  ]},
  { label: "Tools", items: [
    { id: "coach", label: "AI Coach", icon: Bot },
    { id: "export", label: "Export Reports", icon: FileDown },
  ]},
];

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

  const sidebarWidth = isMobile ? (sidebarOpen ? 260 : 0) : (sidebarOpen ? 244 : 68);

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
          aria-label="Open menu"
          style={{
            position: "fixed", top: 12, left: 12, zIndex: 18,
            width: 38, height: 38, borderRadius: 12,
            background: "#111111", border: "1px solid rgba(255,255,255,0.08)",
            color: "#C8FF00", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <Menu size={18} />
        </button>
      )}
      <div style={{
        width: sidebarWidth, flexShrink: 0, background: "#0D0D0D",
        borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden",
        position: isMobile ? "fixed" : "relative", zIndex: 20, top: 0, left: 0, bottom: 0,
      }}>

        {/* Brand */}
        <div style={{ padding: "18px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10, minHeight: 64 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#C8FF00" }}>
            <Activity size={20} />
          </div>
          {sidebarOpen && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF", whiteSpace: "nowrap", letterSpacing: "-0.02em", lineHeight: 1.2 }}>AI Fitness</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#C8FF00", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 1 }}>Mentor</div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <div style={{ padding: "6px 12px", display: "flex", justifyContent: sidebarOpen ? "flex-end" : "center" }}>
          <button onClick={onToggle} title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} style={{
            background: "transparent", color: "rgba(255,255,255,0.35)", fontSize: 14,
            padding: 4, borderRadius: 8, border: "none", cursor: "pointer", transition: "all 0.2s",
            width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "#C8FF00"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "4px 10px 12px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {NAV.map(group => (
            <div key={group.label || "main"} style={{ marginBottom: 14 }}>
              {sidebarOpen && group.label && (
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.32)", textTransform: "uppercase", letterSpacing: "0.12em", padding: "6px 10px 6px", }}>
                  {group.label}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {group.items.map(p => {
                  const isActive = page === p.id;
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      className="dash-sidebar-btn"
                      onClick={() => handleNavigate(p.id)}
                      title={sidebarOpen ? p.label : p.label}
                      aria-label={p.label}
                      aria-current={isActive ? "page" : undefined}
                      style={{
                        display: "flex", alignItems: "center", gap: 11,
                        width: "100%", padding: "9px 12px",
                        borderRadius: 10, position: "relative",
                        background: isActive ? "rgba(200,255,0,0.07)" : "transparent",
                        border: isActive ? "1px solid rgba(200,255,0,0.14)" : "1px solid transparent",
                        color: isActive ? "#C8FF00" : "rgba(255,255,255,0.55)",
                        fontSize: 13, fontWeight: isActive ? 600 : 500,
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.15s ease",
                        justifyContent: sidebarOpen ? "flex-start" : "center",
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "#FFFFFF"; } }}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; } }}
                    >
                      {isActive && (
                        <span style={{ position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: 2, background: "#C8FF00", boxShadow: "0 0 10px rgba(200,255,0,0.6)" }} />
                      )}
                      <Icon size={17} style={{ flexShrink: 0 }} />
                      {sidebarOpen && <span style={{ whiteSpace: "nowrap", overflow: "hidden" }}>{p.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {sidebarOpen && footer}
      </div>
    </>
  );
}
