import { useState, useEffect } from "react";
import { showToast } from "../utils/helpers";
import { BookOpen, ClipboardList, Dumbbell, History, Trophy, Zap } from "lucide-react";
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

  return (
    <div className="rd-page">
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><Dumbbell size={13} /> Workouts</span>
          <h1 className="rd-title">Train Smarter</h1>
          <p className="rd-sub">Pick a program, browse the library, or jump straight into a session.</p>
        </div>
        <button className="rd-btn-primary" onClick={startQuickWorkout} style={{ alignSelf: "center" }}>
          <Zap size={16} /> Start Quick Workout
        </button>
      </div>

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
  );
};

export default WorkoutHub;
