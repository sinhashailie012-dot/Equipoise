import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Scale,
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  CalendarDays,
  HeartHandshake,
  Bell,
  BarChart2,
  FolderKanban,
  Settings,
  ChevronDown,
  ChevronsUpDown,
  Sprout,
  X,
  LogOut,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { authService } from '../../services/authService';

export function Sidebar({ isOpen, onClose, unreadCount = 6 }) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { label: 'Overview', to: '/overview', icon: LayoutDashboard },
    { label: 'Team workload', to: '/team', icon: Users },
    { label: 'Task rebalancer', to: '/rebalancer', icon: ArrowLeftRight },
    { label: 'Capacity planner', to: '/planner', icon: CalendarDays },
    { label: 'Burnout risk', to: '/burnout', icon: HeartHandshake },
    {
      label: 'Alerts',
      to: '/alerts',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { label: 'Reports & analytics', to: '/reports', icon: BarChart2 },
    { label: 'Projects', to: '/projects', icon: FolderKanban },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#234236] text-[#C2CEC9] select-none">
      {/* Top Brand Logo */}
      <div className="p-6 pb-5 flex items-center justify-between border-b border-[#2E5445]">
        <NavLink to="/overview" className="flex items-center gap-2.5 text-white font-heading text-xl tracking-tight">
          <Scale className="w-5 h-5 text-white stroke-[1.8]" />
          <span>Equipoise</span>
        </NavLink>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-[#C2CEC9] hover:text-white p-1 rounded-[4px] hover:bg-[#2E5445]"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Workspace Selector */}
      <div className="px-5 py-3 border-b border-[#2E5445]">
        <button
          type="button"
          className="w-full flex items-center justify-between text-left text-xs text-[#9BB1A7] hover:text-white transition-colors group focus:outline-none focus:ring-2 focus:ring-[#B8862F] rounded-[4px] p-1 -m-1"
        >
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-[#839C91]">WORKSPACE</div>
            <div className="text-sm font-medium text-white mt-0.5">Forma Studio</div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#839C91] group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-[4px] text-xs md:text-sm font-medium transition-all group outline-none focus:ring-2 focus:ring-[#B8862F] relative ${
                  isActive
                    ? 'bg-[#2E5445] text-white shadow-subtle'
                    : 'text-[#B8C8C2] hover:bg-[#2E5445]/60 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0 stroke-[1.8]" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-white text-[#234236] rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {/* Active indicator amber vertical stripe */}
                    {isActive && (
                      <span className="w-1.5 h-4 bg-[#D4A537] rounded-full shrink-0" aria-hidden="true" />
                    )}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sustainable Work Callout */}
      <div className="px-5 py-4 border-t border-[#2E5445]">
        <div className="flex items-start gap-2.5 text-xs text-[#A9BCB4] leading-relaxed">
          <Sprout className="w-4 h-4 text-[#7E9C7A] shrink-0 mt-0.5" />
          <span>Sustainable work starts with a little perspective.</span>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#2E5445] bg-[#1B352B]/60 relative">
        <button
          type="button"
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-[#B8862F] rounded-[4px] p-1 -m-1"
        >
          <div className="flex items-center gap-2.5">
            <Avatar
              initials="EC"
              name="Emma Chen"
              size="md"
              bgColor="#FBF8F2"
              textColor="#234236"
            />
            <div>
              <div className="text-xs font-medium text-white">Emma Chen</div>
              <div className="text-[11px] text-[#8EA69C]">Design manager</div>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-[#8EA69C]" />
        </button>

        {showUserMenu && (
          <div className="absolute bottom-16 left-3 right-3 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-modal p-1 z-50 text-[#1E2A26]">
            <div className="px-3 py-2 border-b border-[#DDD4C4] text-xs">
              <div className="font-medium text-[#1E2A26]">Emma Chen</div>
              <div className="text-[#6B6A60] text-[11px]">emma.chen@forma.studio</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#7A2E3A] hover:bg-[#F5EAEB] rounded-[2px] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#1E2A26]/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-modal z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
