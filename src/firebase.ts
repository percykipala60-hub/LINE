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
  User 
} from 'firebase/auth';

const firebaseConfig = {
  projectId: "ai-studio-applet-webapp-9d5ef",
  appId: "1:825854459717:web:703c421de9fbaacd06482c",
  apiKey: "AIzaSyCCYOkkunHK3ZHsTfPo4aCasUYGdaQPamE",
  authDomain: "ai-studio-applet-webapp-9d5ef.firebaseapp.com",
  storageBucket: "ai-studio-applet-webapp-9d5ef.firebasestorage.app",
  messagingSenderId: "825854459717",
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
  onAuthStateChanged 
};
export type { User };
