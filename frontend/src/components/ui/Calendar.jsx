import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MiniCalendar({ selectedDate, onSelectDate, minDate }) {
  const [viewYear, setViewYear] = useState(() => (selectedDate || new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (selectedDate || new Date()).getMonth());

  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, inMonth: false, date: null });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, inMonth: true, date: new Date(viewYear, viewMonth, d) });
    }
    // Pad remaining cells
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, inMonth: false, date: null });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const isDisabled = (cell) => {
    if (!cell.inMonth || !cell.date) return true;
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      return cell.date < min;
    }
    return false;
  };

  const isSelected = (cell) => {
    if (!cell.date || !selectedDate) return false;
    return (
      cell.date.getFullYear() === selectedDate.getFullYear() &&
      cell.date.getMonth() === selectedDate.getMonth() &&
      cell.date.getDate() === selectedDate.getDate()
    );
  };

  const isToday = (cell) => {
    if (!cell.date) return false;
    const today = new Date();
    return (
      cell.date.getFullYear() === today.getFullYear() &&
      cell.date.getMonth() === today.getMonth() &&
      cell.date.getDate() === today.getDate()
    );
  };

  return (
    <div className="select-none max-w-[280px] w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={goToPrevMonth}
          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-bold text-white tracking-wide">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={goToNextMonth}
          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((cell, i) => {
          const disabled = isDisabled(cell);
          const selected = isSelected(cell);
          const today = isToday(cell);

          return (
            <button
              type="button"
              key={i}
              disabled={disabled}
              onClick={() => {
                if (!disabled && cell.date && onSelectDate) onSelectDate(cell.date);
              }}
              className={`
                aspect-square flex items-center justify-center rounded-none text-xs font-medium transition-all duration-150
                ${!cell.inMonth ? 'text-gray-700 cursor-default' : ''}
                ${cell.inMonth && disabled ? 'text-gray-600 cursor-not-allowed' : ''}
                ${cell.inMonth && !disabled && !selected ?
                  'text-gray-400 hover:bg-[#00adef]/15 hover:text-white cursor-pointer' : ''}
                ${selected ?
                  'bg-[#00adef] text-white font-bold scale-105' : ''}
                ${today && !selected ? 'ring-1 ring-[#00adef]/60 text-[#00adef]' : ''}
              `}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TimeSlotPicker({ selectedTime, onSelectTime }) {
  const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  const formatTime = (t) => {
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${display}:${m} ${ampm}`;
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
      {TIME_SLOTS.map(slot => {
        const isSelected = selectedTime === slot;
        return (
          <button
            type="button"
            key={slot}
            onClick={() => onSelectTime && onSelectTime(slot)}
            className={`
              px-2 py-2.5 rounded-none text-xs font-semibold transition-all duration-150
              ${isSelected
                ? 'bg-[#00adef] text-white scale-105 border border-[#00adef]'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-[#00adef]/15 hover:text-[#00adef] hover:border-[#00adef]/30'}
            `}
          >
            {formatTime(slot)}
          </button>
        );
      })}
    </div>
  );
}
