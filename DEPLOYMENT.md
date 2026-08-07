# Deployment Guide (Vercel) — AI Fitness Mentor

## 1. Required environment variables

Vite inlines `VITE_*` variables **at build time**. If a variable is missing when
the production build runs, the app falls back to guest mode and shows:

> "Firebase is not configured. Missing environment variable(s): VITE_FIREBASE_... "

### All required variables

| Variable | Required | Source |
|----------|----------|--------|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase Console → Project Settings → General → Your apps → Web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Same web app config |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Same web app config |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Same web app config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Same web app config |
| `VITE_FIREBASE_APP_ID` | ✅ | Same web app config |
| `VITE_FIREBASE_MEASUREMENT_ID` | ⭕ Optional | Not read by the app code. Only add if you wire up Firebase Analytics. |
| `VITE_ANTHROPIC_API_KEY` | ⭕ Optional | Enables real AI Coach (mock used otherwise). |
| `VITE_USDA_API_KEY` | ⭕ Optional | Enables USDA nutrition lookups (`DEMO_KEY` used otherwise). |

These match the code exactly — see `src/firebase/firebase.js`:

```js
apiKey:             import.meta.env.VITE_FIREBASE_API_KEY,
authDomain:         import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
projectId:          import.meta.env.VITE_FIREBASE_PROJECT_ID,
storageBucket:      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
messagingSenderId:  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
appId:              import.meta.env.VITE_FIREBASE_APP_ID,
```

## 2. Add the variables to Vercel

1. Open your project on https://vercel.com.
2. Go to **Settings → Environment Variables**.
3. Add the **6 required** Firebase variables (Production / Preview / Development):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Paste the exact values from Firebase Console → Project Settings → Your apps → **Config**.
5. Redeploy: **Deployments → ⋯ → Redeploy** (or push to the connected branch).

> Values are read at build time, so a redeploy is required after adding them.
> The variables are **not** baked into the repo — `.env` is gitignored and never deployed.

## 3. Firebase Console settings to verify

### 3a. Enable Google Sign-In
- **Authentication → Sign-in method → Google** → enable.
- Also keep **Email/Password** enabled (used by Login/Signup forms).

### 3b. Authorized domains
- **Authentication → Settings → Authorized domains** must include:
  - `localhost` (and `127.0.0.1` if you visit it directly)
  - Your Vercel domain: `your-project.vercel.app`
  - Any custom domain you've attached to the Vercel deployment.

### 3c. Firestore
- Create a Firestore database (`ai-personal-fitness-mentor`) if not already present.
- `firestore.rules` must allow read/write for authenticated users (`uid == request.auth.uid`).

## 4. Google Sign-In

The app uses `signInWithPopup` with `GoogleAuthProvider` and
`browserLocalPersistence` (see `src/firebase/auth.js`). It only fails in
production when either:
1. Firebase is unconfigured (missing env vars — fix in section 2), or
2. The current domain is not in **Authorized domains** (section 3b).

## 5. Local development

```bash
# 1. Copy the example and fill in your Firebase values
cp .env.example .env

# 2. Run
npm install
npm run dev
```

If a variable is missing, the error now names it exactly, e.g.:

> Firebase is not configured. Missing environment variable(s): VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID. Set them in your local .env file and in your Vercel project's Environment Variables before deploying.

## 6. Troubleshooting

| Symptom | Fix |
|---------|-----|
| "Firebase is not configured. Missing environment variable(s): …" | Add the named vars to Vercel and redeploy. |
| Google pop-up opens then closes immediately | Domain not in Authorized domains. |
| `auth/popup-blocked` | Allow pop-ups for the site. |
| `auth/operation-not-allowed` | Google provider not enabled in Firebase Console. |
| Firestore reads fail for signed-in users | Check `firestore.rules` allow `uid == request.auth.uid`. |
