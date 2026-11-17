import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '../ui/Toast';
import { capacityService } from '../../services/capacityService';

export function LeaveFormModal({ isOpen, onClose, leave = null, employees = [], onSaved, defaultEmployee = 'Asha Patel' }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    employee: 'Asha Patel',
    type: 'Annual leave',
    dates: '1–2 Dec 2026',
    hours: 16,
    status: 'Approved',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (leave) {
      const parsedHours = parseInt(leave.hours, 10) || 16;
      setFormData({
        employee: leave.employee || defaultEmployee,
        type: leave.type || 'Annual leave',
        dates: leave.dates || '',
        hours: parsedHours,
        status: leave.status || 'Approved',
      });
    } else {
      setFormData({
        employee: defaultEmployee,
        type: 'Annual leave',
        dates: '1–2 Dec 2026',
        hours: 16,
        status: 'Approved',
      });
    }
  }, [leave, isOpen, defaultEmployee]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.dates.trim()) {
      toast.error('Please enter leave dates.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (leave) {
        await capacityService.updateLeave(leave.id, formData);
        toast.success(`Updated leave for ${formData.employee}`);
      } else {
        await capacityService.addLeave(formData);
        toast.success(`Scheduled leave for ${formData.employee}`);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save leave.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const employeeOptions = employees.length
    ? employees.map((e) => ({ value: e.name, label: e.name }))
    : [
        { value: 'Asha Patel', label: 'Asha Patel' },
        { value: 'Marcus Reed', label: 'Marcus Reed' },
        { value: 'Daniel Kim', label: 'Daniel Kim' },
        { value: 'Sofia Rivera', label: 'Sofia Rivera' },
        { value: 'Olivia Brooks', label: 'Olivia Brooks' },
      ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={leave ? 'Edit leave record' : 'Schedule leave'}
      subtitle="Track upcoming annual leave, sick leave or recovery days."
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : leave ? 'Save changes' : 'Schedule leave'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#1E2A26] mb-1">Team member</label>
          <Select
            value={formData.employee}
            onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
            options={employeeOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#1E2A26] mb-1">Leave type</label>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'Annual leave', label: 'Annual leave' },
                { value: 'Sick leave', label: 'Sick leave' },
                { value: 'Recovery day', label: 'Recovery day' },
                { value: 'Parental leave', label: 'Parental leave' },
              ]}
            />
          </div>
          <div>
            <label className="block font-semibold text-[#1E2A26] mb-1">Total hours</label>
            <Input
              type="number"
              min="1"
              max="240"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#1E2A26] mb-1">Dates</label>
          <Input
            value={formData.dates}
            onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
            placeholder="e.g. 16–17 Nov 2026"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-[#1E2A26] mb-1">Approval status</label>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'Approved', label: 'Approved' },
              { value: 'Pending', label: 'Pending' },
            ]}
          />
        </div>
      </form>
    </Modal>
  );
}

export default LeaveFormModal;

