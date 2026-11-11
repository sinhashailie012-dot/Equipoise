import React from 'react';

export function DemandCapacityChart({
  data = [
    { label: '14 Sep', value: 260 },
    { label: '21 Sep', value: 268 },
    { label: '28 Sep', value: 278 },
    { label: '5 Oct', value: 292 },
    { label: '12 Oct', value: 294 },
    { label: '19 Oct', value: 298 },
    { label: '26 Oct', value: 314 },
    { label: '2 Nov', value: 306 },
  ],
  capacity = 320,
  className = '',
}) {
  return (
    <div className={`w-full flex flex-col justify-end ${className}`}>
      <div className="flex items-end justify-between gap-2 h-44 pt-4 pb-2 border-b border-[#DDD4C4]">
        {data.map((item, idx) => {
          const heightPct = Math.round((item.value / 350) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-[11px] font-sans text-[#1E2A26] font-medium mb-1">
                {item.value}
              </span>
              <div
                className="w-full max-w-[34px] rounded-t-[2px] transition-all duration-300 bg-[#234236]"
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center text-[11px] text-[#6B6A60] pt-2">
        {data.map((item, idx) => (
          <span key={idx} className="flex-1 text-center truncate">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function RiskTrendChart({
  data = [
    { label: '14 Sep', value: 36 },
    { label: '21 Sep', value: 38 },
    { label: '28 Sep', value: 40 },
    { label: '5 Oct', value: 43 },
    { label: '12 Oct', value: 46 },
    { label: '19 Oct', value: 50 },
    { label: '26 Oct', value: 52 },
    { label: '2 Nov', value: 58 },
  ],
  className = '',
}) {
  return (
    <div className={`w-full flex flex-col justify-end ${className}`}>
      <div className="flex items-end justify-between gap-2 h-44 pt-4 pb-2 border-b border-[#DDD4C4]">
        {data.map((item, idx) => {
          const heightPct = Math.round((item.value / 75) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-[11px] font-sans text-[#1E2A26] font-medium mb-1">
                {item.value}
              </span>
              <div
                className="w-full max-w-[34px] rounded-t-[2px] transition-all duration-300 bg-[#D4A537]"
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center text-[11px] text-[#6B6A60] pt-2">
        {data.map((item, idx) => (
          <span key={idx} className="flex-1 text-center truncate">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default DemandCapacityChart;
