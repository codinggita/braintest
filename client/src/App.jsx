import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateQuiz from './pages/CreateQuiz';
import EditQuiz from './pages/EditQuiz';
import StudentHome from './pages/StudentHome';
import TakeQuiz from './pages/TakeQuiz';
import Results from './pages/Results';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'teacher' ? '/dashboard' : '/home'} />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'teacher' ? '/dashboard' : '/home'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'teacher' ? '/dashboard' : '/home'} /> : <Register />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute role="teacher">
          <TeacherDashboard />
        </ProtectedRoute>
      } />
      <Route path="/quiz/create" element={
        <ProtectedRoute role="teacher">
          <CreateQuiz />
        </ProtectedRoute>
      } />
      <Route path="/quiz/edit/:id" element={
        <ProtectedRoute role="teacher">
          <EditQuiz />
        </ProtectedRoute>
      } />
      
      <Route path="/home" element={
        <ProtectedRoute role="student">
          <StudentHome />
        </ProtectedRoute>
      } />
      <Route path="/quiz/:id" element={
        <ProtectedRoute role="student">
          <TakeQuiz />
        </ProtectedRoute>
      } />
      <Route path="/quiz/:id/results" element={
        <ProtectedRoute>
          <Results />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
