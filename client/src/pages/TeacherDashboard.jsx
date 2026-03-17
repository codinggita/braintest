import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TeacherDashboard = () => {
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
      const teacherQuizzes = response.data.filter(q => q.createdBy._id === user._id);
      setQuizzes(teacherQuizzes);
    } catch (err) {
      setError('Failed to fetch quizzes');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await axios.delete(`/api/quizzes/${id}`);
        fetchQuizzes();
      } catch (err) {
        setError('Failed to delete quiz');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="navbar">
        <span className="brand">Quiz App - Teacher</span>
        <div>
          <Link to="/quiz/create">Create Quiz</Link>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ marginLeft: '20px' }}>Logout</button>
        </div>
      </nav>
      <div className="container">
        <h2>Welcome, {user?.name}</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>Teacher Dashboard</p>
        {error && <div className="error">{error}</div>}
        
        <div className="card">
          <h3>My Quizzes</h3>
          {quizzes.length === 0 ? (
            <p>No quizzes yet. <Link to="/quiz/create">Create your first quiz</Link></p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Topic</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map(quiz => (
                  <tr key={quiz._id}>
                    <td>{quiz.title}</td>
                    <td>{quiz.topic}</td>
                    <td className="actions">
                      <Link to={`/quiz/edit/${quiz._id}`} className="btn btn-primary">Edit</Link>
                      <Link to={`/quiz/${quiz._id}/results`} className="btn btn-success">Results</Link>
                      <button onClick={() => handleDelete(quiz._id)} className="btn btn-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
