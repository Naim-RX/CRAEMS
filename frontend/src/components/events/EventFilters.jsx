import React, { useState, useEffect } from 'react';
import { Search, RotateCcw } from 'lucide-react';

/**
 * EventFilters — self-contained, controlled-by-parent filter bar.
 * Manages its own input state but lifts the active filter object up via
 * `onFiltersChange(filters)` on every change so the parent page can
 * re-apply search/category/department/venue/mode/price/sort.
 */
export const EventFilters = ({
  categories = [],
  departments = [],
  rooms = [],
  onFiltersChange,
  onReset
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [venue, setVenue] = useState('');
  const [mode, setMode] = useState('ALL');
  const [price, setPrice] = useState('ALL');
  const [sort, setSort] = useState('upcoming');

  // Debounce search input (300ms) before pushing up to parent
  useEffect(() => {
    const t = setTimeout(() => {
      onFiltersChange({ search, category, department, venue, mode, price, sort });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, department, venue, mode, price, sort]);

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setDepartment('');
    setVenue('');
    setMode('ALL');
    setPrice('ALL');
    setSort('upcoming');
    if (onReset) onReset();
  };

  const selectStyle = { padding: '0.45rem 0.75rem', fontSize: '0.85rem' };

  return (
    <div className="glass-panel" style={{
      position: 'sticky',
      top: '75px',
      zIndex: 100,
      padding: '1.25rem 1.5rem',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: 'var(--shadow-md)'
    }}>
      {/* Top Search & Reset Row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search events by title, keywords, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={handleReset} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <RotateCcw size={14} /> Reset Filters
          </button>
        </div>
      </div>

      {/* Dropdown Filters Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.85rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        {/* Category */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
            Category
          </label>
          <select className="form-select" style={selectStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
            Department
          </label>
          <select className="form-select" style={selectStyle} value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>

        {/* Venue */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
            Venue
          </label>
          <select className="form-select" style={selectStyle} value={venue} onChange={(e) => setVenue(e.target.value)}>
            <option value="">All Venues</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>Room {r.room_number} ({r.building?.code})</option>
            ))}
          </select>
        </div>

        {/* Mode */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
            Event Mode
          </label>
          <select className="form-select" style={selectStyle} value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="ALL">All Modes</option>
            <option value="OFFLINE">Offline (In-Person)</option>
            <option value="ONLINE">Online (Virtual)</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
            Price Type
          </label>
          <select className="form-select" style={selectStyle} value={price} onChange={(e) => setPrice(e.target.value)}>
            <option value="ALL">All Prices</option>
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
            Sort By
          </label>
          <select className="form-select" style={selectStyle} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="upcoming">Upcoming Date</option>
            <option value="latest">Recently Added</option>
            <option value="popular">Seat Capacity</option>
            <option value="deadline">Registration Deadline</option>
          </select>
        </div>
      </div>
    </div>
  );
};

