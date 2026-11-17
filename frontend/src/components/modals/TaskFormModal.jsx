import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '../ui/Toast';
import { taskService } from '../../services/taskService';

export function TaskFormModal({ isOpen, onClose, task = null, employees = [], onSaved, defaultAssigneeId = '' }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    project: 'Atlas redesign',
    assigneeId: '',
    hours: 8,
    due: '20 Nov',
    status: 'To do',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        project: task.project || 'Atlas redesign',
        assigneeId: task.assigneeId || defaultAssigneeId || '',
        hours: task.hours ?? 8,
        due: task.due || '20 Nov',
        status: task.status || 'To do',
      });
    } else {
      setFormData({
        title: '',
        project: 'Atlas redesign',
        assigneeId: defaultAssigneeId || (employees[0]?.id || ''),
        hours: 8,
        due: '20 Nov',
        status: 'To do',
      });
    }
  }, [task, isOpen, defaultAssigneeId, employees]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a task title.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (task) {
        await taskService.updateTask(task.id, formData);
        toast.success(`Updated "${formData.title}"`);
      } else {
        await taskService.createTask(formData);
        toast.success(`Created task "${formData.title}"`);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit task' : 'Add task'}
      subtitle="Define deliverables, assignee and estimated effort hours."
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : task ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#1E2A26] mb-1">Task title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Design token documentation"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#1E2A26] mb-1">Project</label>
            <Select
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              options={[
                { value: 'Atlas redesign', label: 'Atlas redesign' },
                { value: 'Beacon launch', label: 'Beacon launch' },
                { value: 'Helios design system', label: 'Helios design system' },
                { value: 'Compass discovery', label: 'Compass discovery' },
              ]}
            />
          </div>
          <div>
            <label className="block font-semibold text-[#1E2A26] mb-1">Assignee</label>
            <Select
              value={formData.assigneeId}
              onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
              options={employeeOptions.length ? employeeOptions : [
                { value: 'asha-patel', label: 'Asha Patel' },
                { value: 'marcus-reed', label: 'Marcus Reed' },
                { value: 'daniel-kim', label: 'Daniel Kim' },
                { value: 'sofia-rivera', label: 'Sofia Rivera' },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#1E2A26] mb-1">Estimated hours</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block font-semibold text-[#1E2A26] mb-1">Due date / week</label>
            <Input
              value={formData.due}
              onChange={(e) => setFormData({ ...formData, due: e.target.value })}
              placeholder="e.g. 20 Nov"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#1E2A26] mb-1">Status</label>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'To do', label: 'To do' },
              { value: 'In progress', label: 'In progress' },
              { value: 'Scheduled', label: 'Scheduled' },
              { value: 'Done', label: 'Done' },
            ]}
          />
        </div>
      </form>
    </Modal>
  );
}

export default TaskFormModal;

