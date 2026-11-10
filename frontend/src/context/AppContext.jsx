import React, { createContext, useContext, useState } from 'react';
import { initialEmployees } from '../data/employees';
import { initialTasks } from '../data/tasks';
import { initialProjects } from '../data/projects';
import { initialAlerts } from '../data/alerts';
import { initialInterventions } from '../data/interventions';
import { initialSettings } from '../data/settings';
import { getStatusBand } from '../lib/utils';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [tasks, setTasks] = useState(initialTasks);
  const [projects, setProjects] = useState(initialProjects);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [interventions, setInterventions] = useState(initialInterventions);
  const [settings, setSettings] = useState(initialSettings);
  const [reassignHistory, setReassignHistory] = useState([]);
  const [pendingChanges, setPendingChanges] = useState(false);

  // Dynamic reassign task handler
  const reassignTask = (taskId, targetEmployeeId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const sourceEmployeeId = task.assigneeId;
    if (sourceEmployeeId === targetEmployeeId) return;

    const taskHours = task.hours;

    // Save history for Undo
    setReassignHistory(prev => [...prev, { taskId, from: sourceEmployeeId, to: targetEmployeeId, hours: taskHours }]);
    setPendingChanges(true);

    // Update task
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, assigneeId: targetEmployeeId, isSuggested: false };
      }
      return t;
    }));

    // Update employees' hours and status
    setEmployees(prev => prev.map(emp => {
      if (emp.id === sourceEmployeeId) {
        const newHours = Math.max(0, emp.allocatedHours - taskHours);
        const newPct = Math.round((newHours / emp.contractedHours) * 100);
        return {
          ...emp,
          allocatedHours: newHours,
          status: getStatusBand(newPct),
          activeTasks: Math.max(0, emp.activeTasks - 1),
        };
      }
      if (emp.id === targetEmployeeId) {
        const newHours = emp.allocatedHours + taskHours;
        const newPct = Math.round((newHours / emp.contractedHours) * 100);
        return {
          ...emp,
          allocatedHours: newHours,
          status: getStatusBand(newPct),
          activeTasks: emp.activeTasks + 1,
        };
      }
      return emp;
    }));
  };

  const undoLastReassign = () => {
    if (reassignHistory.length === 0) return;
    const last = reassignHistory[reassignHistory.length - 1];
    setReassignHistory(prev => prev.slice(0, -1));

    // Reverse task
    setTasks(prev => prev.map(t => {
      if (t.id === last.taskId) {
        return { ...t, assigneeId: last.from };
      }
      return t;
    }));

    // Reverse employees
    setEmployees(prev => prev.map(emp => {
      if (emp.id === last.from) {
        const newHours = emp.allocatedHours + last.hours;
        const newPct = Math.round((newHours / emp.contractedHours) * 100);
        return {
          ...emp,
          allocatedHours: newHours,
          status: getStatusBand(newPct),
          activeTasks: emp.activeTasks + 1,
        };
      }
      if (emp.id === last.to) {
        const newHours = Math.max(0, emp.allocatedHours - last.hours);
        const newPct = Math.round((newHours / emp.contractedHours) * 100);
        return {
          ...emp,
          allocatedHours: newHours,
          status: getStatusBand(newPct),
          activeTasks: Math.max(0, emp.activeTasks - 1),
        };
      }
      return emp;
    }));

    if (reassignHistory.length <= 1) {
      setPendingChanges(false);
    }
  };

  const markAllAlertsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const markAlertRead = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const addManagerNote = (employeeId, noteText) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          managerNotes: noteText,
          managerNoteDate: 'Just now',
        };
      }
      return emp;
    }));
  };

  return (
    <AppContext.Provider
      value={{
        employees,
        tasks,
        projects,
        alerts,
        interventions,
        settings,
        pendingChanges,
        setPendingChanges,
        reassignTask,
        undoLastReassign,
        markAllAlertsRead,
        markAlertRead,
        addManagerNote,
        setSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

