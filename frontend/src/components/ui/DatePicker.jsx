import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export function DatePicker({
  value = '2–8 Nov 2026',
  onChange,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const presets = [
    '2–8 Nov 2026',
    '9–15 Nov 2026',
    '16–22 Nov 2026',
    '23–29 Nov 2026',
    'Last 8 weeks',
    'Next 6 weeks',
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 h-9 text-xs md:text-sm rounded-[4px] border border-[#DDD4C4] bg-[#FBF8F2] text-[#1E2A26] hover:bg-[#F2ECE0] focus:outline-none focus:ring-2 focus:ring-[#B8862F] transition-colors"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-[#6B6A60] shrink-0" />
        <span className="font-medium">{value}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 z-30 w-56 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-modal p-2">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#6B6A60] px-2 py-1 mb-1">
            Select Horizon
          </div>
          <div className="space-y-1">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  if (onChange) onChange(preset);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-[2px] transition-colors ${
                  value === preset
                    ? 'bg-[#234236] text-white font-medium'
                    : 'text-[#1E2A26] hover:bg-[#F2ECE0]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;

