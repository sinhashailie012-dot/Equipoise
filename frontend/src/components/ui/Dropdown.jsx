import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function Dropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  label,
  icon: Icon,
  className = '',
  dropdownClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value || opt.id === value);
  const displayText = selectedOption ? (selectedOption.label || selectedOption.name) : placeholder;

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-medium text-[#6B6A60] mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full inline-flex items-center justify-between px-3.5 py-1.5 h-9 text-sm rounded-[4px] border border-[#DDD4C4] bg-[#FBF8F2] text-[#1E2A26] hover:bg-[#F2ECE0] focus:outline-none focus:ring-2 focus:ring-[#B8862F] transition-colors"
      >
        <span className="flex items-center gap-2 truncate">
          {Icon && <Icon className="w-4 h-4 text-[#6B6A60] shrink-0" />}
          <span className="truncate">{displayText}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-[#6B6A60] shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 mt-1 z-30 min-w-[180px] bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-modal py-1 max-h-60 overflow-y-auto ${dropdownClassName}`}
        >
          {options.map((option) => {
            const optVal = option.value !== undefined ? option.value : option.id;
            const isSelected = optVal === value;
            return (
              <button
                key={optVal}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(optVal);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#234236] text-white font-medium'
                    : 'text-[#1E2A26] hover:bg-[#F2ECE0]'
                }`}
              >
                <span className="truncate">{option.label || option.name}</span>
                {isSelected && <Check className="w-4 h-4 shrink-0 text-white ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dropdown;

