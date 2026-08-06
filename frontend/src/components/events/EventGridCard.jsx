import React, { useState } from 'react';
import { Calendar, MapPin, Users, Heart, Share2, Ticket, Eye, CheckCircle2, Clock } from 'lucide-react';

export const EventGridCard = ({ event, onRegister, onViewDetails }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const seatsLeft = Math.max(0, event.max_seats - (event.registered_count || 0));

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
      onClick={() => onViewDetails(event)}
    >
      {/* Banner */}
      <div style={{
        height: '160px',
        position: 'relative',
        backgroundImage: `url(${event.cover_image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)' }} />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', right: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge badge-active" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
            {event.category?.name || 'CAMPUS EVENT'}
          </span>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
              style={{
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(8px)',
                border: 'none',
                color: isFavorite ? '#ef4444' : '#ffffff',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Favorite Event"
            >
              <Heart size={15} fill={isFavorite ? '#ef4444' : 'none'} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              style={{
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(8px)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Share Event"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>

        {/* Price & Mode overlay */}
        <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', background: 'rgba(15,23,42,0.85)', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
            {event.price_type === 'PAID' ? `$${event.price_amount}` : 'FREE ENTRY'}
          </span>
          <span style={{ fontSize: '0.72rem', background: 'rgba(99,102,241,0.85)', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
            {event.event_mode || 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
            {event.organizer?.full_name || 'University Organizer'}
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.25rem 0 0.5rem', lineHeight: 1.3 }}>
            {event.title}
          </h3>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {event.description}
          </p>
        </div>

        <div>
          {/* Metadata Box */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <Calendar size={14} color="var(--accent-secondary)" />
              <span>{new Date(event.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <MapPin size={14} color="var(--accent-primary)" />
              <span>Room {event.room?.room_number || 'TBD'} ({event.room?.building?.code || 'Campus'})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: seatsLeft > 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Users size={14} /> {seatsLeft} Seats Available
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                {event.registered_count || 0} Participants
              </span>
            </div>
          </div>

          {copiedMsg && (
            <div style={{ fontSize: '0.75rem', color: '#34d399', textAlign: 'center', marginBottom: '0.5rem' }}>
              ✓ Link copied to clipboard!
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '0.55rem 0.75rem', fontSize: '0.82rem' }}
              onClick={(e) => {
                e.stopPropagation();
                onRegister(event);
              }}
              disabled={seatsLeft <= 0}
            >
              <Ticket size={14} /> {seatsLeft > 0 ? 'Register' : 'Full'}
            </button>
            <button
              className="btn-secondary"
              style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem' }}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(event);
              }}
            >
              <Eye size={14} /> View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
