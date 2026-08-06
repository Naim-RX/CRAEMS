import React, { useState } from 'react';
import { Calendar as CalendarIcon, Grid, List, ChevronLeft, ChevronRight, MapPin, Clock, Ticket } from 'lucide-react';

export const EventCalendarView = ({ events = [], onSelectEvent, onRegister }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Map events by day string YYYY-MM-DD
  const eventsByDate = {};
  events.forEach(evt => {
    if (!evt.start_time) return;
    const dateKey = new Date(evt.start_time).toISOString().split('T')[0];
    if (!eventsByDate[dateKey]) eventsByDate[dateKey] = [];
    eventsByDate[dateKey].push(evt);
  });

  const handleDayClick = (dayNum) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;
    const dayEvts = eventsByDate[dateKey] || [];
    setSelectedDayEvents({ dateStr: dateKey, events: dayEvts });
  };

  const daysArray = [];
  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Calendar Header Nav */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={prevMonth} style={{ padding: '0.4rem 0.6rem' }}><ChevronLeft size={18} /></button>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            {monthNames[month]} {year}
          </h2>
          <button className="btn-secondary" onClick={nextMonth} style={{ padding: '0.4rem 0.6rem' }}><ChevronRight size={18} /></button>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Click any date to inspect scheduled campus events
        </div>
      </div>

      {/* Grid Calendar */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>
          <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {daysArray.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} style={{ minHeight: '90px', background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-xs)' }} />;
            }

            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const dateKey = `${year}-${monthStr}-${dayStr}`;
            const dayEvts = eventsByDate[dateKey] || [];
            const hasEvents = dayEvts.length > 0;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => handleDayClick(dayNum)}
                style={{
                  minHeight: '95px',
                  background: hasEvents ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: hasEvents ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: hasEvents ? '#ffffff' : 'var(--text-muted)' }}>
                    {dayNum}
                  </span>
                  {hasEvents && (
                    <span className="badge badge-active" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>
                      {dayEvts.length} Event{dayEvts.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {hasEvents && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.35rem' }}>
                    {dayEvts.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        style={{
                          fontSize: '0.7rem',
                          background: 'rgba(99, 102, 241, 0.3)',
                          padding: '0.2rem 0.35rem',
                          borderRadius: '3px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 600,
                          color: '#ffffff'
                        }}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvts.length > 2 && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                        +{dayEvts.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Events Popup Drawer/Panel */}
      {selectedDayEvents && (
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              📅 Events Scheduled on {new Date(selectedDayEvents.dateStr).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <button className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setSelectedDayEvents(null)}>
              Close
            </button>
          </div>

          {selectedDayEvents.events.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {selectedDayEvents.events.map(evt => (
                <div key={evt.id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{evt.category?.name}</div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.25rem 0 0.5rem' }}>{evt.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{evt.description}</p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>📍 Room {evt.room?.room_number} • 🕒 {new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.45rem', fontSize: '0.8rem' }} onClick={() => onRegister(evt)}>
                      Register
                    </button>
                    <button className="btn-secondary" style={{ padding: '0.45rem', fontSize: '0.8rem' }} onClick={() => onSelectEvent(evt)}>
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
              No events scheduled for this day.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
