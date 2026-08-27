import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// True once real Firebase project values are present (.env.local locally, or
// the repo's Actions variables in a deploy). When false, App.tsx renders a
// setup screen instead of mounting anything that touches Firebase, since
// initializeApp/getAuth throw synchronously on bad/missing config and would
// otherwise crash to a blank white screen with no clue why.
export const firebaseConfigured = Boolean(firebaseConfig.apiKey)

const app = firebaseConfigured ? initializeApp(firebaseConfig) : undefined

export const auth = app ? getAuth(app) : undefined

// Persistent local cache + multi-tab manager gives us offline reads/writes
// and realtime cross-device sync once connectivity returns, with no extra code.
export const db = app
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      // Optional player/game fields (phone, notes, etc.) are written as
      // `undefined` when left blank; Firestore rejects `undefined` field
      // values unless this is set, which silently failed every write.
      ignoreUndefinedProperties: true,
    })
  : undefined
