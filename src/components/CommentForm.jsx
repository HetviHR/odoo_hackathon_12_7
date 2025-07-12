import React, { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc
} from "firebase/firestore";
import { createNotification } from "../firebase/createNotification";

const CommentForm = ({ answerId, questionId, currentUser }) => {
  const [commentContent, setCommentContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      setLoading(true);

      // ✅ Save comment in Firestore (subcollection under answer)
      await addDoc(
        collection(db, "answers", answerId, "comments"),
        {
          content: commentContent,
          authorId: currentUser.uid,
          authorName: currentUser.displayName,
          createdAt: Timestamp.now()
        }
      );

      // ✅ Fetch answer owner's UID
      const answerDoc = await getDoc(doc(db, "answers", answerId));
      if (answerDoc.exists()) {
        const answerOwnerId = answerDoc.data().authorId;

        // ✅ Send notification to answer owner
        if (answerOwnerId !== currentUser.uid) {
          await createNotification(
            answerOwnerId,
            `${currentUser.displayName} commented on your answer!`,
            `/questions/${questionId}`
          );
        }
      }

      setCommentContent(""); // Clear input
      alert("Comment submitted successfully ✅");
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
      <textarea
        className="border rounded p-2"
        placeholder="Add a comment..."
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        disabled={loading}
      ></textarea>
      <button
        type="submit"
        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
};

export default CommentForm;
