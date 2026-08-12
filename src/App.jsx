import { useState, useEffect, useRef, useCallback, useReducer, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import RunningMode from "./RunningMode";
import { useAuth } from "./hooks/useAuth";
import { loadOrMigrateUserData, readLocalData, saveLocalData, saveUserData } from "./services/profileService";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import AuthModal from "./components/AuthModal";
import { GUEST_PROFILE, mkInitial, calcStreak, GlobalStyles, PAGES, reducer, showToast, Toast, ConfirmDialog } from "./utils/helpers";

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
  const [appState, appDispatch] = useReducer(reducer, null, () =>
    reducer(mkInitial(), { type: "LOAD_DATA", payload: readLocalData() })
  );
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { const v = localStorage.getItem("ai_fitness_sidebar"); return v !== null ? JSON.parse(v) : true; } catch { return true; }
  });
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const prevLevelRef = useRef(appState.level);
  const saveTimerRef = useRef(null);
  const guestSaveTimerRef = useRef(null);
  const pendingSaveRef = useRef(null);
  const saveErrorToastAtRef = useRef(0);

  // Flush any pending Firestore save (used on logout and page unload).
  const flushPendingSave = useCallback(() => {
    const pending = pendingSaveRef.current;
    if (!pending) return Promise.resolve();
    pendingSaveRef.current = null;
    return saveUserData(pending.uid, pending.data).catch((err) =>
      console.error("Failed to flush pending save:", err)
    );
  }, []);

  // ── Load user data from Firestore on auth, migrating guest data ──
  useEffect(() => {
    if (!user) { setDataLoaded(false); return; }
    console.log("[GOOGLE] App: user changed → loading cloud data for uid:", user.uid);
    let cancelled = false;
    const loadData = async () => {
      try {
        let data = await loadOrMigrateUserData(user.uid);
        if (!cancelled && data) {
          console.log("[GOOGLE] App: data loaded, hasProfile:", Boolean(data.profile));
          if (!data.profile) {
            data = {
              ...data,
              profile: {
                ...GUEST_PROFILE,
                name: user.displayName || "Guest",
                email: user.email || "",
                photoURL: user.photoURL || "",
              },
            };
          }
          appDispatch({ type: "LOAD_DATA", payload: data });
        }
        } catch (err) {
          console.error("Failed to load user data:", err);
          if (!cancelled) {
            showToast("Couldn't load your cloud data. Check your connection and refresh.");
          }
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
    pendingSaveRef.current = { uid: user.uid, data: appState };
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const pending = pendingSaveRef.current;
      if (!pending) return;
      pendingSaveRef.current = null;
      saveUserData(pending.uid, pending.data).catch((err) => {
        console.error("Failed to save user data:", err);
        const now = Date.now();
        if (now - saveErrorToastAtRef.current > 8000) {
          saveErrorToastAtRef.current = now;
          showToast("Couldn't save to the cloud. Check your connection.");
        }
      });
    }, 1500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [appState, user, dataLoaded]);

  // Flush pending saves when the tab is being hidden/closed (best effort).
  useEffect(() => {
    const flush = () => { flushPendingSave(); };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [flushPendingSave]);

  // ── Persist guest state to localStorage ──
  useEffect(() => {
    if (user) return;
    if (guestSaveTimerRef.current) clearTimeout(guestSaveTimerRef.current);
    guestSaveTimerRef.current = setTimeout(() => {
      try {
        saveLocalData({ ...appState, profile: appState.profile || GUEST_PROFILE });
      } catch (err) {
        console.error("Failed to save guest data:", err);
      }
    }, 500);
    return () => { if (guestSaveTimerRef.current) clearTimeout(guestSaveTimerRef.current); };
  }, [appState, user]);

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

  const authPages = ["/login", "/signup", "/forgot-password"];

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

    // Guest dashboard — local-only state persisted to localStorage
    const guestState = { ...appState, profile: appState.profile || GUEST_PROFILE };
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
        <AuthModal open={authModalOpen} onClose={() => { setAuthModalOpen(false); }} onAuthSuccess={() => setAuthModalOpen(false)} />
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
          <Sidebar
            sidebarOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(p => !p)}
            page={page}
            onNavigate={(id) => navigate("/" + id)}
            footer={(
              <div style={{ padding: "16px 14px", borderTop: "1px solid var(--line)" }}>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  style={{
                    width: "100%", background: "transparent", border: "none", padding: 0,
                    display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
                    cursor: "pointer", textAlign: "left", fontFamily: "var(--font)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.querySelector(".guest-signin-label").style.color = "var(--text)"; }}
                  onMouseLeave={(e) => { e.currentTarget.querySelector(".guest-signin-label").style.color = "var(--muted)"; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent-soft)", border: "1px solid var(--accent-line)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>G</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Guest</div>
                    <div className="guest-signin-label" style={{ fontSize: 11, color: "var(--muted)", transition: "color 0.15s" }}>Sign in to save</div>
                  </div>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "var(--accent-soft)", border: "1px solid var(--accent-line)" }}>
                  <Flame size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{streak} day streak</span>
                </div>
              </div>
            )}
          />

          {/* Main content */}
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
            <div className="topbar">
              <span className="topbar-title">{PAGES.find(p => p.id === page)?.label || "Dashboard"}</span>
              <div className="topbar-right">
                <button onClick={() => setAuthModalOpen(true)} style={{
                  background: "var(--surface-2)", border: "1px solid var(--line)",
                  color: "var(--muted)", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-soft)"; e.currentTarget.style.borderColor = "var(--accent-line)"; e.currentTarget.style.color = "var(--accent)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--muted)"; }}
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
                        <PageComponent state={guestState} dispatch={appDispatch} page={page} />
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
        <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading...</div>}>
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
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(p => !p)}
          page={page}
          onNavigate={(id) => navigate("/" + id)}
          footer={(
            <div style={{ padding: "16px 14px", borderTop: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent-soft)", border: "1px solid var(--accent-line)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                  {(user?.displayName || appState.profile?.name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{user?.displayName || appState.profile?.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Lv. {appState.level} · {appState.xp} XP</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "var(--accent-soft)", border: "1px solid var(--accent-line)" }}>
                <Flame size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{streak} day streak</span>
              </div>
            </div>
          )}
        />

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
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
                    onFlushSave={flushPendingSave}
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
                        <PageComponent state={appState} dispatch={appDispatch} page={page} user={user} />
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
