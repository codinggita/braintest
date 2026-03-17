import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StudentHome = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('/api/quizzes');
      setQuizzes(response.data);
    } catch (err) {
      setError('Failed to fetch quizzes');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="navbar">
        <span className="brand">Quiz App - Student</span>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ marginLeft: '20px' }}>Logout</button>
      </nav>
      <div className="container">
        <h2>Welcome, {user?.name}</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>Available Quizzes</p>
        {error && <div className="error">{error}</div>}
        
        {quizzes.length === 0 ? (
          <p>No quizzes available yet.</p>
        ) : (
          <div className="quiz-grid">
            {quizzes.map(quiz => (
              <div key={quiz._id} className="quiz-card">
                <h3>{quiz.title}</h3>
                <p className="topic">Topic: {quiz.topic}</p>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                  Created by: {quiz.createdBy?.name}
                </p>
                <Link to={`/quiz/${quiz._id}`} className="btn btn-primary">Take Quiz</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHome;
