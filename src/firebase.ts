import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  type User,
  type ConfirmationResult
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBPg2wWQvHb5c4yF-tjfcIfK-UKW1jdy_I",
  authDomain: "line-store-c7053.firebaseapp.com",
  projectId: "line-store-c7053",
  storageBucket: "line-store-c7053.firebasestorage.app",
  messagingSenderId: "714314118419",
  appId: "1:714314118419:web:88be651d37a755a2b316e6",
  measurementId: "G-L7ES5Q2ZCD"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail
};
export type { User, ConfirmationResult };
