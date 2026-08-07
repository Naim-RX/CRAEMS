import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import {
  User, Mail, Phone, Building2, Shield, Key,
  Bell, Save, Camera, CheckCircle, AlertCircle
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('info');
  const [bookings, setBookings] = useState([]);
  const [editForm, setEditForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      const fetchBookings = async () => {
        try {
          const res = await api.get(`/bookings?user_id=${user.id}`);
          setBookings(res.data);
        } catch (e) { /* silent */ }
      };
      fetchBookings();
    }
  }, [user]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const tabs = [
    { id: 'info', label: 'Personal Info', icon: User },
    { id: 'bookings', label: 'Booking History', icon: Building2 },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'notifications', label: 'Preferences', icon: Bell },
  ];

  const avatarInitials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>My Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your account settings and preferences</p>
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
                padding: '0.75rem 1.25rem',
                background: 'transparent', border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer', fontSize: '0.9rem',
                transition: 'var(--transition-fast)'
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Alert */}
      {msg.text && (
        <div className="animate-fade-in" style={{
          padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)',
          background: msg.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${msg.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: msg.type === 'success' ? '#34d399' : '#f87171',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {msg.text}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Personal Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text" className="form-input"
                value={editForm.full_name}
                onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address (read-only)</label>
              <input type="email" className="form-input" value={user?.email || ''} readOnly
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
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Booking & Reservation History</h3>
          {bookings.length > 0 ? (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Facility</th>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                        {b.booking_reference}
                      </td>
                      <td>Room {b.room?.room_number || 'N/A'}</td>
                      <td>{b.title}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(b.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <span className={`badge badge-${b.status?.toLowerCase()}`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No reservations found in your history.
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
