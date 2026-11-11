import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Checkbox } from '../ui/Checkbox';
import { useToast } from '../ui/Toast';
import { workloadService } from '../../services/workloadService';

export function ReassignTaskModal({
  isOpen,
  onClose,
  task = {
    id: 'task-2',
    title: 'Research synthesis',
    project: 'Atlas redesign',
    hours: 6,
    due: 'Friday, 6 Nov 2026',
    assignee: 'Asha Patel',
    assigneeId: 'asha-patel',
  },
  onSuccess,
}) {
  const toast = useToast();
  const [targetEmployeeId, setTargetEmployeeId] = useState('daniel-kim');
  const [notify, setNotify] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const candidates = [
    {
      id: 'daniel-kim',
      name: 'Daniel Kim',
      note: '12 hrs available',
      matchText: 'Daniel has research synthesis experience and contributes to Atlas.',
      beforeHrs: 28,
      afterHrs: 34,
      beforeUtil: 70,
      afterUtil: 85,
    },
    {
      id: 'james-okafor',
      name: 'James Okafor',
      note: '4 hrs available',
      matchText: 'James is contributing to Atlas UX research.',
      beforeHrs: 36,
      afterHrs: 42,
      beforeUtil: 90,
      afterUtil: 105,
    },
    {
      id: 'olivia-brooks',
      name: 'Olivia Brooks',
      note: '14 hrs available',
      matchText: 'Olivia has visual design focus on Beacon.',
      beforeHrs: 26,
      afterHrs: 32,
      beforeUtil: 65,
      afterUtil: 80,
    },
  ];

  const selectedCandidate = candidates.find((c) => c.id === targetEmployeeId) || candidates[0];

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await workloadService.reassignTask({
        taskId: task.id,
        fromEmployeeId: task.assigneeId || 'asha-patel',
        toEmployeeId: targetEmployeeId,
        notify,
      });

      toast.success(`Task "${task.title}" reassigned to ${selectedCandidate.name}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to reassign task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reassign task"
      subtitle="A considered change can make space for better work."
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
            icon={ArrowRight}
            iconPosition="right"
          >
            {isSubmitting ? 'Reassigning...' : 'Confirm reassignment'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Task Summary Box */}
        <div className="p-4 bg-[#F4EFE6] border border-[#DDD4C4] rounded-[4px]">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#6B6A60] mb-1">
            {task.project || 'ATLAS REDESIGN'}
          </div>
          <div className="font-heading text-lg font-normal text-[#1E2A26] mb-1">
            {task.title || 'Research synthesis'}
          </div>
          <div className="text-xs text-[#6B6A60]">
            {task.hours || 6} estimated hours · Due {task.due || 'Friday, 6 Nov 2026'}
          </div>
        </div>

        {/* Currently Assigned To */}
        <div>
          <label className="block text-xs font-medium text-[#6B6A60] mb-2">
            Currently assigned to
          </label>
          <div className="flex items-center gap-3 p-3 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px]">
            <Avatar initials="AP" name="Asha Patel" size="md" />
            <div>
              <div className="text-sm font-medium text-[#1E2A26]">Asha Patel</div>
              <div className="text-xs text-[#6B6A60]">48 / 40 hrs · 120% allocated</div>
            </div>
          </div>
        </div>

        {/* Reassign To Select */}
        <div>
          <label className="block text-xs font-medium text-[#6B6A60] mb-2">
            Reassign to
          </label>
          <select
            value={targetEmployeeId}
            onChange={(e) => setTargetEmployeeId(e.target.value)}
            className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] px-3.5 py-2 text-sm text-[#1E2A26] focus:outline-none focus:ring-2 focus:ring-[#B8862F]"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.note}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-[#6B6A60]">
            {selectedCandidate.matchText}
          </p>
        </div>

        {/* After This Change Preview Box */}
        <div className="p-4 bg-[#EAF0E9]/70 border border-[#CCE0CB] rounded-[4px] space-y-2 text-sm">
          <div className="font-medium text-[#234236] text-xs uppercase tracking-wider mb-2">
            After this change
          </div>
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="text-[#1E2A26]">Asha Patel</span>
            <span className="font-semibold text-[#1E2A26]">48 → 42 hrs · 105%</span>
          </div>
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="text-[#1E2A26]">{selectedCandidate.name}</span>
            <span className="font-semibold text-[#1E2A26]">
              {selectedCandidate.beforeHrs} → {selectedCandidate.afterHrs} hrs · {selectedCandidate.afterUtil}%
            </span>
          </div>
          <p className="pt-2 text-xs text-[#6B6A60] border-t border-[#CCE0CB]/60">
            The deadline stays {task.due || '6 Nov'}. No changes have been applied yet.
          </p>
        </div>

        {/* Notify Checkbox */}
        <div className="pt-1">
          <Checkbox
            checked={notify}
            onChange={setNotify}
            label={`Notify Asha and ${selectedCandidate.name.split(' ')[0]} about this change`}
          />
        </div>
      </div>
    </Modal>
  );
}

export default ReassignTaskModal;
