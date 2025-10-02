import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, UserCredential } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDdvek8oC5JG7CfC5QIeLBJsUv__7_x46M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "auditready-database.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "auditready-database",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "auditready-database.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "455678411065",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:455678411065:web:8f824621de4dda2b83e8e8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-X458N36X80"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Demo credentials for login purposes (marketing/demo use only)
export const DEMO_EMAIL = "demo@auditready.com";
export const DEMO_PASSWORD = "AuditReady@Demo2025!";

// REMOVED: Admin email constants (use database roles instead) 