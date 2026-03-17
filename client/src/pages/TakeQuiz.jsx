import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const TakeQuiz = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`/api/quizzes/${id}`);
      setQuiz(response.data.quiz);
      setQuestions(response.data.questions);
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
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
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

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (error) {
    return <div className="container"><div className="error">{error}</div></div>;
  }

  const currentQ = questions[currentQuestion];

  return (
    <div>
      <nav className="navbar">
        <span className="brand">{quiz?.title}</span>
        <Link to="/home" style={{ color: 'white' }}>Back to Home</Link>
      </nav>
      <div className="container">
        <div style={{ marginBottom: '20px' }}>
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#ddd', 
            borderRadius: '4px',
            marginTop: '10px' 
          }}>
            <div style={{ 
              width: `${((currentQuestion + 1) / questions.length) * 100}%`, 
              height: '100%', 
              backgroundColor: '#3498db',
              borderRadius: '4px',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        <div className="question">
          <h3>{currentQ.questionText}</h3>
          <div className="options">
            {currentQ.options.map((option, index) => (
              <div
                key={index}
                className={`option ${answers[currentQuestion] === option ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button 
            onClick={handlePrev} 
            disabled={currentQuestion === 0}
            className="btn btn-secondary"
          >
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button 
              onClick={handleSubmit} 
              disabled={Object.keys(answers).length !== questions.length}
              className="btn btn-success"
            >
              Submit Quiz
            </button>
          ) : (
            <button 
              onClick={handleNext} 
              className="btn btn-primary"
            >
              Next
            </button>
          )}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {questions.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentQuestion(index)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: answers[index] ? '#27ae60' : (index === currentQuestion ? '#3498db' : '#ddd'),
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
