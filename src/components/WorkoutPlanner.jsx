import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, ClipboardList, Copy, Dumbbell, FolderOpen, GripVertical, LayoutTemplate, Play, Plus, Save, Search, Trash2, X } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const FULL_EXERCISE_DB = [
  { id: "barbell_squat", name: "Barbell Squat", primary: "Quadriceps", sets: 4, reps: 8 },
  { id: "front_squat", name: "Front Squat", primary: "Quadriceps", sets: 4, reps: 6 },
  { id: "goblet_squat", name: "Goblet Squat", primary: "Quadriceps", sets: 3, reps: 12 },
  { id: "leg_press", name: "Leg Press", primary: "Quadriceps", sets: 4, reps: 10 },
  { id: "hack_squat", name: "Hack Squat", primary: "Quadriceps", sets: 4, reps: 10 },
  { id: "bulgarian_split", name: "Bulgarian Split Squat", primary: "Quadriceps", sets: 3, reps: 10 },
  { id: "walking_lunge", name: "Walking Lunge", primary: "Quadriceps", sets: 3, reps: 12 },
  { id: "leg_extension", name: "Leg Extension", primary: "Quadriceps", sets: 3, reps: 12 },
  { id: "leg_curl", name: "Leg Curl", primary: "Hamstrings", sets: 3, reps: 12 },
  { id: "romanian_deadlift", name: "Romanian Deadlift", primary: "Hamstrings", sets: 4, reps: 8 },
  { id: "stiff_leg_dl", name: "Stiff-Leg Deadlift", primary: "Hamstrings", sets: 3, reps: 10 },
  { id: "hip_thrust", name: "Hip Thrust", primary: "Glutes", sets: 4, reps: 10 },
  { id: "glute_bridge", name: "Glute Bridge", primary: "Glutes", sets: 3, reps: 15 },
  { id: "calf_raise", name: "Standing Calf Raise", primary: "Calves", sets: 4, reps: 15 },
  { id: "seated_calf", name: "Seated Calf Raise", primary: "Calves", sets: 4, reps: 20 },
  { id: "deadlift", name: "Conventional Deadlift", primary: "Back", sets: 4, reps: 5 },
  { id: "sumo_deadlift", name: "Sumo Deadlift", primary: "Back", sets: 4, reps: 5 },
  { id: "barbell_row", name: "Barbell Row", primary: "Back", sets: 4, reps: 8 },
  { id: "pendlay_row", name: "Pendlay Row", primary: "Back", sets: 4, reps: 6 },
  { id: "dumbbell_row", name: "Dumbbell Row", primary: "Back", sets: 3, reps: 10 },
  { id: "cable_row", name: "Cable Row", primary: "Back", sets: 3, reps: 12 },
  { id: "lat_pulldown", name: "Lat Pulldown", primary: "Back", sets: 3, reps: 12 },
  { id: "pull_up", name: "Pull-Up", primary: "Back", sets: 4, reps: 8 },
  { id: "chin_up", name: "Chin-Up", primary: "Back", sets: 4, reps: 8 },
  { id: "seated_row_machine", name: "Seated Row Machine", primary: "Back", sets: 3, reps: 12 },
  { id: "tbar_row", name: "T-Bar Row", primary: "Back", sets: 4, reps: 8 },
  { id: "face_pull", name: "Face Pull", primary: "Rear Delts", sets: 3, reps: 15 },
  { id: "shrug", name: "Barbell Shrug", primary: "Traps", sets: 3, reps: 12 },
  { id: "bench_press", name: "Barbell Bench Press", primary: "Chest", sets: 4, reps: 8 },
  { id: "incline_bench", name: "Incline Bench Press", primary: "Chest", sets: 4, reps: 8 },
  { id: "decline_bench", name: "Decline Bench Press", primary: "Chest", sets: 3, reps: 10 },
  { id: "db_bench_press", name: "Dumbbell Bench Press", primary: "Chest", sets: 3, reps: 10 },
  { id: "db_incline_press", name: "Incline Dumbbell Press", primary: "Chest", sets: 3, reps: 10 },
  { id: "cable_fly", name: "Cable Fly", primary: "Chest", sets: 3, reps: 12 },
  { id: "db_fly", name: "Dumbbell Fly", primary: "Chest", sets: 3, reps: 12 },
  { id: "chest_dip", name: "Chest Dip", primary: "Chest", sets: 3, reps: 10 },
  { id: "push_up", name: "Push-Up", primary: "Chest", sets: 3, reps: 15 },
  { id: "machine_chest_press", name: "Machine Chest Press", primary: "Chest", sets: 3, reps: 12 },
  { id: "ohp", name: "Overhead Press", primary: "Shoulders", sets: 4, reps: 6 },
  { id: "db_ohp", name: "Dumbbell Shoulder Press", primary: "Shoulders", sets: 3, reps: 10 },
  { id: "arnold_press", name: "Arnold Press", primary: "Shoulders", sets: 3, reps: 10 },
  { id: "lateral_raise", name: "Lateral Raise", primary: "Side Delts", sets: 4, reps: 15 },
  { id: "front_raise", name: "Front Raise", primary: "Front Delts", sets: 3, reps: 12 },
  { id: "rear_delt_fly", name: "Rear Delt Fly", primary: "Rear Delts", sets: 3, reps: 15 },
  { id: "cable_lateral", name: "Cable Lateral Raise", primary: "Side Delts", sets: 3, reps: 15 },
  { id: "machine_shoulder", name: "Machine Shoulder Press", primary: "Shoulders", sets: 3, reps: 10 },
  { id: "upright_row", name: "Upright Row", primary: "Shoulders", sets: 3, reps: 10 },
  { id: "push_press", name: "Push Press", primary: "Shoulders", sets: 4, reps: 5 },
  { id: "barbell_curl", name: "Barbell Curl", primary: "Biceps", sets: 3, reps: 10 },
  { id: "db_curl", name: "Dumbbell Curl", primary: "Biceps", sets: 3, reps: 10 },
  { id: "hammer_curl", name: "Hammer Curl", primary: "Biceps", sets: 3, reps: 12 },
  { id: "preacher_curl", name: "Preacher Curl", primary: "Biceps", sets: 3, reps: 10 },
  { id: "cable_curl", name: "Cable Curl", primary: "Biceps", sets: 3, reps: 12 },
  { id: "concentration_curl", name: "Concentration Curl", primary: "Biceps", sets: 3, reps: 12 },
  { id: "tricep_pushdown", name: "Tricep Pushdown", primary: "Triceps", sets: 3, reps: 12 },
  { id: "skull_crusher", name: "Skull Crusher", primary: "Triceps", sets: 3, reps: 10 },
  { id: "overhead_ext", name: "Overhead Tricep Extension", primary: "Triceps", sets: 3, reps: 12 },
  { id: "dip_tricep", name: "Tricep Dip", primary: "Triceps", sets: 3, reps: 12 },
  { id: "close_grip_bench", name: "Close-Grip Bench Press", primary: "Triceps", sets: 4, reps: 6 },
  { id: "french_press", name: "French Press", primary: "Triceps", sets: 3, reps: 10 },
  { id: "wrist_curl", name: "Wrist Curl", primary: "Forearms", sets: 3, reps: 15 },
  { id: "reverse_curl", name: "Reverse Curl", primary: "Forearms", sets: 3, reps: 12 },
  { id: "farmers_walk", name: "Farmer's Walk", primary: "Forearms", sets: 3, reps: 40 },
  { id: "plank", name: "Plank", primary: "Core", sets: 3, reps: 60 },
  { id: "crunch", name: "Crunch", primary: "Core", sets: 3, reps: 20 },
  { id: "hanging_leg_raise", name: "Hanging Leg Raise", primary: "Core", sets: 3, reps: 12 },
  { id: "russian_twist", name: "Russian Twist", primary: "Core", sets: 3, reps: 20 },
  { id: "ab_rollout", name: "Ab Rollout", primary: "Core", sets: 3, reps: 12 },
  { id: "cable_crunch", name: "Cable Crunch", primary: "Core", sets: 3, reps: 15 },
  { id: "dead_bug", name: "Dead Bug", primary: "Core", sets: 3, reps: 12 },
  { id: "turkish_getup", name: "Turkish Get-Up", primary: "Core", sets: 3, reps: 5 },
  { id: "kettlebell_swing", name: "Kettlebell Swing", primary: "Glutes", sets: 3, reps: 15 },
  { id: "clean_and_jerk", name: "Clean and Jerk", primary: "Full Body", sets: 5, reps: 3 },
  { id: "snatch", name: "Snatch", primary: "Full Body", sets: 5, reps: 3 },
  { id: "power_clean", name: "Power Clean", primary: "Full Body", sets: 5, reps: 3 },
  { id: "box_jump", name: "Box Jump", primary: "Quadriceps", sets: 4, reps: 6 },
  { id: "burpee", name: "Burpee", primary: "Full Body", sets: 3, reps: 10 },
  { id: "mountain_climber", name: "Mountain Climber", primary: "Core", sets: 3, reps: 20 },
  { id: "jump_squat", name: "Jump Squat", primary: "Quadriceps", sets: 3, reps: 12 },
  { id: "battle_ropes", name: "Battle Ropes", primary: "Shoulders", sets: 3, reps: 30 },
  { id: "sled_push", name: "Sled Push", primary: "Quadriceps", sets: 4, reps: 30 },
  { id: "rowing_machine", name: "Rowing Machine", primary: "Back", sets: 1, reps: 500 },
  { id: "smith_machine_squat", name: "Smith Machine Squat", primary: "Quadriceps", sets: 4, reps: 8 },
  { id: "smith_machine_bench", name: "Smith Machine Bench Press", primary: "Chest", sets: 4, reps: 8 },
];

const TEMPLATES = {
  ppl: {
    name: "Push Pull Legs",
    days: {
      Mon: ["bench_press", "incline_bench", "ohp", "lateral_raise", "cable_fly", "tricep_pushdown"],
      Tue: ["deadlift", "barbell_row", "pull_up", "lat_pulldown", "face_pull", "barbell_curl"],
      Wed: ["barbell_squat", "leg_press", "romanian_deadlift", "leg_extension", "leg_curl", "calf_raise"],
      Thu: ["db_bench_press", "decline_bench", "db_ohp", "cable_lateral", "db_fly", "skull_crusher"],
      Fri: ["pendlay_row", "dumbbell_row", "chin_up", "cable_row", "shrug", "hammer_curl"],
      Sat: ["hack_squat", "bulgarian_split", "hip_thrust", "walking_lunge", "seated_calf", "glute_bridge"],
    },
  },
  upper_lower: {
    name: "Upper Lower",
    days: {
      Mon: ["bench_press", "barbell_row", "ohp", "lat_pulldown", "barbell_curl", "tricep_pushdown", "lateral_raise"],
      Thu: ["barbell_squat", "deadlift", "leg_press", "romanian_deadlift", "leg_extension", "leg_curl", "calf_raise"],
      Tue: ["incline_bench", "dumbbell_row", "db_ohp", "pull_up", "hammer_curl", "face_pull", "skull_crusher"],
      Fri: ["hack_squat", "hip_thrust", "bulgarian_split", "walking_lunge", "glute_bridge", "seated_calf"],
    },
  },
  full_body: {
    name: "Full Body",
    days: {
      Mon: ["bench_press", "barbell_row", "barbell_squat", "ohp", "barbell_curl", "plank"],
      Wed: ["deadlift", "incline_bench", "lat_pulldown", "leg_press", "lateral_raise", "tricep_pushdown"],
      Fri: ["db_bench_press", "pendlay_row", "hack_squat", "db_ohp", "hammer_curl", "hanging_leg_raise"],
    },
  },
};

const makeExerciseEntry = (id) => {
  const def = FULL_EXERCISE_DB.find((e) => e.id === id);
  return {
    uid: `${id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    exerciseId: def?.id || id,
    name: def?.name || id,
    primary: def?.primary || "",
    sets: def?.sets || 3,
    reps: def?.reps || 10,
  };
};

const uid = () => Math.random().toString(36).slice(2, 9);

export default function WorkoutPlanner({ state, dispatch }) {
  const [week, setWeek] = useState(() => {
    const initial = {};
    DAYS.forEach((d) => (initial[d] = []));
    return initial;
  });
  const [activeDay, setActiveDay] = useState("Mon");
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [routineName, setRoutineName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);
  const [view, setView] = useState("planner");
  const [templateModal, setTemplateModal] = useState(false);

  const allExercises = useMemo(() => {
    const custom = (state.customExercises || []).map((e) => ({
      id: e.id,
      name: e.name,
      primary: e.primary || e.muscle || "",
      sets: e.defaultSets || 3,
      reps: e.defaultReps || 10,
    }));
    return [...FULL_EXERCISE_DB, ...custom];
  }, [state.customExercises]);

  const pickerResults = useMemo(() => {
    if (!pickerSearch) return allExercises;
    const q = pickerSearch.toLowerCase();
    return allExercises.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.primary.toLowerCase().includes(q)
    );
  }, [pickerSearch, allExercises]);

  const addExercise = useCallback(
    (exDef) => {
      setWeek((prev) => ({
        ...prev,
        [activeDay]: [...prev[activeDay], makeExerciseEntry(exDef.id)],
      }));
      setShowPicker(false);
      setPickerSearch("");
    },
    [activeDay]
  );

  const removeExercise = useCallback((day, uid_) => {
    setWeek((prev) => ({
      ...prev,
      [day]: prev[day].filter((e) => e.uid !== uid_),
    }));
  }, []);

  const updateExercise = useCallback((day, uid_, field, value) => {
    setWeek((prev) => ({
      ...prev,
      [day]: prev[day].map((e) =>
        e.uid === uid_ ? { ...e, [field]: value } : e
      ),
    }));
  }, []);

  const applyTemplate = useCallback((templateKey) => {
    const tmpl = TEMPLATES[templateKey];
    if (!tmpl) return;
    const newWeek = {};
    DAYS.forEach((d) => (newWeek[d] = []));
    Object.entries(tmpl.days).forEach(([day, exIds]) => {
      if (newWeek[day]) {
        newWeek[day] = exIds.map(makeExerciseEntry);
      }
    });
    setWeek(newWeek);
    setTemplateModal(false);
  }, []);

  const duplicateDay = useCallback((fromDay) => {
    setWeek((prev) => ({
      ...prev,
      [fromDay]: prev[fromDay].map((e) => ({
        ...e,
        uid: `${e.exerciseId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      })),
    }));
  }, []);

  const clearDay = useCallback((day) => {
    setWeek((prev) => ({ ...prev, [day]: [] }));
  }, []);

  const handleDragStart = useCallback((e, exerciseUid, fromDay) => {
    setDragItem({ uid: exerciseUid, fromDay });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", exerciseUid);
  }, []);

  const handleDragOver = useCallback((e, day) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDay(day);
  }, []);

  const handleDrop = useCallback(
    (e, toDay) => {
      e.preventDefault();
      setDragOverDay(null);
      if (!dragItem) return;
      if (dragItem.fromDay === toDay) {
        setDragItem(null);
        return;
      }
      setWeek((prev) => {
        const fromList = [...prev[dragItem.fromDay]];
        const toList = [...prev[toDay]];
        const idx = fromList.findIndex((x) => x.uid === dragItem.uid);
        if (idx === -1) return prev;
        const [moved] = fromList.splice(idx, 1);
        toList.push(moved);
        return { ...prev, [dragItem.fromDay]: fromList, [toDay]: toList };
      });
      setDragItem(null);
    },
    [dragItem]
  );

  const handleDragEnd = useCallback(() => {
    setDragItem(null);
    setDragOverDay(null);
  }, []);

  const saveRoutine = useCallback(() => {
    if (!routineName.trim()) return;
    const daysPayload = {};
    DAYS.forEach((d) => {
      daysPayload[d] = week[d].map((e) => ({
        exerciseId: e.exerciseId,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
      }));
    });
    dispatch({
      type: "SAVE_TEMPLATE",
      payload: {
        id: uid(),
        name: routineName.trim(),
        days: daysPayload,
        type: "weekly",
      },
    });
    setShowSaveModal(false);
    setRoutineName("");
  }, [routineName, week, dispatch]);

  const loadRoutine = useCallback((template) => {
    if (template.days) {
      const newWeek = {};
      DAYS.forEach((d) => {
        newWeek[d] = (template.days[d] || []).map((e) => ({
          uid: `${e.exerciseId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          exerciseId: e.exerciseId,
          name: e.name,
          primary: FULL_EXERCISE_DB.find((x) => x.id === e.exerciseId)?.primary || "",
          sets: e.sets || 3,
          reps: e.reps || 10,
        }));
      });
      setWeek(newWeek);
    }
    setView("planner");
  }, []);

  const duplicateRoutine = useCallback(
    (template) => {
      const daysPayload = {};
      DAYS.forEach((d) => {
        daysPayload[d] = (template.days?.[d] || []).map((e) => ({
          exerciseId: e.exerciseId,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
        }));
      });
      dispatch({
        type: "SAVE_TEMPLATE",
        payload: {
          id: uid(),
          name: `${template.name} (Copy)`,
          days: daysPayload,
          type: "weekly",
        },
      });
    },
    [dispatch]
  );

  const deleteRoutine = useCallback(
    (templateId) => {
      dispatch({ type: "DELETE_TEMPLATE", payload: templateId });
    },
    [dispatch]
  );

  const startTodaysWorkout = useCallback(() => {
    const dayExercises = week[activeDay];
    if (!dayExercises || dayExercises.length === 0) return;
    const workoutData = {
      name: `${activeDay} Workout`,
      exercises: dayExercises.map((e) => ({
        id: e.exerciseId,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        primary: e.primary,
      })),
    };
    dispatch({ type: "SET_PENDING_WORKOUT", payload: workoutData });
  }, [week, activeDay, dispatch]);

  const totalExercises = useMemo(
    () => DAYS.reduce((sum, d) => sum + week[d].length, 0),
    [week]
  );

  const currentDayIdx = new Date().getDay();
  const currentDayName = DAYS[(currentDayIdx + 6) % 7];

  const renderExercises = (day) => {
    const exercises = week[day];
    if (exercises.length === 0) {
      return (
        <div className="rd-empty" style={{ padding: "36px 16px" }}>
          <ClipboardList size={30} style={{ color: "rgba(255,255,255,0.2)" }} />
          <div className="rd-empty-title">No exercises for this day</div>
          <div className="rd-empty-sub">Add exercises to build your {day} session.</div>
          <button className="rd-btn-primary rd-btn-sm" onClick={() => setShowPicker(true)} style={{ marginTop: 10 }}>
            <Plus size={15} /> Add Exercise
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {exercises.map((ex) => (
          <motion.div
            key={ex.uid}
            className="rd-ex-row"
            style={{
              cursor: "grab",
              userSelect: "none",
              gap: 10,
              borderColor: dragItem?.uid === ex.uid ? "rgba(200,255,0,0.3)" : undefined,
              background: dragItem?.uid === ex.uid ? "rgba(200,255,0,0.05)" : undefined,
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, ex.uid, day)}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            layout
            whileHover={{ background: "rgba(255,255,255,0.04)" }}
          >
            <GripVertical size={16} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{ex.primary}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <input
                className="rd-set-input"
                style={{ width: 46, height: 30 }}
                type="number"
                min="1"
                value={ex.sets}
                onChange={(e) =>
                  updateExercise(day, ex.uid, "sets", Math.max(1, +e.target.value || 1))
                }
              />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>×</span>
              <input
                className="rd-set-input"
                style={{ width: 46, height: 30 }}
                type="number"
                min="1"
                value={ex.reps}
                onChange={(e) =>
                  updateExercise(day, ex.uid, "reps", Math.max(1, +e.target.value || 1))
                }
              />
            </div>
            <button className="rd-iconbtn danger" onClick={() => removeExercise(day, ex.uid)} aria-label="Remove exercise">
              <Trash2 size={15} />
            </button>
          </motion.div>
        ))}
        <button className="rd-add-dashed" style={{ marginTop: 2 }} onClick={() => setShowPicker(true)}>
          <Plus size={15} /> Add Exercise
        </button>
      </div>
    );
  };

  return (
    <div className="rd-page">
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><CalendarDays size={13} /> Planner</span>
          <h1 className="rd-title">Workout Planner</h1>
          <p className="rd-sub">Plan your weekly training split</p>
        </div>
        <div className="rd-tabbar" style={{ alignSelf: "center" }}>
          <button className={`rd-tab ${view === "planner" ? "active" : ""}`} onClick={() => setView("planner")}>
            <CalendarDays size={15} /> Planner
          </button>
          <button className={`rd-tab ${view === "saved" ? "active" : ""}`} onClick={() => setView("saved")}>
            <Save size={15} /> Saved ({(state.workoutTemplates || []).filter((t) => t.type === "weekly").length})
          </button>
        </div>
      </div>

      {view === "planner" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            <div className="rd-nut-stat lime">
              <div className="l">Total Exercises</div>
              <div className="v">{totalExercises}</div>
              <div className="s">planned this week</div>
            </div>
            <div className="rd-nut-stat blue">
              <div className="l">Active Days</div>
              <div className="v">{DAYS.filter((d) => week[d].length > 0).length}<span>/7</span></div>
              <div className="s">days with exercises</div>
            </div>
          </div>

          <div className="rd-card" style={{ padding: 16 }}>
            <div className="rd-card-head" style={{ marginBottom: 14 }}>
              <div className="rd-card-title">
                <span className="rd-card-title-ico blue"><CalendarDays size={16} /></span>
                <div>
                  <div className="rd-card-kicker">Week at a glance</div>
                  <div className="rd-card-name">Training days</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="rd-btn-sm primary" onClick={() => setTemplateModal(true)}>
                  <LayoutTemplate size={14} /> Templates
                </button>
                <button className="rd-btn-sm ghost" style={{ opacity: totalExercises === 0 ? 0.5 : 1 }} onClick={() => setShowSaveModal(true)} disabled={totalExercises === 0}>
                  <Save size={14} /> Save Routine
                </button>
                <button
                  className={`rd-btn-sm ${week[activeDay].length > 0 ? "primary" : "ghost"}`}
                  style={{ opacity: week[activeDay].length === 0 ? 0.5 : 1 }}
                  onClick={startTodaysWorkout}
                  disabled={week[activeDay].length === 0}
                >
                  <Play size={14} /> Start {activeDay}&apos;s Workout
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {DAYS.map((d) => {
                const isToday = d === currentDayName;
                const isActive = d === activeDay;
                const has = week[d].length > 0;
                return (
                  <button
                    key={d}
                    className={`rd-chip ${isActive ? "active" : ""}`}
                    style={{ position: "relative", minWidth: 58, flexDirection: "column", gap: 3, flexShrink: 0 }}
                    onClick={() => setActiveDay(d)}
                  >
                    {isToday && <span style={{ position: "absolute", top: 5, right: 7, width: 6, height: 6, borderRadius: "50%", background: "#C8FF00", boxShadow: "0 0 8px rgba(200,255,0,0.4)" }} />}
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: isToday && !isActive ? "#E8E8E8" : undefined }}>{d}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: has ? "#C8FF00" : "rgba(255,255,255,0.25)" }}>{week[d].length}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <motion.div
            className="rd-card"
            style={{
              borderColor: dragOverDay === activeDay ? "rgba(200,255,0,0.3)" : undefined,
              boxShadow: dragOverDay === activeDay ? "0 0 24px rgba(200,255,0,0.08)" : undefined,
            }}
            onDragOver={(e) => handleDragOver(e, activeDay)}
            onDrop={(e) => handleDrop(e, activeDay)}
            layout
          >
            <div className="rd-card-head">
              <div className="rd-card-title">
                <span className="rd-card-title-ico lime"><Dumbbell size={16} /></span>
                <div>
                  <div className="rd-card-kicker">{activeDay === currentDayName ? "Today" : "Daily plan"}</div>
                  <div className="rd-card-name" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {activeDay} Workout
                    {activeDay === currentDayName && <span className="rd-ex-tag">TODAY</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button className="rd-mini-btn" onClick={() => duplicateDay(activeDay)} title="Duplicate day">
                  <Copy size={12} /> Duplicate
                </button>
                <button className="rd-mini-btn danger" onClick={() => clearDay(activeDay)} title="Clear day">
                  <Trash2 size={12} /> Clear
                </button>
              </div>
            </div>
            <AnimatePresence mode="popLayout">{renderExercises(activeDay)}</AnimatePresence>
          </motion.div>
        </>
      )}

      {view === "saved" && (
        <div className="rd-stack">
          {(state.workoutTemplates || []).filter((t) => t.type === "weekly").length === 0 ? (
            <div className="rd-empty" style={{ padding: "60px 16px" }}>
              <FolderOpen size={32} style={{ color: "rgba(255,255,255,0.2)" }} />
              <div className="rd-empty-title">No saved routines yet</div>
              <div className="rd-empty-sub">Save a week from the planner to reuse it later.</div>
              <button className="rd-btn-primary rd-btn-sm" onClick={() => setView("planner")} style={{ marginTop: 10 }}>
                Go to Planner
              </button>
            </div>
          ) : (
            (state.workoutTemplates || [])
              .filter((t) => t.type === "weekly")
              .map((t) => {
                const dayCount = DAYS.filter((d) => (t.days?.[d] || []).length > 0).length;
                const exCount = DAYS.reduce((s, d) => s + (t.days?.[d] || []).length, 0);
                return (
                  <motion.div
                    key={t.id}
                    className="rd-card"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ borderColor: "rgba(200,255,0,0.16)" }}
                  >
                    <div className="rd-card-head" style={{ marginBottom: 10 }}>
                      <div className="rd-card-title">
                        <span className="rd-card-title-ico blue"><Save size={16} /></span>
                        <div>
                          <div className="rd-card-kicker">Saved routine</div>
                          <div className="rd-card-name">{t.name}</div>
                        </div>
                      </div>
                      <span className="rd-count">
                        {dayCount} day{dayCount !== 1 ? "s" : ""} · {exCount} exercise{exCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                      {DAYS.filter((d) => (t.days?.[d] || []).length > 0).map((d) => (
                        <span key={d} className="rd-ex-tag">{d}: {(t.days?.[d] || []).length} ex</span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="rd-btn-sm primary" onClick={() => loadRoutine(t)}>
                        <Play size={13} /> Load
                      </button>
                      <button className="rd-btn-sm ghost" onClick={() => duplicateRoutine(t)}>
                        <Copy size={13} /> Duplicate
                      </button>
                      <button
                        className="rd-btn-sm danger"
                        onClick={() => {
                          if (confirm(`Delete "${t.name}"?`)) deleteRoutine(t.id);
                        }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })
          )}
        </div>
      )}

      <AnimatePresence>
        {showPicker && (
          <motion.div
            className="rd-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPicker(false)}
          >
            <motion.div
              className="rd-modal rd-modal-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="rd-modal-close" onClick={() => setShowPicker(false)}><X size={16} /></button>
              <div className="rd-modal-title" style={{ marginBottom: 16 }}>Add Exercise</div>
              <div className="rd-search" style={{ marginBottom: 12 }}>
                <Search size={15} />
                <input placeholder="Search exercises..." value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} autoFocus />
              </div>
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                {pickerResults.map((ex) => (
                  <div key={ex.id} className="rd-ex-row" style={{ marginBottom: 6, cursor: "pointer" }} onClick={() => addExercise(ex)}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{ex.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{ex.primary} · {ex.sets}×{ex.reps}</div>
                    </div>
                    <Plus size={16} style={{ color: "rgba(200,255,0,0.4)", flexShrink: 0 }} />
                  </div>
                ))}
                {pickerResults.length === 0 && (
                  <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                    No exercises found
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {templateModal && (
          <motion.div
            className="rd-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTemplateModal(false)}
          >
            <motion.div
              className="rd-modal"
              style={{ maxWidth: 520 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="rd-modal-close" onClick={() => setTemplateModal(false)}><X size={16} /></button>
              <div className="rd-modal-title" style={{ marginBottom: 6 }}>Quick Templates</div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>
                Pre-fill your week with a popular training split
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                {Object.entries(TEMPLATES).map(([key, tmpl]) => {
                  const dayCount = Object.values(tmpl.days).filter((e) => e.length > 0).length;
                  const exCount = Object.values(tmpl.days).reduce((s, e) => s + e.length, 0);
                  return (
                    <motion.div
                      key={key}
                      className="rd-tmpl-card"
                      whileHover={{ borderColor: "rgba(200,255,0,0.25)", transform: "translateY(-2px)" }}
                      onClick={() => applyTemplate(key)}
                    >
                      <div className="rd-tmpl-name">{tmpl.name}</div>
                      <div className="rd-tmpl-desc">{dayCount} day split · {exCount} exercises</div>
                      <div className="rd-tmpl-chips">
                        {Object.entries(tmpl.days)
                          .filter(([, e]) => e.length > 0)
                          .map(([day]) => (
                            <span key={day} className="rd-ex-tag">{day}</span>
                          ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            className="rd-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              className="rd-modal"
              style={{ maxWidth: 400 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="rd-modal-close" onClick={() => setShowSaveModal(false)}><X size={16} /></button>
              <div className="rd-modal-title" style={{ marginBottom: 16 }}>Save Routine</div>
              <div className="rd-form" style={{ marginBottom: 18 }}>
                <div className="rd-field">
                  <label>Routine name</label>
                  <input className="rd-input" placeholder="Routine name..." value={routineName} onChange={(e) => setRoutineName(e.target.value)} autoFocus />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="rd-btn-secondary" style={{ flex: 1 }} onClick={() => setShowSaveModal(false)}>
                  Cancel
                </button>
                <button
                  className="rd-btn-primary"
                  style={{ flex: 2, opacity: !routineName.trim() || totalExercises === 0 ? 0.5 : 1 }}
                  onClick={saveRoutine}
                  disabled={!routineName.trim() || totalExercises === 0}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
