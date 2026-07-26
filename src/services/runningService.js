import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const getUserRuns = async (uid) => {
  if (!db) return [];
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().runs || []) : [];
};

export const saveRuns = async (uid, runs) => {
  if (!db) return;
  const ref = doc(db, "users", uid);
  await setDoc(ref, { runs, updatedAt: new Date().toISOString() }, { merge: true });
};

export const addRun = async (uid, run) => {
  const runs = await getUserRuns(uid);
  await saveRuns(uid, [...runs, run]);
};

export const deleteRun = async (uid, runId) => {
  const runs = await getUserRuns(uid);
  await saveRuns(uid, runs.filter((r) => r.id !== runId));
};
