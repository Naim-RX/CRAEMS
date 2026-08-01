import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Campus IT Support & Inquiries</h1>
        <p style={{ color: 'var(--text-muted)' }}>Get in touch with the CRAEMS system administration team</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Info Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Contact Details</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</div>
                <div style={{ fontWeight: 600 }}>support@craems.university.edu</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hotline / Helpdesk</div>
                <div style={{ fontWeight: 600 }}>+1 (800) 555-CRAEMS</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Office Location</div>
                <div style={{ fontWeight: 600 }}>Engineering Complex, Room 101</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle2 size={48} style={{ color: '#34d399' }} />
              <h3 style={{ fontSize: '1.3rem' }}>Message Received!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Thank you. Our system administrators will review your inquiry shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Send a Message</h3>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Your Name</label>
                <input type="text" className="form-input" required placeholder="John Doe"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" required placeholder="john@university.edu"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Subject</label>
                <input type="text" className="form-input" required placeholder="Resource Inquiry / Support Request"
                  value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Message</label>
                <textarea className="form-textarea" rows={4} required placeholder="Describe your question or technical issue..."
                  value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                <Send size={16} /> Submit Ticket
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
