import React from 'react';
import { Calendar, MapPin, Users, Ticket, ArrowRight, UserCheck } from 'lucide-react';

export const EventTimelineView = ({ events = [], onSelectEvent, onRegister }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        ⏳ Chronological Campus Event Timeline
      </h3>

      <div style={{ position: 'relative', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Timeline Bar */}
        <div style={{
          position: 'absolute',
          left: '7px',
          top: 0,
          bottom: 0,
          width: '3px',
          background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-secondary), rgba(255,255,255,0.1))'
        }} />

        {events.map(evt => {
          const dateObj = new Date(evt.start_time);
          const seatsLeft = Math.max(0, evt.max_seats - (evt.registered_count || 0));

          return (
            <div key={evt.id} style={{ position: 'relative' }}>
              {/* Node Circle */}
              <div style={{
                position: 'absolute',
                left: '-2rem',
                top: '0.2rem',
                width: '17px',
                height: '17px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                border: '3px solid var(--bg-secondary)',
                boxShadow: '0 0 10px var(--accent-primary)'
              }} />

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="badge badge-active">{evt.category?.name || 'Event'}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                      {dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: seatsLeft > 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                    {seatsLeft} Seats Left
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                    {evt.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {evt.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', gap: '1rem' }}>
                    <span>📍 Room {evt.room?.room_number || 'TBD'}</span>
                    <span>👤 {evt.organizer?.full_name || 'Organizer'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={() => onRegister(evt)}>
                      <Ticket size={14} /> Register
                    </button>
                    <button className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={() => onSelectEvent(evt)}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
