import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Box, Ticket, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';

const HOURLY_TIME_SLOTS = [
  { id: '08:00-09:00', label: '8:00 AM - 9:00 AM', startHour: 8, endHour: 9 },
  { id: '09:00-10:00', label: '9:00 AM - 10:00 AM', startHour: 9, endHour: 10 },
  { id: '10:00-11:00', label: '10:00 AM - 11:00 AM', startHour: 10, endHour: 11 },
  { id: '11:00-12:00', label: '11:00 AM - 12:00 PM', startHour: 11, endHour: 12 },
  { id: '12:00-13:00', label: '12:00 PM - 1:00 PM', startHour: 12, endHour: 13 },
  { id: '13:00-14:00', label: '1:00 PM - 2:00 PM', startHour: 13, endHour: 14 },
  { id: '14:00-15:00', label: '2:00 PM - 3:00 PM', startHour: 14, endHour: 15 },
  { id: '15:00-16:00', label: '3:00 PM - 4:00 PM', startHour: 15, endHour: 16 },
  { id: '16:00-17:00', label: '4:00 PM - 5:00 PM', startHour: 16, endHour: 17 },
];

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('08:00-09:00');
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [formMsg, setFormMsg] = useState('');

  const fetchUserBookings = async () => {
    try {
      const [bRes, rRes, allBRes] = await Promise.allSettled([
        api.get(`/bookings?user_id=${user.id}`),
        api.get('/rooms?is_active=true'),
        api.get('/bookings')
      ]);
      if (bRes.status === 'fulfilled') setBookings(bRes.value.data);
      if (rRes.status === 'fulfilled') {
        setRooms(rRes.value.data);
        if (rRes.value.data.length > 0 && !selectedRoomId) setSelectedRoomId(rRes.value.data[0].id);
      }
      if (allBRes.status === 'fulfilled' && Array.isArray(allBRes.value.data)) {
        setAllBookings(allBRes.value.data);
      }
    } catch (err) {
      console.error('Student dashboard fetch error:', err);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [user.id]);

  const isSlotBooked = (slot, dateStr, roomId) => {
    if (!dateStr || !roomId) return false;
    const slotStart = new Date(`${dateStr}T${String(slot.startHour).padStart(2, '0')}:00:00`).getTime();
    const slotEnd = new Date(`${dateStr}T${String(slot.endHour).padStart(2, '0')}:00:00`).getTime();

    return allBookings.some(b => {
      if (b.room_id !== roomId && b.room?.id !== roomId) return false;
      if (['CANCELLED', 'REJECTED'].includes(b.status)) return false;

      const startStr = String(b.start_time).replace('Z', '').replace(' ', 'T');
      const endStr = String(b.end_time).replace('Z', '').replace(' ', 'T');
      const bStart = new Date(startStr).getTime();
      const bEnd = new Date(endStr).getTime();

      return bStart < slotEnd && bEnd > slotStart;
    });
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setFormMsg('');

    const slotObj = HOURLY_TIME_SLOTS.find(s => s.id === selectedSlot);
    if (!bookingDate || !slotObj) {
      setFormMsg('Please select both a date and a time slot.');
      return;
    }

    if (isSlotBooked(slotObj, bookingDate, selectedRoomId)) {
      setFormMsg('Selected slot is already booked for this room. Please pick a free slot.');
      return;
    }

    const startTimeISO = `${bookingDate}T${String(slotObj.startHour).padStart(2, '0')}:00:00`;
    const endTimeISO = `${bookingDate}T${String(slotObj.endHour).padStart(2, '0')}:00:00`;

    try {
      await api.post(`/bookings?user_id=${user.id}`, {
        room_id: selectedRoomId,
        title,
        purpose,
        start_time: startTimeISO,
        end_time: endTimeISO,
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

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Welcome back, {user.full_name}!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Student Dashboard & Campus Resource Manager</p>
        </div>
        <button className="btn-primary" onClick={() => { setFormMsg(''); setIsBookModalOpen(true); }}>
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
                      {new Date(String(b.start_time).replace('Z','').replace(' ','T')).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

          <div className="form-group">
            <label className="form-label">Booking Date</label>
            <input
              type="date"
              className="form-input"
              value={bookingDate}
              min={todayStr}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={14} color="var(--accent-primary)" /> Select Time Slot (8:00 AM — 5:00 PM)
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                🔴 Red = Booked & Disabled
              </span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.35rem' }}>
              {HOURLY_TIME_SLOTS.map((slot) => {
                const booked = isSlotBooked(slot, bookingDate, selectedRoomId);
                const isSelected = selectedSlot === slot.id;

                let bg = 'rgba(255, 255, 255, 0.03)';
                let border = '1px solid var(--border-color)';
                let color = 'var(--text-muted)';
                let labelText = slot.label;

                if (booked) {
                  bg = 'rgba(239, 68, 68, 0.18)';
                  border = '1px solid rgba(239, 68, 68, 0.4)';
                  color = '#f87171';
                  labelText = `${slot.label} (BOOKED)`;
                } else if (isSelected) {
                  bg = 'rgba(99, 102, 241, 0.25)';
                  border = '1px solid var(--accent-primary)';
                  color = '#a5b4fc';
                }

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={booked}
                    onClick={() => setSelectedSlot(slot.id)}
                    title={booked ? 'This slot is already booked' : 'Click to select this slot'}
                    style={{
                      padding: '0.55rem 0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: booked ? 'not-allowed' : 'pointer',
                      textAlign: 'center',
                      border,
                      background: bg,
                      color,
                      opacity: booked ? 0.85 : 1,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {labelText}
                  </button>
                );
              })}
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
