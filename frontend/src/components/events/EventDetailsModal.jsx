import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Calendar, MapPin, Users, Clock, Share2, Ticket, CheckCircle, Shield, Award, HelpCircle, Mail, Phone, ChevronRight } from 'lucide-react';

export const EventDetailsModal = ({ isOpen, onClose, event, onRegister }) => {
  const [copied, setCopied] = useState(false);
  if (!event) return null;

  const seatsLeft = Math.max(0, event.max_seats - (event.registered_count || 0));

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakers = event.speakers?.length > 0 ? event.speakers : [
    { name: 'Dr. Sarah Jenkins', title: 'Professor of AI Systems', organization: 'School of Computer Science', bio: 'Expert in Autonomous Agents and Machine Learning architectures.' },
    { name: 'Prof. Michael Chang', title: 'Dean of Research', organization: 'Department of Electrical Engineering', bio: 'Pioneer in Embedded Robotics & IoT Hardware.' }
  ];

  const faqs = event.faqs?.length > 0 ? event.faqs : [
    { question: 'Who is eligible to participate?', answer: 'Open to all registered university students, faculty members, and authorized research fellows.' },
    { question: 'Will certificates be provided?', answer: 'Yes! Automated digital certificates of attendance will be issued after QR entry verification.' },
    { question: 'What should I bring to the venue?', answer: 'Please bring your student/faculty ID card and your generated QR Ticket on your mobile device.' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event.title} maxWidth="850px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Large Banner */}
        <div style={{
          height: '240px',
          borderRadius: 'var(--radius-md)',
          backgroundImage: `url(${event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(0,0,0,0.2) 100%)' }} />

          <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-active" style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                {event.category?.name || 'CAMPUS EVENT'}
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.2 }}>
                {event.title}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" onClick={handleShare} style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}>
                <Share2 size={15} /> {copied ? 'Copied!' : 'Share'}
              </button>
              <button className="btn-primary" onClick={() => onRegister(event)} disabled={seatsLeft <= 0} style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                <Ticket size={15} /> {seatsLeft > 0 ? 'Register' : 'Seats Full'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 Venue</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Room {event.room?.room_number} ({event.room?.building?.code})</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🕒 Date & Time</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{new Date(event.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🎟️ Seats Remaining</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: seatsLeft > 0 ? '#34d399' : '#f87171' }}>{seatsLeft} / {event.max_seats}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏳ Registration Deadline</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{event.registration_deadline ? new Date(event.registration_deadline).toLocaleDateString() : 'Until Full'}</div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Complete Event Description</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{event.description}</p>
        </div>

        {/* Speaker Information */}
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Keynote Speakers & Guest Lecturers</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {speakers.map((s, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>{s.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{s.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>{s.organization}</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements & Rules */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>📋 Requirements</h5>
            <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6 }}>
              <li>Valid University Student / Faculty ID</li>
              <li>Pre-registration QR entry ticket</li>
              <li>Laptop for interactive workshops</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f87171' }}>⚖️ Code of Conduct</h5>
            <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6 }}>
              <li>Arrive 15 minutes before schedule</li>
              <li>Scan QR ticket at entry scanner</li>
              <li>Maintain academic decorum</li>
            </ul>
          </div>
        </div>

        {/* QR Registration Info */}
        <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={32} color="var(--accent-primary)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Instant QR Code Ticketing</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Upon registration, an encrypted digital QR ticket will be stored under <strong>My Events</strong> for fast check-in.</div>
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Frequently Asked Questions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem' }}>Q: {faq.question}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{faq.answer}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Organizer Contact */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Organizer Contact</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{event.organizer?.full_name || 'Academic Affairs Office'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{event.organizer?.email || 'events@craems.edu'}</div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-primary" onClick={() => onRegister(event)} disabled={seatsLeft <= 0}>
              <Ticket size={16} /> Register Now
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
