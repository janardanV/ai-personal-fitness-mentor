import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { calcWeeklyVolume, calcStreak, showToast } from "../utils/helpers";
import { BookOpen, ClipboardList, Dumbbell, History, Trophy, Zap, Play, ChevronRight, CalendarDays } from "lucide-react";
import WorkoutSession from "./WorkoutSession";
import WorkoutTemplates from "./WorkoutTemplates";
import ExerciseLibraryBase from "./workout/ExerciseLibrary";
import WorkoutHistory from "./workout/WorkoutHistory";
import PersonalRecords from "./workout/PersonalRecords";

const WORKOUT_TAB_MAP = { workout: "library", session: "session", library: "library", templates: "templates", history: "history", prs: "prs" };

const TABS = [
  { id: "library", label: "Exercise Library", icon: BookOpen },
  { id: "templates", label: "Templates", icon: ClipboardList },
  { id: "session", label: "Active Workout", icon: Dumbbell },
  { id: "history", label: "History", icon: History },
  { id: "prs", label: "Personal Records", icon: Trophy },
];

const WorkoutHub = ({ state, dispatch, page }) => {
  const [tab, setTab] = useState(WORKOUT_TAB_MAP[page] || (state.activeSession ? "session" : "library"));

  const workouts = state.workouts || [];
  const weekVol = calcWeeklyVolume(workouts);
  const streak = calcStreak(workouts);
  const progDays = state.currentProgram?.days || [];
  const nextIdx = workouts.length > 0 ? workouts.length % Math.max(progDays.length, 1) : 0;
  const heroDay = progDays.length ? progDays[nextIdx] : null;
  const heroExercises = heroDay?.exercises || [];
  const heroSets = heroExercises.reduce((s, e) => s + (typeof e?.sets === "number" ? e.sets : (e?.sets?.length || 1)), 0);
  const heroMinutes = heroExercises.length ? Math.max(heroSets * 3, heroExercises.length * 5) : 0;
  const cycle = Math.max(1, Math.floor(workouts.length / Math.max(progDays.length, 1)) + 1);
  const cycleDone = progDays.length ? workouts.length % progDays.length : 0;
  const cyclePct = progDays.length ? Math.round((cycleDone / progDays.length) * 100) : 0;

  useEffect(() => {
    if (state.activeSession && tab !== "session") setTab("session");
  }, [state.activeSession, tab]);

  useEffect(() => {
    const mapped = WORKOUT_TAB_MAP[page];
    if (mapped) setTab(mapped);
  }, [page]);

  const startQuickWorkout = () => {
    if (state.activeSession) { showToast("Finish your current workout first"); setTab("session"); return; }
    const session = {
      id: Date.now(), date: new Date().toISOString().split("T")[0], startTime: new Date().toISOString(),
      name: "Quick Workout",
      exercises: [{
        exerciseId: "bench_press", exerciseName: "Barbell Bench Press", notes: "", prevWeight: 0, prevReps: 0,
        sets: [{ setNum: 1, weight: 0, reps: 8, rpe: 0, done: false, isWarmup: false, isDropset: false }],
      }],
    };
    dispatch({ type: "START_SESSION", payload: session });
    setTab("session");
  };

  const startToday = () => {
    if (state.activeSession) { setTab("session"); return; }
    if (heroDay) {
      dispatch({ type: "SET_PENDING_WORKOUT", payload: heroDay });
      setTab("session");
    } else {
      startQuickWorkout();
    }
  };

  const ringR = 30;
  const ringC = 2 * Math.PI * ringR;
  const activeSets = state.activeSession
    ? (state.activeSession.exercises || []).reduce((s, e) => s + (e.sets?.length || 0), 0)
    : heroSets;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="rd-page">

        {/* â•â•â• HERO â•â•â• */}
        <div className="rd-hero">
          <div className="rd-hero-grid">
            <div className="rd-hero-copy">
              <span className="rd-kicker"><Zap size={12} />Workouts</span>
              <div>
                <h1 className="rd-hero-title">{state.activeSession ? "Session in progress" : "Train Smarter"}</h1>
                <div className="rd-hero-date">
                  {state.currentProgram?.name
                    ? `${state.currentProgram.name} · Week ${cycle}`
                    : "No program set — start free or browse the library"}
                </div>
              </div>
              <p className="rd-hero-sub">
                {state.activeSession ? (
                  <>You're mid-workout — <b>{state.activeSession.name || "Active workout"}</b>, {state.activeSession.exercises?.length || 0} exercises underway</>
                ) : heroDay ? (
                  <>Next up: <b>{heroDay.name}</b> — {heroExercises.length} exercises to crush today</>
                ) : (
                  <>Pick a program or start a quick workout to begin training</>
                )}
              </p>
              <div className="rd-hero-stats">
                <div className="rd-hero-stat-chip">
                  <div className="c-v">{Math.round(weekVol).toLocaleString()}<span> kg</span></div>
                  <div className="c-l">Volume / wk</div>
                </div>
                <div className="rd-hero-stat-chip">
                  <div className="c-v">{streak}<span> {streak === 1 ? "day" : "days"}</span></div>
                  <div className="c-l">Streak</div>
                </div>
                <div className="rd-hero-stat-chip">
                  <div className="c-v">{state.activeSession ? activeSets : heroSets}<span> sets</span></div>
                  <div className="c-l">Today</div>
                </div>
              </div>
              <div className="rd-hero-actions">
                <button className="rd-btn-primary" onClick={startToday}>
                  <Play size={15} />
                  {state.activeSession ? "Continue Workout" : heroDay ? "Start Today's Workout" : "Start Quick Workout"}
                  <ChevronRight size={15} />
                </button>
                {!state.activeSession && heroDay && (
                  <button className="rd-btn-secondary" onClick={startQuickWorkout}>
                    <Zap size={15} /> Quick Workout
                  </button>
                )}
              </div>
            </div>

            <div className="rd-hero-visual">
              <div className="rd-plan-panel">
                <div className="rd-plan-top">
                  <div className="rd-ring">
                    <svg viewBox="0 0 76 76">
                      <circle className="rr-bg" cx={38} cy={38} r={30} strokeWidth={6} />
                      <circle className="rr-fg" cx={38} cy={38} r={30} strokeWidth={6}
                        stroke={cyclePct >= 80 ? "#C8FF32" : "#5AC8FA"}
                        strokeDasharray={`${(cyclePct / 100) * ringC} ${ringC}`} />
                    </svg>
                    <div className="rd-ring-center">
                      <b>W{cycle}</b>
                      <span>Cycle</span>
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="rd-plan-kicker">{state.activeSession ? "Session in progress" : "Today's Plan"}</div>
                    <div className="rd-plan-name">
                      {state.activeSession ? state.activeSession.name || "Active workout" : heroDay ? heroDay.name : "No plan yet"}
                    </div>
                    <div className="rd-plan-meta">
                      {state.activeSession
                        ? `${state.activeSession.exercises?.length || 0} exercises underway`
                        : heroDay ? `${heroExercises.length} exercises · ${heroSets} sets · ~${heroMinutes} min` : "Create or pick a program"}
                    </div>
                  </div>
                </div>
                {!state.activeSession && heroDay && (
                  <div className="rd-plan-tags">
                    {heroExercises.slice(0, 4).map((e, i) => {
                      const name = e?.exerciseName || (typeof e === "string" ? e : e?.name);
                      return <span key={i} className="rd-ex-tag">{name}</span>;
                    })}
                    {heroExercises.length > 4 && <span className="rd-ex-tag muted">+{heroExercises.length - 4} more</span>}
                  </div>
                )}
                <div className="rd-plan-cta">
                  <button className="rd-btn-primary rd-btn-sm" onClick={startToday} style={{ flex: 1 }}>
                    <Play size={14} />
                    {state.activeSession ? "Resume" : heroDay ? "Start" : "Quick Workout"}
                  </button>
                  {progDays.length > 0 && (
                    <button className="rd-btn-sm ghost" onClick={() => setTab("templates")}>
                      <CalendarDays size={13} /> Plan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* â•â•â• TABS â•â•â• */}
        <div className="rd-tabbar">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} className={`rd-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "library" && <ExerciseLibraryBase state={state} dispatch={dispatch} />}
        {tab === "templates" && <WorkoutTemplates state={state} dispatch={dispatch} />}
        {tab === "session" && <WorkoutSession state={state} dispatch={dispatch} />}
        {tab === "history" && <WorkoutHistory state={state} dispatch={dispatch} />}
        {tab === "prs" && <PersonalRecords state={state} dispatch={dispatch} />}
      </div>
    </motion.div>
  );
};

export default WorkoutHub;
