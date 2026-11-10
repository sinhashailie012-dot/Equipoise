import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Input({
  type = 'text',
  icon,
  className,
  error,
  disabled,
  ...props
}) {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <span className="absolute left-3 text-ink-muted pointer-events-none flex items-center justify-center">
          {icon}
        </span>
      )}
      <input
        type={type}
        disabled={disabled}
        className={cn(
          "w-full bg-[#FBF8F2] text-ink-primary placeholder:text-ink-muted border border-[#DFD8CB] rounded px-3 py-2 text-sm transition-colors",
          "hover:border-[#C5BCAB] focus:bg-white focus:outline-none focus:border-brand-800 focus:ring-1 focus:ring-brand-800",
          "focus-visible:focus-ochre",
          "disabled:bg-[#F4EFE6] disabled:text-ink-muted disabled:border-[#E3DCCE] disabled:cursor-not-allowed",
          icon ? "pl-9" : "",
          error ? "border-red-500 focus:border-red-500" : "",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function SearchInput({ placeholder = "Search...", className, ...props }) {
  return (
    <Input
      type="search"
      icon={<Search className="w-4 h-4 text-ink-muted" />}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
}

