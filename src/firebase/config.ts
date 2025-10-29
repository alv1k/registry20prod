// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";

// Configuration for the registry20prod Firebase project
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBixfn6-xKBrKEhwnWYslEurvGsFy_q71g",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "registry20prod.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "registry20prod",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "registry20prod.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "383152461828",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:383152461828:web:b4944e4b6d5fee22bbfd51",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-DD4B98567E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;