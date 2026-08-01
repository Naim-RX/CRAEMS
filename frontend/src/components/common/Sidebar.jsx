import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Calendar, Box, Ticket, FileText, Settings, ShieldCheck, UserCheck } from 'lucide-react';

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
    { title: 'Reports & Analytics', path: '/reports', icon: FileText, roles: ['ADMINISTRATOR', 'RESOURCE_MANAGER', 'FACULTY'] },
    { title: 'Admin Settings', path: '/settings/admin', icon: ShieldCheck, roles: ['ADMINISTRATOR'] },
    { title: 'My Profile', path: '/profile', icon: UserCheck, roles: ['ADMINISTRATOR', 'RESOURCE_MANAGER', 'FACULTY', 'STUDENT', 'RESEARCHER', 'LAB_ASSISTANT', 'GUEST'] },
  ];

  const allowedLinks = links.filter(l => l.roles.includes(role));

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      minHeight: 'calc(100vh - 65px)'
    }}>
      <div style={{ padding: '0 0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
              color: isActive ? '#ffffff' : 'var(--text-muted)',
              background: isActive ? 'linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.9rem',
              transition: 'var(--transition-fast)'
            })}
          >
            <Icon size={18} />
            <span>{item.title}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};
