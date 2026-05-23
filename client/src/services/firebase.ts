import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if we should use mock services
export const isMockFirebase =
  import.meta.env.VITE_USE_MOCK_FIREBASE === 'true' ||
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key';

let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

if (!isMockFirebase) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    // ── Auth: persist token locally so re-auth is instant on reload ──────
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    // ── Firestore: enable offline persistent cache for speed ──────────────
    // Documents already fetched are served from disk instantly; only diffs
    // are fetched from the network. This makes the app FAST on repeat visits.
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      }),
    });

    storage  = getStorage(app);

    // ── Analytics: only load in browser environments ──────────────────────
    isSupported().then(yes => {
      if (yes) {
        analytics = getAnalytics(app);
        console.log('📊 Firebase Analytics enabled');
      }
    });

    console.log('🔥 Firebase Initialized (LIVE mode — offline cache ON)');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
  }
} else {
  console.log('🎮 Running in MOCK mode (offline simulations)');
}

export { auth, db, storage, analytics };
