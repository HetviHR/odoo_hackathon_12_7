// src/pages/HomePage.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function HomePage() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to StackIt</h1>
      
      {currentUser ? (
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-green-800">
            You're logged in as: <strong>{currentUser.email}</strong>
          </p>
        </div>
      ) : (
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p className="text-yellow-800">
            You're not logged in. Please login or register.
          </p>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Q&A Platform Features</h2>
        <ul className="list-disc pl-5">
          <li>Ask questions with rich text formatting</li>
          <li>Answer questions and get voted</li>
          <li>Receive notifications for activity</li>
          <li>Tag questions for better organization</li>
        </ul>
      </div>
    </div>
  );
}

export default HomePage;