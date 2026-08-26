# SquadSee

A PWA for managing a youth soccer team — roster, schedule, attendance, and an
in-game drag-and-drop lineup/formation builder with per-player playing-time
tracking. Built with Vite + React + TypeScript + Firebase, deployed free on
GitHub Pages.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Firebase project values
npm run dev
```

Without a `.env.local`, the app shows a "Firebase isn't configured" screen
instead of the login page.

## One-time setup

1. **Firebase project** (free Spark plan): create a project at
   [console.firebase.google.com](https://console.firebase.google.com), enable
   **Firestore** and **Authentication → Email/Password**, then add yourself as
   the one user under Authentication → Users (no in-app sign-up screen exists
   on purpose).
2. Copy the web app config from Project settings → General → Your apps into
   `.env.local` (see `.env.example` for the variable names).
3. **Firestore security rules**: edit `firestore.rules`, replacing
   `PUT_YOUR_SINGLE_USER_UID_HERE` with your user's UID (from the Firebase
   console), then deploy with the [Firebase CLI](https://firebase.google.com/docs/cli):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules --project <your-project-id>
   ```
4. **GitHub Pages**: in the repo's Settings → Pages, set Source to
   "GitHub Actions". In Settings → Secrets and variables → Actions →
   Variables, add the same six `VITE_FIREBASE_*` values from `.env.local` —
   the deploy workflow (`.github/workflows/deploy.yml`) reads them at build
   time. Pushing to `main` then deploys automatically.

If the repo isn't named `squadsee`, update the `base` path in
`vite.config.ts` to match (`/<your-repo-name>/`).

## Regenerating icons

`scripts/generate-icons.mjs` rasterizes `scripts/icon-source.svg` into the
PWA icon set in `public/icons/`. It needs `sharp` (not a normal dependency,
since it's only used for this one-off task):

```bash
npm install -D sharp
node scripts/generate-icons.mjs
npm uninstall sharp
```

Swap in your own artwork by replacing `icon-source.svg` (or editing the
script to point at a PNG/JPG source) before running it.
# squadsee
