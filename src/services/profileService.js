import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const LOCAL_STORAGE_KEY = "ai_fitness_mentor_v1";

const readLocalFallback = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
};

export const getUserData = async (uid) => {
  if (!db) return readLocalFallback();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  return null;
};

export const saveUserData = async (uid, data) => {
  if (!db) return;

  const ref = doc(db, "users", uid);
  const payload = {
    profile: data.profile,
    settings: data.settings || {},
    workouts: data.workouts,
    nutrition: data.nutrition,
    recovery: data.recovery,
    bodyWeight: data.bodyWeight,
    water: data.water,
    badges: data.badges,
    xp: data.xp,
    level: data.level,
    currentProgram: data.currentProgram,
    pendingWorkout: data.pendingWorkout || null,
    activeSession: data.activeSession || null,
    savedPrograms: data.savedPrograms,
    aiHistory: data.aiHistory,
    aiConversations: data.aiConversations || [],
    personalRecords: data.personalRecords,
    workoutTemplates: data.workoutTemplates,
    customExercises: data.customExercises,
    runs: data.runs,
    runningGoals: data.runningGoals,
    runningPRs: data.runningPRs,
    runningBadges: data.runningBadges,
    goals: data.goals || [],
    notifications: data.notifications || [],
    favoriteMeals: data.favoriteMeals || [],
    updatedAt: new Date().toISOString(),
  };
  await setDoc(ref, payload, { merge: true });
};

// Permanently delete a user's cloud document (used by Reset/Delete Account).
export const deleteUserData = async (uid) => {
  if (!db) return;
  const ref = doc(db, "users", uid);
  await deleteDoc(ref);
};

export const createUserDocument = async (uid, profileData) => {
  const initial = {
    profile: profileData,
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
    savedPrograms: [],
    aiHistory: [],
    aiConversations: [],
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!db) return initial;

  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    await setDoc(ref, initial, { merge: true });
  } catch (err) {
    console.error("Firestore createUserDocument failed:", err);
  }
  return initial;
};

// ── Guest mode: local-only persistence ──

export const readLocalData = () => readLocalFallback();

export const saveLocalData = (data) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save local data:", err);
  }
};

export const clearLocalData = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

const hasLocalData = (data) => {
  const d = data || readLocalFallback();
  if (!d || typeof d !== "object") return false;
  const has = (arr) => Array.isArray(arr) && arr.length > 0;
  const hasObj = (o) => o && typeof o === "object" && Object.keys(o).length > 0;
  return (
    has(d.workouts) ||
    has(d.nutrition) ||
    has(d.recovery) ||
    has(d.bodyWeight) ||
    has(d.badges) ||
    has(d.savedPrograms) ||
    has(d.aiHistory) ||
    has(d.aiConversations) ||
    has(d.workoutTemplates) ||
    has(d.customExercises) ||
    has(d.runs) ||
    has(d.runningBadges) ||
    has(d.goals) ||
    has(d.notifications) ||
    has(d.favoriteMeals) ||
    hasObj(d.water) ||
    hasObj(d.personalRecords) ||
    hasObj(d.runningPRs) ||
    hasObj(d.settings) ||
    Boolean(d.currentProgram) ||
    Number(d.xp) > 0
  );
};

const ARRAY_FIELDS = [
  "workouts", "nutrition", "recovery", "bodyWeight", "badges", "savedPrograms",
  "aiHistory", "aiConversations", "workoutTemplates", "customExercises", "runs",
  "runningBadges", "goals", "notifications", "favoriteMeals",
];
const DATE_KEY_FIELDS = ["recovery", "bodyWeight"];
const OBJECT_FIELDS = ["water", "personalRecords", "runningPRs", "runningGoals"];

const mergeById = (cloudItems = [], guestItems = []) => {
  const map = new Map();
  [...cloudItems, ...guestItems].forEach((item) => {
    if (!item) return;
    const key = item.id !== undefined ? `id:${item.id}` : `json:${JSON.stringify(item)}`;
    map.set(key, item);
  });
  return [...map.values()];
};

// Merge guest (local) data into a user's existing cloud doc without losing either.
export const mergeData = (cloud, guest) => {
  const result = { ...(cloud || {}) };
  ARRAY_FIELDS.forEach((field) => {
    const cloudItems = Array.isArray(cloud?.[field]) ? cloud[field] : [];
    const guestItems = Array.isArray(guest?.[field]) ? guest[field] : [];
    if (DATE_KEY_FIELDS.includes(field)) {
      const byDate = new Map();
      cloudItems.forEach((item) => item?.date && byDate.set(item.date, item));
      guestItems.forEach((item) => item?.date && byDate.set(item.date, item));
      result[field] = [...byDate.values()];
    } else {
      result[field] = mergeById(cloudItems, guestItems);
    }
  });
  OBJECT_FIELDS.forEach((field) => {
    result[field] = { ...(guest?.[field] || {}), ...(cloud?.[field] || {}) };
  });
  result.profile = { ...(guest?.profile || {}), ...(cloud?.profile || {}) };
  result.settings = { ...(guest?.settings || {}), ...(cloud?.settings || {}) };
  result.xp = Math.max(Number(cloud?.xp) || 0, Number(guest?.xp) || 0);
  result.level = Math.max(Number(cloud?.level) || 1, Number(guest?.level) || 1);
  result.currentProgram = cloud?.currentProgram || guest?.currentProgram || null;
  result.pendingWorkout = cloud?.pendingWorkout || guest?.pendingWorkout || null;
  result.activeSession = cloud?.activeSession || guest?.activeSession || null;
  return result;
};

// Load a user's cloud data, migrating any local guest data into Firestore.
export const loadOrMigrateUserData = async (uid) => {
  const local = readLocalFallback();
  const localHasData = hasLocalData(local);

  if (!db) return local;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref); // throws on read failure — never silently fall back
  if (snap.exists()) {
    const cloud = snap.data();
    if (!localHasData) return cloud;
    const merged = mergeData(cloud, local);
    try {
      await setDoc(ref, merged, { merge: true });
      clearLocalData();
    } catch (err) {
      console.error("Guest data migration write failed:", err);
    }
    return merged;
  }

  if (localHasData) {
    await setDoc(ref, local, { merge: true });
    clearLocalData();
    return local;
  }
  return null;
};
