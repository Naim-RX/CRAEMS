import React from 'react';
import { Wrench, BookOpen, Globe, Code, Trophy, Music, Activity, Briefcase, Microscope, Award, Layers } from 'lucide-react';

const ICON_MAP = {
  Workshops: Wrench,
  Seminars: BookOpen,
  Conferences: Globe,
  Hackathons: Code,
  Competitions: Trophy,
  'Cultural Programs': Music,
  Sports: Activity,
  'Career Fair': Briefcase,
  Research: Microscope,
  Training: Award,
};

export const EventCategoryList = ({ categories = [], selectedCategory, onSelectCategory }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Explore Categories</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '0.85rem'
      }}>
        {/* All Categories Option */}
        <div
          onClick={() => onSelectCategory('')}
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: selectedCategory === '' ? 'linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)' : 'var(--bg-glass)',
            border: selectedCategory === '' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
            color: selectedCategory === '' ? '#ffffff' : 'var(--text-main)',
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <Layers size={22} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>All Events</span>
        </div>

        {categories.map(cat => {
          const IconComponent = ICON_MAP[cat.name] || Layers;
          const isSelected = String(selectedCategory) === String(cat.id);

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)' : 'var(--bg-glass)',
                border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                color: isSelected ? '#ffffff' : 'var(--text-main)',
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <IconComponent size={22} color={isSelected ? '#ffffff' : 'var(--accent-primary)'} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{cat.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
