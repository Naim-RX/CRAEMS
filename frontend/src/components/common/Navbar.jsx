import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import {
  Building2, Sun, Moon, LogOut, User as UserIcon, Calendar, Search,
  Bell, Ticket, ChevronDown, Shield, Settings, BookOpen, BarChart2, X,
  CheckCircle2, XCircle, Clock, Trash2, CheckCheck, Info
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/notifications?user_id=${user.id}`);
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // Poll for notifications every 6 seconds when user is logged in
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 6000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await api.put(`/notifications/read-all/user/${user.id}`);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    const diffInSec = Math.floor((now - date) / 1000);

    if (diffInSec < 60) return 'Just now';
    if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
    if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
    return `${Math.floor(diffInSec / 86400)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinkStyle = (path) => ({
    color: isActive(path) ? 'var(--accent-primary)' : 'var(--text-muted)',
    textDecoration: 'none',
    fontWeight: isActive(path) ? 700 : 500,
    fontSize: '0.9rem',
    padding: '0.4rem 0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    transition: 'color 0.2s ease',
    borderBottom: isActive(path) ? '2px solid var(--accent-primary)' : '2px solid transparent'
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '62px',
        gap: '1rem'
      }}>

        {/* ── LEFT: Logo ─────────────────────────── */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            background: '#28A745',
            width: '36px', height: '36px',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
          }}>
            <Building2 size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#263238', letterSpacing: '-0.03em' }}>
              CRAEMS<span style={{ color: '#28A745' }}>.EDU</span>
            </span>
          </div>
        </Link>

        {/* ── RIGHT: Actions ──────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>

          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            style={{
              background: 'transparent', border: '1px solid var(--border-color)',
              color: 'var(--text-muted)', width: '34px', height: '34px',
              borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title="Search Events"
          >
            <Search size={16} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent', border: '1px solid var(--border-color)',
              color: 'var(--text-main)', width: '34px', height: '34px',
              borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notification Bell (Logged In) */}
          {user && (
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                style={{
                  background: notifOpen ? 'var(--bg-secondary)' : 'transparent',
                  border: '1px solid var(--border-color)',
                  color: unreadCount > 0 ? '#28A745' : 'var(--text-muted)',
                  width: '34px', height: '34px',
                  borderRadius: '50%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    background: '#dc2626', color: '#ffffff',
                    fontSize: '0.65rem', fontWeight: 800,
                    minWidth: '17px', height: '17px',
                    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px', border: '2px solid var(--bg-surface)'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notifOpen && (
                <div className="glass-panel animate-fade-in" style={{
                  position: 'absolute', top: '44px', right: 0,
                  width: '340px', maxHeight: '420px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)', zIndex: 1150,
                  display: 'flex', flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  {/* Header */}
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--bg-secondary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <span style={{
                          background: 'rgba(40, 167, 69, 0.15)', color: '#28A745',
                          fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.45rem',
                          borderRadius: '10px'
                        }}>
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        style={{
                          background: 'transparent', border: 'none',
                          color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'
                        }}
                      >
                        <CheckCheck size={13} /> Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div style={{ overflowY: 'auto', flex: 1, maxHeight: '340px' }}>
                    {notifications.length === 0 ? (
                      <div style={{
                        padding: '2.5rem 1.5rem', textAlign: 'center',
                        color: 'var(--text-muted)', fontSize: '0.85rem',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                      }}>
                        <Bell size={28} style={{ opacity: 0.3 }} />
                        <span>No notifications yet</span>
                      </div>
                    ) : (
                      notifications.map(item => {
                        const isApproved = item.title?.toLowerCase().includes('approved');
                        const isRejected = item.title?.toLowerCase().includes('rejected');
                        return (
                          <div
                            key={item.id}
                            onClick={() => !item.is_read && handleMarkAsRead(item.id)}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid var(--border-color)',
                              background: item.is_read ? 'transparent' : 'rgba(40, 167, 69, 0.04)',
                              cursor: 'pointer',
                              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                            onMouseLeave={e => e.currentTarget.style.background = item.is_read ? 'transparent' : 'rgba(40, 167, 69, 0.04)'}
                          >
                            {/* Icon Indicator */}
                            <div style={{ marginTop: '2px', flexShrink: 0 }}>
                              {isApproved ? (
                                <CheckCircle2 size={18} color="#28A745" />
                              ) : isRejected ? (
                                <XCircle size={18} color="#dc2626" />
                              ) : (
                                <Info size={18} color="var(--accent-primary)" />
                              )}
                            </div>

                            {/* Text content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                marginBottom: '0.2rem'
                              }}>
                                <span style={{
                                  fontSize: '0.82rem',
                                  fontWeight: item.is_read ? 600 : 700,
                                  color: isApproved ? '#28A745' : isRejected ? '#dc2626' : 'var(--text-main)'
                                }}>
                                  {item.title}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '0.5rem' }}>
                                  {formatTimeAgo(item.created_at)}
                                </span>
                              </div>
                              <p style={{
                                fontSize: '0.78rem', color: 'var(--text-muted)',
                                lineHeight: '1.35', margin: 0,
                                wordBreak: 'break-word'
                              }}>
                                {item.message}
                              </p>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={(e) => handleDeleteNotification(item.id, e)}
                              style={{
                                background: 'transparent', border: 'none',
                                color: 'var(--text-muted)', cursor: 'pointer',
                                padding: '2px', opacity: 0.5,
                                transition: 'opacity 0.2s', flexShrink: 0
                              }}
                              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#dc2626'; }}
                              onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                              title="Delete notification"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Dropdown or Login Buttons */}
          {user ? (
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  color: 'var(--text-main)', padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem'
                }}
              >
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: '#28A745',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', flexShrink: 0
                }}>
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  {user.full_name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} style={{ opacity: 0.7, transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="glass-panel animate-fade-in" style={{
                  position: 'absolute', top: '44px', right: 0,
                  width: '220px', padding: '0.5rem', background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-lg)', zIndex: 1100
                }}>
                  {/* User info header */}
                  <div style={{ padding: '0.75rem', marginBottom: '0.35rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    <div style={{ marginTop: '0.35rem' }}>
                      <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>{user.role?.name}</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  {[
                    { label: 'My Profile', icon: UserIcon, to: '/profile' },

                    { label: 'Booking Status', icon: Calendar, to: '/status' },
                    ...(user.role?.name === 'ADMINISTRATOR' ? [{ label: 'Admin Settings', icon: Shield, to: '/settings/admin' }, { label: 'Reports', icon: BarChart2, to: '/reports' }] : []),
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                          padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-xs)',
                          color: 'var(--text-muted)', textDecoration: 'none',
                          fontSize: '0.875rem', fontWeight: 500,
                          transition: 'background 0.15s'
                        }}
                        onClick={() => setProfileOpen(false)}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <Icon size={15} /> {item.label}
                      </Link>
                    );
                  })}

                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.35rem', paddingTop: '0.35rem' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem',
                        padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-xs)',
                        color: '#f87171', background: 'transparent', border: 'none',
                        cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, textAlign: 'left',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Register</Link>
            </div>
          )}

        </div>
      </nav>

      {/* ── Search Bar Overlay ──────────────────────── */}
      {searchOpen && (
        <div style={{
          position: 'fixed', top: '62px', left: 0, right: 0, zIndex: 999,
          background: 'var(--bg-glass)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem 2rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Search size={20} color="var(--accent-primary)" />
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search campus events, workshops, seminars, hackathons..."
              style={{
                flex: 1, background: 'transparent', border: 'none',
                outline: 'none', fontSize: '1rem', color: 'var(--text-main)',
                fontFamily: 'inherit'
              }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Search
            </button>
          </form>
          <button
            onClick={() => setSearchOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
          >
            <X size={20} />
          </button>
        </div>
      )}
    </>
  );
};
