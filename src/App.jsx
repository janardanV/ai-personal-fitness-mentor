import { useState, useEffect, useRef, useCallback, useReducer, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import RunningMode from "./RunningMode";
import { useAuth } from "./hooks/useAuth";
import { getUserData, saveUserData, createUserDocument } from "./services/profileService";
import { logOut as firebaseLogOut } from "./firebase/auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import AuthModal from "./components/AuthModal";
import { fmt, today, weekAgo, uid, EXERCISE_DB, EXERCISES, MUSCLE_GROUPS, EQUIPMENT_TYPES, EXERCISE_CATEGORIES, GOAL_LABELS, BADGE_DEFS, COLORS, SAVE_ACTIONS, GUEST_PROFILE, USDA_API_KEY, USDA_BASE, usdaSearch, usdaDebouncedSearch, ACTIVITY_MULTIPLIERS, mkInitial, calcE1RM, calcVolume, calcWeeklyVolume, calcStreak, G_STYLE, GlobalStyles, MOCK_DELAY, pick, MOCK_COACHING, generateMockResponse, callAIProvider, useAICoach, buildUserContext, buildSystemPrompt, renderMarkdown, formatChatTime, PAGES, SIDEBAR_GROUPS, reducer, showToast, showConfirm, Toast, ConfirmDialog } from "./utils/helpers";

import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import { DashboardSkeleton, Skeleton } from "./components/Skeleton";

const WorkoutHub = lazy(() => import("./pages/WorkoutHub"));
const Nutrition = lazy(() => import("./pages/Nutrition"));
const Recovery = lazy(() => import("./pages/Recovery"));
const Programs = lazy(() => import("./pages/Programs"));
const Progress = lazy(() => import("./pages/Progress"));
const BodyWeightLog = lazy(() => import("./pages/BodyWeightLog"));
const AIChat = lazy(() => import("./pages/AIChat"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AccountMenu = lazy(() => import("./components/AccountMenu"));
const ExerciseLibrary = lazy(() => import("./components/ExerciseLibrary"));
const WorkoutPlanner = lazy(() => import("./components/WorkoutPlanner"));
const SmartNutrition = lazy(() => import("./components/SmartNutrition"));
const WaterTracker = lazy(() => import("./components/WaterTracker"));
const BodyCalculator = lazy(() => import("./components/BodyCalculator"));
const GoalManager = lazy(() => import("./components/GoalManager"));
const Achievements = lazy(() => import("./components/Achievements"));
const NotificationCenter = lazy(() => import("./components/NotificationCenter"));
const ExportReports = lazy(() => import("./components/ExportReports"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const SettingsPage = lazy(() => import("./components/Settings"));
export default function App() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [appState, appDispatch] = useReducer(reducer, null, mkInitial);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { const v = localStorage.getItem("ai_fitness_sidebar"); return v !== null ? JSON.parse(v) : true; } catch { return true; }
  });
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const pendingActionRef = useRef(null);
  const prevLevelRef = useRef(appState.level);
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
  const validPageIds = [...PAGES.map(p => p.id), "session", "templates", "library", "history", "prs"];
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
        <div style={{ display: "flex", minHeight: "100vh", background: "#0A0A0A" }}>
          <Sidebar
            sidebarOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(p => !p)}
            page={page}
            onNavigate={(id) => navigate("/" + id)}
            footer={(
              <div style={{ padding: "16px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#22C55E" }}>G</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>Guest</div>
                    <div style={{ fontSize: 11, color: "#A0A0A0" }}>Sign in to save</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#22C55E" }}>{streak} day streak</span>
                </div>
              </div>
            )}
          />

          {/* Main content */}
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
            <div className="topbar">
              <span className="topbar-title">{PAGES.find(p => p.id === page)?.label || "Dashboard"}</span>
              <div className="topbar-right">
                  <button onClick={() => setAuthModalOpen(true)} style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#A0A0A0", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 500,
                  cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#FFFFFF"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#A0A0A0"; }}
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
              <Suspense fallback={<div style={{ padding: 24 }}><Skeleton height={300} /></div>}>
                <AnimatePresence mode="wait">
                  {PageComponent && (
                    <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      <ErrorBoundary key={page}>
                        <PageComponent state={guestState} dispatch={guardedDispatch} page={page} />
                      </ErrorBoundary>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Suspense>
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
        <DashboardSkeleton />
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
        <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#A0A0A0" }}>Loading...</div>}>
          <Onboarding onComplete={(profile) => appDispatch({ type: "COMPLETE_ONBOARDING", payload: profile })} />
        </Suspense>
      </>
    );
  }

  const validPageIds = [...PAGES.map(p => p.id), "session", "templates", "library", "history", "prs"];
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
      <div style={{ display: "flex", minHeight: "100vh", background: "#0A0A0A" }}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(p => !p)}
          page={page}
          onNavigate={(id) => navigate("/" + id)}
          footer={(
            <div style={{ padding: "16px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#22C55E" }}>
                  {(user?.displayName || appState.profile?.name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{user?.displayName || appState.profile?.name}</div>
                  <div style={{ fontSize: 11, color: "#A0A0A0" }}>Lv. {appState.level} · {appState.xp} XP</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#22C55E" }}>{streak} day streak</span>
              </div>
            </div>
          )}
        />

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
                <Suspense fallback={null}>
                  <AccountMenu
                    user={user}
                    profile={appState.profile}
                    level={appState.level}
                    xp={appState.xp}
                    dispatch={appDispatch}
                    onClose={() => setAccountMenuOpen(false)}
                    onNavigate={(p) => navigate("/" + p)}
                  />
                </Suspense>
              )}
            </div>
          </div>

          <div style={{ flex: 1, padding: 24 }}>
            <Suspense fallback={<div style={{ padding: 24 }}><Skeleton height={300} /></div>}>
              <AnimatePresence mode="wait">
                {PageComponent && (
                    <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      <ErrorBoundary key={page}>
                        <PageComponent state={appState} dispatch={appDispatch} page={page} />
                      </ErrorBoundary>
                    </motion.div>
                  )}
              </AnimatePresence>
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
