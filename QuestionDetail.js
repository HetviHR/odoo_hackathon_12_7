import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  increment,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import './App.css';

function QuestionDetail() {
  const { id: questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const currentUser = auth.currentUser;

  // Fetch question and answers
  useEffect(() => {
    const fetchQuestionAndAnswers = async () => {
      try {
        // Fetch question
        const questionRef = doc(db, 'questions', questionId);
        const questionDoc = await getDoc(questionRef);
        
        if (!questionDoc.exists()) {
          throw new Error('Question not found');
        }
        
        setQuestion({ 
          id: questionDoc.id, 
          ...questionDoc.data(),
          createdAt: questionDoc.data().createdAt?.toDate()
        });

        // Set up real-time answers listener
        const answersRef = collection(db, 'questions', questionId, 'answers');
        const answersQuery = query(answersRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(answersQuery, (snapshot) => {
          const answersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
          }));
          setAnswers(answersData);
        });

        return unsubscribe;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionAndAnswers();
  }, [questionId]);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please login to post an answer');
      return;
    }

    if (!answerText.trim() || answerText.trim().length < 30) {
      alert('Please enter an answer (minimum 30 characters)');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');

    try {
      // 1. Add answer to subcollection
      const answersRef = collection(db, 'questions', questionId, 'answers');
      await addDoc(answersRef, {
        content: answerText,
        author: currentUser.email,
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0
      });

      // 2. Update answer count in question document
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        answerCount: increment(1)
      });

      // 3. Show success message
      setSuccessMessage('Your answer has been posted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // 4. Clear form
      setAnswerText('');
    } catch (error) {
      console.error('Submission error:', error);
      setError('Failed to post answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading question...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!question) return <div className="error">Question not found</div>;

  return (
    <div className="question-detail">
      <h1>{question.title}</h1>
      
      <div className="question-body">
        <p>{question.description}</p>
        <div className="tags">
          {question.tags?.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        <div className="question-meta">
          <span>Asked by: {question.author || 'Anonymous'}</span>
          <span>{question.createdAt?.toLocaleDateString() || 'Unknown date'}</span>
          <span>{question.answerCount || 0} answers</span>
        </div>
      </div>

      <div className="answers-section">
        <h2>{answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}</h2>
        
        {answers.length > 0 ? (
          answers.map(answer => (
            <div key={answer.id} className="answer-card">
              <div className="answer-content">
                <p>{answer.content}</p>
              </div>
              <div className="answer-meta">
                <span>Answered by: {answer.author}</span>
                <span>{answer.createdAt?.toLocaleString() || 'Unknown date'}</span>
              </div>
            </div>
          ))
        ) : (
          <p>No answers yet. Be the first to answer!</p>
        )}
      </div>

      <form onSubmit={handleAnswerSubmit} className="answer-form">
        <h3>Your Answer</h3>
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="Write your answer here (minimum 30 characters)..."
          required
          minLength={30}
          disabled={isSubmitting}
        />
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting || !answerText.trim() || answerText.trim().length < 30}
        >
          {isSubmitting ? 'Posting...' : 'Post Answer'}
        </button>
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </form>
    </div>
  );
}

export default QuestionDetail;