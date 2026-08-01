import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', flexDirection: 'column', gap: '1.5rem', textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100px', height: '100px', borderRadius: '50%',
        background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#ef4444', marginBottom: '1rem'
      }}>
        <AlertTriangle size={48} />
      </div>
      <div style={{
        fontSize: '7rem', fontWeight: 900,
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        lineHeight: 1
      }}>
        404
      </div>
      <h1 style={{ fontSize: '2rem', margin: 0 }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.7 }}>
        The page you are looking for doesn't exist or has been moved.
        Please check the URL or navigate back to a known page.
      </p>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <button className="btn-primary" style={{ gap: '0.5rem' }}>
          <Home size={18} /> Back to Home
        </button>
      </Link>
    </div>
  );
};
