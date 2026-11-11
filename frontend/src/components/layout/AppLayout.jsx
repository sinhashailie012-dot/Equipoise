import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F4EFE6] text-[#1E2A26]">
      {/* Sidebar (Desktop and Mobile Drawer) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={6}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onOpenSidebar={() => setSidebarOpen(true)}
          unreadAlertsCount={6}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Global Footer per Design */}
        <footer className="border-t border-[#DDD4C4] px-4 md:px-8 py-4 text-xs text-[#6B6A60] flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
          <div>Equipoise · A healthier way to work</div>
          <div>Private to managers · All times GMT</div>
        </footer>
      </div>
    </div>
  );
}

export default AppLayout;
