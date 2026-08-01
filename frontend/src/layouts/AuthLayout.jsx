import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0b0f19 70%)',
      padding: '1.5rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Building2 size={24} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>CRAEMS</span>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
