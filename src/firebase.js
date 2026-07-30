import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration with env variables + reliable fallbacks for Vercel production
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB-9URBLBLsmO6qzxRVMy7gac-I1URji2s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "thegroceryhub-7113c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "thegroceryhub-7113c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "thegroceryhub-7113c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "677288573686",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:677288573686:web:a8e615b15c4d33b177cad7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DS3C28481W"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore Database & Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

// Safely initialize Analytics if supported in browser environment
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("Analytics not supported in this environment:", err);
  });
}