import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Plus, Building2, Layers, Users, Hash, CheckCircle2 } from 'lucide-react';

/**
 * VenueFormModal — lets Administrators add a new Room / Venue directly from
 * the Campus Events page. Uses the same `/rooms` POST endpoint as the
 * Room Management page so all rooms stay in sync.
 */
export const VenueFormModal = ({ isOpen, onClose, onRoomCreated, buildings = [], floors = [], roomTypes = [] }) => {
  const [form, setForm] = useState({
    room_number: '',
    building_id: '',
    floor_id: '',
    room_type_id: '',
    capacity: 30,
    features: { projector: true, wifi: true, hvac: true }
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      room_number: '',
      building_id: '',
      floor_id: '',
      room_type_id: '',
      capacity: 30,
      features: { projector: true, wifi: true, hvac: true }
    });
    setMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!form.room_number.trim()) { setMsg('Room number is required.'); return; }
    if (!form.building_id || !form.floor_id || !form.room_type_id) {
      setMsg('Please select a building, floor, and room type.');
      return;
    }

    setLoading(true);
    try {
      await onRoomCreated({
        room_number: form.room_number.trim(),
        building_id: Number(form.building_id),
        floor_id: Number(form.floor_id),
        room_type_id: Number(form.room_type_id),
        capacity: Number(form.capacity) || 1,
        is_active: true,
        features: form.features
      });
      setMsg('Venue created successfully! ✓');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1200);
    } catch (err) {
      setMsg(err.response?.data?.detail || err.message || 'Failed to create venue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); resetForm(); }} title="🏢 Add New Campus Venue / Room" maxWidth="600px">
      {msg && (
        <div style={{
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          background: msg.includes('successfully') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${msg.includes('successfully') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: msg.includes('successfully') ? '#34d399' : '#f87171',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {msg.includes('successfully') ? <CheckCircle2 size={16} /> : '⚠️'} {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {/* Room Number */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label"><Hash size={13} style={{ display: 'inline', marginRight: '4px' }} />Room Number / ID *</label>
          <input
            name="room_number"
            value={form.room_number}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. 101, Lab-B, Aud-A"
            required
          />
        </div>

        {/* Building + Floor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Building2 size={13} style={{ display: 'inline', marginRight: '4px' }} />Building *</label>
            <select name="building_id" value={form.building_id} onChange={handleChange} className="form-select" required>
              <option value="">-- Select Building --</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Layers size={13} style={{ display: 'inline', marginRight: '4px' }} />Floor *</label>
            <select name="floor_id" value={form.floor_id} onChange={handleChange} className="form-select" required>
              <option value="">-- Select Floor --</option>
              {floors.map(f => (
                <option key={f.id} value={f.id}>Floor {f.floor_number}{f.floor_name ? ` — ${f.floor_name}` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Room Type + Capacity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Room Type *</label>
            <select name="room_type_id" value={form.room_type_id} onChange={handleChange} className="form-select" required>
              <option value="">-- Select Type --</option>
              {roomTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Users size={13} style={{ display: 'inline', marginRight: '4px' }} />Seating Capacity *</label>
            <input
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              type="number"
              min={1}
              className="form-input"
              required
            />
          </div>
        </div>

        {/* Features quick toggles */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
            Room Features
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['projector', 'wifi', 'hvac'].map(f => (
              <label
                key={f}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                <input
                  type="checkbox"
                  checked={!!form.features[f]}
                  onChange={() => setForm(prev => ({
                    ...prev,
                    features: { ...prev.features, [f]: !prev.features[f] }
                  }))}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                {f}
              </label>
            ))}
          </div>
        </div>

        {/* Error / Info area */}
        {msg && !msg.includes('successfully') && (
          <div style={{ padding: '0.65rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#f87171' }}>
            ⚠️ {msg}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { onClose(); resetForm(); }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
            {loading ? <span style={{ opacity: 0.8 }}>Creating...</span> : <><Plus size={16} /> Create Venue</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};

