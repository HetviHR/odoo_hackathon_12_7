// src/firebase/firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase configuration from project settings
const firebaseConfig = {
  apiKey: "AIzaSyDCvHFIY4vh5pvXriMu6rsqUD54aXP14Bg",
  authDomain: "metaminds-9595.firebaseapp.com",
  projectId: "metaminds-9595",
  storageBucket: "metaminds-9595.firebasestorage.app",
  messagingSenderId: "579726583792",
  appId: "1:579726583792:web:c9386767f7118552299f35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);