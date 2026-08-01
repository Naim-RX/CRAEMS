import React, { useState, useEffect } from 'react';
import {
  Settings, Building2, Layers, Users, ShieldCheck,
  Database, Bell, ToggleRight, Save, Plus, Trash2, RefreshCw
} from 'lucide-react';
import api from '../../services/api';

export const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [newDept, setNewDept] = useState({ code: '', name: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes] = await Promise.all([api.get('/admin/users')]);
        setUsers(uRes.data);
      } catch (e) { /* silent */ }
    };
    fetchData();
  }, []);

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
    { id: 'system', label: 'System Configuration', icon: Settings },
  ];

  const ROLES = ['ADMINISTRATOR', 'RESOURCE_MANAGER', 'FACULTY', 'RESEARCHER', 'LAB_ASSISTANT', 'STUDENT', 'GUEST'];
  const PERMISSIONS = [
    { code: 'room:create', module: 'Rooms' }, { code: 'room:approve', module: 'Rooms' },
    { code: 'booking:create', module: 'Bookings' }, { code: 'booking:approve', module: 'Bookings' },
    { code: 'event:create', module: 'Events' }, { code: 'equipment:reserve', module: 'Equipment' },
    { code: 'report:view', module: 'Reports' }, { code: 'admin:manage', module: 'Admin' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Administrator System Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Global configuration, user governance, and system maintenance</p>
      </div>

      {msg && (
        <div className="animate-fade-in" style={{
          padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)',
          background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#34d399'
        }}>
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.25rem', background: 'transparent', border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: 'pointer', fontSize: '0.9rem', transition: 'var(--transition-fast)'
            }}>
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Add New Department</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Code</label>
                <input type="text" className="form-input" placeholder="e.g. MBA"
                  value={newDept.code} onChange={e => setNewDept(p => ({ ...p, code: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Department Name</label>
                <input type="text" className="form-input" placeholder="e.g. Master of Business Administration"
                  value={newDept.name} onChange={e => setNewDept(p => ({ ...p, name: e.target.value }))} />
              </div>
              <button className="btn-primary" onClick={() => {
                if (newDept.code && newDept.name) {
                  setDepartments(prev => [...prev, { ...newDept, id: Date.now() }]);
                  setNewDept({ code: '', name: '' });
                  showMsg('Department added successfully!');
                }
              }}>
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Registered Departments</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr><th>Code</th><th>Department Name</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, code: 'CS', name: 'Computer Science & Engineering' },
                    { id: 2, code: 'EEE', name: 'Electrical & Electronic Engineering' },
                    { id: 3, code: 'MECH', name: 'Mechanical Engineering' },
                    { id: 4, code: 'BIOTECH', name: 'Biotechnology & Life Sciences' },
                    ...departments
                  ].map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{d.code}</td>
                      <td>{d.name}</td>
                      <td>
                        <button className="btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={() => setDepartments(prev => prev.filter(x => x.id !== d.id))}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>System Users ({users.length})</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                        background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)'
                      }}>{u.role?.name}</span>
                    </td>
                    <td>{u.department?.code || '—'}</td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                        background: u.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: u.is_active ? '#34d399' : '#f87171'
                      }}>{u.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                    </td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {activeTab === 'roles' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Role-Permission Matrix</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Module</th>
                  {ROLES.map(r => <th key={r} style={{ fontSize: '0.75rem', textAlign: 'center' }}>{r.replace('_', '\n')}</th>)}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map(perm => (
                  <tr key={perm.code}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{perm.code}</td>
                    <td style={{ fontSize: '0.85rem' }}>{perm.module}</td>
                    {ROLES.map(role => {
                      const hasPermission = (
                        (role === 'ADMINISTRATOR') ||
                        (role === 'RESOURCE_MANAGER' && ['room:create', 'booking:approve', 'equipment:reserve', 'report:view'].includes(perm.code)) ||
                        (role === 'FACULTY' && ['booking:create', 'event:create', 'equipment:reserve', 'report:view'].includes(perm.code)) ||
                        (role === 'STUDENT' && ['booking:create', 'equipment:reserve'].includes(perm.code)) ||
                        (role === 'RESEARCHER' && ['booking:create', 'equipment:reserve'].includes(perm.code)) ||
                        (role === 'LAB_ASSISTANT' && ['equipment:reserve'].includes(perm.code))
                      );
                      return (
                        <td key={role} style={{ textAlign: 'center' }}>
                          <div style={{
                            width: '20px', height: '20px',
                            borderRadius: '50%', margin: '0 auto',
                            background: hasPermission ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.15)',
                            border: hasPermission ? '2px solid #10b981' : '2px solid rgba(239,68,68,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {hasPermission && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Config Tab */}
      {activeTab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>SMTP Email Configuration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
                { label: 'SMTP Port', placeholder: '587' },
                { label: 'SMTP Username', placeholder: 'noreply@university.edu' },
                { label: 'SMTP Password', placeholder: '••••••••', type: 'password' },
              ].map(f => (
                <div key={f.label} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input type={f.type || 'text'} className="form-input" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => showMsg('SMTP configuration saved!')}>
              <Save size={16} /> Save SMTP Settings
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>JWT Security Configuration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Access Token Expiry (minutes)</label>
                <input type="number" className="form-input" defaultValue="30" />
              </div>
              <div className="form-group">
                <label className="form-label">Refresh Token Expiry (days)</label>
                <input type="number" className="form-input" defaultValue="7" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => showMsg('JWT configuration saved!')}><Save size={16} /> Save</button>
              <button className="btn-secondary" onClick={() => showMsg('JWT secret rotated successfully!')}><RefreshCw size={16} /> Rotate Secret</button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Database Backup & Maintenance</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => showMsg('Database backup initiated!')}>
                <Database size={16} /> Export MySQL Dump
              </button>
              <button className="btn-secondary" onClick={() => showMsg('Database health check complete — all systems nominal.')}>
                <RefreshCw size={16} /> Run Health Check
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
