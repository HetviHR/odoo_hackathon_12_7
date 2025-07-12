import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Your Firebase config file

function AskQuestion() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'questions'), {
        title,
        description,
        tags,
        createdAt: new Date(),
        // Add other fields like userId if using auth
      });
      navigate('/'); // Return to home after submission
    } catch (error) {
      console.error("Error adding question: ", error);
    }
  };

  return (
    <div className="ask-question-container">
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
          placeholder="What's your question?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        
        <div className="tags-input">
          {/* Your tags input logic here */}
        </div>
        
        <button type="submit">Submit Question</button>
      </form>
    </div>
  );
}