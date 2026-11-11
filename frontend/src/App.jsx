import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
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
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Shell */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/team" element={<TeamWorkloadPage />} />
            <Route path="/team/:id" element={<EmployeeDetailPage />} />
            <Route path="/rebalancer" element={<TaskRebalancerPage />} />
            <Route path="/planner" element={<CapacityPlannerPage />} />
            <Route path="/burnout" element={<BurnoutRiskPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* 404 Not Found Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
