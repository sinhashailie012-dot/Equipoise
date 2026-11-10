import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Select({
  value,
  onChange,
  options = [],
  className,
  disabled = false,
  ...props
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={cn(
          "appearance-none bg-[#FBF8F2] text-ink-primary border border-[#DFD8CB] rounded px-3 py-1.5 pr-8 text-sm cursor-pointer transition-colors",
          "hover:border-[#C5BCAB] focus:bg-white focus:outline-none focus:border-brand-800 focus-visible:focus-ochre",
          "disabled:bg-[#F4EFE6] disabled:text-ink-muted disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2.5 pointer-events-none" />
    </div>
  );
}

