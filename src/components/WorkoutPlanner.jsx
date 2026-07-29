import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  const s = {
    root: { padding: "0 0 32px" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 },
    title: { fontSize: 22, fontWeight: 800, color: "#FFFFFF" },
    subtitle: { fontSize: 13, color: "#A0A0A0", marginTop: 2 },
    tabs: { display: "flex", gap: 4, padding: 4, background: "#151515", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" },
    tab: { padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: "none", color: "#A0A0A0", cursor: "pointer", transition: "all 0.2s", border: "none" },
    tabActive: { background: "rgba(255,255,255,0.06)", color: "#22C55E" },
    dayBar: { display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 },
    dayBtn: (isToday, isActive, hasEx) => ({
      minWidth: 56,
      padding: "10px 12px",
      borderRadius: 12,
      border: `1.5px solid ${isActive ? "rgba(255,255,255,0.15)" : isToday ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
      background: isActive
        ? "rgba(255,255,255,0.04)"
        : hasEx
          ? "rgba(255,255,255,0.02)"
          : "#151515",
      color: isActive ? "#22C55E" : isToday ? "#E8E8E8" : "#A0A0A0",
      cursor: "pointer",
      transition: "all 0.2s",
      textAlign: "center",
      flexShrink: 0,
      position: "relative",
    }),
    dayLabel: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
    dayCount: (has) => ({
      fontSize: 10,
      fontWeight: 600,
      color: has ? "#22C55E" : "rgba(160,160,160,0.3)",
      marginTop: 4,
    }),
    todayDot: {
      position: "absolute",
      top: -3,
      right: -3,
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "#22C55E",
      boxShadow: "0 0 8px rgba(255,255,255,0.15)",
    },
    panel: {
      background: "#151515",
      border: "1px solid rgba(255,255,255,0.04)",
      borderRadius: 16,
      padding: 20,
      minHeight: 200,
      transition: "border-color 0.2s",
    },
    panelDrop: {
      background: "#151515",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 16,
      padding: 20,
      minHeight: 200,
      transition: "all 0.2s",
      boxShadow: "0 0 24px rgba(255,255,255,0.04)",
    },
    dayTitle: { fontSize: 15, fontWeight: 700, color: "#FFFFFF", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" },
    dayTitleLeft: { display: "flex", alignItems: "center", gap: 8 },
    exCard: (isDragging) => ({
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      background: isDragging ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isDragging ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)"}`,
      borderRadius: 10,
      marginBottom: 6,
      cursor: "grab",
      transition: "all 0.15s",
      userSelect: "none",
    }),
    exGrip: { color: "rgba(160,160,160,0.3)", fontSize: 14, cursor: "grab", flexShrink: 0, lineHeight: 1 },
    exInfo: { flex: 1, minWidth: 0 },
    exName: { fontSize: 13, fontWeight: 600, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    exMeta: { fontSize: 11, color: "#A0A0A0", marginTop: 1 },
    exInputs: { display: "flex", alignItems: "center", gap: 4, flexShrink: 0 },
    smallInput: {
      width: 44,
      padding: "4px 6px",
      fontSize: 12,
      textAlign: "center",
      borderRadius: 6,
      background: "#1D1D1D",
      border: "1px solid rgba(255,255,255,0.04)",
      color: "#FFFFFF",
      fontFamily: "'JetBrains Mono', monospace",
      outline: "none",
    },
    exTimes: { fontSize: 11, color: "#A0A0A0", flexShrink: 0 },
    exRemove: {
      width: 24,
      height: 24,
      borderRadius: 6,
      background: "none",
      border: "none",
      color: "rgba(239,68,68,0.5)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      transition: "all 0.15s",
      flexShrink: 0,
    },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", color: "#A0A0A0" },
    emptyIcon: { fontSize: 36, marginBottom: 12, opacity: 0.3 },
    emptyText: { fontSize: 13, marginBottom: 14, textAlign: "center" },
    addBtn: {
      padding: "8px 14px",
      borderRadius: 8,
      background: "none",
      border: "1px dashed rgba(255,255,255,0.08)",
      color: "#22C55E",
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: 6,
    },
    actionRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 },
    neonBtn: {
      padding: "10px 20px",
      borderRadius: 10,
      background: "#22C55E",
      color: "#0A0A0A",
      fontWeight: 700,
      fontSize: 13,
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    ghostBtn: {
      padding: "10px 16px",
      borderRadius: 10,
      background: "#1D1D1D",
      border: "1px solid rgba(255,255,255,0.04)",
      color: "#A0A0A0",
      fontSize: 12,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s",
    },
    dangerBtn: {
      padding: "10px 16px",
      borderRadius: 10,
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.2)",
      color: "#EF4444",
      fontSize: 12,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s",
    },
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 20,
    },
    modal: {
      width: "100%",
      maxWidth: 520,
      maxHeight: "85vh",
      overflowY: "auto",
      background: "rgba(15,15,15,0.98)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 20,
      padding: 28,
    },
    modalTitle: { fontSize: 18, fontWeight: 800, color: "#FFFFFF", marginBottom: 16 },
    pickerItem: {
      padding: "10px 12px",
      borderRadius: 8,
      cursor: "pointer",
      transition: "all 0.15s",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.03)",
    },
    chip: (active) => ({
      padding: "6px 14px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      background: active ? "rgba(255,255,255,0.04)" : "#1D1D1D",
      border: `1px solid ${active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)"}`,
      color: active ? "#22C55E" : "#A0A0A0",
      cursor: "pointer",
      transition: "all 0.2s",
    }),
    templateGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 16 },
    templateCard: {
      padding: 16,
      borderRadius: 14,
      background: "#151515",
      border: "1px solid rgba(255,255,255,0.04)",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    templateName: { fontSize: 14, fontWeight: 700, color: "#FFFFFF", marginBottom: 4 },
    templateDesc: { fontSize: 11, color: "#A0A0A0", marginBottom: 8 },
    savedCard: {
      padding: 16,
      borderRadius: 14,
      background: "#151515",
      border: "1px solid rgba(255,255,255,0.04)",
      marginBottom: 8,
      transition: "all 0.2s",
    },
    savedName: { fontSize: 14, fontWeight: 700, color: "#FFFFFF", marginBottom: 4 },
    savedMeta: { fontSize: 11, color: "#A0A0A0", marginBottom: 10 },
    statRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 },
    stat: { fontSize: 12, color: "#A0A0A0" },
    statVal: { color: "#22C55E", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  };

  const renderExercises = (day) => {
    const exercises = week[day];
    if (exercises.length === 0) {
      return (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>📋</div>
          <div style={s.emptyText}>No exercises for this day</div>
          <button style={s.addBtn} onClick={() => setShowPicker(true)}>
            + Add Exercise
          </button>
        </div>
      );
    }
    return (
      <div>
        {exercises.map((ex) => (
          <motion.div
            key={ex.uid}
            style={s.exCard(dragItem?.uid === ex.uid)}
            draggable
            onDragStart={(e) => handleDragStart(e, ex.uid, day)}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            layout
            whileHover={{ background: "rgba(255,255,255,0.04)" }}
          >
            <span style={s.exGrip}>&#9776;</span>
            <div style={s.exInfo}>
              <div style={s.exName}>{ex.name}</div>
              <div style={s.exMeta}>{ex.primary}</div>
            </div>
            <div style={s.exInputs}>
              <input
                style={s.smallInput}
                type="number"
                min="1"
                value={ex.sets}
                onChange={(e) =>
                  updateExercise(day, ex.uid, "sets", Math.max(1, +e.target.value || 1))
                }
              />
              <span style={s.exTimes}>×</span>
              <input
                style={s.smallInput}
                type="number"
                min="1"
                value={ex.reps}
                onChange={(e) =>
                  updateExercise(day, ex.uid, "reps", Math.max(1, +e.target.value || 1))
                }
              />
            </div>
            <button
              style={s.exRemove}
              onClick={() => removeExercise(day, ex.uid)}
              onMouseEnter={(e) => (e.target.style.color = "#EF4444")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(239,68,68,0.5)")}
            >
              ✕
            </button>
          </motion.div>
        ))}
        <button style={{ ...s.addBtn, marginTop: 8, width: "100%", justifyContent: "center" }} onClick={() => setShowPicker(true)}>
          + Add Exercise
        </button>
      </div>
    );
  };

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Workout Planner</h2>
          <p style={s.subtitle}>Plan your weekly training split</p>
        </div>
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(view === "planner" ? s.tabActive : {}) }} onClick={() => setView("planner")}>
            Planner
          </button>
          <button style={{ ...s.tab, ...(view === "saved" ? s.tabActive : {}) }} onClick={() => setView("saved")}>
            Saved ({(state.workoutTemplates || []).filter((t) => t.type === "weekly").length})
          </button>
        </div>
      </div>

      {view === "planner" && (
        <>
          <div style={s.statRow}>
            <span style={s.stat}>
              Total: <span style={s.statVal}>{totalExercises}</span> exercises
            </span>
            <span style={s.stat}>
              Active: <span style={s.statVal}>{DAYS.filter((d) => week[d].length > 0).length}</span> days
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <button
              style={{ ...s.neonBtn, fontSize: 12, padding: "8px 16px" }}
              onClick={() => setTemplateModal(true)}
            >
              Templates
            </button>
            <button
              style={{ ...s.ghostBtn, fontSize: 12, padding: "8px 14px" }}
              onClick={() => setShowSaveModal(true)}
              disabled={totalExercises === 0}
            >
              Save Routine
            </button>
            <button
              style={{
                ...s.ghostBtn,
                fontSize: 12,
                padding: "8px 14px",
                color: week[activeDay].length > 0 ? "#22C55E" : "#A0A0A0",
                borderColor: week[activeDay].length > 0 ? "rgba(255,255,255,0.12)" : undefined,
              }}
              onClick={startTodaysWorkout}
              disabled={week[activeDay].length === 0}
            >
              ▶ Start {activeDay}&apos;s Workout
            </button>
          </div>

          <div style={s.dayBar}>
            {DAYS.map((d) => {
              const isToday = d === currentDayName;
              const isActive = d === activeDay;
              const has = week[d].length > 0;
              return (
                <button key={d} style={s.dayBtn(isToday, isActive, has)} onClick={() => setActiveDay(d)}>
                  {isToday && <span style={s.todayDot} />}
                  <div style={s.dayLabel}>{d}</div>
                  <div style={s.dayCount(has)}>{week[d].length}</div>
                </button>
              );
            })}
          </div>

          <motion.div
            style={dragOverDay === activeDay ? s.panelDrop : s.panel}
            onDragOver={(e) => handleDragOver(e, activeDay)}
            onDrop={(e) => handleDrop(e, activeDay)}
            layout
          >
            <div style={s.dayTitle}>
              <div style={s.dayTitleLeft}>
                <span>{activeDay}</span>
                {activeDay === currentDayName && (
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#22C55E", fontWeight: 600 }}>
                    TODAY
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  style={{ ...s.ghostBtn, padding: "4px 10px", fontSize: 11 }}
                  onClick={() => duplicateDay(activeDay)}
                  title="Duplicate day"
                >
                  Duplicate
                </button>
                <button
                  style={{ ...s.dangerBtn, padding: "4px 10px", fontSize: 11 }}
                  onClick={() => clearDay(activeDay)}
                  title="Clear day"
                >
                  Clear
                </button>
              </div>
            </div>
            <AnimatePresence mode="popLayout">{renderExercises(activeDay)}</AnimatePresence>
          </motion.div>
        </>
      )}

      {view === "saved" && (
        <div>
          {(state.workoutTemplates || []).filter((t) => t.type === "weekly").length === 0 ? (
            <div style={{ ...s.emptyState, padding: "60px 16px" }}>
              <div style={s.emptyIcon}>📁</div>
              <div style={s.emptyText}>No saved routines yet</div>
              <button
                style={s.neonBtn}
                onClick={() => setView("planner")}
              >
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
                    style={s.savedCard}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <div style={s.savedName}>{t.name}</div>
                    <div style={s.savedMeta}>
                      {dayCount} day{dayCount !== 1 ? "s" : ""} · {exCount} exercise{exCount !== 1 ? "s" : ""}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                      {DAYS.filter((d) => (t.days?.[d] || []).length > 0).map((d) => (
                        <span key={d} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#22C55E", fontWeight: 600 }}>
                          {d}: {(t.days?.[d] || []).length} ex
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        style={{ ...s.neonBtn, fontSize: 12, padding: "7px 16px" }}
                        onClick={() => loadRoutine(t)}
                      >
                        Load
                      </button>
                      <button
                        style={{ ...s.ghostBtn, fontSize: 12, padding: "7px 14px" }}
                        onClick={() => duplicateRoutine(t)}
                      >
                        Duplicate
                      </button>
                      <button
                        style={{ ...s.dangerBtn, fontSize: 12, padding: "7px 14px" }}
                        onClick={() => {
                          if (confirm(`Delete "${t.name}"?`)) deleteRoutine(t.id);
                        }}
                      >
                        Delete
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
          <div style={s.overlay} onClick={() => setShowPicker(false)}>
            <motion.div
              style={s.modal}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={s.modalTitle}>Add Exercise</div>
                <button
                  style={{ background: "none", border: "none", color: "#A0A0A0", fontSize: 18, cursor: "pointer" }}
                  onClick={() => setShowPicker(false)}
                >
                  ✕
                </button>
              </div>
              <input
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.04)", color: "#FFFFFF", fontSize: 14, outline: "none", marginBottom: 12 }}
                placeholder="Search exercises..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                autoFocus
              />
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                {pickerResults.map((ex) => (
                  <div
                    key={ex.id}
                    style={s.pickerItem}
                    onClick={() => addExercise(ex)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{ex.name}</div>
                      <div style={{ fontSize: 11, color: "#A0A0A0" }}>{ex.primary} · {ex.sets}×{ex.reps}</div>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 16 }}>+</span>
                  </div>
                ))}
                {pickerResults.length === 0 && (
                  <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: "#A0A0A0" }}>
                    No exercises found
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {templateModal && (
          <div style={s.overlay} onClick={() => setTemplateModal(false)}>
            <motion.div
              style={s.modal}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={s.modalTitle}>Quick Templates</div>
                <button
                  style={{ background: "none", border: "none", color: "#A0A0A0", fontSize: 18, cursor: "pointer" }}
                  onClick={() => setTemplateModal(false)}
                >
                  ✕
                </button>
              </div>
              <p style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 16 }}>
                Pre-fill your week with a popular training split
              </p>
              <div style={s.templateGrid}>
                {Object.entries(TEMPLATES).map(([key, tmpl]) => {
                  const dayCount = Object.values(tmpl.days).filter((e) => e.length > 0).length;
                  const exCount = Object.values(tmpl.days).reduce((s, e) => s + e.length, 0);
                  return (
                    <motion.div
                      key={key}
                      style={s.templateCard}
                      whileHover={{ borderColor: "rgba(255,255,255,0.08)", transform: "translateY(-2px)" }}
                      onClick={() => applyTemplate(key)}
                    >
                      <div style={s.templateName}>{tmpl.name}</div>
                      <div style={s.templateDesc}>
                        {dayCount} day split · {exCount} exercises
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                        {Object.entries(tmpl.days)
                          .filter(([, e]) => e.length > 0)
                          .map(([day]) => (
                            <span key={day} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: "rgba(255,255,255,0.04)", color: "#22C55E" }}>
                              {day}
                            </span>
                          ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaveModal && (
          <div style={s.overlay} onClick={() => setShowSaveModal(false)}>
            <motion.div
              style={{ ...s.modal, maxWidth: 400 }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div style={s.modalTitle}>Save Routine</div>
              <input
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.04)", color: "#FFFFFF", fontSize: 14, outline: "none", marginBottom: 16 }}
                placeholder="Routine name..."
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                autoFocus
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...s.ghostBtn, flex: 1 }} onClick={() => setShowSaveModal(false)}>
                  Cancel
                </button>
                <button
                  style={{ ...s.neonBtn, flex: 1, opacity: !routineName.trim() || totalExercises === 0 ? 0.5 : 1 }}
                  onClick={saveRoutine}
                  disabled={!routineName.trim() || totalExercises === 0}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
