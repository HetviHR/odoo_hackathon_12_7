// src/firebase/auth-service.js
import { auth } from './firebase-config';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

// Create new user
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Login existing user
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Logout user
export const logoutUser = () => {
  return signOut(auth);
};

// Track user authentication state
export const setupAuthListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};