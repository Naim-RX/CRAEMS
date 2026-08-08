import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Calendar, Box, ShieldCheck, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import api from '../../services/api';

export const AdminDashboard = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === '/audit') {
      setActiveTab('AUDIT');
    }
  }, [location]);
  const [stats, setStats] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState({ room_bookings: [], equipment_reservations: [], event_requests: [] });
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(50);
  const [auditFilters, setAuditFilters] = useState({ entity: '', action: '', user_id: '', start_date: '', end_date: '' });
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

  // Fetch audit logs with current filters & pagination
  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: auditPage.toString(),
        page_size: auditPageSize.toString(),
        ...(auditFilters.entity && { entity: auditFilters.entity }),
        ...(auditFilters.action && { action: auditFilters.action }),
        ...(auditFilters.user_id && { user_id: auditFilters.user_id }),
        ...(auditFilters.start_date && { start_date: auditFilters.start_date }),
        ...(auditFilters.end_date && { end_date: auditFilters.end_date })
      });
      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      setAuditLogs(res.data.items);
      setAuditTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Fetch audit logs when audit tab or filters change
  useEffect(() => {
    if (activeTab === 'AUDIT') {
      fetchAuditLogs();
    }
  }, [activeTab, auditPage, auditPageSize, auditFilters]);

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
          <button
          onClick={() => setActiveTab('AUDIT')}
          style={{
            padding: '0.4rem 0.85rem',
            fontSize: '0.8rem',
            borderRadius: 'var(--radius-xs)',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'AUDIT' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'AUDIT' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600
          }}
        >
          Audit Logs
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
{activeTab === 'AUDIT' && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Audit Logs</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <select
              value={auditFilters.entity}
              onChange={e => setAuditFilters({ ...auditFilters, entity: e.target.value })}
              style={{ padding: '0.3rem', borderRadius: 'var(--radius-xs)' }}
            >
              <option value="">All Entities</option>
              <option value="USER">User</option>
              <option value="ROOM">Room</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="EVENT">Event</option>
              <option value="ROOM_BOOKING">Room Booking</option>
              <option value="EQUIPMENT_RESERVATION">Equipment Reservation</option>
              <option value="EVENT_ORGANIZATION">Event Organization</option>
            </select>
            <select
              value={auditFilters.action}
              onChange={e => setAuditFilters({ ...auditFilters, action: e.target.value })}
              style={{ padding: '0.3rem', borderRadius: 'var(--radius-xs)' }}
            >
              <option value="">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="APPROVE">APPROVE</option>
              <option value="REJECT">REJECT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              placeholder="User ID"
              value={auditFilters.user_id}
              onChange={e => setAuditFilters({ ...auditFilters, user_id: e.target.value })}
              style={{ padding: '0.3rem', borderRadius: 'var(--radius-xs)' }}
            />
            <input
              type="date"
              value={auditFilters.start_date}
              onChange={e => setAuditFilters({ ...auditFilters, start_date: e.target.value })}
              style={{ padding: '0.3rem', borderRadius: 'var(--radius-xs)' }}
            />
            <input
              type="date"
              value={auditFilters.end_date}
              onChange={e => setAuditFilters({ ...auditFilters, end_date: e.target.value })}
              style={{ padding: '0.3rem', borderRadius: 'var(--radius-xs)' }}
            />
            <button
              onClick={() => { setAuditPage(1); fetchAuditLogs(); }}
              style={{ padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-xs)', background: 'var(--accent-primary)', color: '#fff', border: 'none' }}
            >
              Apply
            </button>
          </div>
          <DataTable
            columns={[
              { header: 'ID', accessor: 'id' },
              { header: 'Timestamp', accessor: 'timestamp' },
              { header: 'User', accessor: 'user_id' },
              { header: 'Entity', accessor: 'entity_name' },
              { header: 'Entity ID', accessor: 'entity_id' },
              { header: 'Action', accessor: 'action' },
              { header: 'IP', accessor: 'ip_address' },
              { header: 'Changes', accessor: 'changes' },
            ]}
            data={auditLogs}
            searchPlaceholder="Search audit logs..."
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <button
              disabled={auditPage === 1}
              onClick={() => setAuditPage(prev => Math.max(prev - 1, 1))}
              style={{ padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-xs)', background: auditPage === 1 ? '#ccc' : 'var(--accent-primary)', color: '#fff', border: 'none', cursor: auditPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Prev
            </button>
            <span>Page {auditPage}</span>
            <button
              disabled={(auditPage * auditPageSize) >= auditTotal}
              onClick={() => setAuditPage(prev => prev + 1)}
              style={{ padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-xs)', background: (auditPage * auditPageSize) >= auditTotal ? '#ccc' : 'var(--accent-primary)', color: '#fff', border: 'none', cursor: (auditPage * auditPageSize) >= auditTotal ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
