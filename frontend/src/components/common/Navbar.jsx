import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Building2, Sun, Moon, LogOut, User as UserIcon, Calendar, Box, Award, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role?.name) {
      case 'ADMINISTRATOR': return '/dashboard/admin';
      case 'RESOURCE_MANAGER': return '/dashboard/manager';
      case 'FACULTY': return '/dashboard/faculty';
      default: return '/dashboard/student';
    }
  };

  return (
    <nav style={{
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '0.85rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Building2 size={22} />
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          CRAEMS<span style={{ color: 'var(--accent-primary)' }}>.EDU</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
        <Link to="/rooms" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Facilities</Link>
        <Link to="/equipment" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Equipment</Link>
        <Link to="/events" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Events</Link>
        
        {user && (
          <Link to={getDashboardRoute()} style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Dashboard
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.full_name}</div>
              <span className={`badge badge-${user.role?.name.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                {user.role?.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};
