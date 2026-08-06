import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { QrCode, Download, X, CheckCircle2, Clock, AlertCircle, Ticket, Calendar, MapPin } from 'lucide-react';

const RegistrationStatusBadge = ({ status }) => {
  const styles = {
    REGISTERED: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', label: '✓ Registered' },
    ATTENDED: { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', label: '✓ Attended' },
    CANCELLED: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', label: '✗ Cancelled' },
    WAITLIST: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', label: '⏳ Waitlisted' },
  };
  const s = styles[status] || styles.REGISTERED;
  return (
    <span style={{ ...s, fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '9999px', display: 'inline-block' }}>
      {s.label}
    </span>
  );
};

export const MyEventsView = ({ registrations = [], onCancelRegistration }) => {
  const [qrModal, setQrModal] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  const handleDownload = (reg) => {
    const link = document.createElement('a');
    link.href = reg.qr_code;
    link.download = `ticket_${reg.ticket_code}.png`;
    link.click();
  };

  const handleCancelConfirm = async () => {
    if (cancelConfirm && onCancelRegistration) {
      await onCancelRegistration(cancelConfirm.id);
      setCancelConfirm(null);
    }
  };

  if (!registrations || registrations.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '4rem' }}>🎟️</div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>No Registered Events</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '380px' }}>
          You haven't registered for any campus events yet. Explore upcoming workshops, seminars, and competitions!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>🎫 My Event Registrations</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {registrations.length} registration{registrations.length > 1 ? 's' : ''} found. Present QR ticket at event entrance for check-in.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {registrations.map(reg => {
          const isCancelled = reg.status === 'CANCELLED';
          return (
            <div
              key={reg.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                border: isCancelled ? '1px solid rgba(239,68,68,0.2)' : '1px solid var(--border-color)',
                opacity: isCancelled ? 0.7 : 1
              }}
            >
              {/* Event Banner Strip */}
              <div style={{
                height: '90px',
                borderRadius: 'var(--radius-sm)',
                background: isCancelled
                  ? 'linear-gradient(135deg, rgba(60,20,20,0.7), rgba(30,10,10,0.9))'
                  : 'linear-gradient(135deg, rgba(30,27,75,0.9), rgba(79,46,229,0.8))',
                display: 'flex',
                alignItems: 'center',
                padding: '0.85rem 1.25rem',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.15rem' }}>
                    {reg.event?.category?.name || 'Campus Event'}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
                    {reg.event?.title}
                  </h4>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <RegistrationStatusBadge status={reg.status} />
                </div>
              </div>

              {/* Registration Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} color="var(--accent-secondary)" />
                    {reg.event?.start_time ? new Date(reg.event.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={13} color="var(--accent-primary)" />
                    Room {reg.event?.room?.room_number || 'TBD'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.65rem', borderRadius: 'var(--radius-xs)', fontSize: '0.78rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Registered On</div>
                    <div style={{ fontWeight: 600 }}>{new Date(reg.registered_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Ticket Code</div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>{reg.ticket_code}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Attendance</div>
                    <div style={{ fontWeight: 600, color: reg.attendance_status === 'PRESENT' ? '#34d399' : 'var(--text-muted)' }}>
                      {reg.attendance_status || 'Not Marked'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Payment</div>
                    <div style={{ fontWeight: 600, color: reg.payment_status === 'PAID' ? '#34d399' : reg.payment_status === 'FREE' ? '#a5b4fc' : '#fbbf24' }}>
                      {reg.payment_status || 'FREE'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!isCancelled && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                    onClick={() => setQrModal(reg)}
                  >
                    <QrCode size={15} /> View QR Ticket
                  </button>
                  <button
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.82rem'
                    }}
                    onClick={() => handleDownload(reg)}
                    title="Download Ticket"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#f87171',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.82rem'
                    }}
                    onClick={() => setCancelConfirm(reg)}
                    title="Cancel Registration"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {isCancelled && (
                <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#f87171', padding: '0.35rem', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-xs)' }}>
                  This registration has been cancelled
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* QR Ticket Modal */}
      <Modal isOpen={!!qrModal} onClose={() => setQrModal(null)} title="Your Event Entry Ticket" maxWidth="420px">
        {qrModal && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center' }}>
            <div style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} /> Registered Successfully
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Present this QR code at the event entrance for fast digital check-in
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
              {qrModal.qr_code ? (
                <img src={qrModal.qr_code} alt="QR Ticket" style={{ width: '200px', height: '200px' }} />
              ) : (
                <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '8px' }}>
                  <QrCode size={80} color="#6366f1" />
                </div>
              )}
            </div>

            <div style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '0.15em', background: 'rgba(99,102,241,0.12)', padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.3)' }}>
              {qrModal.ticket_code}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', width: '100%', fontSize: '0.82rem', background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Event</div>
                <div style={{ fontWeight: 700 }}>{qrModal.event?.title}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Venue</div>
                <div style={{ fontWeight: 700 }}>Room {qrModal.event?.room?.room_number || 'TBD'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Date</div>
                <div style={{ fontWeight: 700 }}>{qrModal.event?.start_time ? new Date(qrModal.event.start_time).toLocaleDateString() : 'TBD'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Status</div>
                <div style={{ fontWeight: 700, color: '#34d399' }}>{qrModal.status}</div>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleDownload(qrModal)}>
              <Download size={16} /> Download Ticket Image
            </button>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={!!cancelConfirm} onClose={() => setCancelConfirm(null)} title="Cancel Event Registration" maxWidth="420px">
        {cancelConfirm && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)' }}>
              <AlertCircle size={22} color="#f87171" />
              <div>
                <div style={{ fontWeight: 700, color: '#f87171' }}>Confirm Cancellation</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>This action cannot be undone. Seat will be released.</div>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Are you sure you want to cancel your registration for <strong style={{ color: '#ffffff' }}>{cancelConfirm.event?.title}</strong>?
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setCancelConfirm(null)}>
                Keep Registration
              </button>
              <button
                style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={handleCancelConfirm}
              >
                <X size={16} /> Cancel Registration
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
