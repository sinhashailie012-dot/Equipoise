import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HelpCircle, Bell, Menu } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useApp } from '../../context/AppContext';

export function TopBar({ onOpenMobileMenu }) {
  const location = useLocation();
  const { alerts } = useApp();
  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;

  const getPageTitle = (pathname) => {
    if (pathname === '/' || pathname === '/overview') return 'Overview';
    if (pathname.startsWith('/workload/')) return 'Team workload';
    if (pathname.startsWith('/workload')) return 'Team workload';
    if (pathname.startsWith('/rebalancer')) return 'Task rebalancer';
    if (pathname.startsWith('/capacity')) return 'Capacity planner';
    if (pathname.startsWith('/burnout')) return 'Burnout risk';
    if (pathname.startsWith('/alerts')) return 'Alerts';
    if (pathname.startsWith('/reports')) return 'Reports & analytics';
    if (pathname.startsWith('/projects')) return 'Projects';
    if (pathname.startsWith('/settings')) return 'Settings';
    if (pathname.startsWith('/design-system')) return 'Design System';
    return 'Workspace';
  };

  const currentTitle = getPageTitle(location.pathname);

  return (
    <header className="h-14 border-b border-border-subtle bg-canvas/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded text-ink-primary hover:bg-[#EAE4D8] transition-colors focus-visible:focus-ochre"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <span>Forma Studio</span>
          <span>/</span>
          <span className="text-ink-primary font-medium">{currentTitle}</span>
        </nav>
      </div>

      {/* Right: Sync Status, Help, Notifications, User */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden md:block text-xs text-ink-muted">
          Synced today at 09:41
        </div>

        <button
          className="text-ink-muted hover:text-ink-primary p-1 rounded hover:bg-[#EAE4D8]/60 transition-colors focus-visible:focus-ochre"
          title="Help & documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <NavLink
          to="/alerts"
          className="relative text-ink-muted hover:text-ink-primary p-1 rounded hover:bg-[#EAE4D8]/60 transition-colors focus-visible:focus-ochre"
          title="Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600" />
          )}
        </NavLink>

        <Avatar
          initials="EC"
          name="Emma Chen"
          size="sm"
          bgColor="#234236"
          textColor="#FFFFFF"
          className="ring-1 ring-border-subtle cursor-pointer"
        />
      </div>
    </header>
  );
}

