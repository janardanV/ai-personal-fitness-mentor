import { doc, getDoc, setDoc } from "firebase/firestore";
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
  const local = readLocalFallback();

  if (!db) {
    return local;
  }

  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();

    if (local && local.profile) {
      await setDoc(ref, local, { merge: true });
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return local;
    }

    return null;
  } catch (err) {
    console.error("Firestore read failed, using local fallback:", err);
    return local;
  }
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
