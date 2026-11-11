import React from 'react';
import { Search } from 'lucide-react';

export function Input({
  type = 'text',
  icon: Icon,
  className = '',
  error,
  disabled,
  ...props
}) {
  return (
    <div className="relative flex items-center w-full">
      {Icon && (
        <span className="absolute left-3 text-[#6B6A60] pointer-events-none flex items-center justify-center">
          <Icon className="w-4 h-4 shrink-0" />
        </span>
      )}
      <input
        type={type}
        disabled={disabled}
        className={`w-full bg-[#FBF8F2] text-[#1E2A26] placeholder:text-[#6B6A60] border border-[#DDD4C4] rounded-[4px] px-3.5 py-2 text-sm transition-colors hover:border-[#8D8C82] focus:outline-none focus:ring-2 focus:ring-[#B8862F] focus:border-transparent disabled:bg-[#F4EFE6] disabled:text-[#8D8C82] disabled:border-[#DDD4C4] disabled:cursor-not-allowed ${
          Icon ? 'pl-9' : ''
        } ${error ? 'border-[#7A2E3A] focus:ring-[#7A2E3A]' : ''} ${className}`}
        {...props}
      />
    </div>
  );
}

export function SearchInput({ placeholder = 'Search...', className = '', ...props }) {
  return (
    <Input
      type="search"
      icon={Search}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
}

export default Input;
