import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Box, Shield, CheckCircle, ArrowRight, Zap, Award, Users, Building2 } from 'lucide-react';
import api from '../../services/api';

export const HomePage = () => {
  const [stats, setStats] = useState({ total_rooms: 0, total_bookings: 0, total_events: 0 });
  const [rooms, setRooms] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, roomsRes, eventsRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/rooms?is_active=true'),
          api.get('/events?is_public=true')
        ]);
        setStats(statsRes.data);
        setRooms(roomsRes.data.slice(0, 3));
        setEvents(eventsRes.data.slice(0, 3));
      } catch (err) {
        console.error('Home page fetch error:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'var(--bg-secondary)',
        border: '1px solid #5C5C5C',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 1rem',
          borderRadius: '9999px',
          background: 'var(--accent-green-light)',
          border: '1px solid rgba(40, 167, 69, 0.3)',
          fontSize: '0.85rem',
          color: '#28A745',
          marginBottom: '1.5rem',
          fontWeight: 700
        }}>
          <Zap size={14} /> Enterprise Campus Resource Platform 2.0
        </div>
        <h1 style={{ fontSize: '3.5rem', lineHeight: 1.15, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          Centralized Resource Allocation <br />
          <span className="gradient-text">AND</span> <br />
          Event Management System 
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-muted)',
          maxWidth: '600px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          Seamlessly book rooms, request equipment, and discover campus events—all from one intelligent platform designed for modern academia.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => navigate('/login')} style={{ fontSize: '1.1rem', padding: '0.85rem 2rem' }}>
            Get Started
          </button>
          <button className="btn-secondary" onClick={() => navigate('/events')} style={{ fontSize: '1.1rem', padding: '0.85rem 2rem' }}>
            Explore Facilities
          </button>
        </div>
      </section>

      {/* Real-time Statistics Cards */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'var(--accent-green-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', color: '#28A745' }}>
            <Calendar size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.total_bookings || 142}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Reservations Solved</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'var(--accent-green-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', color: '#28A745' }}>
            <Building2 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.total_rooms || 28}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Active Facilities</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'var(--accent-green-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', color: '#28A745' }}>
            <Award size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.total_events || 12}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Public Events</div>
          </div>
        </div>
      </section>

      {/* Available Facilities Preview */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem' }}>Featured Campus Facilities</h2>
            <p style={{ color: 'var(--text-muted)' }}>Real-time capacity tracking & conflict detection</p>
          </div>
          <Link to="/rooms" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
            View All Rooms →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div key={room.id} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="badge badge-active">{room.room_type?.name}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cap: {room.capacity} seats</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  Room {room.room_number} ({room.building?.code})
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {room.building?.name} • Floor {room.floor?.floor_number}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {room.features?.has_projector && <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>Projector</span>}
                  {room.features?.has_ac && <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>Air Conditioned</span>}
                </div>
                <Link to="/rooms" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Check Availability
                </Link>
              </div>
            ))
          ) : (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading sample room directory...
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
