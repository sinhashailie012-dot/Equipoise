import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HelpCircle, Bell, Menu } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export function TopBar({ onOpenSidebar, unreadAlertsCount = 6 }) {
  const location = useLocation();

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path.includes('/team/')) return 'Team workload';
    if (path === '/team') return 'Team workload';
    if (path === '/rebalancer') return 'Task rebalancer';
    if (path === '/planner') return 'Capacity planner';
    if (path === '/burnout') return 'Burnout risk';
    if (path === '/alerts') return 'Alerts';
    if (path === '/reports') return 'Reports & analytics';
    if (path === '/projects') return 'Projects';
    if (path === '/settings') return 'Settings';
    return 'Overview';
  };

  return (
    <header className="h-14 border-b border-[#DDD4C4] bg-[#FBF8F2] px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-1.5 rounded-[4px] border border-[#DDD4C4] text-[#1E2A26] hover:bg-[#F2ECE0] focus:outline-none focus:ring-2 focus:ring-[#B8862F]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs md:text-sm text-[#6B6A60]">
          <span className="font-normal">Forma Studio</span>
          <span>/</span>
          <span className="font-medium text-[#1E2A26]">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-5 text-xs text-[#6B6A60]">
        <div className="hidden sm:inline-flex items-center gap-1.5">
          <span>Synced today at 09:41</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Help Button */}
          <button
            type="button"
            title="Help & documentation"
            className="p-1 text-[#6B6A60] hover:text-[#1E2A26] rounded-[4px] hover:bg-[#EAE4D8] focus:outline-none focus:ring-2 focus:ring-[#B8862F] transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Alerts Bell */}
          <NavLink
            to="/alerts"
            title="Alerts"
            className="relative p-1 text-[#6B6A60] hover:text-[#1E2A26] rounded-[4px] hover:bg-[#EAE4D8] focus:outline-none focus:ring-2 focus:ring-[#B8862F] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#C4613F]" />
            )}
          </NavLink>

          {/* User Avatar */}
          <NavLink
            to="/settings"
            title="Emma Chen settings"
            className="focus:outline-none focus:ring-2 focus:ring-[#B8862F] rounded-full"
          >
            <Avatar
              initials="EC"
              name="Emma Chen"
              size="sm"
              bgColor="#EAE4D8"
              textColor="#1E2A26"
            />
          </NavLink>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
