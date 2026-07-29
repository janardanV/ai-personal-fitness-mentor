import { useState, useEffect } from "react";
import {
  LayoutDashboard, Dumbbell, BookOpen, ClipboardList, Footprints,
  CalendarRange, UtensilsCrossed, ChefHat, Droplets, Calculator,
  HeartPulse, Scale, Target, Trophy, TrendingUp, BotMessageSquare,
  Bell, FileSpreadsheet, BarChart3, Settings, UserCircle, ChevronLeft,
  ChevronRight, Sparkles
} from "lucide-react";
import { PAGES, SIDEBAR_GROUPS } from "../utils/helpers";

const MOBILE_BREAKPOINT = 768;

const iconMap = {
  dashboard: LayoutDashboard,
  workout: Dumbbell,
  "exercise-library": BookOpen,
  planner: ClipboardList,
  running: Footprints,
  programs: CalendarRange,
  nutrition: UtensilsCrossed,
  "smart-nutrition": ChefHat,
  "water-tracker": Droplets,
  calculator: Calculator,
  recovery: HeartPulse,
  bodyweight: Scale,
  goals: Target,
  achievements: Trophy,
  progress: TrendingUp,
  coach: BotMessageSquare,
  notifications: Bell,
  export: FileSpreadsheet,
  admin: BarChart3,
  settings: Settings,
  profile: UserCircle,
};

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

  const btnBase = {
    display: "flex", alignItems: "center", gap: 12, width: "100%",
    padding: sidebarOpen ? "10px 16px" : "10px 0",
    justifyContent: sidebarOpen ? "flex-start" : "center",
    borderRadius: 8, border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: 500, color: "#A0A0A0",
    background: "transparent", position: "relative",
    transition: "all 0.2s ease",
  };

  const btnActive = {
    ...btnBase,
    background: "rgba(255,255,255,0.06)",
    color: "#FFFFFF",
  };

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
            width: 36, height: 36, borderRadius: 8,
            background: "#141414", border: "1px solid rgba(255,255,255,0.1)",
            color: "#FFFFFF", fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          aria-label="Open menu"
        >☰</button>
      )}
      <div style={{
        width: sidebarWidth, flexShrink: 0, background: "#0A0A0A",
        borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden",
        position: isMobile ? "fixed" : "relative", zIndex: 20, top: 0, left: 0, bottom: 0,
      }}>
        <div style={{
          padding: sidebarOpen ? "20px 12px 16px" : "20px 0 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-start" : "center",
          gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#0A0A0A", flexShrink: 0,
          }}>F</div>
          {sidebarOpen && <span style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>FitAI</span>}
          {sidebarOpen && <Sparkles size={14} color="#22C55E" strokeWidth={1.5} style={{ opacity: 0.6 }} />}
        </div>

        <div style={{
          padding: "4px 12px",
          display: "flex", justifyContent: sidebarOpen ? "flex-end" : "center",
        }}>
          <button
            onClick={onToggle}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            style={{
              background: "transparent", color: "rgba(255,255,255,0.25)", fontSize: 12,
              padding: 4, borderRadius: 6, border: "none", transition: "all 0.2s",
              width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; }}
          >
            {sidebarOpen ? <ChevronLeft size={14} strokeWidth={2} /> : <ChevronRight size={14} strokeWidth={2} />}
          </button>
        </div>

        <nav style={{
          flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column",
          gap: 0, overflowY: "auto", overflowX: "hidden",
        }}>
          {SIDEBAR_GROUPS.map(g => {
            const items = PAGES.filter(p => p.group === g.key);
            if (!items.length) return null;
            return (
              <div key={g.key}>
                {sidebarOpen && g.label && (
                  <div style={{
                    fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.15)",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    padding: "16px 16px 6px", whiteSpace: "nowrap",
                  }}>
                    {g.label}
                  </div>
                )}
                {items.map(p => {
                  const isActive = page === p.id;
                  const IconComponent = iconMap[p.id];
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleNavigate(p.id)}
                      style={isActive ? btnActive : btnBase}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                          e.currentTarget.style.color = "#FFFFFF";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#A0A0A0";
                        }
                      }}
                    >
                      {isActive && (
                        <div style={{
                          position: "absolute", left: 0, top: "50%",
                          transform: "translateY(-50%)",
                          width: 2, height: 20,
                          borderRadius: "0 4px 4px 0",
                          background: "#22C55E",
                        }} />
                      )}
                      <span style={{ flexShrink: 0, display: "flex", opacity: isActive ? 1 : 0.6 }}>
                        {IconComponent && <IconComponent size={18} strokeWidth={1.5} />}
                      </span>
                      {sidebarOpen && (
                        <span style={{ whiteSpace: "nowrap" }}>{p.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {sidebarOpen && footer}
      </div>
    </>
  );
}
