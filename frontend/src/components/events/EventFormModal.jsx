import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Plus, Upload, Calendar, Users, MapPin, Tag, Briefcase, DollarSign, Clock, FileText, Sparkles } from 'lucide-react';

const ROLES_CAN_CREATE = ['ADMINISTRATOR', 'EVENT_ORGANIZER', 'RESOURCE_MANAGER'];
const ROLES_CAN_REQUEST = ['FACULTY', 'STUDENT'];

export const EventFormModal = ({ isOpen, onClose, userRole, onSubmit, categories = [], rooms = [] }) => {
  const isAdmin = ROLES_CAN_CREATE.includes(userRole);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    room_id: '',
    start_time: '',
    end_time: '',
    registration_deadline: '',
    max_seats: 50,
    event_mode: 'OFFLINE',
    price_type: 'FREE',
    price_amount: 0,
    is_public: true,
    cover_image: '',
    organizer_notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Event title is required.'); return; }
    if (!form.start_time) { setError('Event start date/time is required.'); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
      setForm({
        title: '', description: '', category_id: '', room_id: '',
        start_time: '', end_time: '', registration_deadline: '',
        max_seats: 50, event_mode: 'OFFLINE', price_type: 'FREE',
        price_amount: 0, is_public: true, cover_image: '', organizer_notes: ''
      });
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isAdmin ? '✨ Create New Event' : '📋 Request Event Organization'} maxWidth="700px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Header Context Banner */}
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: isAdmin ? 'rgba(99,102,241,0.12)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${isAdmin ? 'rgba(99,102,241,0.3)' : 'rgba(245,158,11,0.3)'}`,
          fontSize: '0.85rem',
          color: isAdmin ? '#a5b4fc' : '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Sparkles size={15} />
          {isAdmin
            ? 'As an Administrator, events you create are immediately published and visible to all users.'
            : 'Your event organization request will be reviewed by administrators. You will be notified upon approval.'}
        </div>

        {/* Row 1: Title */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Event Title *</label>
          <input
            name="title" value={form.title} onChange={handleChange}
            className="form-input" placeholder="e.g. Annual AI Workshop 2026"
            required
          />
        </div>

        {/* Row 2: Category + Mode */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Tag size={13} style={{ display: 'inline', marginRight: '4px' }} />Category</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} className="form-select">
              <option value="">-- Select Category --</option>
              {categories.length > 0
                ? categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                : [
                    { v: '1', l: 'Workshop' }, { v: '2', l: 'Seminar' }, { v: '3', l: 'Hackathon' },
                    { v: '4', l: 'Conference' }, { v: '5', l: 'Competition' }, { v: '6', l: 'Cultural Program' },
                    { v: '7', l: 'Sports' }, { v: '8', l: 'Career Fair' }, { v: '9', l: 'Research' }, { v: '10', l: 'Training' }
                  ].map(c => <option key={c.v} value={c.v}>{c.l}</option>)
              }
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Briefcase size={13} style={{ display: 'inline', marginRight: '4px' }} />Event Mode</label>
            <select name="event_mode" value={form.event_mode} onChange={handleChange} className="form-select">
              <option value="OFFLINE">Offline (In-Person)</option>
              <option value="ONLINE">Online (Virtual)</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Row 3: Description */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label"><FileText size={13} style={{ display: 'inline', marginRight: '4px' }} />Event Description *</label>
          <textarea
            name="description" value={form.description} onChange={handleChange}
            className="form-textarea" rows={4} placeholder="Describe the event objectives, agenda, target audience, and key activities..."
          />
        </div>

        {/* Row 4: Start + End Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />Start Date & Time *</label>
            <input name="start_time" value={form.start_time} onChange={handleChange} type="datetime-local" className="form-input" required />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />End Date & Time</label>
            <input name="end_time" value={form.end_time} onChange={handleChange} type="datetime-local" className="form-input" />
          </div>
        </div>

        {/* Row 5: Registration Deadline + Seats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />Registration Deadline</label>
            <input name="registration_deadline" value={form.registration_deadline} onChange={handleChange} type="datetime-local" className="form-input" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Users size={13} style={{ display: 'inline', marginRight: '4px' }} />Maximum Seats</label>
            <input name="max_seats" value={form.max_seats} onChange={handleChange} type="number" min={1} className="form-input" />
          </div>
        </div>

        {/* Row 6: Price Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><DollarSign size={13} style={{ display: 'inline', marginRight: '4px' }} />Price Type</label>
            <select name="price_type" value={form.price_type} onChange={handleChange} className="form-select">
              <option value="FREE">Free Entry</option>
              <option value="PAID">Paid Entry</option>
            </select>
          </div>
          {form.price_type === 'PAID' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Registration Fee ($)</label>
              <input name="price_amount" value={form.price_amount} onChange={handleChange} type="number" min={0} step={0.01} className="form-input" />
            </div>
          )}
        </div>

        {/* Row 7: Venue (Room) - Admin only */}
        {isAdmin && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />Assign Venue / Room</label>
            <select name="room_id" value={form.room_id} onChange={handleChange} className="form-select">
              <option value="">-- Select Room / Venue --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>Room {r.room_number} — {r.building?.name} (Cap: {r.capacity})</option>
              ))}
            </select>
          </div>
        )}

        {/* Row 8: Cover Image URL (Admin) */}
        {isAdmin && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Upload size={13} style={{ display: 'inline', marginRight: '4px' }} />Cover Image URL</label>
            <input
              name="cover_image" value={form.cover_image} onChange={handleChange}
              className="form-input" placeholder="https://example.com/event-banner.jpg"
            />
          </div>
        )}

        {/* Row 9: Notes (non-admin) */}
        {!isAdmin && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Additional Notes for Organizer Review</label>
            <textarea
              name="organizer_notes" value={form.organizer_notes} onChange={handleChange}
              className="form-textarea" rows={3} placeholder="Include any additional context, special requirements, or supporting rationale..."
            />
          </div>
        )}

        {/* Visibility Toggle - Admin only */}
        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
            <input type="checkbox" id="is_public" name="is_public" checked={form.is_public} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }} />
            <label htmlFor="is_public" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              Publish Event Immediately (Visible to all users)
            </label>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: '0.65rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#f87171' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            style={{ flex: 2, justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ opacity: 0.8 }}>Submitting...</span>
            ) : (
              <><Plus size={16} /> {isAdmin ? 'Create & Publish Event' : 'Submit Event Request'}</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
