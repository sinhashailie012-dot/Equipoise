import React from 'react';
import { cn } from '../../lib/utils';

export function BurnoutGauge({
  score = 58,
  maxScore = 100,
  label = 'Elevated',
  trend = '+6 points from last week',
  className,
}) {
  // Semi-circle radial arc with tick marks
  const totalTicks = 42;
  const activeTicks = Math.round((score / maxScore) * totalTicks);

  const radius = 80;
  const cx = 100;
  const cy = 95;

  // Generate radial ticks between 180 deg and 0 deg (top half circle)
  const ticks = Array.from({ length: totalTicks }).map((_, i) => {
    // Angle from 180 to 0 (PI to 0)
    const angleDeg = 180 - (i / (totalTicks - 1)) * 180;
    const angleRad = (angleDeg * Math.PI) / 180;

    const rInner = radius - 14;
    const rOuter = radius;

    const x1 = cx + rInner * Math.cos(angleRad);
    const y1 = cy - rInner * Math.sin(angleRad);
    const x2 = cx + rOuter * Math.cos(angleRad);
    const y2 = cy - rOuter * Math.sin(angleRad);

    const isActive = i < activeTicks;

    return {
      x1,
      y1,
      x2,
      y2,
      isActive,
    };
  });

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative w-48 h-28 flex items-end justify-center">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          {ticks.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isActive ? '#D4A537' : '#E8E2D5'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
          <span className="text-4xl font-serif text-ink-primary font-normal tracking-tight">
            {score}
          </span>
        </div>
      </div>

      <div className="text-center mt-3">
        <div className="text-xs font-medium text-ink-primary">
          {label} · {score} / {maxScore}
        </div>
        {trend && (
          <div className="text-[11px] text-ink-muted mt-0.5">
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

