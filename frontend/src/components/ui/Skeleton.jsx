import React from 'react';

export function Skeleton({ className = '', variant = 'text', width, height }) {
  const variantStyles = {
    text: 'h-4 rounded-[2px]',
    circle: 'rounded-full',
    rect: 'rounded-[4px]',
    card: 'h-28 rounded-[4px]',
  };

  return (
    <div
      className={`animate-pulse bg-[#E7E1D4]/70 ${variantStyles[variant] || 'rounded-[4px]'} ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 space-y-3">
      <Skeleton className="w-1/3 h-3" />
      <Skeleton className="w-1/2 h-8" />
      <Skeleton className="w-2/3 h-3" />
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-4 space-y-4">
      <div className="flex gap-4 border-b border-[#DDD4C4] pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2 border-b border-[#DDD4C4]/50">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="flex-1 h-5" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;

