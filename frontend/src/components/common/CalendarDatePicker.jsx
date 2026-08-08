import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, X, Check } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarDatePicker = ({
  value = '',
  onChange,
  min,
  max,
  mode = 'date', // 'date' | 'datetime' | 'datetime-local'
  placeholder = 'Select date...',
  name,
  id,
  required = false,
  disabled = false,
  className = '',
  style = {},
  inline = false
}) => {
  const isDateTime = mode === 'datetime' || mode === 'datetime-local';
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(inline);

  // Parse incoming value safely
  const parseValue = (val) => {
    if (!val) return null;
    const cleanStr = String(val).replace('Z', '');
    const d = new Date(cleanStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const parsedDate = parseValue(value);

  // Navigation state (month/year being viewed)
  const initialView = parsedDate || (min ? parseValue(min) || new Date() : new Date());
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

  // Time state for datetime mode
  const [selectedHour, setSelectedHour] = useState(() => {
    if (parsedDate) {
      const h = parsedDate.getHours();
      return h % 12 === 0 ? 12 : h % 12;
    }
    return 9;
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (parsedDate) {
      return String(parsedDate.getMinutes()).padStart(2, '0');
    }
    return '00';
  });
  const [selectedAmPm, setSelectedAmPm] = useState(() => {
    if (parsedDate) {
      return parsedDate.getHours() >= 12 ? 'PM' : 'AM';
    }
    return 'AM';
  });

  // Sync internal view when value changes from outside
  useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
      const h = parsedDate.getHours();
      setSelectedHour(h % 12 === 0 ? 12 : h % 12);
      setSelectedMinute(String(parsedDate.getMinutes()).padStart(2, '0'));
      setSelectedAmPm(h >= 12 ? 'PM' : 'AM');
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (inline) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, inline]);

  // Format date helper
  const formatDateValue = (year, month, day, hour = selectedHour, minute = selectedMinute, ampm = selectedAmPm) => {
    const yStr = String(year);
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    if (!isDateTime) {
      return dateStr;
    }

    let h24 = Number(hour);
    if (ampm === 'PM' && h24 < 12) h24 += 12;
    if (ampm === 'AM' && h24 === 12) h24 = 0;
    const hStr = String(h24).padStart(2, '0');
    const minStr = String(minute).padStart(2, '0');
    return `${dateStr}T${hStr}:${minStr}`;
  };

  const emitChange = (newVal) => {
    if (!onChange) return;
    const syntheticEvent = {
      target: { name: name || '', value: newVal },
      currentTarget: { name: name || '', value: newVal }
    };
    onChange(newVal, syntheticEvent);
  };

  const isDateDisabled = (year, month, day) => {
    const target = new Date(year, month, day, 23, 59, 59, 999);
    if (min) {
      const minDate = parseValue(min);
      if (minDate) {
        const minCompare = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate(), 0, 0, 0, 0);
        if (target < minCompare) return true;
      }
    }
    if (max) {
      const maxDate = parseValue(max);
      if (maxDate) {
        const maxCompare = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 999);
        if (target > maxCompare) return true;
      }
    }
    return false;
  };

  const handleSelectDay = (year, month, day) => {
    if (isDateDisabled(year, month, day)) return;
    const formatted = formatDateValue(year, month, day);
    emitChange(formatted);
    if (!isDateTime && !inline) {
      setIsOpen(false);
    }
  };

  const handleTimeChange = (newHour, newMin, newAmPm) => {
    setSelectedHour(newHour);
    setSelectedMinute(newMin);
    setSelectedAmPm(newAmPm);

    const baseYear = parsedDate ? parsedDate.getFullYear() : viewYear;
    const baseMonth = parsedDate ? parsedDate.getMonth() : viewMonth;
    const baseDay = parsedDate ? parsedDate.getDate() : new Date().getDate();

    const formatted = formatDateValue(baseYear, baseMonth, baseDay, newHour, newMin, newAmPm);
    emitChange(formatted);
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleQuickSelect = (daysOffset) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    handleSelectDay(d.getFullYear(), d.getMonth(), d.getDate());
  };

  // Calendar Grid generation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const calendarCells = [];

  // Prev month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    calendarCells.push({
      day,
      month: m,
      year: y,
      isCurrentMonth: false,
      disabled: isDateDisabled(y, m, day)
    });
  }

  // Current month days
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday =
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === i;

    const isSelected =
      parsedDate &&
      parsedDate.getFullYear() === viewYear &&
      parsedDate.getMonth() === viewMonth &&
      parsedDate.getDate() === i;

    calendarCells.push({
      day: i,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
      isToday,
      isSelected,
      disabled: isDateDisabled(viewYear, viewMonth, i)
    });
  }

  // Next month padding days to complete grid cleanly
  const currentTotal = calendarCells.length;
  const targetTotal = currentTotal > 35 ? 42 : 35;
  const remainingCells = targetTotal - currentTotal;
  for (let i = 1; i <= remainingCells; i++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    calendarCells.push({
      day: i,
      month: m,
      year: y,
      isCurrentMonth: false,
      disabled: isDateDisabled(y, m, i)
    });
  }

  // Display text formatted
  const getDisplayText = () => {
    if (!parsedDate) return '';
    const dayName = DAYS_OF_WEEK[parsedDate.getDay()];
    const monthName = SHORT_MONTH_NAMES[parsedDate.getMonth()];
    const dayNum = parsedDate.getDate();
    const yr = parsedDate.getFullYear();

    if (!isDateTime) {
      return `${dayName}, ${monthName} ${dayNum}, ${yr}`;
    }

    let h = parsedDate.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 === 0 ? 12 : h % 12;
    const m = String(parsedDate.getMinutes()).padStart(2, '0');
    return `${dayName}, ${monthName} ${dayNum}, ${yr} at ${h}:${m} ${ampm}`;
  };

  const yearsOptions = [];
  const currentYr = new Date().getFullYear();
  for (let y = currentYr - 3; y <= currentYr + 7; y++) {
    yearsOptions.push(y);
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        ...style
      }}
      className={`calendar-datepicker-root ${className}`}
    >
      {/* Hidden input for form validation */}
      {name && (
        <input
          type="hidden"
          name={name}
          id={id}
          value={value || ''}
          required={required}
        />
      )}

      {/* Input Display Trigger */}
      {!inline && (
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.6rem',
            padding: '0.75rem 1rem',
            background: 'var(--bg-primary)',
            border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
            boxShadow: isOpen ? '0 0 0 3px rgba(40, 167, 69, 0.2)' : 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'var(--transition-fast)',
            userSelect: 'none'
          }}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <CalendarIcon size={17} color={isOpen || parsedDate ? 'var(--accent-primary)' : 'var(--text-dim)'} />
            <span style={{
              fontSize: '0.92rem',
              fontWeight: parsedDate ? 600 : 400,
              color: parsedDate ? 'var(--text-main)' : 'var(--text-dim)'
            }}>
              {parsedDate ? getDisplayText() : placeholder}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {parsedDate && !required && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  emitChange('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '50%'
                }}
                title="Clear date"
              >
                <X size={14} />
              </button>
            )}
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              padding: '0.15rem 0.45rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-xs)',
              fontWeight: 600
            }}>
              📅 Pick
            </span>
          </div>
        </div>
      )}

      {/* Calendar Dropdown Popover */}
      {(isOpen || inline) && (
        <div
          style={{
            position: inline ? 'relative' : 'absolute',
            top: inline ? 0 : 'calc(100% + 6px)',
            left: 0,
            zIndex: 1050,
            width: '100%',
            minWidth: '310px',
            maxWidth: '360px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: inline ? 'none' : '0 12px 32px rgba(0, 0, 0, 0.18)',
            padding: '1rem',
            animation: inline ? 'none' : 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Quick Action Chips */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem' }}>
            <button
              type="button"
              onClick={() => handleQuickSelect(0)}
              style={{
                flex: 1,
                padding: '0.35rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                color: 'var(--text-main)',
                transition: 'var(--transition-fast)'
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(1)}
              style={{
                flex: 1,
                padding: '0.35rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                color: 'var(--text-main)',
                transition: 'var(--transition-fast)'
              }}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(7)}
              style={{
                flex: 1,
                padding: '0.35rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                color: 'var(--text-main)',
                transition: 'var(--transition-fast)'
              }}
            >
              +1 Week
            </button>
          </div>

          {/* Month & Year Navigation Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
            paddingBottom: '0.6rem',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                padding: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-fast)'
              }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                style={{
                  padding: '0.3rem 0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                style={{
                  padding: '0.3rem 0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {yearsOptions.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                padding: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-fast)'
              }}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days of Week Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '2px',
            textAlign: 'center',
            marginBottom: '0.4rem'
          }}>
            {DAYS_OF_WEEK.map((d, i) => (
              <span
                key={d}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: i === 0 || i === 6 ? 'var(--accent-primary)' : 'var(--text-dim)',
                  textTransform: 'uppercase',
                  padding: '0.2rem 0'
                }}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Days Matrix */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '3px',
            textAlign: 'center'
          }}>
            {calendarCells.map((cell, idx) => {
              let bg = 'transparent';
              let color = cell.isCurrentMonth ? 'var(--text-main)' : 'var(--text-dim)';
              let border = '1px solid transparent';
              let fontWeight = cell.isCurrentMonth ? 500 : 400;

              if (cell.isToday && !cell.isSelected) {
                border = '1px solid var(--accent-primary)';
                fontWeight = 700;
              }

              if (cell.isSelected) {
                bg = 'var(--accent-primary)';
                color = '#ffffff';
                fontWeight = 800;
                border = '1px solid var(--accent-primary)';
              }

              return (
                <button
                  key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
                  type="button"
                  disabled={cell.disabled}
                  onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                  style={{
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: bg,
                    color: color,
                    border: border,
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.84rem',
                    fontWeight: fontWeight,
                    cursor: cell.disabled ? 'not-allowed' : 'pointer',
                    opacity: cell.disabled ? 0.35 : cell.isCurrentMonth ? 1 : 0.45,
                    transition: 'var(--transition-fast)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!cell.disabled && !cell.isSelected) {
                      e.currentTarget.style.background = 'var(--accent-green-light)';
                      e.currentTarget.style.color = 'var(--accent-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!cell.disabled && !cell.isSelected) {
                      e.currentTarget.style.background = bg;
                      e.currentTarget.style.color = color;
                    }
                  }}
                >
                  {cell.day}
                  {cell.isToday && !cell.isSelected && (
                    <span style={{
                      position: 'absolute',
                      bottom: '2px',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: 'var(--accent-primary)'
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Time Picker Section for Datetime Mode */}
          {isDateTime && (
            <div style={{
              marginTop: '0.85rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-color)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-main)' }}>
                  <Clock size={13} color="var(--accent-primary)" /> Select Time
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {selectedHour}:{selectedMinute} {selectedAmPm}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {/* Hour */}
                <select
                  value={selectedHour}
                  onChange={(e) => handleTimeChange(Number(e.target.value), selectedMinute, selectedAmPm)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    fontSize: '0.82rem',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-xs)'
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                  ))}
                </select>

                <span style={{ fontWeight: 800, color: 'var(--text-dim)' }}>:</span>

                {/* Minute */}
                <select
                  value={selectedMinute}
                  onChange={(e) => handleTimeChange(selectedHour, e.target.value, selectedAmPm)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    fontSize: '0.82rem',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-xs)'
                  }}
                >
                  {['00', '15', '30', '45'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                {/* AM / PM */}
                <div style={{ display: 'flex', borderRadius: 'var(--radius-xs)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  {['AM', 'PM'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleTimeChange(selectedHour, selectedMinute, p)}
                      style={{
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: 'none',
                        background: selectedAmPm === p ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                        color: selectedAmPm === p ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Time Presets */}
              <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { label: '08:00 AM', h: 8, m: '00', p: 'AM' },
                  { label: '10:00 AM', h: 10, m: '00', p: 'AM' },
                  { label: '01:00 PM', h: 1, m: '00', p: 'PM' },
                  { label: '03:00 PM', h: 3, m: '00', p: 'PM' },
                  { label: '05:00 PM', h: 5, m: '00', p: 'PM' }
                ].map(slot => (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={() => handleTimeChange(slot.h, slot.m, slot.p)}
                    style={{
                      padding: '0.2rem 0.4rem',
                      fontSize: '0.7rem',
                      background: selectedHour === slot.h && selectedMinute === slot.m && selectedAmPm === slot.p ? 'var(--accent-green-light)' : 'var(--bg-secondary)',
                      color: selectedHour === slot.h && selectedMinute === slot.m && selectedAmPm === slot.p ? 'var(--accent-primary)' : 'var(--text-dim)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer'
                    }}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>

              {/* Done button */}
              {!inline && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: '0.75rem',
                    padding: '0.45rem 1rem',
                    fontSize: '0.82rem'
                  }}
                >
                  <Check size={14} /> Done
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarDatePicker;
