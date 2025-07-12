import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore";

const NotificationBell = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [userId]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const markAsRead = async (notifId) => {
    const notifRef = doc(db, "notifications", notifId);
    await updateDoc(notifRef, { isRead: true });
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    const batchUpdates = unread.map((n) =>
      updateDoc(doc(db, "notifications", n.id), { isRead: true })
    );
    await Promise.all(batchUpdates);
  };

  const clearAllNotifications = async () => {
    const deletes = notifications.map((n) =>
      deleteDoc(doc(db, "notifications", n.id))
    );
    await Promise.all(deletes);
    setIsOpen(false);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    window.location.href = notif.link; // Redirect to link
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayedNotifications = showOnlyUnread
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="relative">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border z-50">
          <div className="p-3 flex justify-between items-center border-b">
            <h3 className="font-semibold text-gray-700">Notifications</h3>
            <button
              onClick={clearAllNotifications}
              className="text-red-500 text-sm hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="p-2 flex justify-between items-center border-b">
            <button
              onClick={markAllAsRead}
              className="text-blue-500 text-sm hover:underline"
            >
              Mark all as read
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showOnlyUnread}
                onChange={() => setShowOnlyUnread(!showOnlyUnread)}
              />
              Show only unread
            </label>
          </div>

          {displayedNotifications.length === 0 ? (
            <div className="p-3 text-gray-500 text-center">
              {showOnlyUnread
                ? "No unread notifications"
                : "No notifications"}
            </div>
          ) : (
            <ul>
              {displayedNotifications.map((notif) => (
                <li
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 cursor-pointer hover:bg-gray-100 ${
                    notif.isRead ? "text-gray-500" : "text-black font-medium"
                  }`}
                >
                  {notif.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
