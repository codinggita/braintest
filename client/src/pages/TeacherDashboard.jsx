import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { SkeletonTable } from '../components/Skeleton';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const TeacherDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quizRes, subRes] = await Promise.all([
        axios.get('/api/quizzes'),
        axios.get('/api/submissions')
      ]);
      
      const teacherQuizzes = quizRes.data.filter(q => q.createdBy?._id === user._id);
      setQuizzes(teacherQuizzes);
      
      const quizIds = teacherQuizzes.map(q => q._id);
      const relevantSubmissions = subRes.data.filter(s => quizIds.includes(s.quizId?._id));
      setSubmissions(relevantSubmissions);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await axios.delete(`/api/quizzes/${id}`);
        fetchData();
      } catch (err) {
        setError('Failed to delete quiz');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = {
    totalQuizzes: quizzes.length,
    totalSubmissions: submissions.length,
    avgScore: submissions.length > 0 
      ? Math.round(submissions.reduce((acc, s) => acc + (s.score / s.totalQuestions) * 100, 0) / submissions.length)
      : 0,
    topPerformer: submissions.length > 0 
      ? submissions.reduce((max, s) => (s.score / s.totalQuestions) > (max.score / max.totalQuestions) ? s : max, submissions[0])
      : null
  };

  const quizPerformanceData = quizzes.map(q => {
    const quizSubs = submissions.filter(s => s.quizId?._id === q._id);
    const avg = quizSubs.length > 0 
      ? Math.round(quizSubs.reduce((acc, s) => acc + (s.score / s.totalQuestions) * 100, 0) / quizSubs.length)
      : 0;
    return { name: q.title.slice(0, 15), submissions: quizSubs.length, avgScore: avg };
  });

  const scoreDistribution = [
    { name: '0-20%', value: submissions.filter(s => (s.score / s.totalQuestions) * 100 < 20).length },
    { name: '21-40%', value: submissions.filter(s => (s.score / s.totalQuestions) * 100 >= 20 && (s.score / s.totalQuestions) * 100 < 40).length },
    { name: '41-60%', value: submissions.filter(s => (s.score / s.totalQuestions) * 100 >= 40 && (s.score / s.totalQuestions) * 100 < 60).length },
    { name: '61-80%', value: submissions.filter(s => (s.score / s.totalQuestions) * 100 >= 60 && (s.score / s.totalQuestions) * 100 < 80).length },
    { name: '81-100%', value: submissions.filter(s => (s.score / s.totalQuestions) * 100 >= 80).length },
  ];

  const submissionsOverTime = submissions
    .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
    .slice(-10)
    .map((s, i) => ({
      day: i + 1,
      score: Math.round((s.score / s.totalQuestions) * 100)
    }));

  if (loading) {
    return (
      <div className="app-container">
        <nav className="navbar">
          <span className="brand">BrainTest</span>
          <div className="user-info">
            <Link to="/quiz/create">Create Quiz</Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-small">Logout</button>
          </div>
        </nav>
        <div className="container">
          <SkeletonTable rows={3} />
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
          <span className="role-badge">Teacher</span>
          <Link to="/quiz/create">Create Quiz</Link>
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
          <p>Teacher Dashboard</p>
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
          className="stats-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-card">
            <div className="value">{stats.totalQuizzes}</div>
            <div className="label">Total Quizzes</div>
          </div>
          <div className="stat-card">
            <div className="value">{stats.totalSubmissions}</div>
            <div className="label">Total Submissions</div>
          </div>
          <div className="stat-card">
            <div className="value">{stats.avgScore}%</div>
            <div className="label">Average Score</div>
          </div>
          <div className="stat-card">
            <div className="value">{stats.topPerformer?.studentId?.name || 'N/A'}</div>
            <div className="label">Top Performer</div>
          </div>
        </motion.div>

        {submissions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="chart-container">
              <h3>Quiz Performance Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={quizPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1E293B', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="avgScore" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Avg Score %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div className="chart-container">
                <h3>Score Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={scoreDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1E293B', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                  {scoreDistribution.map((entry, index) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94A3B8' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: COLORS[index] }} />
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-container">
                <h3>Recent Performance Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={submissionsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1E293B', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#3B82F6" fill="rgba(59, 130, 246, 0.3)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>My Quizzes</h3>
          {quizzes.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No quizzes yet. <Link to="/quiz/create">Create your first quiz</Link></p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Topic</th>
                  <th>Submissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz, index) => (
                  <motion.tr 
                    key={quiz._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <td>{quiz.title}</td>
                    <td><span className="topic">{quiz.topic}</span></td>
                    <td>{submissions.filter(s => s.quizId?._id === quiz._id).length}</td>
                    <td className="actions">
                      <Link to={`/quiz/edit/${quiz._id}`} className="btn btn-secondary btn-small">Edit</Link>
                      <Link to={`/quiz/${quiz._id}/results`} className="btn btn-primary btn-small">Results</Link>
                      <button onClick={() => handleDelete(quiz._id)} className="btn btn-danger btn-small">Delete</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;