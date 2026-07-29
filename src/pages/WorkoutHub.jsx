import { useState, useEffect } from "react";
import React from "react";
import { showToast } from "../utils/helpers";
import WorkoutSession from "./WorkoutSession";
import WorkoutTemplates from "./WorkoutTemplates";
import ExerciseLibraryBase from "./workout/ExerciseLibrary";
import WorkoutHistory from "./workout/WorkoutHistory";
import PersonalRecords from "./workout/PersonalRecords";

const WORKOUT_TAB_MAP = { workout: "library", session: "session", library: "library", templates: "templates", history: "history", prs: "prs" };

const WorkoutHub = ({ state, dispatch, page }) => {
  const [tab, setTab] = useState(WORKOUT_TAB_MAP[page] || (state.activeSession ? "session" : "library"));
  const tabs = [
    { id: "library", label: "Exercise Library" },
    { id: "templates", label: "Templates" },
    { id: "session", label: "Active Workout" },
    { id: "history", label: "History" },
    { id: "prs", label: "Personal Records" },
  ];

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
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div className="wm-tab-bar">
        {tabs.map(t => (
          <button key={t.id} className={`wm-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "library" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <button className="neon-btn" onClick={startQuickWorkout} style={{ fontSize: 13, padding: "10px 20px" }}>Start Quick Workout</button>
          </div>
           <ExerciseLibraryBase state={state} dispatch={dispatch} />
        </div>
      )}
      {tab === "templates" && <WorkoutTemplates state={state} dispatch={dispatch} />}
      {tab === "session" && <WorkoutSession state={state} dispatch={dispatch} />}
      {tab === "history" && <WorkoutHistory state={state} dispatch={dispatch} />}
      {tab === "prs" && <PersonalRecords state={state} dispatch={dispatch} />}
    </div>
  );
};

export default WorkoutHub;
