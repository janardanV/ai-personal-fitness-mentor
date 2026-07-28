import { useEffect, useState, useCallback } from "react";
import React from "react";
import { motion } from "framer-motion";

// -- Simple helpers -------------------------------------------------------
export const fmt = (n, dec = 0) => Number(n).toFixed(dec);
export const today = () => new Date().toISOString().split("T")[0];
export const weekAgo = () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split("T")[0]; };
export const uid = () => Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

// -- Exercise Database ----------------------------------------------------
export const EXERCISE_DB = [
  { id: "barbell_squat", name: "Barbell Squat", cat: "compound", primary: "Quadriceps", secondary: "Glutes, Hamstrings, Core", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 8 },
  { id: "front_squat", name: "Front Squat", cat: "compound", primary: "Quadriceps", secondary: "Core, Upper Back", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 6 },
  { id: "goblet_squat", name: "Goblet Squat", cat: "compound", primary: "Quadriceps", secondary: "Glutes, Core", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "leg_press", name: "Leg Press", cat: "compound", primary: "Quadriceps", secondary: "Glutes, Hamstrings", equip: "Machine", type: "strength", defaultSets: 4, defaultReps: 10 },
  { id: "hack_squat", name: "Hack Squat", cat: "compound", primary: "Quadriceps", secondary: "Glutes", equip: "Machine", type: "strength", defaultSets: 4, defaultReps: 10 },
  { id: "bulgarian_split", name: "Bulgarian Split Squat", cat: "compound", primary: "Quadriceps", secondary: "Glutes, Hamstrings", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "walking_lunge", name: "Walking Lunge", cat: "compound", primary: "Quadriceps", secondary: "Glutes, Hamstrings", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "leg_extension", name: "Leg Extension", cat: "isolation", primary: "Quadriceps", secondary: "", equip: "Machine", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "leg_curl", name: "Leg Curl", cat: "isolation", primary: "Hamstrings", secondary: "", equip: "Machine", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "romanian_deadlift", name: "Romanian Deadlift", cat: "compound", primary: "Hamstrings", secondary: "Glutes, Lower Back", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 8 },
  { id: "stiff_leg_dl", name: "Stiff-Leg Deadlift", cat: "compound", primary: "Hamstrings", secondary: "Lower Back", equip: "Barbell", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "hip_thrust", name: "Hip Thrust", cat: "compound", primary: "Glutes", secondary: "Hamstrings, Core", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 10 },
  { id: "glute_bridge", name: "Glute Bridge", cat: "isolation", primary: "Glutes", secondary: "Hamstrings", equip: "Bodyweight", type: "strength", defaultSets: 3, defaultReps: 15 },
  { id: "calf_raise", name: "Standing Calf Raise", cat: "isolation", primary: "Calves", secondary: "", equip: "Machine", type: "strength", defaultSets: 4, defaultReps: 15 },
  { id: "seated_calf", name: "Seated Calf Raise", cat: "isolation", primary: "Calves", secondary: "", equip: "Machine", type: "strength", defaultSets: 4, defaultReps: 20 },
  { id: "deadlift", name: "Conventional Deadlift", cat: "compound", primary: "Back", secondary: "Hamstrings, Glutes, Core, Forearms", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 5 },
  { id: "sumo_deadlift", name: "Sumo Deadlift", cat: "compound", primary: "Back", secondary: "Quadriceps, Glutes, Hamstrings", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 5 },
  { id: "barbell_row", name: "Barbell Row", cat: "compound", primary: "Back", secondary: "Biceps, Rear Delts, Core", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 8 },
  { id: "pendlay_row", name: "Pendlay Row", cat: "compound", primary: "Back", secondary: "Biceps, Rear Delts", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 6 },
  { id: "dumbbell_row", name: "Dumbbell Row", cat: "compound", primary: "Back", secondary: "Biceps, Rear Delts", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "cable_row", name: "Cable Row", cat: "compound", primary: "Back", secondary: "Biceps, Rear Delts", equip: "Cable", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "lat_pulldown", name: "Lat Pulldown", cat: "compound", primary: "Back", secondary: "Biceps", equip: "Cable", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "pull_up", name: "Pull-Up", cat: "compound", primary: "Back", secondary: "Biceps, Core", equip: "Bodyweight", type: "strength", defaultSets: 4, defaultReps: 8 },
  { id: "chin_up", name: "Chin-Up", cat: "compound", primary: "Back", secondary: "Biceps, Core", equip: "Bodyweight", type: "strength", defaultSets: 4, defaultReps: 8 },
  { id: "seated_row_machine", name: "Seated Row Machine", cat: "compound", primary: "Back", secondary: "Biceps", equip: "Machine", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "tbar_row", name: "T-Bar Row", cat: "compound", primary: "Back", secondary: "Biceps, Rear Delts", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 8 },
  { id: "face_pull", name: "Face Pull", cat: "isolation", primary: "Rear Delts", secondary: "Rotator Cuff", equip: "Cable", type: "strength", defaultSets: 3, defaultReps: 15 },
  { id: "shrug", name: "Barbell Shrug", cat: "isolation", primary: "Traps", secondary: "Forearms", equip: "Barbell", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "bench_press", name: "Barbell Bench Press", cat: "compound", primary: "Chest", secondary: "Triceps, Front Delts", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 8 },
  { id: "incline_bench", name: "Incline Bench Press", cat: "compound", primary: "Chest", secondary: "Front Delts, Triceps", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 8 },
  { id: "decline_bench", name: "Decline Bench Press", cat: "compound", primary: "Chest", secondary: "Triceps", equip: "Barbell", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "db_bench_press", name: "Dumbbell Bench Press", cat: "compound", primary: "Chest", secondary: "Triceps, Front Delts", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "db_incline_press", name: "Incline Dumbbell Press", cat: "compound", primary: "Chest", secondary: "Front Delts, Triceps", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "cable_fly", name: "Cable Fly", cat: "isolation", primary: "Chest", secondary: "Front Delts", equip: "Cable", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "db_fly", name: "Dumbbell Fly", cat: "isolation", primary: "Chest", secondary: "Front Delts", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "chest_dip", name: "Chest Dip", cat: "compound", primary: "Chest", secondary: "Triceps, Front Delts", equip: "Bodyweight", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "push_up", name: "Push-Up", cat: "compound", primary: "Chest", secondary: "Triceps, Core, Front Delts", equip: "Bodyweight", type: "strength", defaultSets: 3, defaultReps: 15 },
  { id: "machine_chest_press", name: "Machine Chest Press", cat: "compound", primary: "Chest", secondary: "Triceps, Front Delts", equip: "Machine", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "ohp", name: "Overhead Press", cat: "compound", primary: "Shoulders", secondary: "Triceps, Core", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 6 },
  { id: "db_ohp", name: "Dumbbell Shoulder Press", cat: "compound", primary: "Shoulders", secondary: "Triceps", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "arnold_press", name: "Arnold Press", cat: "compound", primary: "Shoulders", secondary: "Triceps", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "lateral_raise", name: "Lateral Raise", cat: "isolation", primary: "Side Delts", secondary: "", equip: "Dumbbell", type: "strength", defaultSets: 4, defaultReps: 15 },
  { id: "front_raise", name: "Front Raise", cat: "isolation", primary: "Front Delts", secondary: "", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "rear_delt_fly", name: "Rear Delt Fly", cat: "isolation", primary: "Rear Delts", secondary: "", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 15 },
  { id: "cable_lateral", name: "Cable Lateral Raise", cat: "isolation", primary: "Side Delts", secondary: "", equip: "Cable", type: "strength", defaultSets: 3, defaultReps: 15 },
  { id: "machine_shoulder", name: "Machine Shoulder Press", cat: "compound", primary: "Shoulders", secondary: "Triceps", equip: "Machine", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "upright_row", name: "Upright Row", cat: "compound", primary: "Shoulders", secondary: "Traps, Biceps", equip: "Barbell", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "barbell_curl", name: "Barbell Curl", cat: "isolation", primary: "Biceps", secondary: "Forearms", equip: "Barbell", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "db_curl", name: "Dumbbell Curl", cat: "isolation", primary: "Biceps", secondary: "Forearms", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "hammer_curl", name: "Hammer Curl", cat: "isolation", primary: "Biceps", secondary: "Forearms, Brachialis", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "preacher_curl", name: "Preacher Curl", cat: "isolation", primary: "Biceps", secondary: "", equip: "EZ-Bar", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "cable_curl", name: "Cable Curl", cat: "isolation", primary: "Biceps", secondary: "", equip: "Cable", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "concentration_curl", name: "Concentration Curl", cat: "isolation", primary: "Biceps", secondary: "", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "tricep_pushdown", name: "Tricep Pushdown", cat: "isolation", primary: "Triceps", secondary: "", equip: "Cable", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "skull_crusher", name: "Skull Crusher", cat: "isolation", primary: "Triceps", secondary: "", equip: "EZ-Bar", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "overhead_ext", name: "Overhead Tricep Extension", cat: "isolation", primary: "Triceps", secondary: "", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "dip_tricep", name: "Tricep Dip", cat: "compound", primary: "Triceps", secondary: "Chest, Front Delts", equip: "Bodyweight", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "close_grip_bench", name: "Close-Grip Bench Press", cat: "compound", primary: "Triceps", secondary: "Chest, Front Delts", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 6 },
  { id: "french_press", name: "French Press", cat: "isolation", primary: "Triceps", secondary: "", equip: "EZ-Bar", type: "strength", defaultSets: 3, defaultReps: 10 },
  { id: "wrist_curl", name: "Wrist Curl", cat: "isolation", primary: "Forearms", secondary: "", equip: "Barbell", type: "strength", defaultSets: 3, defaultReps: 15 },
  { id: "reverse_curl", name: "Reverse Curl", cat: "isolation", primary: "Forearms", secondary: "Biceps", equip: "EZ-Bar", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "plank", name: "Plank", cat: "isolation", primary: "Core", secondary: "Shoulders, Glutes", equip: "Bodyweight", type: "strength", defaultSets: 3, defaultReps: 60 },
  { id: "crunch", name: "Crunch", cat: "isolation", primary: "Core", secondary: "", equip: "Bodyweight", type: "strength", defaultSets: 3, defaultReps: 20 },
  { id: "hanging_leg_raise", name: "Hanging Leg Raise", cat: "isolation", primary: "Core", secondary: "Hip Flexors", equip: "Bodyweight", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "russian_twist", name: "Russian Twist", cat: "isolation", primary: "Core", secondary: "Obliques", equip: "Bodyweight", type: "strength", defaultSets: 3, defaultReps: 20 },
  { id: "ab_rollout", name: "Ab Rollout", cat: "compound", primary: "Core", secondary: "Lats, Shoulders", equip: "Ab Wheel", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "cable_crunch", name: "Cable Crunch", cat: "isolation", primary: "Core", secondary: "", equip: "Cable", type: "strength", defaultSets: 3, defaultReps: 15 },
  { id: "dead_bug", name: "Dead Bug", cat: "isolation", primary: "Core", secondary: "", equip: "Bodyweight", type: "strength", defaultSets: 3, defaultReps: 12 },
  { id: "turkish_getup", name: "Turkish Get-Up", cat: "compound", primary: "Core", secondary: "Shoulders, Hips, Full Body", equip: "Kettlebell", type: "strength", defaultSets: 3, defaultReps: 5 },
  { id: "kettlebell_swing", name: "Kettlebell Swing", cat: "compound", primary: "Glutes", secondary: "Hamstrings, Core, Shoulders", equip: "Kettlebell", type: "strength", defaultSets: 3, defaultReps: 15 },
  { id: "clean_and_jerk", name: "Clean and Jerk", cat: "compound", primary: "Full Body", secondary: "Back, Shoulders, Legs", equip: "Barbell", type: "olympic", defaultSets: 5, defaultReps: 3 },
  { id: "snatch", name: "Snatch", cat: "compound", primary: "Full Body", secondary: "Back, Shoulders, Legs", equip: "Barbell", type: "olympic", defaultSets: 5, defaultReps: 3 },
  { id: "power_clean", name: "Power Clean", cat: "compound", primary: "Full Body", secondary: "Back, Shoulders, Legs", equip: "Barbell", type: "olympic", defaultSets: 5, defaultReps: 3 },
  { id: "push_press", name: "Push Press", cat: "compound", primary: "Shoulders", secondary: "Triceps, Legs", equip: "Barbell", type: "strength", defaultSets: 4, defaultReps: 5 },
  { id: "box_jump", name: "Box Jump", cat: "plyometric", primary: "Quadriceps", secondary: "Glutes, Calves", equip: "Bodyweight", type: "power", defaultSets: 4, defaultReps: 6 },
  { id: "burpee", name: "Burpee", cat: "bodyweight", primary: "Full Body", secondary: "Chest, Core, Legs", equip: "Bodyweight", type: "cardio", defaultSets: 3, defaultReps: 10 },
  { id: "mountain_climber", name: "Mountain Climber", cat: "bodyweight", primary: "Core", secondary: "Shoulders, Hip Flexors", equip: "Bodyweight", type: "cardio", defaultSets: 3, defaultReps: 20 },
  { id: "jump_squat", name: "Jump Squat", cat: "plyometric", primary: "Quadriceps", secondary: "Glutes, Calves", equip: "Bodyweight", type: "power", defaultSets: 3, defaultReps: 12 },
  { id: "battle_ropes", name: "Battle Ropes", cat: "cardio", primary: "Shoulders", secondary: "Core, Arms", equip: "Bands", type: "cardio", defaultSets: 3, defaultReps: 30 },
  { id: "farmers_walk", name: "Farmer's Walk", cat: "compound", primary: "Forearms", secondary: "Traps, Core, Shoulders", equip: "Dumbbell", type: "strength", defaultSets: 3, defaultReps: 40 },
  { id: "sled_push", name: "Sled Push", cat: "cardio", primary: "Quadriceps", secondary: "Glutes, Calves, Core", equip: "Machine", type: "cardio", defaultSets: 4, defaultReps: 30 },
  { id: "rowing_machine", name: "Rowing Machine", cat: "cardio", primary: "Back", secondary: "Legs, Core, Biceps", equip: "Machine", type: "cardio", defaultSets: 1, defaultReps: 500 },
  { id: "bike", name: "Stationary Bike", cat: "cardio", primary: "Quadriceps", secondary: "Hamstrings, Calves", equip: "Machine", type: "cardio", defaultSets: 1, defaultReps: 1 },
  { id: "treadmill", name: "Treadmill Running", cat: "cardio", primary: "Quadriceps", secondary: "Calves, Glutes, Core", equip: "Machine", type: "cardio", defaultSets: 1, defaultReps: 1 },
  { id: "assault_bike", name: "Assault Bike", cat: "cardio", primary: "Full Body", secondary: "Legs, Arms, Core", equip: "Machine", type: "cardio", defaultSets: 1, defaultReps: 1 },
  { id: "smith_machine_squat", name: "Smith Machine Squat", cat: "compound", primary: "Quadriceps", secondary: "Glutes", equip: "Smith Machine", type: "strength", defaultSets: 4, defaultReps: 8 },
  { id: "smith_machine_bench", name: "Smith Machine Bench Press", cat: "compound", primary: "Chest", secondary: "Triceps, Front Delts", equip: "Smith Machine", type: "strength", defaultSets: 4, defaultReps: 8 },
];
export const EXERCISES = EXERCISE_DB.map(e => e.name);
export const MUSCLE_GROUPS = [...new Set(EXERCISE_DB.map(e => e.primary))].sort();
export const EQUIPMENT_TYPES = [...new Set(EXERCISE_DB.map(e => e.equip))].sort();
export const EXERCISE_CATEGORIES = [...new Set(EXERCISE_DB.map(e => e.cat))].sort();

// -- Label / Badge / Color Constants --------------------------------------
export const GOAL_LABELS = { muscle: "Build Muscle", fat_loss: "Fat Loss", strength: "Strength", endurance: "Endurance", powerlifting: "Powerlifting", bodybuilding: "Bodybuilding", general: "General Fitness" };
export const BADGE_DEFS = [
  { id: "first_workout", icon: "\u{1F3CB}\u{FE0F}", label: "First Workout", desc: "Logged your first session" },
  { id: "week_streak", icon: "\u{1F525}", label: "7-Day Streak", desc: "7 consecutive active days" },
  { id: "ten_workouts", icon: "\u{1F4AA}", label: "10 Workouts", desc: "Completed 10 workouts" },
  { id: "hundred_workouts", icon: "\u{1F3C6}", label: "100 Workouts", desc: "Century club" },
  { id: "volume_1000", icon: "\u26A1", label: "1000kg Volume", desc: "1000kg in a single session" },
  { id: "nutrition_week", icon: "\u{1F957}", label: "Nutrition Week", desc: "7 days of nutrition tracking" },
];
export const COLORS = { primary: "#C8FF00", cyan: "#C8FF00", green: "#A5E600", amber: "#D9FF4D", red: "#FF4757", surface: "rgba(200,255,0,0.05)", border: "rgba(200,255,0,0.12)" };
export const SAVE_ACTIONS = new Set([
  "ADD_WORKOUT", "FINISH_SESSION",
  "ADD_NUTRITION", "EDIT_NUTRITION", "DELETE_NUTRITION", "DUPLICATE_NUTRITION",
  "ADD_RECOVERY", "ADD_WEIGHT", "LOG_WATER", "SET_WATER",
  "SAVE_RUN", "DELETE_RUN", "SET_RUNNING_GOALS",
  "ADD_GOAL", "UPDATE_GOAL", "DELETE_GOAL",
  "SAVE_PROGRAM", "UPDATE_PROGRAM", "DELETE_PROGRAM", "SET_ACTIVE_PROGRAM",
  "SAVE_TEMPLATE", "DELETE_TEMPLATE", "UPDATE_TEMPLATE",
  "ADD_CUSTOM_EXERCISE", "DELETE_CUSTOM_EXERCISE",
  "ADD_FAVORITE_MEAL", "REMOVE_FAVORITE_MEAL",
  "UPDATE_PROFILE", "COMPLETE_ONBOARDING", "SAVE_BODY_RESULTS",
  "UPDATE_SETTINGS", "RESET",
  "ADD_NOTIFICATION", "CLEAR_NOTIFICATIONS",
  "MARK_NOTIFICATION_READ",
]);
export const GUEST_PROFILE = {
  name: "Guest", email: "", photoURL: "", goal: "general", activity: "moderate",
  tdee: 2200, calories: 2000, protein: 150, age: 25, weight: 70, height: 175,
};

// -- USDA FoodData Central API --------------------------------------------
export const USDA_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USDA_API_KEY) || "DEMO_KEY";
export const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

const _searchCache = new Map();
let _debounceTimer = null;

export const usdaSearch = async (query) => {
  const key = query.trim().toLowerCase();
  if (_searchCache.has(key)) return _searchCache.get(key);
  const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(key)}&pageSize=10&api_key=${USDA_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USDA API error ${res.status}`);
  const data = await res.json();
  const results = (data.foods || []).map(f => {
    const nutrients = {};
    (f.foodNutrients || []).forEach(n => { nutrients[n.nutrientName] = n.value; });
    return {
      fdcId: f.fdcId, name: f.description, brand: f.brandOwner || null,
      category: f.foodCategory || "", servingSize: 100, servingUnit: "g",
      calories: nutrients["Energy"] || 0, protein: nutrients["Protein"] || 0,
      carbs: nutrients["Carbohydrate, by difference"] || 0, fat: nutrients["Total lipid (fat)"] || 0,
      saturatedFat: nutrients["Fatty acids, total saturated"] || 0, fiber: nutrients["Fiber, total dietary"] || 0,
      sugar: nutrients["Sugars, total including NLEA"] || nutrients["Sugars, total"] || 0,
      sodium: nutrients["Sodium, Na"] || 0, potassium: nutrients["Potassium, K"] || 0,
      cholesterol: nutrients["Cholesterol"] || 0,
    };
  });
  _searchCache.set(key, results);
  if (_searchCache.size > 200) { const firstKey = _searchCache.keys().next().value; _searchCache.delete(firstKey); }
  return results;
};

export const usdaDebouncedSearch = (query, cb) => {
  clearTimeout(_debounceTimer);
  if (!query.trim()) { cb([], false, null); return; }
  cb([], true, null);
  _debounceTimer = setTimeout(async () => {
    try { const results = await usdaSearch(query); cb(results, false, null); }
    catch (e) { cb([], false, e.message); }
  }, 400);
};

// -- Activity Multipliers -------------------------------------------------
export const ACTIVITY_MULTIPLIERS = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };

// -- Initial State Factory ------------------------------------------------
export const mkInitial = () => ({
  profile: null, settings: {}, workouts: [], nutrition: [], recovery: [], bodyWeight: [], water: {},
  badges: [], xp: 0, level: 1, currentProgram: null, pendingWorkout: null, savedPrograms: [],
  aiHistory: [], aiConversations: [], activeSession: null, personalRecords: {}, workoutTemplates: [],
  customExercises: [], runs: [], runningGoals: { dailyKm: 5, weeklyKm: 25, monthlyKm: 100, calories: 500, streakTarget: 7 },
  runningPRs: {}, runningBadges: [], goals: [], notifications: [], favoriteMeals: [],
});

// -- Coaching Calculations ------------------------------------------------
export const calcE1RM = (w, r) => r === 1 ? w : w * (1 + r / 30);
export const calcVolume = (sets) => sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
export const calcWeeklyVolume = (workouts) => {
  const wa = weekAgo();
  return workouts.filter(w => w.date >= wa).reduce((sum, w) => sum + w.totalVolume, 0);
};
export const calcStreak = (workouts) => {
  const days = [...new Set(workouts.map(w => w.date))].sort().reverse();
  let streak = 0;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  for (let i = 0; i < days.length; i++) {
    const d = new Date(days[i]); d.setHours(0, 0, 0, 0);
    const diff = Math.round((now - d) / 86400000);
    if (diff === streak) streak++;
    else break;
  }
  return streak;
};

// -- Theme / CSS ----------------------------------------------------------
export const G_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body, #root { min-height: 100vh; font-family: 'Inter', sans-serif; background: #0B0B0B; color: #FFFFFF; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(200,255,0,0.25); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(200,255,0,0.4); }
  input, select, textarea { background: #1D1D1D; border: 1px solid rgba(200,255,0,0.1); border-radius: 12px; color: #FFFFFF; padding: 10px 14px; font-family: 'Inter',sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; width: 100%; }
  input:focus, select:focus, textarea:focus { border-color: rgba(200,255,0,0.5); box-shadow: 0 0 0 3px rgba(200,255,0,0.06); }
  input[type=range] { padding: 0; height: 4px; cursor: pointer; accent-color: #C8FF00; }
  select option { background: #1D1D1D; }
  button { font-family: 'Inter', sans-serif; cursor: pointer; border: none; outline: none; }
  .glass { background: rgba(21,21,21,0.85); border: 1px solid rgba(200,255,0,0.1); border-radius: 16px; backdrop-filter: blur(16px); }
  .glass-sm { background: rgba(29,29,29,0.8); border: 1px solid rgba(200,255,0,0.08); border-radius: 12px; }
  .glow { box-shadow: 0 0 24px rgba(200,255,0,0.15); }
  .neon { background: linear-gradient(135deg, #C8FF00, #A5E600); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .neon-btn { background: #C8FF00; color: #0B0B0B; border-radius: 12px; padding: 10px 22px; font-weight: 700; font-size: 14px; letter-spacing: 0.01em; transition: all 0.2s; }
  .neon-btn:hover { background: #D9FF4D; transform: translateY(-1px); }
  .neon-btn:active { transform: scale(0.98); }
  .ghost-btn { background: #1D1D1D; border: 1px solid rgba(200,255,0,0.1); color: #A0A0A0; border-radius: 12px; padding: 8px 16px; font-size: 13px; transition: all 0.2s; }
  .ghost-btn:hover { background: rgba(200,255,0,0.08); color: #FFFFFF; border-color: rgba(200,255,0,0.3); }
  .tab-btn { background: none; color: #A0A0A0; padding: 8px 16px; font-size: 13px; font-weight: 500; border-radius: 10px; transition: all 0.2s; }
  .tab-btn.active { background: rgba(200,255,0,0.12); color: #C8FF00; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .badge-card { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px; border-radius: 14px; background: #181818; border: 1px solid rgba(200,255,0,0.08); text-align: center; font-size: 11px; color: #A0A0A0; }
  .badge-card.earned { border-color: rgba(200,255,0,0.4); background: rgba(200,255,0,0.08); color: #C8FF00; }
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes fadeInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
  @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-16px) rotate(2deg); } }
  @keyframes float2 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(-1.5deg); } }
  @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
  @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes ripple { to { transform: scale(4); opacity: 0; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes stepComplete { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
  @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 20px rgba(200,255,0,0.1); } 50% { box-shadow: 0 0 40px rgba(200,255,0,0.2); } }

  .onb-input-wrap { position: relative; margin-bottom: 20px; }
  .onb-input-wrap .onb-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(160,160,160,0.6); font-size: 16px; pointer-events: none; transition: color 0.2s; z-index: 1; }
  .onb-input-wrap input, .onb-input-wrap select { padding: 16px 16px 16px 44px !important; border-radius: 14px !important; font-size: 15px !important; background: #181818 !important; border: 1px solid rgba(200,255,0,0.08) !important; transition: all 0.25s ease !important; height: 52px; }
  .onb-input-wrap input:focus, .onb-input-wrap select:focus { border-color: #C8FF00 !important; background: rgba(200,255,0,0.03) !important; box-shadow: 0 0 0 3px rgba(200,255,0,0.08) !important; }
  .onb-input-wrap input:focus ~ .onb-icon, .onb-input-wrap select:focus ~ .onb-icon { color: #C8FF00; }
  .onb-input-wrap input::placeholder { color: rgba(160,160,160,0.35); }
  .onb-input-wrap label.onb-float { position: absolute; left: 44px; top: 50%; transform: translateY(-50%); color: rgba(160,160,160,0.45); font-size: 15px; pointer-events: none; transition: all 0.2s ease; background: transparent; padding: 0 4px; z-index: 2; }
  .onb-input-wrap input:focus ~ label.onb-float,
  .onb-input-wrap input:not(:placeholder-shown) ~ label.onb-float,
  .onb-input-wrap select:focus ~ label.onb-float,
  .onb-input-wrap select ~ label.onb-float { top: -8px; left: 36px; font-size: 11px; color: #C8FF00; background: #121212; letter-spacing: 0.03em; font-weight: 500; }
  .onb-input-wrap select option { background: #1D1D1D; padding: 10px; }

  .onb-grad-btn { position: relative; overflow: hidden; background: #C8FF00; color: #0B0B0B; border-radius: 14px; padding: 16px 32px; font-weight: 800; font-size: 15px; letter-spacing: 0.02em; transition: all 0.25s ease; border: none; cursor: pointer; width: 100%; }
  .onb-grad-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(200,255,0,0.25); background: #D9FF4D; }
  .onb-grad-btn:active { transform: translateY(0) scale(0.98); }
  .onb-grad-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; background: #A0A0A0; color: #1D1D1D; }
  .onb-grad-btn .btn-ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.25); width: 20px; height: 20px; margin-top: -10px; margin-left: -10px; animation: ripple 0.5s linear; pointer-events: none; }

  .onb-back-btn { background: #181818; border: 1px solid rgba(200,255,0,0.08); color: #A0A0A0; border-radius: 12px; padding: 14px 20px; font-size: 14px; font-weight: 500; transition: all 0.2s ease; cursor: pointer; }
  .onb-back-btn:hover { background: rgba(200,255,0,0.06); color: #FFFFFF; border-color: rgba(200,255,0,0.25); }

  .onb-goal-btn { padding: 14px 16px; border-radius: 14px; font-size: 13px; font-weight: 500; background: #151515; border: 1px solid rgba(200,255,0,0.06); color: #A0A0A0; transition: all 0.2s ease; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 10px; }
  .onb-goal-btn:hover { background: rgba(200,255,0,0.05); border-color: rgba(200,255,0,0.15); color: #FFFFFF; }
  .onb-goal-btn.selected { background: rgba(200,255,0,0.1); border-color: rgba(200,255,0,0.4); color: #C8FF00; box-shadow: 0 0 20px rgba(200,255,0,0.06); }
  .onb-goal-btn .goal-check { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(160,160,160,0.2); display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0; }
  .onb-goal-btn.selected .goal-check { border-color: #C8FF00; background: #C8FF00; }

  .onb-feature-card { background: #181818; border: 1px solid rgba(200,255,0,0.06); border-radius: 16px; padding: 20px; transition: all 0.25s ease; }
  .onb-feature-card:hover { background: #1D1D1D; border-color: rgba(200,255,0,0.12); transform: translateY(-2px); }
  .onb-feature-card .feat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px; }
  .onb-feature-card h4 { font-size: 14px; font-weight: 600; color: #FFFFFF; margin-bottom: 6px; }
  .onb-feature-card p { font-size: 12px; color: rgba(160,160,160,0.7); line-height: 1.5; }

  @media (max-width: 900px) {
    .onb-split { flex-direction: column !important; }
    .onb-hero { padding: 40px 24px 32px !important; text-align: center; }
    .onb-hero h1 { font-size: 28px !important; }
    .onb-hero .feat-grid { grid-template-columns: 1fr !important; }
    .onb-card-side { padding: 16px !important; }
  }
  @media (max-width: 480px) {
    .onb-hero h1 { font-size: 24px !important; }
    .onb-hero .onb-subtitle { font-size: 14px !important; }
  }

  /* ═══ Dashboard Premium Styles ═══ */
  .dash-header { position: relative; overflow: hidden; border-radius: 20px; padding: 28px 32px; background: linear-gradient(135deg, #151515 0%, #1D1D1D 100%); border: 1px solid rgba(200,255,0,0.1); backdrop-filter: blur(16px); }
  .dash-header::before { content: ''; position: absolute; top: -50%; right: -10%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%); pointer-events: none; }
  .dash-header::after { content: ''; position: absolute; bottom: -40%; left: 20%; width: 200px; height: 200px; background: radial-gradient(circle, rgba(165,230,0,0.04) 0%, transparent 70%); pointer-events: none; }

  .dash-metric { position: relative; background: #151515; border: 1px solid rgba(200,255,0,0.08); border-radius: 16px; padding: 20px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; cursor: default; }
  .dash-metric::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent, #C8FF00), transparent); opacity: 0; transition: opacity 0.3s; }
  .dash-metric:hover { transform: translateY(-2px); border-color: rgba(200,255,0,0.15); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .dash-metric:hover::before { opacity: 1; }

  .dash-quick { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 14px; background: #151515; border: 1px solid rgba(200,255,0,0.06); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
  .dash-quick:hover { background: rgba(200,255,0,0.06); border-color: rgba(200,255,0,0.15); transform: translateY(-1px); }
  .dash-quick:active { transform: translateY(0) scale(0.98); }
  .dash-quick .q-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }

  .dash-progress { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.05); overflow: hidden; position: relative; }
  .dash-progress-fill { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
  .dash-progress-fill::after { content: ''; position: absolute; top: 0; right: 0; width: 20px; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3)); border-radius: 0 3px 3px 0; }

  .dash-section-title { font-size: 15px; font-weight: 700; color: #FFFFFF; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .dash-section-title .st-dot { width: 4px; height: 18px; border-radius: 2px; background: #C8FF00; }

  .dash-ai-card { position: relative; background: linear-gradient(135deg, #151515 0%, #181818 100%); border: 1px solid rgba(200,255,0,0.1); border-radius: 20px; padding: 28px; overflow: hidden; }
  .dash-ai-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,255,0,0.25), transparent); }
  .dash-ai-card::after { content: ''; position: absolute; top: -60%; right: -20%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(200,255,0,0.04) 0%, transparent 60%); pointer-events: none; }

  .dash-badge { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 12px; border-radius: 14px; background: #151515; border: 1px solid rgba(255,255,255,0.04); transition: all 0.25s; text-align: center; }
  .dash-badge:hover { border-color: rgba(200,255,0,0.12); transform: translateY(-2px); }
  .dash-badge.earned { border-color: rgba(200,255,0,0.3); background: rgba(200,255,0,0.05); }
  .dash-badge .badge-glow { position: absolute; inset: 0; border-radius: 14px; background: radial-gradient(circle at center, rgba(200,255,0,0.08), transparent 70%); opacity: 0; transition: opacity 0.3s; }
  .dash-badge.earned .badge-glow { opacity: 1; }

  .dash-timeline-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
  .dash-timeline-item:last-child { border-bottom: none; }
  .dash-timeline-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  .dash-sidebar-group { margin-bottom: 20px; }
  .dash-sidebar-label { font-size: 10px; font-weight: 600; color: rgba(160,160,160,0.35); text-transform: uppercase; letter-spacing: 0.1em; padding: 0 12px; margin-bottom: 6px; }
  .dash-sidebar-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 10px; background: transparent; border: 1px solid transparent; color: #A0A0A0; font-size: 13px; font-weight: 500; transition: all 0.2s; cursor: pointer; text-align: left; }
  .dash-sidebar-btn:hover { background: rgba(200,255,0,0.04); color: #FFFFFF; }
  .dash-sidebar-btn.active { background: rgba(200,255,0,0.08); border-color: rgba(200,255,0,0.15); color: #C8FF00; }
  .dash-sidebar-btn .nav-icon { width: 20px; text-align: center; font-size: 15px; flex-shrink: 0; }

  .dash-recovery-bar { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
  .dash-recovery-label { font-size: 12px; color: #A0A0A0; width: 70px; flex-shrink: 0; }
  .dash-recovery-track { flex: 1; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.04); overflow: hidden; }
  .dash-recovery-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }
  .dash-recovery-val { font-size: 12px; font-weight: 600; color: #FFFFFF; width: 36px; text-align: right; font-family: 'JetBrains Mono', monospace; }

  .dash-activity-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; position: relative; }
  .dash-activity-dot::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; border: 1px solid; border-color: inherit; opacity: 0.3; }

  .dash-upcoming-card { background: linear-gradient(135deg, rgba(200,255,0,0.06) 0%, rgba(165,230,0,0.03) 100%); border: 1px solid rgba(200,255,0,0.1); border-radius: 16px; padding: 20px; position: relative; overflow: hidden; }
  .dash-upcoming-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,255,0,0.3), transparent); }

  .dash-dropdown { position: absolute; top: calc(100% + 8px); right: 0; min-width: 220px; background: rgba(15,15,15,0.98); border: 1px solid rgba(200,255,0,0.1); border-radius: 14px; padding: 6px; backdrop-filter: blur(20px); box-shadow: 0 16px 48px rgba(0,0,0,0.5); z-index: 100; }
  .dash-dropdown-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 10px; background: none; border: none; color: #A0A0A0; font-size: 13px; cursor: pointer; transition: all 0.15s; text-align: left; }
  .dash-dropdown-item:hover { background: rgba(200,255,0,0.06); color: #FFFFFF; }
  .dash-dropdown-item.danger:hover { background: rgba(255,71,87,0.1); color: #FF4757; }
  .dash-dropdown-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 4px 8px; }

  .dash-notif-panel { position: absolute; top: calc(100% + 8px); right: 0; width: 360px; max-height: 420px; overflow-y: auto; background: rgba(15,15,15,0.98); border: 1px solid rgba(200,255,0,0.1); border-radius: 14px; padding: 8px; backdrop-filter: blur(20px); box-shadow: 0 16px 48px rgba(0,0,0,0.5); z-index: 100; }
  .dash-notif-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: 10px; transition: background 0.15s; }
  .dash-notif-item:hover { background: rgba(200,255,0,0.03); }

  .dash-filter-btn { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; background: #1D1D1D; border: 1px solid rgba(200,255,0,0.06); color: #A0A0A0; cursor: pointer; transition: all 0.2s; }
  .dash-filter-btn:hover { background: #252525; color: #FFFFFF; }
  .dash-filter-btn.active { background: rgba(200,255,0,0.1); border-color: rgba(200,255,0,0.25); color: #C8FF00; }

  .dash-clickable { cursor: pointer; transition: all 0.2s; }
  .dash-clickable:hover { border-color: rgba(200,255,0,0.2) !important; }

  .run-metric-card { position: relative; background: #151515; border: 1px solid rgba(200,255,0,0.08); border-radius: 16px; padding: 20px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; cursor: default; }
  .run-metric-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent, #C8FF00), transparent); opacity: 0; transition: opacity 0.3s; }
  .run-metric-card:hover { transform: translateY(-2px); border-color: rgba(200,255,0,0.15); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .run-metric-card:hover::before { opacity: 1; }
  .run-metric-card .run-metric-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 10px; }
  .run-metric-card .run-metric-value { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 800; color: #FFFFFF; }
  .run-metric-card .run-metric-label { font-size: 11px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }

  .run-live-display { text-align: center; padding: 32px 16px; }
  .run-live-pace { font-family: 'JetBrains Mono', monospace; font-size: 64px; font-weight: 800; color: #C8FF00; text-shadow: 0 0 40px rgba(200,255,0,0.3); line-height: 1; }
  .run-live-label { font-size: 12px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px; }

  .run-map-container { border-radius: 16px; overflow: hidden; border: 1px solid rgba(200,255,0,0.08); min-height: 300px; position: relative; }
  .run-map-container .leaflet-container { background: #0B0B0B; }

  .run-control-btn { border-radius: 14px; padding: 14px 28px; font-weight: 700; font-size: 14px; letter-spacing: 0.01em; transition: all 0.2s; cursor: pointer; border: none; font-family: 'Inter', sans-serif; }
  .run-control-btn:hover { transform: translateY(-1px); }
  .run-control-btn:active { transform: scale(0.98); }
  .run-control-btn.start { background: #C8FF00; color: #0B0B0B; }
  .run-control-btn.start:hover { background: #D9FF4D; box-shadow: 0 4px 20px rgba(200,255,0,0.25); }
  .run-control-btn.pause { background: rgba(255,165,0,0.12); color: #FFA500; border: 1px solid rgba(255,165,0,0.3); }
  .run-control-btn.resume { background: rgba(0,200,83,0.12); color: #00C853; border: 1px solid rgba(0,200,83,0.3); }
  .run-control-btn.finish { background: rgba(255,71,87,0.12); color: #FF4757; border: 1px solid rgba(255,71,87,0.3); }
  .run-control-btn.reset { background: #1D1D1D; color: #A0A0A0; border: 1px solid rgba(200,255,0,0.1); }
  .run-control-btn.ghost { background: transparent; color: #A0A0A0; border: 1px solid rgba(200,255,0,0.1); }

  .run-summary-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.88); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; overflow-y: auto; }
  .run-summary-card { width: 100%; max-width: 560px; background: rgba(15,15,15,0.98); border: 1px solid rgba(200,255,0,0.12); border-radius: 20px; padding: 32px; }

  .run-history-item { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 18px; transition: all 0.2s; cursor: pointer; }
  .run-history-item:hover { border-color: rgba(200,255,0,0.12); transform: translateY(-1px); }

  .run-pr-card { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 18px; transition: all 0.2s; text-align: center; }
  .run-pr-card.achieved { border-color: rgba(255,215,0,0.3); background: rgba(255,215,0,0.05); }
  .run-pr-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; background: rgba(255,215,0,0.1); color: #FFD700; }

  .run-goal-card { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 20px; transition: all 0.25s; }
  .run-goal-card:hover { border-color: rgba(200,255,0,0.12); }
  .run-goal-card.met { border-color: rgba(165,230,0,0.3); background: rgba(165,230,0,0.04); }

  .run-split-row { display: grid; grid-template-columns: 60px 1fr 1fr; gap: 8px; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.03); align-items: center; font-size: 13px; }
  .run-split-row:last-child { border-bottom: none; }
  .run-split-header { font-size: 10px; font-weight: 600; color: rgba(160,160,160,0.4); text-transform: uppercase; letter-spacing: 0.05em; }
  .run-split-fast { color: #00C853; }
  .run-split-slow { color: #FF4757; }

  .run-badge-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 12px; border-radius: 14px; background: #151515; border: 1px solid rgba(255,255,255,0.04); transition: all 0.25s; text-align: center; }
  .run-badge-card:hover { border-color: rgba(200,255,0,0.12); transform: translateY(-2px); }
  .run-badge-card.earned { border-color: rgba(200,255,0,0.3); background: rgba(200,255,0,0.05); }
  .run-badge-icon { font-size: 28px; margin-bottom: 4px; }
  .run-badge-label { font-size: 12px; font-weight: 600; color: #FFFFFF; }
  .run-badge-desc { font-size: 10px; color: #A0A0A0; }
  .run-badge-card.earned .run-badge-label { color: #C8FF00; }

  @keyframes runPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(200,255,0,0.3); } 50% { box-shadow: 0 0 0 12px rgba(200,255,0,0); } }
  @keyframes runGlow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
  .run-live-pulse { animation: runPulse 2s ease-in-out infinite; }
  .run-glow { animation: runGlow 2s ease-in-out infinite; }

  .skeleton { position: relative; overflow: hidden; background: rgba(255,255,255,0.03); border-radius: 8px; }
  .skeleton::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(200,255,0,0.03) 50%, transparent 100%); animation: shimmer 1.5s ease-in-out infinite; }

  .dash-goal-indicator { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); transition: all 0.25s; cursor: pointer; }
  .dash-goal-indicator:hover { border-color: rgba(200,255,0,0.12); }
  .dash-goal-indicator.met { border-color: rgba(165,230,0,0.3); background: rgba(165,230,0,0.04); }

  .dash-tip-chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; background: rgba(200,255,0,0.05); border: 1px solid rgba(200,255,0,0.08); font-size: 12px; color: #A0A0A0; transition: all 0.2s; cursor: default; }
  .dash-tip-chip:hover { background: rgba(200,255,0,0.08); border-color: rgba(200,255,0,0.15); color: #FFFFFF; }

  .dash-reminder { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); margin-bottom: 6px; transition: all 0.2s; }
  .dash-reminder:hover { background: rgba(255,255,255,0.04); }

  :focus-visible { outline: 2px solid rgba(200,255,0,0.5); outline-offset: 2px; border-radius: 8px; }
  button:focus-visible { outline: 2px solid rgba(200,255,0,0.5); outline-offset: 2px; }

  /* ═══ Workout Module Styles ═══ */
  .wm-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
  .wm-page-header h2 { font-size: 22px; font-weight: 800; color: #FFFFFF; }
  .wm-tab-bar { display: flex; gap: 4px; padding: 4px; background: #151515; border-radius: 12px; border: 1px solid rgba(200,255,0,0.06); margin-bottom: 20px; flex-wrap: wrap; }
  .wm-tab { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; background: none; color: #A0A0A0; cursor: pointer; transition: all 0.2s; border: none; white-space: nowrap; }
  .wm-tab:hover { color: #FFFFFF; background: rgba(255,255,255,0.04); }
  .wm-tab.active { background: rgba(200,255,0,0.12); color: #C8FF00; }

  .wm-exercise-card { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 16px; transition: all 0.2s; margin-bottom: 12px; }
  .wm-exercise-card:hover { border-color: rgba(200,255,0,0.12); }
  .wm-exercise-card.active-exercise { border-color: rgba(200,255,0,0.3); background: rgba(200,255,0,0.03); }
  .wm-exercise-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .wm-exercise-name { font-size: 15px; font-weight: 700; color: #FFFFFF; }
  .wm-exercise-meta { font-size: 12px; color: #A0A0A0; }
  .wm-muscle-tag { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; background: rgba(200,255,0,0.08); color: #C8FF00; margin-right: 4px; }

  .wm-set-row { display: grid; grid-template-columns: 36px 1fr 1fr 1fr 60px 36px; gap: 6px; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.02); }
  .wm-set-row:last-child { border-bottom: none; }
  .wm-set-num { font-size: 12px; font-weight: 600; color: #A0A0A0; text-align: center; }
  .wm-set-input { padding: 6px 8px !important; font-size: 13px !important; text-align: center; border-radius: 8px !important; height: 34px; font-family: 'JetBrains Mono', monospace; background: #1D1D1D !important; border-color: rgba(200,255,0,0.08) !important; }
  .wm-set-input.rpe { font-size: 12px !important; }
  .wm-set-done { width: 28px; height: 28px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.08); background: none; color: #A0A0A0; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 14px; }
  .wm-set-done.checked { background: #C8FF00; border-color: #C8FF00; color: #0B0B0B; }
  .wm-set-done:hover { border-color: #C8FF00; }

  .wm-set-header { display: grid; grid-template-columns: 36px 1fr 1fr 1fr 60px 36px; gap: 6px; padding: 0 0 6px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 4px; }
  .wm-set-header span { font-size: 10px; font-weight: 600; color: rgba(160,160,160,0.4); text-transform: uppercase; letter-spacing: 0.05em; text-align: center; }

  .wm-rest-timer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.88); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .wm-rest-timer-card { text-align: center; }
  .wm-rest-timer-display { font-family: 'JetBrains Mono', monospace; font-size: 80px; font-weight: 700; color: #C8FF00; text-shadow: 0 0 40px rgba(200,255,0,0.3); line-height: 1; }
  .wm-rest-timer-label { font-size: 14px; color: #A0A0A0; margin-top: 12px; margin-bottom: 24px; }

  .wm-search-bar { position: relative; margin-bottom: 16px; }
  .wm-search-bar input { padding-left: 40px !important; height: 42px; }
  .wm-search-bar .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(160,160,160,0.4); font-size: 14px; pointer-events: none; }

  .wm-filter-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
  .wm-chip { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; background: #1D1D1D; border: 1px solid rgba(200,255,0,0.06); color: #A0A0A0; cursor: pointer; transition: all 0.2s; }
  .wm-chip:hover { background: #252525; color: #FFFFFF; }
  .wm-chip.active { background: rgba(200,255,0,0.1); border-color: rgba(200,255,0,0.25); color: #C8FF00; }

  .wm-pr-card { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 16px; transition: all 0.2s; }
  .wm-pr-card:hover { border-color: rgba(255,215,0,0.2); }
  .wm-pr-card .pr-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; background: rgba(255,215,0,0.1); color: #FFD700; }
  .wm-pr-card .pr-new { background: rgba(200,255,0,0.08); color: #C8FF00; }

  .wm-history-card { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 18px; transition: all 0.2s; cursor: pointer; }
  .wm-history-card:hover { border-color: rgba(200,255,0,0.12); transform: translateY(-1px); }

  .wm-session-bar { position: sticky; top: 0; z-index: 50; background: rgba(11,11,11,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(200,255,0,0.12); padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .wm-session-timer { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 600; color: #C8FF00; }
  .wm-session-stats { display: flex; gap: 16px; }
  .wm-session-stat { font-size: 12px; color: #A0A0A0; }
  .wm-session-stat span { color: #FFFFFF; font-weight: 600; font-family: 'JetBrains Mono', monospace; }

  .wm-summary-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.88); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
  .wm-summary-card { width: 100%; max-width: 480px; background: rgba(15,15,15,0.98); border: 1px solid rgba(200,255,0,0.12); border-radius: 20px; padding: 32px; text-align: center; }

  .wm-empty { text-align: center; padding: 48px 24px; }
  .wm-empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }
  .wm-empty-title { font-size: 18px; font-weight: 700; color: #FFFFFF; margin-bottom: 8px; }
  .wm-empty-desc { font-size: 13px; color: #A0A0A0; margin-bottom: 20px; }

  .wm-template-card { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 18px; transition: all 0.2s; cursor: pointer; }
  .wm-template-card:hover { border-color: rgba(200,255,0,0.15); transform: translateY(-2px); }
  .wm-template-card.active { border-color: rgba(200,255,0,0.35); background: rgba(200,255,0,0.03); }

  .wm-notes-input { width: 100% !important; min-height: 48px; resize: vertical; padding: 8px 12px !important; font-size: 12px !important; color: #A0A0A0 !important; }

  @media (max-width: 768px) {
    .wm-set-row { grid-template-columns: 30px 1fr 1fr 1fr 48px 30px; gap: 4px; }
    .wm-set-header { grid-template-columns: 30px 1fr 1fr 1fr 48px 30px; gap: 4px; }
    .wm-session-bar { flex-wrap: wrap; justify-content: center; }
    .wm-rest-timer-display { font-size: 60px; }
    .wm-summary-card { padding: 24px 16px; }
  }

  @media (max-width: 1024px) {
    .dash-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .dash-charts-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 768px) {
    .dash-header { padding: 20px !important; }
    .dash-header h1 { font-size: 22px !important; }
    .dash-quick-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .dash-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .dash-badge-grid { grid-template-columns: repeat(3, 1fr) !important; }
    .dash-sidebar-overlay { display: block !important; }
  }
  @media (max-width: 480px) {
    .dash-metrics-grid { grid-template-columns: 1fr !important; }
    .dash-quick-grid { grid-template-columns: 1fr !important; }
    .dash-badge-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }

  /* ═══ AI Chat Styles ═══ */
  .chat-container { display: flex; height: calc(100vh - 48px); gap: 0; border-radius: 16px; overflow: hidden; border: 1px solid rgba(200,255,0,0.08); background: #0B0B0B; }
  .chat-sidebar { width: 260px; flex-shrink: 0; background: #0F0F0F; border-right: 1px solid rgba(200,255,0,0.06); display: flex; flex-direction: column; transition: width 0.3s, opacity 0.3s; overflow: hidden; }
  .chat-sidebar.collapsed { width: 0; opacity: 0; pointer-events: none; }
  .chat-sidebar-header { padding: 16px; border-bottom: 1px solid rgba(200,255,0,0.06); }
  .chat-new-btn { width: 100%; padding: 10px 16px; border-radius: 12px; background: rgba(200,255,0,0.08); border: 1px solid rgba(200,255,0,0.15); color: #C8FF00; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
  .chat-new-btn:hover { background: rgba(200,255,0,0.12); border-color: rgba(200,255,0,0.25); }
  .chat-conv-list { flex: 1; overflow-y: auto; padding: 8px; }
  .chat-conv-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: all 0.15s; margin-bottom: 2px; }
  .chat-conv-item:hover { background: rgba(200,255,0,0.04); }
  .chat-conv-item.active { background: rgba(200,255,0,0.08); border: 1px solid rgba(200,255,0,0.12); }
  .chat-conv-item .conv-title { font-size: 13px; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; font-weight: 500; }
  .chat-conv-item .conv-delete { opacity: 0; background: none; border: none; color: #A0A0A0; cursor: pointer; padding: 2px 6px; border-radius: 6px; font-size: 12px; transition: all 0.15s; flex-shrink: 0; }
  .chat-conv-item:hover .conv-delete { opacity: 1; }
  .chat-conv-item .conv-delete:hover { color: #FF4757; background: rgba(255,71,87,0.1); }

  .chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .chat-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid rgba(200,255,0,0.06); background: #0F0F0F; gap: 12px; }
  .chat-header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .chat-header-title { font-size: 15px; font-weight: 700; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chat-header-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .chat-header-btn { padding: 6px 10px; border-radius: 8px; background: rgba(200,255,0,0.06); border: 1px solid rgba(200,255,0,0.08); color: #A0A0A0; font-size: 12px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 4px; }
  .chat-header-btn:hover { background: rgba(200,255,0,0.1); color: #FFFFFF; border-color: rgba(200,255,0,0.15); }
  .chat-header-btn.danger:hover { background: rgba(255,71,87,0.1); color: #FF4757; border-color: rgba(255,71,87,0.2); }

  .chat-messages { flex: 1; overflow-y: auto; padding: 24px 0; scroll-behavior: smooth; }
  .chat-messages-inner { max-width: 780px; margin: 0 auto; padding: 0 24px; }

  .chat-msg { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 24px; }
  .chat-msg.user { flex-direction: row-reverse; }
  .chat-msg-avatar { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .chat-msg-avatar.assistant { background: rgba(200,255,0,0.1); border: 1px solid rgba(200,255,0,0.15); }
  .chat-msg-avatar.user { background: rgba(200,255,0,0.18); border: 1px solid rgba(200,255,0,0.25); }
  .chat-msg-body { max-width: 85%; min-width: 0; }
  .chat-msg-bubble { padding: 14px 18px; border-radius: 16px; font-size: 14px; line-height: 1.7; color: #E8E8E8; word-wrap: break-word; overflow-wrap: break-word; }
  .chat-msg.user .chat-msg-bubble { background: rgba(200,255,0,0.12); border: 1px solid rgba(200,255,0,0.18); border-radius: 16px 4px 16px 16px; }
  .chat-msg.assistant .chat-msg-bubble { background: #151515; border: 1px solid rgba(255,255,255,0.05); border-radius: 4px 16px 16px 16px; }
  .chat-msg-meta { display: flex; align-items: center; gap: 8px; margin-top: 6px; padding: 0 4px; }
  .chat-msg.user .chat-msg-meta { flex-direction: row-reverse; }
  .chat-msg-time { font-size: 11px; color: rgba(160,160,160,0.4); }
  .chat-msg-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
  .chat-msg:hover .chat-msg-actions { opacity: 1; }
  .chat-msg-action { padding: 3px 8px; border-radius: 6px; background: none; border: 1px solid transparent; color: #A0A0A0; font-size: 11px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 3px; }
  .chat-msg-action:hover { background: rgba(200,255,0,0.06); color: #FFFFFF; border-color: rgba(200,255,0,0.1); }
  .chat-msg-action.copied { color: #C8FF00; }

  .chat-typing { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 24px; }
  .chat-typing-dots { display: flex; gap: 4px; padding: 14px 18px; background: #151515; border: 1px solid rgba(255,255,255,0.05); border-radius: 4px 16px 16px 16px; }
  .chat-typing-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(200,255,0,0.4); animation: typingBounce 1.4s ease-in-out infinite; }
  .chat-typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .chat-typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }

  .chat-suggested { max-width: 780px; margin: 0 auto; padding: 40px 24px; }
  .chat-suggested-title { font-size: 20px; font-weight: 800; color: #FFFFFF; margin-bottom: 6px; }
  .chat-suggested-sub { font-size: 14px; color: #A0A0A0; margin-bottom: 28px; }
  .chat-suggested-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .chat-prompt-card { padding: 16px; border-radius: 14px; background: #151515; border: 1px solid rgba(200,255,0,0.06); cursor: pointer; transition: all 0.2s; text-align: left; }
  .chat-prompt-card:hover { background: rgba(200,255,0,0.04); border-color: rgba(200,255,0,0.12); transform: translateY(-1px); }
  .chat-prompt-card .prompt-icon { font-size: 20px; margin-bottom: 8px; }
  .chat-prompt-card .prompt-title { font-size: 13px; font-weight: 600; color: #FFFFFF; margin-bottom: 4px; }
  .chat-prompt-card .prompt-desc { font-size: 12px; color: #A0A0A0; line-height: 1.4; }

  .chat-input-area { padding: 16px 24px 20px; border-top: 1px solid rgba(200,255,0,0.06); background: #0F0F0F; }
  .chat-input-wrap { max-width: 780px; margin: 0 auto; display: flex; gap: 10px; align-items: flex-end; }
  .chat-textarea-wrap { flex: 1; position: relative; }
  .chat-textarea { width: 100%; min-height: 44px; max-height: 160px; padding: 11px 16px; border-radius: 14px; background: #181818; border: 1px solid rgba(200,255,0,0.08); color: #FFFFFF; font-size: 14px; font-family: 'Inter', sans-serif; line-height: 1.5; resize: none; outline: none; transition: border-color 0.2s; }
  .chat-textarea:focus { border-color: rgba(200,255,0,0.3); }
  .chat-textarea::placeholder { color: rgba(160,160,160,0.35); }
  .chat-send-btn { width: 44px; height: 44px; border-radius: 12px; background: #C8FF00; border: none; color: #0B0B0B; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
  .chat-send-btn:hover { background: #D9FF4D; transform: translateY(-1px); }
  .chat-send-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; background: #A0A0A0; }
  .chat-send-btn:active:not(:disabled) { transform: scale(0.95); }

  .chat-code-block { background: #0B0B0B; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px 16px; margin: 10px 0; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.6; color: #E8E8E8; }
  .chat-inline-code { background: rgba(200,255,0,0.08); border: 1px solid rgba(200,255,0,0.12); border-radius: 5px; padding: 1px 6px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #C8FF00; }
  .chat-md-h { font-weight: 700; color: #FFFFFF; margin: 12px 0 6px; }
  .chat-md-h:first-child { margin-top: 0; }
  .chat-md-ul, .chat-md-ol { padding-left: 20px; margin: 8px 0; }
  .chat-md-li, .chat-md-oli { margin-bottom: 4px; line-height: 1.6; }

  @media (max-width: 768px) {
    .chat-sidebar { position: absolute; z-index: 30; height: 100%; }
    .chat-sidebar.collapsed { width: 0; }
    .chat-suggested-grid { grid-template-columns: 1fr; }
    .chat-msg-body { max-width: 90%; }
    .chat-messages-inner { padding: 0 16px; }
  }

  /* ═══ Top Navigation Bar ═══ */
  .topbar { position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between; padding: 12px 28px; background: rgba(11,11,11,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(200,255,0,0.06); min-height: 56px; }
  .topbar-title { font-size: 16px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.01em; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .topbar-avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #C8FF00, #A5E600); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #0B0B0B; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; position: relative; }
  .topbar-avatar:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(200,255,0,0.2); }
  .topbar-avatar.open { border-color: #C8FF00; box-shadow: 0 0 0 3px rgba(200,255,0,0.12); }

  .account-menu { position: absolute; top: calc(100% + 10px); right: 0; min-width: 260px; background: rgba(15,15,15,0.98); border: 1px solid rgba(200,255,0,0.1); border-radius: 16px; padding: 8px; backdrop-filter: blur(20px); box-shadow: 0 20px 60px rgba(0,0,0,0.6); z-index: 9999; }
  .account-menu-header { padding: 14px 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 4px; display: flex; align-items: center; gap: 12px; }
  .account-menu-header .avatar-lg { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #C8FF00, #A5E600); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #0B0B0B; flex-shrink: 0; }
  .account-menu-header .user-info { flex: 1; min-width: 0; }
  .account-menu-header .user-name { font-size: 14px; font-weight: 700; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .account-menu-header .user-meta { font-size: 12px; color: #A0A0A0; margin-top: 1px; }

  .account-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 10px; background: none; border: none; color: #A0A0A0; font-size: 13px; cursor: pointer; transition: all 0.15s; text-align: left; font-family: 'Inter', sans-serif; }
  .account-menu-item:hover { background: rgba(200,255,0,0.06); color: #FFFFFF; }
  .account-menu-item .menu-icon { width: 20px; text-align: center; font-size: 15px; flex-shrink: 0; }
  .account-menu-item .menu-label { flex: 1; }
  .account-menu-item .menu-shortcut { font-size: 11px; color: rgba(160,160,160,0.3); }

  .account-menu-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 8px; }

  .account-menu-item.danger { color: #FF4757; }
  .account-menu-item.danger:hover { background: rgba(255,71,87,0.08); color: #FF4757; }

  .logout-modal-overlay { position: fixed; inset: 0; z-index: 10001; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); padding: 20px; }
  .logout-modal { background: rgba(15,15,15,0.98); border: 1px solid rgba(200,255,0,0.1); border-radius: 20px; padding: 36px 32px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
  .logout-modal-icon { width: 56px; height: 56px; border-radius: 14px; background: rgba(255,71,87,0.1); border: 1px solid rgba(255,71,87,0.15); display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 20px; }
  .logout-modal h3 { font-size: 20px; font-weight: 800; color: #FFFFFF; margin-bottom: 12px; text-align: center; }
  .logout-modal p { font-size: 14px; color: #A0A0A0; line-height: 1.7; margin-bottom: 28px; text-align: center; word-wrap: break-word; overflow-wrap: break-word; }
  .logout-modal-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .logout-modal-actions .btn-cancel { background: #1D1D1D; border: 1px solid rgba(200,255,0,0.1); color: #A0A0A0; border-radius: 12px; padding: 11px 24px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .logout-modal-actions .btn-cancel:hover { background: rgba(200,255,0,0.06); color: #FFFFFF; border-color: rgba(200,255,0,0.2); }
  .logout-modal-actions .btn-signout { background: rgba(255,71,87,0.12); border: 1px solid rgba(255,71,87,0.3); color: #FF4757; border-radius: 12px; padding: 11px 24px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .logout-modal-actions .btn-signout:hover { background: rgba(255,71,87,0.2); box-shadow: 0 4px 20px rgba(255,71,87,0.15); }

  @keyframes menuSlideDown { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .account-menu { animation: menuSlideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1); }

  @media (max-width: 768px) {
    .topbar { padding: 10px 16px; }
    .account-menu { min-width: 240px; right: -8px; }
  }
`;
// -- GlobalStyles Component ------------------------------------------------

export const GlobalStyles = () => {
  useEffect(() => {
    const id = "global-fitness-styles";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = G_STYLE;
      document.head.appendChild(el);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);
  return null;
};

// -- Mock AI Engine -------------------------------------------------------
export const MOCK_DELAY = () => 600 + Math.random() * 900;

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const MOCK_COACHING = {
  workout_review: [
    "Solid session! Your volume is trending upward which is great for hypertrophy. Keep pushing progressive overload — even 1-2.5kg more per week compounds fast.",
    "Good consistency this week. I'd suggest adding 1 working set to your compound lifts for extra volume. Recovery looks adequate so you can handle it.",
    "Nice work! Your estimated 1RM is climbing. Make sure you're hitting at least 1.6g protein/kg bodyweight to support this training load.",
    "Training frequency looks good. Consider adding a rest-pause set on your last working set to increase intensity without extra fatigue.",
    "Great session. Your RPE scores suggest you have 1-2 reps in reserve on most sets — perfect for long-term progress without burnout.",
    "Volume is in a good range. If progress stalls, try a deload week at 60% intensity before pushing again. Recovery is where gains are made.",
  ],
  workout_tip: [
    "Focus on eccentric control — a 3-second lowering phase increases time under tension and muscle damage for better growth.",
    "Try supersetting antagonist muscle groups (e.g., chest/back) to save time and increase training density.",
    "Warm up with 2-3 ramping sets before your working weight. This primes your nervous system and reduces injury risk.",
    "For your next session, try cluster sets: 5x2 with 20s rest between reps. Great for building strength at heavier loads.",
    "Consider adding 5 minutes of loaded carries at the end of your workout. It builds grip, core stability, and work capacity.",
    "Your last set should be close to failure (RPE 9-10). Leave nothing in the tank on that final push.",
  ],
  nutrition: [
    "You're close to your protein target! Try adding a casein shake before bed — it digestslowly and supports overnight muscle protein synthesis.",
    "For your remaining calories today, focus on whole foods: chicken breast, rice, and vegetables. Micronutrients matter as much as macros.",
    "Great protein intake today. Consider timing 30-40g of protein within 2 hours post-workout for optimal recovery.",
    "Your carbs are a bit low. Add some oats or sweet potato around your training window to fuel performance and recovery.",
    "Hydration check: aim for at least 3L of water today, especially on training days. Dehydration can reduce strength by 10-15%.",
    "Try meal prepping on Sundays. Having food ready removes decision fatigue and makes hitting your targets much easier.",
  ],
  recovery: [
    "Your recovery score looks good! 7+ hours of quality sleep is the single most important recovery tool. Keep it consistent.",
    "Stress is elevated today. Consider 10 minutes of light walking or stretching. Active recovery beats complete rest for reducing cortisol.",
    "Your sleep quality is below average. Try limiting screen time 1 hour before bed and keeping your room cool (18-20C).",
    "Recovery is solid. You're ready for a high-intensity session today. Push for new PRs on your main lifts.",
    "With your current recovery score, I'd recommend a moderate session — focus on technique and volume over intensity.",
    "Low recovery detected. Today is a perfect day for mobility work, foam rolling, or a light swim. Don't force a heavy session.",
  ],
  general: [
    "Consistency beats perfection. Missing one workout isn't the end — just get back on track the next day. The long game is what matters.",
    "Progressive overload is the key driver of all adaptation. Track your lifts and always aim to do slightly more than last time.",
    "Your training age matters. As a beginner, focus on mastering form. Intermediate? Chase progressive overload. Advanced? Manage fatigue.",
    "Remember: muscles grow during recovery, not in the gym. Prioritize sleep, nutrition, and stress management alongside training.",
    "A good program followed consistently beats a perfect program done sporadically. Stick with your plan for at least 8-12 weeks.",
    "Don't neglect mobility work. 10 minutes of stretching post-workout can prevent injuries and improve range of motion over time.",
  ],
};

export const generateMockResponse = (systemPrompt, userMsg) => {
  const lower = (userMsg || "").toLowerCase();
  const sysLower = (systemPrompt || "").toLowerCase();

  if (sysLower.includes("weekly review") || sysLower.includes("review my training")) return pick(MOCK_COACHING.workout_review);
  if (sysLower.includes("strength coach") || sysLower.includes("coaching tip")) return pick(MOCK_COACHING.workout_tip);
  if (sysLower.includes("nutritionist") || sysLower.includes("meal")) return pick(MOCK_COACHING.nutrition);
  if (sysLower.includes("recovery") || sysLower.includes("sleep")) return pick(MOCK_COACHING.recovery);
  if (sysLower.includes("personal trainer") || lower.includes("workout") || lower.includes("exercise") || lower.includes("lift")) return pick(MOCK_COACHING.workout_tip);

  if (lower.includes("program") || lower.includes("split") || lower.includes("routine")) {
    return JSON.stringify({
      name: "AI-Generated Program",
      description: "Customized training program based on your profile and goals",
      split: "ppl",
      days: [
        { name: "Push Day", focus: "Chest, Shoulders, Triceps", exercises: [
          { name: "Bench Press", sets: 4, reps: "8-10", rest: "2-3 min", notes: "Control the eccentric" },
          { name: "Overhead Press", sets: 3, reps: "10-12", rest: "90s", notes: "No leg drive" },
          { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "90s", notes: "" },
          { name: "Lateral Raise", sets: 4, reps: "12-15", rest: "60s", notes: "Slow and controlled" },
          { name: "Tricep Extension", sets: 3, reps: "12-15", rest: "60s", notes: "" },
        ]},
        { name: "Pull Day", focus: "Back, Biceps", exercises: [
          { name: "Deadlift", sets: 3, reps: "5-6", rest: "3 min", notes: "Heavy compound" },
          { name: "Barbell Row", sets: 4, reps: "8-10", rest: "2 min", notes: "Squeeze at top" },
          { name: "Lat Pulldown", sets: 3, reps: "10-12", rest: "90s", notes: "" },
          { name: "Face Pull", sets: 3, reps: "15-20", rest: "60s", notes: "Rear delt health" },
          { name: "Bicep Curl", sets: 3, reps: "10-12", rest: "60s", notes: "" },
        ]},
        { name: "Leg Day", focus: "Quads, Hamstrings, Glutes", exercises: [
          { name: "Squat", sets: 4, reps: "6-8", rest: "3 min", notes: "Depth below parallel" },
          { name: "Romanian Deadlift", sets: 3, reps: "10-12", rest: "2 min", notes: "Feel the stretch" },
          { name: "Leg Press", sets: 3, reps: "12-15", rest: "90s", notes: "" },
          { name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s", notes: "" },
          { name: "Hip Thrust", sets: 3, reps: "10-12", rest: "90s", notes: "Squeeze glutes at top" },
        ]},
      ],
    });
  }

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return pick([
      "Hey! Ready to crush your training today? Ask me about your program, nutrition, or recovery — I've got all your data at my fingertips.",
      "Hello! Great to see you. Want a quick check-in on your progress, or do you have a specific question about training?",
      "Hey there! I'm here to help with anything fitness-related. What's on your mind today?",
    ]);
  }

  if (lower.includes("thank") || lower.includes("thanks")) return pick(["You're welcome! Keep up the great work.", "Anytime! Consistency is your superpower.", "Happy to help! Let me know if you need anything else."]);
  if (lower.includes("how are you") || lower.includes("what's up")) return pick(["I'm doing great! More importantly, how are YOU feeling today? Ready to train?", "All good here! Let's talk about your fitness goals. What do you need?"]);

  return pick(MOCK_COACHING.general);
};

// -- AI Provider ----------------------------------------------------------
export const callAIProvider = async (messages, systemPrompt) => {
  const lastUser = [...messages].reverse().find(m => m.role === "user");
  const text = generateMockResponse(systemPrompt, lastUser?.content || "");
  await new Promise(r => setTimeout(r, MOCK_DELAY()));
  return text;
};

// -- AI Coach Hook --------------------------------------------------------

export const useAICoach = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = React.useRef(null);

  const ask = useCallback(async (systemPrompt, userMsg, history = []) => {
    setLoading(true);
    setError(null);
    try {
      const text = await callAIProvider(
        [{ role: "user", content: userMsg }, ...history],
        systemPrompt
      );
      setLoading(false);
      return text;
    } catch (e) {
      setError(e.message);
      setLoading(false);
      return null;
    }
  }, []);

  const cancel = useCallback(() => { abortRef.current?.abort(); }, []);

  return { ask, loading, error, cancel };
};

// -- Chat Context Builder -------------------------------------------------
export const buildUserContext = (state) => {
  const { profile, workouts, nutrition, recovery, bodyWeight, water, personalRecords, level, xp } = state;
  const streak = calcStreak(workouts);
  const weekVol = calcWeeklyVolume(workouts);
  const todayStr = today();
  const todayN = nutrition.find(n => n.date === todayStr);
  const todayR = recovery.find(r => r.date === todayStr);
  const latestW = bodyWeight.length > 0 ? bodyWeight[bodyWeight.length - 1] : null;
  const topPRs = Object.entries(personalRecords || {}).slice(0, 5);

  const parts = [
    `## User Profile`,
    `Name: ${profile?.name || "Unknown"}, Age: ${profile?.age || "N/A"}, Gender: ${profile?.gender || "N/A"}`,
    `Weight: ${profile?.weight}kg, Height: ${profile?.height}cm, Body Fat: ${profile?.bodyFat || "N/A"}%`,
    `Goal: ${(profile?.goal || "general").replace(/_/g, " ")}, Experience: ${profile?.experience || "intermediate"}`,
    `TDEE: ${profile?.tdee || "N/A"} kcal, Target Calories: ${profile?.calories || "N/A"} kcal, Target Protein: ${profile?.protein || "N/A"}g`,
    `Level: ${level}, XP: ${xp}, Streak: ${streak} days`,
    ``,
    `## Today's Data (${todayStr})`,
    `Nutrition: ${todayN ? `${todayN.calories || 0} kcal, ${todayN.protein || 0}g protein, ${todayN.carbs || 0}g carbs, ${todayN.fat || 0}g fat` : "Not logged"}`,
    `Recovery: ${todayR ? `Score ${todayR.score}/10, Sleep ${todayR.sleep}h, Quality ${todayR.quality}/10, Stress ${todayR.stress}/10` : "Not logged"}`,
    `Water: ${(water || {})[todayStr] || 0} glasses`,
  ];

  if (workouts.length > 0) {
    const recent = workouts.slice(-5).reverse();
    parts.push(``, `## Recent Workouts (last ${recent.length})`);
    recent.forEach(w => {
      parts.push(`${w.date}: ${w.name || "Workout"} — ${w.exercises?.length || 0} exercises, ${Math.round(w.totalVolume)}kg volume, ${w.duration || "?"}min`);
      w.exercises?.forEach(e => { parts.push(`  • ${e.name}: ${e.sets?.filter(s => s.done).length || 0} working sets`); });
    });
    parts.push(``, `Weekly Volume: ${Math.round(weekVol)}kg, Total Workouts: ${workouts.length}`);
  }

  if (bodyWeight.length > 1) {
    const first = bodyWeight[0];
    const last = bodyWeight[bodyWeight.length - 1];
    const change = last.weight - first.weight;
    parts.push(``, `## Body Weight Trend`, `Start: ${first.weight}kg (${first.date}) → Current: ${last.weight}kg (${last.date}), Change: ${change > 0 ? "+" : ""}${fmt(change, 1)}kg`);
  }

  if (topPRs.length > 0) {
    parts.push(``, `## Personal Records`);
    topPRs.forEach(([name, pr]) => { parts.push(`• ${name}: ${pr.weight}kg × ${pr.reps} reps (e1RM: ${fmt(pr.e1rm || 0, 0)}kg)`); });
  }

  if (recovery.length > 1) {
    const avgSleep = recovery.slice(-7).reduce((s, r) => s + (r.sleep || 0), 0) / Math.min(recovery.length, 7);
    const avgScore = recovery.slice(-7).reduce((s, r) => s + (r.score || 0), 0) / Math.min(recovery.length, 7);
    parts.push(``, `## Recovery Averages (7-day)`, `Avg Sleep: ${fmt(avgSleep, 1)}h, Avg Recovery Score: ${fmt(avgScore, 1)}/10`);
  }

  return parts.join("\n");
};

export const buildSystemPrompt = (context) =>
  `You are an elite AI personal trainer and nutrition coach with deep expertise in strength training, hypertrophy, powerlifting, sports nutrition, recovery optimization, and program design.

You have FULL access to this user's training data, body metrics, nutrition logs, recovery data, and personal records. Use this data to give SPECIFIC, ACTIONABLE, and PERSONALIZED advice. Reference their actual numbers, exercises, and trends.

Guidelines:
- Be specific with numbers (sets, reps, weights, calories, macros)
- Reference their actual data (workouts, PRs, recovery scores)
- Keep responses concise but thorough (aim for 100-200 words)
- Use bullet points and structure for readability
- Be encouraging but honest
- If data is missing, note it and suggest they log it
- For workout programming, consider their experience level and recent training volume
- For nutrition, reference their actual targets and today's intake
- For recovery, consider their sleep, stress, and recent training load

${context}`;

// -- Markdown Renderer ----------------------------------------------------
export const renderMarkdown = (text) => {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="chat-code-block"><code>${code.trim()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h4 class="chat-md-h">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="chat-md-h">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="chat-md-h">$1</h2>')
    .replace(/^- (.+)$/gm, '<li class="chat-md-li">$1</li>')
    .replace(/(<li class="chat-md-li">.*<\/li>\n?)+/g, m => `<ul class="chat-md-ul">${m}</ul>`)
    .replace(/^(\d+)\. (.+)$/gm, '<li class="chat-md-oli">$2</li>')
    .replace(/(<li class="chat-md-oli">.*<\/li>\n?)+/g, m => `<ol class="chat-md-ol">${m}</ol>`)
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, "<br/>");
  return html;
};

// -- Chat Timestamp Formatter ---------------------------------------------
export const formatChatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

// -- Pages / Sidebar ------------------------------------------------------
export const PAGES = [
  { id: "dashboard", label: "Dashboard", icon: "\u{1F3E0}", group: "main" },
  { id: "workout", label: "Workouts", icon: "\u{1F3CB}\u{FE0F}", group: "training", showInSidebar: true },
  { id: "exercise-library", label: "Exercise Library", icon: "\u{1F4DA}", group: "training", showInSidebar: true },
  { id: "planner", label: "Workout Planner", icon: "\u{1F4CB}", group: "training", showInSidebar: true },
  { id: "running", label: "Running", icon: "\u{1F3C3}", group: "training", showInSidebar: true },
  { id: "programs", label: "Programs", icon: "\u{1F4CA}", group: "training", showInSidebar: true },
  { id: "nutrition", label: "Nutrition", icon: "\u{1F957}", group: "health", showInSidebar: true },
  { id: "smart-nutrition", label: "Smart Nutrition", icon: "\u{1F37D}\u{FE0F}", group: "health", showInSidebar: true },
  { id: "water-tracker", label: "Water Tracker", icon: "\u{1F4A7}", group: "health", showInSidebar: true },
  { id: "calculator", label: "BMI Calculator", icon: "\u{1F9EE}", group: "health", showInSidebar: true },
  { id: "recovery", label: "Recovery", icon: "\u{1F634}", group: "health", showInSidebar: true },
  { id: "bodyweight", label: "Body Weight", icon: "\u2696\u{FE0F}", group: "health", showInSidebar: true },
  { id: "goals", label: "Goals", icon: "\u{1F3AF}", group: "analytics", showInSidebar: true },
  { id: "achievements", label: "Achievements", icon: "\u{1F3C6}", group: "analytics", showInSidebar: true },
  { id: "progress", label: "Progress", icon: "\u{1F4C8}", group: "analytics", showInSidebar: true },
  { id: "coach", label: "AI Coach", icon: "\u{1F916}", group: "analytics", showInSidebar: true },
  { id: "notifications", label: "Notifications", icon: "\u{1F514}", group: "tools", showInSidebar: true },
  { id: "export", label: "Export Reports", icon: "\u{1F4E4}", group: "tools", showInSidebar: true },
  { id: "admin", label: "Analytics", icon: "\u{1F4CA}", group: "tools", showInSidebar: true },
  { id: "settings", label: "Settings", icon: "\u2699\u{FE0F}", group: "account", showInSidebar: true },
  { id: "profile", label: "Profile", icon: "\u{1F464}", group: "account", showInSidebar: true },
];

export const SIDEBAR_GROUPS = [
  { key: "main", label: "" },
  { key: "training", label: "TRAINING" },
  { key: "health", label: "HEALTH" },
  { key: "analytics", label: "ANALYTICS" },
  { key: "tools", label: "TOOLS" },
  { key: "account", label: "ACCOUNT" },
];

// -- Reducer --------------------------------------------------------------
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
      const nutrition = [...state.nutrition, action.payload];
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
      const bw = state.bodyWeight.filter(w => w.date !== action.payload.date);
      const newState = { ...state, bodyWeight: [...bw, action.payload].sort((a, b) => a.date.localeCompare(b.date)) };
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
        id: Date.now(), date: today(), startTime: new Date().toISOString(),
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
      const exercises = state.activeSession.exercises.map((ex, i) => {
        if (i !== exerciseIndex) return ex;
        const sets = ex.sets.map((s, si) => si === setIndex ? { ...s, [field]: value } : s);
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

// -- Toast System ---------------------------------------------------------

let _toastFn = null;
export const showToast = (msg) => { _toastFn?.(msg); };

let _confirmFn = null;
export const showConfirm = (msg) => new Promise(resolve => { _confirmFn?.(msg, resolve); });

export const Toast = () => {
  const [toast, setToast] = useState(null);
  useEffect(() => { _toastFn = setToast; return () => { _toastFn = null; }; }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); } }, [toast]);
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: "#C8FF00", color: "#0B0B0B", padding: "12px 24px", borderRadius: 12, fontWeight: 700, fontSize: 14, boxShadow: "0 8px 32px rgba(200,255,0,0.2)", animation: "slideUp 0.3s ease-out" }}>
      {toast}
    </div>
  );
};

export const ConfirmDialog = () => {
  const [state, setState] = useState({ open: false, msg: "", resolve: null });
  useEffect(() => { _confirmFn = (msg, resolve) => setState({ open: true, msg, resolve }); return () => { _confirmFn = null; }; }, []);
  const close = (val) => { state.resolve?.(val); setState({ open: false, msg: "", resolve: null }); };
  if (!state.open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} onClick={() => close(false)}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        style={{ background: "#151515", border: "1px solid rgba(200,255,0,0.1)", borderRadius: 16, padding: 28, maxWidth: 380, width: "90%", backdropFilter: "blur(20px)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", marginBottom: 8 }}>Confirm Action</div>
        <p style={{ fontSize: 14, color: "#A0A0A0", lineHeight: 1.6, marginBottom: 24 }}>{state.msg}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="ghost-btn" onClick={() => close(false)} style={{ padding: "10px 18px" }}>Cancel</button>
          <button onClick={() => close(true)} style={{ background: "rgba(255,71,87,0.12)", border: "1px solid rgba(255,71,87,0.3)", color: "#FF4757", borderRadius: 10, padding: "10px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,71,87,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,71,87,0.12)"; }}>Confirm</button>
        </div>
      </motion.div>
    </div>
  );
};
