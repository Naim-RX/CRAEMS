import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Check, X, ShieldAlert, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import api from '../../services/api';

export const ResourceManagerDashboard = () => {
  const { user } = useAuth();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [actionMsg, setActionMsg] = useState('');

  const fetchManagerData = async () => {
    try {
      const res = await api.get('/bookings');
      setAllBookings(res.data);
      setPendingBookings(res.data.filter(b => b.status === 'PENDING'));
    } catch (err) {
      console.error('Manager dashboard fetch error:', err);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  const handleReview = async (bookingId, action) => {
    try {
      await api.post(`/bookings/${bookingId}/approve?approver_id=${user.id}`, {
        action,
        comments: `Reviewed by Resource Manager ${user.full_name}`
      });
      setActionMsg(`Booking ${bookingId.slice(0, 8)} successfully ${action.toLowerCase()}!`);
      fetchManagerData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      setActionMsg('Error reviewing booking.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Resource Manager Control Hub</h1>
      </div>

      {actionMsg && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: '#34d399',
          fontSize: '0.85rem'
        }}>
          {actionMsg}
        </div>
      )}

      {/* Pending Approvals Queue */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--accent-warning)" /> Pending Approval Queue ({pendingBookings.length})
          </h3>
        </div>

        {pendingBookings.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Requester</th>
                  <th>Facility</th>
                  <th>Purpose</th>
                  <th>Time Slot</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingBookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{b.booking_reference}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.user?.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user?.role?.name}</div>
                    </td>
                    <td>Room {b.room?.room_number}</td>
                    <td>{b.title}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(b.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn-success"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                          onClick={() => handleReview(b.id, 'APPROVED')}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          className="btn-danger"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                          onClick={() => handleReview(b.id, 'REJECTED')}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No pending room booking requests requiring review.
          </div>
        )}
      </div>

      {/* All Bookings Master Log */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Master Campus Booking Log</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Requester</th>
                <th>Facility</th>
                <th>Title</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allBookings.slice(0, 10).map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.booking_reference}</td>
                  <td>{b.user?.full_name}</td>
                  <td>Room {b.room?.room_number}</td>
                  <td>{b.title}</td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
