import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ModalProvider } from './context/ModalContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { TeamWorkloadPage } from './pages/TeamWorkloadPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { TaskRebalancerPage } from './pages/TaskRebalancerPage';
import { CapacityPlannerPage } from './pages/CapacityPlannerPage';
import { BurnoutRiskPage } from './pages/BurnoutRiskPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DesignSystemPage } from './pages/DesignSystemPage';

export function App() {
  return (
    <AppProvider>
      <ModalProvider>
        <BrowserRouter>
          <Routes>
            {/* Standalone Login route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Application shell layout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/workload" element={<TeamWorkloadPage />} />
              <Route path="/workload/:id" element={<EmployeeDetailPage />} />
              <Route path="/rebalancer" element={<TaskRebalancerPage />} />
              <Route path="/capacity" element={<CapacityPlannerPage />} />
              <Route path="/burnout" element={<BurnoutRiskPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/design-system" element={<DesignSystemPage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ModalProvider>
    </AppProvider>
  );
}

export default App;

