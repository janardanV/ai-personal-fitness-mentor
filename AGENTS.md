# AI Personal Fitness Mentor — Dev Notes

## Build & Dev Commands
- `npm run dev` — Start Vite dev server
- `npm run build` — Production build (verify before committing)
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint (if configured)
- `firebase deploy` — Deploy to Firebase

## Deployment / Env Vars
- Firebase is configured via `VITE_FIREBASE_*` env vars read in `src/firebase/firebase.js` (`VITE_FIREBASE_MEASUREMENT_ID` is optional/analytics-only).
- Missing vars fall back to a built-in config in `src/firebase/firebase.js` (config is public, not secret) so auth/Firestore still initialize; a console warning names the exact missing vars.
- See `DEPLOYMENT.md` for the full Vercel + Firebase Console setup checklist.

## Architecture
- **State:** Single reducer (`src/utils/reducer.js`) + `mkInitial()` for factory
- **Routing:** Flat page IDs mapped via `PAGES` in `src/utils/constants.js`; resolved in `App.jsx` via `PageComponent` lookup
- **Firestore:** Single `users/{uid}` document (migrate to subcollections in future). Offline persistence enabled via `initializeFirestore` with `persistentLocalCache`
- **Auth:** Firebase Auth + guest mode (local-only state when no user)
- **AI Coach:** Mock responses in `src/utils/aiCoach.js`; replace `callAIProvider` with real API call

## Utils (refactored from helpers.jsx)
| Module | Contents |
|--------|----------|
| `constants.js` | Exercise DB, PAGES, SIDEBAR_GROUPS, badges, colors, mock data |
| `formatting.js` | fmt, today, weekAgo, uid, formatChatTime, fmtPace, fmtDuration |
| `calculations.js` | calcE1RM, calcVolume, calcStreak, calcCalories, haversine |
| `usda.js` | USDA nutrition API search |
| `aiCoach.js` | useAICoach hook, generateMockResponse, renderMarkdown |
| `reducer.js` | Full app reducer + mkInitial |
| `styles.js` | G_STYLE (global CSS string) + GlobalStyles component |
| `toast.jsx` | showToast, showConfirm, Toast, ConfirmDialog |
| `helpers.jsx` | Re-exports everything from above (backward compat) |

## Completed Refactors
1. ✅ **helpers.jsx** → 8 smaller modules (backward-compat re-exports preserved)
2. ✅ **Deprecated firebase shims** — deleted 3 files (config.js, firestore.js, AuthContext.jsx)
3. ✅ **RunningMode.jsx** — removed 6 duplicated utility functions, now imports from `./utils/helpers`
4. ✅ **App.jsx sidebar** — extracted into reusable `<Sidebar>` component
5. ✅ **Error Boundaries** — `<ErrorBoundary>` wraps every page render
6. ✅ **Routing** — sub-routes (session, templates, library, history, prs) now resolve instead of 404
7. ✅ **Mobile** — sidebar collapses with overlay on small screens, hamburger menu
8. ✅ **Skeletons** — loading skeleton for data sync state
9. ✅ **Firestore rules** — read/create/update/delete distinction + field validation
10. ✅ **Firestore persistence** — offline cache enabled
11. ✅ **Input validation** — clamps on weight/reps/rpe in reducer, onboarding validation
12. ✅ **Code splitting** — React.lazy on 17 non-critical page/component imports

## Remaining Work (Future Iterations)
- Migrate to Firestore subcollections for scalability
- Implement real AI provider (replace mock)
- Add comprehensive unit/integration tests
- TypeScript migration
- PWA support (service worker, offline shell)
- Push notifications
- Google Fit / Health Connect integration
