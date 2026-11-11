import React from 'react';

export function KpiCard({
  title,
  value,
  note,
  dotColor,
  trend,
  className = '',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card transition-all ${
        onClick ? 'cursor-pointer hover:bg-[#F2ECE0]' : ''
      } ${className}`}
    >
      <div className="text-xs uppercase tracking-wider text-[#6B6A60] font-medium mb-2">
        {title}
      </div>
      <div className="font-heading text-3xl font-normal text-[#1E2A26] tracking-tight leading-none mb-3">
        {value}
      </div>
      {note && (
        <div className="flex items-center text-xs text-[#6B6A60]">
          {dotColor ? (
            <span
              className="w-1.5 h-1.5 rounded-full mr-2 shrink-0"
              style={{ backgroundColor: dotColor }}
            />
          ) : (
            <span className="text-[#6B6A60] mr-1.5">•</span>
          )}
          <span>{note}</span>
          {trend && <span className="ml-2 font-medium text-[#1E2A26]">{trend}</span>}
        </div>
      )}
    </div>
  );
}

export default KpiCard;

