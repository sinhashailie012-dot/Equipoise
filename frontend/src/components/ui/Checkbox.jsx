import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  className,
  id,
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer select-none text-sm text-ink-primary",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={cn(
            "w-4 h-4 rounded border transition-all flex items-center justify-center",
            checked
              ? "bg-brand-800 border-brand-800 text-white"
              : "bg-[#FBF8F2] border-[#C2BAB0] peer-hover:border-[#8E867B]",
            "peer-focus-visible:focus-ochre",
            disabled && "bg-[#F4EFE6] border-[#D5CEC2]"
          )}
        >
          {checked && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>
      {label && <span>{label}</span>}
    </label>
  );
}

