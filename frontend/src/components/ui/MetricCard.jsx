import React from 'react';
import { cn } from '../../lib/utils';

export function MetricCard({
  title,
  value,
  subtext,
  dotColor,
  className,
}) {
  return (
    <div className={cn("p-4 bg-card rounded-lg border border-border-subtle", className)}>
      <div className="text-xs text-ink-secondary mb-1 font-medium">{title}</div>
      <div className="text-3xl font-serif font-normal text-ink-primary tracking-tight mb-2">
        {value}
      </div>
      {subtext && (
        <div className="flex items-center gap-1.5 text-xs text-ink-muted">
          {dotColor && (
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: dotColor }}
            />
          )}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}

