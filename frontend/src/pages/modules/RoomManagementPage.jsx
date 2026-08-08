import React, { useState, useEffect } from 'react';
import { Building2, Search, Filter, Plus, Calendar as CalendarIcon, CheckCircle, Clock, AlertCircle, Edit } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { CalendarDatePicker } from '../../components/common/CalendarDatePicker';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const HOURLY_TIME_SLOTS = [
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

export const RoomManagementPage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [targetRoom, setTargetRoom] = useState(null);

  // Admin Add Room state
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newBuildingId, setNewBuildingId] = useState(1);
  const [newFloorId, setNewFloorId] = useState(1);
  const [newRoomTypeId, setNewRoomTypeId] = useState(1);
  const [newCapacity, setNewCapacity] = useState(30);
  const [addRoomMsg, setAddRoomMsg] = useState('');

  // Admin Edit Room state
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [editRoomId, setEditRoomId] = useState(null);
  const [editRoomNumber, setEditRoomNumber] = useState('');
  const [editBuildingId, setEditBuildingId] = useState(1);
  const [editFloorId, setEditFloorId] = useState(1);
  const [editRoomTypeId, setEditRoomTypeId] = useState(1);
  const [editCapacity, setEditCapacity] = useState(30);
  const [editRoomMsg, setEditRoomMsg] = useState('');

  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('08:00-09:00');
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [formMsg, setFormMsg] = useState('');

  const fetchRoomsData = async () => {
    try {
      let url = '/rooms?is_active=true';
      if (selectedBuilding) url += `&building_id=${selectedBuilding}`;
      if (minCapacity > 0) url += `&min_capacity=${minCapacity}`;
      
      const [rRes, bRes, bkRes, tRes, eRes] = await Promise.allSettled([
        api.get(url),
        api.get('/rooms/buildings'),
        api.get('/bookings'),
        api.get('/rooms/types'),
        api.get('/events')
      ]);
      if (rRes.status === 'fulfilled') setRooms(rRes.value.data);
      if (bRes.status === 'fulfilled') {
        setBuildings(bRes.value.data);
        if (bRes.value.data.length > 0 && !newBuildingId) setNewBuildingId(bRes.value.data[0].id);
      }
      if (bkRes.status === 'fulfilled') setAllBookings(Array.isArray(bkRes.value.data) ? bkRes.value.data : []);
      if (eRes.status === 'fulfilled') setAllEvents(Array.isArray(eRes.value.data) ? eRes.value.data : []);
      if (tRes.status === 'fulfilled') {
        setRoomTypes(tRes.value.data);
        if (tRes.value.data.length > 0 && !newRoomTypeId) setNewRoomTypeId(tRes.value.data[0].id);
      }
    } catch (err) {
      console.error('Room management fetch error:', err);
    }
  };

  useEffect(() => {
    fetchRoomsData();
  }, [selectedBuilding, minCapacity]);

  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    setAddRoomMsg('');
    try {
      await api.post('/rooms', {
        room_number: newRoomNumber,
        building_id: Number(newBuildingId),
        floor_id: Number(newFloorId),
        room_type_id: Number(newRoomTypeId),
        capacity: Number(newCapacity),
        is_active: true,
        features: { projector: true, wifi: true, hvac: true }
      });
      setAddRoomMsg('Room added successfully!');
      setTimeout(() => {
        setIsAddRoomModalOpen(false);
        setNewRoomNumber('');
        setAddRoomMsg('');
        fetchRoomsData();
      }, 1000);
    } catch (err) {
      setAddRoomMsg(err.response?.data?.detail || 'Failed to add new room.');
    }
  };

  const openEditRoomModal = (room) => {
    setEditRoomId(room.id);
    setEditRoomNumber(room.room_number);
    setEditBuildingId(room.building_id || room.building?.id || 1);
    setEditFloorId(room.floor_id || room.floor?.id || 1);
    setEditRoomTypeId(room.room_type_id || room.room_type?.id || 1);
    setEditCapacity(room.capacity);
    setEditRoomMsg('');
    setIsEditRoomModalOpen(true);
  };

  const handleEditRoomSubmit = async (e) => {
    e.preventDefault();
    setEditRoomMsg('');
    try {
      await api.put(`/rooms/${editRoomId}`, {
        room_number: editRoomNumber,
        building_id: Number(editBuildingId),
        floor_id: Number(editFloorId),
        room_type_id: Number(editRoomTypeId),
        capacity: Number(editCapacity)
      });
      setEditRoomMsg('Room updated successfully!');
      setTimeout(() => {
        setIsEditRoomModalOpen(false);
        setEditRoomMsg('');
        fetchRoomsData();
      }, 1000);
    } catch (err) {
      setEditRoomMsg(err.response?.data?.detail || 'Failed to update room.');
    }
  };


  const isSlotBooked = (slot, dateStr, roomId) => {
    if (!dateStr || !roomId) return false;
    const slotStart = new Date(`${dateStr}T${String(slot.startHour).padStart(2, '0')}:00:00`).getTime();
    const slotEnd = new Date(`${dateStr}T${String(slot.endHour).padStart(2, '0')}:00:00`).getTime();

    const hasBookingConflict = allBookings.some(b => {
      if (b.room_id !== roomId && b.room?.id !== roomId) return false;
      if (['CANCELLED', 'REJECTED'].includes(b.status)) return false;

      const startStr = String(b.start_time).replace('Z', '').replace(' ', 'T');
      const endStr = String(b.end_time).replace('Z', '').replace(' ', 'T');
      const bStart = new Date(startStr).getTime();
      const bEnd = new Date(endStr).getTime();

      return bStart < slotEnd && bEnd > slotStart;
    });

    if (hasBookingConflict) return true;

    return allEvents.some(e => {
      if (e.room_id !== roomId && e.room?.id !== roomId) return false;
      if (e.is_deleted || ['REJECTED', 'CANCELLED'].includes(e.status)) return false;

      const startStr = String(e.start_time).replace('Z', '').replace(' ', 'T');
      const endStr = String(e.end_time || e.start_time).replace('Z', '').replace(' ', 'T');
      const eStart = new Date(startStr).getTime();
      const eEnd = new Date(endStr).getTime();

      return eStart < slotEnd && eEnd > slotStart;
    });
  };

  const openBookingForRoom = (room) => {
    setTargetRoom(room);
    setAttendeesCount(Math.min(room.capacity, 10));
    setFormMsg('');
    
    const dateStr = bookingDate || new Date().toISOString().split('T')[0];
    const freeSlot = HOURLY_TIME_SLOTS.find(s => !isSlotBooked(s, dateStr, room.id));
    setSelectedSlot(freeSlot ? freeSlot.id : null);
    
    setIsBookModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setFormMsg('');
    if (!user) {
      setFormMsg('Please login to reserve a facility.');
      return;
    }

    const slotObj = HOURLY_TIME_SLOTS.find(s => s.id === selectedSlot);
    if (!bookingDate || !slotObj) {
      setFormMsg('Please select both a booking date and a time slot.');
      return;
    }

    if (isSlotBooked(slotObj, bookingDate, targetRoom.id)) {
      setFormMsg('Selected slot is already booked. Please pick a free slot.');
      return;
    }

    const startTimeISO = `${bookingDate}T${String(slotObj.startHour).padStart(2, '0')}:00:00`;
    const endTimeISO = `${bookingDate}T${String(slotObj.endHour).padStart(2, '0')}:00:00`;

    try {
      await api.post(`/bookings?user_id=${user.id}`, {
        room_id: targetRoom.id,
        title,
        purpose,
        start_time: startTimeISO,
        end_time: endTimeISO,
        attendees_count: Number(attendeesCount)
      });
      setFormMsg('Reservation request submitted successfully!');
      setTimeout(() => {
        setIsBookModalOpen(false);
        setFormMsg('');
        fetchRoomsData();
      }, 1200);
    } catch (err) {
      setFormMsg(err.response?.data?.detail || 'Booking conflict detected for this slot.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Campus Room & Facility Catalog</h1>
        </div>
        {user?.role?.name === 'ADMINISTRATOR' && (
          <button className="btn-primary" onClick={() => { setAddRoomMsg(''); setIsAddRoomModalOpen(true); }}>
            <Plus size={18} /> Add New Room
          </button>
        )}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                <span className="badge badge-active">{room.room_type?.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StatusBadge status={room.is_maintenance ? 'DAMAGED' : 'AVAILABLE'} />
                  {user?.role?.name === 'ADMINISTRATOR' && (
                    <button 
                      onClick={() => openEditRoomModal(room)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: 'var(--text-muted)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Edit Room Details"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                </div>
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

            <div className="form-group">
              <label className="form-label">Booking Date</label>
              <CalendarDatePicker
                value={bookingDate}
                min={todayStr}
                onChange={(val) => {
                  setBookingDate(val);
                  if (targetRoom) {
                    const currentSlot = HOURLY_TIME_SLOTS.find(s => s.id === selectedSlot);
                    if (!currentSlot || isSlotBooked(currentSlot, val, targetRoom.id)) {
                      const freeSlot = HOURLY_TIME_SLOTS.find(s => !isSlotBooked(s, val, targetRoom.id));
                      setSelectedSlot(freeSlot ? freeSlot.id : null);
                    }
                  }
                }}
                required
                placeholder="Select booking date..."
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} color="var(--accent-primary)" /> Time Slots (8:00 AM — 5:00 PM)
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  🔴 Red = Booked & Disabled
                </span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.35rem' }}>
                {HOURLY_TIME_SLOTS.map((slot) => {
                  const booked = isSlotBooked(slot, bookingDate, targetRoom.id);
                  const isSelected = selectedSlot === slot.id;

                  let bg = 'rgba(255, 255, 255, 0.03)';
                  let border = '1px solid var(--border-color)';
                  let color = 'var(--text-muted)';
                  let labelText = slot.label;

                  if (booked) {
                    bg = '#dc2626'; // Solid red
                    border = '1px solid #b91c1c';
                    color = '#ffffff';
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
                        padding: '0.55rem 0.25rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: booked ? 'not-allowed' : 'pointer',
                        textAlign: 'center',
                        border,
                        background: bg,
                        color,
                        opacity: 1,
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
              <label className="form-label">Attendees Count (Max: {targetRoom.capacity})</label>
              <input type="number" min="1" max={targetRoom.capacity} className="form-input" value={attendeesCount} onChange={(e) => setAttendeesCount(e.target.value)} required />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
              Submit Booking Request
            </button>
          </form>
        </Modal>
      )}

      {/* Admin Add Room Modal */}
      <Modal isOpen={isAddRoomModalOpen} onClose={() => setIsAddRoomModalOpen(false)} title="Add New Campus Facility / Room">
        {addRoomMsg && (
          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            background: addRoomMsg.includes('successfully') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: addRoomMsg.includes('successfully') ? '#34d399' : '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            {addRoomMsg}
          </div>
        )}

        <form onSubmit={handleAddRoomSubmit}>
          <div className="form-group">
            <label className="form-label">Room Number / ID</label>
            <input type="text" className="form-input" placeholder="e.g. 101, Lab-B, Aud-A" value={newRoomNumber} onChange={(e) => setNewRoomNumber(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Building</label>
              <select className="form-select" value={newBuildingId} onChange={(e) => setNewBuildingId(e.target.value)}>
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Floor</label>
              <select className="form-select" value={newFloorId} onChange={(e) => setNewFloorId(e.target.value)}>
                <option value={1}>1st Floor</option>
                <option value={2}>2nd Floor</option>
                <option value={3}>3rd Floor</option>
                <option value={4}>4th Floor</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Room Type</label>
              <select className="form-select" value={newRoomTypeId} onChange={(e) => setNewRoomTypeId(e.target.value)}>
                {roomTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Seating Capacity</label>
              <input type="number" min="1" className="form-input" value={newCapacity} onChange={(e) => setNewCapacity(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Create Room
          </button>
        </form>
      </Modal>

      {/* Admin Edit Room Modal */}
      <Modal isOpen={isEditRoomModalOpen} onClose={() => setIsEditRoomModalOpen(false)} title="Edit Campus Facility / Room">
        {editRoomMsg && (
          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            background: editRoomMsg.includes('successfully') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: editRoomMsg.includes('successfully') ? '#34d399' : '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            {editRoomMsg}
          </div>
        )}

        <form onSubmit={handleEditRoomSubmit}>
          <div className="form-group">
            <label className="form-label">Room Number / ID</label>
            <input type="text" className="form-input" placeholder="e.g. 101, Lab-B, Aud-A" value={editRoomNumber} onChange={(e) => setEditRoomNumber(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Building</label>
              <select className="form-select" value={editBuildingId} onChange={(e) => setEditBuildingId(e.target.value)}>
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Floor</label>
              <select className="form-select" value={editFloorId} onChange={(e) => setEditFloorId(e.target.value)}>
                <option value={1}>1st Floor</option>
                <option value={2}>2nd Floor</option>
                <option value={3}>3rd Floor</option>
                <option value={4}>4th Floor</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Room Type</label>
              <select className="form-select" value={editRoomTypeId} onChange={(e) => setEditRoomTypeId(e.target.value)}>
                {roomTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Seating Capacity</label>
              <input type="number" min="1" className="form-input" value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Update Room
          </button>
        </form>
      </Modal>
    </div>
  );
};

