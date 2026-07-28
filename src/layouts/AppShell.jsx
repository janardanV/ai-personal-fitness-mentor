import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { logOut as firebaseLogOut } from "../firebase/auth";
import AuthModal from "../components/AuthModal";
import { Button } from "../components/ui";

const PAGES = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", group: "main" },
  { id: "workout", label: "Workouts", icon: "Dumbbell", group: "training" },
  { id: "running", label: "Running", icon: "PersonRunning", group: "training" },
  { id: "programs", label: "Programs", icon: "ClipboardList", group: "training" },
  { id: "nutrition", label: "Nutrition", icon: "Apple", group: "health" },
  { id: "recovery", label: "Recovery", icon: "Heart", group: "health" },
  { id: "bodyweight", label: "Body Weight", icon: "Weight", group: "health" },
  { id: "progress", label: "Progress", icon: "ChartBar", group: "analytics" },
  { id: "coach", label: "AI Coach", icon: "Bot", group: "analytics" },
  { id: "settings", label: "Settings", icon: "Settings", group: "account" },
  { id: "profile", label: "Profile", icon: "User", group: "account" },
];

const ICONS = {
  LayoutDashboard: "◧",
  Dumbbell: "▤",
  PersonRunning: "▸",
  ClipboardList: "☰",
  Apple: "◈",
  Heart: "♥",
  Weight: "⊙",
  ChartBar: "▦",
  Bot: "◆",
  Settings: "⚙",
  User: "◉",
};

const GROUPS = [
  { key: "main", label: "" },
  { key: "training", label: "Training" },
  { key: "health", label: "Health" },
  { key: "analytics", label: "Analytics" },
  { key: "account", label: "Account" },
];

function NavIcon({ icon }) {
  return (
    <span style={{
      width: 20, textAlign: "center", flexShrink: 0,
      fontSize: 15, color: "inherit",
    }}>
      {ICONS[icon] || "◈"}
    </span>
  );
}

export default function AppShell({ children, page, state, dispatch, streak, hideSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem("sf_sidebar");
      if (v !== null) setSidebarOpen(JSON.parse(v));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("sf_sidebar", JSON.stringify(sidebarOpen)); } catch {}
  }, [sidebarOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (accountMenuOpen && menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest("[data-avatar]")) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [accountMenuOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") { setAccountMenuOpen(false); setLogoutOpen(false); } };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    try { await firebaseLogOut(); } catch {}
    try { localStorage.removeItem("sf_state"); } catch {}
    setLogoutOpen(false);
    window.location.href = "/dashboard";
  };

  const currentLabel = PAGES.find(p => p.id === page)?.label || "Dashboard";
  const initials = (user?.displayName || state?.profile?.name || "U")[0]?.toUpperCase() || "U";

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} onAuthSuccess={() => setAuthModalOpen(false)} />

      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: sidebarOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed)" }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          flexShrink: 0,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-light)",
          display: "flex", flexDirection: "column",
          overflow: "hidden", position: "fixed", top: 0, left: 0, bottom: 0,
          zIndex: 30,
        }}
      >
        {/* Logo */}
        <div style={{
          padding: "var(--space-4) var(--space-3)",
          borderBottom: "1px solid var(--border-light)",
          display: "flex", alignItems: "center", gap: 10, minHeight: 60,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--radius-lg)",
            background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0,
          }}>
            <span style={{ color: "var(--accent)" }}>◧</span>
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: 15, fontWeight: 800, whiteSpace: "nowrap",
                  letterSpacing: "-0.02em",
                  background: "linear-gradient(135deg, var(--accent), var(--green))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                FIT
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <div style={{
          padding: "6px 12px",
          display: "flex", justifyContent: sidebarOpen ? "flex-end" : "center",
        }}>
          <button
            onClick={() => setSidebarOpen(p => !p)}
            title={sidebarOpen ? "Collapse" : "Expand"}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            style={{
              background: "transparent", color: "var(--text-tertiary)", fontSize: 14,
              padding: 4, borderRadius: "var(--radius-sm)",
              border: "none", cursor: "pointer",
              width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "color var(--duration-fast)",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary)"}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1, overflowY: "auto",
          padding: "4px 8px",
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {GROUPS.map(group => {
            const items = PAGES.filter(p => p.group === group.key);
            if (!items.length) return null;
            return (
              <div key={group.key} style={{ marginBottom: 4 }}>
                {sidebarOpen && group.label && (
                  <div style={{
                    fontSize: 10, fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    padding: "8px 10px 4px",
                  }}>
                    {group.label}
                  </div>
                )}
                {items.map(p => {
                  const isActive = page === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => navigate("/" + p.id)}
                      title={sidebarOpen ? p.label : p.label}
                      aria-label={p.label}
                      aria-current={isActive ? "page" : undefined}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "9px 10px",
                        borderRadius: "var(--radius-md)",
                        background: isActive ? "var(--accent-dim)" : "transparent",
                        border: isActive ? "1px solid var(--accent-border)" : "1px solid transparent",
                        color: isActive ? "var(--accent)" : "var(--text-secondary)",
                        fontSize: "var(--text-base)", fontWeight: isActive ? 600 : 400,
                        cursor: "pointer", textAlign: "left",
                        transition: "all var(--duration-fast) var(--ease-in-out)",
                        position: "relative",
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg-hover)"; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      {isActive && sidebarOpen && (
                        <div style={{
                          position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)",
                          width: 3, height: 18, borderRadius: 2,
                          background: "var(--accent)",
                        }} />
                      )}
                      <NavIcon icon={p.icon} />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            style={{ whiteSpace: "nowrap", overflow: "hidden" }}
                          >
                            {p.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom user area */}
        <div style={{
          padding: sidebarOpen ? "var(--space-4)" : "var(--space-2)",
          borderTop: "1px solid var(--border-light)",
        }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div data-avatar
                onClick={() => setAccountMenuOpen(p => !p)}
                style={{
                  width: 32, height: 32, borderRadius: "var(--radius-md)",
                  background: "var(--accent)", color: "var(--text-inverse)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              {sidebarOpen && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.displayName || state?.profile?.name || "User"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                    Lv.{state?.level || 1} · {state?.xp || 0} XP
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button variant="secondary" size="sm" fullWidth onClick={() => setAuthModalOpen(true)}>
              Sign In
            </Button>
          )}
        </div>
      </motion.aside>

      {/* Account Menu */}
      <AnimatePresence>
        {accountMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", bottom: 70, left: sidebarOpen ? 20 : 8,
              minWidth: 220,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-3xl)",
              padding: 8,
              boxShadow: "var(--shadow-xl)",
              zIndex: 100,
            }}
          >
            <button onClick={() => { navigate("/profile"); setAccountMenuOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 12px", borderRadius: "var(--radius-lg)",
                background: "none", border: "none", color: "var(--text-secondary)",
                fontSize: "var(--text-base)", cursor: "pointer", textAlign: "left",
                transition: "background var(--duration-fast)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <span>◉</span>
              <span>Profile</span>
            </button>
            <button onClick={() => { navigate("/settings"); setAccountMenuOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 12px", borderRadius: "var(--radius-lg)",
                background: "none", border: "none", color: "var(--text-secondary)",
                fontSize: "var(--text-base)", cursor: "pointer", textAlign: "left",
                transition: "background var(--duration-fast)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <span>⚙</span>
              <span>Settings</span>
            </button>
            <div style={{ height: 1, background: "var(--border-subtle)", margin: "4px 8px" }} />
            <button onClick={() => setLogoutOpen(true)}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 12px", borderRadius: "var(--radius-lg)",
                background: "none", border: "none", color: "var(--red)",
                fontSize: "var(--text-base)", cursor: "pointer", textAlign: "left",
                transition: "background var(--duration-fast)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--red-dim)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <span>←</span>
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Modal */}
      <AnimatePresence>
        {logoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
              padding: 20,
            }}
            onClick={() => setLogoutOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: 400, width: "100%",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-4xl)",
                padding: "var(--space-8)",
                textAlign: "center",
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: "var(--radius-xl)",
                background: "var(--red-dim)", border: "1px solid rgba(255,71,87,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, margin: "0 auto 16px", color: "var(--red)",
              }}>
                ←
              </div>
              <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Sign Out</h3>
              <p style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
                You'll continue as a guest. Your data stays on this device.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <Button variant="secondary" onClick={() => setLogoutOpen(false)}>Cancel</Button>
                <Button variant="danger" onClick={handleLogout}>Sign Out</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div style={{
        flex: 1, marginLeft: sidebarOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed)",
        display: "flex", flexDirection: "column", minHeight: "100vh",
        transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {/* Top Bar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 28px",
          background: "rgba(10,10,10,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-light)",
          minHeight: 56,
        }}>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)" }}>
            {currentLabel}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!user && (
              <Button variant="secondary" size="sm" onClick={() => setAuthModalOpen(true)}>
                Sign In
              </Button>
            )}
            {streak !== undefined && (
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: "var(--radius-md)",
                background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
                fontSize: "var(--text-sm)", color: "var(--accent)", fontWeight: 600,
              }}>
                <span>▸</span>
                <span>{streak} day</span>
              </div>
            )}
            {user && (
              <div data-avatar
                onClick={() => setAccountMenuOpen(p => !p)}
                style={{
                  width: 36, height: 36, borderRadius: "var(--radius-lg)",
                  background: "var(--accent)", color: "var(--text-inverse)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  border: accountMenuOpen ? "2px solid var(--accent)" : "2px solid transparent",
                  transition: "border-color var(--duration-fast)",
                }}
              >
                {initials}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 24 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
