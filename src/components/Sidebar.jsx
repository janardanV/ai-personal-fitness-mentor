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
            background: "rgba(5,7,10,0.7)", backdropFilter: "blur(6px)",
          }}
        />
      )}
      {isMobile && !sidebarOpen && (
        <button
          onClick={onToggle}
          aria-label="Open menu"
          className="rd-icon-btn"
          style={{
            position: "fixed", top: 12, left: 12, zIndex: 18,
            background: "var(--surface-2)", color: "var(--accent)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <Menu size={18} />
        </button>
      )}
      <div style={{
        width: sidebarWidth, flexShrink: 0,
        background: "linear-gradient(180deg, rgba(28,36,48,0.78) 0%, rgba(20,26,34,0.88) 100%)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "inset -1px 0 0 rgba(255,255,255,0.03), 12px 0 44px rgba(0,0,0,0.18)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden",
        position: isMobile ? "fixed" : "relative", zIndex: 20, top: 0, left: 0, bottom: 0,
      }}>

        {/* Brand */}
        <div style={{ padding: "18px 14px 14px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10, minHeight: 64 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--accent)", color: "#0B0F14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 6px 20px rgba(200,255,50,0.25)" }}>
            <Activity size={20} strokeWidth={2.4} />
          </div>
          {sidebarOpen && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", whiteSpace: "nowrap", letterSpacing: "-0.02em", lineHeight: 1.2 }}>AI Fitness</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 1 }}>Mentor</div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <div style={{ padding: "6px 12px", display: "flex", justifyContent: sidebarOpen ? "flex-end" : "center" }}>
          <button onClick={onToggle} title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} className="rd-icon-btn" style={{ width: 26, height: 26, background: "transparent", border: "none" }}>
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "4px 10px 12px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {NAV.map(group => (
            <div key={group.label || "main"} className="dash-sidebar-group" style={{ marginBottom: 14 }}>
              {sidebarOpen && group.label && (
                <div className="dash-sidebar-label">
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
                      className={`dash-sidebar-btn${isActive ? " active" : ""}`}
                      onClick={() => handleNavigate(p.id)}
                      title={p.label}
                      aria-label={p.label}
                      aria-current={isActive ? "page" : undefined}
                      style={{
                        position: "relative",
                        justifyContent: sidebarOpen ? "flex-start" : "center",
                      }}
                    >
                      <span className="nav-pill" />
                      <span className="nav-accent" />
                      <Icon size={18} strokeWidth={isActive ? 2.4 : 2} style={{ flexShrink: 0 }} />
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
