import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC6wNjuJuoHFb3LKXLGkWTi5rtjUjNSTok",
  authDomain: "gen-lang-client-0067732188.firebaseapp.com",
  projectId: "gen-lang-client-0067732188",
  storageBucket: "gen-lang-client-0067732188.firebasestorage.app",
  messagingSenderId: "8667404059",
  appId: "1:8667404059:web:3bf2d3037ad625959665be"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Always use the specific provisioned Firestore database ID
export const db = getFirestore(app, "ai-studio-gofashionhome-7c0fd4bf-b0c4-4c60-ae55-231f1c902229");

export {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
};
