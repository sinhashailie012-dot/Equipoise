import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '../ui/Toast';
import { employeeService } from '../../services/employeeService';

export function EmployeeFormModal({ isOpen, onClose, employee = null, onSaved }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    department: 'Design',
    reportsTo: 'Emma Chen',
    contractedHours: 40,
    allocatedHours: 40,
    project: 'Atlas redesign',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        role: employee.role || '',
        email: employee.email || '',
        department: employee.department || 'Design',
        reportsTo: employee.reportsTo || 'Emma Chen',
        contractedHours: employee.contractedHours ?? 40,
        allocatedHours: employee.allocatedHours ?? 40,
        project: employee.project || 'Atlas redesign',
      });
    } else {
      setFormData({
        name: '',
        role: 'Product designer',
        email: '',
        department: 'Design',
        reportsTo: 'Emma Chen',
        contractedHours: 40,
        allocatedHours: 40,
        project: 'Atlas redesign',
      });
    }
  }, [employee, isOpen]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter an employee name.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (employee) {
        await employeeService.updateEmployee(employee.id, formData);
        toast.success(`Updated ${formData.name}`);
      } else {
        await employeeService.createEmployee(formData);
        toast.success(`Added ${formData.name} to team`);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? `Edit ${employee.name}` : 'Add team member'}
      subtitle="Manage employee profile, contract capacity and assignment."
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : employee ? 'Save changes' : 'Add member'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#1E2A26] mb-1">Full name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Maya Lin"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#1E2A26] mb-1">Role</label>
            <Input
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Product designer"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#1E2A26] mb-1">Department</label>
            <Select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={[
                { value: 'Design', label: 'Design' },
                { value: 'Product', label: 'Product' },
                { value: 'Research', label: 'Research' },
                { value: 'Engineering', label: 'Engineering' },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#1E2A26] mb-1">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. maya.lin@forma.studio"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#1E2A26] mb-1">Contracted hrs / wk</label>
            <Input
              type="number"
              min="1"
              max="168"
              value={formData.contractedHours}
              onChange={(e) => setFormData({ ...formData, contractedHours: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block font-semibold text-[#1E2A26] mb-1">Allocated hrs / wk</label>
            <Input
              type="number"
              min="0"
              max="168"
              value={formData.allocatedHours}
              onChange={(e) => setFormData({ ...formData, allocatedHours: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#1E2A26] mb-1">Primary project</label>
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
      </form>
    </Modal>
  );
}

export default EmployeeFormModal;

