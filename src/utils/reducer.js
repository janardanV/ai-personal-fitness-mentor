import { EXERCISE_DB, SAVE_ACTIONS } from "./constants";
import { calcE1RM, calcStreak } from "./calculations";

export const mkInitial = () => ({
  profile: null, settings: {}, workouts: [], nutrition: [], recovery: [], bodyWeight: [], water: {},
  badges: [], xp: 0, level: 1, currentProgram: null, pendingWorkout: null, savedPrograms: [],
  aiHistory: [], aiConversations: [], activeSession: null, personalRecords: {}, workoutTemplates: [],
  customExercises: [], runs: [], runningGoals: { dailyKm: 5, weeklyKm: 25, monthlyKm: 100, calories: 500, streakTarget: 7 },
  runningPRs: {}, runningBadges: [], goals: [], notifications: [], favoriteMeals: [],
});

export function reducer(state, action) {
  switch (action.type) {
    case "LOAD_DATA": {
      const initial = mkInitial();
      const loaded = action.payload || {};
      return {
        ...initial,
        ...loaded,
        profile: loaded.profile || initial.profile,
        settings: loaded.settings || initial.settings,
        workouts: Array.isArray(loaded.workouts) ? loaded.workouts : initial.workouts,
        nutrition: Array.isArray(loaded.nutrition) ? loaded.nutrition : initial.nutrition,
        recovery: Array.isArray(loaded.recovery) ? loaded.recovery : initial.recovery,
        bodyWeight: Array.isArray(loaded.bodyWeight) ? loaded.bodyWeight : initial.bodyWeight,
        water: loaded.water || initial.water,
        badges: Array.isArray(loaded.badges) ? loaded.badges : initial.badges,
        xp: typeof loaded.xp === "number" ? loaded.xp : initial.xp,
        level: typeof loaded.level === "number" ? loaded.level : initial.level,
        savedPrograms: Array.isArray(loaded.savedPrograms) ? loaded.savedPrograms : initial.savedPrograms,
        aiHistory: Array.isArray(loaded.aiHistory) ? loaded.aiHistory : initial.aiHistory,
        aiConversations: Array.isArray(loaded.aiConversations) ? loaded.aiConversations : initial.aiConversations,
        personalRecords: loaded.personalRecords || initial.personalRecords,
        workoutTemplates: Array.isArray(loaded.workoutTemplates) ? loaded.workoutTemplates : initial.workoutTemplates,
        customExercises: Array.isArray(loaded.customExercises) ? loaded.customExercises : initial.customExercises,
        runs: Array.isArray(loaded.runs) ? loaded.runs : initial.runs,
        runningGoals: loaded.runningGoals || initial.runningGoals,
        runningPRs: loaded.runningPRs || initial.runningPRs,
        runningBadges: Array.isArray(loaded.runningBadges) ? loaded.runningBadges : initial.runningBadges,
        goals: Array.isArray(loaded.goals) ? loaded.goals : initial.goals,
        notifications: Array.isArray(loaded.notifications) ? loaded.notifications : initial.notifications,
        favoriteMeals: Array.isArray(loaded.favoriteMeals) ? loaded.favoriteMeals : initial.favoriteMeals,
      };
    }
    case "SET_AI_CONVERSATIONS": {
      return { ...state, aiConversations: action.payload };
    }
    case "COMPLETE_ONBOARDING": {
      const { currentProgram, ...profileData } = action.payload;
      const newState = { ...state, profile: profileData, currentProgram };
      return newState;
    }
    case "ADD_WORKOUT": {
      const xpGain = 50;
      const workouts = [...state.workouts, action.payload];
      const badges = [...state.badges];
      if (!badges.includes("first_workout") && workouts.length >= 1) badges.push("first_workout");
      if (!badges.includes("week_streak") && calcStreak(workouts) >= 7) badges.push("week_streak");
      if (!badges.includes("ten_workouts") && workouts.length >= 10) badges.push("ten_workouts");
      if (!badges.includes("hundred_workouts") && workouts.length >= 100) badges.push("hundred_workouts");
      if (!badges.includes("volume_1000") && action.payload.totalVolume >= 1000) badges.push("volume_1000");
      const xp = state.xp + xpGain;
      const level = Math.floor(xp / 500) + 1;
      const newState = { ...state, workouts, badges, xp, level };
      return newState;
    }
    case "ADD_NUTRITION": {
      const entry = {
        ...action.payload,
        calories: Math.max(0, Math.min(10000, Number(action.payload.calories) || 0)),
        protein: Math.max(0, Math.min(1000, Number(action.payload.protein) || 0)),
        carbs: Math.max(0, Math.min(1000, Number(action.payload.carbs) || 0)),
        fat: Math.max(0, Math.min(1000, Number(action.payload.fat) || 0)),
      };
      const nutrition = [...state.nutrition, entry];
      const nutDays = [...new Set(nutrition.map(n => n.date))];
      const badges = [...state.badges];
      if (!badges.includes("nutrition_week") && nutDays.length >= 7) badges.push("nutrition_week");
      const newState = { ...state, nutrition, badges };
      return newState;
    }
    case "EDIT_NUTRITION": {
      const nutrition = state.nutrition.map(n => n.id === action.payload.id ? { ...n, ...action.payload } : n);
      const newState = { ...state, nutrition };
      return newState;
    }
    case "DELETE_NUTRITION": {
      const nutrition = state.nutrition.filter(n => n.id !== action.payload);
      const newState = { ...state, nutrition };
      return newState;
    }
    case "DUPLICATE_NUTRITION": {
      const nutrition = [...state.nutrition, { ...action.payload, id: Date.now() }];
      const newState = { ...state, nutrition };
      return newState;
    }
    case "ADD_RECOVERY": {
      const recovery = state.recovery.filter(r => r.date !== action.payload.date);
      const newState = { ...state, recovery: [...recovery, action.payload] };
      return newState;
    }
    case "ADD_WEIGHT": {
      const weight = Math.max(20, Math.min(500, Number(action.payload.weight) || 75));
      const bw = state.bodyWeight.filter(w => w.date !== action.payload.date);
      const newState = { ...state, bodyWeight: [...bw, { ...action.payload, weight }].sort((a, b) => a.date.localeCompare(b.date)) };
      return newState;
    }
    case "LOG_WATER": {
      const w = state.water || {};
      const water = { ...w, [action.payload.date]: Math.max(0, (w[action.payload.date] || 0) + action.payload.amount) };
      const newState = { ...state, water };
      return newState;
    }
    case "SET_WATER": {
      const w = state.water || {};
      const water = { ...w, [action.payload.date]: Math.max(0, action.payload.amount) };
      const newState = { ...state, water };
      return newState;
    }
    case "SET_PROGRAM": {
      const newState = { ...state, currentProgram: action.payload };
      return newState;
    }
    case "SAVE_PROGRAM": {
      const savedPrograms = [...state.savedPrograms, { ...action.payload, id: action.payload.id || Date.now(), savedAt: new Date().toISOString() }];
      const newState = { ...state, savedPrograms };
      return newState;
    }
    case "UPDATE_PROGRAM": {
      const savedPrograms = state.savedPrograms.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p);
      const newState = { ...state, savedPrograms };
      return newState;
    }
    case "DELETE_PROGRAM": {
      const savedPrograms = state.savedPrograms.filter(p => p.id !== action.payload);
      const newState = { ...state, savedPrograms, currentProgram: state.currentProgram?.id === action.payload ? null : state.currentProgram };
      return newState;
    }
    case "SET_ACTIVE_PROGRAM": {
      const newState = { ...state, currentProgram: action.payload };
      return newState;
    }
    case "SET_PENDING_WORKOUT": {
      const pw = action.payload;
      const session = {
        id: Date.now(), date: new Date().toISOString().split("T")[0], startTime: new Date().toISOString(),
        name: pw.name || "Workout",
        exercises: (pw.exercises || []).map(e => {
          const exDef = EXERCISE_DB.find(d => d.name === e.name) || EXERCISE_DB.find(d => d.name.toLowerCase() === (e.name || "").toLowerCase()) || {};
          return {
            exerciseId: exDef.id || `custom_${Date.now()}`, exerciseName: e.name || exDef.name || "Unknown", notes: "",
            prevWeight: 0, prevReps: 0,
            sets: Array.from({ length: e.sets || exDef.defaultSets || 3 }, (_, i) => ({
              setNum: i + 1, weight: 0, reps: parseInt(String(e.reps || exDef.defaultReps || 8).replace(/[^0-9]/g, "")) || 8,
              rpe: e.rpe || 0, done: false, isWarmup: false, isDropset: false,
            })),
          };
        }),
      };
      const newState = { ...state, pendingWorkout: pw, activeSession: session };
      return newState;
    }
    case "CLEAR_PENDING_WORKOUT": {
      const { pendingWorkout, ...rest } = state;
      return rest;
    }
    case "START_SESSION": {
      const newState = { ...state, activeSession: action.payload };
      return newState;
    }
    case "UPDATE_SESSION": {
      if (!state.activeSession) return state;
      const newState = { ...state, activeSession: { ...state.activeSession, ...action.payload } };
      return newState;
    }
    case "ADD_EXERCISE_TO_SESSION": {
      if (!state.activeSession) return state;
      const exDef = EXERCISE_DB.find(e => e.id === action.payload.exerciseId) || {};
      const newExercise = {
        exerciseId: action.payload.exerciseId,
        exerciseName: action.payload.exerciseName || exDef.name || "Unknown",
        notes: "",
        prevWeight: 0,
        prevReps: 0,
        sets: Array.from({ length: action.payload.sets || exDef.defaultSets || 3 }, (_, i) => ({
          setNum: i + 1, weight: 0, reps: exDef.defaultReps || 10, rpe: 0, done: false, isWarmup: false, isDropset: false,
        })),
      };
      const exercises = [...state.activeSession.exercises, newExercise];
      const newState = { ...state, activeSession: { ...state.activeSession, exercises } };
      return newState;
    }
    case "REMOVE_EXERCISE_FROM_SESSION": {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.filter((_, i) => i !== action.payload);
      const newState = { ...state, activeSession: { ...state.activeSession, exercises } };
      return newState;
    }
    case "REORDER_EXERCISES": {
      if (!state.activeSession) return state;
      const exercises = [...state.activeSession.exercises];
      const [moved] = exercises.splice(action.payload.from, 1);
      exercises.splice(action.payload.to, 0, moved);
      const newState = { ...state, activeSession: { ...state.activeSession, exercises } };
      return newState;
    }
    case "UPDATE_EXERCISE_NOTES": {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((ex, i) => i === action.payload.index ? { ...ex, notes: action.payload.notes } : ex);
      const newState = { ...state, activeSession: { ...state.activeSession, exercises } };
      return newState;
    }
    case "ADD_SET_TO_EXERCISE": {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((ex, i) => {
        if (i !== action.payload.exerciseIndex) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet = { setNum: ex.sets.length + 1, weight: lastSet?.weight || 0, reps: lastSet?.reps || 10, rpe: 0, done: false, isWarmup: false, isDropset: false };
        return { ...ex, sets: [...ex.sets, newSet] };
      });
      const newState = { ...state, activeSession: { ...state.activeSession, exercises } };
      return newState;
    }
    case "REMOVE_SET_FROM_EXERCISE": {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((ex, i) => {
        if (i !== action.payload.exerciseIndex) return ex;
        return { ...ex, sets: ex.sets.filter((_, si) => si !== action.payload.setIndex) };
      });
      const newState = { ...state, activeSession: { ...state.activeSession, exercises } };
      return newState;
    }
    case "UPDATE_SET": {
      if (!state.activeSession) return state;
      const { exerciseIndex, setIndex, field, value } = action.payload;
      const sanitized = field === "weight" ? Math.max(0, Math.min(999, Number(value) || 0))
        : field === "reps" ? Math.max(0, Math.min(999, Number(value) || 0))
        : field === "rpe" ? Math.max(0, Math.min(10, Number(value) || 0))
        : value;
      const exercises = state.activeSession.exercises.map((ex, i) => {
        if (i !== exerciseIndex) return ex;
        const sets = ex.sets.map((s, si) => si === setIndex ? { ...s, [field]: sanitized } : s);
        return { ...ex, sets };
      });
      const newState = { ...state, activeSession: { ...state.activeSession, exercises } };
      return newState;
    }
    case "TOGGLE_SET_DONE": {
      if (!state.activeSession) return state;
      const { exerciseIndex, setIndex } = action.payload;
      const exercises = state.activeSession.exercises.map((ex, i) => {
        if (i !== exerciseIndex) return ex;
        const sets = ex.sets.map((s, si) => si === setIndex ? { ...s, done: !s.done } : s);
        return { ...ex, sets };
      });
      const newState = { ...state, activeSession: { ...state.activeSession, exercises } };
      return newState;
    }
    case "FINISH_SESSION": {
      const session = state.activeSession;
      if (!session) return state;
      const completedWorkout = {
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: new Date().toISOString(),
        duration: Math.round((Date.now() - new Date(session.startTime).getTime()) / 60000),
        name: session.name || "Workout",
        exercises: session.exercises,
        totalVolume: session.exercises.reduce((sum, ex) =>
          sum + ex.sets.filter(s => s.done).reduce((s2, set) => s2 + (set.weight || 0) * (set.reps || 0), 0), 0),
        totalSets: session.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.done).length, 0),
        totalReps: session.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.done).reduce((s2, set) => s2 + (set.reps || 0), 0), 0),
        calories: action.payload?.calories || 0,
        prs: action.payload?.prs || [],
      };
      const workouts = [...state.workouts, completedWorkout];
      let personalRecords = { ...state.personalRecords };
      completedWorkout.exercises.forEach(ex => {
        ex.sets.filter(s => s.done && s.weight > 0).forEach(set => {
          const key = ex.exerciseId;
          const prev = personalRecords[key];
          if (!prev || set.weight > prev.weight || (set.weight === prev.weight && set.reps > prev.reps)) {
            personalRecords[key] = { weight: set.weight, reps: set.reps, date: completedWorkout.date, e1rm: calcE1RM(set.weight, set.reps) };
          }
        });
      });
      let xp = state.xp + 50;
      let badges = [...state.badges];
      if (!badges.includes("first_workout")) badges.push("first_workout");
      const totalWorkouts = workouts.length;
      if (!badges.includes("ten_workouts") && totalWorkouts >= 10) badges.push("ten_workouts");
      if (!badges.includes("hundred_workouts") && totalWorkouts >= 100) badges.push("hundred_workouts");
      if (!badges.includes("volume_1000") && completedWorkout.totalVolume >= 1000) badges.push("volume_1000");
      const streak = calcStreak(workouts);
      if (!badges.includes("week_streak") && streak >= 7) badges.push("week_streak");
      const level = Math.floor(xp / 500) + 1;
      const newState = { ...state, workouts, personalRecords, activeSession: null, xp, level, badges };
      return newState;
    }
    case "DISCARD_SESSION": {
      const newState = { ...state, activeSession: null };
      return newState;
    }
    case "SAVE_TEMPLATE": {
      const workoutTemplates = [...state.workoutTemplates, { ...action.payload, id: action.payload.id || Date.now(), createdAt: new Date().toISOString() }];
      const newState = { ...state, workoutTemplates };
      return newState;
    }
    case "DELETE_TEMPLATE": {
      const workoutTemplates = state.workoutTemplates.filter(t => t.id !== action.payload);
      const newState = { ...state, workoutTemplates };
      return newState;
    }
    case "UPDATE_TEMPLATE": {
      const workoutTemplates = state.workoutTemplates.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t);
      const newState = { ...state, workoutTemplates };
      return newState;
    }
    case "ADD_CUSTOM_EXERCISE": {
      const customExercises = [...state.customExercises, { ...action.payload, id: action.payload.id || `custom_${Date.now()}` }];
      const newState = { ...state, customExercises };
      return newState;
    }
    case "DELETE_CUSTOM_EXERCISE": {
      const customExercises = state.customExercises.filter(e => e.id !== action.payload);
      const newState = { ...state, customExercises };
      return newState;
    }
    case "UPDATE_PROFILE": {
      const newState = { ...state, profile: { ...state.profile, ...action.payload } };
      return newState;
    }
    case "SAVE_RUN": {
      const run = action.payload;
      const runs = [...state.runs, run];
      let runningPRs = { ...state.runningPRs };
      if (!runningPRs.fastest1km || (run.avgPace > 0 && run.avgPace < runningPRs.fastest1km.pace)) {
        runningPRs.fastest1km = { pace: run.avgPace, date: run.date };
      }
      if (!runningPRs.longestDistance || run.distance > runningPRs.longestDistance.distance) {
        runningPRs.longestDistance = { distance: run.distance, date: run.date };
      }
      if (!runningPRs.longestDuration || run.duration > runningPRs.longestDuration.duration) {
        runningPRs.longestDuration = { duration: run.duration, date: run.date };
      }
      if (!runningPRs.highestCalories || run.calories > runningPRs.highestCalories.calories) {
        runningPRs.highestCalories = { calories: run.calories, date: run.date };
      }
      let runningBadges = [...(state.runningBadges || [])];
      const totalRuns = runs.length;
      const totalDist = runs.reduce((s, r) => s + r.distance, 0);
      const xp = state.xp + 30;
      const level = Math.floor(xp / 500) + 1;
      const newState = { ...state, runs, runningPRs, runningBadges, xp, level };
      return newState;
    }
    case "DELETE_RUN": {
      const runs = state.runs.filter((r) => r.id !== action.payload);
      const newState = { ...state, runs };
      return newState;
    }
    case "SET_RUNNING_GOALS": {
      const newState = { ...state, runningGoals: action.payload };
      return newState;
    }
    case "ADD_GOAL": {
      return { ...state, goals: [...state.goals, action.payload] };
    }
    case "UPDATE_GOAL": {
      return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? { ...g, ...action.payload.updates } : g) };
    }
    case "DELETE_GOAL": {
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
    }
    case "ADD_NOTIFICATION": {
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 100) };
    }
    case "MARK_NOTIFICATION_READ": {
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    }
    case "CLEAR_NOTIFICATIONS": {
      return { ...state, notifications: [] };
    }
    case "UPDATE_SETTINGS": {
      return { ...state, settings: { ...state.settings, ...action.payload } };
    }
    case "ADD_FAVORITE_MEAL": {
      return { ...state, favoriteMeals: [...state.favoriteMeals, action.payload] };
    }
    case "REMOVE_FAVORITE_MEAL": {
      return { ...state, favoriteMeals: state.favoriteMeals.filter(m => m.id !== action.payload) };
    }
    case "SAVE_BODY_RESULTS": {
      const p = state.profile || {};
      return { ...state, profile: { ...p, ...action.payload } };
    }
    case "RESET": {
      return mkInitial();
    }
    case "LOGOUT": {
      return mkInitial();
    }
    default: return state;
  }
}
