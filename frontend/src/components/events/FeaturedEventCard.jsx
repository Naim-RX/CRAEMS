import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Sparkles, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';

export const FeaturedEventCard = ({ event, onRegister, onLearnMore }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!event?.start_time) return;

    const timer = setInterval(() => {
      const target = new Date(event.start_time).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [event]);

  if (!event) return null;

  const seatsAvailable = Math.max(0, event.max_seats - (event.registered_count || 0));

  return (
    <div className="glass-panel" style={{
      padding: 0,
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      boxShadow: 'var(--shadow-glow)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)'
    }}>
      {/* Cover Image Side */}
      <div style={{
        position: 'relative',
        minHeight: '320px',
        backgroundImage: `url(${event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.9) 100%)'
        }} />
        <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-active" style={{ background: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700 }}>
            ★ FEATURED EVENT
          </span>
          <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
            {event.category?.name || 'Academic Workshop'}
          </span>
        </div>
      </div>

      {/* Content Side */}
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Organized by {event.organizer?.full_name || 'Department Faculty'}
          </div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.75rem', color: '#ffffff', lineHeight: 1.25 }}>
            {event.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {event.description}
          </p>

          {/* Details Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} color="var(--accent-primary)" />
              <span>Room {event.room?.room_number} ({event.room?.building?.code || 'Main Campus'})</span>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="var(--accent-secondary)" />
              <span>{new Date(event.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} color="#34d399" />
              <span>Seats: {seatsAvailable} / {event.max_seats} left</span>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="#fbbf24" />
              <span>Mode: {event.event_mode || 'OFFLINE'}</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.85rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
              ⏳ Event Starts In
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', fontFamily: 'monospace', fontWeight: 800, fontSize: '1.25rem', color: '#ffffff' }}>
              <div>{timeLeft.days}<span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>DAYS</span></div>
              <div>:</div>
              <div>{timeLeft.hours}<span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>HRS</span></div>
              <div>:</div>
              <div>{timeLeft.minutes}<span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>MINS</span></div>
              <div>:</div>
              <div>{timeLeft.seconds}<span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>SECS</span></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '0.75rem 1rem' }}
            onClick={() => onRegister(event)}
            disabled={seatsAvailable <= 0}
          >
            <Ticket size={18} /> {seatsAvailable > 0 ? 'Register Now' : 'Seats Full'}
          </button>
          <button
            className="btn-secondary"
            style={{ padding: '0.75rem 1.25rem' }}
            onClick={() => onLearnMore(event)}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};
