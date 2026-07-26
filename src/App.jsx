import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import React from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import RunningMode from "./RunningMode";
import { useAuth } from "./hooks/useAuth";
import { getUserData, saveUserData, createUserDocument } from "./services/profileService";
import { logOut as firebaseLogOut } from "./firebase/auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ExerciseLibrary from "./components/ExerciseLibrary";
import WorkoutPlanner from "./components/WorkoutPlanner";
import SmartNutrition from "./components/SmartNutrition";
import WaterTracker from "./components/WaterTracker";
import BodyCalculator from "./components/BodyCalculator";
import GoalManager from "./components/GoalManager";
import Achievements from "./components/Achievements";
import NotificationCenter from "./components/NotificationCenter";
import ExportReports from "./components/ExportReports";
import AdminDashboard from "./components/AdminDashboard";
import SettingsPage from "./components/Settings";

// ── helpers ────────────────────────────────────────────────────────────────

const fmt = (n, dec = 0) => Number(n).toFixed(dec);
const today = () => new Date().toISOString().split("T")[0];
const weekAgo = () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split("T")[0]; };

const EXERCISE_DB = [
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
const EXERCISES = EXERCISE_DB.map(e => e.name);
const MUSCLE_GROUPS = [...new Set(EXERCISE_DB.map(e => e.primary))].sort();
const EQUIPMENT_TYPES = [...new Set(EXERCISE_DB.map(e => e.equip))].sort();
const EXERCISE_CATEGORIES = [...new Set(EXERCISE_DB.map(e => e.cat))].sort();
const GOAL_LABELS = { muscle: "Build Muscle", fat_loss: "Fat Loss", strength: "Strength", endurance: "Endurance", powerlifting: "Powerlifting", bodybuilding: "Bodybuilding", general: "General Fitness" };
const BADGE_DEFS = [
  { id: "first_workout", icon: "🏋️", label: "First Workout", desc: "Logged your first session" },
  { id: "week_streak", icon: "🔥", label: "7-Day Streak", desc: "7 consecutive active days" },
  { id: "ten_workouts", icon: "💪", label: "10 Workouts", desc: "Completed 10 workouts" },
  { id: "hundred_workouts", icon: "🏆", label: "100 Workouts", desc: "Century club" },
  { id: "volume_1000", icon: "⚡", label: "1000kg Volume", desc: "1000kg in a single session" },
  { id: "nutrition_week", icon: "🥗", label: "Nutrition Week", desc: "7 days of nutrition tracking" },
];

const COLORS = { primary: "#C8FF00", cyan: "#C8FF00", green: "#A5E600", amber: "#D9FF4D", red: "#FF4757", surface: "rgba(200,255,0,0.05)", border: "rgba(200,255,0,0.12)" };

// ── USDA FoodData Central API ──────────────────────────────────────────────
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY || "DEMO_KEY";
const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

const _searchCache = new Map();
let _debounceTimer = null;

const usdaSearch = async (query) => {
  const key = query.trim().toLowerCase();
  if (_searchCache.has(key)) return _searchCache.get(key);
  const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(key)}&pageSize=10&api_key=${USDA_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USDA API error ${res.status}`);
  const data = await res.json();
  const results = (data.foods || []).map(f => {
    const nutrients = {};
    (f.foodNutrients || []).forEach(n => {
      nutrients[n.nutrientName] = n.value;
    });
    return {
      fdcId: f.fdcId,
      name: f.description,
      brand: f.brandOwner || null,
      category: f.foodCategory || "",
      servingSize: 100,
      servingUnit: "g",
      calories: nutrients["Energy"] || 0,
      protein: nutrients["Protein"] || 0,
      carbs: nutrients["Carbohydrate, by difference"] || 0,
      fat: nutrients["Total lipid (fat)"] || 0,
      saturatedFat: nutrients["Fatty acids, total saturated"] || 0,
      fiber: nutrients["Fiber, total dietary"] || 0,
      sugar: nutrients["Sugars, total including NLEA"] || nutrients["Sugars, total"] || 0,
      sodium: nutrients["Sodium, Na"] || 0,
      potassium: nutrients["Potassium, K"] || 0,
      cholesterol: nutrients["Cholesterol"] || 0,
    };
  });
  _searchCache.set(key, results);
  if (_searchCache.size > 200) {
    const firstKey = _searchCache.keys().next().value;
    _searchCache.delete(firstKey);
  }
  return results;
};

const usdaDebouncedSearch = (query, cb) => {
  clearTimeout(_debounceTimer);
  if (!query.trim()) { cb([], false, null); return; }
  cb([], true, null);
  _debounceTimer = setTimeout(async () => {
    try {
      const results = await usdaSearch(query);
      cb(results, false, null);
    } catch (e) {
      cb([], false, e.message);
    }
  }, 400);
};

// FIX #4: Extract TDEE multipliers to a constant
const ACTIVITY_MULTIPLIERS = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };

// ── Initial state factory ──────────────────────────────────────────────────
const mkInitial = () => ({
  profile: null,
  settings: {},
  workouts: [],
  nutrition: [],
  recovery: [],
  bodyWeight: [],
  water: {},
  badges: [],
  xp: 0,
  level: 1,
  currentProgram: null,
  pendingWorkout: null,
  savedPrograms: [],
  aiHistory: [],
  aiConversations: [],
  activeSession: null,
  personalRecords: {},
  workoutTemplates: [],
  customExercises: [],
  runs: [],
  runningGoals: { dailyKm: 5, weeklyKm: 25, monthlyKm: 100, calories: 500, streakTarget: 7 },
  runningPRs: {},
  runningBadges: [],
  goals: [],
  notifications: [],
  favoriteMeals: [],
});

// ── Coaching logic ─────────────────────────────────────────────────────────
const calcE1RM = (w, r) => r === 1 ? w : w * (1 + r / 30);
const calcVolume = (sets) => sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
const calcWeeklyVolume = (workouts) => {
  const wa = weekAgo();
  return workouts.filter(w => w.date >= wa).reduce((sum, w) => sum + w.totalVolume, 0);
};
const calcStreak = (workouts) => {
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

// ── Theme / CSS ─────────────────────────────────────────────────────────────
const G_STYLE = `
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

  /* Onboarding animations */
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

// FIX #7: Inject styles once via useEffect
const GlobalStyles = () => {
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

// ── Reusable Components ─────────────────────────────────────────────────────
const Card = ({ children, style, className = "" }) => (
  <div className={`glass ${className}`} style={{ padding: "20px", ...style }}>{children}</div>
);

const SkeletonBlock = ({ width = "100%", height = 20, style = {} }) => (
  <div className="skeleton" style={{ width, height, ...style }} />
);

const SkeletonCard = ({ rows = 3 }) => (
  <div className="glass" style={{ padding: 20 }}>
    <SkeletonBlock width="40%" height={16} style={{ marginBottom: 12 }} />
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonBlock key={i} height={12} style={{ marginBottom: i < rows - 1 ? 8 : 0 }} />
    ))}
  </div>
);

const StatCard = ({ label, value, unit, color = COLORS.primary, sub }) => (
  <div style={{ background: "#151515", border: `1px solid ${color}18`, borderRadius: 16, padding: "18px 16px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(${color}20, transparent)`, borderRadius: "0 0 0 100%" }} />
    <div style={{ fontSize: 11, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>{value}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4, color: "#A0A0A0" }}>{unit}</span></div>
    {sub && <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 4 }}>{sub}</div>}
  </div>
);

const ProgressRing = ({ value, max, size = 80, color = COLORS.primary, label }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / max) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={7} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={13} fontWeight={700} fontFamily="'JetBrains Mono',monospace">{fmt(value)}</text>
      </svg>
      <span style={{ fontSize: 11, color: "#A0A0A0" }}>{label}</span>
    </div>
  );
};

// ── Mock AI Engine ──────────────────────────────────────────────────────────
const MOCK_DELAY = () => 600 + Math.random() * 900;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MOCK_COACHING = {
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

const generateMockResponse = (systemPrompt, userMsg) => {
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

// ── AI Coach Hook ───────────────────────────────────────────────────────────
const useAICoach = () => {
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

// ═══════════════════════════════════════════════════════════════════════════
// AI PROVIDER — Swap this single function to switch API backends
// ═══════════════════════════════════════════════════════════════════════════
const callAIProvider = async (messages, systemPrompt) => {
  // ── MOCK (default) ──
  // Replace this block with a real fetch() call to OpenAI, Anthropic, Gemini, etc.
  const lastUser = [...messages].reverse().find(m => m.role === "user");
  const text = generateMockResponse(systemPrompt, lastUser?.content || "");
  await new Promise(r => setTimeout(r, MOCK_DELAY()));
  return text;

  // ── OpenAI example ──
  // const res = await fetch("https://api.openai.com/v1/chat/completions", {
  //   method: "POST",
  //   headers: {
  //     "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     model: "gpt-4o",
  //     messages: [{ role: "system", content: systemPrompt }, ...messages],
  //   }),
  // });
  // const data = await res.json();
  // return data.choices[0].message.content;

  // ── Anthropic example ──
  // const res = await fetch("https://api.anthropic.com/v1/messages", {
  //   method: "POST",
  //   headers: {
  //     "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  //     "anthropic-version": "2023-06-01",
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     model: "claude-sonnet-4-20250514",
  //     max_tokens: 1024,
  //     system: systemPrompt,
  //     messages: messages.map(m => ({ role: m.role, content: m.content })),
  //   }),
  // });
  // const data = await res.json();
  // return data.content[0].text;

  // ── Gemini example ──
  // const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${messages.map(m => `${m.role}: ${m.content}`).join("\n")}` }] }],
  //   }),
  // });
  // const data = await res.json();
  // return data.candidates[0].content.parts[0].text;
};

// ── Chat Context Builder ────────────────────────────────────────────────────
const buildUserContext = (state) => {
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

const buildSystemPrompt = (context) =>
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

// ── Chat persistence (via Firestore sync in main state) ─────────────────────

// ── Markdown Renderer ───────────────────────────────────────────────────────
const renderMarkdown = (text) => {
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

// ── Chat Timestamp Formatter ────────────────────────────────────────────────
const formatChatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

// ── Unique ID helper ────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

// ═══════════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════════

// ── Onboarding ──────────────────────────────────────────────────────────────
const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", age: 25, gender: "male", height: 175, weight: 75, bodyFat: 15,
    activity: "moderate", experience: "intermediate", goal: "muscle"
  });
  const { ask, loading } = useAICoach();

  const steps = [
    { label: "Personal", icon: "01", fields: ["name", "age", "gender"] },
    { label: "Body Metrics", icon: "02", fields: ["height", "weight", "bodyFat"] },
    { label: "Goals", icon: "03", fields: ["activity", "experience", "goal"] },
  ];

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // FIX #4: Use extracted ACTIVITY_MULTIPLIERS constant
  const handleFinish = async () => {
    const bmi = form.weight / ((form.height / 100) ** 2);
    const mult = ACTIVITY_MULTIPLIERS[form.activity] || 1.55;
    const tdee = form.gender === "male"
      ? (10 * form.weight + 6.25 * form.height - 5 * form.age + 5) * mult
      : (10 * form.weight + 6.25 * form.height - 5 * form.age - 161) * mult;
    const protein = Math.round(form.weight * 2.2);
    const calories = form.goal === "fat_loss" ? Math.round(tdee - 400) : form.goal === "muscle" ? Math.round(tdee + 200) : Math.round(tdee);
    const program = await ask(
      "You are an elite personal trainer. Respond in JSON only. No markdown, no explanation. Just the JSON object.",
      `Create a weekly workout program for this person: Goal: ${form.goal}, Experience: ${form.experience}, Weight: ${form.weight}kg. Return JSON: { "split": string, "days": [{ "name": string, "focus": string, "exercises": [{ "name": string, "sets": number, "reps": string, "notes": string }] }] }`
    );
    let parsedProgram = null;
    if (program) {
      try {
        const clean = program.replace(/```json|```/g, "").trim();
        parsedProgram = JSON.parse(clean);
      } catch { parsedProgram = null; }
    }
    onComplete({ ...form, bmi: fmt(bmi, 1), tdee: Math.round(tdee), protein, calories, currentProgram: parsedProgram });
  };

  const stepIcons = ["👤", "💪", "🎯"];
  const goalIcons = {
    muscle: "💪", fat_loss: "🔥", strength: "🏋️", endurance: "🏃",
    powerlifting: "⚡", bodybuilding: "💎", general: "✨"
  };

  return (
    <div className="onb-split" style={{ minHeight: "100vh", display: "flex", position: "relative", overflow: "hidden" }}>

      {/* ── LEFT: Hero Section ── */}
      <div className="onb-hero" style={{
        flex: "1 1 50%", maxWidth: "50%", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 64px", position: "relative",
        background: "linear-gradient(135deg, #0B0B0B 0%, #111111 40%, #151515 100%)",
      }}>
        {/* Animated gradient background */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.5,
          background: "radial-gradient(ellipse at 20% 50%, rgba(200,255,0,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(165,230,0,0.04) 0%, transparent 50%)",
          animation: "gradientShift 12s ease infinite", backgroundSize: "200% 200%",
        }} />

        {/* Floating blurred shapes */}
        <div style={{
          position: "absolute", top: "10%", left: "8%", width: 200, height: 200,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(200,255,0,0.05) 0%, transparent 70%)",
          filter: "blur(40px)", animation: "float 8s ease-in-out infinite", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "10%", width: 160, height: 160,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(165,230,0,0.04) 0%, transparent 70%)",
          filter: "blur(35px)", animation: "float2 10s ease-in-out infinite", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "60%", left: "50%", width: 120, height: 120,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(200,255,0,0.03) 0%, transparent 70%)",
          filter: "blur(30px)", animation: "float 12s ease-in-out infinite 2s", pointerEvents: "none",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, animation: "fadeInLeft 0.8s ease both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px",
            borderRadius: 100, background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.12)",
            marginBottom: 32, animation: "fadeIn 1s ease 0.3s both",
          }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#C8FF00", letterSpacing: "0.05em", textTransform: "uppercase" }}>AI-Powered Fitness</span>
          </div>

          <h1 style={{
            fontSize: 44, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em",
            marginBottom: 20, color: "#FFFFFF",
          }}>
            Welcome to{" "}
            <span style={{
              background: "linear-gradient(135deg, #C8FF00 0%, #A5E600 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>AI Fitness</span>{" "}
            <span style={{
              background: "linear-gradient(135deg, #A5E600 0%, #C8FF00 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Mentor</span>
          </h1>

          <p className="onb-subtitle" style={{
            fontSize: 17, color: "rgba(160,160,160,0.7)", lineHeight: 1.6,
            marginBottom: 48, maxWidth: 440, fontWeight: 400,
          }}>
            Train smarter. Eat better. Recover faster.
          </p>

          {/* Feature cards */}
          <div className="feat-grid" style={{
            display: "grid", gridTemplateColumns: "1fr", gap: 12, animation: "fadeInUp 0.8s ease 0.5s both",
          }}>
            {[
              { icon: "🏋️", title: "Smart Workout Tracking", desc: "Generate adaptive workouts and monitor strength progression.", color: "#C8FF00" },
              { icon: "🥗", title: "AI Nutrition Coach", desc: "Track calories and macros with intelligent recommendations.", color: "#A5E600" },
              { icon: "📈", title: "Progress Analytics", desc: "Visualize your fitness journey with interactive insights.", color: "#C8FF00" },
            ].map((f, i) => (
              <div className="onb-feature-card" key={i} style={{ animation: `fadeInUp 0.6s ease ${0.6 + i * 0.1}s both` }}>
                <div className="feat-icon" style={{ background: `${f.color}10` }}>
                  <span>{f.icon}</span>
                </div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Onboarding Card ── */}
      <div className="onb-card-side" style={{
        flex: "1 1 50%", maxWidth: "50%", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "48px 40px", position: "relative",
        background: "linear-gradient(180deg, #0B0B0B 0%, #111111 100%)",
      }}>
        <div style={{
          width: "100%", maxWidth: 460, animation: "fadeInRight 0.8s ease 0.2s both",
        }}>

          {/* Logo + Welcome */}
          <div style={{ textAlign: "center", marginBottom: 36, animation: "fadeIn 0.6s ease 0.4s both" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
              background: "rgba(200,255,0,0.1)",
              border: "1px solid rgba(200,255,0,0.2)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 24,
              animation: "glowPulse 3s ease infinite",
            }}>⚡</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", marginBottom: 6 }}>Let's set up your profile</h2>
            <p style={{ fontSize: 14, color: "rgba(160,160,160,0.6)" }}>Takes about 30 seconds</p>
          </div>

          {/* Step Indicators */}
          <div style={{
            display: "flex", gap: 8, marginBottom: 32, justifyContent: "center",
            animation: "fadeIn 0.6s ease 0.5s both",
          }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, borderRadius: 10, fontSize: 12, fontWeight: 700,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  ...(i < step ? {
                    background: "#C8FF00", color: "#0B0B0B",
                    animation: "stepComplete 0.4s ease",
                  } : i === step ? {
                    background: "rgba(200,255,0,0.1)", color: "#C8FF00",
                    border: "1.5px solid rgba(200,255,0,0.35)",
                    boxShadow: "0 0 20px rgba(200,255,0,0.1)",
                  } : {
                    background: "rgba(255,255,255,0.03)", color: "rgba(160,160,160,0.35)",
                    border: "1.5px solid rgba(255,255,255,0.04)",
                  }),
                }}>
                  {i < step ? "✓" : s.icon}
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    width: 32, height: 2, borderRadius: 1,
                    background: i < step ? "#C8FF00" : "rgba(255,255,255,0.04)",
                    transition: "background 0.4s ease",
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div style={{
            background: "#151515", border: "1px solid rgba(200,255,0,0.08)",
            borderRadius: 20, padding: "32px 28px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            animation: "scaleIn 0.5s ease 0.6s both",
          }}>

            {/* Step Title */}
            <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 18,
                background: "rgba(200,255,0,0.08)", border: "1px solid rgba(200,255,0,0.12)",
              }}>
                {stepIcons[step]}
              </div>
              <div>
                <div style={{ fontSize: 11, color: "rgba(160,160,160,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>Step {step + 1} of {steps.length}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>{steps[step].label}</div>
              </div>
            </div>

            {/* ── Step 0: Personal ── */}
            {step === 0 && (
              <div style={{ animation: "fadeInUp 0.4s ease both" }}>
                <div className="onb-input-wrap">
                  <span className="onb-icon">👤</span>
                  <input
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    placeholder=" "
                    aria-label="First Name"
                    tabIndex={0}
                  />
                  <label className="onb-float">First Name</label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="onb-input-wrap">
                    <span className="onb-icon">📅</span>
                    <input
                      type="number" value={form.age}
                      onChange={e => set("age", +e.target.value)}
                      min={13} max={100} placeholder=" "
                      aria-label="Age" tabIndex={0}
                    />
                    <label className="onb-float">Age</label>
                  </div>
                  <div className="onb-input-wrap">
                    <span className="onb-icon">⚧</span>
                    <select value={form.gender} onChange={e => set("gender", e.target.value)} aria-label="Gender" tabIndex={0}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <label className="onb-float">Gender</label>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 1: Body Metrics ── */}
            {step === 1 && (
              <div style={{ animation: "fadeInUp 0.4s ease both" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    ["height", "Height", "📏", "cm"],
                    ["weight", "Weight", "⚖️", "kg"],
                    ["bodyFat", "Body Fat", "📊", "%"],
                  ].map(([k, label, icon, unit]) => (
                    <div className="onb-input-wrap" key={k}>
                      <span className="onb-icon">{icon}</span>
                      <input
                        type="number" value={form[k]}
                        onChange={e => set(k, +e.target.value)}
                        min={k === "height" ? 100 : k === "weight" ? 30 : 3}
                        max={k === "height" ? 250 : k === "weight" ? 300 : 60}
                        placeholder=" " aria-label={label} tabIndex={0}
                      />
                      <label className="onb-float">{label} ({unit})</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Goals ── */}
            {step === 2 && (
              <div style={{ animation: "fadeInUp 0.4s ease both" }}>
                <div className="onb-input-wrap">
                  <span className="onb-icon">🏃</span>
                  <select value={form.activity} onChange={e => set("activity", e.target.value)} aria-label="Activity Level" tabIndex={0}>
                    {[["sedentary", "Sedentary (desk job)"], ["light", "Lightly Active (1-3x/wk)"], ["moderate", "Moderately Active (3-5x/wk)"], ["active", "Very Active (6-7x/wk)"], ["very_active", "Extremely Active (2x/day)"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <label className="onb-float">Activity Level</label>
                </div>

                <div className="onb-input-wrap">
                  <span className="onb-icon">🏋️</span>
                  <select value={form.experience} onChange={e => set("experience", e.target.value)} aria-label="Training Experience" tabIndex={0}>
                    {[["beginner", "Beginner (< 1 year)"], ["intermediate", "Intermediate (1-3 years)"], ["advanced", "Advanced (3-5 years)"], ["elite", "Elite (5+ years)"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <label className="onb-float">Training Experience</label>
                </div>

                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 13, color: "rgba(160,160,160,0.55)", marginBottom: 12, fontWeight: 500 }}>Primary Goal</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {Object.entries(GOAL_LABELS).map(([v, l]) => (
                      <button
                        key={v}
                        className={`onb-goal-btn ${form.goal === v ? "selected" : ""}`}
                        onClick={() => set("goal", v)}
                        aria-label={l}
                        aria-pressed={form.goal === v}
                        tabIndex={0}
                      >
                        <span className="goal-check">
                          {form.goal === v && <span style={{ fontSize: 10, color: "#0B0B0B" }}>✓</span>}
                        </span>
                        <span style={{ fontSize: 16 }}>{goalIcons[v]}</span>
                        <span>{l}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 12, alignItems: "center" }}>
              {step > 0 ? (
                <button className="onb-back-btn" onClick={() => setStep(p => p - 1)} tabIndex={0} aria-label="Go back">
                  ← Back
                </button>
              ) : <div />}
              {step < steps.length - 1 ? (
                <button
                  className="onb-grad-btn"
                  style={{ width: "auto", padding: "14px 36px" }}
                  onClick={() => setStep(p => p + 1)}
                  tabIndex={0}
                  aria-label="Continue to next step"
                >
                  Continue →
                </button>
              ) : (
                <button
                  className="onb-grad-btn"
                  style={{ width: "auto", padding: "14px 36px" }}
                  onClick={handleFinish}
                  disabled={loading}
                  tabIndex={0}
                  aria-label="Start your fitness journey"
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                      <span style={{
                        width: 18, height: 18, border: "2.5px solid rgba(11,11,11,0.3)",
                        borderTopColor: "#0B0B0B", borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }} />
                      Generating your plan…
                    </span>
                  ) : "Start Your Journey ⚡"}
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 28, animation: "fadeIn 0.6s ease 1s both" }}>
            <p style={{ fontSize: 12, color: "rgba(160,160,160,0.3)" }}>
              Your data is stored locally on this device
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Dashboard ───────────────────────────────────────────────────────────────
const NAV = (page) => { window.__setPage?.(page); };

const ChartFilter = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {["7D", "30D", "90D"].map(f => (
      <button key={f} className={`dash-filter-btn ${value === f ? "active" : ""}`}
        onClick={() => onChange(f)} tabIndex={0} aria-label={`Filter ${f}`}>{f}</button>
    ))}
  </div>
);

const NotificationPanel = ({ workouts, nutrition, recovery, badges, water, profile, onClose }) => {
  const items = useMemo(() => {
    const notifs = [];
    const now = new Date();
    const hour = now.getHours();
    const todayStr = today();
    const todayW = workouts.filter(w => w.date === todayStr);
    const todayN = nutrition.filter(n => n.date === todayStr);
    const todayR = recovery.find(r => r.date === todayStr);
    const waterToday = (water || {})[todayStr] || 0;
    const todayCals = todayN.reduce((s, n) => s + (n.calories || 0), 0);
    const todayProt = todayN.reduce((s, n) => s + (n.protein || 0), 0);

    if (todayW.length === 0 && hour >= 9) {
      notifs.push({ id: "rem-workout", icon: "🏋️", color: "#C8FF00", title: "Workout Reminder", desc: "You haven't trained today. Even 20 minutes counts!", time: "Reminder", page: "workout", type: "reminder" });
    }
    if (todayR && todayR.score < 5) {
      notifs.push({ id: "rem-recovery", icon: "😴", color: "#FF4757", title: "Low Recovery", desc: `Score ${todayR.score}/10 — consider rest or light activity.`, time: "Reminder", page: "recovery", type: "reminder" });
    } else if (!todayR && hour >= 20) {
      notifs.push({ id: "rem-recovery-log", icon: "😴", color: "#C8FF00", title: "Log Recovery", desc: "Don't forget to log your sleep and recovery for today.", time: "Reminder", page: "recovery", type: "reminder" });
    }
    if (waterToday < 4 && hour >= 12) {
      notifs.push({ id: "rem-water", icon: "💧", color: "#A5E600", title: "Hydration Reminder", desc: `Only ${waterToday} glasses today. Aim for 8+.`, time: "Reminder", page: null, type: "reminder" });
    }
    if (todayCals > (profile?.calories || 2000) * 1.1) {
      notifs.push({ id: "rem-overeat", icon: "🔥", color: "#FF4757", title: "Calorie Over Target", desc: `${todayCals} kcal logged — ${(Math.round((todayCals / (profile?.calories || 2000)) * 100))}% of target.`, time: "Alert", page: "nutrition", type: "reminder" });
    }
    if (todayProt < (profile?.protein || 150) * 0.4 && hour >= 15) {
      notifs.push({ id: "rem-protein", icon: "🥩", color: "#A5E600", title: "Protein Check", desc: `Only ${Math.round(todayProt)}g protein. Target: ${profile?.protein || 150}g.`, time: "Reminder", page: "nutrition", type: "reminder" });
    }

    const recentW = workouts.slice(-3).reverse();
    recentW.forEach(w => notifs.push({
      id: `w-${w.date}`, icon: "🏋️", color: "#C8FF00",
      title: "Workout Completed", desc: `${w.exercises?.length || 0} exercises · ${Math.round(w.totalVolume)}kg volume`,
      time: w.date, page: "workout", type: "activity",
    }));
    const recentN = nutrition.slice(-2).reverse();
    recentN.forEach(n => notifs.push({
      id: `n-${n.date}`, icon: "🥗", color: "#A5E600",
      title: "Nutrition Logged", desc: `${n.calories || 0} kcal · ${n.protein || 0}g protein`,
      time: n.date, page: "nutrition", type: "activity",
    }));
    const recentR = recovery.slice(-2).reverse();
    recentR.forEach(r => notifs.push({
      id: `r-${r.date}`, icon: "😴", color: "#C8FF00",
      title: "Recovery Logged", desc: `Score: ${r.score}/10 · Sleep: ${r.sleep}h`,
      time: r.date, page: "recovery", type: "activity",
    }));
    const newBadges = badges.slice(-3);
    newBadges.forEach(b => notifs.push({
      id: `b-${b}`, icon: "🏆", color: "#FFD700",
      title: "Achievement Unlocked", desc: b.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      time: todayStr, page: null, type: "achievement",
    }));
    return notifs.sort((a, b) => {
      const order = { reminder: 0, achievement: 1, activity: 2 };
      return (order[a.type] ?? 3) - (order[b.type] ?? 3);
    }).slice(0, 15);
  }, [workouts, nutrition, recovery, badges, water, profile]);

  const reminders = items.filter(n => n.type === "reminder");
  const achievements = items.filter(n => n.type === "achievement");
  const activities = items.filter(n => n.type === "activity");

  return (
    <div className="dash-notif-panel" onClick={e => e.stopPropagation()}>
      <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>Notifications</span>
        <button onClick={onClose} style={{ background: "none", color: "#A0A0A0", fontSize: 16, padding: 2 }} tabIndex={0} aria-label="Close notifications">✕</button>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: "24px 12px", textAlign: "center", color: "#A0A0A0", fontSize: 13 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔔</div>
          No notifications yet
        </div>
      ) : (
        <div>
          {reminders.length > 0 && (
            <div style={{ padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(160,160,160,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Reminders</div>
              {reminders.map(n => (
                <div key={n.id} className="dash-reminder" onClick={() => { if (n.page) NAV(n.page); onClose(); }}
                  style={{ cursor: n.page ? "pointer" : "default" }} role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter" && n.page) { NAV(n.page); onClose(); } }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${n.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{n.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 1 }}>{n.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {achievements.length > 0 && (
            <div style={{ padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(160,160,160,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, marginTop: reminders.length > 0 ? 8 : 0 }}>Achievements</div>
              {achievements.map(n => (
                <div key={n.id} className="dash-reminder" style={{ borderColor: "rgba(255,215,0,0.15)", background: "rgba(255,215,0,0.04)" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,215,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{n.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#FFD700" }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 1 }}>{n.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activities.length > 0 && (
            <div style={{ padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(160,160,160,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, marginTop: (reminders.length > 0 || achievements.length > 0) ? 8 : 0 }}>Activity</div>
              {activities.map(n => (
                <div key={n.id} className="dash-notif-item" onClick={() => { if (n.page) NAV(n.page); onClose(); }}
                  style={{ cursor: n.page ? "pointer" : "default" }} role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter" && n.page) { NAV(n.page); onClose(); } }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${n.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{n.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 1 }}>{n.desc}</div>
                  </div>
                  <span style={{ fontSize: 10, color: "rgba(160,160,160,0.4)", flexShrink: 0 }}>{n.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProfileDropdown = ({ profile, dispatch, onClose }) => (
  <div className="dash-dropdown" onClick={e => e.stopPropagation()}>
    <div style={{ padding: "8px 12px 6px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>{profile.name}</div>
      <div style={{ fontSize: 12, color: "#A0A0A0" }}>{profile.goal?.replace(/_/g, " ")}</div>
    </div>
    <button className="dash-dropdown-item" onClick={() => { NAV("profile"); onClose(); }} tabIndex={0}>
      <span>👤</span><span>Profile</span>
    </button>
    <button className="dash-dropdown-item" onClick={() => { NAV("profile"); onClose(); }} tabIndex={0}>
      <span>⚙️</span><span>Settings</span>
    </button>
    <div className="dash-dropdown-divider" />
    <button className="dash-dropdown-item danger" onClick={async () => { onClose(); if (await showConfirm("Reset all data? This will permanently delete all workouts, nutrition logs, and progress. This cannot be undone.")) dispatch({ type: "RESET" }); }} tabIndex={0}>
      <span>🚪</span><span>Reset All Data</span>
    </button>
  </div>
);

const EmptyState = ({ icon, title, subtitle, action, actionLabel }) => (
  <div style={{ textAlign: "center", padding: "32px 16px" }}>
    <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.6 }}>{icon}</div>
    <div style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF", marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: action ? 16 : 0 }}>{subtitle}</div>
    {action && <button className="onb-grad-btn" onClick={action} style={{ width: "auto", padding: "10px 20px", fontSize: 13 }}>{actionLabel}</button>}
  </div>
);

const Dashboard = ({ state, dispatch }) => {
  const { profile, workouts, nutrition, recovery, bodyWeight, water, badges, xp, level, currentProgram } = state;
  const { ask, loading: aiLoading } = useAICoach();
  const [aiInsight, setAiInsight] = useState("");
  const [aiQuickTips, setAiQuickTips] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chartFilter, setChartFilter] = useState("30D");

  const weekVol = calcWeeklyVolume(workouts);
  const streak = calcStreak(workouts);
  const todayNutrition = nutrition.find(n => n.date === today()) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const todayRecovery = recovery.find(r => r.date === today()) || { sleep: 0, quality: 5, stress: 5, score: 0 };
  const latestWeight = bodyWeight.length > 0 ? bodyWeight[bodyWeight.length - 1].weight : profile.weight;
  const weightChange = bodyWeight.length > 1 ? latestWeight - bodyWeight[0].weight : 0;
  const waterLog = (water || {})[today()] || 0;

  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const handler = (e) => { if (notifOpen && !e.target.closest(".dash-notif-panel") && !e.target.closest("[data-notif-btn]")) setNotifOpen(false); if (profileOpen && !e.target.closest(".dash-dropdown") && !e.target.closest("[data-profile-btn]")) setProfileOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen, profileOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") { setNotifOpen(false); setProfileOpen(false); } };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const tips = [];
    if (todayWorkouts.length === 0 && now.getHours() >= 10) {
      tips.push({ icon: "🏋️", text: "No workout logged today — aim for at least 30 min of activity.", page: "workout" });
    }
    if (todayNutrition.calories < profile.calories * 0.3 && now.getHours() >= 13) {
      tips.push({ icon: "🔥", text: `Only ${todayNutrition.calories} kcal logged. You need ${Math.max(0, profile.calories - todayNutrition.calories)} more today.`, page: "nutrition" });
    }
    if (todayNutrition.protein < profile.protein * 0.5 && now.getHours() >= 14) {
      tips.push({ icon: "🥩", text: `Protein is low at ${todayNutrition.protein}g. Aim for ${profile.protein}g — add a protein-rich meal.`, page: "nutrition" });
    }
    if (waterLog < 4 && now.getHours() >= 12) {
      tips.push({ icon: "💧", text: `Only ${waterLog} glasses of water today. Aim for 8+ glasses.`, page: null });
    }
    if (todayRecovery.score && todayRecovery.score < 5) {
      tips.push({ icon: "😴", text: `Recovery is low (${todayRecovery.score}/10). Consider a lighter session or extra rest.`, page: "recovery" });
    }
    if (streak >= 3) {
      tips.push({ icon: "🔥", text: `${streak}-day streak! Keep the momentum going.`, page: null });
    }
    if (bodyWeight.length >= 2) {
      const last = bodyWeight[bodyWeight.length - 1];
      const prev = bodyWeight[bodyWeight.length - 2];
      const diff = last.weight - prev.weight;
      if (Math.abs(diff) > 0.5) {
        tips.push({ icon: "⚖️", text: `Weight ${diff > 0 ? "up" : "down"} ${fmt(Math.abs(diff), 1)}kg since last weigh-in.`, page: "bodyweight" });
      }
    }
    setAiQuickTips(tips.slice(0, 4));
  }, [state, now]);

  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 17 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const quotes = [
    "Consistency beats motivation.",
    "The body achieves what the mind believes.",
    "Discipline is choosing between what you want now and what you want most.",
    "Strength does not come from physical capacity. It comes from an indomitable will.",
    "The only bad workout is the one that didn't happen.",
    "Take care of your body. It's the only place you have to live.",
  ];
  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  const filterDays = chartFilter === "7D" ? 7 : chartFilter === "90D" ? 90 : 30;

  const weightData = useMemo(() =>
    bodyWeight.slice(-filterDays).map(w => ({ date: w.date.slice(5), weight: w.weight })),
    [bodyWeight, filterDays]
  );
  const volumeData = useMemo(() =>
    workouts.slice(-filterDays).map(w => ({ date: w.date.slice(5), volume: Math.round(w.totalVolume) })),
    [workouts, filterDays]
  );
  const recoveryData = useMemo(() =>
    recovery.slice(-filterDays).map(r => ({ date: r.date.slice(5), score: r.score, sleep: r.sleep })),
    [recovery, filterDays]
  );
  const frequencyData = useMemo(() => {
    const data = [];
    for (let i = filterDays - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      data.push({ date: ds.slice(5), workouts: workouts.filter(w => w.date === ds).length });
    }
    return data;
  }, [workouts, filterDays]);

  const caloriePct = Math.min((todayNutrition.calories / Math.max(profile.calories, 1)) * 100, 100);
  const proteinPct = Math.min((todayNutrition.protein / Math.max(profile.protein, 1)) * 100, 100);
  const sleepPct = Math.min((todayRecovery.sleep / 8) * 100, 100);
  const recoveryPct = (todayRecovery.score || 0) * 10;

  const todayWorkouts = workouts.filter(w => w.date === today());
  const workoutMinutes = todayWorkouts.reduce((sum, w) => sum + (w.duration || w.exercises?.length * 8 || 0), 0);

  const muscleGroups = useMemo(() => {
    const recentExercises = workouts.slice(-7).flatMap(w => w.exercises?.map(e => e.name) || []);
    const hasExercise = (names) => names.some(n => recentExercises.some(re => re?.toLowerCase().includes(n.toLowerCase())));
    return [
      { name: "Chest", emoji: "🫁", recovery: hasExercise(["bench", "chest", "push", "dip"]) ? 30 : 100 },
      { name: "Back", emoji: "🔙", recovery: hasExercise(["row", "pull", "deadlift", "lat"]) ? 35 : 100 },
      { name: "Shoulders", emoji: "💪", recovery: hasExercise(["press", "lateral", "shoulder", "ohp"]) ? 25 : 100 },
      { name: "Arms", emoji: "🦾", recovery: hasExercise(["curl", "tricep", "extension"]) ? 40 : 100 },
      { name: "Legs", emoji: "🦵", recovery: hasExercise(["squat", "leg", "lunge", "deadlift"]) ? 20 : 100 },
      { name: "Core", emoji: "🎯", recovery: hasExercise(["plank", "crunch", "sit"]) ? 45 : 100 },
    ];
  }, [workouts]);

  const getInsight = async () => {
    const recent = workouts.slice(-5);
    const avgVolume = recent.length ? recent.reduce((s, w) => s + w.totalVolume, 0) / recent.length : 0;
    const proteinAvg = nutrition.slice(-7).reduce((s, n) => s + (n.protein || 0), 0) / Math.max(nutrition.slice(-7).length, 1);
    const avgSleep = recovery.slice(-7).reduce((s, r) => s + (r.sleep || 0), 0) / Math.max(recovery.slice(-7).length, 1);
    const summary = [
      `User: ${profile.name}, Goal: ${GOAL_LABELS[profile.goal] || profile.goal}, Experience: ${profile.experience || "unknown"}.`,
      `Recent workouts: ${recent.map(w => `${w.date}: ${w.exercises?.map(e => e.name).join(", ")} (vol: ${Math.round(w.totalVolume)}kg)`).join(" | ")}.`,
      `Weekly volume: ${Math.round(weekVol)}kg. Average: ${Math.round(avgVolume)}kg/session.`,
      `Streak: ${streak} days. Total workouts: ${workouts.length}.`,
      `Today: ${todayNutrition.calories}/${profile.calories} kcal, ${todayNutrition.protein}/${profile.protein}g protein.`,
      `7-day avg protein: ${Math.round(proteinAvg)}g. 7-day avg sleep: ${fmt(avgSleep, 1)}h.`,
      `Recovery score: ${todayRecovery.score || "not logged"}/10. Weight: ${latestWeight}kg (started: ${profile.weight}kg).`,
    ].join(" ");
    const text = await ask(
      "You are an elite AI personal trainer. Analyze this data and give 3-4 actionable recommendations. Be specific with numbers. Use emojis. Keep under 150 words.",
      `Review my fitness data: ${summary}`
    );
    if (text) setAiInsight(text);
  };

  const recentActivity = useMemo(() => {
    const items = [];
    workouts.slice(-3).reverse().forEach(w => {
      items.push({ type: "workout", text: `Completed ${w.exercises?.length || 0} exercises`, icon: "🏋️", color: "#C8FF00", time: w.date, page: "workout" });
    });
    nutrition.slice(-2).reverse().forEach(n => {
      if (n.foods?.length) items.push({ type: "nutrition", text: `Logged ${n.foods.length} meal${n.foods.length > 1 ? "s" : ""}`, icon: "🥗", color: "#A5E600", time: n.date, page: "nutrition" });
    });
    recovery.slice(-2).reverse().forEach(r => {
      items.push({ type: "recovery", text: `Recovery score: ${r.score}/10`, icon: "😴", color: "#C8FF00", time: r.date, page: "recovery" });
    });
    bodyWeight.slice(-2).reverse().forEach(b => {
      items.push({ type: "weight", text: `Weighed ${b.weight}kg`, icon: "⚖️", color: "#A5E600", time: b.date, page: "bodyweight" });
    });
    return items.slice(0, 6);
  }, [workouts, nutrition, recovery, bodyWeight]);

  const quickActions = [
    { label: "Start Workout", icon: "🏋️", bg: "rgba(200,255,0,0.1)", border: "rgba(200,255,0,0.15)", page: "workout" },
    { label: "Log Meal", icon: "🥗", bg: "rgba(165,230,0,0.1)", border: "rgba(165,230,0,0.15)", page: "nutrition" },
    { label: "Add Weight", icon: "⚖️", bg: "rgba(200,255,0,0.08)", border: "rgba(200,255,0,0.12)", page: "bodyweight" },
    { label: "Drink Water", icon: "💧", bg: "rgba(165,230,0,0.08)", border: "rgba(165,230,0,0.12)", action: () => { dispatch({ type: "LOG_WATER", payload: { date: today(), amount: 250 } }); showToast("+250ml water logged!"); } },
    { label: "Ask AI Coach", icon: "🤖", bg: "rgba(200,255,0,0.1)", border: "rgba(200,255,0,0.15)", page: "coach" },
  ];

  const summaryCards = [
    { label: "Calories", value: todayNutrition.calories, target: profile.calories, unit: "kcal", icon: "🔥", color: "#C8FF00", pct: caloriePct, page: "nutrition" },
    { label: "Protein", value: todayNutrition.protein, target: profile.protein, unit: "g", icon: "🥩", color: "#A5E600", pct: proteinPct, page: "nutrition" },
    { label: "Workout Time", value: workoutMinutes || 0, target: 60, unit: "min", icon: "⏱️", color: "#C8FF00", pct: workoutMinutes > 0 ? Math.min((workoutMinutes / 60) * 100, 100) : 0, page: "workout" },
    { label: "Sleep", value: todayRecovery.sleep || 0, target: 8, unit: "hrs", icon: "😴", color: "#A5E600", pct: sleepPct, page: "recovery" },
    { label: "Recovery", value: todayRecovery.score || 0, target: 10, unit: "/10", icon: "💚", color: todayRecovery.score >= 7 ? "#A5E600" : todayRecovery.score >= 5 ? "#C8FF00" : "#FF4757", pct: recoveryPct, page: "recovery" },
    { label: "Body Weight", value: latestWeight, target: profile.weight, unit: "kg", icon: "⚖️", color: "#C8FF00", pct: 100, page: "bodyweight", trend: weightChange !== 0 ? `${weightChange > 0 ? "+" : ""}${fmt(weightChange, 1)}kg` : null, trendColor: weightChange > 0 ? "#FF4757" : "#A5E600" },
    { label: "Water", value: waterLog, target: 8, unit: "glasses", icon: "💧", color: "#A5E600", pct: Math.min((waterLog / 8) * 100, 100), page: "nutrition" },
    { label: "Weekly Volume", value: Math.round(weekVol), target: 5000, unit: "kg", icon: "📊", color: "#C8FF00", pct: Math.min((weekVol / 5000) * 100, 100), page: "progress" },
  ];

  const progressBars = [
    { label: "Calories", pct: caloriePct, color: "#C8FF00", current: todayNutrition.calories, target: profile.calories },
    { label: "Protein", pct: proteinPct, color: "#A5E600", current: todayNutrition.protein, target: profile.protein },
    { label: "Water", pct: Math.min((waterLog / 8) * 100, 100), color: "#C8FF00", current: waterLog, target: 8, unit: "glasses" },
    { label: "Workout", pct: workoutMinutes > 0 ? Math.min((workoutMinutes / 60) * 100, 100) : 0, color: "#A5E600", current: workoutMinutes || 0, target: 60, unit: "min" },
    { label: "Sleep", pct: sleepPct, color: "#C8FF00", current: todayRecovery.sleep || 0, target: 8, unit: "hrs" },
  ];

  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
  const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
  const itemFade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  const tooltipStyle = { background: "#1D1D1D", border: "1px solid rgba(200,255,0,0.3)", borderRadius: 10, color: "#FFFFFF", fontSize: 12 };

  return (
    <motion.div style={{ display: "flex", flexDirection: "column", gap: 24 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

      {/* ═══ HEADER ═══ */}
      <div className="dash-header">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <div>
            <motion.h1 {...fadeUp} style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
              {greeting}, <span className="neon">{profile.name}</span> 👋
            </motion.h1>
            <motion.p {...fadeUp} style={{ color: "rgba(160,160,160,0.6)", fontSize: 14, marginBottom: 8 }}>
              "{quote}"
            </motion.p>
            <motion.div {...fadeUp} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "#A0A0A0", flexWrap: "wrap" }}>
              <span>📅 {dateStr}</span>
              <span>•</span>
              <span>🕐 {timeStr}</span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>🔥 <span style={{ color: "#C8FF00", fontWeight: 600 }}>{streak}</span> day streak</span>
              <span>•</span>
              <span>Lv. {level} · {xp} XP</span>
            </motion.div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", position: "relative" }}>
            {/* Notification Bell */}
            <div data-notif-btn style={{
              width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.04)",
              border: `1px solid ${notifOpen ? "rgba(200,255,0,0.3)" : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 16, cursor: "pointer", transition: "all 0.2s", position: "relative",
            }} onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }}
              role="button" tabIndex={0} aria-label="Notifications" aria-expanded={notifOpen}
              onKeyDown={e => { if (e.key === "Enter") { setNotifOpen(p => !p); setProfileOpen(false); } }}>
              🔔
              {workouts.length + nutrition.length + recovery.length > 0 && (
                <div style={{ position: "absolute", top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, background: "#C8FF00", border: "2px solid #0B0B0B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#0B0B0B", padding: "0 3px" }}>
                  {Math.min(workouts.length + nutrition.length + recovery.length, 99)}
                </div>
              )}
            </div>
            {notifOpen && <NotificationPanel workouts={workouts} nutrition={nutrition} recovery={recovery} badges={badges} water={water} profile={profile} onClose={() => setNotifOpen(false)} />}

            {/* Profile Avatar */}
            <div data-profile-btn style={{
              width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #C8FF00, #A5E600)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#0B0B0B", cursor: "pointer", transition: "all 0.2s",
              border: `2px solid ${profileOpen ? "#C8FF00" : "transparent"}`,
            }} onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }}
              role="button" tabIndex={0} aria-label="Profile menu" aria-expanded={profileOpen}
              onKeyDown={e => { if (e.key === "Enter") { setProfileOpen(p => !p); setNotifOpen(false); } }}>
              {(profile.name || "U")[0].toUpperCase()}
            </div>
            {profileOpen && <ProfileDropdown profile={profile} dispatch={dispatch} onClose={() => setProfileOpen(false)} />}
          </div>
        </div>
      </div>

      {/* ═══ QUICK ACTIONS ═══ */}
      <div>
        <div className="dash-section-title"><div className="st-dot" />Quick Actions</div>
        <motion.div className="dash-quick-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }} variants={stagger} initial="initial" animate="animate">
          {quickActions.map((a, i) => (
            <motion.div key={i} className="dash-quick" variants={itemFade} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ background: a.bg, borderColor: a.border }}
              onClick={() => a.action ? a.action() : NAV(a.page)} role="button" tabIndex={0}
              aria-label={a.label}
              onKeyDown={e => { if (e.key === "Enter") a.action ? a.action() : NAV(a.page); }}>
              <div className="q-icon" style={{ background: a.border }}>{a.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{a.label}</div>
                <div style={{ fontSize: 11, color: "rgba(160,160,160,0.5)" }}>{a.action ? "Tap to add" : "Tap to open"}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ═══ TODAY'S GOAL ═══ */}
      <div className="dash-metric" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          {/* Overall ring */}
          {(() => {
            const goals = [
              { met: todayWorkouts.length > 0, label: "Workout", icon: "🏋️", page: "workout" },
              { met: caloriePct >= 80 && caloriePct <= 110, label: "Calories", icon: "🔥", page: "nutrition" },
              { met: proteinPct >= 80, label: "Protein", icon: "🥩", page: "nutrition" },
              { met: waterLog >= 6, label: "Water", icon: "💧", page: "nutrition" },
            ];
            const metCount = goals.filter(g => g.met).length;
            const pct = Math.round((metCount / goals.length) * 100);
            const r = 42;
            const circ = 2 * Math.PI * r;
            const dash = (pct / 100) * circ;
            return (
              <>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <svg width={100} height={100}>
                    <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
                    <circle cx={50} cy={50} r={r} fill="none" stroke={pct === 100 ? "#A5E600" : "#C8FF00"} strokeWidth={7}
                      strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 50 50)"
                      style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
                    <text x={50} y={46} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize={20} fontWeight={700} fontFamily="'JetBrains Mono',monospace">{pct}%</text>
                    <text x={50} y={62} textAnchor="middle" dominantBaseline="middle" fill="#A0A0A0" fontSize={10}>Daily Goal</text>
                  </svg>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
                  {goals.map((g, i) => (
                    <div key={i} className={`dash-goal-indicator ${g.met ? "met" : ""}`}
                      onClick={() => NAV(g.page)} role="button" tabIndex={0}
                      onKeyDown={e => { if (e.key === "Enter") NAV(g.page); }}
                      style={{ flex: "1 1 120px", minWidth: 120 }}>
                      <span style={{ fontSize: 18 }}>{g.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "#FFFFFF", fontWeight: 500 }}>{g.label}</div>
                        <div style={{ fontSize: 11, color: g.met ? "#A5E600" : "rgba(160,160,160,0.5)" }}>{g.met ? "Completed" : "Pending"}</div>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: g.met ? "linear-gradient(135deg, #A5E600, #C8FF00)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: g.met ? "#0B0B0B" : "rgba(160,160,160,0.3)", fontWeight: 700, flexShrink: 0 }}>
                        {g.met ? "✓" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ═══ TODAY'S SUMMARY ═══ */}
      <div>
        <div className="dash-section-title"><div className="st-dot" />Today's Summary</div>
        <motion.div className="dash-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} variants={stagger} initial="initial" animate="animate">
          {summaryCards.map((mc, i) => (
            <motion.div key={i} className="dash-metric dash-clickable" variants={itemFade} whileHover={{ y: -2 }} style={{ "--accent": mc.color }}
              onClick={() => NAV(mc.page)} role="button" tabIndex={0}
              aria-label={`${mc.label}: ${mc.value} ${mc.unit}`}
              onKeyDown={e => { if (e.key === "Enter") NAV(mc.page); }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{mc.icon}</span>
                  <span style={{ fontSize: 12, color: "#A0A0A0", fontWeight: 500 }}>{mc.label}</span>
                </div>
                {mc.trend && (
                  <span style={{ fontSize: 11, color: mc.trendColor, fontWeight: 600 }}>{mc.trend}</span>
                )}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#FFFFFF", marginBottom: 4, lineHeight: 1 }}>
                {mc.value}<span style={{ fontSize: 13, fontWeight: 400, color: "#A0A0A0", marginLeft: 4 }}>{mc.unit}</span>
              </div>
              <div className="dash-progress" style={{ marginTop: 12 }}>
                <div className="dash-progress-fill" style={{ width: `${mc.pct}%`, background: `linear-gradient(90deg, ${mc.color}, ${mc.color}88)` }} />
              </div>
              <div style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", marginTop: 6 }}>
                {mc.label === "Body Weight" ? `Target: ${mc.target}kg` : mc.label === "Weekly Volume" ? `Goal: ${mc.target}kg` : `${Math.round(mc.pct)}% of ${mc.target}${mc.unit}`}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ═══ TODAY'S PROGRESS ═══ */}
      <div>
        <div className="dash-section-title"><div className="st-dot" />Today's Progress</div>
        <motion.div className="dash-metric" variants={itemFade}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {progressBars.map((p, i) => (
              <div key={i} style={{ cursor: "pointer" }} onClick={() => {
                if (p.label === "Calories" || p.label === "Protein" || p.label === "Water") NAV("nutrition");
                else if (p.label === "Workout") NAV("workout");
                else if (p.label === "Sleep") NAV("recovery");
              }} role="button" tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter") {
                if (p.label === "Calories" || p.label === "Protein" || p.label === "Water") NAV("nutrition");
                else if (p.label === "Workout") NAV("workout");
                else if (p.label === "Sleep") NAV("recovery");
              } }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#A0A0A0", fontWeight: 500 }}>{p.label}</span>
                  <span style={{ fontSize: 12, color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{p.current}{p.unit ? ` ${p.unit}` : ""} <span style={{ color: "#A0A0A0", fontWeight: 400 }}>/ {p.target}{p.unit ? ` ${p.unit}` : ""}</span></span>
                </div>
                <div className="dash-progress" style={{ height: 8 }}>
                  <div className="dash-progress-fill" style={{ width: `${p.pct}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}66)` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══ WORKOUT + RECENT ACTIVITY ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="dash-charts-grid">
        {/* Continue Workout */}
        <motion.div className="dash-upcoming-card" variants={itemFade}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(200,255,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏋️</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF" }}>Continue Workout</div>
              <div style={{ fontSize: 12, color: "rgba(160,160,160,0.6)" }}>Pick up where you left off</div>
            </div>
          </div>
          {currentProgram ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#C8FF00", marginBottom: 8 }}>{currentProgram.split?.toUpperCase() || "Current Program"}</div>
              {currentProgram.days?.slice(0, 3).map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 500 }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: "#A0A0A0" }}>{d.exercises?.length || 0} exercises · ~{d.exercises?.length * 8 || 0} min</div>
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(160,160,160,0.4)" }}>Day {i + 1}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="📋" title="No active program" subtitle="Start a program to track your workouts"
              action={() => NAV("programs")} actionLabel="Browse Programs" />
          )}
          <button className="onb-grad-btn" style={{ width: "100%", marginTop: 16, padding: "12px", fontSize: 13, borderRadius: 10 }}
            onClick={() => {
              if (state.activeSession) { NAV("session"); return; }
              if (currentProgram) {
                const nextDayIdx = workouts.length > 0 ? (workouts.length % currentProgram.days.length) : 0;
                const dayToLoad = currentProgram.days[nextDayIdx] || currentProgram.days[0];
                dispatch({ type: "SET_PENDING_WORKOUT", payload: dayToLoad });
                NAV("session");
              } else {
                NAV("workout");
              }
            }} tabIndex={0} aria-label={currentProgram ? "Resume workout" : "Start workout"}>
            {state.activeSession ? "Continue Workout →" : currentProgram ? "Resume Workout →" : "Start Workout →"}
          </button>
        </motion.div>

        {/* Recent Activity */}
        <motion.div className="dash-metric" variants={itemFade}>
          <div className="dash-section-title"><div className="st-dot" />Recent Activity</div>
          {recentActivity.length > 0 ? (
            <div>
              {recentActivity.map((item, i) => (
                <div key={i} className="dash-timeline-item" style={{ cursor: item.page ? "pointer" : "default" }}
                  onClick={() => item.page && NAV(item.page)} role={item.page ? "button" : undefined} tabIndex={item.page ? 0 : undefined}
                  onKeyDown={e => { if (e.key === "Enter" && item.page) NAV(item.page); }}>
                  <div className="dash-activity-dot" style={{ background: item.color, borderColor: item.color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 500 }}>{item.text}</div>
                    <div style={{ fontSize: 11, color: "rgba(160,160,160,0.4)" }}>{item.time}</div>
                  </div>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="📝" title="No recent activity" subtitle="Start your first workout!"
              action={() => NAV("workout")} actionLabel="Start Workout" />
          )}
        </motion.div>
      </div>

      {/* ═══ AI COACH ═══ */}
      <div className="dash-ai-card">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, rgba(200,255,0,0.15), rgba(165,230,0,0.1))",
                border: "1px solid rgba(200,255,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                animation: "glowPulse 3s ease infinite",
              }}>🤖</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}>AI Coach</div>
                <div style={{ fontSize: 13, color: "rgba(160,160,160,0.6)" }}>Your personalized fitness intelligence</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="onb-grad-btn" onClick={getInsight} disabled={aiLoading} style={{ width: "auto", padding: "12px 24px", fontSize: 13 }}
                tabIndex={0} aria-label="Get AI insight">
                {aiLoading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(11,11,11,0.3)", borderTopColor: "#0B0B0B", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                    Analyzing…
                  </span>
                ) : "Get AI Insight ⚡"}
              </button>
              <button className="ghost-btn" onClick={() => NAV("coach")} tabIndex={0} aria-label="Open AI Coach"
                style={{ fontSize: 13, padding: "12px 16px", borderRadius: 10 }}>
                Open Coach →
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }} className="dash-metrics-grid">
            {[
              { label: "Recovery Score", value: todayRecovery.score || "—", sub: todayRecovery.score ? "/10" : "No data", icon: "💚", page: "recovery" },
              { label: "Suggested Focus", value: [...muscleGroups].sort((a, b) => b.recovery - a.recovery)[0]?.name || "—", sub: "Most recovered", icon: "🎯" },
              { label: "Calories Left", value: `${Math.max(0, profile.calories - todayNutrition.calories)}`, sub: "Remaining today", icon: "🥗", page: "nutrition" },
              { label: "Hydration", value: `${waterLog}/8`, sub: "Glasses today", icon: "💧", page: "nutrition" },
            ].map((t, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 12, padding: "14px 16px", cursor: t.page ? "pointer" : "default",
                transition: "border-color 0.2s",
              }} onClick={() => t.page && NAV(t.page)} role={t.page ? "button" : undefined} tabIndex={t.page ? 0 : undefined}
                onKeyDown={e => { if (e.key === "Enter" && t.page) NAV(t.page); }}>
                <div style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{t.icon}</span>{t.label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace" }}>{t.value}</div>
                <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 2 }}>{t.sub}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: "rgba(200,255,0,0.04)", border: "1px solid rgba(200,255,0,0.08)",
            borderRadius: 14, padding: "18px 20px", minHeight: 60,
          }}>
            {aiInsight ? (
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "#FFFFFF", whiteSpace: "pre-wrap" }}>{aiInsight}</p>
            ) : aiQuickTips.length > 0 ? (
              <div>
                <div style={{ fontSize: 12, color: "rgba(160,160,160,0.5)", marginBottom: 10, fontWeight: 500 }}>Personalized Insights</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {aiQuickTips.map((tip, i) => (
                    <div key={i} className="dash-tip-chip" style={{ cursor: tip.page ? "pointer" : "default", width: "100%" }}
                      onClick={() => tip.page && NAV(tip.page)} role={tip.page ? "button" : undefined} tabIndex={tip.page ? 0 : undefined}
                      onKeyDown={e => { if (e.key === "Enter" && tip.page) NAV(tip.page); }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{tip.icon}</span>
                      <span style={{ lineHeight: 1.5 }}>{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 20, opacity: 0.5 }}>💬</div>
                <div>
                  <div style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 500, marginBottom: 2 }}>Ready to analyze your training</div>
                  <div style={{ fontSize: 12, color: "rgba(160,160,160,0.5)" }}>Click "Get AI Insight" for a personalized review based on your workouts, nutrition, and recovery data.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ CHARTS ═══ */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="dash-section-title" style={{ marginBottom: 0 }}><div className="st-dot" />Analytics</div>
          <ChartFilter value={chartFilter} onChange={setChartFilter} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="dash-charts-grid">
          <motion.div className="dash-metric" variants={itemFade} style={{ cursor: "pointer" }} onClick={() => NAV("bodyweight")}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "#A0A0A0", fontWeight: 500 }}>Weight Trend</span>
              <ChartFilter value={chartFilter} onChange={setChartFilter} />
            </div>
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={weightData}>
                  <defs><linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C8FF00" stopOpacity={0.25} /><stop offset="95%" stopColor="#C8FF00" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} domain={["auto", "auto"]} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} kg`, "Weight"]} />
                  <Area type="monotone" dataKey="weight" stroke="#C8FF00" fill="url(#wg2)" strokeWidth={2} dot={false} animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="⚖️" title="No weight data" subtitle="Log your weight to see trends" action={() => NAV("bodyweight")} actionLabel="Add Weight" />}
          </motion.div>

          <motion.div className="dash-metric" variants={itemFade} style={{ cursor: "pointer" }} onClick={() => NAV("workout")}>
            <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 12, fontWeight: 500 }}>Training Volume</div>
            {volumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} kg`, "Volume"]} />
                  <Bar dataKey="volume" fill="#C8FF00" radius={[6, 6, 0, 0]} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="📊" title="No volume data" subtitle="Complete workouts to see volume" action={() => NAV("workout")} actionLabel="Start Workout" />}
          </motion.div>

          <motion.div className="dash-metric" variants={itemFade} style={{ cursor: "pointer" }} onClick={() => NAV("recovery")}>
            <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 12, fontWeight: 500 }}>Recovery & Sleep</div>
            {recoveryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={recoveryData}>
                  <defs>
                    <linearGradient id="recG2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#A5E600" stopOpacity={0.3} /><stop offset="95%" stopColor="#A5E600" stopOpacity={0} /></linearGradient>
                    <linearGradient id="sleepG2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C8FF00" stopOpacity={0.2} /><stop offset="95%" stopColor="#C8FF00" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} domain={[0, 10]} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="score" stroke="#A5E600" fill="url(#recG2)" strokeWidth={2} dot={false} name="Score" animationDuration={1200} />
                  <Area type="monotone" dataKey="sleep" stroke="#C8FF00" fill="url(#sleepG2)" strokeWidth={2} dot={false} name="Sleep (hrs)" animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="😴" title="No recovery data" subtitle="Log your recovery to see trends" action={() => NAV("recovery")} actionLabel="Log Recovery" />}
          </motion.div>

          <motion.div className="dash-metric" variants={itemFade} style={{ cursor: "pointer" }} onClick={() => NAV("progress")}>
            <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 12, fontWeight: 500 }}>Workout Frequency</div>
            {frequencyData.some(d => d.workouts > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} workouts`, "Sessions"]} />
                  <Bar dataKey="workouts" fill="#A5E600" radius={[6, 6, 0, 0]} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="🏋️" title="No workouts yet" subtitle="Start training to see frequency" action={() => NAV("workout")} actionLabel="Start Workout" />}
          </motion.div>
        </div>
      </div>

      {/* ═══ MUSCLE RECOVERY ═══ */}
      <div>
        <div className="dash-section-title"><div className="st-dot" />Muscle Recovery</div>
        <motion.div className="dash-metric" variants={itemFade}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {muscleGroups.map((mg, i) => {
              const color = mg.recovery > 80 ? "#A5E600" : mg.recovery > 50 ? "#C8FF00" : "#FF4757";
              return (
                <div key={i}>
                  <div className="dash-recovery-bar">
                    <span style={{ fontSize: 18 }}>{mg.emoji}</span>
                    <span className="dash-recovery-label">{mg.name}</span>
                    <div className="dash-recovery-track">
                      <div className="dash-recovery-fill" style={{ width: `${mg.recovery}%`, background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
                    </div>
                    <span className="dash-recovery-val" style={{ color }}>{mg.recovery}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: "rgba(160,160,160,0.4)" }}>
            Based on exercises performed in the last 7 days. Higher % = more recovered.
          </div>
        </motion.div>
      </div>

      {/* ═══ ACHIEVEMENTS ═══ */}
      <div>
        <div className="dash-section-title"><div className="st-dot" />Achievements</div>
        <motion.div className="dash-badge-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }} variants={stagger} initial="initial" animate="animate">
          {BADGE_DEFS.map((b) => {
            const earned = badges.includes(b.id);
            return (
              <motion.div key={b.id} className={`dash-badge ${earned ? "earned" : ""}`} variants={itemFade}
                whileHover={{ scale: 1.05, y: -2 }} style={{ position: "relative", opacity: earned ? 1 : 0.4 }}>
                <div className="badge-glow" />
                <span style={{ fontSize: 28, filter: earned ? "none" : "grayscale(1)", position: "relative", zIndex: 1 }}>{b.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 12, color: earned ? "#C8FF00" : "#A0A0A0", position: "relative", zIndex: 1 }}>{b.label}</span>
                <span style={{ fontSize: 10, color: "rgba(160,160,160,0.5)", position: "relative", zIndex: 1 }}>{b.desc}</span>
                {earned && (
                  <div style={{
                    position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%",
                    background: "linear-gradient(135deg, #C8FF00, #A5E600)", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 10, color: "#0B0B0B", fontWeight: 700,
                  }}>✓</div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

    </motion.div>
  );
};

// ── Workout Module ────────────────────────────────────────────────────────

const REST_PRESETS = [60, 90, 120, 180, 300];

const calcCaloriesBurned = (exercises, durationMin, bodyWeight = 75) => {
  const mets = { compound: 6, isolation: 4, bodyweight: 5, plyometric: 8, cardio: 7, olympic: 8 };
  const totalSets = exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).length, 0);
  const totalReps = exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).reduce((s2, st) => s2 + (st.reps || 0), 0), 0);
  const avgMet = exercises.length > 0 ? exercises.reduce((s, ex) => {
    const def = EXERCISE_DB.find(e => e.id === ex.exerciseId);
    return s + (mets[def?.cat] || 5);
  }, 0) / Math.max(exercises.length, 1) : 5;
  const dur = Math.max(durationMin || 1, 1);
  return Math.round(avgMet * bodyWeight * (dur / 60));
};

const RestTimer = ({ duration, onDone, onSkip }) => {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(duration);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          try { const a = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+JkY2Dd2Bwf4eLjIh6YWR3gIaIioh8Zml5g4iJiYd8a21+g4eHh4V+cnB2gIaGhYJ9c3J2gYaGhIJ+cnF1f4WGhIJ9c3J1f4WGhIJ9c3F0f4WGhIJ8c3F0f4WGhIJ8c3F0f4WGhIJ8c3F0f4W="); a.play().catch(()=>{}); } catch(e) {}
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [duration]);

  useEffect(() => { setRemaining(duration); }, [duration]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;
  const r = 90;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <motion.div className="wm-rest-timer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onSkip}>
      <motion.div className="wm-rest-timer-card" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: 20 }}>
          <svg width={220} height={220}>
            <circle cx={110} cy={110} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
            <circle cx={110} cy={110} r={r} fill="none" stroke="#C8FF00" strokeWidth={8} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 110 110)" style={{ transition: "stroke-dasharray 0.5s linear" }} />
          </svg>
          <div style={{ position: "relative", marginTop: -160, textAlign: "center" }}>
            <div className="wm-rest-timer-display">{mins}:{secs.toString().padStart(2, "0")}</div>
          </div>
        </div>
        <div className="wm-rest-timer-label">Rest Timer</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {REST_PRESETS.map(s => (
            <button key={s} className={duration === s ? "neon-btn" : "ghost-btn"} style={{ padding: "8px 16px", fontSize: 12 }}
              onClick={() => { clearInterval(intervalRef.current); setRemaining(s); intervalRef.current = setInterval(() => {
                setRemaining(prev => { if (prev <= 1) { clearInterval(intervalRef.current); try { const alarm = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+JkY2Dd2Bwf4eLjIh6YWR3gIaIioh8Zml5g4iJiYd8a21+g4eHh4V+cnB2gIaGhYJ9c3J2gYaGhIJ8c3J1f4WGhIJ8c3J1f4WGhIJ8c3F0f4WGhIJ8c3F0f4WGhIJ8c3F0f4WGhIJ8c3F0f4WGhA=="); alarm.play().catch(()=>{}); } catch(e) {} onDone(); return 0; } return prev - 1; });
              }, 1000); }}
            >{Math.floor(s / 60)}:{(s % 60).toString().padStart(2, "0")}</button>
          ))}
        </div>
        <button className="ghost-btn" onClick={onSkip} style={{ marginTop: 20, width: "100%", padding: 12 }}>Skip Rest →</button>
      </motion.div>
    </motion.div>
  );
};

const FinishWorkoutSummary = ({ session, duration, onClose, onDiscard }) => {
  const totalVolume = session.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.done).reduce((s, st) => s + (st.weight || 0) * (st.reps || 0), 0), 0);
  const totalSets = session.exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).length, 0);
  const totalReps = session.exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).reduce((s2, st) => s2 + (st.reps || 0), 0), 0);
  const calories = calcCaloriesBurned(session.exercises, duration);

  const perExercise = session.exercises.map(ex => {
    const doneSets = ex.sets.filter(s => s.done);
    const vol = doneSets.reduce((s, st) => s + (st.weight || 0) * (st.reps || 0), 0);
    const bestSet = doneSets.reduce((best, st) => {
      const e1rm = calcE1RM(st.weight, st.reps);
      return e1rm > (best?.e1rm || 0) ? { ...st, e1rm } : best;
    }, null);
    return { name: ex.exerciseName, sets: doneSets.length, reps: doneSets.reduce((s, st) => s + (st.reps || 0), 0), volume: vol, bestE1RM: bestSet?.e1rm || 0 };
  });

  return (
    <motion.div className="wm-summary-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="wm-summary-card" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Workout Complete!</h2>
        <p style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 24 }}>{session.name} · {duration} min</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
          <div style={{ background: "rgba(200,255,0,0.08)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Volume</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#C8FF00" }}>{fmt(totalVolume)}<span style={{ fontSize: 12, color: "#A0A0A0" }}> kg</span></div>
          </div>
          <div style={{ background: "rgba(165,230,0,0.08)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Calories</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#A5E600" }}>{calories}<span style={{ fontSize: 12, color: "#A0A0A0" }}> kcal</span></div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sets</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#FFFFFF" }}>{totalSets}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Reps</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#FFFFFF" }}>{totalReps}</div>
          </div>
        </div>

        <div style={{ textAlign: "left", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#FFFFFF" }}>Exercise Breakdown</div>
          {perExercise.map((ex, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
              <span style={{ color: "#FFFFFF" }}>{ex.name}</span>
              <span style={{ color: "#A0A0A0", fontFamily: "'JetBrains Mono',monospace" }}>{ex.sets}×{Math.round(ex.volume)}kg · e1RM {fmt(ex.bestE1RM, 1)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="ghost-btn" onClick={onDiscard} style={{ flex: 1, padding: 12, color: "#FF4757", borderColor: "rgba(255,71,87,0.3)" }}>Discard</button>
          <button className="neon-btn" onClick={() => onClose(calories)} style={{ flex: 2, padding: 12 }}>Save +50 XP</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const WorkoutSession = ({ state, dispatch }) => {
  const session = state.activeSession;
  const [showSummary, setShowSummary] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [addExOpen, setAddExOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    if (!session) return;
    lastTickRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [session?.startTime]);

  useEffect(() => {
    if (!session) return;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [session]);

  if (!session) {
    return (
      <div className="wm-empty">
        <div className="wm-empty-icon">🏋️</div>
        <div className="wm-empty-title">No Active Workout</div>
        <div className="wm-empty-desc">Start a workout from the Dashboard or Templates tab.</div>
        <button className="neon-btn" onClick={() => NAV("dashboard")}>Go to Dashboard</button>
      </div>
    );
  }

  const totalVolume = session.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.done).reduce((s, st) => s + (st.weight || 0) * (st.reps || 0), 0), 0);
  const totalSets = session.exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).length, 0);
  const totalReps = session.exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).reduce((s2, st) => s2 + (st.reps || 0), 0), 0);
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;

  const allExercises = [...EXERCISE_DB, ...(state.customExercises || [])];
  const filteredExercises = allExercises.filter(ex => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return ex.name.toLowerCase().includes(q) || ex.primary.toLowerCase().includes(q) || ex.equip.toLowerCase().includes(q);
  }).slice(0, 20);

  const addExercise = (exDef) => {
    dispatch({ type: "ADD_EXERCISE_TO_SESSION", payload: { exerciseId: exDef.id, exerciseName: exDef.name, sets: exDef.defaultSets } });
    setAddExOpen(false);
    setSearchQuery("");
  };

  const finishWorkout = () => {
    setShowSummary(true);
  };

  const confirmFinish = (calories) => {
    dispatch({ type: "FINISH_SESSION", payload: { calories } });
    showToast("Workout saved! +50 XP");
    setShowSummary(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div className="wm-session-bar">
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF" }}>{session.name}</div>
          <div className="wm-session-timer">{elapsedMin}:{elapsedSec.toString().padStart(2, "0")}</div>
        </div>
        <div className="wm-session-stats">
          <div className="wm-session-stat">Vol: <span>{fmt(totalVolume)}kg</span></div>
          <div className="wm-session-stat">Sets: <span>{totalSets}</span></div>
          <div className="wm-session-stat">Reps: <span>{totalReps}</span></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ghost-btn" onClick={() => { if (confirm("Discard this workout?")) dispatch({ type: "DISCARD_SESSION" }); }} style={{ fontSize: 12, color: "#FF4757" }}>Discard</button>
          <button className="neon-btn" onClick={finishWorkout} style={{ fontSize: 13, padding: "8px 16px" }}>Finish ✓</button>
        </div>
      </div>

      <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 0 }}>
        {session.exercises.map((ex, ei) => {
          const exDef = EXERCISE_DB.find(e => e.id === ex.exerciseId) || {};
          const prevWorkout = state.workouts.slice().reverse().find(w => w.exercises?.some(e => e.name === ex.exerciseName));
          const prevEx = prevWorkout?.exercises?.find(e => e.name === ex.exerciseName);

          return (
            <motion.div key={ei} className="wm-exercise-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ei * 0.05 }}>
              <div className="wm-exercise-header">
                <div>
                  <div className="wm-exercise-name">{ex.exerciseName}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    {exDef.primary && <span className="wm-muscle-tag">{exDef.primary}</span>}
                    {exDef.secondary && <span className="wm-muscle-tag" style={{ background: "rgba(165,230,0,0.1)", color: "#A5E600" }}>{exDef.secondary.split(",")[0]}</span>}
                    {exDef.equip && <span className="wm-muscle-tag" style={{ background: "rgba(255,255,255,0.04)", color: "#A0A0A0" }}>{exDef.equip}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="ghost-btn" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => dispatch({ type: "ADD_SET_TO_EXERCISE", payload: { exerciseIndex: ei } })}>+ Set</button>
                  <button className="ghost-btn" style={{ padding: "4px 8px", fontSize: 11, color: "#FF4757", borderColor: "rgba(255,71,87,0.3)" }}
                    onClick={() => { if (confirm(`Remove ${ex.exerciseName}?`)) dispatch({ type: "REMOVE_EXERCISE_FROM_SESSION", payload: ei }); }}>✕</button>
                </div>
              </div>

              {prevEx && (
                <div style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", marginBottom: 8 }}>
                  Previous: {prevEx.sets?.length} sets · {prevEx.sets?.[0]?.weight || 0}kg × {prevEx.sets?.[0]?.reps || 0} reps
                </div>
              )}

              <div className="wm-set-header">
                <span>Set</span><span>Weight</span><span>Reps</span><span>RPE</span><span>Est. 1RM</span><span></span>
              </div>
              {ex.sets.map((set, si) => (
                <div key={si} className="wm-set-row" style={{ opacity: set.done ? 0.6 : 1 }}>
                  <div className="wm-set-num" style={{ color: set.done ? "#C8FF00" : "#A0A0A0" }}>
                    {set.isWarmup ? "W" : si + 1}
                  </div>
                  <input className="wm-set-input" type="number" value={set.weight} placeholder="kg"
                    onChange={e => dispatch({ type: "UPDATE_SET", payload: { exerciseIndex: ei, setIndex: si, field: "weight", value: +e.target.value } })} />
                  <input className="wm-set-input" type="number" value={set.reps} placeholder="reps"
                    onChange={e => dispatch({ type: "UPDATE_SET", payload: { exerciseIndex: ei, setIndex: si, field: "reps", value: +e.target.value } })} />
                  <input className="wm-set-input rpe" type="number" value={set.rpe || ""} placeholder="RPE" min={1} max={10}
                    onChange={e => dispatch({ type: "UPDATE_SET", payload: { exerciseIndex: ei, setIndex: si, field: "rpe", value: +e.target.value } })} />
                  <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: set.weight > 0 ? "#C8FF00" : "rgba(160,160,160,0.3)", textAlign: "center" }}>
                    {set.weight > 0 ? fmt(calcE1RM(set.weight, set.reps), 1) : "—"}
                  </div>
                  <button className={`wm-set-done ${set.done ? "checked" : ""}`}
                    onClick={() => {
                      dispatch({ type: "TOGGLE_SET_DONE", payload: { exerciseIndex: ei, setIndex: si } });
                      if (!set.done && set.isWarmup === false) {
                        setShowRest(true);
                      }
                    }}>
                    {set.done ? "✓" : ""}
                  </button>
                </div>
              ))}

              <div style={{ marginTop: 8 }}>
                <textarea className="wm-notes-input" placeholder="Notes for this exercise..." value={ex.notes}
                  onChange={e => dispatch({ type: "UPDATE_EXERCISE_NOTES", payload: { index: ei, notes: e.target.value } })} />
              </div>
            </motion.div>
          );
        })}

        <button className="ghost-btn" onClick={() => setAddExOpen(true)}
          style={{ width: "100%", padding: 14, borderStyle: "dashed", fontSize: 14 }}>
          + Add Exercise
        </button>
      </div>

      <AnimatePresence>
        {showRest && <RestTimer duration={restDuration} onDone={() => setShowRest(false)} onSkip={() => setShowRest(false)} />}
        {showSummary && <FinishWorkoutSummary session={session} duration={elapsedMin} onClose={confirmFinish} onDiscard={() => { dispatch({ type: "DISCARD_SESSION" }); setShowSummary(false); }} />}
      </AnimatePresence>

      {addExOpen && (
        <motion.div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900, padding: 20 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAddExOpen(false)}>
          <motion.div style={{ width: "100%", maxWidth: 500, maxHeight: "80vh", background: "rgba(15,15,15,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}
            initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>Add Exercise</h3>
              <button className="ghost-btn" onClick={() => setAddExOpen(false)} style={{ padding: "4px 8px" }}>✕</button>
            </div>
            <div className="wm-search-bar">
              <span className="search-icon">🔍</span>
              <input placeholder="Search exercises..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filteredExercises.map(ex => (
                <div key={ex.id} className="wm-exercise-card" style={{ padding: 12, marginBottom: 8, cursor: "pointer" }}
                  onClick={() => addExercise(ex)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>{ex.name}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        <span className="wm-muscle-tag">{ex.primary}</span>
                        <span className="wm-muscle-tag" style={{ background: "rgba(255,255,255,0.04)", color: "#A0A0A0" }}>{ex.equip}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 20, color: "#C8FF00" }}>+</span>
                  </div>
                </div>
              ))}
              {filteredExercises.length === 0 && (
                <div style={{ textAlign: "center", padding: 24, color: "#A0A0A0", fontSize: 13 }}>No exercises found</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

const ExerciseLibraryBase = ({ state, dispatch }) => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [equipFilter, setEquipFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newEx, setNewEx] = useState({ name: "", primary: "", secondary: "", equip: "Bodyweight", cat: "compound", type: "strength" });

  const allExercises = [...EXERCISE_DB, ...(state.customExercises || [])];
  const filtered = allExercises.filter(ex => {
    if (catFilter !== "all" && ex.cat !== catFilter) return false;
    if (muscleFilter !== "all" && ex.primary !== muscleFilter) return false;
    if (equipFilter !== "all" && ex.equip !== equipFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return ex.name.toLowerCase().includes(q) || ex.primary.toLowerCase().includes(q) || (ex.secondary || "").toLowerCase().includes(q) || ex.equip.toLowerCase().includes(q);
    }
    return true;
  });

  const addCustomExercise = () => {
    if (!newEx.name.trim()) return;
    dispatch({ type: "ADD_CUSTOM_EXERCISE", payload: { ...newEx, id: `custom_${Date.now()}`, name: newEx.name.trim() } });
    setNewEx({ name: "", primary: "", secondary: "", equip: "Bodyweight", cat: "compound", type: "strength" });
    setShowAdd(false);
    showToast("Exercise added to library");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="wm-page-header">
        <h2>Exercise Library</h2>
        <button className="neon-btn" onClick={() => setShowAdd(true)} style={{ fontSize: 13 }}>+ Custom Exercise</button>
      </div>

      <div className="wm-search-bar">
        <span className="search-icon">🔍</span>
        <input placeholder="Search exercises by name, muscle, or equipment..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="wm-filter-chips">
        <span style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", alignSelf: "center", marginRight: 4 }}>Muscle:</span>
        <button className={`wm-chip ${muscleFilter === "all" ? "active" : ""}`} onClick={() => setMuscleFilter("all")}>All</button>
        {MUSCLE_GROUPS.map(m => (
          <button key={m} className={`wm-chip ${muscleFilter === m ? "active" : ""}`} onClick={() => setMuscleFilter(m)}>{m}</button>
        ))}
      </div>
      <div className="wm-filter-chips">
        <span style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", alignSelf: "center", marginRight: 4 }}>Category:</span>
        <button className={`wm-chip ${catFilter === "all" ? "active" : ""}`} onClick={() => setCatFilter("all")}>All</button>
        {EXERCISE_CATEGORIES.map(c => (
          <button key={c} className={`wm-chip ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>
        ))}
      </div>
      <div className="wm-filter-chips">
        <span style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", alignSelf: "center", marginRight: 4 }}>Equipment:</span>
        <button className={`wm-chip ${equipFilter === "all" ? "active" : ""}`} onClick={() => setEquipFilter("all")}>All</button>
        {EQUIPMENT_TYPES.map(e => (
          <button key={e} className={`wm-chip ${equipFilter === e ? "active" : ""}`} onClick={() => setEquipFilter(e)}>{e}</button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 4 }}>{filtered.length} exercise{filtered.length !== 1 ? "s" : ""}</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {filtered.map(ex => (
          <motion.div key={ex.id} className="wm-exercise-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ borderColor: "rgba(200,255,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF", marginBottom: 4 }}>{ex.name}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <span className="wm-muscle-tag">{ex.primary}</span>
                  {ex.secondary && <span className="wm-muscle-tag" style={{ background: "rgba(165,230,0,0.1)", color: "#A5E600" }}>{ex.secondary.split(",")[0]}</span>}
                </div>
              </div>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)", color: "#A0A0A0" }}>{ex.equip}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "rgba(160,160,160,0.5)" }}>
              <span>{ex.defaultSets} sets × {ex.defaultReps} reps</span>
              <span>{ex.type}</span>
            </div>
            {ex.id?.startsWith("custom_") && (
              <button className="ghost-btn" style={{ marginTop: 8, fontSize: 11, color: "#FF4757", padding: "4px 8px" }}
                onClick={() => { if (confirm(`Delete ${ex.name}?`)) dispatch({ type: "DELETE_CUSTOM_EXERCISE", payload: ex.id }); }}>Delete</button>
            )}
          </motion.div>
        ))}
      </div>

      {showAdd && (
        <motion.div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900, padding: 20 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowAdd(false)}>
          <motion.div style={{ width: "100%", maxWidth: 420, background: "rgba(15,15,15,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}
            initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", marginBottom: 16 }}>Add Custom Exercise</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input placeholder="Exercise name" value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))} autoFocus />
              <input placeholder="Primary muscle (e.g., Chest)" value={newEx.primary} onChange={e => setNewEx(p => ({ ...p, primary: e.target.value }))} />
              <input placeholder="Secondary muscles (optional)" value={newEx.secondary} onChange={e => setNewEx(p => ({ ...p, secondary: e.target.value }))} />
              <select value={newEx.equip} onChange={e => setNewEx(p => ({ ...p, equip: e.target.value }))}>
                {EQUIPMENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <select value={newEx.cat} onChange={e => setNewEx(p => ({ ...p, cat: e.target.value }))}>
                {EXERCISE_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="ghost-btn" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button className="neon-btn" onClick={addCustomExercise} style={{ flex: 1, padding: 12 }}>Add Exercise</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

const WorkoutTemplates = ({ state, dispatch }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [tmplName, setTmplName] = useState("");
  const [tmplDesc, setTmplDesc] = useState("");
  const [tmplExercises, setTmplExercises] = useState([]);
  const [addExSearch, setAddExSearch] = useState("");
  const [addExOpen, setAddExOpen] = useState(false);

  const openCreate = (template = null) => {
    if (template) {
      setEditTemplate(template);
      setTmplName(template.name);
      setTmplDesc(template.description || "");
      setTmplExercises(template.exercises.map(e => ({ ...e })));
    } else {
      setEditTemplate(null);
      setTmplName("");
      setTmplDesc("");
      setTmplExercises([]);
    }
    setShowCreate(true);
  };

  const saveTemplate = () => {
    if (!tmplName.trim() || tmplExercises.length === 0) return;
    const payload = { name: tmplName.trim(), description: tmplDesc.trim(), exercises: tmplExercises };
    if (editTemplate) {
      dispatch({ type: "UPDATE_TEMPLATE", payload: { ...payload, id: editTemplate.id } });
      showToast("Template updated");
    } else {
      dispatch({ type: "SAVE_TEMPLATE", payload });
      showToast("Template saved");
    }
    setShowCreate(false);
  };

  const startFromTemplate = (template) => {
    if (state.activeSession) { showToast("Finish your current workout first"); return; }
    const session = {
      id: Date.now(), date: today(), startTime: new Date().toISOString(),
      name: template.name, exercises: template.exercises.map(e => {
        const exDef = EXERCISE_DB.find(d => d.id === e.exerciseId) || {};
        return {
          exerciseId: e.exerciseId, exerciseName: e.exerciseName || exDef.name || "Unknown", notes: "",
          prevWeight: 0, prevReps: 0,
          sets: Array.from({ length: e.sets || exDef.defaultSets || 3 }, (_, i) => ({
            setNum: i + 1, weight: e.lastWeight || 0, reps: e.defaultReps || exDef.defaultReps || 10, rpe: 0, done: false, isWarmup: false, isDropset: false,
          })),
        };
      }),
    };
    dispatch({ type: "START_SESSION", payload: session });
    NAV("session");
  };

  const addExerciseToTemplate = (exDef) => {
    setTmplExercises(p => [...p, { exerciseId: exDef.id, exerciseName: exDef.name, sets: exDef.defaultSets, defaultReps: exDef.defaultReps, lastWeight: 0 }]);
    setAddExOpen(false);
    setAddExSearch("");
  };

  const allExercises = [...EXERCISE_DB, ...(state.customExercises || [])];
  const searchResults = allExercises.filter(ex => addExSearch ? ex.name.toLowerCase().includes(addExSearch.toLowerCase()) || ex.primary.toLowerCase().includes(addExSearch.toLowerCase()) : false).slice(0, 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="wm-page-header">
        <h2>Workout Templates</h2>
        <button className="neon-btn" onClick={() => openCreate()} style={{ fontSize: 13 }}>+ Create Template</button>
      </div>

      {(state.workoutTemplates || []).length === 0 && !showCreate ? (
        <div className="wm-empty">
          <div className="wm-empty-icon">📋</div>
          <div className="wm-empty-title">No Templates Yet</div>
          <div className="wm-empty-desc">Create reusable workout templates to start sessions quickly.</div>
          <button className="neon-btn" onClick={() => openCreate()}>Create Your First Template</button>
        </div>
      ) : !showCreate && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {(state.workoutTemplates || []).map(t => (
            <motion.div key={t.id} className="wm-template-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF", marginBottom: 4 }}>{t.name}</div>
              {t.description && <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 8 }}>{t.description}</div>}
              <div style={{ fontSize: 12, color: "rgba(160,160,160,0.5)", marginBottom: 12 }}>
                {t.exercises?.length || 0} exercise{t.exercises?.length !== 1 ? "s" : ""} · {t.exercises?.reduce((s, e) => s + (e.sets || 3), 0) || 0} sets
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                {t.exercises?.slice(0, 5).map((e, i) => (
                  <span key={i} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(200,255,0,0.08)", color: "#C8FF00" }}>{e.exerciseName}</span>
                ))}
                {(t.exercises?.length || 0) > 5 && <span style={{ fontSize: 10, color: "#A0A0A0" }}>+{t.exercises.length - 5} more</span>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="neon-btn" onClick={() => startFromTemplate(t)} style={{ flex: 1, fontSize: 12, padding: "8px 0" }}>Start Workout</button>
                <button className="ghost-btn" onClick={() => openCreate(t)} style={{ fontSize: 12, padding: "8px 12px" }}>Edit</button>
                <button className="ghost-btn" onClick={() => { if (confirm(`Delete "${t.name}"?`)) dispatch({ type: "DELETE_TEMPLATE", payload: t.id }); }}
                  style={{ fontSize: 12, padding: "8px 10px", color: "#FF4757", borderColor: "rgba(255,71,87,0.3)" }}>✕</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>{editTemplate ? "Edit Template" : "Create Template"}</h3>
              <button className="ghost-btn" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <input placeholder="Template name (e.g., Push Day A)" value={tmplName} onChange={e => setTmplName(e.target.value)} autoFocus />
              <input placeholder="Description (optional)" value={tmplDesc} onChange={e => setTmplDesc(e.target.value)} />
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", marginBottom: 10 }}>Exercises ({tmplExercises.length})</div>
            {tmplExercises.map((ex, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#A0A0A0", width: 20, textAlign: "center" }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: "#FFFFFF", flex: 1 }}>{ex.exerciseName}</span>
                <input className="wm-set-input" type="number" value={ex.sets} style={{ width: 50 }} placeholder="Sets"
                  onChange={e => setTmplExercises(p => p.map((x, j) => j === i ? { ...x, sets: +e.target.value } : x))} />
                <span style={{ fontSize: 11, color: "#A0A0A0" }}>×&nbsp;</span>
                <input className="wm-set-input" type="number" value={ex.defaultReps} style={{ width: 50 }} placeholder="Reps"
                  onChange={e => setTmplExercises(p => p.map((x, j) => j === i ? { ...x, defaultReps: +e.target.value } : x))} />
                <button onClick={() => setTmplExercises(p => p.filter((_, j) => j !== i))} style={{ background: "none", color: "#FF4757", fontSize: 16, padding: 4 }}>×</button>
              </div>
            ))}

            <div style={{ position: "relative", marginTop: 8 }}>
              <button className="ghost-btn" onClick={() => setAddExOpen(!addExOpen)} style={{ width: "100%", padding: 10, borderStyle: "dashed", fontSize: 13 }}>+ Add Exercise</button>
              {addExOpen && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "rgba(15,15,15,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 8, zIndex: 10, maxHeight: 250, overflowY: "auto" }}>
                  <input placeholder="Search..." value={addExSearch} onChange={e => setAddExSearch(e.target.value)} autoFocus style={{ marginBottom: 6 }} />
                  {searchResults.map(ex => (
                    <div key={ex.id} style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#FFFFFF", transition: "background 0.15s" }}
                      className="wm-exercise-card" onClick={() => addExerciseToTemplate(ex)}>
                      {ex.name} <span style={{ fontSize: 11, color: "#A0A0A0" }}>({ex.primary})</span>
                    </div>
                  ))}
                  {addExSearch && searchResults.length === 0 && (
                    <div style={{ padding: 12, textAlign: "center", fontSize: 12, color: "#A0A0A0" }}>No results</div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="ghost-btn" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: 12 }}>Cancel</button>
              <button className="neon-btn" onClick={saveTemplate} disabled={!tmplName.trim() || tmplExercises.length === 0} style={{ flex: 2, padding: 12 }}>
                {editTemplate ? "Update Template" : "Save Template"}
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

const WorkoutHistory = ({ state }) => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [expandedId, setExpandedId] = useState(null);

  const workouts = useMemo(() => {
    let list = [...(state.workouts || [])];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(w =>
        w.date?.includes(q) || w.name?.toLowerCase().includes(q) ||
        w.exercises?.some(e => e.name?.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      if (sortBy === "date") return (b.date || "").localeCompare(a.date || "");
      if (sortBy === "volume") return (b.totalVolume || 0) - (a.totalVolume || 0);
      if (sortBy === "duration") return (b.duration || 0) - (a.duration || 0);
      return 0;
    });
    return list;
  }, [state.workouts, search, sortBy]);

  const getPrevWorkout = (w, idx) => {
    const sameExercises = state.workouts.filter(w2 => w2.id !== w.id && w2.exercises?.some(e => w.exercises?.some(w3 => w3.name === e.name)));
    return sameExercises.length > 0 ? sameExercises[sameExercises.length - 1] : null;
  };

  const weeklyVolume = useMemo(() => {
    const weeks = {};
    state.workouts.forEach(w => {
      if (!w.date) return;
      const d = new Date(w.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split("T")[0];
      weeks[key] = (weeks[key] || 0) + (w.totalVolume || 0);
    });
    return Object.entries(weeks).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 8);
  }, [state.workouts]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="wm-page-header">
        <h2>Workout History</h2>
        <div style={{ fontSize: 12, color: "#A0A0A0" }}>{workouts.length} workout{workouts.length !== 1 ? "s" : ""}</div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <div className="wm-search-bar" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input placeholder="Search workouts, exercises..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 140, height: 42 }}>
          <option value="date">Sort by Date</option>
          <option value="volume">Sort by Volume</option>
          <option value="duration">Sort by Duration</option>
        </select>
      </div>

      {weeklyVolume.length > 0 && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", marginBottom: 12 }}>Weekly Volume Trend</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyVolume.map(([week, vol]) => ({ week: week.slice(5), volume: Math.round(vol) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#A0A0A0" }} />
              <YAxis tick={{ fontSize: 11, fill: "#A0A0A0" }} />
              <Tooltip contentStyle={{ background: "rgba(15,15,15,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="volume" fill="#C8FF00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {workouts.length === 0 ? (
        <div className="wm-empty">
          <div className="wm-empty-icon">📋</div>
          <div className="wm-empty-title">No Workouts Yet</div>
          <div className="wm-empty-desc">Complete your first workout to see it here.</div>
        </div>
      ) : (
        workouts.map((w, i) => {
          const prev = getPrevWorkout(w, i);
          const isExpanded = expandedId === w.id;
          return (
            <motion.div key={w.id} className="wm-history-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => setExpandedId(isExpanded ? null : w.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>{w.name || "Workout"}</div>
                  <div style={{ fontSize: 12, color: "#A0A0A0", marginTop: 2 }}>{w.date}{w.duration ? ` · ${w.duration} min` : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#C8FF00" }}>{fmt(w.totalVolume)}<span style={{ fontSize: 11, color: "#A0A0A0" }}> kg</span></div>
                  {w.calories ? <div style={{ fontSize: 11, color: "#A0A0A0" }}>{w.calories} kcal</div> : null}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                {w.exercises?.slice(0, isExpanded ? 99 : 4).map((e, j) => (
                  <span key={j} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(200,255,0,0.08)", color: "#C8FF00" }}>
                    {e.name} {e.sets?.filter(s => s.done !== false).length || e.sets?.length || 0}×{e.sets?.[0]?.reps || "?"}@{e.sets?.[0]?.weight || "?"}kg
                  </span>
                ))}
                {!isExpanded && (w.exercises?.length || 0) > 4 && <span style={{ fontSize: 10, color: "#A0A0A0", alignSelf: "center" }}>+{w.exercises.length - 4} more</span>}
              </div>

              {isExpanded && prev && (
                <div style={{ marginTop: 12, padding: 10, background: "rgba(200,255,0,0.04)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#C8FF00", marginBottom: 6 }}>vs Previous ({prev.date})</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                    <span style={{ color: (w.totalVolume || 0) > (prev.totalVolume || 0) ? "#A5E600" : "#FF4757" }}>
                      Volume: {fmt(w.totalVolume)} vs {fmt(prev.totalVolume)} ({(w.totalVolume || 0) > (prev.totalVolume || 0) ? "+" : ""}{fmt(((w.totalVolume || 0) / Math.max(prev.totalVolume || 1, 1) - 1) * 100, 1)}%)
                    </span>
                  </div>
                </div>
              )}

              {isExpanded && w.prs && w.prs.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {w.prs.map((pr, j) => (
                    <span key={j} className="wm-pr-card" style={{ padding: "4px 8px", fontSize: 10 }}>🏆 {pr}</span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })
      )}
    </div>
  );
};

const PersonalRecords = ({ state }) => {
  const prs = state.personalRecords || {};
  const prEntries = Object.entries(prs).map(([exerciseId, pr]) => {
    const exDef = EXERCISE_DB.find(e => e.id === exerciseId);
    return { exerciseId, name: exDef?.name || exerciseId, primary: exDef?.primary || "", ...pr };
  }).sort((a, b) => (b.e1rm || 0) - (a.e1rm || 0));

  const recentPRs = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return prEntries.filter(pr => pr.date >= cutoffStr);
  }, [prEntries]);

  const e1rmByMuscle = useMemo(() => {
    const groups = {};
    prEntries.forEach(pr => {
      const m = pr.primary || "Other";
      if (!groups[m]) groups[m] = [];
      groups[m].push(pr);
    });
    return groups;
  }, [prEntries]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="wm-page-header">
        <h2>Personal Records</h2>
        <div style={{ fontSize: 12, color: "#A0A0A0" }}>{prEntries.length} exercise{prEntries.length !== 1 ? "s" : ""} tracked</div>
      </div>

      {recentPRs.length > 0 && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#FFD700", marginBottom: 10 }}>🏆 New PRs This Month</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {recentPRs.map(pr => (
              <span key={pr.exerciseId} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", fontSize: 12, color: "#FFD700" }}>
                {pr.name}: {pr.weight}kg × {pr.reps}
              </span>
            ))}
          </div>
        </Card>
      )}

      {prEntries.length === 0 ? (
        <div className="wm-empty">
          <div className="wm-empty-icon">🏆</div>
          <div className="wm-empty-title">No Records Yet</div>
          <div className="wm-empty-desc">Complete workouts to track your personal records automatically.</div>
        </div>
      ) : (
        <>
          {Object.entries(e1rmByMuscle).map(([muscle, exercises]) => (
            <div key={muscle}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#C8FF00", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{muscle}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                {exercises.map(pr => (
                  <motion.div key={pr.exerciseId} className="wm-pr-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", marginBottom: 6 }}>{pr.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span className="pr-badge" style={{ marginRight: 6 }}>🏆 PR</span>
                        <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#C8FF00" }}>{pr.weight}<span style={{ fontSize: 12, color: "#A0A0A0" }}>kg</span></span>
                        <span style={{ fontSize: 13, color: "#A0A0A0", marginLeft: 6 }}>×{pr.reps}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(160,160,160,0.4)" }}>{pr.date}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", marginTop: 4 }}>Est. 1RM: {fmt(pr.e1rm || 0, 1)}kg</div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const WORKOUT_TAB_MAP = { workout: "library", session: "session", library: "library", templates: "templates", history: "history", prs: "prs" };

const WorkoutHub = ({ state, dispatch, page }) => {
  const [tab, setTab] = useState(WORKOUT_TAB_MAP[page] || (state.activeSession ? "session" : "library"));
  const tabs = [
    { id: "library", label: "Exercise Library", icon: "📚" },
    { id: "templates", label: "Templates", icon: "📋" },
    { id: "session", label: "Active Workout", icon: "🏋️" },
    { id: "history", label: "History", icon: "📅" },
    { id: "prs", label: "Personal Records", icon: "🏆" },
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
      id: Date.now(), date: today(), startTime: new Date().toISOString(),
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
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "library" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <button className="neon-btn" onClick={startQuickWorkout} style={{ fontSize: 13, padding: "10px 20px" }}>🚀 Start Quick Workout</button>
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
// ── Nutrition ───────────────────────────────────────────────────────────────
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const Nutrition = ({ state, dispatch }) => {
  const { profile, nutrition, water } = state;
  const { ask, loading: aiLoading } = useAICoach();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servingQty, setServingQty] = useState(100);
  const [mealType, setMealType] = useState("Lunch");
  const [showDropdown, setShowDropdown] = useState(false);
  const [aiRec, setAiRec] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editMealType, setEditMealType] = useState("");
  const [editServing, setEditServing] = useState(0);
  const [waterIntake, setWaterIntake] = useState(() => (water || {})[today()] || 0);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const todayStr = today();
  
  useEffect(() => { setWaterIntake((water || {})[todayStr] || 0); }, [water, todayStr]);
  const todayLog = useMemo(() => nutrition.filter(n => n.date === todayStr), [nutrition, todayStr]);

  const totals = useMemo(() => todayLog.reduce((acc, n) => ({
    calories: acc.calories + (n.calories || 0),
    protein: acc.protein + (n.protein || 0),
    carbs: acc.carbs + (n.carbs || 0),
    fat: acc.fat + (n.fat || 0),
    fiber: acc.fiber + (n.fiber || 0),
    sugar: acc.sugar + (n.sugar || 0),
    sodium: acc.sodium + (n.sodium || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }), [todayLog]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !searchRef.current?.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (val) => {
    setSearchQuery(val);
    setShowDropdown(true);
    usdaDebouncedSearch(val, (results, loading, error) => {
      setSearchResults(results);
      setSearchLoading(loading);
      setSearchError(error);
    });
  };

  const selectFood = (food) => {
    setSelectedFood(food);
    setServingQty(food.servingSize || 100);
    setSearchQuery(food.name);
    setShowDropdown(false);
  };

  const calcScaled = (val, qty, baseSize) => {
    if (!baseSize || !val) return 0;
    return Math.round((val / baseSize) * qty * 100) / 100;
  };

  const logFood = () => {
    if (!selectedFood) return;
    const qty = servingQty;
    const base = selectedFood.servingSize || 100;
    const entry = {
      id: Date.now(),
      date: todayStr,
      fdcId: selectedFood.fdcId,
      food: selectedFood.name,
      brand: selectedFood.brand || "",
      meal: mealType,
      servingQty: qty,
      servingUnit: selectedFood.servingUnit || "g",
      calories: Math.round(calcScaled(selectedFood.calories, qty, base)),
      protein: Math.round(calcScaled(selectedFood.protein, qty, base) * 10) / 10,
      carbs: Math.round(calcScaled(selectedFood.carbs, qty, base) * 10) / 10,
      fat: Math.round(calcScaled(selectedFood.fat, qty, base) * 10) / 10,
      saturatedFat: Math.round(calcScaled(selectedFood.saturatedFat, qty, base) * 10) / 10,
      fiber: Math.round(calcScaled(selectedFood.fiber, qty, base) * 10) / 10,
      sugar: Math.round(calcScaled(selectedFood.sugar, qty, base) * 10) / 10,
      sodium: Math.round(calcScaled(selectedFood.sodium, qty, base)),
      potassium: Math.round(calcScaled(selectedFood.potassium, qty, base)),
      cholesterol: Math.round(calcScaled(selectedFood.cholesterol, qty, base)),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    dispatch({ type: "ADD_NUTRITION", payload: entry });
    setSelectedFood(null);
    setSearchQuery("");
    setServingQty(100);
    showToast(`${selectedFood.name} logged!`);
  };

  const deleteFood = async (id) => {
    const ok = await showConfirm("Delete this food entry?");
    if (ok) { dispatch({ type: "DELETE_NUTRITION", payload: id }); showToast("Entry deleted."); }
  };

  const duplicateFood = (entry) => {
    dispatch({ type: "DUPLICATE_NUTRITION", payload: { ...entry, id: undefined } });
  };

  const saveEdit = () => {
    if (!editingId) return;
    dispatch({ type: "EDIT_NUTRITION", payload: { id: editingId, meal: editMealType, servingQty: editServing } });
    setEditingId(null);
  };

  const changeWater = (amt) => {
    const next = Math.max(0, waterIntake + amt);
    setWaterIntake(next);
    dispatch({ type: "LOG_WATER", payload: { date: todayStr, amount: amt } });
  };

  const getNutritionAdvice = async () => {
    const advice = await ask(
      "You are a sports nutritionist. Give practical, specific meal advice. Max 100 words.",
      `Goal: ${profile.goal}, Target: ${profile.calories} cal / ${profile.protein}g protein. Today eaten: ${totals.calories} cal, ${totals.protein}g protein, ${totals.carbs}g carbs, ${totals.fat}g fat, ${totals.fiber}g fiber, ${totals.sugar}g sugar, ${totals.sodium}mg sodium. Water: ${waterIntake}ml. What should I eat for the rest of today?`
    );
    if (advice) setAiRec(advice);
  };

  const weekData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const dayLogs = nutrition.filter(n => n.date === ds);
      const cal = dayLogs.reduce((s, n) => s + (n.calories || 0), 0);
      const prot = dayLogs.reduce((s, n) => s + (n.protein || 0), 0);
      days.push({ day: d.toLocaleDateString("en", { weekday: "short" }), calories: Math.round(cal), protein: Math.round(prot) });
    }
    return days;
  }, [nutrition]);

  const macroPieData = useMemo(() => [
    { name: "Protein", value: totals.protein * 4, color: COLORS.primary },
    { name: "Carbs", value: totals.carbs * 4, color: COLORS.cyan },
    { name: "Fat", value: totals.fat * 9, color: COLORS.amber },
  ], [totals]);

  const macroData = useMemo(() => [
    { name: "Protein", value: totals.protein, target: profile.protein, color: COLORS.primary },
    { name: "Carbs", value: totals.carbs, target: Math.round((profile.calories * 0.45) / 4), color: COLORS.cyan },
    { name: "Fat", value: totals.fat, target: Math.round((profile.calories * 0.25) / 9), color: COLORS.amber },
  ], [totals, profile]);

  const scaledPreview = useMemo(() => {
    if (!selectedFood) return null;
    const base = selectedFood.servingSize || 100;
    const q = servingQty;
    return {
      calories: Math.round(calcScaled(selectedFood.calories, q, base)),
      protein: Math.round(calcScaled(selectedFood.protein, q, base) * 10) / 10,
      carbs: Math.round(calcScaled(selectedFood.carbs, q, base) * 10) / 10,
      fat: Math.round(calcScaled(selectedFood.fat, q, base) * 10) / 10,
      saturatedFat: Math.round(calcScaled(selectedFood.saturatedFat, q, base) * 10) / 10,
      fiber: Math.round(calcScaled(selectedFood.fiber, q, base) * 10) / 10,
      sugar: Math.round(calcScaled(selectedFood.sugar, q, base) * 10) / 10,
      sodium: Math.round(calcScaled(selectedFood.sodium, q, base)),
      potassium: Math.round(calcScaled(selectedFood.potassium, q, base)),
      cholesterol: Math.round(calcScaled(selectedFood.cholesterol, q, base)),
    };
  }, [selectedFood, servingQty]);

  const servingOptions = useMemo(() => {
    if (!selectedFood) return [];
    const unit = selectedFood.servingUnit || "g";
    const base = selectedFood.servingSize || 100;
    if (unit === "g") return [50, 100, 150, 200, 250, 300, 400, 500].map(v => ({ label: `${v} g`, value: v }));
    if (unit === "ml") return [100, 150, 200, 250, 330, 500].map(v => ({ label: `${v} ml`, value: v }));
    const opts = [];
    for (let i = 1; i <= 4; i++) opts.push({ label: `${i} ${unit}${i > 1 ? "s" : ""}`, value: base * i });
    return opts;
  }, [selectedFood]);

  const inputStyle = { fontSize: 12, padding: "6px 8px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Nutrition Tracker</h2>

      {/* Dashboard Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="Calories" value={totals.calories} unit={`/ ${profile.calories}`} color={totals.calories > profile.calories ? COLORS.red : COLORS.green} sub={`${Math.max(0, profile.calories - totals.calories)} remaining`} />
        {macroData.map(m => <StatCard key={m.name} label={m.name} value={totals[m.name.toLowerCase()]} unit={`g / ${m.target}g`} color={m.color} sub={`${Math.max(0, Math.round(m.target - m.value))}g left`} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="Fiber" value={totals.fiber} unit="g" color={COLORS.green} sub="Target: 30g" />
        <StatCard label="Sugar" value={totals.sugar} unit="g" color={COLORS.amber} sub="Limit: 50g" />
        <StatCard label="Sodium" value={totals.sodium} unit="mg" color={totals.sodium > 2300 ? COLORS.red : COLORS.green} sub="Limit: 2300mg" />
        <StatCard label="Water" value={waterIntake} unit="ml" color={COLORS.cyan} sub="Target: 3000ml" />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Weekly Calories</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#A0A0A0" }} />
              <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} />
              <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFFFFF", fontSize: 12 }} />
              <Bar dataKey="calories" fill="#C8FF00" radius={[4, 4, 0, 0]} name="Calories" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Weekly Protein</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#A0A0A0" }} />
              <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} />
              <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFFFFF", fontSize: 12 }} />
              <Bar dataKey="protein" fill="#A5E600" radius={[4, 4, 0, 0]} name="Protein (g)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Macro Distribution</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {totals.calories > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={macroPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                      {macroPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFFFFF", fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {macroPieData.map(m => (
                    <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: m.color }} />
                      <span style={{ color: "#A0A0A0" }}>{m.name}</span>
                      <span style={{ fontWeight: 600 }}>{m.value} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: "#A0A0A0", fontSize: 13, padding: 20 }}>No food logged today</p>
            )}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Water Intake</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <ProgressRing value={Math.min(waterIntake, 3000)} max={3000} size={100} color={COLORS.cyan} label={`${waterIntake} ml`} />
            <div style={{ display: "flex", gap: 8 }}>
              {[-250, -100, 100, 250, 500].map(amt => (
                <button key={amt} className="ghost-btn" onClick={() => changeWater(amt)} style={{ fontSize: 11, padding: "5px 10px" }}>{amt > 0 ? "+" : ""}{amt}ml</button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Macro Progress Rings */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Macro Progress</div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {macroData.map(m => <ProgressRing key={m.name} value={Math.min(m.value, m.target)} max={m.target} size={90} color={m.color} label={m.name} />)}
        </div>
      </Card>

      {/* Search + Log Food */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Log Food from USDA Database</div>

        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <div ref={searchRef} style={{ position: "relative" }}>
            <input
              value={searchQuery}
              onChange={e => { handleSearch(e.target.value); setSelectedFood(null); }}
              onFocus={() => { if (searchResults.length > 0 || searchLoading) setShowDropdown(true); }}
              placeholder="Search foods (e.g., chicken breast, rice, banana)..."
              style={{ fontSize: 14, padding: "10px 14px" }}
            />
            {searchLoading && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#A0A0A0" }}>Searching...</div>}
          </div>
          {showDropdown && !selectedFood && (
            <div ref={dropdownRef} style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, maxHeight: 280, overflowY: "auto", marginTop: 4 }}>
              {searchError && (
                <div style={{ padding: 14, textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: COLORS.red, marginBottom: 8 }}>API Error: {searchError}</p>
                  <button className="ghost-btn" onClick={() => handleSearch(searchQuery)} style={{ fontSize: 12 }}>Retry</button>
                </div>
              )}
              {!searchLoading && !searchError && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div style={{ padding: 14, textAlign: "center", color: "#A0A0A0", fontSize: 13 }}>No foods found for "{searchQuery}"</div>
              )}
              {searchResults.map((food, i) => (
                <div key={i} onClick={() => selectFood(food)} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(200,255,0,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{food.name}</div>
                  <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 2 }}>
                    {food.brand && <span>{food.brand} · </span>}
                    {food.calories} kcal · P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g per {food.servingSize}{food.servingUnit}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected food details */}
        {selectedFood && scaledPreview && (
          <div style={{ background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.2)", borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedFood.name}</div>
                {selectedFood.brand && <div style={{ fontSize: 12, color: "#A0A0A0" }}>{selectedFood.brand}</div>}
              </div>
              <button onClick={() => { setSelectedFood(null); setSearchQuery(""); }} style={{ background: "none", color: "#FF4757", fontSize: 16, cursor: "pointer", border: "none" }}>×</button>
            </div>

            {/* Serving selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#A0A0A0" }}>Serving:</span>
              <input type="number" value={servingQty} onChange={e => setServingQty(Math.max(1, +e.target.value))} style={{ width: 70, fontSize: 12, padding: "4px 8px", textAlign: "center" }} />
              <span style={{ fontSize: 12, color: "#A0A0A0" }}>{selectedFood.servingUnit || "g"}</span>
              {servingOptions.length > 0 && servingOptions.slice(0, 4).map(opt => (
                <button key={opt.value} onClick={() => setServingQty(opt.value)} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, background: servingQty === opt.value ? "rgba(200,255,0,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${servingQty === opt.value ? "rgba(200,255,0,0.4)" : "rgba(255,255,255,0.08)"}`, color: servingQty === opt.value ? "#C8FF00" : "#A0A0A0", cursor: "pointer" }}>{opt.label}</button>
              ))}
            </div>

            {/* Nutrient grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 12 }}>
              {[["Calories", scaledPreview.calories, "kcal"], ["Protein", scaledPreview.protein, "g"], ["Carbs", scaledPreview.carbs, "g"], ["Fat", scaledPreview.fat, "g"], ["Sat. Fat", scaledPreview.saturatedFat, "g"], ["Fiber", scaledPreview.fiber, "g"], ["Sugar", scaledPreview.sugar, "g"], ["Sodium", scaledPreview.sodium, "mg"], ["Potassium", scaledPreview.potassium, "mg"], ["Cholesterol", scaledPreview.cholesterol, "mg"]].map(([label, val, unit]) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#A0A0A0" }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{val}<span style={{ fontSize: 10, fontWeight: 400, color: "#A0A0A0" }}>{unit}</span></div>
                </div>
              ))}
            </div>

            {/* Meal type + Log */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#A0A0A0" }}>Meal:</span>
              {MEAL_TYPES.map(m => (
                <button key={m} onClick={() => setMealType(m)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, background: mealType === m ? "rgba(200,255,0,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${mealType === m ? "rgba(200,255,0,0.4)" : "rgba(255,255,255,0.08)"}`, color: mealType === m ? "#C8FF00" : "#A0A0A0", cursor: "pointer" }}>{m}</button>
              ))}
              <div style={{ flex: 1 }} />
              <button className="neon-btn" onClick={logFood} style={{ fontSize: 13 }}>Log Food Entry</button>
            </div>
          </div>
        )}
      </Card>

      {/* Today's Food History */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Today's Food Log</div>
        {todayLog.length === 0 ? (
          <p style={{ color: "#A0A0A0", fontSize: 13 }}>No food logged yet today. Search for a food above to get started.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ color: "#A0A0A0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Food", "Meal", "Serving", "Calories", "Protein", "Carbs", "Fat", "Time", ""].map(h => <th key={h} style={{ padding: "8px 6px", textAlign: "left", fontWeight: 500 }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {todayLog.map((n) => (
                  <tr key={n.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "8px 6px" }}>
                      <div style={{ fontWeight: 500 }}>{n.food}</div>
                      {n.brand && <div style={{ fontSize: 10, color: "#A0A0A0" }}>{n.brand}</div>}
                    </td>
                    <td style={{ padding: "8px 6px" }}>
                      {editingId === n.id ? (
                        <select value={editMealType} onChange={e => setEditMealType(e.target.value)} style={{ fontSize: 11, padding: "2px 4px" }}>
                          {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      ) : <span style={{ color: "#A0A0A0" }}>{n.meal}</span>}
                    </td>
                    <td style={{ padding: "8px 6px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>
                      {editingId === n.id ? (
                        <input type="number" value={editServing} onChange={e => setEditServing(+e.target.value)} style={{ width: 60, fontSize: 11, padding: "2px 4px" }} />
                      ) : `${n.servingQty || "?"} ${n.servingUnit || "g"}`}
                    </td>
                    <td style={{ padding: "8px 6px", fontWeight: 600 }}>{n.calories}</td>
                    <td style={{ padding: "8px 6px", color: "#A0A0A0" }}>{n.protein}g</td>
                    <td style={{ padding: "8px 6px", color: "#A0A0A0" }}>{n.carbs}g</td>
                    <td style={{ padding: "8px 6px", color: "#A0A0A0" }}>{n.fat}g</td>
                    <td style={{ padding: "8px 6px", color: "#A0A0A0" }}>{n.time}</td>
                    <td style={{ padding: "8px 6px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {editingId === n.id ? (
                          <>
                            <button onClick={saveEdit} style={{ background: "none", color: "#C8FF00", fontSize: 12, cursor: "pointer", border: "none" }}>Save</button>
                            <button onClick={() => setEditingId(null)} style={{ background: "none", color: "#A0A0A0", fontSize: 12, cursor: "pointer", border: "none" }}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(n.id); setEditMealType(n.meal); setEditServing(n.servingQty || 100); }} style={{ background: "none", color: "#C8FF00", fontSize: 12, cursor: "pointer", border: "none" }}>Edit</button>
                            <button onClick={() => duplicateFood(n)} style={{ background: "none", color: "#A5E600", fontSize: 12, cursor: "pointer", border: "none" }}>Dupe</button>
                            <button onClick={() => deleteFood(n.id)} style={{ background: "none", color: "#FF4757", fontSize: 12, cursor: "pointer", border: "none" }}>Del</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* AI Nutrition Coach */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #C8FF00, #A5E600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🥗</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>AI Nutrition Coach</div>
              <div style={{ fontSize: 12, color: "#A0A0A0" }}>Personalized analysis of your daily intake</div>
            </div>
          </div>
          <button className="neon-btn" onClick={getNutritionAdvice} disabled={aiLoading} style={{ fontSize: 12, padding: "8px 16px" }}>{aiLoading ? "Analyzing..." : "Get Advice ⚡"}</button>
        </div>
        {aiRec ? (
          <div style={{ background: "rgba(200,255,0,0.06)", borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ fontSize: 13, color: "#FFFFFF", lineHeight: 1.7 }}>{aiRec}</p>
          </div>
        ) : (
          <div style={{ background: "rgba(200,255,0,0.06)", borderRadius: 10, padding: "14px 16px", minHeight: 50 }}>
            <p style={{ fontSize: 13, color: "#A0A0A0" }}>Click "Get Advice" to receive AI-powered nutrition recommendations based on your logged food today.</p>
            {/* Quick auto-tips */}
            {totals.calories > 0 && (
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {totals.protein < profile.protein * 0.7 && <span style={{ fontSize: 11, background: "rgba(255,71,87,0.15)", color: COLORS.red, padding: "3px 8px", borderRadius: 4 }}>Low protein: {Math.round(profile.protein - totals.protein)}g remaining</span>}
                {totals.sodium > 2000 && <span style={{ fontSize: 11, background: "rgba(255,184,0,0.15)", color: COLORS.amber, padding: "3px 8px", borderRadius: 4 }}>Sodium high: {totals.sodium}mg</span>}
                {totals.fiber < 15 && totals.calories > 500 && <span style={{ fontSize: 11, background: "rgba(255,184,0,0.15)", color: COLORS.amber, padding: "3px 8px", borderRadius: 4 }}>Fiber low: {totals.fiber}g</span>}
                {totals.calories >= profile.calories * 0.9 && totals.calories <= profile.calories && <span style={{ fontSize: 11, background: "rgba(200,255,0,0.15)", color: COLORS.primary, padding: "3px 8px", borderRadius: 4 }}>Calorie target on track</span>}
                {waterIntake < 1500 && totals.calories > 300 && <span style={{ fontSize: 11, background: "rgba(255,184,0,0.15)", color: COLORS.amber, padding: "3px 8px", borderRadius: 4 }}>Drink more water</span>}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

// ── Recovery ────────────────────────────────────────────────────────────────
const Recovery = ({ state, dispatch }) => {
  const [form, setForm] = useState({ sleep: 7, quality: 7, stress: 3, heartRate: 60 });
  const [aiRec, setAiRec] = useState("");
  const { ask, loading } = useAICoach();

  const todayRec = state.recovery.find(r => r.date === today());
  const score = todayRec ? todayRec.score : null;

  const logRecovery = () => {
    const s = Math.round((form.sleep / 9 * 3 + form.quality / 10 * 4 + (10 - form.stress) / 10 * 3) * 10) / 10;
    dispatch({ type: "ADD_RECOVERY", payload: { ...form, score: s, id: Date.now(), date: today() } });
    showToast("Recovery logged!");
  };

  const getRecAdvice = async () => {
    const recHistory = state.recovery.slice(-7);
    const advice = await ask(
      "You are a recovery and sports science coach. Be specific and data-driven. Max 80 words.",
      `Recent recovery scores: ${recHistory.map(r => `${r.date}: ${r.score}/10`).join(", ")}. Today's metrics: sleep ${form.sleep}hrs, quality ${form.quality}/10, stress ${form.stress}/10. Recent training volume: ${Math.round(calcWeeklyVolume(state.workouts))}kg. Should I train today or recover? What's your recommendation?`
    );
    if (advice) setAiRec(advice);
  };

  const recData = useMemo(() =>
    state.recovery.slice(-14).map(r => ({ date: r.date.slice(5), score: r.score, sleep: r.sleep })),
    [state.recovery]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Recovery & Sleep</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Log Today's Recovery</div>
          {[["sleep", "Sleep Duration (hrs)", 0, 12, 0.5], ["quality", "Sleep Quality (1-10)", 1, 10, 1], ["stress", "Stress Level (1-10)", 1, 10, 1], ["heartRate", "Resting Heart Rate", 40, 120, 1]].map(([k, l, min, max, step]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <label style={{ fontSize: 12, color: "#A0A0A0" }}>{l}</label>
                <span style={{ fontSize: 12, color: COLORS.cyan, fontFamily: "'JetBrains Mono',monospace" }}>{form[k]}{k === "sleep" ? "h" : k === "heartRate" ? " bpm" : ""}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: +e.target.value }))} />
            </div>
          ))}
          <button className="neon-btn" onClick={logRecovery} style={{ width: "100%", marginTop: 4 }}>Log Recovery</button>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 8 }}>Today's Recovery Score</div>
            <div style={{ fontSize: 56, fontWeight: 700, color: score !== null ? (score >= 7 ? COLORS.green : score >= 5 ? COLORS.amber : COLORS.red) : "#A0A0A0", fontFamily: "'JetBrains Mono',monospace" }}>
              {score !== null ? score.toFixed(1) : "—"}
            </div>
            <div style={{ fontSize: 12, color: "#A0A0A0", marginTop: 4 }}>{score !== null ? (score >= 7 ? "High readiness — Train hard" : score >= 5 ? "Moderate — Normal training" : "Low — Consider deload") : "Not logged yet"}</div>
          </Card>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>AI Recovery Coach</span>
              <button className="ghost-btn" onClick={getRecAdvice} disabled={loading} style={{ fontSize: 12 }}>{loading ? "..." : "Advise ⚡"}</button>
            </div>
            {aiRec ? <p style={{ fontSize: 13, color: "#FFFFFF", lineHeight: 1.6 }}>{aiRec}</p> : <p style={{ fontSize: 13, color: "#A0A0A0" }}>Get AI-powered recovery recommendations.</p>}
          </Card>
        </div>
      </div>

      <Card>
        <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 12 }}>Recovery score & sleep (14 days)</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={recData.length ? recData : [{ date: today().slice(5), score: 0, sleep: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} />
            <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} />
            <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFFFFF", fontSize: 12 }} />
            <Line type="monotone" dataKey="score" stroke={COLORS.green} strokeWidth={2} dot={false} name="Recovery" />
            <Line type="monotone" dataKey="sleep" stroke={COLORS.cyan} strokeWidth={2} dot={false} name="Sleep hrs" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

// ── Toast System ────────────────────────────────────────────────────────────
let _toastFn = null;
const showToast = (msg) => { _toastFn?.(msg); };

// ── Confirm Dialog System ──────────────────────────────────────────────────
let _confirmFn = null;
const showConfirm = (msg) => new Promise(resolve => { _confirmFn?.(msg, resolve); });

const Toast = () => {
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

const ConfirmDialog = () => {
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

// ── Account Menu Component ──────────────────────────────────────────────────
const AccountMenu = ({ profile, level, xp, dispatch, onClose, onNavigate }) => {
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    setLogoutOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await firebaseLogOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    try { localStorage.removeItem("ai_fitness_mentor_v1"); } catch {}
    dispatch({ type: "LOGOUT" });
    showToast("Successfully signed out.");
  };

  return (
    <>
      <motion.div className="account-menu" initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
        <div className="account-menu-header">
          <div className="avatar-lg">{(profile?.name || "U")[0].toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{profile?.name || "User"}</div>
            <div className="user-meta">Lv. {level} · {xp} XP</div>
          </div>
        </div>

        <button className="account-menu-item" onClick={() => { onNavigate("profile"); onClose(); }}>
          <span className="menu-icon">👤</span>
          <span className="menu-label">My Profile</span>
        </button>
        <button className="account-menu-item" onClick={() => { onNavigate("profile"); onClose(); }}>
          <span className="menu-icon">⚙️</span>
          <span className="menu-label">Settings</span>
        </button>
        <button className="account-menu-item" onClick={() => { onNavigate("profile"); onClose(); }}>
          <span className="menu-icon">❓</span>
          <span className="menu-label">Help & Support</span>
        </button>
        <button className="account-menu-item" onClick={() => { onNavigate("profile"); onClose(); }}>
          <span className="menu-icon">ℹ️</span>
          <span className="menu-label">About</span>
          <span className="menu-shortcut">v1.0.0</span>
        </button>

        <div className="account-menu-divider" />

        <button className="account-menu-item danger" onClick={handleLogout}>
          <span className="menu-icon">🚪</span>
          <span className="menu-label">Sign Out</span>
        </button>
      </motion.div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {logoutOpen && (
          <motion.div className="logout-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setLogoutOpen(false)}>
            <motion.div className="logout-modal" initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
              <div className="logout-modal-icon">🚪</div>
              <h3>Sign Out</h3>
              <p>Are you sure you want to sign out? Your data is saved locally and will be here when you sign back in.</p>
              <div className="logout-modal-actions">
                <button className="btn-cancel" onClick={() => setLogoutOpen(false)}>Cancel</button>
                <button className="btn-signout" onClick={confirmLogout}>Sign Out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ── Program Database (evidence-based) ───────────────────────────────────────
const PROGRAM_DB = {
  ppl: {
    name: "Push Pull Legs",
    description: "The classic 6-day split. Hits each muscle group twice per week with optimal volume and recovery.",
    days: [
      {
        name: "Push A", focus: "Chest, Shoulders, Triceps (Heavy)",
        duration: 55,
        exercises: [
          { name: "Barbell Bench Press", sets: 4, reps: "5-6", rest: "3 min", rpe: 8, notes: "Full ROM, controlled eccentric" },
          { name: "Overhead Press", sets: 3, reps: "6-8", rest: "2.5 min", rpe: 8, notes: "Strict form, no leg drive" },
          { name: "Incline Dumbbell Press", sets: 3, reps: "8-10", rest: "2 min", rpe: 8, notes: "30 degree incline" },
          { name: "Cable Lateral Raise", sets: 4, reps: "12-15", rest: "60s", rpe: 7, notes: "Slow negative" },
          { name: "Tricep Rope Pushdown", sets: 3, reps: "10-12", rest: "75s", rpe: 7, notes: "Spread the rope at bottom" },
          { name: "Overhead Tricep Extension", sets: 3, reps: "10-12", rest: "75s", rpe: 7, notes: "" },
        ],
      },
      {
        name: "Pull A", focus: "Back, Biceps (Heavy)",
        duration: 55,
        exercises: [
          { name: "Barbell Deadlift", sets: 3, reps: "3-5", rest: "3-4 min", rpe: 9, notes: "Reset each rep" },
          { name: "Weighted Pull-Up", sets: 4, reps: "6-8", rest: "2.5 min", rpe: 8, notes: "Add weight progressively" },
          { name: "Barbell Row", sets: 4, reps: "6-8", rest: "2 min", rpe: 8, notes: "Squeeze lats at top" },
          { name: "Face Pull", sets: 3, reps: "15-20", rest: "60s", rpe: 6, notes: "Rear delt health" },
          { name: "Barbell Curl", sets: 3, reps: "8-10", rest: "75s", rpe: 7, notes: "No swinging" },
          { name: "Hammer Curl", sets: 3, reps: "10-12", rest: "60s", rpe: 7, notes: "" },
        ],
      },
      {
        name: "Legs A", focus: "Quads, Hamstrings, Glutes (Heavy)",
        duration: 60,
        exercises: [
          { name: "Barbell Back Squat", sets: 4, reps: "5-6", rest: "3 min", rpe: 9, notes: "Below parallel" },
          { name: "Romanian Deadlift", sets: 3, reps: "8-10", rest: "2 min", rpe: 8, notes: "Feel hamstring stretch" },
          { name: "Leg Press", sets: 3, reps: "10-12", rest: "2 min", rpe: 8, notes: "Full depth" },
          { name: "Walking Lunge", sets: 3, reps: "10/leg", rest: "90s", rpe: 7, notes: "" },
          { name: "Leg Curl", sets: 3, reps: "10-12", rest: "75s", rpe: 7, notes: "" },
          { name: "Standing Calf Raise", sets: 4, reps: "10-12", rest: "60s", rpe: 7, notes: "Pause at bottom stretch" },
        ],
      },
      {
        name: "Push B", focus: "Chest, Shoulders, Triceps (Volume)",
        duration: 50,
        exercises: [
          { name: "Dumbbell Bench Press", sets: 4, reps: "8-10", rest: "2 min", rpe: 8, notes: "Deep stretch at bottom" },
          { name: "Seated Dumbbell OHP", sets: 3, reps: "10-12", rest: "90s", rpe: 7, notes: "" },
          { name: "Cable Fly", sets: 3, reps: "12-15", rest: "75s", rpe: 7, notes: "Squeeze at peak" },
          { name: "Lateral Raise", sets: 4, reps: "12-15", rest: "60s", rpe: 7, notes: "Controlled, no momentum" },
          { name: "Dips", sets: 3, reps: "8-12", rest: "90s", rpe: 8, notes: "Lean forward for chest" },
          { name: "Skull Crushers", sets: 3, reps: "10-12", rest: "75s", rpe: 7, notes: "" },
        ],
      },
      {
        name: "Pull B", focus: "Back, Biceps (Volume)",
        duration: 50,
        exercises: [
          { name: "Lat Pulldown", sets: 4, reps: "8-10", rest: "2 min", rpe: 8, notes: "Drive elbows down" },
          { name: "Seated Cable Row", sets: 4, reps: "8-10", rest: "2 min", rpe: 8, notes: "Squeeze scapulae" },
          { name: "Single Arm Dumbbell Row", sets: 3, reps: "10-12", rest: "90s", rpe: 7, notes: "" },
          { name: "Rear Delt Fly", sets: 3, reps: "15-20", rest: "60s", rpe: 6, notes: "" },
          { name: "Incline Dumbbell Curl", sets: 3, reps: "10-12", rest: "75s", rpe: 7, notes: "Full stretch" },
          { name: "Cable Curl", sets: 3, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
        ],
      },
      {
        name: "Legs B", focus: "Quads, Hamstrings, Glutes (Volume)",
        duration: 55,
        exercises: [
          { name: "Front Squat", sets: 4, reps: "6-8", rest: "2.5 min", rpe: 8, notes: "Upright torso" },
          { name: "Bulgarian Split Squat", sets: 3, reps: "10/leg", rest: "90s", rpe: 8, notes: "" },
          { name: "Hack Squat", sets: 3, reps: "10-12", rest: "2 min", rpe: 8, notes: "" },
          { name: "Hip Thrust", sets: 4, reps: "8-10", rest: "90s", rpe: 8, notes: "Squeeze glutes hard" },
          { name: "Leg Extension", sets: 3, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
          { name: "Seated Calf Raise", sets: 4, reps: "12-15", rest: "60s", rpe: 7, notes: "Slow eccentric" },
        ],
      },
    ],
  },
  ul: {
    name: "Upper Lower",
    description: "4-day split hitting each muscle group 2x/week. Ideal balance of frequency and recovery.",
    days: [
      {
        name: "Upper A", focus: "Chest, Back, Shoulders (Strength)",
        duration: 55,
        exercises: [
          { name: "Barbell Bench Press", sets: 4, reps: "4-6", rest: "3 min", rpe: 9, notes: "Primary push movement" },
          { name: "Barbell Row", sets: 4, reps: "4-6", rest: "3 min", rpe: 9, notes: "Primary pull movement" },
          { name: "Overhead Press", sets: 3, reps: "6-8", rest: "2.5 min", rpe: 8, notes: "" },
          { name: "Weighted Chin-Up", sets: 3, reps: "6-8", rest: "2.5 min", rpe: 8, notes: "" },
          { name: "Cable Lateral Raise", sets: 4, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
          { name: "Face Pull", sets: 3, reps: "15-20", rest: "60s", rpe: 6, notes: "" },
        ],
      },
      {
        name: "Lower A", focus: "Quads, Hamstrings (Strength)",
        duration: 55,
        exercises: [
          { name: "Barbell Back Squat", sets: 4, reps: "4-6", rest: "3-4 min", rpe: 9, notes: "ATG depth" },
          { name: "Romanian Deadlift", sets: 4, reps: "6-8", rest: "2.5 min", rpe: 8, notes: "" },
          { name: "Bulgarian Split Squat", sets: 3, reps: "8-10/leg", rest: "2 min", rpe: 8, notes: "" },
          { name: "Leg Curl", sets: 3, reps: "10-12", rest: "90s", rpe: 7, notes: "" },
          { name: "Standing Calf Raise", sets: 4, reps: "8-10", rest: "90s", rpe: 7, notes: "Heavy, controlled" },
          { name: "Hanging Leg Raise", sets: 3, reps: "10-15", rest: "60s", rpe: 7, notes: "Core work" },
        ],
      },
      {
        name: "Upper B", focus: "Chest, Back, Shoulders (Hypertrophy)",
        duration: 50,
        exercises: [
          { name: "Incline Dumbbell Press", sets: 4, reps: "8-10", rest: "2 min", rpe: 8, notes: "Upper chest focus" },
          { name: "Lat Pulldown", sets: 4, reps: "8-10", rest: "2 min", rpe: 8, notes: "" },
          { name: "Dumbbell Fly", sets: 3, reps: "12-15", rest: "75s", rpe: 7, notes: "Deep stretch" },
          { name: "Seated Cable Row", sets: 3, reps: "10-12", rest: "90s", rpe: 7, notes: "" },
          { name: "Lateral Raise", sets: 4, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
          { name: "EZ Bar Curl", sets: 3, reps: "10-12", rest: "75s", rpe: 7, notes: "" },
          { name: "Tricep Pushdown", sets: 3, reps: "10-12", rest: "75s", rpe: 7, notes: "" },
        ],
      },
      {
        name: "Lower B", focus: "Quads, Hamstrings, Glutes (Hypertrophy)",
        duration: 50,
        exercises: [
          { name: "Leg Press", sets: 4, reps: "10-12", rest: "2 min", rpe: 8, notes: "Full depth" },
          { name: "Hip Thrust", sets: 4, reps: "8-10", rest: "90s", rpe: 8, notes: "Squeeze at top" },
          { name: "Walking Lunge", sets: 3, reps: "12/leg", rest: "90s", rpe: 7, notes: "" },
          { name: "Leg Extension", sets: 3, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
          { name: "Lying Leg Curl", sets: 3, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
          { name: "Seated Calf Raise", sets: 4, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
        ],
      },
    ],
  },
  fb: {
    name: "Full Body",
    description: "3-day full body program. Maximum frequency for each muscle group. Perfect for beginners and intermediates.",
    days: [
      {
        name: "Full Body A", focus: "Squat Pattern, Horizontal Push/Pull",
        duration: 60,
        exercises: [
          { name: "Barbell Back Squat", sets: 4, reps: "5-6", rest: "3 min", rpe: 8, notes: "Foundation movement" },
          { name: "Barbell Bench Press", sets: 4, reps: "5-6", rest: "3 min", rpe: 8, notes: "" },
          { name: "Barbell Row", sets: 4, reps: "6-8", rest: "2 min", rpe: 8, notes: "" },
          { name: "Romanian Deadlift", sets: 3, reps: "8-10", rest: "2 min", rpe: 7, notes: "" },
          { name: "Lateral Raise", sets: 3, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
          { name: "Plank", sets: 3, reps: "45-60s", rest: "60s", rpe: 7, notes: "Brace hard" },
        ],
      },
      {
        name: "Full Body B", focus: "Hinge Pattern, Vertical Push/Pull",
        duration: 60,
        exercises: [
          { name: "Barbell Deadlift", sets: 4, reps: "3-5", rest: "3-4 min", rpe: 9, notes: "Reset each rep" },
          { name: "Overhead Press", sets: 4, reps: "5-6", rest: "3 min", rpe: 8, notes: "" },
          { name: "Weighted Pull-Up", sets: 4, reps: "6-8", rest: "2.5 min", rpe: 8, notes: "" },
          { name: "Bulgarian Split Squat", sets: 3, reps: "8-10/leg", rest: "2 min", rpe: 7, notes: "" },
          { name: "Face Pull", sets: 3, reps: "15-20", rest: "60s", rpe: 6, notes: "" },
          { name: "Hanging Leg Raise", sets: 3, reps: "10-15", rest: "60s", rpe: 7, notes: "" },
        ],
      },
      {
        name: "Full Body C", focus: "Accessory, Weak Point Training",
        duration: 55,
        exercises: [
          { name: "Front Squat", sets: 4, reps: "6-8", rest: "2.5 min", rpe: 8, notes: "" },
          { name: "Incline Dumbbell Press", sets: 4, reps: "8-10", rest: "2 min", rpe: 8, notes: "" },
          { name: "Lat Pulldown", sets: 4, reps: "8-10", rest: "2 min", rpe: 8, notes: "" },
          { name: "Hip Thrust", sets: 3, reps: "10-12", rest: "90s", rpe: 7, notes: "" },
          { name: "Cable Lateral Raise", sets: 4, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
          { name: "Ab Wheel Rollout", sets: 3, reps: "8-12", rest: "60s", rpe: 7, notes: "" },
        ],
      },
    ],
  },
  bb: {
    name: "Bodybuilding",
    description: "6-day bro split optimized for hypertrophy. High volume, moderate frequency, maximum pump.",
    days: [
      {
        name: "Chest Day", focus: "Pectorals",
        duration: 60,
        exercises: [
          { name: "Barbell Bench Press", sets: 4, reps: "6-8", rest: "2.5 min", rpe: 8, notes: "Heavy compound opener" },
          { name: "Incline Dumbbell Press", sets: 4, reps: "8-10", rest: "2 min", rpe: 8, notes: "Upper chest" },
          { name: "Cable Fly", sets: 4, reps: "12-15", rest: "75s", rpe: 7, notes: "Constant tension" },
          { name: "Dips", sets: 3, reps: "10-12", rest: "90s", rpe: 8, notes: "Lean forward" },
          { name: "Push-Up", sets: 3, reps: "AMRAP", rest: "60s", rpe: 9, notes: "Burnout finisher" },
          { name: "Pec Deck", sets: 3, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
        ],
      },
      {
        name: "Back Day", focus: "Latissimus Dorsi, Rhomboids",
        duration: 60,
        exercises: [
          { name: "Barbell Deadlift", sets: 3, reps: "4-6", rest: "3-4 min", rpe: 9, notes: "Mass builder" },
          { name: "Weighted Pull-Up", sets: 4, reps: "6-8", rest: "2.5 min", rpe: 8, notes: "" },
          { name: "Barbell Row", sets: 4, reps: "8-10", rest: "2 min", rpe: 8, notes: "" },
          { name: "Seated Cable Row", sets: 3, reps: "10-12", rest: "90s", rpe: 7, notes: "" },
          { name: "Straight Arm Pulldown", sets: 3, reps: "12-15", rest: "60s", rpe: 7, notes: "Lat isolation" },
          { name: "Rear Delt Fly", sets: 4, reps: "15-20", rest: "60s", rpe: 6, notes: "" },
        ],
      },
      {
        name: "Shoulder Day", focus: "Deltoids, Traps",
        duration: 55,
        exercises: [
          { name: "Overhead Press", sets: 4, reps: "6-8", rest: "2.5 min", rpe: 8, notes: "Heavy standing" },
          { name: "Dumbbell Lateral Raise", sets: 5, reps: "12-15", rest: "60s", rpe: 7, notes: "Side delts" },
          { name: "Face Pull", sets: 4, reps: "15-20", rest: "60s", rpe: 6, notes: "Rear delts" },
          { name: "Upright Row", sets: 3, reps: "10-12", rest: "90s", rpe: 7, notes: "Wide grip" },
          { name: "Dumbbell Shrug", sets: 4, reps: "10-12", rest: "75s", rpe: 7, notes: "Pause at top" },
          { name: "Rear Pec Deck", sets: 3, reps: "15-20", rest: "60s", rpe: 6, notes: "" },
        ],
      },
      {
        name: "Arm Day", focus: "Biceps, Triceps",
        duration: 50,
        exercises: [
          { name: "Barbell Curl", sets: 4, reps: "8-10", rest: "75s", rpe: 8, notes: "Strict form" },
          { name: "Skull Crushers", sets: 4, reps: "8-10", rest: "75s", rpe: 8, notes: "" },
          { name: "Incline Dumbbell Curl", sets: 3, reps: "10-12", rest: "60s", rpe: 7, notes: "Full stretch" },
          { name: "Cable Pushdown", sets: 3, reps: "10-12", rest: "60s", rpe: 7, notes: "" },
          { name: "Hammer Curl", sets: 3, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
          { name: "Overhead Tricep Extension", sets: 3, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
        ],
      },
      {
        name: "Leg Day", focus: "Quads, Hamstrings, Glutes",
        duration: 65,
        exercises: [
          { name: "Barbell Back Squat", sets: 5, reps: "6-8", rest: "3 min", rpe: 9, notes: "King of exercises" },
          { name: "Leg Press", sets: 4, reps: "10-12", rest: "2 min", rpe: 8, notes: "" },
          { name: "Romanian Deadlift", sets: 4, reps: "8-10", rest: "2 min", rpe: 8, notes: "" },
          { name: "Walking Lunge", sets: 3, reps: "12/leg", rest: "90s", rpe: 7, notes: "" },
          { name: "Leg Extension", sets: 4, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
          { name: "Leg Curl", sets: 4, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
          { name: "Standing Calf Raise", sets: 5, reps: "10-12", rest: "60s", rpe: 7, notes: "" },
        ],
      },
      {
        name: "Weak Points", focus: "Arms, Abs, Rear Delts",
        duration: 45,
        exercises: [
          { name: "Cable Lateral Raise", sets: 4, reps: "15-20", rest: "60s", rpe: 7, notes: "Volume delts" },
          { name: "Preacher Curl", sets: 3, reps: "10-12", rest: "75s", rpe: 7, notes: "" },
          { name: "Tricep Dip Machine", sets: 3, reps: "10-12", rest: "75s", rpe: 7, notes: "" },
          { name: "Face Pull", sets: 4, reps: "15-20", rest: "60s", rpe: 6, notes: "" },
          { name: "Cable Crunch", sets: 3, reps: "15-20", rest: "60s", rpe: 7, notes: "" },
          { name: "Hanging Leg Raise", sets: 3, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
        ],
      },
    ],
  },
  pl: {
    name: "Powerlifting",
    description: "4-day powerlifting program focused on the big 3. Periodized for competition peak.",
    days: [
      {
        name: "Squat Day", focus: "Squat, Quad Accessories",
        duration: 65,
        exercises: [
          { name: "Barbell Back Squat", sets: 5, reps: "3-5", rest: "4 min", rpe: 9, notes: "Competition pauses" },
          { name: "Pause Squat", sets: 3, reps: "3-5", rest: "3 min", rpe: 8, notes: "2s pause at bottom" },
          { name: "Leg Press", sets: 3, reps: "8-10", rest: "2 min", rpe: 7, notes: "Volume work" },
          { name: "Romanian Deadlift", sets: 3, reps: "8-10", rest: "2 min", rpe: 7, notes: "" },
          { name: "Leg Curl", sets: 3, reps: "10-12", rest: "75s", rpe: 7, notes: "" },
          { name: "Hanging Leg Raise", sets: 3, reps: "12-15", rest: "60s", rpe: 7, notes: "Bracing core" },
        ],
      },
      {
        name: "Bench Day", focus: "Bench Press, Chest Accessories",
        duration: 60,
        exercises: [
          { name: "Barbell Bench Press", sets: 5, reps: "3-5", rest: "3-4 min", rpe: 9, notes: "Competition grip" },
          { name: "Close-Grip Bench Press", sets: 3, reps: "5-6", rest: "3 min", rpe: 8, notes: "Tricep overload" },
          { name: "Paused Bench Press", sets: 3, reps: "3-5", rest: "3 min", rpe: 8, notes: "2s pause" },
          { name: "Incline Dumbbell Press", sets: 3, reps: "8-10", rest: "2 min", rpe: 7, notes: "" },
          { name: "Dips", sets: 3, reps: "8-10", rest: "90s", rpe: 7, notes: "" },
          { name: "Tricep Extension", sets: 3, reps: "10-12", rest: "75s", rpe: 7, notes: "" },
        ],
      },
      {
        name: "Deadlift Day", focus: "Deadlift, Back Accessories",
        duration: 65,
        exercises: [
          { name: "Barbell Deadlift", sets: 5, reps: "2-4", rest: "4-5 min", rpe: 9, notes: "Competition form" },
          { name: "Deficit Deadlift", sets: 3, reps: "5-6", rest: "3 min", rpe: 8, notes: "2 inch deficit" },
          { name: "Barbell Row", sets: 4, reps: "6-8", rest: "2 min", rpe: 8, notes: "" },
          { name: "Weighted Pull-Up", sets: 3, reps: "6-8", rest: "2.5 min", rpe: 8, notes: "" },
          { name: "Face Pull", sets: 3, reps: "15-20", rest: "60s", rpe: 6, notes: "" },
          { name: "Back Extension", sets: 3, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
        ],
      },
      {
        name: "OHP & Accessories", focus: "Overhead Press, Weak Points",
        duration: 55,
        exercises: [
          { name: "Overhead Press", sets: 5, reps: "3-5", rest: "3 min", rpe: 9, notes: "Strict" },
          { name: "Push Press", sets: 3, reps: "5-6", rest: "3 min", rpe: 8, notes: "" },
          { name: "Barbell Row", sets: 4, reps: "6-8", rest: "2 min", rpe: 8, notes: "" },
          { name: "Lateral Raise", sets: 4, reps: "12-15", rest: "60s", rpe: 7, notes: "" },
          { name: "Barbell Curl", sets: 3, reps: "8-10", rest: "75s", rpe: 7, notes: "" },
          { name: "Plank", sets: 3, reps: "45-60s", rest: "60s", rpe: 7, notes: "" },
        ],
      },
    ],
  },
};

const SPLITS = [
  { id: "ppl", label: "Push Pull Legs" },
  { id: "ul", label: "Upper Lower" },
  { id: "fb", label: "Full Body" },
  { id: "bb", label: "Bodybuilding" },
  { id: "pl", label: "Powerlifting" },
];

const EXP_FILTERS = [
  { id: "all", label: "All Levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const GOAL_FILTERS = [
  { id: "all", label: "All Goals" },
  { id: "muscle", label: "Build Muscle" },
  { id: "fat_loss", label: "Fat Loss" },
  { id: "strength", label: "Strength" },
  { id: "endurance", label: "Endurance" },
];

const GOAL_SPLIT_MAP = {
  muscle: ["ppl", "bb", "ul"],
  fat_loss: ["fb", "ppl", "ul"],
  strength: ["pl", "ppl", "ul"],
  endurance: ["fb", "ul", "ppl"],
};

const EXP_SPLIT_MAP = {
  beginner: ["fb", "ul", "ppl"],
  intermediate: ["ppl", "ul", "bb"],
  advanced: ["pl", "bb", "ppl"],
  elite: ["pl", "bb", "ppl"],
};

const calcProgramStats = (prog) => {
  if (!prog?.days) return { days: 0, weeklySets: 0, weeklyVolume: 0, avgDuration: 0 };
  const totalDays = prog.days.length;
  const weeklySets = prog.days.reduce((sum, d) => sum + d.exercises.reduce((s, e) => s + (e.sets || 0), 0), 0);
  const avgDuration = Math.round(prog.days.reduce((sum, d) => sum + (d.duration || 50), 0) / totalDays);
  const weeklyVolume = Math.round(prog.days.reduce((sum, d) => sum + d.exercises.reduce((s, e) => {
    const reps = parseInt(String(e.reps).replace(/[^0-9]/g, "")) || 8;
    const weight = 60;
    return s + (e.sets || 0) * reps * weight;
  }, 0), 0));
  return { days: totalDays, weeklySets, weeklyVolume, avgDuration };
};

// ── Programs ─────────────────────────────────────────────────────────────────
const Programs = ({ state, dispatch }) => {
  const [selectedSplit, setSelectedSplit] = useState("ppl");
  const [previewProg, setPreviewProg] = useState(null);
  const [search, setSearch] = useState("");
  const [expFilter, setExpFilter] = useState("all");
  const [goalFilter, setGoalFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [tab, setTab] = useState("generate");

  const profile = state.profile || {};
  const goal = profile.goal || "muscle";
  const experience = profile.experience || "intermediate";
  const recoveryScore = state.recovery?.slice(-1)[0]?.score || 7;

  const getRecommendation = () => {
    const goalSplits = GOAL_SPLIT_MAP[goal] || ["ppl"];
    const expSplits = EXP_SPLIT_MAP[experience] || ["ppl"];
    const recommended = goalSplits.find(s => expSplits.includes(s)) || "ppl";
    const splitLabel = SPLITS.find(s => s.id === recommended)?.label || "Push Pull Legs";
    const reason = recoveryScore < 5
      ? `Your recovery score is ${recoveryScore}/10. Consider a lower-frequency program like ${splitLabel}.`
      : `Based on your ${GOAL_LABELS[goal]?.toLowerCase() || "fitness"} goal and ${experience} experience level, ${splitLabel} is recommended.`;
    return { id: recommended, label: splitLabel, reason };
  };

  const recommendation = getRecommendation();

  const generatePreview = (splitId) => {
    const base = PROGRAM_DB[splitId];
    if (!base) return;
    const adjusted = JSON.parse(JSON.stringify(base));
    if (experience === "beginner") {
      adjusted.days.forEach(d => {
        d.exercises.forEach(e => {
          if (e.sets > 3) e.sets = 3;
          e.rpe = Math.min(e.rpe, 7);
        });
        d.duration = Math.round(d.duration * 0.85);
      });
    } else if (experience === "advanced" || experience === "elite") {
      adjusted.days.forEach(d => {
        d.duration = Math.round(d.duration * 1.1);
      });
    }
    adjusted.id = `gen_${splitId}_${Date.now()}`;
    adjusted.split = splitId;
    setPreviewProg(adjusted);
  };

  useEffect(() => { generatePreview(selectedSplit); }, [selectedSplit, experience]);

  const handleSave = () => {
    if (!previewProg) return;
    dispatch({ type: "SAVE_PROGRAM", payload: { ...previewProg } });
    showToast(`${previewProg.name} program saved!`);
  };

  const handleStart = (prog) => {
    dispatch({ type: "SET_ACTIVE_PROGRAM", payload: prog });
    showToast(`${prog.name} is now your active program!`);
  };

  const handleDelete = async (id) => {
    const ok = await showConfirm("Delete this program? This cannot be undone.");
    if (ok) {
      dispatch({ type: "DELETE_PROGRAM", payload: id });
      showToast("Program deleted.");
    }
  };

  const startEdit = (prog) => {
    setEditingId(prog.id);
    setEditForm(JSON.parse(JSON.stringify(prog)));
  };

  const handleEditSave = () => {
    if (!editForm) return;
    dispatch({ type: "UPDATE_PROGRAM", payload: editForm });
    if (previewProg?.id === editForm.id) setPreviewProg(editForm);
    setEditingId(null);
    setEditForm(null);
    showToast("Program updated!");
  };

  const cancelEdit = () => { setEditingId(null); setEditForm(null); };

  const updateEditExercise = (dayIdx, exIdx, field, value) => {
    setEditForm(prev => {
      const f = JSON.parse(JSON.stringify(prev));
      if (field === "sets") f.days[dayIdx].exercises[exIdx][field] = +value;
      else f.days[dayIdx].exercises[exIdx][field] = value;
      return f;
    });
  };

  const addEditExercise = (dayIdx) => {
    setEditForm(prev => {
      const f = JSON.parse(JSON.stringify(prev));
      f.days[dayIdx].exercises.push({ name: "New Exercise", sets: 3, reps: "8-10", rest: "90s", rpe: 7, notes: "" });
      return f;
    });
  };

  const removeEditExercise = (dayIdx, exIdx) => {
    setEditForm(prev => {
      const f = JSON.parse(JSON.stringify(prev));
      f.days[dayIdx].exercises.splice(exIdx, 1);
      return f;
    });
  };

  const activeProg = state.currentProgram;
  const stats = calcProgramStats(previewProg);

  const filteredSaved = state.savedPrograms.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchExercises = p.days?.some(d => d.exercises?.some(e => e.name?.toLowerCase().includes(q)));
      if (!matchName && !matchExercises) return false;
    }
    return true;
  });

  const filteredSplits = SPLITS.filter(s => {
    if (expFilter !== "all") {
      const expList = EXP_SPLIT_MAP[expFilter] || [];
      if (!expList.includes(s.id)) return false;
    }
    if (goalFilter !== "all") {
      const goalList = GOAL_SPLIT_MAP[goalFilter] || [];
      if (!goalList.includes(s.id)) return false;
    }
    return true;
  });

  const renderEditForm = () => {
    if (!editForm) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Editing: {editForm.name}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ghost-btn" onClick={cancelEdit}>Cancel</button>
            <button className="neon-btn" onClick={handleEditSave} style={{ fontSize: 13 }}>Save Edits</button>
          </div>
        </div>
        {editForm.days?.map((day, di) => (
          <Card key={di} style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{day.name}</span>
                <span style={{ fontSize: 12, color: "#A0A0A0", marginLeft: 8 }}>{day.focus}</span>
              </div>
              <button className="ghost-btn" onClick={() => addEditExercise(di)} style={{ fontSize: 11 }}>+ Exercise</button>
            </div>
            {day.exercises?.map((ex, ei) => (
              <div key={ei} style={{ display: "grid", gridTemplateColumns: "2fr 60px 80px 80px 60px 60px 30px", gap: 6, alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12 }}>
                <input value={ex.name} onChange={e => updateEditExercise(di, ei, "name", e.target.value)} style={{ fontSize: 12, padding: "4px 8px" }} />
                <input type="number" value={ex.sets} onChange={e => updateEditExercise(di, ei, "sets", e.target.value)} style={{ fontSize: 12, padding: "4px 8px", textAlign: "center" }} />
                <input value={ex.reps} onChange={e => updateEditExercise(di, ei, "reps", e.target.value)} style={{ fontSize: 12, padding: "4px 8px", textAlign: "center" }} />
                <input value={ex.rest} onChange={e => updateEditExercise(di, ei, "rest", e.target.value)} style={{ fontSize: 12, padding: "4px 8px", textAlign: "center" }} />
                <input type="number" value={ex.rpe} onChange={e => updateEditExercise(di, ei, "rpe", e.target.value)} min={1} max={10} style={{ fontSize: 12, padding: "4px 8px", textAlign: "center" }} />
                <input value={ex.notes || ""} onChange={e => updateEditExercise(di, ei, "notes", e.target.value)} style={{ fontSize: 12, padding: "4px 8px" }} />
                <button onClick={() => removeEditExercise(di, ei)} style={{ background: "none", color: "#FF4757", fontSize: 16, cursor: "pointer", border: "none" }}>×</button>
              </div>
            ))}
          </Card>
        ))}
      </div>
    );
  };

  const renderDayCard = (day, i, prog) => {
    const isEditing = editingId === prog?.id;
    return (
      <Card key={i} style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#0B0B0B" }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{day.name}</div>
            <div style={{ fontSize: 11, color: "#A0A0A0" }}>{day.focus}</div>
          </div>
          {day.duration && <span style={{ fontSize: 11, color: "#A0A0A0", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4 }}>{day.duration} min</span>}
        </div>
        {day.exercises?.map((ex, j) => (
          <div key={j} style={{ padding: "8px 0", borderBottom: j < day.exercises.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 500 }}>{ex.name}</span>
              <span style={{ color: COLORS.cyan, fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{ex.sets}×{ex.reps}</span>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 3, fontSize: 11, color: "#A0A0A0" }}>
              {ex.rest && <span>Rest: {ex.rest}</span>}
              {ex.rpe && <span>RPE: {ex.rpe}</span>}
              {ex.notes && <span style={{ color: "#C8FF00" }}>{ex.notes}</span>}
            </div>
          </div>
        ))}
      </Card>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Adaptive Programs</h2>

      {/* AI Recommendation */}
      <Card style={{ background: "rgba(200,255,0,0.06)", borderColor: "rgba(200,255,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #C8FF00, #A5E600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, color: "#0B0B0B" }}>🤖</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>AI Recommendation</div>
            <p style={{ fontSize: 13, color: "#A0A0A0", lineHeight: 1.6 }}>{recommendation.reason} <button onClick={() => { setSelectedSplit(recommendation.id); setTab("generate"); }} style={{ background: "none", color: "#C8FF00", textDecoration: "underline", cursor: "pointer", fontSize: 13, border: "none", padding: 0 }}>View {recommendation.label} →</button></p>
          </div>
        </div>
      </Card>

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 8 }}>
        {[{ id: "generate", label: "Generate" }, { id: "saved", label: `Saved (${state.savedPrograms.length})` }, { id: "active", label: "Active Program" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="tab-btn" style={{ background: tab === t.id ? "rgba(200,255,0,0.2)" : "rgba(255,255,255,0.04)", color: tab === t.id ? COLORS.primary : "#A0A0A0", border: `1px solid ${tab === t.id ? "rgba(200,255,0,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8 }}>{t.label}</button>
        ))}
      </div>

      {/* GENERATE TAB */}
      {tab === "generate" && (
        <>
          {/* Filters */}
          <Card>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 8 }}>Search Exercises</div>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..." />
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 8 }}>Experience Level</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {EXP_FILTERS.map(f => (
                    <button key={f.id} onClick={() => setExpFilter(f.id)} style={{ padding: "6px 10px", borderRadius: 6, fontSize: 11, background: expFilter === f.id ? "rgba(200,255,0,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${expFilter === f.id ? "rgba(200,255,0,0.4)" : "rgba(255,255,255,0.08)"}`, color: expFilter === f.id ? "#C8FF00" : "#A0A0A0", cursor: "pointer", transition: "all 0.15s" }}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 8 }}>Goal</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {GOAL_FILTERS.map(f => (
                    <button key={f.id} onClick={() => setGoalFilter(f.id)} style={{ padding: "6px 10px", borderRadius: 6, fontSize: 11, background: goalFilter === f.id ? "rgba(200,255,0,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${goalFilter === f.id ? "rgba(200,255,0,0.4)" : "rgba(255,255,255,0.08)"}`, color: goalFilter === f.id ? "#C8FF00" : "#A0A0A0", cursor: "pointer", transition: "all 0.15s" }}>{f.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Split selection */}
          <Card>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Choose a Split</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {filteredSplits.length === 0 && <p style={{ fontSize: 13, color: "#A0A0A0" }}>No splits match your filters. Try adjusting.</p>}
              {filteredSplits.map(s => (
                <button key={s.id} onClick={() => setSelectedSplit(s.id)} style={{ padding: "10px 16px", borderRadius: 8, fontSize: 13, background: selectedSplit === s.id ? "rgba(200,255,0,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${selectedSplit === s.id ? "rgba(200,255,0,0.4)" : "rgba(255,255,255,0.08)"}`, color: selectedSplit === s.id ? "#C8FF00" : "#A0A0A0", cursor: "pointer", transition: "all 0.15s" }}>
                  {s.label}
                  {s.id === recommendation.id && <span style={{ fontSize: 10, marginLeft: 6, background: "rgba(200,255,0,0.3)", padding: "1px 6px", borderRadius: 4 }}>★ Recommended</span>}
                </button>
              ))}
            </div>
          </Card>

          {/* Program Stats */}
          {previewProg && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              <StatCard label="Training Days" value={stats.days} unit="/wk" color={COLORS.primary} />
              <StatCard label="Weekly Sets" value={stats.weeklySets} unit="sets" color={COLORS.cyan} />
              <StatCard label="Est. Weekly Volume" value={stats.weeklyVolume} unit="kg" color={COLORS.green} />
              <StatCard label="Avg Duration" value={stats.avgDuration} unit="min" color={COLORS.amber} />
            </div>
          )}

          {/* Preview */}
          {previewProg && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 200, background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.3)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{previewProg.name}</div>
                  <div style={{ fontSize: 13, color: "#A0A0A0" }}>{previewProg.description}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="neon-btn" onClick={handleSave} style={{ fontSize: 13 }}>Save Program</button>
                  <button className="neon-btn" onClick={() => handleStart(previewProg)} style={{ fontSize: 13, background: "linear-gradient(135deg, #A5E600, #C8FF00)" }}>Start Workout</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
                {previewProg.days?.map((day, i) => renderDayCard(day, i, previewProg))}
              </div>
            </div>
          )}
        </>
      )}

      {/* SAVED TAB */}
      {tab === "saved" && (
        <>
          {filteredSaved.length === 0 ? (
            <Card>
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No Saved Programs</div>
                <p style={{ fontSize: 13, color: "#A0A0A0" }}>Generate and save a program to see it here.</p>
              </div>
            </Card>
          ) : (
            filteredSaved.map(prog => (
              <div key={prog.id}>
                {editingId === prog.id ? renderEditForm() : (
                  <Card style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{prog.name}</div>
                        <div style={{ fontSize: 12, color: "#A0A0A0", marginTop: 2 }}>{prog.description}</div>
                        <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 4 }}>Saved {prog.savedAt ? new Date(prog.savedAt).toLocaleDateString() : ""}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="neon-btn" onClick={() => handleStart(prog)} style={{ fontSize: 12, padding: "6px 12px" }}>Start</button>
                        <button className="ghost-btn" onClick={() => startEdit(prog)} style={{ fontSize: 12 }}>Edit</button>
                        <button className="ghost-btn" onClick={() => handleDelete(prog.id)} style={{ fontSize: 12, color: "#FF4757", borderColor: "rgba(255,71,87,0.3)" }}>Delete</button>
                      </div>
                    </div>
                    {activeProg?.id === prog.id && <div style={{ fontSize: 11, color: "#C8FF00", marginBottom: 10, fontWeight: 600 }}>ACTIVE PROGRAM</div>}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
                      {prog.days?.map((day, i) => renderDayCard(day, i, prog))}
                    </div>
                  </Card>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* ACTIVE TAB */}
      {tab === "active" && (
        <>
          {!activeProg ? (
            <Card>
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏋️</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No Active Program</div>
                <p style={{ fontSize: 13, color: "#A0A0A0" }}>Generate or start a program to begin tracking.</p>
              </div>
            </Card>
          ) : (() => {
            const st = calcProgramStats(activeProg);
            return (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                  <StatCard label="Training Days" value={st.days} unit="/wk" color={COLORS.primary} />
                  <StatCard label="Weekly Sets" value={st.weeklySets} unit="sets" color={COLORS.cyan} />
                  <StatCard label="Est. Weekly Volume" value={st.weeklyVolume} unit="kg" color={COLORS.green} />
                  <StatCard label="Avg Duration" value={st.avgDuration} unit="min" color={COLORS.amber} />
                </div>
                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{activeProg.name}</div>
                      <div style={{ fontSize: 13, color: "#A0A0A0", marginTop: 4 }}>{activeProg.description}</div>
                    </div>
                    <button className="ghost-btn" onClick={() => { dispatch({ type: "SET_ACTIVE_PROGRAM", payload: null }); showToast("Program deactivated."); }} style={{ fontSize: 12, color: "#FF4757", borderColor: "rgba(255,71,87,0.3)" }}>Deactivate</button>
                  </div>
                </Card>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
                  {activeProg.days?.map((day, i) => renderDayCard(day, i, activeProg))}
                </div>
              </>
            );
          })()}
        </>
      )}
    </div>
  );
};

// ── Progress ─────────────────────────────────────────────────────────────────
const Progress = ({ state }) => {
  const { workouts, profile } = state;

  const e1rmHistory = useMemo(() => {
    const history = {};
    workouts.forEach(w => {
      w.exercises?.forEach(ex => {
        if (!history[ex.name]) history[ex.name] = [];
        const best = Math.max(...ex.sets.map(s => calcE1RM(s.weight, s.reps)));
        history[ex.name].push({ date: w.date.slice(5), e1rm: +best.toFixed(1) });
      });
    });
    return history;
  }, [workouts]);

  const topExercises = useMemo(() =>
    Object.entries(e1rmHistory).sort((a, b) => b[1].length - a[1].length).slice(0, 4),
    [e1rmHistory]
  );

  const volumeByWeek = useMemo(() => {
    const byWeek = {};
    workouts.forEach(w => {
      const d = new Date(w.date);
      const week = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString("en", { month: "short" })}`;
      byWeek[week] = (byWeek[week] || 0) + w.totalVolume;
    });
    return Object.entries(byWeek).slice(-8).map(([w, v]) => ({ week: w, volume: Math.round(v) }));
  }, [workouts]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Progress Tracker</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="Total Workouts" value={workouts.length} color={COLORS.primary} />
        <StatCard label="Total Volume" value={Math.round(workouts.reduce((s, w) => s + w.totalVolume, 0))} unit="kg" color={COLORS.cyan} />
        <StatCard label="Avg Volume/Session" value={workouts.length ? Math.round(workouts.reduce((s, w) => s + w.totalVolume, 0) / workouts.length) : 0} unit="kg" color={COLORS.green} />
        <StatCard label="Best Streak" value={calcStreak(workouts)} unit="days" color={COLORS.amber} />
      </div>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Weekly Volume Trend</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={volumeByWeek.length ? volumeByWeek : [{ week: "No data", volume: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#A0A0A0" }} />
            <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} />
            <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFFFFF", fontSize: 12 }} />
            <Bar dataKey="volume" fill="#C8FF00" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {topExercises.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Estimated 1RM Progression</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {topExercises.map(([name, data]) => (
              <Card key={name} style={{ padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{name}</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#A0A0A0" }} />
                    <YAxis tick={{ fontSize: 9, fill: "#A0A0A0" }} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFFFFF", fontSize: 11 }} />
                    <Line type="monotone" dataKey="e1rm" stroke={COLORS.cyan} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#A0A0A0" }}>
                  <span>Start: <span style={{ color: "#FFFFFF" }}>{data[0]?.e1rm}kg</span></span>
                  <span>Current: <span style={{ color: COLORS.cyan }}>{data[data.length - 1]?.e1rm}kg</span></span>
                  <span style={{ color: data[data.length - 1]?.e1rm > data[0]?.e1rm ? COLORS.green : COLORS.red }}>
                    {data[data.length - 1]?.e1rm > data[0]?.e1rm ? "▲" : "▼"} {fmt(Math.abs(data[data.length - 1]?.e1rm - data[0]?.e1rm), 1)}kg
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Body Weight Log ──────────────────────────────────────────────────────────
const BodyWeightLog = ({ state, dispatch }) => {
  const [weight, setWeight] = useState(state.profile?.weight || 75);
  const [date, setDate] = useState(today());

  const log = () => {
    if (+weight <= 0) return;
    dispatch({ type: "ADD_WEIGHT", payload: { weight: +weight, date } });
    showToast("Weight logged!");
  };

  const data = useMemo(() =>
    state.bodyWeight.slice(-60).map(w => ({ date: w.date.slice(5), weight: w.weight })),
    [state.bodyWeight]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Body Weight</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Log Weight</div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "#A0A0A0", display: "block", marginBottom: 6 }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#A0A0A0", display: "block", marginBottom: 6 }}>Weight (kg)</label>
            <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <button className="neon-btn" onClick={log} style={{ width: "100%" }}>Log Weight</button>
        </Card>
        <Card>
          <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 12 }}>Weight history (60 days)</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.length ? data : [{ date: today().slice(5), weight: state.profile?.weight || 75 }]}>
              <defs><linearGradient id="bwg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C8FF00" stopOpacity={0.3} /><stop offset="95%" stopColor="#C8FF00" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} />
              <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(200,255,0,0.3)", borderRadius: 8, color: "#FFFFFF", fontSize: 12 }} />
              <Area type="monotone" dataKey="weight" stroke="#C8FF00" fill="url(#bwg)" strokeWidth={2} dot={{ fill: "#C8FF00", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

// ── AI Chat Coach ─────────────────────────────────────────────────────────────
const MAX_CHAT_MESSAGES = 100;

const SUGGESTED_PROMPTS = [
  { icon: "📋", title: "Create Workout Plan", desc: "Personalized program for your level and goals", prompt: "Create a personalized workout plan based on my profile and current fitness level" },
  { icon: "📊", title: "Analyze My Progress", desc: "Insights on your training trends and data", prompt: "Analyze my recent progress and give me insights on what's working and what to improve" },
  { icon: "🏋️", title: "Today's Workout", desc: "What to train based on recovery and history", prompt: "What workout should I do today based on my recovery and recent training?" },
  { icon: "🥗", title: "Nutrition Advice", desc: "Optimize your diet for your goals", prompt: "How should I adjust my nutrition based on my current goals and activity?" },
  { icon: "😴", title: "Recovery Advice", desc: "Improve sleep and recovery quality", prompt: "What can I do to improve my recovery and sleep quality?" },
  { icon: "🔥", title: "Calorie Needs", desc: "Calculate your daily targets", prompt: "Calculate and explain my daily calorie and macro needs based on my data" },
];

const SuggestedPrompts = ({ onSelect }) => (
  <div className="chat-suggested">
    <div className="chat-suggested-title">What can I help with?</div>
    <div className="chat-suggested-sub">I have access to your training data, nutrition, recovery, and goals.</div>
    <div className="chat-suggested-grid">
      {SUGGESTED_PROMPTS.map((p, i) => (
        <motion.button
          key={i}
          className="chat-prompt-card"
          onClick={() => onSelect(p.prompt)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="prompt-icon">{p.icon}</div>
          <div className="prompt-title">{p.title}</div>
          <div className="prompt-desc">{p.desc}</div>
        </motion.button>
      ))}
    </div>
  </div>
);

const ChatInput = ({ onSend, loading, disabled }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  useEffect(() => { adjustHeight(); }, [input]);

  const handleSend = () => {
    if (!input.trim() || loading || disabled) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-area">
      <div className="chat-input-wrap">
        <div className="chat-textarea-wrap">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI coach anything..."
            rows={1}
            disabled={loading || disabled}
          />
        </div>
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={loading || disabled || !input.trim()}
          aria-label="Send message"
        >
          {loading ? (
            <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span>
          ) : "→"}
        </button>
      </div>
    </div>
  );
};

const AIChat = ({ state, dispatch }) => {
  const conversations = state.aiConversations || [];
  const [activeId, setActiveId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { ask, loading } = useAICoach();
  const bottomRef = useRef();

  const activeConv = conversations.find(c => c.id === activeId) || null;
  const messages = activeConv?.messages || [];

  // Persist chats to reducer (which syncs to Firestore via debounced save)
  const setConversations = (updater) => {
    const next = typeof updater === "function" ? updater(conversations) : updater;
    dispatch({ type: "SET_AI_CONVERSATIONS", payload: next });
  };

  // Auto-scroll to bottom on new messages or loading
  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages.length, loading]);

  const createConversation = (firstMessage) => {
    const welcomeMsg = {
      id: uid(),
      role: "assistant",
      content: `Hi ${state.profile?.name || "there"}! I'm your AI fitness coach. I have access to your training data, nutrition logs, recovery scores, and personal records.\n\nAsk me anything — whether it's about your next workout, nutrition targets, recovery optimization, or program design.`,
      timestamp: Date.now(),
    };
    const userMsg = {
      id: uid(),
      role: "user",
      content: firstMessage,
      timestamp: Date.now(),
    };
    const conv = {
      id: uid(),
      title: firstMessage.length > 40 ? firstMessage.slice(0, 40) + "…" : firstMessage,
      messages: [welcomeMsg, userMsg],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations(p => [conv, ...p]);
    setActiveId(conv.id);
    return conv;
  };

  const sendMessage = async (text) => {
    if (!text || loading) return;

    let convId = activeId;
    let currentMessages = messages;

    // Create new conversation if none active
    if (!convId) {
      const conv = createConversation(text);
      convId = conv.id;
      currentMessages = conv.messages;
    } else {
      // Add user message to existing conversation
      const userMsg = { id: uid(), role: "user", content: text, timestamp: Date.now() };
      setConversations(p => p.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, userMsg], updatedAt: Date.now() }
          : c
      ));
      currentMessages = [...currentMessages, userMsg];
    }

    // Build context and get AI response
    const context = buildUserContext(state);
    const systemPrompt = buildSystemPrompt(context);
    const historyForAPI = currentMessages.slice(-20).map(m => ({ role: m.role, content: m.content }));

    const reply = await ask(systemPrompt, text, historyForAPI.slice(0, -1));

    if (reply) {
      const assistantMsg = { id: uid(), role: "assistant", content: reply, timestamp: Date.now() };
      setConversations(p => p.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() }
          : c
      ));
    }
  };

  const regenerateLast = async () => {
    if (!activeConv || loading) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    if (!lastUserMsg) return;

    // Remove last assistant message if it exists
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant") {
      setConversations(p => p.map(c =>
        c.id === activeId
          ? { ...c, messages: c.messages.slice(0, -1), updatedAt: Date.now() }
          : c
      ));
    }

    const context = buildUserContext(state);
    const systemPrompt = buildSystemPrompt(context);
    const historyForAPI = messages.slice(-20).map(m => ({ role: m.role, content: m.content }));

    const reply = await ask(systemPrompt, lastUserMsg.content, historyForAPI.slice(0, -1));

    if (reply) {
      const assistantMsg = { id: uid(), role: "assistant", content: reply, timestamp: Date.now() };
      setConversations(p => p.map(c =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() }
          : c
      ));
    }
  };

  const clearChat = async () => {
    if (!activeId) return;
    if (await showConfirm("Clear all messages in this conversation?")) {
      setConversations(p => p.filter(c => c.id !== activeId));
      setActiveId(null);
    }
  };

  const deleteConversation = async (id) => {
    setConversations(p => p.filter(c => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const selectConversation = (id) => {
    setActiveId(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSuggestedPrompt = (prompt) => {
    sendMessage(prompt);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 48px)" }}>
      <div className="chat-container">
        {/* Sidebar */}
        <div className={`chat-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
          <div className="chat-sidebar-header">
            <button className="chat-new-btn" onClick={() => setActiveId(null)}>
              <span>+</span> New Chat
            </button>
          </div>
          <div className="chat-conv-list">
            {conversations.length === 0 && (
              <div style={{ padding: "20px 12px", textAlign: "center", fontSize: 12, color: "rgba(160,160,160,0.35)" }}>
                No conversations yet
              </div>
            )}
            {conversations.sort((a, b) => b.updatedAt - a.updatedAt).map(c => (
              <div
                key={c.id}
                className={`chat-conv-item ${activeId === c.id ? "active" : ""}`}
                onClick={() => selectConversation(c.id)}
              >
                <span style={{ fontSize: 14, flexShrink: 0 }}>💬</span>
                <span className="conv-title">{c.title}</span>
                <button
                  className="conv-delete"
                  onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                  aria-label="Delete conversation"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat */}
        <div className="chat-main">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <button
                className="chat-header-btn"
                onClick={() => setSidebarOpen(p => !p)}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? "◀" : "▶"}
              </button>
              <div className="chat-header-title">
                {activeConv?.title || "AI Fitness Coach"}
              </div>
            </div>
            <div className="chat-header-actions">
              {activeConv && (
                <>
                  <button className="chat-header-btn" onClick={() => sendMessage("Summarize our conversation so far")} disabled={loading}>
                    📝 Summary
                  </button>
                  <button className="chat-header-btn danger" onClick={clearChat} disabled={loading}>
                    🗑️ Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <SuggestedPrompts onSelect={handleSuggestedPrompt} />
            ) : (
              <div className="chat-messages-inner">
                {messages.map((m, i) => (
                  <ChatMessageComponent
                    key={m.id}
                    message={m}
                    isLastAssistant={m.role === "assistant" && (i === messages.length - 1 || messages[i + 1]?.role === "user")}
                    onRegenerate={regenerateLast}
                  />
                ))}
                {loading && (
                  <div className="chat-typing">
                    <div className="chat-msg-avatar assistant">🤖</div>
                    <div className="chat-typing-dots">
                      <div className="chat-typing-dot" />
                      <div className="chat-typing-dot" />
                      <div className="chat-typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "0" }}>
            <ChatInput
              onSend={sendMessage}
              loading={loading}
              disabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Separate component to properly scope the `isLastAssistant` prop
const ChatMessageComponent = ({ message, isLastAssistant, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className={`chat-msg ${message.role}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className={`chat-msg-avatar ${message.role}`}>
        {isUser ? "👤" : "🤖"}
      </div>
      <div className="chat-msg-body">
        <div
          className="chat-msg-bubble"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
        />
        <div className="chat-msg-meta">
          <span className="chat-msg-time">{formatChatTime(message.timestamp)}</span>
          <div className="chat-msg-actions">
            <button className={`chat-msg-action ${copied ? "copied" : ""}`} onClick={handleCopy}>
              {copied ? "✓ Copied" : "📋 Copy"}
            </button>
            {!isUser && isLastAssistant && (
              <button className="chat-msg-action" onClick={onRegenerate}>
                🔄 Regenerate
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Profile ──────────────────────────────────────────────────────────────────
const ProfilePage = ({ state, dispatch }) => {
  const { profile } = state;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });

  const handleSave = () => {
    dispatch({ type: "UPDATE_PROFILE", payload: form });
    setEditing(false);
    showToast("Profile updated!");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Profile</h2>
        <button className={editing ? "neon-btn" : "ghost-btn"} onClick={editing ? handleSave : () => setEditing(true)}>{editing ? "Save Changes" : "Edit Profile"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #C8FF00, #C8FF00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, marginBottom: 12 }}>
            {profile.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{profile.name}</div>
          <div style={{ fontSize: 12, color: "#A0A0A0" }}>Level {state.level} · {state.xp} XP</div>
        </div>

        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {[["name", "Name", "text"], ["age", "Age", "number"], ["weight", "Weight (kg)", "number"], ["height", "Height (cm)", "number"], ["bodyFat", "Body Fat (%)", "number"]].map(([k, l, t]) => (
              <div key={k}>
                <label style={{ fontSize: 11, color: "#A0A0A0", display: "block", marginBottom: 4 }}>{l}</label>
                {editing
                  ? <input type={t} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: t === "number" ? +e.target.value : e.target.value }))} />
                  : <div style={{ fontSize: 15, fontWeight: 500 }}>{profile[k]}</div>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="TDEE" value={profile.tdee} unit="kcal" color={COLORS.amber} />
        <StatCard label="Target Calories" value={profile.calories} unit="kcal" color={COLORS.green} />
        <StatCard label="Protein Target" value={profile.protein} unit="g" color={COLORS.primary} />
        <StatCard label="Goal" value={GOAL_LABELS[profile.goal]} color={COLORS.cyan} />
      </div>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Reset All Data</div>
        <p style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 12 }}>This will permanently delete all your workouts, nutrition logs, and progress data.</p>
        <button style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", color: COLORS.red, borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }} onClick={async () => { if (await showConfirm("Are you sure? This will permanently delete all your workouts, nutrition logs, and progress data. This cannot be undone.")) dispatch({ type: "RESET" }); }}>Reset All Data</button>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════

const PAGES = [
  { id: "dashboard", label: "Dashboard", icon: "🏠", group: "main" },
  { id: "workout", label: "Workouts", icon: "🏋️", group: "training", showInSidebar: true },
  { id: "exercise-library", label: "Exercise Library", icon: "📚", group: "training", showInSidebar: true },
  { id: "planner", label: "Workout Planner", icon: "📋", group: "training", showInSidebar: true },
  { id: "running", label: "Running", icon: "🏃", group: "training", showInSidebar: true },
  { id: "programs", label: "Programs", icon: "📊", group: "training", showInSidebar: true },
  { id: "nutrition", label: "Nutrition", icon: "🥗", group: "health", showInSidebar: true },
  { id: "smart-nutrition", label: "Smart Nutrition", icon: "🍽️", group: "health", showInSidebar: true },
  { id: "water-tracker", label: "Water Tracker", icon: "💧", group: "health", showInSidebar: true },
  { id: "calculator", label: "BMI Calculator", icon: "🧮", group: "health", showInSidebar: true },
  { id: "recovery", label: "Recovery", icon: "😴", group: "health", showInSidebar: true },
  { id: "bodyweight", label: "Body Weight", icon: "⚖️", group: "health", showInSidebar: true },
  { id: "goals", label: "Goals", icon: "🎯", group: "analytics", showInSidebar: true },
  { id: "achievements", label: "Achievements", icon: "🏆", group: "analytics", showInSidebar: true },
  { id: "progress", label: "Progress", icon: "📈", group: "analytics", showInSidebar: true },
  { id: "coach", label: "AI Coach", icon: "🤖", group: "analytics", showInSidebar: true },
  { id: "notifications", label: "Notifications", icon: "🔔", group: "tools", showInSidebar: true },
  { id: "export", label: "Export Reports", icon: "📤", group: "tools", showInSidebar: true },
  { id: "admin", label: "Analytics", icon: "📊", group: "tools", showInSidebar: true },
  { id: "settings", label: "Settings", icon: "⚙️", group: "account", showInSidebar: true },
  { id: "profile", label: "Profile", icon: "👤", group: "account", showInSidebar: true },
];

const SIDEBAR_GROUPS = [
  { key: "main", label: "" },
  { key: "training", label: "TRAINING" },
  { key: "health", label: "HEALTH" },
  { key: "analytics", label: "ANALYTICS" },
  { key: "tools", label: "TOOLS" },
  { key: "account", label: "ACCOUNT" },
];

// FIX #3: Added week_streak badge check
function reducer(state, action) {
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
    // ── Workout Module Actions ──
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
    // ── Running Mode Actions ──
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

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [appState, appDispatch] = React.useReducer(reducer, null, mkInitial);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { const v = localStorage.getItem("ai_fitness_sidebar"); return v !== null ? JSON.parse(v) : true; } catch { return true; }
  });
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const prevLevelRef = React.useRef(appState.level);
  const saveTimerRef = useRef(null);

  // ── Load user data from Firestore on auth ──
  useEffect(() => {
    if (!user) { setDataLoaded(false); return; }
    let cancelled = false;
    const loadData = async () => {
      try {
        const data = await getUserData(user.uid);
        if (!cancelled && data) {
          appDispatch({ type: "LOAD_DATA", payload: data });
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
      } finally {
        if (!cancelled) setDataLoaded(true);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, [user?.uid]);

  // ── Debounce-save to Firestore on state changes ──
  useEffect(() => {
    if (!user || !dataLoaded || !appState.profile) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveUserData(user.uid, appState).catch((err) =>
        console.error("Failed to save user data:", err)
      );
    }, 1500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [appState, user, dataLoaded]);

  // Expose setPage for Dashboard quick actions
  useEffect(() => {
    window.__setPage = (page) => navigate("/" + page, { replace: false });
    return () => { delete window.__setPage; };
  }, [navigate]);

  // Persist sidebar state
  useEffect(() => { try { localStorage.setItem("ai_fitness_sidebar", JSON.stringify(sidebarOpen)); } catch {} }, [sidebarOpen]);

  // Close account menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (accountMenuOpen && !e.target.closest(".account-menu") && !e.target.closest(".topbar-avatar")) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [accountMenuOpen]);

  // Close account menu on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setAccountMenuOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Detect level ups
  useEffect(() => {
    if (appState.level > prevLevelRef.current) {
      showToast(`Level Up! You're now Level ${appState.level}!`);
    }
    prevLevelRef.current = appState.level;
  }, [appState.level]);

  // Redirect to /login when user signs out (handles race condition)
  const wasLoggedInRef = useRef(!!user);
  useEffect(() => {
    if (wasLoggedInRef.current && !user && !authLoading) {
      navigate("/login", { replace: true });
    }
    wasLoggedInRef.current = !!user;
  }, [user, authLoading]);

  // ── All hooks above this line ──

  // Auth loading
  if (authLoading) return null;

  // Not authenticated → show auth pages
  if (!user) {
    return (
      <>
        <GlobalStyles />
        <Toast />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    );
  }

  // Authenticated user landed on auth pages → redirect to dashboard
  const authPages = ["/login", "/signup", "/forgot-password"];
  if (authPages.includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Data still syncing
  if (!dataLoaded) {
    return (
      <>
        <GlobalStyles />
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          background: "#0B0B0F", flexDirection: "column", gap: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "rgba(200,255,0,0.1)",
            border: "1px solid rgba(200,255,0,0.2)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 24,
          }}>⚡</div>
          <div style={{ color: "#A0A0A0", fontSize: 13 }}>Syncing your data...</div>
        </div>
      </>
    );
  }

  // No profile yet → onboarding
  if (!appState.profile) {
    return (
      <>
        <GlobalStyles />
        <Toast />
        <ConfirmDialog />
        <Onboarding onComplete={(profile) => appDispatch({ type: "COMPLETE_ONBOARDING", payload: profile })} />
      </>
    );
  }

  const validPageIds = PAGES.map(p => p.id);
  const rawPage = location.pathname.slice(1) || "dashboard";
  const page = validPageIds.includes(rawPage) ? rawPage : "dashboard";

  // Redirect if page didn't match a valid page or was empty
  if (location.pathname !== "/" + page) {
    return <Navigate to={"/" + page} replace />;
  }

  const PageComponent = {
    dashboard: Dashboard, workout: WorkoutHub, session: WorkoutHub, library: WorkoutHub,
    templates: WorkoutHub, history: WorkoutHub, prs: WorkoutHub,
    running: RunningMode,
    nutrition: Nutrition, recovery: Recovery, programs: Programs, progress: Progress,
    bodyweight: BodyWeightLog, coach: AIChat, profile: ProfilePage,
    "exercise-library": ExerciseLibrary, planner: WorkoutPlanner, "smart-nutrition": SmartNutrition,
    "water-tracker": WaterTracker, calculator: BodyCalculator, goals: GoalManager,
    achievements: Achievements, notifications: NotificationCenter, export: ExportReports,
    admin: AdminDashboard, settings: SettingsPage,
  }[page] || Dashboard;

  const streak = calcStreak(appState.workouts);

  return (
    <>
      <GlobalStyles />
      <Toast />
      <ConfirmDialog />
      <div style={{ display: "flex", minHeight: "100vh", background: "#0B0B0B" }}>
        {/* Sidebar */}
        <div style={{
          width: sidebarOpen ? 240 : 68, flexShrink: 0, background: "#0F0F0F",
          borderRight: "1px solid rgba(200,255,0,0.06)", display: "flex", flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden", position: "relative", zIndex: 20,
        }}>
          {/* Logo */}
          <div style={{ padding: "16px 12px", borderBottom: "1px solid rgba(200,255,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "rgba(200,255,0,0.1)",
              border: "1px solid rgba(200,255,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
            }}>⚡</div>
            {sidebarOpen && <span style={{ fontSize: 15, fontWeight: 800, background: "linear-gradient(135deg, #C8FF00, #A5E600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>AI Fitness</span>}
          </div>
          {/* Sidebar Collapse Toggle */}
          <div style={{ padding: "8px 12px", display: "flex", justifyContent: sidebarOpen ? "flex-end" : "center" }}>
            <button onClick={() => setSidebarOpen(p => !p)} title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} style={{
              background: "rgba(200,255,0,0.06)", color: "#A0A0A0", fontSize: 14,
              padding: 7, borderRadius: 8, border: "1px solid rgba(200,255,0,0.08)", transition: "all 0.2s",
              width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,255,0,0.12)"; e.currentTarget.style.color = "#C8FF00"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(200,255,0,0.06)"; e.currentTarget.style.color = "#A0A0A0"; }}
            >{sidebarOpen ? "◀" : "▶"}</button>
          </div>

          {/* Nav Groups */}
          <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 0, overflowY: "auto" }}>
            {SIDEBAR_GROUPS.map(g => {
              const items = PAGES.filter(p => p.group === g.key);
              if (!items.length) return null;
              return (
                <div key={g.key} className="dash-sidebar-group">
                  {sidebarOpen && g.label && <div className="dash-sidebar-label">{g.label}</div>}
                  {items.map(p => (
                    <button key={p.id} className={`dash-sidebar-btn ${page === p.id ? "active" : ""}`} onClick={() => navigate("/" + p.id)}>
                      <span className="nav-icon">{p.icon}</span>
                      {sidebarOpen && <span>{p.label}</span>}
                    </button>
                  ))}
                </div>
              );
            })}
          </nav>

          {/* Bottom Stats */}
          {sidebarOpen && (
            <div style={{ padding: "16px 14px", borderTop: "1px solid rgba(200,255,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: "rgba(200,255,0,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#C8FF00",
                }}>{(appState.profile?.name || "U")[0].toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{appState.profile?.name}</div>
                  <div style={{ fontSize: 11, color: "#A0A0A0" }}>Lv. {appState.level} · {appState.xp} XP</div>
                </div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10,
                background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.1)",
              }}>
                <span style={{ fontSize: 14 }}>🔥</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#C8FF00" }}>{streak} day streak</span>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
          {/* Top Navigation Bar */}
          <div className="topbar">
            <span className="topbar-title">{PAGES.find(p => p.id === page)?.label || "Dashboard"}</span>
            <div className="topbar-right">
              <div
                className={`topbar-avatar ${accountMenuOpen ? "open" : ""}`}
                onClick={() => setAccountMenuOpen(p => !p)}
                role="button"
                tabIndex={0}
                aria-label="Account menu"
                aria-expanded={accountMenuOpen}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setAccountMenuOpen(p => !p); } }}
              >
                {(appState.profile?.name || "U")[0].toUpperCase()}
              </div>
              {accountMenuOpen && (
                <AccountMenu
                  profile={appState.profile}
                  level={appState.level}
                  xp={appState.xp}
                  dispatch={appDispatch}
                  onClose={() => setAccountMenuOpen(false)}
                  onNavigate={(p) => navigate("/" + p)}
                />
              )}
            </div>
          </div>

          {/* Page content */}
          <div style={{ flex: 1, padding: 24 }}>
            <AnimatePresence mode="wait">
              {PageComponent && (
                <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <PageComponent state={appState} dispatch={appDispatch} page={page} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
