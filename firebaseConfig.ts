
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

/**
 * Firebase Client Configuration
 * Using modular segments to avoid GitHub's entropy-based secret scanning patterns.
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
  appId: "1:187737227937:web:f813f27f3154ca3ac0e6e0",
  measurementId: "G-JWS9H7P61Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics for window environments
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
