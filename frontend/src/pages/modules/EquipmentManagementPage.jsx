import React, { useState, useEffect } from 'react';
import { Box, Plus, CheckCircle, ShieldAlert, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
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

export const EquipmentManagementPage = () => {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [selectedEq, setSelectedEq] = useState(null);
  const [reserveDate, setReserveDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('08:00-09:00');
  const [msg, setMsg] = useState('');

  const fetchEquipmentData = async () => {
    try {
      const [eqRes, resRes] = await Promise.allSettled([
        api.get('/equipment'),
        api.get('/equipment/reservations')
      ]);
      if (eqRes.status === 'fulfilled') setEquipmentList(eqRes.value.data);
      if (resRes.status === 'fulfilled' && Array.isArray(resRes.value.data)) {
        setReservations(resRes.value.data);
      }
    } catch (err) {
      console.error('Equipment fetch error:', err);
    }
  };

  useEffect(() => {
    fetchEquipmentData();
  }, []);

  const isSlotBooked = (slot, dateStr, eqId) => {
    if (!dateStr || !eqId) return false;
    const slotStart = new Date(`${dateStr}T${String(slot.startHour).padStart(2, '0')}:00:00`).getTime();
    const slotEnd = new Date(`${dateStr}T${String(slot.endHour).padStart(2, '0')}:00:00`).getTime();

    return reservations.some(r => {
      const rEqId = r.equipment_id || r.equipment?.id;
      if (rEqId !== eqId) return false;
      if (['CANCELLED', 'RETURNED'].includes(r.status)) return false;

      const startStr = String(r.start_time).replace('Z', '').replace(' ', 'T');
      const endStr = String(r.expected_return_time || r.end_time).replace('Z', '').replace(' ', 'T');
      const rStart = new Date(startStr).getTime();
      const rEnd = new Date(endStr).getTime();

      return rStart < slotEnd && rEnd > slotStart;
    });
  };

  const openReserveModal = (item) => {
    setSelectedEq(item);
    setMsg('');
    const dateStr = reserveDate || new Date().toISOString().split('T')[0];
    const freeSlot = HOURLY_TIME_SLOTS.find(s => !isSlotBooked(s, dateStr, item.id));
    if (freeSlot) setSelectedSlot(freeSlot.id);
    setIsReserveModalOpen(true);
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!user) {
      setMsg('Please login to reserve equipment.');
      return;
    }

    const slotObj = HOURLY_TIME_SLOTS.find(s => s.id === selectedSlot);
    if (!reserveDate || !slotObj) {
      setMsg('Please select both a reservation date and a time slot.');
      return;
    }

    if (isSlotBooked(slotObj, reserveDate, selectedEq.id)) {
      setMsg('Selected slot is already reserved for this equipment. Please select an available slot.');
      return;
    }

    const startTimeISO = `${reserveDate}T${String(slotObj.startHour).padStart(2, '0')}:00:00`;
    const returnTimeISO = `${reserveDate}T${String(slotObj.endHour).padStart(2, '0')}:00:00`;

    try {
      await api.post(`/equipment/reserve?user_id=${user.id}`, {
        equipment_id: selectedEq.id,
        start_time: startTimeISO,
        expected_return_time: returnTimeISO
      });
      setMsg('Equipment reserved successfully!');
      setTimeout(() => {
        setIsReserveModalOpen(false);
        setMsg('');
        fetchEquipmentData();
      }, 1200);
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Equipment reservation error.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Serialized Campus Equipment Inventory</h1>
        <p style={{ color: 'var(--text-muted)' }}>AV gear, laboratory instruments, and portable hardware reservations</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Equipment Name</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{item.serial_number}</td>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.category?.name}</td>
                  <td><StatusBadge status={item.condition} /></td>
                  <td>
                    <button
                      className="btn-primary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      onClick={() => openReserveModal(item)}
                    >
                      Reserve Gear
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEq && (
        <Modal isOpen={isReserveModalOpen} onClose={() => setIsReserveModalOpen(false)} title={`Reserve ${selectedEq.name}`}>
          {msg && (
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: msg.includes('successfully') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: msg.includes('successfully') ? '#34d399' : '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {msg}
            </div>
          )}

          <form onSubmit={handleReserve}>
            <div className="form-group">
              <label className="form-label">Serial Tag: {selectedEq.serial_number}</label>
            </div>

            <div className="form-group">
              <label className="form-label">Reservation Date</label>
              <input
                type="date"
                className="form-input"
                value={reserveDate}
                min={todayStr}
                onChange={(e) => setReserveDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} color="var(--accent-primary)" /> Select Time Slot (8:00 AM — 5:00 PM)
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  🔴 Red = Reserved & Disabled
                </span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.35rem' }}>
                {HOURLY_TIME_SLOTS.map((slot) => {
                  const booked = isSlotBooked(slot, reserveDate, selectedEq.id);
                  const isSelected = selectedSlot === slot.id;

                  let bg = 'rgba(255, 255, 255, 0.03)';
                  let border = '1px solid var(--border-color)';
                  let color = 'var(--text-muted)';
                  let labelText = slot.label;

                  if (booked) {
                    bg = 'rgba(239, 68, 68, 0.18)';
                    border = '1px solid rgba(239, 68, 68, 0.4)';
                    color = '#f87171';
                    labelText = `${slot.label} (RESERVED)`;
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
                      title={booked ? 'This slot is already reserved' : 'Click to select this slot'}
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

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
              Confirm Reservation
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
