import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "./firebase";

const requireAuth = () => {
  if (!auth) throw new Error("Firebase is not configured. Set your Firebase credentials in .env");
};

const googleProvider = new GoogleAuthProvider();

export const signUpWithEmail = async (email, password) => {
  requireAuth();
  await setPersistence(auth, browserLocalPersistence);
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (email, password) => {
  requireAuth();
  await setPersistence(auth, browserLocalPersistence);
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
  requireAuth();
  await setPersistence(auth, browserLocalPersistence);
  return signInWithPopup(auth, googleProvider);
};

export const resetPassword = (email) => {
  requireAuth();
  return sendPasswordResetEmail(auth, email);
};

export const logOut = () => {
  requireAuth();
  return signOut(auth);
};

export const setDisplayName = (name) => {
  requireAuth();
  if (auth.currentUser) {
    return updateProfile(auth.currentUser, { displayName: name });
  }
};

export const AUTH_ERRORS = {
  "auth/user-not-found": "No account found with this email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/popup-closed-by-user": "Sign-in cancelled. Please try again.",
  "auth/popup-blocked": "Pop-up was blocked. Please allow pop-ups for this site.",
  "auth/network-request-failed": "Network error. Please check your connection.",
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/operation-not-allowed": "This sign-in method is not enabled.",
  "auth/requires-recent-login": "Please log in again before retrying.",
};

export const getFriendlyError = (error) => {
  return AUTH_ERRORS[error.code] || error.message || "An unexpected error occurred. Please try again.";
};
