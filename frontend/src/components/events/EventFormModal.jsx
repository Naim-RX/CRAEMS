import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CalendarDatePicker } from '../common/CalendarDatePicker';
import { Plus, Upload, Calendar, Users, MapPin, Tag, Briefcase, DollarSign, Clock, FileText, Sparkles, Building2 } from 'lucide-react';

const ROLES_CAN_CREATE = ['ADMINISTRATOR', 'EVENT_ORGANIZER', 'RESOURCE_MANAGER'];
const ROLES_CAN_REQUEST = ['FACULTY', 'STUDENT'];

export const EventFormModal = ({ isOpen, onClose, userRole, onSubmit, categories = [], rooms = [], departments = [], initialData = null }) => {
  const isAdmin = ROLES_CAN_CREATE.includes(userRole);
  const isEditMode = !!initialData;

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    department_id: '',
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

  React.useEffect(() => {
    if (initialData && isOpen) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        category_id: initialData.category_id || '',
        department_id: initialData.department_id || '',
        room_id: initialData.room_id || '',
        start_time: initialData.start_time ? new Date(initialData.start_time).toISOString().slice(0,16) : '',
        end_time: initialData.end_time ? new Date(initialData.end_time).toISOString().slice(0,16) : '',
        registration_deadline: initialData.registration_deadline ? new Date(initialData.registration_deadline).toISOString().slice(0,16) : '',
        max_seats: initialData.max_seats || 50,
        event_mode: initialData.event_mode || 'OFFLINE',
        price_type: initialData.price_type || 'FREE',
        price_amount: initialData.price_amount || 0,
        is_public: initialData.is_published !== false,
        cover_image: initialData.cover_image || '',
        organizer_notes: ''
      });
    }
  }, [initialData, isOpen]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Normalize empty strings → null for optional DB fields so Pydantic/FastAPI doesn't reject them
  const normalizeForm = (f) => ({
    ...f,
    category_id: f.category_id === '' ? null : Number(f.category_id),
    department_id: f.department_id === '' ? null : Number(f.department_id),
    room_id: f.room_id === '' ? null : f.room_id,
    registration_deadline: f.registration_deadline === '' ? null : f.registration_deadline,
    end_time: f.end_time === '' ? null : f.end_time,
    price_amount: f.price_type === 'FREE' ? 0 : Number(f.price_amount) || 0,
    max_seats: Number(f.max_seats) || 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Event title is required.'); return; }
    if (!form.start_time) { setError('Event start date/time is required.'); return; }
    if (form.event_mode !== 'ONLINE' && !form.room_id) {
      setError('Please assign a venue / room for this in-person event.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = normalizeForm(form);
      await onSubmit(payload);
      onClose();
      setForm({
        title: '', description: '', category_id: '', department_id: '', room_id: '',
        start_time: '', end_time: '', registration_deadline: '',
        max_seats: 50, event_mode: 'OFFLINE', price_type: 'FREE',
        price_amount: 0, is_public: true, cover_image: '', organizer_notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '', description: '', category_id: '', department_id: '', room_id: '',
      start_time: '', end_time: '', registration_deadline: '',
      max_seats: 50, event_mode: 'OFFLINE', price_type: 'FREE',
      price_amount: 0, is_public: true, cover_image: '', organizer_notes: ''
    });
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); resetForm(); }} title={isEditMode ? '✏️ Edit Event' : (isAdmin ? '✨ Create New Event' : '📋 Request Event Organization')} maxWidth="700px">
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
          {isEditMode 
            ? 'You are editing an existing event. Changes will be saved immediately.'
            : (isAdmin
              ? 'As an Administrator, events you create are immediately published and visible to all users.'
              : 'Your event organization request will be reviewed by administrators. You will be notified upon approval.')}
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
            <CalendarDatePicker
              mode="datetime"
              name="start_time"
              value={form.start_time}
              onChange={(val) => setForm(prev => ({ ...prev, start_time: val }))}
              placeholder="Pick start time..."
              required
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />End Date & Time</label>
            <CalendarDatePicker
              mode="datetime"
              name="end_time"
              value={form.end_time}
              onChange={(val) => setForm(prev => ({ ...prev, end_time: val }))}
              placeholder="Pick end time..."
            />
          </div>
        </div>

        {/* Row 5: Registration Deadline + Seats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />Registration Deadline</label>
            <CalendarDatePicker
              mode="datetime"
              name="registration_deadline"
              value={form.registration_deadline}
              onChange={(val) => setForm(prev => ({ ...prev, registration_deadline: val }))}
              placeholder="Pick deadline..."
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Users size={13} style={{ display: 'inline', marginRight: '4px' }} />Maximum Seats</label>
            <input name="max_seats" value={form.max_seats} onChange={handleChange} type="number" min={1} className="form-input" />
          </div>
        </div>

        {/* Row 6: Department + Price Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Building2 size={13} style={{ display: 'inline', marginRight: '4px' }} />Department</label>
            <select name="department_id" value={form.department_id} onChange={handleChange} className="form-select">
              <option value="">-- Select Department --</option>
              {departments.length > 0 && departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><DollarSign size={13} style={{ display: 'inline', marginRight: '4px' }} />Price Type</label>
            <select name="price_type" value={form.price_type} onChange={handleChange} className="form-select">
              <option value="FREE">Free Entry</option>
              <option value="PAID">Paid Entry</option>
            </select>
          </div>
        </div>

        {/* Row 7: Price Amount (only when PAID) */}
        {form.price_type === 'PAID' && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Registration Fee ($)</label>
            <input name="price_amount" value={form.price_amount} onChange={handleChange} type="number" min={0} step={0.01} className="form-input" />
          </div>
        )}

        {/* Row 8: Venue (Room) — available for ALL roles (admin assigns, faculty/student requests) */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label"><MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />Assign Venue / Room {form.event_mode !== 'ONLINE' && <span style={{ color: '#f87171' }}>*</span>}</label>
          <select name="room_id" value={form.room_id} onChange={handleChange} className="form-select">
            <option value="">-- Select Room / Venue --</option>
            {rooms.length > 0 ? rooms.map(r => (
              <option key={r.id} value={r.id}>Room {r.room_number} — {r.building?.name || 'Campus'} (Cap: {r.capacity})</option>
            )) : (
              <option value="" disabled>No venues available — contact an administrator</option>
            )}
          </select>
          {form.event_mode === 'ONLINE' && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
              Optional for online events — you can leave it unassigned.
            </div>
          )}
        </div>

        {/* Row 9: Cover Image URL (Admin) */}
        {isAdmin && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><Upload size={13} style={{ display: 'inline', marginRight: '4px' }} />Cover Image URL</label>
            <input
              name="cover_image" value={form.cover_image} onChange={handleChange}
              className="form-input" placeholder="https://example.com/event-banner.jpg"
            />
          </div>
        )}

        {/* Row 10: Notes (non-admin) */}
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
          <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { onClose(); resetForm(); }}>
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
              <><Plus size={16} /> {isEditMode ? 'Save Changes' : (isAdmin ? 'Create & Publish Event' : 'Submit Event Request')}</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

