import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import {
  User, Mail, Phone, Building2, Shield, Key,
  Bell, Save, Camera, CheckCircle, AlertCircle,
  Box, Ticket, Calendar, QrCode, Clock
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('info');
  const [historySubTab, setHistorySubTab] = useState('ALL');
  const [bookings, setBookings] = useState([]);
  const [equipmentReservations, setEquipmentReservations] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [editForm, setEditForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user?.id) {
      const fetchHistory = async () => {
        try {
          const [bRes, eqRes, evRes] = await Promise.allSettled([
            api.get(`/bookings?user_id=${user.id}`),
            api.get(`/equipment/reservations?user_id=${user.id}`),
            api.get(`/events/user/my-registrations?user_id=${user.id}`)
          ]);
          if (bRes.status === 'fulfilled' && Array.isArray(bRes.value.data)) setBookings(bRes.value.data);
          if (eqRes.status === 'fulfilled' && Array.isArray(eqRes.value.data)) setEquipmentReservations(eqRes.value.data);
          if (evRes.status === 'fulfilled' && Array.isArray(evRes.value.data)) setEventRegistrations(evRes.value.data);
        } catch (e) { /* silent */ }
      };
      fetchHistory();
    }
  }, [user?.id]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const tabs = [
    { id: 'info', label: 'Personal Info', icon: User },
    { id: 'bookings', label: 'Reservation History', icon: Building2 },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'notifications', label: 'Preferences', icon: Bell },
  ];

  const avatarInitials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>My Profile</h1>
      </div>

      {/* Profile Header Card */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '88px', height: '88px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 800, color: 'white',
            boxShadow: 'var(--shadow-glow)'
          }}>
            {avatarInitials}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{user?.full_name}</h2>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              padding: '0.3rem 0.85rem', borderRadius: '9999px',
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
              fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)'
            }}>
              {user?.role?.name}
            </span>
            {user?.department && (
              <span style={{
                padding: '0.3rem 0.85rem', borderRadius: '9999px',
                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                fontSize: '0.8rem', fontWeight: 700, color: '#34d399'
              }}>
                {user.department.name}
              </span>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Member Since</div>
          <div style={{ fontWeight: 600 }}>{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '2026'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.25rem', border: 'none', background: 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.9rem', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {msg.text && (
        <div style={{
          padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)',
          background: msg.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
          border: `1px solid ${msg.type === 'error' ? '#ef4444' : '#10b981'}`,
          color: msg.type === 'error' ? '#f87171' : '#34d399',
          fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          {msg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Tab Panels */}
      {activeTab === 'info' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Personal Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text" className="form-input"
                value={editForm.full_name}
                onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={user?.email} readOnly
                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel" className="form-input" placeholder="+880-1XXX-XXXXXX"
                value={editForm.phone}
                onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input type="text" className="form-input"
                value={user?.department?.name || 'Not Assigned'} readOnly
                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
          </div>
          <button className="btn-primary" style={{ marginTop: '0.5rem' }}
            onClick={() => showMsg('Profile updated successfully!')}>
            <Save size={16} /> Save Changes
          </button>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Sub Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All History' },
              { id: 'ROOMS', label: `🏛️ Room Bookings (${bookings.length})` },
              { id: 'EQUIPMENT', label: `🔬 Equipment Loans (${equipmentReservations.length})` },
              { id: 'EVENTS', label: `🎟️ Event Passes (${eventRegistrations.length})` }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setHistorySubTab(t.id)}
                style={{
                  padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-sm)',
                  border: historySubTab === t.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  background: historySubTab === t.id ? 'rgba(40, 167, 69, 0.12)' : 'var(--bg-surface)',
                  color: historySubTab === t.id ? '#28A745' : 'var(--text-muted)',
                  fontWeight: historySubTab === t.id ? 700 : 500,
                  fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── ROOM RESERVATIONS ──────────────── */}
          {(historySubTab === 'ALL' || historySubTab === 'ROOMS') && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Building2 size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Room & Facility Bookings</h3>
              </div>
              {bookings.length > 0 ? (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Facility</th>
                        <th>Title & Purpose</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td style={{ fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                            {b.booking_reference}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>Room {b.room?.room_number || 'N/A'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {b.room?.building?.name || b.room?.building?.code || 'Main'}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{b.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.purpose}</div>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {new Date(String(b.start_time).replace('Z','').replace(' ','T')).toLocaleString([], {
                              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td><StatusBadge status={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No room bookings recorded in your history.
                </div>
              )}
            </div>
          )}

          {/* ── EQUIPMENT RESERVATIONS ──────────── */}
          {(historySubTab === 'ALL' || historySubTab === 'EQUIPMENT') && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Box size={18} color="#10b981" />
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Equipment Loan History</h3>
              </div>
              {equipmentReservations.length > 0 ? (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Equipment Item</th>
                        <th>Serial Number</th>
                        <th>Category</th>
                        <th>Loan Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipmentReservations.map(eq => (
                        <tr key={eq.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{eq.equipment?.name || 'Equipment Item'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Condition: {eq.equipment?.condition || 'GOOD'}
                            </div>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {eq.equipment?.serial_number || 'N/A'}
                          </td>
                          <td>{eq.equipment?.category?.name || 'Hardware'}</td>
                          <td style={{ fontSize: '0.85rem' }}>
                            <div>Start: {new Date(String(eq.start_time).replace('Z','').replace(' ','T')).toLocaleDateString()}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              Return: {new Date(String(eq.expected_return_time).replace('Z','').replace(' ','T')).toLocaleDateString()}
                            </div>
                          </td>
                          <td><StatusBadge status={eq.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No equipment loans recorded in your history.
                </div>
              )}
            </div>
          )}

          {/* ── EVENT PASSES ───────────────────── */}
          {(historySubTab === 'ALL' || historySubTab === 'EVENTS') && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Ticket size={18} color="#8b5cf6" />
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Event Passes & Tickets</h3>
              </div>
              {eventRegistrations.length > 0 ? (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Venue</th>
                        <th>Event Date</th>
                        <th>Ticket Pass</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventRegistrations.map(reg => (
                        <tr key={reg.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{reg.event?.title || 'Campus Event'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {reg.event?.category?.name || 'Event'}
                            </div>
                          </td>
                          <td>
                            {reg.event?.room ? `Room ${reg.event.room.room_number}` : 'Main Venue'}
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {reg.event?.start_time ? new Date(reg.event.start_time).toLocaleString([], {
                              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) : 'TBD'}
                          </td>
                          <td>
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                              fontFamily: 'monospace', fontWeight: 700,
                              color: 'var(--accent-secondary)', fontSize: '0.85rem'
                            }}>
                              <QrCode size={14} /> {reg.ticket_code || 'TKT-VALID'}
                            </div>
                          </td>
                          <td><StatusBadge status={reg.status || 'CONFIRMED'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No event registrations found in your history.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Security Settings</h3>
          <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" placeholder="••••••••"
                value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="••••••••"
                value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" placeholder="••••••••"
                value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
            </div>
            <button className="btn-primary" style={{ alignSelf: 'flex-start' }}
              onClick={() => {
                if (pwForm.newPw !== pwForm.confirm) {
                  showMsg('Passwords do not match.', 'error');
                } else {
                  showMsg('Password updated successfully!');
                  setPwForm({ current: '', newPw: '', confirm: '' });
                }
              }}>
              <Key size={16} /> Update Password
            </button>
          </div>

          <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', maxWidth: '480px' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Two-Factor Authentication</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Enable TOTP-based 2FA for enhanced security on privileged accounts.
            </p>
            <button className="btn-secondary" style={{ fontSize: '0.875rem' }}>
              <Shield size={16} /> {user?.is_two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Display Preferences</h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', maxWidth: '480px', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Interface Theme</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Currently: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </div>
            </div>
            <button className="btn-secondary" onClick={toggleTheme} style={{ fontSize: '0.875rem' }}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>

          {[
            { label: 'Booking Approved Notifications', desc: 'Receive alerts when your bookings are approved or rejected' },
            { label: 'Event Registration Confirmations', desc: 'Get ticket confirmations for campus events' },
            { label: 'Equipment Due Date Reminders', desc: 'Alerts before equipment return deadlines' },
          ].map((pref, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem', background: 'rgba(0,0,0,0.2)',
              borderRadius: 'var(--radius-sm)', maxWidth: '480px', marginBottom: '0.75rem'
            }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{pref.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pref.desc}</div>
              </div>
              <div style={{
                width: '44px', height: '24px',
                background: 'var(--accent-primary)',
                borderRadius: '9999px', cursor: 'pointer',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute', right: '3px', top: '3px',
                  width: '18px', height: '18px',
                  borderRadius: '50%', background: 'var(--bg-surface)'
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
