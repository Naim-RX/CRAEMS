import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Sub-components

import { EventFilters } from '../../components/events/EventFilters';
import { FeaturedEventCard } from '../../components/events/FeaturedEventCard';
import { EventGridCard } from '../../components/events/EventGridCard';
import { EventCalendarView } from '../../components/events/EventCalendarView';
import { EventTimelineView } from '../../components/events/EventTimelineView';
import { UpcomingCarousel } from '../../components/events/UpcomingCarousel';
import { EventCategoryList } from '../../components/events/EventCategoryList';
import { EventAnnouncements } from '../../components/events/EventAnnouncements';
import { EventStats } from '../../components/events/EventStats';
import { EventDetailsModal } from '../../components/events/EventDetailsModal';
import { MyEventsView } from '../../components/events/MyEventsView';
import { EventFormModal } from '../../components/events/EventFormModal';
import { VenueFormModal } from '../../components/events/VenueFormModal';
import { Modal } from '../../components/common/Modal';
import { QRScannerModal } from '../../components/common/QRScannerModal';

import {
  LayoutGrid, Calendar, AlignLeft, Ticket, QrCode, Plus, Bell,
  BarChart2, CheckCircle2, Download, RefreshCw, User as UserIcon, Building2
} from 'lucide-react';

// ────────────────────────────────────────────────
// MOCK DATA — used for UI demonstration when API returns empty/fails
// ────────────────────────────────────────────────
const DEMO_EVENTS = [];

const DEMO_ANNOUNCEMENTS = [];

const DEMO_CATEGORIES = [
  { id: 1, name: 'Workshops' }, { id: 2, name: 'Seminars' }, { id: 3, name: 'Conferences' },
  { id: 4, name: 'Hackathons' }, { id: 5, name: 'Competitions' }, { id: 6, name: 'Cultural Programs' },
  { id: 7, name: 'Sports' }, { id: 8, name: 'Career Fair' }, { id: 9, name: 'Research' }, { id: 10, name: 'Training' }
];

const DEMO_STATS = { total_events: 24, total_registrations: 1842, upcoming_events: 8, certificates_issued: 342, departments_participating: 9, students_participating: 1245 };

// ────────────────────────────────────────────────
// View selector tabs
// ────────────────────────────────────────────────
const VIEW_TABS = [
  { key: 'grid', label: 'Grid View', icon: LayoutGrid },
  { key: 'calendar', label: 'Calendar View', icon: Calendar },
  { key: 'timeline', label: 'Timeline View', icon: AlignLeft },
  { key: 'my-events', label: 'My Events', icon: Ticket },
];

// ────────────────────────────────────────────────
// Admin Quick Action Panel
// ────────────────────────────────────────────────
const AdminControlPanel = ({ onCreateEvent, onOpenScanner, onAddVenue }) => (
  <div className="glass-panel" style={{
    padding: '1.25rem 1.5rem',
    background: 'linear-gradient(135deg, rgba(30,27,75,0.6) 0%, rgba(15,23,42,0.8) 100%)',
    borderColor: 'rgba(99,102,241,0.3)'
  }}>
    <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
      ⚙️ Admin Event Control Panel
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      <button className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }} onClick={onCreateEvent}>
        <Plus size={15} /> Create Event
      </button>
      <button className="btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }} onClick={onAddVenue}>
        <Building2 size={15} /> Add Venue / Room
      </button>
      <button className="btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }} onClick={onOpenScanner}>
        <QrCode size={15} /> QR Scanner
      </button>
    </div>
  </div>
);

// ────────────────────────────────────────────────
// Toast Notification component
// ────────────────────────────────────────────────
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#34d399' },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#f87171' },
    info: { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.4)', color: '#a5b4fc' }
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)',
      backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-lg)',
      fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {type === 'success' && <CheckCircle2 size={17} />}
      {message}
    </div>
  );
};

// ────────────────────────────────────────────────
// Skeleton Loader
// ────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ height: '160px', background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ height: '12px', width: '60%', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ height: '18px', width: '90%', borderRadius: '4px', background: 'rgba(255,255,255,0.07)' }} />
      <div style={{ height: '12px', width: '80%', borderRadius: '4px', background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ height: '34px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)' }} />
    </div>
  </div>
);

// ────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────
export const EventManagementPage = () => {
  const { user } = useAuth();

// State
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({});
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  // UI State
  const [activeView, setActiveView] = useState('grid');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [ticketModal, setTicketModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({});

  const gridRef = useRef(null);

  const isAdmin = user && ['ADMINISTRATOR', 'RESOURCE_MANAGER'].includes(user.role?.name);
  const isOrganizer = user && user.role?.name === 'EVENT_ORGANIZER';
  const canCreateEvent = isAdmin || isOrganizer;
  const canRequestEvent = user && ['FACULTY', 'STUDENT'].includes(user.role?.name);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // ── Data Fetching ──────────────────────────────
  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get('/events');
      const data = res.data?.length > 0 ? res.data : DEMO_EVENTS;
      setEvents(data);
      setFilteredEvents(data);
    } catch {
      setEvents(DEMO_EVENTS);
      setFilteredEvents(DEMO_EVENTS);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/events/categories');
      setCategories(res.data?.length > 0 ? res.data : DEMO_CATEGORIES);
    } catch {
      setCategories(DEMO_CATEGORIES);
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await api.get('/events/announcements');
      setAnnouncements(res.data?.length > 0 ? res.data : DEMO_ANNOUNCEMENTS);
    } catch {
      setAnnouncements(DEMO_ANNOUNCEMENTS);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/events/stats');
      setStats(Object.keys(res.data || {}).length > 0 ? res.data : DEMO_STATS);
    } catch {
      setStats(DEMO_STATS);
    }
  }, []);

  const fetchMyRegistrations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/events/user/my-registrations?user_id=${user.id}`);
      setMyRegistrations(res.data || []);
    } catch {
      setMyRegistrations([]);
    }
  }, [user]);

  // Fetch rooms, departments, and venue-building metadata for filters & form
  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get('/rooms?is_active=true');
      setRooms(res.data || []);
    } catch {
      setRooms([]);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data || []);
    } catch {
      setDepartments([]);
    }
  }, []);

const buildFallbackFloors = () => {
    // Provide generic floors 1-4 as a fallback when floor API is not exposed
    return [1, 2, 3, 4].map(n => ({ id: n, floor_number: n, floor_name: `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'} Floor` }));
  };

  const fetchVenueMeta = useCallback(async () => {
    try {
      const [bRes, tRes] = await Promise.allSettled([
        api.get('/rooms/buildings'),
        api.get('/rooms/types')
      ]);
      if (bRes.status === 'fulfilled') {
        setBuildings(bRes.value.data || []);
      }
      if (tRes.status === 'fulfilled') setRoomTypes(tRes.value.data || []);
      // Floors fallback (generic 1-4) when a dedicated floors endpoint is unavailable
      setFloors(prev => prev.length > 0 ? prev : buildFallbackFloors());
    } catch {
      setBuildings([]);
      setRoomTypes([]);
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchEvents(), fetchCategories(), fetchAnnouncements(), fetchStats(), fetchMyRegistrations(), fetchRooms(), fetchDepartments(), fetchVenueMeta()]);
      setLoading(false);
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter Handler ─────────────────────────────
  const handleFiltersChange = useCallback((f) => {
    setFilters(f);
    let result = [...events];

    if (f.search) {
      const q = f.search.toLowerCase();
      result = result.filter(e => e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q));
    }
    if (f.category) result = result.filter(e => String(e.category?.id) === String(f.category));
    if (f.department) result = result.filter(e => String(e.department?.id) === String(f.department));
    if (f.venue) result = result.filter(e => String(e.room?.id) === String(f.venue) || String(e.room_id) === String(f.venue));
    if (f.mode && f.mode !== 'ALL') result = result.filter(e => e.event_mode === f.mode);
    if (f.price && f.price !== 'ALL') result = result.filter(e => e.price_type === f.price);
    if (f.sort === 'latest') result.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
    if (f.sort === 'upcoming') result.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    if (f.sort === 'popular') result.sort((a, b) => (b.registered_count || 0) - (a.registered_count || 0));
    if (f.sort === 'deadline') result.sort((a, b) => {
      const da = a.registration_deadline ? new Date(a.registration_deadline).getTime() : Infinity;
      const db = b.registration_deadline ? new Date(b.registration_deadline).getTime() : Infinity;
      return da - db;
    });

    setFilteredEvents(result);
  }, [events]);

  const handleCategoryFilter = (catId) => {
    setSelectedCategory(catId);
    if (!catId) {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(e => String(e.category?.id) === String(catId)));
    }
  };

  // ── Registration ───────────────────────────────
  const handleRegister = async (event) => {
    if (!user) {
      showToast('Please sign in to register for events.', 'error');
      return;
    }
    try {
      const res = await api.post(`/events/${event.id}/register?user_id=${user.id}`);
      setTicketModal(res.data);
      showToast('Successfully registered! Your QR ticket is ready.', 'success');
      await fetchEvents();
      await fetchMyRegistrations();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Registration failed. Please try again.', 'error');
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    try {
      await api.post(`/events/cancel-registration/${registrationId}`);
      showToast('Registration cancelled successfully.', 'info');
      await fetchMyRegistrations();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Cancellation failed.', 'error');
    }
  };

  // ── Event Create / Request ─────────────────────
  const handleEventSubmit = async (formData) => {
    if (!user) {
      showToast('Please sign in to create or request an event.', 'error');
      throw new Error('Not authenticated');
    }
    const endpoint = `/events?organizer_id=${user.id}`;
    const payload = { ...formData, status: canCreateEvent ? 'PUBLISHED' : 'PENDING_APPROVAL' };
    const res = await api.post(endpoint, payload);
    showToast(canCreateEvent ? 'Event created and published!' : 'Event request submitted for review!', 'success');
    await fetchEvents();
    return res.data;
  };

  // ── Venue / Room Creation (Admin) ──────────────
  const handleCreateVenue = async (roomData) => {
    const res = await api.post('/rooms', roomData);
    showToast('Venue created successfully!', 'success');
    await fetchRooms();
    return res.data;
  };

  // ── Upcoming in next 7 days ────────────────────
  const upcomingEvents = events.filter(e => {
    const start = new Date(e.start_time);
    const now = new Date();
    const diff = (start - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  const featuredEvent = events.find(e => e.is_published) || events[0];

  // ────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>


      {/* ── ADMIN CONTROL PANEL ──────────────── */}
      {isAdmin && (
        <AdminControlPanel
          onCreateEvent={() => setIsFormModalOpen(true)}
          onAddVenue={() => setIsVenueModalOpen(true)}
          onOpenScanner={() => setIsQRScannerOpen(true)}
        />
      )}



      {/* ── STATS SECTION ────────────────────── */}
      <div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>📊 Campus Event Statistics</div>
        <EventStats stats={stats} />
      </div>



      {/* ── FEATURED EVENT ───────────────────── */}
      {featuredEvent && (
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>⭐ Featured Event</div>
          <FeaturedEventCard
            event={featuredEvent}
            onRegister={handleRegister}
            onLearnMore={(e) => { setSelectedEvent(e); setIsDetailModalOpen(true); }}
          />
        </div>
      )}

      {/* ── STICKY FILTERS ───────────────────── */}
      <EventFilters
        categories={categories}
        departments={departments}
        rooms={rooms}
        onFiltersChange={handleFiltersChange}
      />

      {/* ── CATEGORY CARDS ───────────────────── */}
      <EventCategoryList
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryFilter}
      />

      {/* ── VIEW TABS + EVENT GRID ────────────── */}
      <div ref={gridRef}>
        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {VIEW_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeView === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: isActive ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={15} /> {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: '#ffffff' }}>{filteredEvents.length}</strong> events
          </div>
        </div>

        {/* ── GRID VIEW ─────────────────────── */}
        {activeView === 'grid' && (
          <>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Events Found</h3>
                <p>Try adjusting your search filters or explore a different category.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredEvents.map(evt => (
                  <EventGridCard
                    key={evt.id}
                    event={evt}
                    onRegister={handleRegister}
                    onViewDetails={(e) => { setSelectedEvent(e); setIsDetailModalOpen(true); }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── CALENDAR VIEW ──────────────────── */}
        {activeView === 'calendar' && (
          <EventCalendarView
            events={filteredEvents}
            onSelectEvent={(e) => { setSelectedEvent(e); setIsDetailModalOpen(true); }}
            onRegister={handleRegister}
          />
        )}

        {/* ── TIMELINE VIEW ──────────────────── */}
        {activeView === 'timeline' && (
          <EventTimelineView
            events={filteredEvents}
            onSelectEvent={(e) => { setSelectedEvent(e); setIsDetailModalOpen(true); }}
            onRegister={handleRegister}
          />
        )}

        {/* ── MY EVENTS ──────────────────────── */}
        {activeView === 'my-events' && (
          <MyEventsView
            registrations={myRegistrations}
            onCancelRegistration={handleCancelRegistration}
          />
        )}
      </div>

      {/* ── MODALS ─────────────────────────────── */}

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedEvent(null); }}
        event={selectedEvent}
        onRegister={handleRegister}
      />

{/* Event Create/Request Form Modal */}
      <EventFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        userRole={user?.role?.name}
        onSubmit={handleEventSubmit}
        categories={categories}
        rooms={rooms}
        departments={departments}
      />

      {/* Admin Venue / Room Creation Modal */}
      <VenueFormModal
        isOpen={isVenueModalOpen}
        onClose={() => setIsVenueModalOpen(false)}
        onRoomCreated={handleCreateVenue}
        buildings={buildings}
        floors={floors}
        roomTypes={roomTypes}
      />

      {/* Generated Ticket QR Modal (post-registration) */}
      <Modal isOpen={!!ticketModal} onClose={() => setTicketModal(null)} title="🎟️ Registration Confirmed!" maxWidth="420px">
        {ticketModal && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center' }}>
            <div style={{ color: '#34d399', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={22} /> You're Registered!
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Present this QR code at the event entrance. Your ticket is also saved in <strong>My Events</strong>.
            </p>
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
              {ticketModal.qr_code
                ? <img src={ticketModal.qr_code} alt="QR Ticket" style={{ width: '200px', height: '200px' }} />
                : <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '8px' }}>
                    <QrCode size={80} color="#6366f1" />
                  </div>
              }
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '0.15em', background: 'rgba(99,102,241,0.12)', padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.3)' }}>
              {ticketModal.ticket_code}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setActiveView('my-events')}>
                View My Events
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = ticketModal.qr_code;
                  link.download = `ticket_${ticketModal.ticket_code}.png`;
                  link.click();
                }}
              >
                <Download size={15} /> Download
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* QR Attendance Scanner */}
      <QRScannerModal isOpen={isQRScannerOpen} onClose={() => setIsQRScannerOpen(false)} />

      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Shimmer keyframe (global inject) */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};
