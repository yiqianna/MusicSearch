import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

let app;
let auth;
let googleProvider;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

export { app, auth, googleProvider };

/** Google popup sign-in; throws if Firebase is not configured. */
export async function signInWithGoogleAccount() {
  if (!auth || !googleProvider) {
    const err = new Error('Firebase is not configured.');
    err.code = 'auth/operation-not-allowed';
    throw err;
  }
  return signInWithPopup(auth, googleProvider);
}

/** Human-readable message for Firebase Auth errors (popup, email, etc.). */
export function authErrorMessage(err) {
  if (!err?.code) return err?.message || 'Something went wrong.';
  const map = {
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/popup-blocked': 'Popup was blocked. Allow popups for this site.',
    'auth/cancelled-popup-request': 'Only one sign-in window at a time.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/operation-not-allowed': 'This sign-in method is disabled in Firebase Console.',
  };
  return map[err.code] || err.message || 'Something went wrong.';
}
