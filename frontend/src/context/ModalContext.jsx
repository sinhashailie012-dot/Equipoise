import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignTaskData, setReassignTaskData] = useState(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulePersonData, setSchedulePersonData] = useState(null);

  const openReassignModal = (task = null) => {
    setReassignTaskData(task || {
      id: 'task-2',
      title: 'Research synthesis',
      project: 'Atlas redesign',
      assigneeId: 'asha-patel',
      hours: 6,
      due: '6 Nov 2026',
    });
    setReassignModalOpen(true);
  };

  const closeReassignModal = () => {
    setReassignModalOpen(false);
    setReassignTaskData(null);
  };

  const openScheduleModal = (person = null) => {
    setSchedulePersonData(person || {
      id: 'asha-patel',
      name: 'Asha Patel',
      initials: 'AP',
      email: 'asha.patel@forma.studio',
      role: 'Senior product designer',
    });
    setScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setScheduleModalOpen(false);
    setSchedulePersonData(null);
  };

  return (
    <ModalContext.Provider
      value={{
        reassignModalOpen,
        reassignTaskData,
        openReassignModal,
        closeReassignModal,
        scheduleModalOpen,
        schedulePersonData,
        openScheduleModal,
        closeScheduleModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
}

