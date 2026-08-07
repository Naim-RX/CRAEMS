import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Calendar, Box, Ticket, FileText, Settings, ShieldCheck, UserCheck, Activity } from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role?.name;

  const links = [
    {
      title: 'Dashboard',
      path: role === 'ADMINISTRATOR' ? '/dashboard/admin' :
            role === 'RESOURCE_MANAGER' ? '/dashboard/manager' :
            role === 'FACULTY' ? '/dashboard/faculty' : '/dashboard/student',
      icon: LayoutDashboard,
      roles: ['ADMINISTRATOR', 'RESOURCE_MANAGER', 'FACULTY', 'STUDENT', 'RESEARCHER', 'LAB_ASSISTANT', 'GUEST']
    },
    { title: 'Room Management', path: '/rooms', icon: Calendar, roles: ['ADMINISTRATOR', 'RESOURCE_MANAGER', 'FACULTY', 'STUDENT', 'RESEARCHER'] },
    { title: 'Equipment Hub', path: '/equipment', icon: Box, roles: ['ADMINISTRATOR', 'RESOURCE_MANAGER', 'FACULTY', 'STUDENT', 'LAB_ASSISTANT'] },
    { title: 'Campus Events', path: '/events', icon: Ticket, roles: ['ADMINISTRATOR', 'RESOURCE_MANAGER', 'FACULTY', 'STUDENT', 'GUEST', 'LAB_ASSISTANT'] },
    { title: 'Live Booking Status', path: '/status', icon: Activity, roles: ['ADMINISTRATOR', 'RESOURCE_MANAGER', 'FACULTY', 'STUDENT', 'RESEARCHER', 'LAB_ASSISTANT', 'GUEST'] },
    { title: 'Reports & Analytics', path: '/reports', icon: FileText, roles: ['ADMINISTRATOR', 'RESOURCE_MANAGER', 'FACULTY'] },
    { title: 'Admin Settings', path: '/settings/admin', icon: ShieldCheck, roles: ['ADMINISTRATOR'] },
    { title: 'My Profile', path: '/profile', icon: UserCheck, roles: ['ADMINISTRATOR', 'RESOURCE_MANAGER', 'FACULTY', 'STUDENT', 'RESEARCHER', 'LAB_ASSISTANT', 'GUEST'] },
  ];

  const allowedLinks = links.filter(l => l.roles.includes(role));

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      minHeight: 'calc(100vh - 65px)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ padding: '0 0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#89939E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Main Navigation
      </div>
      {allowedLinks.map((item, idx) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={idx}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-main)',
              background: isActive ? 'var(--accent-green-light)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.9rem',
              transition: 'var(--transition-fast)',
              borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent'
            })}
          >
            <Icon size={18} color={undefined} />
            <span>{item.title}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};
