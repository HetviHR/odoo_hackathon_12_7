import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import './App.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCvHFIY4vh5pvXriMu6rsqUD54aXP14Bg",
  authDomain: "http://metaminds-9595.firebaseapp.com/",
  projectId: "metaminds-9595",
  storageBucket: "http://metaminds-9595.firebasestorage.app/",
  messagingSenderId: "579726583792",
  appId: "1:579726583792:web:c9386767f7118552299f35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Color palette for badges/arrows
const badgeColors = [
  { bg: "#b4a7f5", arrow: "#b4a7f5", color: "#4b2997" },
  { bg: "#f7b2d9", arrow: "#f7b2d9", color: "#a12c6e" },
  { bg: "#d4f7b2", arrow: "#d4f7b2", color: "#1b7a3a" },
  { bg: "#f7b2b2", arrow: "#f7b2b2", color: "#a12c2c" },
  { bg: "#f7e6b2", arrow: "#f7e6b2", color: "#a17c2c" },
  { bg: "#b2eaf7", arrow: "#b2eaf7", color: "#2c7ca1" },
  { bg: "#eaf7b2", arrow: "#eaf7b2", color: "#7ca12c" },
];

function getBadgeColor(userName) {
  if (!userName) return badgeColors[0];
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return badgeColors[Math.abs(hash) % badgeColors.length];
}

function HomePage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Newest');
  const [page, setPage] = useState(1);
  const perPage = 3;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'questions'));
        const questionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuestions(questionsData);
      } catch (err) {
        setError('Failed to load questions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();

    return unsubscribe;
  }, []);

  const filteredQuestions = questions.filter(q => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (q.title || '').toLowerCase().includes(searchLower) ||
      (q.description || '').toLowerCase().includes(searchLower) ||
      (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  });

  const paginatedQuestions = filteredQuestions.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / perPage));

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="sketch-bg">
      <div className="main-container">
        <header className="sketch-header">
          <div className="sketch-logo">StackIt</div>
          {user ? (
            <button className="sketch-login" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className="sketch-login" onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </header>
        
        <div className="sketch-toolbar">
          <button 
            className="sketch-ask-btn"
            onClick={() => navigate('/ask')}
          >
            Ask New question
          </button>
          
          <div className="sketch-filters">
            <button
              className={`sketch-filter-btn${filter === 'Newest' ? ' active' : ''}`}
              onClick={() => setFilter('Newest')}
            >Newest</button>
            <button
              className={`sketch-filter-btn${filter === 'Unanswered' ? ' active' : ''}`}
              onClick={() => setFilter('Unanswered')}
            >Unanswered</button>
            <button className="sketch-filter-btn more">
              more <span style={{fontSize: '1.1em', marginLeft: '2px'}}>▼</span>
            </button>
          </div>
          
          <div className="sketch-searchbar">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <span className="search-icon" role="img" aria-label="search">🔍</span>
          </div>
        </div>

        <div className="questions-list">
          {loading ? (
            <div className="loading">Loading questions...</div>
          ) : error ? (
            <div className="error">Error: {error}</div>
          ) : paginatedQuestions.length > 0 ? (
            paginatedQuestions.map((question, idx) => {
              const badgeName = question.userBadge || question.userName || `User ${idx + 1}`;
              const badgeColor = getBadgeColor(badgeName);
              return (
                <div 
                  key={question.id} 
                  className="question-card"
                  onClick={() => navigate(`/questions/${question.id}`)}
                >
                  <div className="question-main">
                    <div className="question-title">{question.title || "Question....."}</div>
                    <div className="question-desc">{question.description || "Descriptions...."}</div>
                    <div className="question-tags">
                      {(question.tags && question.tags.length > 0 ? question.tags : ["Tags"]).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                    <div className="question-user">
                      <span
                        className="user-badge"
                        style={{
                          background: badgeColor.bg,
                          color: badgeColor.color
                        }}
                      >
                        <span className="badge-arrow" style={{ borderRightColor: badgeColor.arrow }}></span>
                        {badgeName}
                      </span>
                    </div>
                  </div>
                  <div className="question-answers">
                    <span>{question.answerCount || 0} ans</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results">
              {searchTerm ? 'No matching questions found' : 'No questions available'}
            </div>
          )}
        </div>

        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`page-btn${page === i + 1 ? ' active' : ''}`}
              onClick={() => setPage(i + 1)}
            >{i + 1}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AskQuestion() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const navigate = useNavigate();
  const [user] = useState(auth.currentUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to ask a question');
      return;
    }

    try {
      await addDoc(collection(db, 'questions'), {
        title,
        description,
        tags,
        userId: user.uid,
        userName: user.displayName || user.email,
        createdAt: new Date(),
      });
      navigate('/');
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  return (
    <div className="main-container">
      <h2>Ask a Question</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Detailed description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="tag-input">
          <input
            type="text"
            placeholder="Add tags (press Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
          <div className="tags-preview">
            {tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>
        <button type="submit">Submit Question</button>
      </form>
    </div>
  );
}

function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const navigate = useNavigate();
  const [user] = useState(auth.currentUser);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'questions', id));
        if (docSnap.exists()) {
          setQuestion(docSnap.data());
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching question:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id, navigate]);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to post an answer');
      return;
    }

    try {
      await addDoc(collection(db, 'answers'), {
        questionId: id,
        content: newAnswer,
        userId: user.uid,
        userName: user.displayName || user.email,
        createdAt: new Date(),
      });
      setNewAnswer('');
    } catch (error) {
      console.error('Error adding answer:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!question) return <div className="error">Question not found</div>;

  return (
    <div className="main-container">
      <h1>{question.title}</h1>
      <div className="question-body">
        <p>{question.description}</p>
        <div className="question-tags">
          {question.tags?.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      <div className="answers-section">
        <h2>Answers</h2>
        {answers.length > 0 ? (
          answers.map((answer) => (
            <div key={answer.id} className="answer-card">
              <p>{answer.content}</p>
              <div className="answer-user">
                <span className="user-badge">
                  {answer.userName}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p>No answers yet. Be the first to answer!</p>
        )}

        <form onSubmit={handleAnswerSubmit} className="answer-form">
          <h3>Your Answer</h3>
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            required
          />
          <button type="submit">Post Answer</button>
        </form>
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
}

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ask" element={<AskQuestion />} />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;