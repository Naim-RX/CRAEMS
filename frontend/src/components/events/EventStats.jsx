import React from 'react';
import { Calendar, Users, Award, Building, Ticket, CheckCircle2 } from 'lucide-react';

export const EventStats = ({ stats = {} }) => {
  const statItems = [
    { label: 'Total Events', val: stats.total_events || 12, icon: Calendar, color: 'var(--accent-primary)' },
    { label: 'Total Participants', val: stats.total_registrations || 184, icon: Users, color: '#38bdf8' },
    { label: 'Events This Month', val: stats.upcoming_events || 6, icon: Ticket, color: '#a78bfa' },
    { label: 'Certificates Issued', val: stats.certificates_issued || 45, icon: Award, color: '#fbbf24' },
    { label: 'Departments Participating', val: stats.departments_participating || 6, icon: Building, color: '#34d399' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
      {statItems.map((item, idx) => {
        const IconComp = item.icon;
        return (
          <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</span>
              <IconComp size={18} color={item.color} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>
              {item.val}
            </div>
          </div>
        );
      })}
    </div>
  );
};
