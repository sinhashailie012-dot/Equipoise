import React, { useState } from 'react';
import { Calendar, Check, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useToast } from '../ui/Toast';
import { burnoutService } from '../../services/burnoutService';

export function ScheduleMeetingModal({
  isOpen,
  onClose,
  employee = {
    id: 'asha-patel',
    name: 'Asha Patel',
    initials: 'AP',
    role: 'Senior product designer',
  },
  onSuccess,
}) {
  const toast = useToast();
  const [date, setDate] = useState('Friday, 6 Nov 2026');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('30 minutes');
  const [location, setLocation] = useState('Google Meet');
  const [agenda, setAgenda] = useState(
    'A little space to check in\n· How is the workload feeling this week?\n· What can we take off your plate?\n· Agree on a plan for the Atlas handoff.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSchedule = async () => {
    try {
      setIsSubmitting(true);
      await burnoutService.scheduleCheckIn({
        employeeId: employee.id,
        employeeName: employee.name,
        date,
        time,
        duration,
        location,
        agenda,
      });

      toast.success(`1:1 scheduled with ${employee.name} for ${date} at ${time}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to schedule 1:1. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Make time for a conversation."
      subtitle={`Schedule a private check-in with ${employee.name || 'Asha Patel'}.`}
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSchedule}
            disabled={isSubmitting}
            icon={Calendar}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule 1:1'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Participant Header */}
        <div className="flex items-center gap-3 p-3 bg-[#F4EFE6] border border-[#DDD4C4] rounded-[4px]">
          <Avatar initials={employee.initials || 'AP'} name={employee.name || 'Asha Patel'} size="md" />
          <div>
            <div className="text-sm font-medium text-[#1E2A26]">{employee.name || 'Asha Patel'}</div>
            <div className="text-xs text-[#6B6A60]">With Emma Chen · Private workload check-in</div>
          </div>
        </div>

        {/* Date and Time row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">
              Date
            </label>
            <div className="relative">
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] px-3.5 py-2 text-sm text-[#1E2A26] focus:outline-none focus:ring-2 focus:ring-[#B8862F]"
              />
              <Calendar className="w-4 h-4 text-[#6B6A60] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">
              Start time · GMT
            </label>
            <div className="relative">
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] px-3.5 py-2 text-sm text-[#1E2A26] focus:outline-none focus:ring-2 focus:ring-[#B8862F]"
              />
              <Clock className="w-4 h-4 text-[#6B6A60] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Duration and Location row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] px-3.5 py-2 text-sm text-[#1E2A26] focus:outline-none focus:ring-2 focus:ring-[#B8862F]"
            >
              <option value="15 minutes">15 minutes</option>
              <option value="30 minutes">30 minutes</option>
              <option value="45 minutes">45 minutes</option>
              <option value="60 minutes">60 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] px-3.5 py-2 text-sm text-[#1E2A26] focus:outline-none focus:ring-2 focus:ring-[#B8862F]"
            />
          </div>
        </div>

        {/* Agenda */}
        <div>
          <label className="block text-xs font-medium text-[#6B6A60] mb-1">
            Agenda
          </label>
          <textarea
            rows={4}
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-3 text-xs md:text-sm text-[#1E2A26] focus:outline-none focus:ring-2 focus:ring-[#B8862F] leading-relaxed resize-none font-sans"
          />
          <p className="mt-1 text-[11px] text-[#6B6A60]">
            Risk scores and manager notes are never included in the invitation.
          </p>
        </div>

        {/* Status Confirmation Banner */}
        <div className="p-3 bg-[#EAF0E9] border border-[#CCE0CB] rounded-[4px] flex items-center gap-2 text-xs text-[#375734]">
          <Check className="w-4 h-4 shrink-0 text-[#7E9C7A]" />
          <span>Both calendars are free at {time}. An invitation will be sent to {employee.name || 'Asha'} and Emma.</span>
        </div>
      </div>
    </Modal>
  );
}

export default ScheduleMeetingModal;
