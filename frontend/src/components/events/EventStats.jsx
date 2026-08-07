import React from 'react';
import { Calendar, Users, Award, Building, Ticket, CheckCircle2 } from 'lucide-react';

export const EventStats = ({ stats = {} }) => {
  const statItems = [
    { label: 'Total Events', val: stats.total_events || 0, icon: Calendar, color: '#28A745' },
    { label: 'Total Participants', val: stats.total_registrations || 0, icon: Users, color: '#28A745' },
    { label: 'Events This Month', val: stats.upcoming_events || 0, icon: Ticket, color: '#28A745' },
    { label: 'Certificates Issued', val: stats.certificates_issued || 0, icon: Award, color: '#28A745' },
    { label: 'Departments Participating', val: stats.departments_participating || 0, icon: Building, color: '#28A745' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
      {statItems.map((item, idx) => {
        const IconComp = item.icon;
        return (
          <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#F5F7FA', border: '1px solid #E0E0E0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#4D4D4D', fontWeight: 600 }}>{item.label}</span>
              <div style={{ background: '#E8F5E9', padding: '0.4rem', borderRadius: 'var(--radius-xs)', display: 'flex' }}>
                <IconComp size={18} color="#28A745" />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#263238' }}>
              {item.val}
            </div>
          </div>
        );
      })}
    </div>
  );
};
