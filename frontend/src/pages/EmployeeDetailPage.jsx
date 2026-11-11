import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowLeftRight, Calendar, Plus, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatusChip } from '../components/ui/StatusChip';
import { Avatar } from '../components/ui/Avatar';
import { KpiCard } from '../components/ui/KpiCard';
import { Modal } from '../components/ui/Modal';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';
import { ReassignTaskModal } from '../components/modals/ReassignTaskModal';
import { ScheduleMeetingModal } from '../components/modals/ScheduleMeetingModal';
import { employeeService } from '../services/employeeService';
import { getHeatmapColor } from '../utils/workload';

export function EmployeeDetailPage() {
  const { id = 'asha-patel' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');

  const loadEmployee = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await employeeService.getEmployeeById(id);
      setEmployee(res);
    } catch (err) {
      setError(err.message || 'Failed to load employee details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const handleSaveNote = async () => {
    if (!newNoteText.trim()) return;
    try {
      await employeeService.addManagerNote(employee.id, newNoteText);
      toast.success('Manager note added.');
      setNewNoteText('');
      setIsAddNoteOpen(false);
      loadEmployee();
    } catch (err) {
      toast.error('Failed to save note.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-[#E7E1D4]/40 animate-pulse rounded-[4px]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={6} cols={4} />
      </div>
    );
  }

  if (error || !employee) {
    return <ErrorState message={error} onRetry={loadEmployee} />;
  }

  const weeklyHistory = employee.weeklyAllocation || [34, 36, 38, 40, 44, 46, 50, 48];
  const weekLabels = ['14 Sep', '21 Sep', '28 Sep', '5 Oct', '12 Oct', '19 Oct', '26 Oct', '2 Nov'];
  const overtimeHistory = employee.overtimeHistory || [0, 0, 0, 0, 4, 6, 10, 8];

  return (
    <div className="space-y-6 select-none">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/team')}
            className="flex items-center gap-1.5 text-xs text-[#6B6A60] hover:text-[#1E2A26] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to team workload</span>
          </button>
          <div className="text-[10px] font-semibold tracking-wider text-[#6B6A60] uppercase mb-1">
            PEOPLE OPERATIONS / DESIGN TEAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading text-[#1E2A26] font-normal tracking-tight">
            {employee.name}
          </h1>
          <p className="text-xs text-[#6B6A60] mt-1">
            People / {employee.name} · Week of 2–8 November 2026
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedTask(employee.tasks?.[1] || employee.tasks?.[0]);
              setIsReassignOpen(true);
            }}
            className="gap-1.5 text-xs"
            icon={ArrowLeftRight}
          >
            Reassign task
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsScheduleOpen(true)}
            className="gap-1.5 text-xs"
            icon={Calendar}
          >
            Schedule 1:1
          </Button>
        </div>
      </div>

      {/* Profile Bar */}
      <div className="p-4 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar
            initials={employee.initials}
            name={employee.name}
            size="lg"
            bgColor="#F8ECE7"
            textColor="#873B21"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-heading text-lg font-normal text-[#1E2A26]">
                {employee.name}
              </span>
              <StatusChip status={employee.status} size="sm" />
            </div>
            <div className="text-xs text-[#6B6A60] mt-0.5">
              {employee.role} · {employee.department || 'Design'} · Reports to {employee.reportsTo || 'Emma Chen'}
            </div>
          </div>
        </div>

        <div className="text-xs text-[#6B6A60] font-mono">
          {employee.email}
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="This week"
          value={`${employee.allocatedHours || 48} hrs`}
          note={`120% of ${employee.contractedHours || 40} hr capacity`}
          dotColor="#C4613F"
        />
        <KpiCard
          title="Burnout risk"
          value={`${employee.riskScore || 82} / 100`}
          note="Critical · +8 this week"
          dotColor="#7A2E3A"
        />
        <KpiCard
          title="Overtime"
          value="8 hrs"
          note="3 consecutive weeks ≥6 hrs"
          dotColor="#C4613F"
        />
        <KpiCard
          title="Next planned leave"
          value="16 Nov"
          note="2 days · approved"
          dotColor="#7E9C7A"
        />
      </div>

      {/* Row: Eight weeks of workload + Burnout indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Eight Weeks Workload Bar Chart */}
        <div className="lg:col-span-2 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-normal text-[#1E2A26]">
                Eight weeks of workload
              </h2>
              <span className="text-xs text-[#6B6A60]">Allocated hours</span>
            </div>

            <div className="flex items-end justify-between gap-2 h-44 pt-4 pb-2 border-b border-[#DDD4C4]">
              {weeklyHistory.map((hrs, idx) => {
                const cellInfo = getHeatmapColor(hrs, 40);
                const barHeight = Math.round((hrs / 60) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-[11px] font-sans text-[#1E2A26] font-medium mb-1">
                      {hrs}h
                    </span>
                    <div
                      className="w-full max-w-[38px] rounded-t-[2px] transition-all duration-300"
                      style={{
                        height: `${barHeight}%`,
                        backgroundColor: cellInfo.dotColor,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[11px] text-[#6B6A60] pt-2">
              {weekLabels.map((lbl, idx) => (
                <span key={idx} className="flex-1 text-center truncate">
                  {lbl}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#6B6A60] pt-3 border-t border-[#DDD4C4] mt-2">
            40 hrs contracted weekly · Above capacity for 4 weeks
          </p>
        </div>

        {/* Burnout Indicators Card */}
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-lg font-normal text-[#1E2A26] mb-3">
              Burnout indicators
            </h2>

            <div className="flex items-center justify-between pb-4 border-b border-[#DDD4C4]">
              <span className="text-3xl font-heading text-[#1E2A26] font-normal">
                {employee.riskScore || 82} / 100
              </span>
              <StatusChip status="critical" size="sm" />
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6B6A60]">Sustained overtime</span>
                <span className="font-semibold text-[#1E2A26]">High</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6A60]">Deadline pressure</span>
                <span className="font-semibold text-[#1E2A26]">High</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6A60]">Recovery time</span>
                <span className="font-semibold text-[#1E2A26]">Low</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#8D8C82] pt-3 border-t border-[#DDD4C4]">
            Signals from work patterns, not a health diagnosis.
          </p>
        </div>
      </div>

      {/* Row: Current tasks (2/3) + Notes & Leave (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Tasks Table */}
        <div className="lg:col-span-2 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-card overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-[#DDD4C4] flex items-center justify-between">
              <h2 className="font-heading text-base font-normal text-[#1E2A26]">
                Current tasks
              </h2>
              <span className="text-xs text-[#6B6A60]">
                {employee.tasks?.length || 7} tasks · {employee.allocatedHours || 48} hrs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#DDD4C4] bg-[#F7F3EB]/60 text-[11px] uppercase tracking-wider text-[#6B6A60]">
                    <th className="py-2.5 px-4 font-semibold">TASK / PROJECT</th>
                    <th className="py-2.5 px-4 font-semibold">HOURS</th>
                    <th className="py-2.5 px-4 font-semibold">DUE</th>
                    <th className="py-2.5 px-4 font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD4C4]/50">
                  {employee.tasks?.map((task) => {
                    const isOverdue = task.status === 'Overdue';
                    return (
                      <tr
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setIsReassignOpen(true);
                        }}
                        className="cursor-pointer hover:bg-[#F4EFE6]/60 transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#1E2A26] group-hover:text-[#234236]">
                            {task.title}
                          </div>
                          <div className="text-[11px] text-[#6B6A60]">
                            {task.project}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-[#1E2A26]">
                          {task.hours}h
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-[#6B6A60]">
                          {task.due}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#C4613F]">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>! Overdue</span>
                            </span>
                          ) : (
                            <span className="text-[#6B6A60] font-medium">
                              {task.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Manager Notes & Leave History */}
        <div className="space-y-6">
          {/* Manager Notes */}
          <div className="p-5 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-normal text-[#1E2A26]">
                Manager notes
              </h3>
              <span className="text-[11px] uppercase tracking-wider text-[#6B6A60]">Private</span>
            </div>

            <p className="text-xs text-[#1E2A26] italic leading-relaxed bg-[#F4EFE6] p-3 rounded-[4px] border border-[#DDD4C4]">
              "{employee.managerNotes || 'Asha is carrying both discovery and delivery for Atlas. Protect focus time and move synthesis support before Friday.'}"
            </p>

            <div className="text-[11px] text-[#6B6A60]">
              Emma Chen · {employee.managerNoteDate || '4 Nov, 15:30'}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddNoteOpen(true)}
              className="w-full gap-1.5 text-xs"
              icon={Plus}
            >
              Add note
            </Button>
          </div>

          {/* Leave History */}
          <div className="p-5 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-card space-y-3">
            <h3 className="font-heading text-base font-normal text-[#1E2A26]">
              Leave history
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#DDD4C4]/50">
                <span className="text-[#1E2A26]">16–17 Nov · Annual leave</span>
                <span className="text-[#7E9C7A] font-medium">Approved</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#DDD4C4]/50 text-[#6B6A60]">
                <span>7 Aug · Annual leave · 1 day</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#DDD4C4]/50 text-[#6B6A60]">
                <span>15–19 Jun · Annual leave · 5 days</span>
              </div>
            </div>

            <p className="text-xs text-[#6B6A60] pt-1">
              90 days since the last full day off
            </p>
          </div>
        </div>
      </div>

      {/* Overtime History Bar Chart */}
      <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading text-base font-normal text-[#1E2A26]">
            Overtime history
          </h2>
          <span className="text-xs text-[#6B6A60]">Hours above weekly capacity</span>
        </div>
        <div className="flex items-end justify-between gap-2 h-32 pt-4 pb-2 border-b border-[#DDD4C4]">
          {overtimeHistory.map((hrs, idx) => {
            const barHeight = hrs === 0 ? 3 : Math.round((hrs / 12) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-[11px] font-sans text-[#1E2A26] font-medium mb-1">
                  {hrs}
                </span>
                <div
                  className="w-full max-w-[34px] rounded-t-[2px] transition-all duration-300"
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: hrs === 0 ? '#DDD4C4' : '#C4613F',
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center text-[11px] text-[#6B6A60] pt-2">
          {weekLabels.map((lbl, idx) => (
            <span key={idx} className="flex-1 text-center truncate">
              {lbl}
            </span>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ReassignTaskModal
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        task={selectedTask || undefined}
        onSuccess={loadEmployee}
      />

      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        employee={employee}
        onSuccess={loadEmployee}
      />

      {/* Add Note Modal */}
      <Modal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        title="Add private manager note"
        subtitle={`Visible only to authorized managers for ${employee.name}.`}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsAddNoteOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveNote}>
              Save note
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-medium text-[#6B6A60]">Note content</label>
          <textarea
            rows={4}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Write observations about focus, workload distribution, or recovery needs..."
            className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-3 text-sm text-[#1E2A26] focus:outline-none focus:ring-2 focus:ring-[#B8862F] leading-relaxed resize-none"
          />
        </div>
      </Modal>
    </div>
  );
}

export default EmployeeDetailPage;
