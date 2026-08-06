import React from 'react';
import { Search, Filter, RotateCcw, Calendar, MapPin, Tag, SlidersHorizontal } from 'lucide-react';

export const EventFilters = ({
  searchQuery, setSearchQuery,
  selectedCategory, setSelectedCategory,
  selectedDepartment, setSelectedDepartment,
  selectedVenue, setSelectedVenue,
  selectedMode, setSelectedMode,
  selectedPrice, setSelectedPrice,
  selectedSort, setSelectedSort,
  categories = [],
  departments = [],
  rooms = [],
  onReset
}) => {
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={onReset} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
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
          <select className="form-select" style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
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
          <select className="form-select" style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }} value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
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
          <select className="form-select" style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }} value={selectedVenue} onChange={(e) => setSelectedVenue(e.target.value)}>
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
          <select className="form-select" style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }} value={selectedMode} onChange={(e) => setSelectedMode(e.target.value)}>
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
          <select className="form-select" style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }} value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)}>
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
          <select className="form-select" style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }} value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}>
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
