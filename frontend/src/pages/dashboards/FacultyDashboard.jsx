import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Award, Calendar, CheckCircle2, Plus } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attendeesCount, setAttendeesCount] = useState(30);
  const [formMsg, setFormMsg] = useState('');

  const fetchFacultyData = async () => {
    try {
      const [bRes, rRes] = await Promise.all([
        api.get(`/bookings?user_id=${user.id}`),
        api.get('/rooms?is_active=true')
      ]);
      setBookings(bRes.data);
      setRooms(rRes.data);
      if (rRes.data.length > 0) setSelectedRoomId(rRes.data[0].id);
    } catch (err) {
      console.error('Faculty dashboard fetch error:', err);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, [user.id]);

  const handleFacultyBooking = async (e) => {
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
      setFormMsg('Faculty reservation submitted & auto-approved!');
      setTimeout(() => {
        setIsBookModalOpen(false);
        setFormMsg('');
        fetchFacultyData();
      }, 1200);
    } catch (err) {
      setFormMsg(err.response?.data?.detail || 'Booking error.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Faculty Academic Hub</h1>
          <p style={{ color: 'var(--text-muted)' }}>Lecture Hall Reservations & Academic Department Events</p>
        </div>
        <button className="btn-primary" onClick={() => setIsBookModalOpen(true)}>
          <Plus size={18} /> Reserve Lecture / Lab
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>My Academic Bookings</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>{bookings.length}</div>
        </div>
        <div className="glass-card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Auto-Approval Privilege</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={18} /> ACTIVE
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Faculty Reservation Schedule</h3>
        {bookings.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Facility</th>
                  <th>Topic / Purpose</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{b.booking_reference}</td>
                    <td>Room {b.room?.room_number}</td>
                    <td>{b.title}</td>
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
            No lecture hall reservations registered.
          </div>
        )}
      </div>

      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Reserve Lecture Hall / Research Lab">
        {formMsg && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formMsg}
          </div>
        )}

        <form onSubmit={handleFacultyBooking}>
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
            <label className="form-label">Lecture / Event Title</label>
            <input type="text" className="form-input" placeholder="e.g. Advanced Algorithm Lecture" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Purpose</label>
            <textarea className="form-textarea" rows="2" placeholder="Course details..." value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
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
            <label className="form-label">Expected Attendees</label>
            <input type="number" min="1" className="form-input" value={attendeesCount} onChange={(e) => setAttendeesCount(e.target.value)} required />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Confirm Faculty Reservation
          </button>
        </form>
      </Modal>
    </div>
  );
};
