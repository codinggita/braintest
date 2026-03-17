import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

const EditQuiz = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [loading, setLoading] = useState(true);
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

    const validQuestions = questions.filter(q => 
      q.questionText && q.options.every(o => o) && q.correctAnswer
    );

    if (!title || !topic) {
      setError('Please fill in quiz title and topic');
      return;
    }

    if (validQuestions.length === 0) {
      setError('Please add at least one question');
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
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div>
      <nav className="navbar">
        <span className="brand">Quiz App</span>
        <Link to="/dashboard">Back to Dashboard</Link>
      </nav>
      <div className="container">
        <h2>Edit Quiz</h2>
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="card">
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
          </div>

          <h3>Questions</h3>
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="card">
              <div className="form-group">
                <label>Question {qIndex + 1}</label>
                <textarea
                  value={question.questionText}
                  onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                  placeholder="Enter question text"
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label>Options</label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} style={{ marginBottom: '5px' }}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      style={{ marginBottom: '5px' }}
                    />
                  </div>
                ))}
              </div>
              <div className="form-group">
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
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(qIndex)} className="btn btn-danger">
                  Remove Question
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addQuestion} className="btn btn-secondary" style={{ marginRight: '10px' }}>
            Add Another Question
          </button>
          <button type="submit" className="btn btn-success">
            Update Quiz
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditQuiz;
