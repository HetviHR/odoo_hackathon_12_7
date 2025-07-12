// src/context/AuthContext.js
import React, { createContext, useEffect, useState } from "react";
import { setupAuthListener } from "../firebase/auth-service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = setupAuthListener(user => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    return unsubscribe; // Cleanup on unmount
  }, []);

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};