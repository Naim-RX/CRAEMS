import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Calendar, Box, ShieldCheck, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import api from '../../services/api';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState({ room_bookings: [], equipment_reservations: [], event_requests: [] });
  const [activeTab, setActiveTab] = useState('ALL');
  const [actionMsg, setActionMsg] = useState('');

  const fetchAdminData = async () => {
    try {
      const [sRes, uRes, pRes] = await Promise.allSettled([
        api.get('/reports/summary'),
        api.get('/admin/users'),
        api.get('/admin/pending-requests')
      ]);
      if (sRes.status === 'fulfilled') setStats(sRes.value.data);
      if (uRes.status === 'fulfilled') setUsersList(uRes.value.data);
      if (pRes.status === 'fulfilled') setPendingRequests(pRes.value.data);
    } catch (err) {
      console.error('Admin dashboard fetch error:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleReviewRequest = async (requestType, requestId, action) => {
    setActionMsg('');
    try {
      await api.post('/admin/requests/review', {
        request_type: requestType,
        request_id: requestId,
        action: action
      });
      setActionMsg(`Request ${action === 'APPROVE' ? 'Approved' : 'Rejected'} successfully!`);
      setTimeout(() => {
        setActionMsg('');
        fetchAdminData();
      }, 1200);
    } catch (err) {
      setActionMsg(err.response?.data?.detail || 'Failed to update request.');
    }
  };

  const userColumns = [
    { header: 'Name', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', cell: (row) => <StatusBadge status={row.role?.name} /> },
    { header: 'Department', cell: (row) => row.department?.code || 'N/A' },
    { header: 'Active Status', cell: (row) => <StatusBadge status={row.is_active ? 'ACTIVE' : 'REJECTED'} /> }
  ];

  const totalPendingCount = 
    (pendingRequests.room_bookings?.length || 0) + 
    (pendingRequests.equipment_reservations?.length || 0) + 
    (pendingRequests.event_requests?.length || 0);

  const allPendingItems = [
    ...(pendingRequests.room_bookings || []),
    ...(pendingRequests.equipment_reservations || []),
    ...(pendingRequests.event_requests || [])
  ];

  const filteredItems = activeTab === 'ALL' ? allPendingItems :
    activeTab === 'ROOMS' ? (pendingRequests.room_bookings || []) :
    activeTab === 'EQUIPMENT' ? (pendingRequests.equipment_reservations || []) :
    (pendingRequests.event_requests || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>System Administrator Command Center</h1>
        <p style={{ color: 'var(--text-muted)' }}>Enterprise Security, Approval Governance & Resource Control</p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Users</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.total_users || usersList.length}</div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Approvals</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-warning)', marginTop: '0.25rem' }}>
            {totalPendingCount}
          </div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Reservations</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
            {stats.total_bookings || 0}
          </div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>System Health</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Activity size={18} /> 99.9% UPTIME
          </div>
        </div>
      </div>

      {/* PENDING APPROVAL REQUESTS SECTION */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--accent-warning)" /> Pending Request Approval Center
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Review and accept or reject pending facility bookings, equipment loans & campus event requests</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.3rem', borderRadius: 'var(--radius-sm)' }}>
            <button
              onClick={() => setActiveTab('ALL')}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'ALL' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'ALL' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600
              }}
            >
              All ({totalPendingCount})
            </button>
            <button
              onClick={() => setActiveTab('ROOMS')}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'ROOMS' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'ROOMS' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600
              }}
            >
              Rooms ({pendingRequests.room_bookings?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('EQUIPMENT')}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'EQUIPMENT' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'EQUIPMENT' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600
              }}
            >
              Equipment ({pendingRequests.equipment_reservations?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('EVENTS')}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'EVENTS' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'EVENTS' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600
              }}
            >
              Events ({pendingRequests.event_requests?.length || 0})
            </button>
          </div>
        </div>

        {actionMsg && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: actionMsg.includes('Approved') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: actionMsg.includes('Approved') ? '#34d399' : '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {actionMsg}
          </div>
        )}

        {filteredItems.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Request Type</th>
                  <th>Title / Purpose</th>
                  <th>Requester & Role</th>
                  <th>Details</th>
                  <th>Time Slot</th>
                  <th>Decision Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td>
                      <span className={`badge badge-${item.type === 'ROOM_BOOKING' ? 'active' : item.type === 'EQUIPMENT_RESERVATION' ? 'warning' : 'secondary'}`}>
                        {item.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.purpose}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.requester}</div>
                      <span className="badge badge-student" style={{ fontSize: '0.65rem' }}>{item.requester_role}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{item.details}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.time_slot}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn-primary"
                          style={{ background: '#10b981', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => handleReviewRequest(item.type, item.id, 'APPROVE')}
                        >
                          <CheckCircle size={14} /> Accept
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ borderColor: '#ef4444', color: '#f87171', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => handleReviewRequest(item.type, item.id, 'REJECT')}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No pending requests requiring approval in this category.
          </div>
        )}
      </div>

      {/* System Users Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Registered System Users</h3>
        <DataTable columns={userColumns} data={usersList} searchPlaceholder="Search users by name or email..." />
      </div>
    </div>
  );
};

