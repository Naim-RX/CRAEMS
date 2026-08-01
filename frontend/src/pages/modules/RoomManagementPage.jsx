import React, { useState, useEffect } from 'react';
import { Building2, Search, Filter, Plus, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const RoomManagementPage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [targetRoom, setTargetRoom] = useState(null);

  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [formMsg, setFormMsg] = useState('');

  const fetchRoomsData = async () => {
    try {
      let url = '/rooms?is_active=true';
      if (selectedBuilding) url += `&building_id=${selectedBuilding}`;
      if (minCapacity > 0) url += `&min_capacity=${minCapacity}`;
      
      const [rRes, bRes] = await Promise.all([
        api.get(url),
        api.get('/rooms/buildings')
      ]);
      setRooms(rRes.data);
      setBuildings(bRes.data);
    } catch (err) {
      console.error('Room management fetch error:', err);
    }
  };

  useEffect(() => {
    fetchRoomsData();
  }, [selectedBuilding, minCapacity]);

  const openBookingForRoom = (room) => {
    setTargetRoom(room);
    setAttendeesCount(Math.min(room.capacity, 10));
    setIsBookModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setFormMsg('');
    if (!user) {
      setFormMsg('Please login to reserve a facility.');
      return;
    }

    try {
      await api.post(`/bookings?user_id=${user.id}`, {
        room_id: targetRoom.id,
        title,
        purpose,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        attendees_count: Number(attendeesCount)
      });
      setFormMsg('Reservation request submitted successfully!');
      setTimeout(() => {
        setIsBookModalOpen(false);
        setFormMsg('');
      }, 1200);
    } catch (err) {
      setFormMsg(err.response?.data?.detail || 'Booking conflict detected.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Campus Room & Facility Catalog</h1>
        <p style={{ color: 'var(--text-muted)' }}>Interactive facility lookup, real-time availability & conflict-free booking</p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--accent-primary)" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filters:</span>
        </div>

        <div style={{ width: '220px' }}>
          <select className="form-select" value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)}>
            <option value="">All Buildings</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Min Seats:</span>
          <input
            type="number"
            className="form-input"
            style={{ width: '100px' }}
            placeholder="0"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
          />
        </div>
      </div>

      {/* Rooms Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {rooms.map(room => (
          <div key={room.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-active">{room.room_type?.name}</span>
                <StatusBadge status={room.is_maintenance ? 'DAMAGED' : 'AVAILABLE'} />
              </div>

              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.35rem' }}>
                Room {room.room_number}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {room.building?.name} ({room.building?.code}) • Floor {room.floor?.floor_number}
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Capacity: {room.capacity} seats</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  Features: {Object.keys(room.features || {}).join(', ') || 'Standard Classroom Setup'}
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => openBookingForRoom(room)}
              disabled={room.is_maintenance}
            >
              <CalendarIcon size={16} /> Book This Room
            </button>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {targetRoom && (
        <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title={`Reserve Room ${targetRoom.room_number}`}>
          {formMsg && (
            <div style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: formMsg.includes('successful') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: formMsg.includes('successful') ? '#34d399' : '#f87171',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {formMsg}
            </div>
          )}

          <form onSubmit={handleBookingSubmit}>
            <div className="form-group">
              <label className="form-label">Booking Reference Title</label>
              <input type="text" className="form-input" placeholder="e.g. AI Research Lab Discussion" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Purpose / Event Details</label>
              <textarea className="form-textarea" rows="2" placeholder="Intended use..." value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input type="datetime-local" className="form-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input type="datetime-local" className="form-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Attendees Count (Max: {targetRoom.capacity})</label>
              <input type="number" min="1" max={targetRoom.capacity} className="form-input" value={attendeesCount} onChange={(e) => setAttendeesCount(e.target.value)} required />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
              Submit Booking Request
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
