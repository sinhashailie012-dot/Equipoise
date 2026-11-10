import React from 'react';
import { cn } from '../../lib/utils';

export function Avatar({
  initials,
  name,
  size = 'md',
  bgColor,
  textColor,
  className,
}) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm font-medium',
    xl: 'w-12 h-12 text-base font-medium',
  };

  const defaultBg = bgColor || '#E6EBDF';
  const defaultText = textColor || '#2E5E3B';

  const derivedInitials = initials || (name ? name.split(' ').map(n => n[0]).join('').slice(0, 2) : '??');

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium select-none shrink-0 tracking-wider",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: defaultBg,
        color: defaultText,
      }}
      title={name}
    >
      {derivedInitials}
    </div>
  );
}

