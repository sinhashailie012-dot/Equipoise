import React from 'react';

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pill', // 'pill' | 'underline'
  className = '',
}) {
  if (variant === 'underline') {
    return (
      <div className={`flex border-b border-[#DDD4C4] space-x-6 overflow-x-auto no-scrollbar ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#B8862F] ${
                isActive
                  ? 'border-[#234236] text-[#234236] font-semibold'
                  : 'border-transparent text-[#6B6A60] hover:text-[#1E2A26] hover:border-[#DDD4C4]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-1.5 text-xs text-[#6B6A60]">· {tab.count}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Pill variant (default)
  return (
    <div className={`inline-flex items-center gap-1.5 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-[4px] border transition-colors select-none focus:outline-none focus:ring-2 focus:ring-[#B8862F] whitespace-nowrap ${
              isActive
                ? 'bg-[#234236] text-white border-[#234236] shadow-subtle'
                : 'bg-[#FBF8F2] text-[#1E2A26] border-[#DDD4C4] hover:bg-[#F2ECE0]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`ml-1.5 ${isActive ? 'text-white/80' : 'text-[#6B6A60]'}`}>
                · {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;

