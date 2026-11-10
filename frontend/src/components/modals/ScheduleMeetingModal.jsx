import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Avatar } from '../ui/Avatar';
import { useModals } from '../../context/ModalContext';
import { Calendar, Clock, Video, Check } from 'lucide-react';

export function ScheduleMeetingModal() {
  const { scheduleModalOpen, closeScheduleModal, schedulePersonData } = useModals();

  const [date, setDate] = useState('Friday, 6 Nov 2026');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('30 minutes');
  const [location, setLocation] = useState('Google Meet');
  const [agenda, setAgenda] = useState(`A little space to check in\n• How is the workload feeling this week?\n• What can we take off your plate?\n• Agree on a plan for the Atlas handoff.`);
  const [confirmed, setConfirmed] = useState(false);

  if (!schedulePersonData) return null;

  const personName = schedulePersonData.name || 'Asha Patel';

  const handleSchedule = () => {
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      closeScheduleModal();
    }, 900);
  };

  return (
    <Modal
      isOpen={scheduleModalOpen}
      onClose={closeScheduleModal}
      title="Make time for a conversation."
      subtitle={`Schedule a private check-in with ${personName}.`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Person Card */}
        <div className="flex items-center gap-3 p-3 bg-card-subtle rounded-lg border border-border-subtle">
          <Avatar
            initials={schedulePersonData.initials || 'AP'}
            name={personName}
            bgColor="#F0DED5"
            textColor="#8C3E23"
          />
          <div>
            <div className="text-sm font-medium text-ink-primary">{personName}</div>
            <div className="text-xs text-ink-secondary">
              With Emma Chen · Private workload check-in
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              Date
            </label>
            <Input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              icon={<Calendar className="w-4 h-4 text-ink-muted" />}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              Start time · GMT
            </label>
            <Input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              icon={<Clock className="w-4 h-4 text-ink-muted" />}
            />
          </div>
        </div>

        {/* Duration and Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              Duration
            </label>
            <Select
              value={duration}
              onChange={setDuration}
              options={['15 minutes', '30 minutes', '45 minutes', '60 minutes']}
              className="w-full py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              icon={<Video className="w-4 h-4 text-ink-muted" />}
            />
          </div>
        </div>

        {/* Agenda */}
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-1">
            Agenda
          </label>
          <textarea
            rows={5}
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            className="w-full bg-[#FBF8F2] text-ink-primary border border-[#DFD8CB] rounded p-3 text-xs leading-relaxed focus:bg-white focus:outline-none focus-visible:focus-ochre font-sans"
          />
          <p className="text-[11px] text-ink-muted mt-1">
            Risk scores and manager notes are never included in the invitation.
          </p>
        </div>

        {/* Free Slot Availability Indicator */}
        <div className="flex items-center gap-2 p-2.5 bg-[#EFF5F1] rounded-md border border-[#C2D9CF] text-xs text-brand-900">
          <Check className="w-4 h-4 text-brand-700 shrink-0 stroke-[2.5]" />
          <span>Both calendars are free at 10:00. An invitation will be sent to {personName.split(' ')[0]} and Emma.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          <Button variant="secondary" onClick={closeScheduleModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSchedule}
            className="gap-2"
            selected={confirmed}
          >
            <Calendar className="w-4 h-4" />
            <span>{confirmed ? 'Scheduled!' : 'Schedule 1:1'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

