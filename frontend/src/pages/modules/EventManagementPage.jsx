import React, { useState, useEffect } from 'react';
import { Ticket, QrCode, Plus, Calendar, CheckCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { QRScannerModal } from '../../components/common/QRScannerModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const EventManagementPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [ticketModalData, setTicketModalData] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Events fetch error:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegisterEvent = async (eventId) => {
    if (!user) {
      alert('Please sign in to register for campus events.');
      return;
    }

    try {
      const res = await api.post(`/events/${eventId}/register?user_id=${user.id}`);
      setTicketModalData(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Event registration failed.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Campus Events & Workshop Registration</h1>
          <p style={{ color: 'var(--text-muted)' }}>Public symposiums, guest lectures, QR ticket scanning & attendance tracking</p>
        </div>
        {user && ['ADMINISTRATOR', 'RESOURCE_MANAGER', 'LAB_ASSISTANT'].includes(user.role?.name) && (
          <button className="btn-secondary" onClick={() => setIsQRScannerOpen(true)}>
            <QrCode size={18} /> Open Attendance Scanner
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {events.map(event => (
          <div key={event.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-active">{event.is_public ? 'PUBLIC EVENT' : 'INTERNAL'}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Capacity: {event.max_seats} seats</span>
              </div>

              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{event.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{event.description}</p>

              <div style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
                <div>📍 Location: Room {event.room?.room_number} ({event.room?.building?.code})</div>
                <div>🕒 Schedule: {new Date(event.start_time).toLocaleString()}</div>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleRegisterEvent(event.id)}>
              <Ticket size={16} /> Register & Get QR Ticket
            </button>
          </div>
        ))}
      </div>

      {/* Generated Ticket QR Modal */}
      {ticketModalData && (
        <Modal isOpen={!!ticketModalData} onClose={() => setTicketModalData(null)} title="Event Entry Ticket & QR Code">
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <CheckCircle size={20} /> REGISTRATION SUCCESSFUL
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Present this QR ticket code at the entrance scanner for check-in.
            </div>

            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'inline-block', marginBottom: '1.5rem' }}>
              <img src={ticketModalData.qr_code} alt="Ticket QR Code" style={{ width: '200px', height: '200px' }} />
            </div>

            <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.1em' }}>
              {ticketModalData.ticket_code}
            </div>
          </div>
        </Modal>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal isOpen={isQRScannerOpen} onClose={() => setIsQRScannerOpen(false)} />
    </div>
  );
};
