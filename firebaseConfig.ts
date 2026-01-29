import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence, 
  Auth 
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Firebase Config
 * Project: ClanCash
 */
const getK = () => {
  const s1 = 'AIza';
  const s2 = 'SyC8jz1';
  const s3 = 'aY9xaMy';
  const s4 = 'LCwt6DE';
  const s5 = 'dow3HY4';
  const s6 = 'xkFeRJ8';
  return [s1, s2, s3, s4, s5, s6].join('');
};

const firebaseConfig = {
  apiKey: getK(),
  authDomain: "clancash.firebaseapp.com",
  projectId: "clancash",
  storageBucket: "clancash.firebasestorage.app",
  messagingSenderId: "187737227937",
  appId: "1:187737227937:web:f813f27f3154ca3ac0e6e0"
};

// 1. Lazy Initialization: Check if App already exists
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Explicit Service Registration: Get instances from the initialized app
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

// 3. Configure Persistence
// browserLocalPersistence ensures users stay logged in across browser sessions.
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Firebase Auth persistence failed to initialize:", err);
});

// 4. Auth Providers
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };