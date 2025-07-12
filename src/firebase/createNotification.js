import { db } from "./firebase-config";
import { collection, addDoc, Timestamp } from "firebase/firestore";

/**
 * Create a new notification in Firestore
 * 
 * @param {string} userId - UID of the user who will receive the notification
 * @param {string} message - Notification message to display
 * @param {string} link - URL to redirect user when they click the notification
 */
export const createNotification = async (userId, message, link) => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId: userId,
      message: message,
      link: link,
      isRead: false,
      createdAt: Timestamp.now()
    });
    console.log("✅ Notification created for user:", userId);
  } catch (error) {
    console.error("❌ Error creating notification:", error);
  }
};
