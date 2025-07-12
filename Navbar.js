import React from "react";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex justify-between items-center px-4 py-2 bg-gray-200 shadow">
      <h1 className="text-xl font-bold">StackIt</h1>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Show NotificationBell if user is logged in */}
            <NotificationBell userId={user.uid} />
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <p className="text-gray-600">Not logged in</p>
        )}
      </div>
    </header>
  );
};

export default Navbar;