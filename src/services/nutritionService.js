import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const getUserNutrition = async (uid) => {
  if (!db) return [];
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().nutrition || []) : [];
};

export const saveNutrition = async (uid, nutrition) => {
  if (!db) return;
  const ref = doc(db, "users", uid);
  await setDoc(ref, { nutrition, updatedAt: new Date().toISOString() }, { merge: true });
};

export const addMeal = async (uid, meal) => {
  const nutrition = await getUserNutrition(uid);
  await saveNutrition(uid, [...nutrition, meal]);
};

export const deleteMeal = async (uid, mealId) => {
  const nutrition = await getUserNutrition(uid);
  await saveNutrition(uid, nutrition.filter((n) => n.id !== mealId));
};
