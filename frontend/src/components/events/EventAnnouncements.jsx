import React from 'react';
import { Megaphone, AlertCircle, Clock, MapPin, Bell } from 'lucide-react';

export const EventAnnouncements = ({ announcements = [] }) => {
  if (!announcements || announcements.length === 0) return null;

  const getTypeStyle = (type) => {
    switch (type) {
      case 'VENUE_CHANGE':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', icon: MapPin };
      case 'DEADLINE_EXTENSION':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', icon: Clock };
      default:
        return { bg: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', icon: Bell };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <Megaphone size={20} color="var(--accent-primary)" />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Campus Event Notices & Updates</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {announcements.map(ann => {
          const styleObj = getTypeStyle(ann.type);
          const IconComp = styleObj.icon;

          return (
            <div
              key={ann.id}
              style={{
                background: styleObj.bg,
                border: styleObj.border,
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                display: 'flex',
                gap: '0.75rem'
              }}
            >
              <div style={{ color: styleObj.color, marginTop: '0.1rem' }}>
                <IconComp size={18} />
              </div>

              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                  {ann.title}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {ann.content}
                </p>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                  Posted {new Date(ann.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
