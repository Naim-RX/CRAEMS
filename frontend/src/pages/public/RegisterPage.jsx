import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Phone, UserCheck, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roleName, setRoleName] = useState('STUDENT');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const res = await register({
      full_name: fullName,
      email,
      password,
      phone,
      role_name: roleName
    });

    if (res.success) {
      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(res.error);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.6rem', textAlign: 'center', marginBottom: '0.5rem' }}>Create Account</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
        Register for institutional resource allocation access
      </p>

      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          fontSize: '0.85rem',
          marginBottom: '1.25rem'
        }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '0.85rem',
          marginBottom: '1.25rem'
        }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Dr. Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="name@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Account Role</label>
          <select className="form-select" value={roleName} onChange={(e) => setRoleName(e.target.value)}>
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty Academic Staff</option>
            <option value="RESEARCHER">Research Associate</option>
            <option value="RESOURCE_MANAGER">Resource Manager</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.85rem' }}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Complete Registration'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Already registered?{' '}
        <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
};
