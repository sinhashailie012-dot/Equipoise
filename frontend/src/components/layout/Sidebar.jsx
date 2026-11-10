import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export function Sidebar({ isOpen, onClose }) {
  const { alerts } = useApp();
  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;

  const navItems = [
    { label: 'Overview', to: '/', icon: LayoutDashboard },
    { label: 'Team workload', to: '/workload', icon: Users },
    { label: 'Task rebalancer', to: '/rebalancer', icon: ArrowLeftRight },
    { label: 'Capacity planner', to: '/capacity', icon: CalendarDays },
    { label: 'Burnout risk', to: '/burnout', icon: HeartHandshake },
    {
      label: 'Alerts',
      to: '/alerts',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
    },
    { label: 'Reports & analytics', to: '/reports', icon: BarChart2 },
    { label: 'Projects', to: '/projects', icon: FolderKanban },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-brand-800 text-[#C2CEC9] select-none">
      {/* Top Brand Logo */}
      <div className="p-6 pb-5 flex items-center justify-between border-b border-brand-700/60">
        <NavLink to="/" className="flex items-center gap-2.5 text-white font-serif text-xl tracking-tight">
          <Scale className="w-5 h-5 text-white stroke-[1.8]" />
          <span>Equipoise</span>
        </NavLink>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-[#C2CEC9] hover:text-white p-1 rounded hover:bg-brand-700"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Workspace Selector */}
      <div className="px-5 py-3 border-b border-brand-700/50">
        <button className="w-full flex items-center justify-between text-left text-xs text-[#9BB1A7] hover:text-white transition-colors group">
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
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all group outline-none",
                  "focus-visible:focus-ochre",
                  isActive
                    ? "bg-[#2D5345] text-white shadow-subtle border-r-2 border-ochre-500"
                    : "text-[#B8C8C2] hover:bg-brand-700/60 hover:text-white"
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0 stroke-[1.8]" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-white text-brand-900 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sustainable Work Callout */}
      <div className="px-5 py-4 border-t border-brand-700/50">
        <div className="flex items-start gap-2.5 text-xs text-[#A9BCB4] leading-relaxed">
          <Sprout className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>Sustainable work starts with a little perspective.</span>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-brand-700/60 bg-brand-900/40">
        <div className="flex items-center justify-between">
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
        </div>
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
            className="fixed inset-0 bg-[#132620]/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

