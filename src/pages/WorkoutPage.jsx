import { useState, useMemo } from "react";
import React from "react";
import { today, calcE1RM, fmt, COLORS, showToast } from "../utils/helpers";

const Card = ({ children, style, className = "" }) => (
  <div className={`glass ${className}`} style={{ padding: "20px", ...style }}>{children}</div>
);

const NAV = (page) => { window.__setPage?.(page); };

const WorkoutPage = ({ state, dispatch }) => {
  const todayStr = today();
  const session = state.activeSession;

  const todaysWorkout = useMemo(() =>
    state.workouts.find(w => w.date === todayStr),
    [state.workouts, todayStr]
  );

  if (session) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏋️</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Active Workout Session</div>
          <p style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 16 }}>
            {session.name} · {session.exercises?.length || 0} exercises
          </p>
          <button className="neon-btn" onClick={() => NAV("workout")}>Continue Session →</button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Today's Workout</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ghost-btn" onClick={() => NAV("workout")} style={{ fontSize: 12, padding: "8px 16px" }}>New Session</button>
        </div>
      </div>

      {todaysWorkout ? (
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{todaysWorkout.name || "Workout"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(todaysWorkout.totalVolume || 0)}</div>
              <div style={{ fontSize: 11, color: "#A0A0A0" }}>Volume (kg)</div>
            </div>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.cyan, fontFamily: "'JetBrains Mono',monospace" }}>{todaysWorkout.totalSets || 0}</div>
              <div style={{ fontSize: 11, color: "#A0A0A0" }}>Sets</div>
            </div>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.amber, fontFamily: "'JetBrains Mono',monospace" }}>{todaysWorkout.duration || 0}m</div>
              <div style={{ fontSize: 11, color: "#A0A0A0" }}>Duration</div>
            </div>
          </div>
          {todaysWorkout.exercises?.map((ex, i) => {
            const doneSets = ex.sets?.filter(s => s.done) || [];
            const exDef = null;
            return (
              <div key={i} style={{ marginBottom: 10, padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{ex.name || ex.exerciseName}</div>
                <div style={{ fontSize: 12, color: "#A0A0A0" }}>
                  {doneSets.length}/{ex.sets?.length || 0} sets · Volume: {fmt(doneSets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0))}kg
                </div>
              </div>
            );
          })}
        </Card>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💪</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No workout logged today</div>
          <p style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 20, maxWidth: 400, marginInline: "auto" }}>
            Start a new workout session to track your exercises, sets, and progress in real-time.
          </p>
          <button className="neon-btn" onClick={() => NAV("workout")} style={{ padding: "12px 32px", fontSize: 16 }}>
            Start Workout →
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;
