import React from 'react';
import { getInitials } from '../../utils/workload';

export function Avatar({
  name = '',
  initials,
  src,
  size = 'md',
  bgColor,
  textColor,
  className = '',
}) {
  const displayInitials = initials || getInitials(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm font-medium',
    xl: 'w-12 h-12 text-base font-medium',
  };

  const defaultBg = bgColor || '#EAE4D8';
  const defaultText = textColor || '#1E2A26';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border border-[#DDD4C4] ${className}`}
      />
    );
  }

  return (
    <div
      style={{ backgroundColor: defaultBg, color: defaultText }}
      className={`inline-flex items-center justify-center rounded-full font-medium select-none border border-[#DDD4C4] ${sizeClasses[size]} ${className}`}
      title={name}
    >
      {displayInitials}
    </div>
  );
}

export default Avatar;
