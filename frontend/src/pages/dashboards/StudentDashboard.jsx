import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Box, Ticket, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [formMsg, setFormMsg] = useState('');

  const fetchUserBookings = async () => {
    try {
      const [bRes, rRes] = await Promise.all([
        api.get(`/bookings?user_id=${user.id}`),
        api.get('/rooms?is_active=true')
      ]);
      setBookings(bRes.data);
      setRooms(rRes.data);
      if (rRes.data.length > 0) setSelectedRoomId(rRes.data[0].id);
    } catch (err) {
      console.error('Student dashboard fetch error:', err);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [user.id]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setFormMsg('');
    try {
      await api.post(`/bookings?user_id=${user.id}`, {
        room_id: selectedRoomId,
        title,
        purpose,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        attendees_count: Number(attendeesCount)
      });
      setFormMsg('Booking request submitted successfully!');
      setTimeout(() => {
        setIsBookModalOpen(false);
        setFormMsg('');
        fetchUserBookings();
      }, 1200);
    } catch (err) {
      setFormMsg(err.response?.data?.detail || 'Booking error. Slot might be conflicted.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Welcome back, {user.full_name}!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Student Dashboard & Campus Resource Manager</p>
        </div>
        <button className="btn-primary" onClick={() => setIsBookModalOpen(true)}>
          <Plus size={18} /> Quick Reserve Room
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Reservations</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>{bookings.length}</div>
        </div>
        <div className="glass-card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Approvals</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-warning)', marginTop: '0.25rem' }}>
            {bookings.filter(b => b.status === 'PENDING').length}
          </div>
        </div>
        <div className="glass-card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Event Tickets</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-secondary)', marginTop: '0.25rem' }}>1</div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>My Reservations</h3>
        {bookings.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Facility</th>
                  <th>Title & Purpose</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{b.booking_reference}</td>
                    <td>Room {b.room?.room_number} ({b.room?.building?.code})</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.purpose}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(b.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No active reservations found. Click "Quick Reserve Room" to get started!
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Reserve a Facility">
        {formMsg && (
          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            background: formMsg.includes('successful') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: formMsg.includes('successful') ? '1px solid #10b981' : '1px solid #ef4444',
            color: formMsg.includes('successful') ? '#34d399' : '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            {formMsg}
          </div>
        )}

        <form onSubmit={handleCreateBooking}>
          <div className="form-group">
            <label className="form-label">Select Facility</label>
            <select className="form-select" value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)}>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  Room {r.room_number} ({r.building?.code}) - Cap: {r.capacity}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reservation Title</label>
            <input type="text" className="form-input" placeholder="e.g. CS Study Group Session" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Purpose / Description</label>
            <textarea className="form-textarea" rows="2" placeholder="Briefly state intended use..." value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
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
            <label className="form-label">Expected Attendees Count</label>
            <input type="number" min="1" className="form-input" value={attendeesCount} onChange={(e) => setAttendeesCount(e.target.value)} required />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Submit Booking Request
          </button>
        </form>
      </Modal>
    </div>
  );
};
