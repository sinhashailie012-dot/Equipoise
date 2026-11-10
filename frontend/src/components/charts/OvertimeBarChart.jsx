import React from 'react';
import { cn } from '../../lib/utils';

export function OvertimeBarChart({
  data = [
    { label: 'Sep 14', value: 0 },
    { label: '21', value: 0 },
    { label: '28', value: 2 },
    { label: 'Oct 5', value: 4 },
    { label: '12', value: 10 },
    { label: '19', value: 16 },
    { label: '26', value: 24 },
    { label: 'Nov 2', value: 24 },
  ],
  maxVal = 30,
  barColor = '#C3542F',
  className,
}) {
  return (
    <div className={cn("w-full flex flex-col justify-end", className)}>
      <div className="flex items-end justify-between gap-2 h-36 pt-4 pb-2 border-b border-border-subtle">
        {data.map((item, idx) => {
          const heightPct = item.value === 0 ? 3 : Math.max(6, (item.value / maxVal) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
              <span className="text-[11px] font-sans text-ink-primary font-medium mb-1 transition-opacity">
                {item.value}
              </span>
              <div
                className="w-full max-w-[34px] rounded-t-sm transition-all duration-300"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: item.value === 0 ? '#C2BAB0' : barColor,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center text-[11px] text-ink-muted pt-2">
        {data.map((item, idx) => (
          <span key={idx} className="flex-1 text-center truncate">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

