import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import api from '../../services/api';
import {
  Users, Search, Download, RefreshCw, CheckCircle2, Clock,
  Mail, Phone, Building2, Copy, Check, Filter, XCircle, QrCode
} from 'lucide-react';

export const EventAttendeesModal = ({ isOpen, onClose, event }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ATTENDED, REGISTERED, CANCELLED
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchRegistrations = useCallback(async () => {
    if (!event?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/events/${event.id}/registrations`);
      setRegistrations(res.data || []);
    } catch (err) {
      console.error('Failed to fetch event registrations:', err);
      setError(err.response?.data?.detail || 'Failed to load attendee list.');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [event?.id]);

  useEffect(() => {
    if (isOpen && event?.id) {
      fetchRegistrations();
      setSearchTerm('');
      setStatusFilter('ALL');
    }
  }, [isOpen, event?.id, fetchRegistrations]);

  const handleCopyTicket = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExportCSV = async () => {
    if (!event) return;
    try {
      const res = await api.get(`/events/${event.id}/export-participants`);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Attendees_${event.title.replace(/[^a-z0-9]/gi, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export participants:', err);
      // Fallback client-side CSV generation
      const headers = ['Ticket Code', 'Full Name', 'Email', 'Role', 'Department', 'Registration Date', 'Attendance Status', 'Payment Status'];
      const rows = registrations.map(r => {
        const u = r.user || {};
        const isAttended = !!r.attendance;
        const regDate = r.registered_at ? new Date(r.registered_at).toLocaleString() : 'N/A';
        return [
          `"${r.ticket_code}"`,
          `"${u.full_name || 'Anonymous'}"`,
          `"${u.email || 'N/A'}"`,
          `"${u.role?.name || 'STUDENT'}"`,
          `"${u.department?.code || 'N/A'}"`,
          `"${regDate}"`,
          `"${isAttended ? 'Attended' : 'Registered'}"`,
          `"${r.payment_status || 'FREE'}"`
        ];
      });
      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Attendees_${event.title.replace(/[^a-z0-9]/gi, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (!event) return null;

  // Filtered registrations
  const filtered = registrations.filter(r => {
    const u = r.user || {};
    const nameMatch = (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const ticketMatch = (r.ticket_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const deptMatch = (u.department?.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (u.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSearch = nameMatch || emailMatch || ticketMatch || deptMatch;

    if (!matchesSearch) return false;

    if (statusFilter === 'ATTENDED') {
      return !!r.attendance || r.attendance_status === 'PRESENT';
    }
    if (statusFilter === 'REGISTERED') {
      return !r.attendance && r.status !== 'CANCELLED';
    }
    if (statusFilter === 'CANCELLED') {
      return r.status === 'CANCELLED';
    }
    return true;
  });

  const totalRegistered = registrations.filter(r => r.status !== 'CANCELLED').length;
  const attendedCount = registrations.filter(r => !!r.attendance || r.attendance_status === 'PRESENT').length;
  const pendingCount = Math.max(0, totalRegistered - attendedCount);
  const seatsLeft = Math.max(0, event.max_seats - totalRegistered);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`👥 Registered Students — ${event.title}`}
      maxWidth="980px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Header Event Summary */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.25rem',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-active" style={{ fontSize: '0.72rem' }}>
                {event.category?.name || 'CAMPUS EVENT'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                📍 Room {event.room?.room_number || 'TBD'} ({event.room?.building?.code || 'Campus'})
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
              🕒 {new Date(event.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="btn-secondary"
              onClick={fetchRegistrations}
              disabled={loading}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              title="Refresh attendee list"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              className="btn-primary"
              onClick={handleExportCSV}
              disabled={registrations.length === 0}
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.85rem'
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Registered
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
              {totalRegistered} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-dim)' }}>/ {event.max_seats}</span>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Checked In / Attended
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', marginTop: '0.2rem' }}>
              {attendedCount}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending Check-In
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', marginTop: '0.2rem' }}>
              {pendingCount}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Seats Available
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: seatsLeft > 0 ? 'var(--text-main)' : '#d32f2f', marginTop: '0.2rem' }}>
              {seatsLeft}
            </div>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by student name, email, department, or ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', paddingRight: '1rem', fontSize: '0.85rem', height: '38px' }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {[
              { key: 'ALL', label: 'All Attendees' },
              { key: 'ATTENDED', label: 'Checked In' },
              { key: 'REGISTERED', label: 'Pending Check-In' }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: statusFilter === tab.key ? 700 : 500,
                  borderRadius: 'var(--radius-xs)',
                  border: statusFilter === tab.key ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  background: statusFilter === tab.key ? 'var(--accent-green-light)' : 'var(--bg-secondary)',
                  color: statusFilter === tab.key ? 'var(--accent-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: '#FFEBEE',
            border: '1px solid rgba(211, 47, 47, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#d32f2f',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        {/* Attendees Data Table */}
        <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
              <div>Loading registered students...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Users size={36} color="var(--text-dim)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                {searchTerm || statusFilter !== 'ALL' ? 'No matching registrations found' : 'No students registered yet'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your search query or filter criteria.'
                  : 'Registrations will appear here in real-time as students sign up for this event.'}
              </div>
            </div>
          ) : (
            <table className="custom-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem 1rem' }}>Student / Attendee</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Contact Info</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Department</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Ticket Code</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Registration Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const u = r.user || {};
                  const isAttended = !!r.attendance || r.attendance_status === 'PRESENT';
                  const initials = (u.full_name || 'U')
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={r.id || idx}>
                      {/* Student Name & Avatar */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--accent-green-light)',
                            color: 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            flexShrink: 0
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                              {u.full_name || 'Anonymous Student'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                              {u.role?.name || 'STUDENT'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-main)' }}>
                          <Mail size={12} color="var(--text-dim)" />
                          <span style={{ fontSize: '0.82rem' }}>{u.email || 'N/A'}</span>
                        </div>
                        {u.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '2px' }}>
                            <Phone size={11} /> {u.phone}
                          </div>
                        )}
                      </td>

                      {/* Department */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {u.department ? (
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            color: 'var(--text-main)'
                          }}>
                            {u.department.code}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>General</span>
                        )}
                      </td>

                      {/* Ticket Code */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <code style={{
                            fontFamily: 'monospace',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: 'var(--accent-primary)',
                            background: 'var(--accent-green-light)',
                            padding: '0.15rem 0.4rem',
                            borderRadius: 'var(--radius-xs)'
                          }}>
                            {r.ticket_code}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyTicket(r.ticket_code)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: copiedCode === r.ticket_code ? 'var(--accent-primary)' : 'var(--text-dim)',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Copy ticket code"
                          >
                            {copiedCode === r.ticket_code ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>

                      {/* Registration Date */}
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {r.registered_at
                          ? new Date(r.registered_at).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </td>

                      {/* Attendance Status */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {isAttended ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            background: '#E8F5E9',
                            color: '#28A745',
                            border: '1px solid rgba(40, 167, 69, 0.3)',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            <CheckCircle2 size={12} /> Attended
                            {r.attendance?.scanned_at && (
                              <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>
                                ({new Date(r.attendance.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            )}
                          </span>
                        ) : r.status === 'CANCELLED' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            background: '#FFEBEE',
                            color: '#D32F2F',
                            border: '1px solid rgba(211, 47, 47, 0.3)',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            <XCircle size={12} /> Cancelled
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            background: '#FFF8E1',
                            color: '#F59E0B',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            <Clock size={12} /> Registered
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Summary */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-dim)',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.85rem'
        }}>
          <div>
            Showing <strong>{filtered.length}</strong> of <strong>{registrations.length}</strong> total registrations
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '0.45rem 1.25rem', fontSize: '0.82rem' }}
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default EventAttendeesModal;
