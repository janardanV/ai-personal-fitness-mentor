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
import { auth, FIREBASE_CONFIG_ERROR, FIREBASE_ENV_VARS } from "./firebase";

const requireAuth = () => {
  if (!auth) {
    throw new Error(
      FIREBASE_CONFIG_ERROR ||
        "Firebase is not configured. Check that all VITE_FIREBASE_* environment variables are set."
    );
  }
};

const googleProvider = new GoogleAuthProvider();

const logGoogleSignInError = (error) => {
  console.error("Google Sign-In Error", {
    code: error?.code,
    message: error?.message,
    customData: error?.customData,
    credential: error?.credential,
    googleCredential: GoogleAuthProvider.credentialFromError(error) ?? null,
    authDomain: FIREBASE_ENV_VARS.VITE_FIREBASE_AUTH_DOMAIN,
    apiKeyConfigured: Boolean(FIREBASE_ENV_VARS.VITE_FIREBASE_API_KEY),
    rawError: error,
    stack: error?.stack,
  });
};

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
  try {
    requireAuth();
    await setPersistence(auth, browserLocalPersistence);
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    logGoogleSignInError(error);
    throw error;
  }
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
  "auth/cancelled-popup-request": "A new sign-in request was started before the previous popup finished. Try again.",
  "auth/network-request-failed": "Network error. Please check your connection.",
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/operation-not-allowed": "This sign-in method is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.",
  "auth/requires-recent-login": "Please log in again before retrying.",
  "auth/unauthorized-domain": "This domain is not authorized for Firebase Authentication. Add it in Firebase Console → Authentication → Settings → Authorized domains.",
  "auth/account-exists-with-different-credential": "An account already exists with the same email but a different sign-in method. Sign in with the original method first.",
  "auth/credential-already-in-use": "This Google account is already linked to another sign-in method. Sign in with that method first.",
  "auth/invalid-oauth-client-id": "The OAuth client ID for this provider is not configured. Check the authDomain in your Firebase config.",
  "auth/invalid-oauth-provider": "The configured OAuth provider is not supported by this app.",
  "auth/redirect-cancelled-by-user": "Sign-in cancelled. Please try again.",
};

export const getFriendlyError = (error) => {
  return AUTH_ERRORS[error.code] || error?.message || error?.code || String(error);
};
