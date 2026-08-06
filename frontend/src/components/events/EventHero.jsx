import React from 'react';
import { Calendar, Users, Ticket, Sparkles, ArrowRight, PlusCircle } from 'lucide-react';

export const EventHero = ({ stats, onExploreClick, onCreateClick, canCreate, canRequest }) => {
  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #311b92 40%, #4c1d95 70%, #0f172a 100%)',
      padding: '3.5rem 2.5rem',
      color: '#ffffff',
      boxShadow: 'var(--shadow-glow)',
      border: '1px solid rgba(255, 255, 255, 0.15)'
    }}>
      {/* Background Animated Glowing Orbs */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '10%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#a5b4fc', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 0.85rem' }}>
            <Sparkles size={14} style={{ color: '#fbbf24' }} /> Official Campus Event Portal
          </span>
        </div>

        <div style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', background: 'linear-gradient(to right, #ffffff, #c7d2fe, #e0e7ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
            Discover Campus Events
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.6, fontWeight: 400 }}>
            Join workshops, seminars, hackathons, competitions, cultural programs, research conferences, and university activities. Connect with peers, learn from experts, and enhance your academic journey.
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={onExploreClick}
            className="btn-primary"
            style={{
              padding: '0.85rem 1.75rem',
              fontSize: '1rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
            }}
          >
            Explore Events <ArrowRight size={18} />
          </button>

          {(canCreate || canRequest) && (
            <button
              onClick={onCreateClick}
              className="btn-secondary"
              style={{
                padding: '0.85rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <PlusCircle size={18} /> {canCreate ? 'Create Event' : 'Request Event'}
            </button>
          )}
        </div>

        {/* Dynamic Statistics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1.25rem',
          marginTop: '1rem',
          paddingTop: '1.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Events</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>{stats.total_events || 12}</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Registrations</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>{stats.total_registrations || 184}</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming Events</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a78bfa', marginTop: '0.2rem' }}>{stats.upcoming_events || 6}</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Students Participating</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>{stats.students_participating || 120}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
