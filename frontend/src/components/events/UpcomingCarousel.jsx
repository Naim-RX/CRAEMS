import React from 'react';
import { Calendar, MapPin, ChevronRight, ChevronLeft, Ticket } from 'lucide-react';

export const UpcomingCarousel = ({ events = [], onSelectEvent, onRegister }) => {
  if (!events || events.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>⚡ Happening Next 7 Days</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quick registration horizon for upcoming activities</p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '1.25rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        scrollBehavior: 'smooth'
      }}>
        {events.map(evt => (
          <div
            key={evt.id}
            className="glass-card"
            style={{
              minWidth: '280px',
              maxWidth: '300px',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              padding: '1.25rem',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => onSelectEvent(evt)}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>
                  {evt.category?.name || 'Upcoming'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  {evt.price_type === 'PAID' ? `$${evt.price_amount}` : 'FREE'}
                </span>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', lineHeight: 1.3 }}>
                {evt.title}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {evt.description}
              </p>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} color="var(--accent-secondary)" />
                  {new Date(evt.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={13} color="var(--accent-primary)" />
                  Room {evt.room?.room_number || 'TBD'}
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
              onClick={(e) => {
                e.stopPropagation();
                onRegister(evt);
              }}
            >
              <Ticket size={14} /> Quick Register
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
