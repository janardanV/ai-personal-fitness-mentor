import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

export const FIREBASE_ENV_VARS = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const getMissingFirebaseEnvVars = () =>
  Object.entries(FIREBASE_ENV_VARS)
    .filter(([, value]) => !value || !String(value).trim())
    .map(([name]) => name);

const ENV_CONFIG = {
  apiKey: FIREBASE_ENV_VARS.VITE_FIREBASE_API_KEY,
  authDomain: FIREBASE_ENV_VARS.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_ENV_VARS.VITE_FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_ENV_VARS.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_ENV_VARS.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_ENV_VARS.VITE_FIREBASE_APP_ID,
};

const FALLBACK_CONFIG = {
  apiKey: "AIzaSyDgddbTV570ArAVqozKgGycZQJ0bScc6u8",
  authDomain: "ai-personal-fitness-mentor.firebaseapp.com",
  projectId: "ai-personal-fitness-mentor",
  storageBucket: "ai-personal-fitness-mentor.firebasestorage.app",
  messagingSenderId: "232849392802",
  appId: "1:232849392802:web:0bb6aa0b6fe0bdff12c3fb",
};

const firebaseConfig = {
  apiKey: ENV_CONFIG.apiKey || FALLBACK_CONFIG.apiKey,
  authDomain: ENV_CONFIG.authDomain || FALLBACK_CONFIG.authDomain,
  projectId: ENV_CONFIG.projectId || FALLBACK_CONFIG.projectId,
  storageBucket: ENV_CONFIG.storageBucket || FALLBACK_CONFIG.storageBucket,
  messagingSenderId: ENV_CONFIG.messagingSenderId || FALLBACK_CONFIG.messagingSenderId,
  appId: ENV_CONFIG.appId || FALLBACK_CONFIG.appId,
};

const missingVars = getMissingFirebaseEnvVars();

if (missingVars.length > 0) {
  console.warn(
    `Firebase config: missing VITE_FIREBASE_* env var(s) (${missingVars.join(", ")}); ` +
      `using built-in fallback config. Set them in your local .env and Vercel Environment Variables to override.`
  );
}

export const FIREBASE_CONFIG_ERROR = null;

let app = null;
let auth = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
} catch (err) {
  console.error("Firebase initialization failed:", err);
}

export { auth, db, app };
