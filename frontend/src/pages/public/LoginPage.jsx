import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      const role = res.user.role?.name;
      if (role === 'ADMINISTRATOR') navigate('/dashboard/admin');
      else if (role === 'RESOURCE_MANAGER') navigate('/dashboard/manager');
      else if (role === 'FACULTY') navigate('/dashboard/faculty');
      else navigate('/dashboard/student');
    } else {
      setError(res.error);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.6rem', textAlign: 'center', marginBottom: '0.5rem' }}>Welcome Back</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
        Sign in to manage room bookings & campus events
      </p>

      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          fontSize: '0.85rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="email"
              className="form-input"
              style={{ paddingLeft: '2.3rem' }}
              placeholder="e.g. alex@craems.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="password"
              className="form-input"
              style={{ paddingLeft: '2.3rem' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.85rem' }}
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Sign In'} <LogIn size={18} />
        </button>
      </form>

      {/* Demo Credentials Box */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px dashed var(--border-color)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Demo Accounts:</div>
        <div>Admin: <code>admin@craems.edu</code> / <code>admin123</code></div>
        <div>Faculty: <code>faculty@craems.edu</code> / <code>faculty123</code></div>
        <div>Student: <code>student@craems.edu</code> / <code>student123</code></div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
          Register here
        </Link>
      </div>
    </div>
  );
};
