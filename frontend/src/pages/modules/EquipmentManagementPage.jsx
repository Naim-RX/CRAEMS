import React, { useState, useEffect } from 'react';
import { Box, Plus, CheckCircle, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const EquipmentManagementPage = () => {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState([]);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [selectedEq, setSelectedEq] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [msg, setMsg] = useState('');

  const fetchEquipment = async () => {
    try {
      const res = await api.get('/equipment');
      setEquipmentList(res.data);
    } catch (err) {
      console.error('Equipment fetch error:', err);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleReserve = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!user) {
      setMsg('Please login to reserve equipment.');
      return;
    }

    try {
      await api.post(`/equipment/reserve?user_id=${user.id}`, {
        equipment_id: selectedEq.id,
        start_time: new Date(startTime).toISOString(),
        expected_return_time: new Date(returnTime).toISOString()
      });
      setMsg('Equipment reserved successfully!');
      setTimeout(() => {
        setIsReserveModalOpen(false);
        setMsg('');
        fetchEquipment();
      }, 1200);
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Equipment reservation error.');
    }
  };

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
                <th>Availability</th>
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
                  <td><StatusBadge status={item.is_available ? 'AVAILABLE' : 'RESERVED'} /></td>
                  <td>
                    <button
                      className="btn-primary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      disabled={!item.is_available}
                      onClick={() => { setSelectedEq(item); setIsReserveModalOpen(true); }}
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
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {msg}
            </div>
          )}

          <form onSubmit={handleReserve}>
            <div className="form-group">
              <label className="form-label">Serial Tag: {selectedEq.serial_number}</label>
            </div>

            <div className="form-group">
              <label className="form-label">Start Check-out Time</label>
              <input type="datetime-local" className="form-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Expected Return Time</label>
              <input type="datetime-local" className="form-input" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} required />
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
