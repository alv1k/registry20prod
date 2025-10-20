// src/firebase/config.ts
import { initializeApp } from 'firebase/app';

// Типичная конфигурация Firebase (вам нужно будет заменить на реальные значения из вашего Firebase проекта)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyCVZgK1HkNPpF5k7nf6HF8iNa4pUyQvIc8',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'registry2.0-7eefa.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'registry2.0-7eefa',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'registry2.0-7eefa.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '881524933981',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:881524933981:web:d0a94f10972845948894b4'
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

export default app;