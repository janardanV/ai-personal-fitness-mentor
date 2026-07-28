import { useState, useMemo } from "react";
import React from "react";
import { COLORS, showToast, showConfirm } from "../utils/helpers";

const Card = ({ children, style, className = "" }) => (
  <div className={`glass ${className}`} style={{ padding: "20px", ...style }}>{children}</div>
);

const PROGRAM_DB = {
  "PPL": {
    name: "Push Pull Legs",
    desc: "Classic 6-day hypertrophy/strength split. Train 6 days/week: Push, Pull, Legs, rest, repeat.",
    days: [
      [
        { name: "Flat Barbell Bench Press", sets: 4, reps: "8-12", weightMod: "working" },
        { name: "Overhead Press", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Lateral Raise", sets: 4, reps: "12-20", weightMod: "working" },
        { name: "Tricep Pushdown", sets: 3, reps: "12-15", weightMod: "working" },
        { name: "Overhead Tricep Extension", sets: 3, reps: "12-15", weightMod: "working" },
      ],
      [
        { name: "Barbell Row", sets: 4, reps: "8-12", weightMod: "working" },
        { name: "Pull Up", sets: 4, reps: "8-12", weightMod: "working" },
        { name: "Seated Cable Row", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Face Pull", sets: 4, reps: "15-20", weightMod: "working" },
        { name: "Barbell Curl", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Hammer Curl", sets: 3, reps: "10-15", weightMod: "working" },
      ],
      [
        { name: "Barbell Back Squat", sets: 4, reps: "8-12", weightMod: "working" },
        { name: "Romanian Deadlift", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Leg Press", sets: 3, reps: "12-15", weightMod: "working" },
        { name: "Leg Extension", sets: 4, reps: "12-20", weightMod: "working" },
        { name: "Leg Curl", sets: 4, reps: "12-20", weightMod: "working" },
        { name: "Calf Raise", sets: 4, reps: "12-20", weightMod: "working" },
      ],
      [
        { name: "Flat Barbell Bench Press", sets: 4, reps: "6-8", weightMod: "heavy" },
        { name: "Overhead Press", sets: 3, reps: "6-8", weightMod: "heavy" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Lateral Raise", sets: 4, reps: "12-20", weightMod: "working" },
        { name: "Tricep Pushdown", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Overhead Tricep Extension", sets: 3, reps: "8-12", weightMod: "working" },
      ],
      [
        { name: "Deadlift", sets: 3, reps: "5-8", weightMod: "heavy" },
        { name: "Barbell Row", sets: 4, reps: "6-8", weightMod: "heavy" },
        { name: "Pull Up", sets: 3, reps: "8-10", weightMod: "working" },
        { name: "Face Pull", sets: 4, reps: "15-20", weightMod: "working" },
        { name: "Barbell Curl", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Hammer Curl", sets: 3, reps: "8-12", weightMod: "working" },
      ],
      [
        { name: "Barbell Back Squat", sets: 4, reps: "6-8", weightMod: "heavy" },
        { name: "Romanian Deadlift", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Leg Press", sets: 3, reps: "10-12", weightMod: "working" },
        { name: "Leg Extension", sets: 4, reps: "12-20", weightMod: "working" },
        { name: "Leg Curl", sets: 4, reps: "12-20", weightMod: "working" },
        { name: "Calf Raise", sets: 4, reps: "12-20", weightMod: "working" },
      ],
    ],
  },
  "PHUL": {
    name: "PHUL",
    desc: "Power Hypertrophy Upper Lower — 4 days/week. Balanced strength + size.",
    days: [
      [
        { name: "Barbell Back Squat", sets: 4, reps: "3-5", weightMod: "heavy" },
        { name: "Flat Barbell Bench Press", sets: 4, reps: "3-5", weightMod: "heavy" },
        { name: "Barbell Row", sets: 4, reps: "3-5", weightMod: "heavy" },
        { name: "Overhead Press", sets: 3, reps: "5-8", weightMod: "working" },
        { name: "Deadlift", sets: 3, reps: "3-5", weightMod: "heavy" },
      ],
      [
        { name: "Pull Up", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Dumbbell Row", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Lateral Raise", sets: 4, reps: "12-20", weightMod: "working" },
        { name: "Barbell Curl", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Tricep Pushdown", sets: 3, reps: "10-15", weightMod: "working" },
      ],
      [
        { name: "Barbell Back Squat", sets: 3, reps: "8-10", weightMod: "working" },
        { name: "Leg Press", sets: 3, reps: "10-12", weightMod: "working" },
        { name: "Leg Extension", sets: 3, reps: "12-15", weightMod: "working" },
        { name: "Romanian Deadlift", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Leg Curl", sets: 3, reps: "12-15", weightMod: "working" },
        { name: "Calf Raise", sets: 3, reps: "12-20", weightMod: "working" },
      ],
      [
        { name: "Flat Barbell Bench Press", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Seated Cable Row", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Lateral Raise", sets: 4, reps: "12-20", weightMod: "working" },
        { name: "Face Pull", sets: 3, reps: "15-20", weightMod: "working" },
        { name: "Hammer Curl", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Overhead Tricep Extension", sets: 3, reps: "10-15", weightMod: "working" },
      ],
    ],
  },
  "ULF": {
    name: "Upper Lower Fullbody",
    desc: "Flexible 5-day: Upper, Lower, Full, Upper, Lower. Great mix of frequency and recovery.",
    days: [
      [
        { name: "Flat Barbell Bench Press", sets: 4, reps: "6-10", weightMod: "heavy" },
        { name: "Barbell Row", sets: 4, reps: "6-10", weightMod: "heavy" },
        { name: "Overhead Press", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Pull Up", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Lateral Raise", sets: 4, reps: "12-20", weightMod: "working" },
        { name: "Barbell Curl", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Tricep Pushdown", sets: 3, reps: "10-15", weightMod: "working" },
      ],
      [
        { name: "Barbell Back Squat", sets: 4, reps: "6-10", weightMod: "heavy" },
        { name: "Romanian Deadlift", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Leg Press", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Leg Extension", sets: 3, reps: "12-20", weightMod: "working" },
        { name: "Leg Curl", sets: 3, reps: "12-20", weightMod: "working" },
        { name: "Calf Raise", sets: 4, reps: "12-20", weightMod: "working" },
      ],
      [
        { name: "Deadlift", sets: 3, reps: "5-8", weightMod: "heavy" },
        { name: "Overhead Press", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Dumbbell Row", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Lateral Raise", sets: 4, reps: "12-20", weightMod: "working" },
        { name: "Face Pull", sets: 3, reps: "15-20", weightMod: "working" },
        { name: "Hammer Curl", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Leg Press", sets: 3, reps: "10-15", weightMod: "working" },
      ],
      [
        { name: "Flat Barbell Bench Press", sets: 4, reps: "6-10", weightMod: "heavy" },
        { name: "Barbell Row", sets: 4, reps: "6-10", weightMod: "heavy" },
        { name: "Overhead Press", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Pull Up", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Lateral Raise", sets: 4, reps: "12-20", weightMod: "working" },
        { name: "Barbell Curl", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Tricep Pushdown", sets: 3, reps: "10-15", weightMod: "working" },
      ],
      [
        { name: "Barbell Back Squat", sets: 4, reps: "6-10", weightMod: "heavy" },
        { name: "Romanian Deadlift", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Leg Extension", sets: 3, reps: "12-20", weightMod: "working" },
        { name: "Leg Curl", sets: 3, reps: "12-20", weightMod: "working" },
        { name: "Calf Raise", sets: 4, reps: "12-20", weightMod: "working" },
      ],
    ],
  },
  "PHAT": {
    name: "PHAT",
    desc: "Power Hypertrophy Adaptive Training — 5 days/week. 2 power days + 3 hypertrophy days.",
    days: [
      [
        { name: "Barbell Back Squat", sets: 5, reps: "3-5", weightMod: "heavy" },
        { name: "Flat Barbell Bench Press", sets: 5, reps: "3-5", weightMod: "heavy" },
        { name: "Barbell Row", sets: 4, reps: "3-5", weightMod: "heavy" },
        { name: "Overhead Press", sets: 4, reps: "5-8", weightMod: "working" },
        { name: "Pull Up", sets: 3, reps: "5-8", weightMod: "working" },
      ],
      [
        { name: "Deadlift", sets: 4, reps: "3-5", weightMod: "heavy" },
        { name: "Weighted Pull Up", sets: 4, reps: "5-8", weightMod: "working" },
        { name: "Dumbbell Row", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Barbell Curl", sets: 3, reps: "8-12", weightMod: "working" },
        { name: "Tricep Pushdown", sets: 3, reps: "8-12", weightMod: "working" },
      ],
      [
        { name: "Incline Dumbbell Press", sets: 4, reps: "8-12", weightMod: "working" },
        { name: "Cable Crossover", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Dumbbell Lateral Raise", sets: 4, reps: "12-20", weightMod: "working" },
        { name: "Tricep Pushdown", sets: 4, reps: "12-20", weightMod: "working" },
        { name: "Overhead Tricep Extension", sets: 3, reps: "12-20", weightMod: "working" },
      ],
      [
        { name: "Leg Press", sets: 4, reps: "8-12", weightMod: "heavy" },
        { name: "Leg Extension", sets: 3, reps: "12-20", weightMod: "working" },
        { name: "Leg Curl", sets: 3, reps: "12-20", weightMod: "working" },
        { name: "Calf Raise", sets: 4, reps: "12-20", weightMod: "working" },
      ],
      [
        { name: "Barbell Row", sets: 4, reps: "8-12", weightMod: "working" },
        { name: "Seated Cable Row", sets: 3, reps: "10-15", weightMod: "working" },
        { name: "Face Pull", sets: 4, reps: "15-20", weightMod: "working" },
        { name: "Barbell Curl", sets: 4, reps: "10-15", weightMod: "working" },
        { name: "Hammer Curl", sets: 3, reps: "10-15", weightMod: "working" },
      ],
    ],
  },
};

const Programs = ({ state, dispatch }) => {
  const [active, setActive] = useState(null);
  const [dayIdx, setDayIdx] = useState(0);
  const activeProg = PROGRAM_DB[active];

  const toggle = (id) => {
    setActive(a => a === id ? null : id);
    setDayIdx(0);
  };

  const startWorkout = (dayExercises) => {
    const exercises = dayExercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
    }));
    dispatch({ type: "SET_PENDING_WORKOUT", payload: { name: activeProg.name, exercises, day: dayIdx + 1 } });
    showToast("Workout started!");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Training Programs</h2>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.entries(PROGRAM_DB).map(([id, p]) => (
          <button key={id} className={active === id ? "neon-btn" : "ghost-btn"} onClick={() => toggle(id)} style={{ padding: "8px 16px", fontSize: 13 }}>{p.name}</button>
        ))}
      </div>

      {activeProg && (
        <Card>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{activeProg.name}</div>
          <p style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 16, lineHeight: 1.6 }}>{activeProg.desc}</p>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {activeProg.days.map((_, i) => (
              <button key={i} className={dayIdx === i ? "neon-btn" : "ghost-btn"} onClick={() => setDayIdx(i)} style={{ fontSize: 12, padding: "6px 14px" }}>Day {i + 1}</button>
            ))}
            <button className="neon-btn" style={{ marginLeft: "auto", fontSize: 12, padding: "6px 14px" }} onClick={() => startWorkout(activeProg.days[dayIdx])}>Start Workout</button>
          </div>

          <div>
            <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Day {dayIdx + 1} — {activeProg.days[dayIdx].length} exercises</div>
            {activeProg.days[dayIdx].map((ex, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderRadius: 8, marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(200,255,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: COLORS.primary, fontFamily: "'JetBrains Mono',monospace" }}>{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: "#A0A0A0" }}>{ex.sets} × {ex.reps} {ex.weightMod !== "working" ? `· ${ex.weightMod}` : ""}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!active && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 14, color: "#A0A0A0" }}>Select a program above to view details</div>
        </div>
      )}
    </div>
  );
};

export default Programs;
