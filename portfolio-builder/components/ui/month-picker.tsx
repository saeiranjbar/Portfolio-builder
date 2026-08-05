'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthPickerProps {
  value: string; // Format: YYYY-MM
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MonthPicker({ value, onChange, placeholder = 'Select date' }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [dropLeft, setDropLeft] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const initialDate = value ? new Date(value + '-01') : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Sync view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + '-01');
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  const handleOpen = () => {
    // Check if we're in the right half of the viewport
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      // If the right edge of this element is past 60% of viewport width, drop left
      setDropLeft(rect.right > viewportWidth * 0.6);
    }
    setOpen(!open);
  };

  const handleSelect = (month: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    onChange(`${viewYear}-${monthStr}`);
    setOpen(false);
  };

  const prevYear = () => setViewYear(viewYear - 1);
  const nextYear = () => setViewYear(viewYear + 1);

  const selectedMonth = value ? parseInt(value.split('-')[1]) - 1 : -1;
  const selectedYear = value ? parseInt(value.split('-')[0]) : -1;

  const displayValue = value
    ? `${months[parseInt(value.split('-')[1]) - 1].slice(0, 3)} ${value.split('-')[0]}`
    : '';

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={handleOpen}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer hover:bg-accent/50 items-center overflow-hidden"
      >
        <Calendar className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
        <span className={`truncate ${displayValue ? '' : 'text-muted-foreground'}`}>
          {displayValue || placeholder}
        </span>
      </div>

      {open && (
        <div
          className={`absolute z-50 mt-1 bg-white rounded-md border border-gray-200 shadow-lg p-3 min-w-[260px] ${dropLeft ? 'right-0' : 'left-0'}`}
        >
          {/* Header with year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevYear}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-sm">{viewYear}</span>
            <button
              onClick={nextYear}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1">
            {months.map((month, idx) => {
              const isSelected = idx === selectedMonth && viewYear === selectedYear;
              return (
                <button
                  key={month}
                  onClick={() => handleSelect(idx)}
                  type="button"
                  className={`px-2 py-2 text-xs rounded transition-colors ${
                    isSelected
                      ? 'bg-black text-white font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {month.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
