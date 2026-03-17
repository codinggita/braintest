import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingScreen } from '../components/Skeleton';

const QUESTION_TIME = 60;

const TakeQuiz = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`/api/quizzes/${id}`);
      setQuiz(response.data.quiz);
      setQuestions(response.data.questions);
      setTimeLeft(QUESTION_TIME * response.data.questions.length);
      setLoading(false);
    } catch (err) {
      setError('Failed to load quiz');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(QUESTION_TIME);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setTimeLeft(QUESTION_TIME);
    }
  };

  const handleSubmit = async () => {
    try {
      const formattedAnswers = questions.map((_, index) => answers[index] || '');
      const response = await axios.post(`/api/submissions/${id}/submit`, {
        answers: formattedAnswers
      });
      navigate(`/quiz/${id}/results`, { 
        state: { 
          score: response.data.score, 
          totalQuestions: response.data.totalQuestions 
        } 
      });
    } catch (err) {
      setError('Failed to submit quiz');
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;
  const isWarning = timeLeft <= 30;
  const totalTimeRemaining = timeLeft + (questions.length - currentQuestion - 1) * QUESTION_TIME;

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="app-container">
        <nav className="navbar">
          <span className="brand">BrainTest</span>
          <Link to="/home" style={{ color: 'white' }}>Back to Home</Link>
        </nav>
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="app-container">
      <nav className="navbar">
        <motion.span 
          className="brand"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {quiz?.title}
        </motion.span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className={`timer ${isWarning ? 'warning' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            {Math.floor(totalTimeRemaining / 60)}:{(totalTimeRemaining % 60).toString().padStart(2, '0')}
          </div>
          <Link to="/home" style={{ color: 'var(--text-secondary)' }}>Exit</Link>
        </div>
      </nav>

      <div className="container">
        <motion.div 
          className="glass"
          style={{ padding: '24px', marginBottom: '24px' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span style={{ color: 'var(--electric-blue-light)', fontWeight: '600' }}>
              {answeredCount} / {questions.length} answered
            </span>
          </div>
          <div className="progress-bar" style={{ height: '12px' }}>
            <motion.div 
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion}
            className="question"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h3>{currentQ.questionText}</h3>
            <div className="options">
              {currentQ.options.map((option, index) => (
                <motion.div
                  key={index}
                  className={`option ${answers[currentQuestion] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(option)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: answers[currentQuestion] === option ? 'var(--electric-blue)' : 'var(--glass-border)',
                    marginRight: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <button 
            onClick={handlePrev} 
            disabled={currentQuestion === 0}
            className="btn btn-secondary"
          >
            ← Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button 
              onClick={() => setShowSubmitModal(true)}
              disabled={answeredCount !== questions.length}
              className="btn btn-success"
            >
              Submit Quiz ({answeredCount}/{questions.length})
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="btn btn-primary"
            >
              Next →
            </button>
          )}
        </div>

        <div className="question-nav">
          {questions.map((_, index) => (
            <motion.div
              key={index}
              className={`question-dot ${answers[index] ? 'answered' : ''} ${index === currentQuestion ? 'current' : ''}`}
              onClick={() => {
                setCurrentQuestion(index);
                setTimeLeft(QUESTION_TIME);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {index + 1}
            </motion.div>
          ))}
        </div>

        {showSubmitModal && (
          <motion.div 
            className="glass"
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.9)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="glass"
              style={{ padding: '40px', maxWidth: '400px', textAlign: 'center' }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <h3 style={{ marginBottom: '16px' }}>Submit Quiz?</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                You have answered {answeredCount} of {questions.length} questions.
                {answeredCount < questions.length && ' Unanswered questions will be marked as incorrect.'}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  onClick={() => setShowSubmitModal(false)}
                  className="btn btn-secondary"
                >
                  Continue Quiz
                </button>
                <button 
                  onClick={handleSubmit}
                  className="btn btn-success"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;