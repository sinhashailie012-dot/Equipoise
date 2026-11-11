import React from 'react';
import { getUtilization, getStatusFromThresholds } from '../../utils/workload';

export function CapacityBar({
  allocated = 0,
  capacity = 40,
  percentage,
  status,
  showMarker = true,
  height = 'h-1.5',
  className = '',
}) {
  const percent = percentage !== undefined ? percentage : getUtilization(allocated, capacity);
  const statusObj = status ? { key: status } : getStatusFromThresholds(percent);

  const barColors = {
    spare: 'bg-[#4F7A7F]',
    balanced: 'bg-[#7E9C7A]',
    stretched: 'bg-[#D4A537]',
    overloaded: 'bg-[#C4613F]',
    critical: 'bg-[#7A2E3A]',
  };

  const activeColor = barColors[statusObj.key] || barColors.balanced;

  // Max width representation (can exceed 100%, cap visual display at 135%)
  const visualWidth = Math.min(100, Math.max(0, (percent / 135) * 100));
  const markerPosition = (100 / 135) * 100; // 100% capacity position

  return (
    <div className={`relative w-full ${className}`}>
      {/* Background track */}
      <div className={`w-full ${height} bg-[#EAE4D8] rounded-[2px] overflow-hidden relative`}>
        {/* Fill bar */}
        <div
          className={`h-full transition-all duration-300 rounded-[2px] ${activeColor}`}
          style={{ width: `${visualWidth}%` }}
        />
      </div>

      {/* 100% capacity marker tick */}
      {showMarker && (
        <div
          className="absolute -top-0.5 bottom-0 w-[1.5px] bg-[#8D8C82] h-[calc(100%+4px)] -translate-x-1/2 pointer-events-none"
          style={{ left: `${markerPosition}%` }}
          title="100% capacity threshold"
        />
      )}
    </div>
  );
}

export default CapacityBar;

