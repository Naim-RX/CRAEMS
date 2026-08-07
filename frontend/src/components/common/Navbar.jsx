import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Building2, Sun, Moon, LogOut, User as UserIcon, Calendar, Search,
  Bell, Ticket, ChevronDown, Shield, Settings, BookOpen, BarChart2, X
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role?.name) {
      case 'ADMINISTRATOR': return '/dashboard/admin';
      case 'RESOURCE_MANAGER': return '/dashboard/manager';
      case 'FACULTY': return '/dashboard/faculty';
      default: return '/dashboard/student';
    }
  };

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

  // Mock notifications
  const notifications = [
    { id: 1, text: 'AI Symposium starts in 5 days — You are registered!', time: '2h ago', unread: true },
    { id: 2, text: 'Career Fair: Venue updated to Exhibition Hall.', time: '1d ago', unread: true },
    { id: 3, text: 'Your equipment request has been approved.', time: '2d ago', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

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
        background: '#FFFFFF',
        borderBottom: '1px solid #E0E0E0',
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

        {/* ── CENTER: Navigation Links ────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, justifyContent: 'center' }}>
          <Link to="/rooms" style={navLinkStyle('/rooms')}>Facilities</Link>
          <Link to="/equipment" style={navLinkStyle('/equipment')}>Equipment</Link>
          <Link to="/events" style={navLinkStyle('/events')}>
            <Calendar size={15} /> Events
          </Link>
          {user && (
            <Link to="/events?view=my-events" style={navLinkStyle('/events?view=my-events')}>
              <Ticket size={15} /> My Events
            </Link>
          )}
          {user && (
            <Link to={getDashboardRoute()} style={navLinkStyle(getDashboardRoute())}>Dashboard</Link>
          )}
        </div>

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

          {/* Notifications Bell */}
          {user && (
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                style={{
                  background: 'transparent', border: '1px solid var(--border-color)',
                  color: unreadCount > 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
                  width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', transition: 'all 0.2s ease'
                }}
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    background: 'var(--accent-primary)', color: '#ffffff',
                    fontSize: '0.6rem', fontWeight: 800, width: '16px', height: '16px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--bg-primary)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notifOpen && (
                <div className="glass-panel animate-fade-in" style={{
                  position: 'absolute', top: '44px', right: 0,
                  width: '320px', padding: '0.75rem', background: '#FFFFFF',
                  border: '1px solid #E0E0E0',
                  boxShadow: 'var(--shadow-lg)', zIndex: 1100
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E0E0E0' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#263238' }}>Notifications</span>
                    <span style={{ fontSize: '0.72rem', color: '#28A745', cursor: 'pointer', fontWeight: 600 }}>Mark all read</span>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '0.65rem 0.5rem', borderRadius: 'var(--radius-xs)',
                      background: n.unread ? '#E8F5E9' : 'transparent',
                      marginBottom: '0.3rem', cursor: 'pointer',
                      borderLeft: n.unread ? '3px solid #28A745' : '3px solid transparent'
                    }}>
                      <div style={{ fontSize: '0.82rem', color: '#263238', lineHeight: 1.4, fontWeight: n.unread ? 600 : 400 }}>{n.text}</div>
                      <div style={{ fontSize: '0.72rem', color: '#89939E', marginTop: '0.2rem' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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

          {/* Profile Dropdown or Login Buttons */}
          {user ? (
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                style={{
                  background: '#F5F7FA', border: '1px solid #E0E0E0',
                  color: '#263238', padding: '0.4rem 0.85rem',
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
                  width: '220px', padding: '0.5rem', background: '#FFFFFF',
                  border: '1px solid #E0E0E0',
                  boxShadow: 'var(--shadow-lg)', zIndex: 1100
                }}>
                  {/* User info header */}
                  <div style={{ padding: '0.75rem', marginBottom: '0.35rem', borderBottom: '1px solid #E0E0E0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#263238' }}>{user.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#4D4D4D' }}>{user.email}</div>
                    <div style={{ marginTop: '0.35rem' }}>
                      <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>{user.role?.name}</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  {[
                    { label: 'My Profile', icon: UserIcon, to: '/profile' },
                    { label: 'My Events', icon: Ticket, to: '/events' },
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
                          color: '#4D4D4D', textDecoration: 'none',
                          fontSize: '0.875rem', fontWeight: 500,
                          transition: 'background 0.15s'
                        }}
                        onClick={() => setProfileOpen(false)}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F5F7FA'; e.currentTarget.style.color = '#28A745'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4D4D4D'; }}
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
