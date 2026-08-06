import React, { useState, useEffect } from "react";
import {
  Activity, Building2, Box, CalendarDays, Clock, Users,
  RefreshCw, MapPin, CheckCircle, AlertCircle, Loader2
} from "lucide-react";
import { StatusBadge } from "../../components/common/StatusBadge";
import api from "../../services/api";

// Helpers - timezone-safe date parsing
const parseLocal = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = String(dateStr).replace("Z", "").replace(" ", "T");
  return new Date(cleanStr);
};

const fmtDate = (dateStr) => {
  const d = parseLocal(dateStr);
  return d ? d.toLocaleDateString([], { weekday: "short", year: "numeric", month: "short", day: "numeric" }) : "N/A";
};

const fmtTime = (dateStr) => {
  const d = parseLocal(dateStr);
  return d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A";
};

const fmtSlot = (start, end) =>
  (start && end) ? `${fmtTime(start)} — ${fmtTime(end)}` : start ? fmtTime(start) : "N/A";

const SectionHeader = ({ icon: Icon, title, count, accentColor }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.25rem" }}>
    <div style={{
      background: `${accentColor}22`,
      border: `1px solid ${accentColor}44`,
      borderRadius: "10px",
      width: "42px", height: "42px",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: accentColor, flexShrink: 0
    }}>
      <Icon size={20} />
    </div>
    <div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>{title}</h2>
      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
        {count} record{count !== 1 ? "s" : ""}
      </span>
    </div>
    <div style={{
      marginLeft: "auto",
      background: `${accentColor}22`,
      color: accentColor,
      fontSize: "0.85rem", fontWeight: 700,
      padding: "0.25rem 0.75rem",
      borderRadius: "99px",
      border: `1px solid ${accentColor}44`
    }}>
      {count}
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div style={{
    textAlign: "center", padding: "2.5rem",
    color: "var(--text-dim)", fontSize: "0.9rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px dashed var(--border-color)",
    borderRadius: "var(--radius-md)"
  }}>
    <CheckCircle size={32} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
    <div>{message}</div>
  </div>
);

// ─── 1. BOOKED ROOMS & FACILITIES ─────────────────────────────────────────────
const BookedRoomsSection = ({ bookings, loading }) => (
  <div className="glass-panel" style={{ padding: "1.75rem" }}>
    <SectionHeader icon={Building2} title="Booked Rooms & Facilities" count={bookings.length} accentColor="#6366f1" />
    {loading ? (
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    ) : bookings.length === 0 ? (
      <EmptyState message="No rooms currently booked — all facilities are available!" />
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {bookings.map((b) => (
          <div key={b.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr auto",
            gap: "1rem",
            alignItems: "center",
            padding: "1rem 1.25rem",
            borderRadius: "var(--radius-sm)",
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.15)"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <Building2 size={14} color="#6366f1" />
                <span style={{ fontWeight: 700, fontSize: "1rem" }}>Room {b.room?.room_number}</span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>({b.room?.building?.code})</span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                {b.room?.building?.name} • Floor {b.room?.floor?.floor_number}
              </div>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-main)" }}>"{b.title}"</div>
              {b.purpose && (
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.2rem" }}>{b.purpose}</div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.4rem 0.75rem",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: "6px", flex: "1 1 140px"
              }}>
                <CalendarDays size={14} color="#818cf8" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Booking Date</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-main)" }}>{fmtDate(b.start_time)}</div>
                </div>
              </div>

              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.4rem 0.75rem",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: "6px", flex: "1 1 140px"
              }}>
                <Clock size={14} color="#34d399" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Time Slot</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-main)" }}>{fmtSlot(b.start_time, b.end_time)}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
              <StatusBadge status={b.status} />
              {b.booking_reference && (
                <div style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#818cf8" }}>
                  Ref: {b.booking_reference}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── 2. RESERVED EQUIPMENT ────────────────────────────────────────────────────
const ReservedEquipmentSection = ({ reservations, equipment, loading }) => {
  const reservedItems = reservations.length > 0
    ? reservations
    : equipment.filter((e) => !e.is_available).map((e) => ({ equipment: e, status: "RESERVED" }));

  return (
    <div className="glass-panel" style={{ padding: "1.75rem" }}>
      <SectionHeader icon={Box} title="Reserved Equipment" count={reservedItems.length} accentColor="#10b981" />
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : reservedItems.length === 0 ? (
        <EmptyState message="All equipment is currently available for reservation!" />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Serial Tag</th>
                <th>Equipment Name</th>
                <th>Category</th>
                <th>Booking Date</th>
                <th>Time Slot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reservedItems.map((item, idx) => {
                const eq = item.equipment || item;
                const startDate = item.start_time;
                const endDate = item.expected_return_time || item.end_time;

                return (
                  <tr key={item.id || idx}>
                    <td style={{ fontWeight: 600, fontFamily: "monospace", color: "#34d399" }}>{eq.serial_number}</td>
                    <td style={{ fontWeight: 600 }}>{eq.name}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{eq.category?.name || "—"}</td>
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.25rem 0.6rem", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)" }}>
                        <CalendarDays size={12} color="#818cf8" />
                        {fmtDate(startDate)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.25rem 0.6rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)" }}>
                        <Clock size={12} color="#34d399" />
                        {fmtSlot(startDate, endDate)}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "0.35rem",
                        padding: "0.2rem 0.65rem",
                        background: "rgba(239,68,68,0.12)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: "99px",
                        color: "#f87171",
                        fontSize: "0.75rem", fontWeight: 700
                      }}>
                        <AlertCircle size={11} /> {item.status || "RESERVED"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── 3. UPCOMING CAMPUS EVENTS ────────────────────────────────────────────────
const UpcomingEventsSection = ({ events, loading }) => (
  <div className="glass-panel" style={{ padding: "1.75rem" }}>
    <SectionHeader icon={CalendarDays} title="Upcoming Campus Events" count={events.length} accentColor="#ec4899" />
    {loading ? (
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    ) : events.length === 0 ? (
      <EmptyState message="No upcoming events scheduled at the moment." />
    ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
        {events.map((event) => (
          <div key={event.id} style={{
            padding: "1.25rem",
            borderRadius: "var(--radius-md)",
            background: "rgba(236,72,153,0.05)",
            border: "1px solid rgba(236,72,153,0.18)",
            display: "flex", flexDirection: "column", gap: "0.75rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                padding: "0.2rem 0.7rem",
                borderRadius: "99px",
                background: event.is_public ? "rgba(99,102,241,0.15)" : "rgba(156,163,175,0.15)",
                color: event.is_public ? "#818cf8" : "var(--text-muted)",
                fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em"
              }}>
                {event.is_public ? "PUBLIC EVENT" : "INTERNAL"}
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{event.max_seats} seats</span>
            </div>

            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.35rem", lineHeight: 1.3 }}>{event.title}</h3>
              {event.description && (
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                  {event.description.length > 100 ? `${event.description.slice(0, 100)}...` : event.description}
                </p>
              )}
            </div>

            <div style={{
              padding: "0.6rem 0.85rem",
              background: "rgba(0,0,0,0.2)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.82rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600 }}>
                <MapPin size={13} color="#ec4899" />
                <span>
                  {event.room
                    ? `Room ${event.room.room_number} (${event.room.building?.code}) — ${event.room.building?.name}`
                    : "Venue TBD"}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                padding: "0.4rem 0.65rem",
                background: "rgba(236,72,153,0.1)",
                border: "1px solid rgba(236,72,153,0.25)",
                borderRadius: "6px"
              }}>
                <CalendarDays size={13} color="#ec4899" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "0.62rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Event Date</div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-main)" }}>{fmtDate(event.start_time)}</div>
                </div>
              </div>

              <div style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                padding: "0.4rem 0.65rem",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: "6px"
              }}>
                <Clock size={13} color="#34d399" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "0.62rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Time Slot</div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-main)" }}>{fmtSlot(event.start_time, event.end_time)}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const BookingStatusPage = () => {
  const [bookings, setBookings] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [eqReservations, setEqReservations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchAll = async () => {
    setLoadingBookings(true);
    setLoadingEquipment(true);
    setLoadingEvents(true);

    try {
      const bRes = await api.get("/bookings");
      const active = Array.isArray(bRes.data)
        ? bRes.data.filter((b) => !["CANCELLED", "COMPLETED"].includes(b.status))
        : [];
      setBookings(active);
    } catch { setBookings([]); } finally { setLoadingBookings(false); }

    try {
      const [eqRes, resRes] = await Promise.allSettled([
        api.get("/equipment"),
        api.get("/equipment/reservations")
      ]);
      setEquipment(eqRes.status === "fulfilled" && Array.isArray(eqRes.value.data) ? eqRes.value.data : []);
      setEqReservations(resRes.status === "fulfilled" && Array.isArray(resRes.value.data) ? resRes.value.data : []);
    } catch {
      setEquipment([]);
      setEqReservations([]);
    } finally {
      setLoadingEquipment(false);
    }

    try {
      const evRes = await api.get("/events");
      const now = new Date();
      const upcoming = Array.isArray(evRes.data)
        ? evRes.data.filter((ev) => !ev.start_time || new Date(ev.start_time) >= now)
        : evRes.data || [];
      setEvents(upcoming);
    } catch { setEvents([]); } finally { setLoadingEvents(false); }

    setLastRefreshed(new Date());
  };

  useEffect(() => { fetchAll(); }, []);

  const isLoading = loadingBookings || loadingEquipment || loadingEvents;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
            <div style={{
              background: "linear-gradient(135deg, #6366f1, #ec4899)",
              borderRadius: "10px", width: "36px", height: "36px",
              display: "flex", alignItems: "center", justifyContent: "center", color: "white"
            }}>
              <Activity size={18} />
            </div>
            <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Live Booking Status</h1>
          </div>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Real-time view of booked rooms, reserved equipment, and upcoming campus events with dates and time slots
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", textAlign: "right" }}>
            <div>Last updated</div>
            <div style={{ fontWeight: 600, color: "var(--text-muted)" }}>
              {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>
          <button
            className="btn-secondary"
            onClick={fetchAll}
            disabled={isLoading}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <RefreshCw size={15} style={{ animation: isLoading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {[
          { label: "Active Bookings", value: bookings.length, color: "#6366f1" },
          { label: "Reserved Equipment", value: eqReservations.length > 0 ? eqReservations.length : equipment.filter(e => !e.is_available).length, color: "#10b981" },
          { label: "Upcoming Events", value: events.length, color: "#ec4899" },
        ].map((stat) => (
          <div key={stat.label} style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius-md)",
            background: `${stat.color}11`,
            border: `1px solid ${stat.color}33`,
            flex: "1 1 160px"
          }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.3 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <BookedRoomsSection bookings={bookings} loading={loadingBookings} />
      <ReservedEquipmentSection reservations={eqReservations} equipment={equipment} loading={loadingEquipment} />
      <UpcomingEventsSection events={events} loading={loadingEvents} />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
