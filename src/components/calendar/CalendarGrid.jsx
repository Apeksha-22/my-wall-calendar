// src/components/calendar/CalendarGrid.jsx
import React from 'react';
import { DAYS, getDaysInMonth, getFirstDayOfMonth, isSameDay } from '../../utils/dateUtils';

const CalendarGrid = ({ month, year, startDate, endDate, onDateClick }) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Khali slots (shuruat ke dino ke liye jo pichle mahine mein girte hain)
  const blanks = Array(firstDay).fill(null);
  
  // Mahine ki dates (1 se 31 tak)
  const monthDates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allCells = [...blanks, ...monthDates];

  const isInRange = (day) => {
    if (!startDate || !endDate || !day) return false;
    const current = new Date(year, month, day);
    return current > startDate && current < endDate;
  };

  return (
    <div className="p-4 md:p-8 bg-white">
      {/* Days of the week header */}
      <div className="grid grid-cols-7 mb-4">
        {DAYS.map(day => (
          <div key={day} className="text-center text-xs font-bold tracking-widest text-gray-400 pb-2">
            {day}
          </div>
        ))}
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-7 gap-y-2">
        {allCells.map((day, index) => {
          const dateObj = day ? new Date(year, month, day) : null;
          const isSelected = isSameDay(dateObj, startDate) || isSameDay(dateObj, endDate);
          const rangeMatch = isInRange(day);

          return (
            <div key={index} className="relative flex items-center justify-center py-2">
              {/* Highlight Background for Range */}
              {rangeMatch && (
                <div className="absolute inset-0 bg-[var(--accent-bg)] scale-y-75" />
              )}
              
              {day && (
                <button
                  onClick={() => onDateClick(dateObj)}
                  className={`
                    relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200
                    ${isSelected ? 'bg-[var(--accent)] text-white shadow-lg scale-110' : 'hover:bg-gray-100 text-[var(--text-h)]'}
                    ${rangeMatch ? 'text-[var(--accent)] font-bold' : ''}
                  `}
                >
                  {day}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;