import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navStyles = {
  nav: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: { fontWeight: 700, fontSize: 18, color: '#4f46e5' },
  links: { display: 'flex', gap: 4, alignItems: 'center' },
  link: {
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: 14,
    color: '#374151',
    fontWeight: 500,
    transition: 'background 0.15s'
  },
  activeLink: {
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: 500,
    background: '#e0e7ff'
  },
  user: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: {
    width: 32, height: 32,
    borderRadius: '50%',
    background: '#4f46e5',
    color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600
  }
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return null;

  return (
    <nav style={navStyles.nav}>
      <Link to="/" style={navStyles.logo}>📚 EduPlatform</Link>

      <div style={navStyles.links}>
        {user.role === 'teacher' ? (
          <>
            <Link to="/teacher/dashboard" style={isActive('/teacher/dashboard') ? navStyles.activeLink : navStyles.link}>لوحة التحكم</Link>
            <Link to="/teacher/lessons" style={isActive('/teacher/lessons') ? navStyles.activeLink : navStyles.link}>الدروس</Link>
            <Link to="/teacher/exams" style={isActive('/teacher/exams') ? navStyles.activeLink : navStyles.link}>الامتحانات</Link>
            <Link to="/teacher/students" style={isActive('/teacher/students') ? navStyles.activeLink : navStyles.link}>الطلاب</Link>
          </>
        ) : (
          <>
            <Link to="/student/dashboard" style={isActive('/student/dashboard') ? navStyles.activeLink : navStyles.link}>رحلتي</Link>
            <Link to="/student/lessons" style={isActive('/student/lessons') ? navStyles.activeLink : navStyles.link}>الدروس</Link>
            <Link to="/student/progress" style={isActive('/student/progress') ? navStyles.activeLink : navStyles.link}>تقدمي</Link>
          </>
        )}
      </div>

      <div style={navStyles.user}>
        <div style={navStyles.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
        <span style={{ fontSize: 14, color: '#374151' }}>{user.name}</span>
        <button className="btn btn-sm" onClick={handleLogout}>خروج</button>
      </div>
    </nav>
  );
}
