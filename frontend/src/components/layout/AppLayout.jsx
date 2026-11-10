import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ReassignTaskModal } from '../modals/ReassignTaskModal';
import { ScheduleMeetingModal } from '../modals/ScheduleMeetingModal';

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas flex flex-col lg:flex-row antialiased text-ink-primary">
      {/* Sidebar */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="border-t border-border-subtle/80 px-4 sm:px-8 py-5 text-xs text-ink-muted flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
          <div>Equipoise · A healthier way to work</div>
          <div>Private to managers · All times GMT</div>
        </footer>
      </div>

      {/* Modals */}
      <ReassignTaskModal />
      <ScheduleMeetingModal />
    </div>
  );
}

