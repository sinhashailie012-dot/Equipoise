import React from 'react';
import { Check } from 'lucide-react';

export function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  id,
  className = '',
}) {
  const checkboxId = id || 'checkbox-' + Math.random().toString(36).substr(2, 6);

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-center gap-2 select-none text-sm text-[#1E2A26] ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 rounded-[2px] border transition-colors flex items-center justify-center ${
            checked
              ? 'bg-[#234236] border-[#234236] text-white'
              : 'bg-[#FBF8F2] border-[#DDD4C4] hover:border-[#8D8C82]'
          } ${disabled ? 'bg-[#F4EFE6] border-[#DDD4C4]' : ''}`}
        >
          {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
        </div>
      </div>
      {label && <span>{label}</span>}
    </label>
  );
}

export default Checkbox;
