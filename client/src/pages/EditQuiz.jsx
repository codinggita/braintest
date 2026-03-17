import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LoadingScreen } from '../components/Skeleton';

const EditQuiz = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`/api/quizzes/${id}`);
      const { quiz, questions: quizQuestions } = response.data;
      setTitle(quiz.title);
      setTopic(quiz.topic);
      if (quizQuestions.length > 0) {
        setQuestions(quizQuestions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer
        })));
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load quiz');
      setLoading(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const validQuestions = questions.filter(q => 
      q.questionText && q.options.every(o => o) && q.correctAnswer
    );

    if (!title || !topic) {
      setError('Please fill in quiz title and topic');
      setSaving(false);
      return;
    }

    if (validQuestions.length === 0) {
      setError('Please add at least one question');
      setSaving(false);
      return;
    }

    try {
      await axios.put(`/api/quizzes/${id}`, {
        title,
        topic,
        questions: validQuestions
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

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
        <Link to="/dashboard">Back to Dashboard</Link>
      </nav>

      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 style={{ marginBottom: '24px' }}>Edit Quiz</h2>
          
          {error && (
            <motion.div 
              className="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginBottom: '20px' }}
            >
              {error}
            </motion.div>
          )}
        </motion.div>
        
        <form onSubmit={handleSubmit}>
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="form-group">
              <label>Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div className="form-group">
              <label>Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter topic"
                required
              />
            </div>
          </motion.div>

          <h3 style={{ margin: '24px 0 16px' }}>Questions</h3>
          {questions.map((question, qIndex) => (
            <motion.div 
              key={qIndex}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * qIndex }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: 'var(--electric-blue)', fontWeight: '600' }}>Question {qIndex + 1}</span>
                {questions.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeQuestion(qIndex)} 
                    className="btn btn-danger btn-small"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-group">
                <label>Question Text</label>
                <textarea
                  value={question.questionText}
                  onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                  placeholder="Enter question text"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label>Options</label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--glass-border)',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {String.fromCharCode(65 + oIndex)}
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Correct Answer</label>
                <select
                  value={question.correctAnswer}
                  onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                >
                  <option value="">Select correct answer</option>
                  {question.options.map((option, oIndex) => (
                    option && <option key={oIndex} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          ))}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={addQuestion} 
              className="btn btn-secondary"
            >
              + Add Question
            </button>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuiz;