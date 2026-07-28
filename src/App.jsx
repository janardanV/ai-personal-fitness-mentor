import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import React from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import RunningMode from "./RunningMode";
import { useAuth } from "./hooks/useAuth";
import { getUserData, saveUserData, createUserDocument } from "./services/profileService";
import { logOut as firebaseLogOut } from "./firebase/auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import AuthModal from "./components/AuthModal";
import ExerciseLibrary from "./components/ExerciseLibrary";
import WorkoutPlanner from "./components/WorkoutPlanner";
import SmartNutrition from "./components/SmartNutrition";
import WaterTracker from "./components/WaterTracker";
import BodyCalculator from "./components/BodyCalculator";
import GoalManager from "./components/GoalManager";
import Achievements from "./components/Achievements";
import NotificationCenter from "./components/NotificationCenter";
import ExportReports from "./components/ExportReports";
import AdminDashboard from "./components/AdminDashboard";
import SettingsPage from "./components/Settings";
import { fmt, today, weekAgo, uid, EXERCISE_DB, EXERCISES, MUSCLE_GROUPS, EQUIPMENT_TYPES, EXERCISE_CATEGORIES, GOAL_LABELS, BADGE_DEFS, COLORS, SAVE_ACTIONS, GUEST_PROFILE, USDA_API_KEY, USDA_BASE, usdaSearch, usdaDebouncedSearch, ACTIVITY_MULTIPLIERS, mkInitial, calcE1RM, calcVolume, calcWeeklyVolume, calcStreak, G_STYLE, GlobalStyles, MOCK_DELAY, pick, MOCK_COACHING, generateMockResponse, callAIProvider, useAICoach, buildUserContext, buildSystemPrompt, renderMarkdown, formatChatTime, PAGES, SIDEBAR_GROUPS, reducer, showToast, showConfirm, Toast, ConfirmDialog } from "./utils/helpers";

import Dashboard from "./pages/Dashboard";
import WorkoutHub from "./pages/WorkoutHub";
import Nutrition from "./pages/Nutrition";
import Recovery from "./pages/Recovery";
import Programs from "./pages/Programs";
import Progress from "./pages/Progress";
import BodyWeightLog from "./pages/BodyWeightLog";
import AIChat from "./pages/AIChat";
import ProfilePage from "./pages/ProfilePage";
import Onboarding from "./pages/Onboarding";
import AccountMenu from "./components/AccountMenu";
export default function App() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [appState, appDispatch] = React.useReducer(reducer, null, mkInitial);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { const v = localStorage.getItem("ai_fitness_sidebar"); return v !== null ? JSON.parse(v) : true; } catch { return true; }
  });
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const pendingActionRef = useRef(null);
  const prevLevelRef = React.useRef(appState.level);
  const saveTimerRef = useRef(null);

  // ── Load user data from Firestore on auth ──
  useEffect(() => {
    if (!user) { setDataLoaded(false); return; }
    let cancelled = false;
    const loadData = async () => {
      try {
        const data = await getUserData(user.uid);
        if (!cancelled && data) {
          appDispatch({ type: "LOAD_DATA", payload: data });
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
      } finally {
        if (!cancelled) setDataLoaded(true);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, [user?.uid]);

  // ── Debounce-save to Firestore on state changes ──
  useEffect(() => {
    if (!user || !dataLoaded || !appState.profile) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveUserData(user.uid, appState).catch((err) =>
        console.error("Failed to save user data:", err)
      );
    }, 1500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [appState, user, dataLoaded]);

  // Execute pending action after auth + data loaded
  useEffect(() => {
    if (user && dataLoaded && pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      appDispatch(action);
    }
  }, [user, dataLoaded]);

  // Expose setPage for Dashboard quick actions
  useEffect(() => {
    window.__setPage = (page) => navigate("/" + page, { replace: false });
    return () => { delete window.__setPage; };
  }, [navigate]);

  // Persist sidebar state
  useEffect(() => { try { localStorage.setItem("ai_fitness_sidebar", JSON.stringify(sidebarOpen)); } catch {} }, [sidebarOpen]);

  // Close account menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (accountMenuOpen && !e.target.closest(".account-menu") && !e.target.closest(".topbar-avatar")) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [accountMenuOpen]);

  // Close account menu on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setAccountMenuOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Detect level ups
  useEffect(() => {
    if (appState.level > prevLevelRef.current) {
      showToast(`Level Up! You're now Level ${appState.level}!`);
    }
    prevLevelRef.current = appState.level;
  }, [appState.level]);

  // Guarded dispatch for guest mode
  const guardedDispatch = useCallback((action) => {
    if (!user && SAVE_ACTIONS.has(action.type)) {
      pendingActionRef.current = action;
      setAuthModalOpen(true);
      return;
    }
    appDispatch(action);
  }, [user, appDispatch]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  // ── All hooks above this line ──

  const authPages = ["/login", "/signup", "/forgot-password"];

  // Auth loading
  if (authLoading) return null;

  // Guest mode — user is not authenticated
  if (!user) {
    // If on auth page, show it
    const onAuthPage = authPages.includes(location.pathname);
    if (onAuthPage) {
      return (
        <>
          <GlobalStyles />
          <Toast />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </>
      );
    }

    // Guest dashboard — use local-only state, guest profile
    const guestProfile = GUEST_PROFILE;
    const guestState = { ...appState, profile: guestProfile };
    const validPageIds = PAGES.map(p => p.id);
    const rawPage = location.pathname.slice(1) || "dashboard";
    const page = validPageIds.includes(rawPage) ? rawPage : "dashboard";

    if (location.pathname !== "/" + page) {
      return <Navigate to={"/" + page} replace />;
    }

    const PageComponent = {
      dashboard: Dashboard, workout: WorkoutHub, session: WorkoutHub, library: WorkoutHub,
      templates: WorkoutHub, history: WorkoutHub, prs: WorkoutHub,
      running: RunningMode,
      nutrition: Nutrition, recovery: Recovery, programs: Programs, progress: Progress,
      bodyweight: BodyWeightLog, coach: AIChat, profile: ProfilePage,
      "exercise-library": ExerciseLibrary, planner: WorkoutPlanner, "smart-nutrition": SmartNutrition,
      "water-tracker": WaterTracker, calculator: BodyCalculator, goals: GoalManager,
      achievements: Achievements, notifications: NotificationCenter, export: ExportReports,
      admin: AdminDashboard, settings: SettingsPage,
    }[page] || Dashboard;

    const streak = calcStreak(guestState.workouts);

    return (
      <>
        <GlobalStyles />
        <Toast />
        <AuthModal open={authModalOpen} onClose={() => { setAuthModalOpen(false); }} onAuthSuccess={handleAuthSuccess} />
        <div style={{ display: "flex", minHeight: "100vh", background: "#0B0B0B" }}>
          {/* Sidebar */}
          <div style={{
            width: sidebarOpen ? 240 : 68, flexShrink: 0, background: "#0F0F0F",
            borderRight: "1px solid rgba(200,255,0,0.06)", display: "flex", flexDirection: "column",
            transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden", position: "relative", zIndex: 20,
          }}>
            <div style={{ padding: "16px 12px", borderBottom: "1px solid rgba(200,255,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚡</div>
              {sidebarOpen && <span style={{ fontSize: 15, fontWeight: 800, background: "linear-gradient(135deg, #C8FF00, #A5E600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>AI Fitness</span>}
            </div>
            <div style={{ padding: "8px 12px", display: "flex", justifyContent: sidebarOpen ? "flex-end" : "center" }}>
              <button onClick={() => setSidebarOpen(p => !p)} title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} style={{
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
                      <button key={p.id} className={`dash-sidebar-btn ${page === p.id ? "active" : ""}`} onClick={() => navigate("/" + p.id)}>
                        <span className="nav-icon">{p.icon}</span>
                        {sidebarOpen && <span>{p.label}</span>}
                      </button>
                    ))}
                  </div>
                );
              })}
            </nav>

            {sidebarOpen && (
              <div style={{ padding: "16px 14px", borderTop: "1px solid rgba(200,255,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(200,255,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#C8FF00" }}>G</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>Guest</div>
                    <div style={{ fontSize: 11, color: "#A0A0A0" }}>Sign in to save</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.1)" }}>
                  <span style={{ fontSize: 14 }}>🔥</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#C8FF00" }}>{streak} day streak</span>
                </div>
              </div>
            )}
          </div>

          {/* Main content */}
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
            <div className="topbar">
              <span className="topbar-title">{PAGES.find(p => p.id === page)?.label || "Dashboard"}</span>
              <div className="topbar-right">
                <button onClick={() => setAuthModalOpen(true)} style={{
                  background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.1)",
                  color: "#A0A0A0", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 500,
                  cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,255,0,0.1)"; e.currentTarget.style.color = "#C8FF00"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(200,255,0,0.06)"; e.currentTarget.style.color = "#A0A0A0"; }}
                >
                  Sign in to sync
                </button>
                <div
                  className={`topbar-avatar ${accountMenuOpen ? "open" : ""}`}
                  onClick={() => setAuthModalOpen(true)}
                  role="button"
                  tabIndex={0}
                  aria-label="Sign in"
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setAuthModalOpen(true); } }}
                >
                  G
                </div>
              </div>
            </div>

            <div style={{ flex: 1, padding: 24 }}>
              <AnimatePresence mode="wait">
                {PageComponent && (
                  <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <PageComponent state={guestState} dispatch={guardedDispatch} page={page} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Authenticated user flow ──

  // Authenticated user landed on auth pages → redirect to dashboard
  if (authPages.includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Data still syncing
  if (!dataLoaded) {
    return (
      <>
        <GlobalStyles />
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          background: "#0B0B0F", flexDirection: "column", gap: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "rgba(200,255,0,0.1)",
            border: "1px solid rgba(200,255,0,0.2)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 24,
          }}>⚡</div>
          <div style={{ color: "#A0A0A0", fontSize: 13 }}>Syncing your data...</div>
        </div>
      </>
    );
  }

  // No profile yet → onboarding
  if (!appState.profile) {
    return (
      <>
        <GlobalStyles />
        <Toast />
        <ConfirmDialog />
        <Onboarding onComplete={(profile) => appDispatch({ type: "COMPLETE_ONBOARDING", payload: profile })} />
      </>
    );
  }

  const validPageIds = PAGES.map(p => p.id);
  const rawPage = location.pathname.slice(1) || "dashboard";
  const page = validPageIds.includes(rawPage) ? rawPage : "dashboard";

  if (location.pathname !== "/" + page) {
    return <Navigate to={"/" + page} replace />;
  }

  const PageComponent = {
    dashboard: Dashboard, workout: WorkoutHub, session: WorkoutHub, library: WorkoutHub,
    templates: WorkoutHub, history: WorkoutHub, prs: WorkoutHub,
    running: RunningMode,
    nutrition: Nutrition, recovery: Recovery, programs: Programs, progress: Progress,
    bodyweight: BodyWeightLog, coach: AIChat, profile: ProfilePage,
    "exercise-library": ExerciseLibrary, planner: WorkoutPlanner, "smart-nutrition": SmartNutrition,
    "water-tracker": WaterTracker, calculator: BodyCalculator, goals: GoalManager,
    achievements: Achievements, notifications: NotificationCenter, export: ExportReports,
    admin: AdminDashboard, settings: SettingsPage,
  }[page] || Dashboard;

  const streak = calcStreak(appState.workouts);

  return (
    <>
      <GlobalStyles />
      <Toast />
      <ConfirmDialog />
      <div style={{ display: "flex", minHeight: "100vh", background: "#0B0B0B" }}>
        {/* Sidebar */}
        <div style={{
          width: sidebarOpen ? 240 : 68, flexShrink: 0, background: "#0F0F0F",
          borderRight: "1px solid rgba(200,255,0,0.06)", display: "flex", flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden", position: "relative", zIndex: 20,
        }}>
          <div style={{ padding: "16px 12px", borderBottom: "1px solid rgba(200,255,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚡</div>
            {sidebarOpen && <span style={{ fontSize: 15, fontWeight: 800, background: "linear-gradient(135deg, #C8FF00, #A5E600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>AI Fitness</span>}
          </div>
          <div style={{ padding: "8px 12px", display: "flex", justifyContent: sidebarOpen ? "flex-end" : "center" }}>
            <button onClick={() => setSidebarOpen(p => !p)} title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} style={{
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
                    <button key={p.id} className={`dash-sidebar-btn ${page === p.id ? "active" : ""}`} onClick={() => navigate("/" + p.id)}>
                      <span className="nav-icon">{p.icon}</span>
                      {sidebarOpen && <span>{p.label}</span>}
                    </button>
                  ))}
                </div>
              );
            })}
          </nav>

          {sidebarOpen && (
            <div style={{ padding: "16px 14px", borderTop: "1px solid rgba(200,255,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(200,255,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#C8FF00" }}>
                  {(user?.displayName || appState.profile?.name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{user?.displayName || appState.profile?.name}</div>
                  <div style={{ fontSize: 11, color: "#A0A0A0" }}>Lv. {appState.level} · {appState.xp} XP</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.1)" }}>
                <span style={{ fontSize: 14 }}>🔥</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#C8FF00" }}>{streak} day streak</span>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
          <div className="topbar">
            <span className="topbar-title">{PAGES.find(p => p.id === page)?.label || "Dashboard"}</span>
            <div className="topbar-right">
              <div
                className={`topbar-avatar ${accountMenuOpen ? "open" : ""}`}
                onClick={() => setAccountMenuOpen(p => !p)}
                role="button"
                tabIndex={0}
                aria-label="Account menu"
                aria-expanded={accountMenuOpen}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setAccountMenuOpen(p => !p); } }}
              >
                {(user?.displayName || appState.profile?.name || "U")[0].toUpperCase()}
              </div>
              {accountMenuOpen && (
                <AccountMenu
                  user={user}
                  profile={appState.profile}
                  level={appState.level}
                  xp={appState.xp}
                  dispatch={appDispatch}
                  onClose={() => setAccountMenuOpen(false)}
                  onNavigate={(p) => navigate("/" + p)}
                />
              )}
            </div>
          </div>

          <div style={{ flex: 1, padding: 24 }}>
            <AnimatePresence mode="wait">
              {PageComponent && (
                <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <PageComponent state={appState} dispatch={appDispatch} page={page} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
