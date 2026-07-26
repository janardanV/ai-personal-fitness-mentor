import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const getUserProgress = async (uid) => {
  if (!db) return {};
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return {};
  const data = snap.data();
  return {
    bodyWeight: data.bodyWeight || [],
    personalRecords: data.personalRecords || {},
    workouts: data.workouts || [],
  };
};

export const saveBodyWeight = async (uid, bodyWeight) => {
  if (!db) return;
  const ref = doc(db, "users", uid);
  await setDoc(ref, { bodyWeight, updatedAt: new Date().toISOString() }, { merge: true });
};

export const savePersonalRecords = async (uid, personalRecords) => {
  if (!db) return;
  const ref = doc(db, "users", uid);
  await setDoc(ref, { personalRecords, updatedAt: new Date().toISOString() }, { merge: true });
};
