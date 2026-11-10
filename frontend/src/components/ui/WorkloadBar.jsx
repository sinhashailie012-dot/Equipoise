import React from 'react';
import { cn } from '../../lib/utils';

export function WorkloadBar({
  allocated = 0,
  capacity = 40,
  status = 'balanced',
  className,
  showLabel = false,
}) {
  const percentage = Math.round((allocated / capacity) * 100);

  const barColors = {
    spare: 'bg-[#4F7A7F]',
    balanced: 'bg-[#659670]',
    stretched: 'bg-[#D4A537]',
    overloaded: 'bg-[#C3542F]',
    critical: 'bg-[#B93856]',
  };

  const currentColor = barColors[status.toLowerCase()] || barColors.balanced;

  // Visual width capped at 100% of container representing max scale e.g. 140%
  // Scale so that 100% capacity sits at roughly 75% of the bar width, matching the design where 100% has space to the right for overtime!
  const fillWidth = Math.min(100, Math.round((allocated / (capacity * 1.35)) * 100));
  const capacityTickPosition = Math.round((1 / 1.35) * 100); // ~74%

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="relative w-full h-1.5 bg-[#EAE4D8] rounded-full overflow-visible">
        {/* Fill bar */}
        <div
          className={cn("h-full rounded-full transition-all duration-300", currentColor)}
          style={{ width: `${fillWidth}%` }}
        />
        {/* 100% Capacity marker line */}
        <div
          className="absolute top-[-2px] bottom-[-2px] w-[2px] bg-[#9C9588] rounded-full"
          style={{ left: `${capacityTickPosition}%` }}
          title="Contracted capacity (40 hrs)"
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-ink-muted">
          <span>{allocated} / {capacity} hrs</span>
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  );
}

