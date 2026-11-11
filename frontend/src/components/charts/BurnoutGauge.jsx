import React from 'react';

export function BurnoutGauge({
  score = 58,
  maxScore = 100,
  label = 'Elevated',
  trend = '+6 points from last week',
  className = '',
}) {
  const totalTicks = 42;
  const activeTicks = Math.round((score / maxScore) * totalTicks);

  const radius = 80;
  const cx = 100;
  const cy = 95;

  let activeColor = '#D4A537'; // Ochre
  if (score >= 80) activeColor = '#7A2E3A'; // Critical
  else if (score < 40) activeColor = '#7E9C7A'; // Balanced

  const ticks = Array.from({ length: totalTicks }).map((_, i) => {
    const angleDeg = 180 - (i / (totalTicks - 1)) * 180;
    const angleRad = (angleDeg * Math.PI) / 180;

    const rInner = radius - 14;
    const rOuter = radius;

    const x1 = cx + rInner * Math.cos(angleRad);
    const y1 = cy - rInner * Math.sin(angleRad);
    const x2 = cx + rOuter * Math.cos(angleRad);
    const y2 = cy - rOuter * Math.sin(angleRad);

    const isActive = i < activeTicks;

    return { x1, y1, x2, y2, isActive };
  });

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative w-48 h-28 flex items-end justify-center">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          {ticks.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isActive ? activeColor : '#E7E1D4'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
          <span className="text-4xl font-heading text-[#1E2A26] font-normal tracking-tight">
            {score}
          </span>
        </div>
      </div>

      <div className="text-center mt-3">
        <div className="text-xs font-semibold text-[#1E2A26]">
          {label} · {score} / {maxScore}
        </div>
        {trend && (
          <div className="text-[11px] text-[#6B6A60] mt-0.5">
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

export default BurnoutGauge;
