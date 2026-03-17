import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LoadingScreen } from '../components/Skeleton';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

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
  const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;

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

  if (loading) return <LoadingScreen />;

  if (user?.role === 'teacher') {
    const chartData = results?.map(r => ({
      name: r.studentId?.name?.slice(0, 10) || 'Student',
      score: Math.round((r.score / r.totalQuestions) * 100)
    })) || [];

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
          <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Back to Dashboard</Link>
        </nav>
        
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 style={{ marginBottom: '24px' }}>Student Results</h2>
          </motion.div>

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
          
          {results && results.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="chart-container" style={{ marginBottom: '24px' }}>
                <h3>Performance Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1E293B', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <Bar dataKey="score" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <motion.div 
                className="glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
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
                    {results.map((result, index) => (
                      <motion.tr 
                        key={result._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <td>{result.studentId?.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{result.studentId?.email}</td>
                        <td>{result.score} / {result.totalQuestions}</td>
                        <td>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600',
                            background: Math.round((result.score / result.totalQuestions) * 100) >= 60 
                              ? 'rgba(16, 185, 129, 0.2)' 
                              : 'rgba(239, 68, 68, 0.2)',
                            color: Math.round((result.score / result.totalQuestions) * 100) >= 60 
                              ? 'var(--success)' 
                              : 'var(--danger)'
                          }}>
                            {Math.round((result.score / result.totalQuestions) * 100)}%
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {new Date(result.submittedAt).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No submissions yet.</p>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  const getResultMessage = () => {
    if (percentage >= 90) return { emoji: '🏆', message: 'Outstanding! You nailed it!' };
    if (percentage >= 80) return { emoji: '🌟', message: 'Excellent work!' };
    if (percentage >= 70) return { emoji: '👏', message: 'Great job!' };
    if (percentage >= 60) return { emoji: '👍', message: 'Good effort!' };
    if (percentage >= 50) return { emoji: '💪', message: 'Keep practicing!' };
    return { emoji: '📚', message: 'Time to review and try again!' };
  };

  const result = getResultMessage();

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
        <Link to="/home" style={{ color: 'var(--text-secondary)' }}>Back to Home</Link>
      </nav>
      
      <div className="container">
        <motion.div 
          className="result-box glass"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: '500px', margin: '40px auto' }}
        >
          {score !== undefined ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                style={{ fontSize: '64px', marginBottom: '16px' }}
              >
                {result.emoji}
              </motion.div>
              
              <h2 style={{ marginBottom: '8px' }}>Your Results</h2>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 style={{ 
                  fontSize: '56px', 
                  background: percentage >= 60 
                    ? 'linear-gradient(135deg, #10B981, #059669)' 
                    : 'linear-gradient(135deg, #F59E0B, #D97706)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {score} / {totalQuestions}
                </h2>
                
                <p style={{ 
                  fontSize: '28px', 
                  fontWeight: '600',
                  color: 'var(--electric-blue)',
                  marginBottom: '16px'
                }}>
                  {percentage}%
                </p>
                
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '18px',
                  marginBottom: '32px'
                }}>
                  {result.message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <Link to="/home" className="btn btn-primary">
                    Back to Home
                  </Link>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>No results available. Please take a quiz first.</p>
              <Link to="/home" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Browse Quizzes
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Results;