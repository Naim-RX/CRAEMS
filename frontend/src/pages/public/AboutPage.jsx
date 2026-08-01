import React from 'react';
import { Building2, Shield, Users, Zap, CheckCircle2, Award } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '1rem 0' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem',
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          About CRAEMS Enterprise
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          The Centralized Resource Allocation and Event Management System (CRAEMS) is a unified enterprise platform designed for modern higher education institutions, laboratories, and research campuses.
        </p>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {[
          {
            icon: Building2,
            title: 'Facility & Space Allocation',
            desc: 'Real-time interactive booking engine with double-booking prevention, automated approval workflows, and multi-tenant department governance.'
          },
          {
            icon: Zap,
            title: 'Smart AV & Equipment Loans',
            desc: 'Complete tracking of university assets, lab instruments, and high-value AV equipment with checkout status, condition grading, and overdue alerts.'
          },
          {
            icon: Shield,
            title: 'QR Code Event Ticketing',
            desc: 'Seamless event publishing, digital ticket generation, and high-speed mobile QR scanner verification for instant attendance validation.'
          },
          {
            icon: Award,
            title: 'Enterprise RBAC & Security',
            desc: 'Role-based access control with granular permissions for Administrators, Resource Managers, Faculty, Researchers, and Students.'
          }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* System Specifications */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Architectural Highlights</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {[
            'FastAPI + SQLAlchemy 2.0 Async Engine',
            'MySQL 8.0 / SQLite High-Performance Storage',
            'React 18 + SPA Architecture with Custom CSS System',
            'JWT Double-Token Authentication (Access & Refresh)',
            'InnoDB Row-Level Locking Conflict Engine',
            'CSV Reporting & Analytics Export'
          ].map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={18} style={{ color: '#34d399', flexShrink: 0 }} />
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
