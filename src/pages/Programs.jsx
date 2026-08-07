import { useState } from "react";
import { showToast } from "../utils/helpers";
import { ClipboardList, Dumbbell, Layers, Play } from "lucide-react";

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
    <div className="rd-page">
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><ClipboardList size={13} /> Programs</span>
          <h1 className="rd-title">Training Programs</h1>
          <p className="rd-sub">Pick a proven split and start a session straight from the day breakdown.</p>
        </div>
      </div>

      <div className="rd-tabbar">
        {Object.entries(PROGRAM_DB).map(([id, p]) => (
          <button key={id} className={`rd-tab ${active === id ? "active" : ""}`} onClick={() => toggle(id)}>
            {p.name}
          </button>
        ))}
      </div>

      {activeProg && (
        <div className="rd-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="rd-card-head">
            <div className="rd-card-title">
              <div className="rd-card-title-ico lime"><Layers size={16} /></div>
              <div>
                <div className="rd-card-kicker">Program</div>
                <div className="rd-card-name">{activeProg.name}</div>
              </div>
            </div>
            <div className="rd-count" style={{ whiteSpace: "nowrap" }}><b>{activeProg.days.length}</b> days</div>
          </div>

          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{activeProg.desc}</p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {activeProg.days.map((_, i) => (
              <button key={i} className={`rd-chip ${dayIdx === i ? "active" : ""}`} onClick={() => setDayIdx(i)}>Day {i + 1}</button>
            ))}
            <button className="rd-btn-primary rd-btn-sm" style={{ marginLeft: "auto" }} onClick={() => startWorkout(activeProg.days[dayIdx])}>
              <Play size={14} /> Start Workout
            </button>
          </div>

          <div>
            <div className="rd-count" style={{ marginBottom: 10 }}>
              <b>Day {dayIdx + 1}</b> — {activeProg.days[dayIdx].length} exercises
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {activeProg.days[dayIdx].map((ex, i) => (
                <div key={i} className="rd-ex-row" style={{ cursor: "default" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 7, background: "rgba(200,255,50,0.08)", border: "1px solid rgba(200,255,50,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#C8FF32", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF", minWidth: 0 }}>{ex.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span className="rd-ex-tag muted">{ex.sets} × {ex.reps}</span>
                    {ex.weightMod !== "working" && <span className="rd-ex-tag orange">{ex.weightMod}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!active && (
        <div className="rd-card rd-empty" style={{ padding: "52px 16px" }}>
          <Dumbbell size={30} style={{ color: "rgba(200,255,50,0.3)", marginBottom: 4 }} />
          <div className="rd-empty-title">No program selected</div>
          <div className="rd-empty-sub">Select a program above to view details</div>
        </div>
      )}
    </div>
  );
};

export default Programs;
