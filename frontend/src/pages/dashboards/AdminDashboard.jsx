import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Calendar, Box, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import api from '../../services/api';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [sRes, uRes, aRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/admin/users'),
          api.get('/admin/audit-logs')
        ]);
        setStats(sRes.data);
        setUsersList(uRes.data);
        setAuditLogs(aRes.data);
      } catch (err) {
        console.error('Admin dashboard fetch error:', err);
      }
    };
    fetchAdminData();
  }, []);

  const userColumns = [
    { header: 'Name', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', cell: (row) => <StatusBadge status={row.role?.name} /> },
    { header: 'Department', cell: (row) => row.department?.code || 'N/A' },
    { header: 'Active Status', cell: (row) => <StatusBadge status={row.is_active ? 'ACTIVE' : 'REJECTED'} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>System Administrator Command Center</h1>
        <p style={{ color: 'var(--text-muted)' }}>Enterprise Security, Audit Trail Logs & Multi-Tenant User Governance</p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Users</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.total_users || usersList.length}</div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Facilities Active</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-secondary)', marginTop: '0.25rem' }}>
            {stats.total_rooms || 0}
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

      {/* System Users Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Registered System Users</h3>
        <DataTable columns={userColumns} data={usersList} searchPlaceholder="Search users by name or email..." />
      </div>
    </div>
  );
};
