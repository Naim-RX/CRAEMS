import React from 'react';
import { Building2, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '3rem 2rem 1.5rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Building2 size={24} color="var(--accent-primary)" />
            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>CRAEMS</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Centralized Resource Allocation and Event Management System designed for modern institutions, universities, and enterprises.
          </p>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Quick Portals</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <li>Room & Facility Catalog</li>
            <li>Equipment Reservation</li>
            <li>Campus Event Tickets</li>
            <li>System Status</li>
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Security & Governance</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <li>RBAC Access Control</li>
            <li>Audit Trail Logging</li>
            <li>Conflict Resolution Engine</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1.5rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-dim)'
      }}>
        © {new Date().getFullYear()} CRAEMS Enterprise Platform. All rights reserved. Built with precision and enterprise architecture.
      </div>
    </footer>
  );
};
