import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration with env variables + reliable fallbacks for Vercel production
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAHlWtmwePkAWxn_GfFOiHJRgPCn_nojuw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "multigymdb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "multigymdb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "multigymdb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "701839418884",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:701839418884:web:ac339b36b00640c4e27751",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TPBVH6PP3F"
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