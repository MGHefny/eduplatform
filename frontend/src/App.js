import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/shared/Navbar';
import './index.css';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentLessons from './pages/student/StudentLessons';
import LessonView from './pages/student/LessonView';
import ExamPage from './pages/student/ExamPage';
import StudentProgress from './pages/student/StudentProgress';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherLessons from './pages/teacher/TeacherLessons';
import LessonForm from './pages/teacher/LessonForm';
import TeacherExams from './pages/teacher/TeacherExams';
import TeacherStudents from './pages/teacher/TeacherStudents';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} />;
  return children;
};

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/student/dashboard" /> : <Register />} />

        {/* Student */}
        <Route path="/student/dashboard" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
        <Route path="/student/lessons" element={<PrivateRoute role="student"><StudentLessons /></PrivateRoute>} />
        <Route path="/student/lessons/:id" element={<PrivateRoute role="student"><LessonView /></PrivateRoute>} />
        <Route path="/student/exam/:id" element={<PrivateRoute role="student"><ExamPage /></PrivateRoute>} />
        <Route path="/student/post-test" element={<PrivateRoute role="student"><PostTestRedirect /></PrivateRoute>} />
        <Route path="/student/progress" element={<PrivateRoute role="student"><StudentProgress /></PrivateRoute>} />

        {/* Teacher */}
        <Route path="/teacher/dashboard" element={<PrivateRoute role="teacher"><TeacherDashboard /></PrivateRoute>} />
        <Route path="/teacher/lessons" element={<PrivateRoute role="teacher"><TeacherLessons /></PrivateRoute>} />
        <Route path="/teacher/lessons/new" element={<PrivateRoute role="teacher"><LessonForm /></PrivateRoute>} />
        <Route path="/teacher/lessons/edit/:id" element={<PrivateRoute role="teacher"><LessonForm /></PrivateRoute>} />
        <Route path="/teacher/exams" element={<PrivateRoute role="teacher"><TeacherExams /></PrivateRoute>} />
        <Route path="/teacher/exams/new" element={<PrivateRoute role="teacher"><TeacherExams /></PrivateRoute>} />
        <Route path="/teacher/students" element={<PrivateRoute role="teacher"><TeacherStudents /></PrivateRoute>} />

        <Route path="/" element={<Navigate to={user ? (user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard') : '/login'} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function PostTestRedirect() {
  const [examId, setExamId] = React.useState(null);
  const navigate = require('react-router-dom').useNavigate();
  const api = require('./utils/api').default;

  React.useEffect(() => {
    api.get('/exams/type/post')
      .then(res => navigate(`/student/exam/${res.data.id}`))
      .catch(() => navigate('/student/dashboard'));
  }, []);

  return <div className="loading">جاري التحميل...</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
