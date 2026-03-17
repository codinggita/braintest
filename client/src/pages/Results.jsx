import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Results = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const score = location.state?.score;
  const totalQuestions = location.state?.totalQuestions;

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchTeacherResults();
    } else {
      setLoading(false);
    }
  }, [id, user]);

  const fetchTeacherResults = async () => {
    try {
      const response = await axios.get(`/api/quizzes/${id}/results`);
      setResults(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load results');
      setLoading(false);
    }
  };

  if (user?.role === 'teacher') {
    if (loading) {
      return <div className="container">Loading...</div>;
    }

    return (
      <div>
        <nav className="navbar">
          <span className="brand">Quiz Results</span>
          <Link to="/dashboard" style={{ color: 'white' }}>Back to Dashboard</Link>
        </nav>
        <div className="container">
          <h2>Student Results</h2>
          {error && <div className="error">{error}</div>}
          
          {results && results.length > 0 ? (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr key={result._id}>
                      <td>{result.studentId?.name}</td>
                      <td>{result.studentId?.email}</td>
                      <td>{result.score} / {result.totalQuestions}</td>
                      <td>{Math.round((result.score / result.totalQuestions) * 100)}%</td>
                      <td>{new Date(result.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No submissions yet.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar">
        <span className="brand">Quiz Results</span>
        <Link to="/home" style={{ color: 'white' }}>Back to Home</Link>
      </nav>
      <div className="container">
        <div className="result-box card">
          <h2>Your Results</h2>
          {score !== undefined ? (
            <>
              <h2 style={{ fontSize: '72px', color: score >= totalQuestions / 2 ? '#27ae60' : '#e74c3c' }}>
                {score} / {totalQuestions}
              </h2>
              <p style={{ fontSize: '24px', marginBottom: '20px' }}>
                {Math.round((score / totalQuestions) * 100)}%
              </p>
              <p style={{ color: '#666' }}>
                {score >= totalQuestions / 2 ? 'Great job!' : 'Keep practicing!'}
              </p>
              <Link to="/home" className="btn btn-primary" style={{ marginTop: '20px' }}>
                Back to Home
              </Link>
            </>
          ) : (
            <p>No results available. Please take a quiz first.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
