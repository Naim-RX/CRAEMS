import React, { useState } from 'react';
import { Modal } from './Modal';
import { QrCode, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const QRScannerModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [ticketCode, setTicketCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScanVerify = async (e) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;

    setLoading(true);
    setScanResult(null);

    try {
      const res = await api.post(`/events/verify-qr?scanned_by_id=${user.id}`, {
        ticket_code: ticketCode.trim()
      });
      setScanResult(res.data);
    } catch (err) {
      setScanResult({
        valid: false,
        message: err.response?.data?.detail || 'Verification error.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live QR Ticket Attendance Verification">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'rgba(99, 102, 241, 0.15)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          color: 'var(--accent-primary)'
        }}>
          <QrCode size={32} />
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Enter attendee ticket code manually or scan using QR camera reader.
        </p>
      </div>

      <form onSubmit={handleScanVerify} className="form-group">
        <label className="form-label">Ticket Reference Code</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. TICK-A8F91B2C3D"
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify Ticket Attendance'}
        </button>
      </form>

      {scanResult && (
        <div className="animate-fade-in" style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          borderRadius: 'var(--radius-sm)',
          border: scanResult.valid ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
          background: scanResult.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {scanResult.valid ? <CheckCircle size={28} color="#10b981" /> : <AlertTriangle size={28} color="#ef4444" />}
          <div>
            <div style={{ fontWeight: 700, color: scanResult.valid ? '#10b981' : '#ef4444' }}>
              {scanResult.valid ? 'ATTENDANCE VERIFIED' : 'VERIFICATION FAILED'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{scanResult.message}</div>
          </div>
        </div>
      )}
    </Modal>
  );
};
