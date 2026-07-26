import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const getUserWorkouts = async (uid) => {
  if (!db) return [];
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().workouts || []) : [];
};

export const saveWorkouts = async (uid, workouts) => {
  if (!db) return;
  const ref = doc(db, "users", uid);
  await setDoc(ref, { workouts, updatedAt: new Date().toISOString() }, { merge: true });
};

export const addWorkout = async (uid, workout) => {
  const workouts = await getUserWorkouts(uid);
  await saveWorkouts(uid, [...workouts, workout]);
};

export const deleteWorkout = async (uid, workoutId) => {
  const workouts = await getUserWorkouts(uid);
  await saveWorkouts(uid, workouts.filter((w) => w.id !== workoutId));
};
