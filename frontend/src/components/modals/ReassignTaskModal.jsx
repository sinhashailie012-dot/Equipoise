import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Avatar } from '../ui/Avatar';
import { useApp } from '../../context/AppContext';
import { useModals } from '../../context/ModalContext';
import { ArrowRight } from 'lucide-react';

export function ReassignTaskModal() {
  const { reassignModalOpen, closeReassignModal, reassignTaskData } = useModals();
  const { employees, reassignTask } = useApp();

  const [selectedTargetId, setSelectedTargetId] = useState('daniel-kim');
  const [notifyAssignees, setNotifyAssignees] = useState(true);

  if (!reassignTaskData) return null;

  const currentAssignee = employees.find(e => e.id === (reassignTaskData.assigneeId || 'asha-patel')) || employees[1];
  const targetAssignee = employees.find(e => e.id === selectedTargetId) || employees[6];

  const taskHours = reassignTaskData.hours || 6;

  // Potential hours after reassignment
  const currentAfterHours = Math.max(0, currentAssignee.allocatedHours - taskHours);
  const currentAfterPct = Math.round((currentAfterHours / currentAssignee.contractedHours) * 100);

  const targetAfterHours = targetAssignee.allocatedHours + taskHours;
  const targetAfterPct = Math.round((targetAfterHours / targetAssignee.contractedHours) * 100);

  const handleConfirm = () => {
    reassignTask(reassignTaskData.id, selectedTargetId);
    closeReassignModal();
  };

  const candidateOptions = employees
    .filter(e => e.id !== currentAssignee.id)
    .map(e => ({
      value: e.id,
      label: `${e.name} · ${Math.max(0, e.contractedHours - e.allocatedHours)} hrs available`,
    }));

  return (
    <Modal
      isOpen={reassignModalOpen}
      onClose={closeReassignModal}
      title="Reassign task"
      subtitle="A considered change can make space for better work."
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Task Info Box */}
        <div className="p-4 bg-[#F4EFE6] rounded-lg border border-border-subtle">
          <div className="text-[10px] uppercase font-bold tracking-wider text-ink-muted mb-1">
            {reassignTaskData.project || 'ATLAS REDESIGN'}
          </div>
          <div className="text-base font-serif text-ink-primary font-medium">
            {reassignTaskData.title || 'Research synthesis'}
          </div>
          <div className="text-xs text-ink-secondary mt-1">
            {taskHours} estimated hours · Due Friday, {reassignTaskData.due || '6 Nov 2026'}
          </div>
        </div>

        {/* Currently assigned to */}
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-2">
            Currently assigned to
          </label>
          <div className="flex items-center gap-3 p-3 bg-card-subtle rounded-lg border border-border-subtle">
            <Avatar
              initials={currentAssignee.initials}
              name={currentAssignee.name}
              bgColor={currentAssignee.avatarBg}
              textColor={currentAssignee.avatarText}
            />
            <div>
              <div className="text-sm font-medium text-ink-primary">{currentAssignee.name}</div>
              <div className="text-xs text-ink-secondary">
                {currentAssignee.allocatedHours} / {currentAssignee.contractedHours} hrs · {Math.round((currentAssignee.allocatedHours / currentAssignee.contractedHours) * 100)}% allocated
              </div>
            </div>
          </div>
        </div>

        {/* Reassign to */}
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-2">
            Reassign to
          </label>
          <Select
            value={selectedTargetId}
            onChange={setSelectedTargetId}
            options={candidateOptions}
            className="w-full py-2.5"
          />
          <p className="text-xs text-ink-muted mt-1.5">
            Daniel has research synthesis experience and contributes to Atlas.
          </p>
        </div>

        {/* After this change preview card */}
        <div className="p-4 bg-[#EFF5F1] rounded-lg border border-[#C2D9CF]">
          <div className="text-xs font-semibold text-brand-900 mb-2">
            After this change
          </div>
          <div className="space-y-1.5 text-xs text-ink-primary font-mono">
            <div className="flex justify-between items-center">
              <span className="font-sans font-medium">{currentAssignee.name}</span>
              <span>{currentAssignee.allocatedHours} → {currentAfterHours} hrs · {currentAfterPct}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-sans font-medium">{targetAssignee.name}</span>
              <span>{targetAssignee.allocatedHours} → {targetAfterHours} hrs · {targetAfterPct}%</span>
            </div>
          </div>
          <div className="text-[11px] text-ink-secondary mt-3 pt-2 border-t border-[#C2D9CF]/60 font-sans">
            The deadline stays 6 Nov. No changes have been applied yet.
          </div>
        </div>

        {/* Checkbox */}
        <div>
          <Checkbox
            checked={notifyAssignees}
            onChange={setNotifyAssignees}
            label={`Notify ${currentAssignee.name.split(' ')[0]} and ${targetAssignee.name.split(' ')[0]} about this change`}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          <Button variant="secondary" onClick={closeReassignModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} className="gap-2">
            <span>Confirm reassignment</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}

