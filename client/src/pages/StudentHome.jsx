import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { SkeletonQuizCard } from '../components/Skeleton';

const CATEGORY_ICONS = {
  'Science': '🔬',
  'Math': '📐',
  'History': '📜',
  'Geography': '🌍',
  'Literature': '📚',
  'Technology': '💻',
  'Art': '🎨',
  'Music': '🎵',
  'Sports': '⚽',
  'General': '📋'
};

const getCategoryFromTopic = (topic) => {
  const topicLower = topic.toLowerCase();
  for (const [category, keyword] of Object.entries({
    'Science': ['science', 'physics', 'chemistry', 'biology'],
    'Math': ['math', 'mathematics', 'algebra', 'geometry'],
    'History': ['history', 'historical'],
    'Geography': ['geography', 'geography'],
    'Literature': ['literature', 'english', 'reading'],
    'Technology': ['technology', 'tech', 'computer', 'coding'],
    'Art': ['art', 'design', 'creative'],
    'Music': ['music', 'song'],
    'Sports': ['sports', 'game', 'fitness']
  })) {
    if (keyword.some(k => topicLower.includes(k))) return category;
  }
  return 'General';
};

const StudentHome = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const categorizedQuizzes = quizzes.reduce((acc, quiz) => {
    const category = getCategoryFromTopic(quiz.topic);
    if (!acc[category]) acc[category] = [];
    acc[category].push(quiz);
    return acc;
  }, {});

  const categories = ['All', ...Object.keys(categorizedQuizzes).sort()];
  
  const filteredQuizzes = selectedCategory === 'All' 
    ? quizzes 
    : quizzes.filter(q => getCategoryFromTopic(q.topic) === selectedCategory);

  if (loading) {
    return (
      <div className="app-container">
        <nav className="navbar">
          <span className="brand">BrainTest</span>
          <div className="user-info">
            <span className="role-badge">Student</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-small">Logout</button>
          </div>
        </nav>
        <div className="container">
          <div className="quiz-grid">
            {[...Array(6)].map((_, i) => (
              <SkeletonQuizCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <motion.span 
          className="brand"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          BrainTest
        </motion.span>
        <div className="user-info">
          <span className="role-badge">Student</span>
          <button onClick={handleLogout} className="btn btn-secondary btn-small">Logout</button>
        </div>
      </nav>

      <div className="container">
        <motion.div 
          className="welcome-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Welcome, {user?.name}</h1>
          <p>Available Quizzes</p>
        </motion.div>

        {error && (
          <motion.div 
            className="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <motion.div 
          className="glass"
          style={{ padding: '16px', marginBottom: '24px', overflowX: 'auto' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div style={{ display: 'flex', gap: '12px', minWidth: 'max-content' }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  padding: '8px 16px',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}
              >
                {category === 'All' ? 'All' : `${CATEGORY_ICONS[category] || '📋'} ${category}`}
              </button>
            ))}
          </div>
        </motion.div>

        {quizzes.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No quizzes available yet.</p>
          </motion.div>
        ) : selectedCategory === 'All' ? (
          Object.entries(categorizedQuizzes).map(([category, categoryQuizzes], catIndex) => (
            <motion.div 
              key={category}
              className="category-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h3>{CATEGORY_ICONS[category] || '📋'} {category}</h3>
              <div className="quiz-grid">
                {categoryQuizzes.map((quiz, index) => (
                  <motion.div
                    key={quiz._id}
                    className="quiz-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: catIndex * 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3>{quiz.title}</h3>
                    <span className="topic">{quiz.topic}</span>
                    <p className="meta">Created by: {quiz.createdBy?.name}</p>
                    <Link to={`/quiz/${quiz._id}`} className="btn btn-primary">
                      Start Quiz →
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="quiz-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz._id}
                className="quiz-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>{quiz.title}</h3>
                <span className="topic">{quiz.topic}</span>
                <p className="meta">Created by: {quiz.createdBy?.name}</p>
                <Link to={`/quiz/${quiz._id}`} className="btn btn-primary">
                  Start Quiz →
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentHome;