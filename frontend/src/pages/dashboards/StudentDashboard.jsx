import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Box, Ticket, Clock, Plus, CheckCircle2, QrCode, Tag, MapPin } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { CalendarDatePicker } from '../../components/common/CalendarDatePicker';
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
  const [equipmentReservations, setEquipmentReservations] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Quick Room Booking Modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('08:00-09:00');
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [formMsg, setFormMsg] = useState('');

  const fetchStudentData = async () => {
    if (!user?.id) return;
    try {
      const [bRes, eqRes, evRes, rRes, allBRes] = await Promise.allSettled([
        api.get(`/bookings?user_id=${user.id}`),
        api.get(`/equipment/reservations?user_id=${user.id}`),
        api.get(`/events/user/my-registrations?user_id=${user.id}`),
        api.get('/rooms?is_active=true'),
        api.get('/bookings')
      ]);

      if (bRes.status === 'fulfilled' && Array.isArray(bRes.value.data)) {
        setBookings(bRes.value.data);
      }
      if (eqRes.status === 'fulfilled' && Array.isArray(eqRes.value.data)) {
        setEquipmentReservations(eqRes.value.data);
      }
      if (evRes.status === 'fulfilled' && Array.isArray(evRes.value.data)) {
        setEventRegistrations(evRes.value.data);
      }
      if (rRes.status === 'fulfilled' && Array.isArray(rRes.value.data)) {
        setRooms(rRes.value.data);
        if (rRes.value.data.length > 0 && !selectedRoomId) {
          setSelectedRoomId(rRes.value.data[0].id);
        }
      }
      if (allBRes.status === 'fulfilled' && Array.isArray(allBRes.value.data)) {
        setAllBookings(allBRes.value.data);
      }
    } catch (err) {
      console.error('Student dashboard fetch error:', err);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user?.id]);

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
        fetchStudentData();
      }, 1200);
    } catch (err) {
      setFormMsg(err.response?.data?.detail || 'Booking error. Slot might be conflicted.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length + 
                       equipmentReservations.filter(e => e.status === 'RESERVED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Welcome back, {user?.full_name}!</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Track your room reservations, borrowed equipment, and registered campus event tickets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => { setFormMsg(''); setIsBookModalOpen(true); }}>
            <Plus size={16} /> Quick Reserve Room
          </button>
          <Link to="/equipment" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <Box size={16} /> Borrow Equipment
          </Link>
          <Link to="/events" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <Ticket size={16} /> Browse Events
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setActiveFilter('ROOMS')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Room Bookings</div>
            <Calendar size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem' }}>{bookings.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Active & past room bookings</div>
        </div>

        <div className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setActiveFilter('EQUIPMENT')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Equipment Loans</div>
            <Box size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '0.35rem' }}>{equipmentReservations.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Lab & AV equipment loans</div>
        </div>

        <div className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setActiveFilter('EVENTS')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Events</div>
            <Ticket size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa', marginTop: '0.35rem' }}>{eventRegistrations.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Confirmed event passes</div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Approvals</div>
            <Clock size={18} color="var(--accent-warning)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-warning)', marginTop: '0.35rem' }}>{pendingCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Awaiting manager review</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'ALL', label: 'All Activity' },
          { id: 'ROOMS', label: `🏛️ Room Bookings (${bookings.length})` },
          { id: 'EQUIPMENT', label: `🔬 Equipment Loans (${equipmentReservations.length})` },
          { id: 'EVENTS', label: `🎟️ Event Registrations (${eventRegistrations.length})` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveFilter(t.id)}
            style={{
              padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
              border: activeFilter === t.id ? '1px solid var(--accent-primary)' : '1px solid transparent',
              background: activeFilter === t.id ? 'rgba(40, 167, 69, 0.12)' : 'transparent',
              color: activeFilter === t.id ? '#28A745' : 'var(--text-muted)',
              fontWeight: activeFilter === t.id ? 700 : 500,
              fontSize: '0.875rem', cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SECTION 1: ROOM RESERVATIONS ──────────────── */}
      {(activeFilter === 'ALL' || activeFilter === 'ROOMS') && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Room & Facility Bookings</h3>
            </div>
            <Link to="/rooms" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Browse Rooms &rarr;
            </Link>
          </div>

          {bookings.length > 0 ? (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Facility</th>
                    <th>Title & Purpose</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                        {b.booking_reference}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>Room {b.room?.room_number || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {b.room?.building?.name || b.room?.building?.code || 'Main Building'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.purpose}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(String(b.start_time).replace('Z','').replace(' ','T')).toLocaleString([], {
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No room bookings found. Click "Quick Reserve Room" to request a room.
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 2: EQUIPMENT RESERVATIONS ──────────── */}
      {(activeFilter === 'ALL' || activeFilter === 'EQUIPMENT') && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Box size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Equipment Loan Reservations</h3>
            </div>
            <Link to="/equipment" style={{ fontSize: '0.85rem', color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
              Borrow More Equipment &rarr;
            </Link>
          </div>

          {equipmentReservations.length > 0 ? (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Equipment Item</th>
                    <th>Serial Number</th>
                    <th>Category</th>
                    <th>Loan Period</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentReservations.map(eq => (
                    <tr key={eq.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{eq.equipment?.name || 'Equipment Item'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Condition: {eq.equipment?.condition || 'GOOD'}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main)' }}>
                        {eq.equipment?.serial_number || 'N/A'}
                      </td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '4px',
                          background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem'
                        }}>
                          {eq.equipment?.category?.name || 'Hardware'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div>From: {new Date(String(eq.start_time).replace('Z','').replace(' ','T')).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          To: {new Date(String(eq.expected_return_time).replace('Z','').replace(' ','T')).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td><StatusBadge status={eq.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No equipment reservations found. Visit the Equipment Inventory to loan AV or Lab gear.
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 3: REGISTERED EVENTS ───────────────── */}
      {(activeFilter === 'ALL' || activeFilter === 'EVENTS') && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ticket size={20} color="#8b5cf6" />
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Registered Campus Events & Passes</h3>
            </div>
            <Link to="/events" style={{ fontSize: '0.85rem', color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>
              Find More Events &rarr;
            </Link>
          </div>

          {eventRegistrations.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
              {eventRegistrations.map(reg => {
                const event = reg.event;
                return (
                  <div
                    key={reg.id}
                    className="glass-card"
                    style={{
                      display: 'flex', flexDirection: 'column', gap: '0.85rem',
                      border: '1px solid var(--border-color)', position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '4px',
                          background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
                          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase'
                        }}>
                          {event?.category?.name || 'CAMPUS EVENT'}
                        </span>
                        <h4 style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '1.05rem', fontWeight: 700 }}>
                          {event?.title || 'Event Registration'}
                        </h4>
                      </div>
                      <StatusBadge status={reg.status || 'CONFIRMED'} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} color="var(--accent-primary)" />
                        <span>
                          {event?.start_time ? new Date(event.start_time).toLocaleString([], {
                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          }) : 'Date TBD'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} color="#10b981" />
                        <span>
                          {event?.room ? `Room ${event.room.room_number} (${event.room.building?.name || 'Main'})` : 'Online / Main Auditorium'}
                        </span>
                      </div>
                    </div>

                    {/* Ticket Code Tag */}
                    <div style={{
                      marginTop: 'auto', paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <QrCode size={16} color="var(--accent-secondary)" />
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                          {reg.ticket_code || 'TKT-VALID'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Registered {new Date(reg.registered_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              You haven't registered for any events yet. Explore upcoming campus events on the Event Management page!
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: QUICK ROOM BOOKING ─────────────────── */}
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
            <CalendarDatePicker
              value={bookingDate}
              min={todayStr}
              onChange={(val) => setBookingDate(val)}
              required
              placeholder="Select reservation date..."
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
                let color = 'var(--text-main)';
                let labelText = slot.label;

                if (booked) {
                  bg = '#dc2626';
                  border = '1px solid #b91c1c';
                  color = '#ffffff';
                  labelText = `${slot.label} (BOOKED)`;
                } else if (isSelected) {
                  bg = 'rgba(99, 102, 241, 0.25)';
                  border = '1px solid var(--accent-primary)';
                  color = 'var(--accent-secondary)';
                }

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={booked}
                    onClick={() => setSelectedSlot(slot.id)}
                    title={booked ? 'This slot is already booked' : 'Click to select this slot'}
                    style={{
                      padding: '0.55rem 0.25rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: booked ? 'not-allowed' : 'pointer',
                      textAlign: 'center',
                      border,
                      background: bg,
                      color,
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
            <label className="form-label">Expected Attendees</label>
            <input type="number" min="1" max="500" className="form-input" value={attendeesCount} onChange={(e) => setAttendeesCount(e.target.value)} required />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Submit Room Booking Request
          </button>
        </form>
      </Modal>
    </div>
  );
};
