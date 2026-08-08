import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Download, Calendar, Box, Users, Clock, CheckCircle, Building2 } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import api from '../../services/api';

export const ReportsPage = () => {
  const [summary, setSummary] = useState({});
  const [bookings, setBookings] = useState([]);
  const [activeReport, setActiveReport] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, bRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/bookings'),
        ]);
        setSummary(sRes.data);
        setBookings(bRes.data);
      } catch (e) { /* silent */ }
    };
    fetchData();
  }, []);

  const reportTabs = [
    { id: 'overview', label: 'System Overview', icon: BarChart2 },
    { id: 'bookings', label: 'Booking Report', icon: Calendar },
    { id: 'utilization', label: 'Utilization Rate', icon: TrendingUp },
  ];

  // Compute booking status breakdown
  const statusBreakdown = {
    APPROVED: bookings.filter(b => b.status === 'APPROVED').length,
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    REJECTED: bookings.filter(b => b.status === 'REJECTED').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
    COMPLETED: bookings.filter(b => b.status === 'COMPLETED').length,
  };

  const handleExportCSV = () => {
    const headers = ['Reference', 'Title', 'Room', 'Status', 'Start Time', 'Attendees'];
    const rows = bookings.map(b => [
      b.booking_reference,
      b.title,
      `Room ${b.room?.room_number || 'N/A'}`,
      b.status,
      new Date(b.start_time).toLocaleString(),
      b.attendees_count
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CRAEMS_Booking_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Reports & Analytics</h1>
        </div>
        <button className="btn-secondary" onClick={handleExportCSV}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Report Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
        {reportTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveReport(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.25rem', background: 'transparent', border: 'none',
              borderBottom: activeReport === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeReport === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: activeReport === tab.id ? 700 : 500,
              cursor: 'pointer', fontSize: '0.9rem', transition: 'var(--transition-fast)'
            }}>
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeReport === 'overview' && (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {[
              { label: 'Total Users', value: summary.total_users || 0, color: 'var(--accent-primary)', icon: Users },
              { label: 'Active Facilities', value: summary.total_rooms || 0, color: 'var(--accent-secondary)', icon: Building2 },
              { label: 'Total Reservations', value: summary.total_bookings || 0, color: '#f59e0b', icon: Calendar },
              { label: 'Pending Approvals', value: summary.pending_bookings || 0, color: '#ec4899', icon: Clock },
              { label: 'Campus Events', value: summary.total_events || 0, color: '#8b5cf6', icon: CheckCircle },
              { label: 'Utilization Rate', value: `${summary.utilization_rate || 0}%`, color: '#06b6d4', icon: TrendingUp },
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: `${kpi.color}22`, padding: '0.875rem', borderRadius: 'var(--radius-sm)', color: kpi.color }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Breakdown */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Booking Status Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(statusBreakdown).map(([status, count]) => {
                const total = bookings.length || 1;
                const pct = Math.round((count / total) * 100);
                const colors = {
                  APPROVED: '#10b981', PENDING: '#f59e0b',
                  REJECTED: '#ef4444', CANCELLED: '#6b7280', COMPLETED: '#6366f1'
                };
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600 }}>{status}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: colors[status] || '#6366f1',
                        borderRadius: '9999px',
                        transition: 'width 0.8s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeReport === 'bookings' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Detailed Booking Report ({bookings.length} records)</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Requester</th>
                  <th>Facility</th>
                  <th>Title</th>
                  <th>Start Time</th>
                  <th>Attendees</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {b.booking_reference}
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{b.user?.full_name || 'N/A'}</td>
                    <td>Room {b.room?.room_number || 'N/A'}</td>
                    <td style={{ fontWeight: 500 }}>{b.title}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(b.start_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ textAlign: 'center' }}>{b.attendees_count}</td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No booking records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'utilization' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Facility Utilization Overview</h3>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '3rem', flexDirection: 'column', gap: '1rem'
          }}>
            <div style={{
              width: '160px', height: '160px', borderRadius: '50%',
              background: `conic-gradient(var(--accent-primary) 0% ${summary.utilization_rate || 0}%, rgba(255,255,255,0.06) ${summary.utilization_rate || 0}% 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                background: 'var(--bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {summary.utilization_rate || 0}%
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>utilized</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
              Campus facility utilization rate based on {summary.total_bookings || 0} reservations across {summary.total_rooms || 0} registered rooms.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
