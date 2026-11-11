import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUpRight, Check, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { KpiCard } from '../components/ui/KpiCard';
import { Dropdown } from '../components/ui/Dropdown';
import { DatePicker } from '../components/ui/DatePicker';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';
import { capacityService } from '../services/capacityService';

export function CapacityPlannerPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [selectedTeam, setSelectedTeam] = useState('design-team');
  const [dateRange, setDateRange] = useState('2 Nov – 13 Dec 2026');
  const [viewMode, setViewMode] = useState('weeks'); // 'weeks' | 'months'

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isAddAllocationOpen, setIsAddAllocationOpen] = useState(false);
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);

  // New allocation form
  const [allocEmployee, setAllocEmployee] = useState('Asha Patel');
  const [allocProject, setAllocProject] = useState('Atlas redesign');
  const [allocHours, setAllocHours] = useState('8');
  const [allocWeek, setAllocWeek] = useState('9 Nov');

  // New leave form
  const [leaveEmployee, setLeaveEmployee] = useState('Asha Patel');
  const [leaveType, setLeaveType] = useState('Annual leave');
  const [leaveDates, setLeaveDates] = useState('1–2 Dec 2026');
  const [leaveHours, setLeaveHours] = useState('16');

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await capacityService.getCapacityData(viewMode);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load capacity planner.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [viewMode, selectedTeam]);

  const handleAddAllocation = async (e) => {
    e.preventDefault();
    try {
      await capacityService.addAllocation({
        employee: allocEmployee,
        project: allocProject,
        hours: Number(allocHours),
        week: allocWeek,
      });
      toast.success(`Allocated ${allocHours} hrs on ${allocProject} to ${allocEmployee}.`);
      setIsAddAllocationOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to add allocation.');
    }
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();
    try {
      await capacityService.addLeave({
        employee: leaveEmployee,
        type: leaveType,
        dates: leaveDates,
        hours: Number(leaveHours),
      });
      toast.success(`Leave scheduled for ${leaveEmployee} (${leaveDates}).`);
      setIsAddLeaveOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to schedule leave.');
    }
  };

  const teamOptions = [
    { value: 'design-team', label: 'Design team · 8 people' },
    { value: 'engineering', label: 'Engineering · 12 people' },
    { value: 'product', label: 'Product · 6 people' },
  ];

  const viewOptions = [
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
  ];

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
        <SkeletonTable rows={8} cols={7} />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-[#6B6A60] uppercase mb-1">
            PEOPLE OPERATIONS / DESIGN TEAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading text-[#1E2A26] font-normal tracking-tight">
            Make space for what's next.
          </h1>
          <p className="text-xs text-[#6B6A60] mt-1.5">
            A six-week planning horizon · Committed work, known leave, and room to breathe.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddAllocationOpen(true)}
          className="gap-1.5 text-xs self-start sm:self-auto"
          icon={Plus}
        >
          Add allocation
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Dropdown
            options={teamOptions}
            value={selectedTeam}
            onChange={(val) => setSelectedTeam(val)}
          />

          <DatePicker
            value={dateRange}
            onChange={(val) => setDateRange(val)}
          />

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setDateRange('2 Nov – 13 Dec 2026');
              toast.info('Reset date horizon to today.');
            }}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Dropdown
            options={viewOptions}
            value={viewMode}
            onChange={(val) => {
              setViewMode(val);
              toast.info(`Switched to ${val} view.`);
            }}
            className="w-32"
          />
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Current allocation"
          value={data.kpis.currentAllocation.value}
          note={data.kpis.currentAllocation.note}
        />
        <KpiCard
          title="Next week"
          value={data.kpis.nextWeek.value}
          note={data.kpis.nextWeek.note}
        />
        <KpiCard
          title="Known leave"
          value={data.kpis.knownLeave.value}
          note={data.kpis.knownLeave.note}
          dotColor="#7E9C7A"
        />
        <KpiCard
          title="Capacity in 6 weeks"
          value={data.kpis.capacityIn6Weeks.value}
          note={data.kpis.capacityIn6Weeks.note}
          dotColor="#4F7A7F"
        />
      </div>

      {/* Team Capacity Timeline Matrix */}
      <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#DDD4C4] flex items-center justify-between">
          <h2 className="font-heading text-lg font-normal text-[#1E2A26]">
            Team capacity timeline
          </h2>
          <span className="text-xs text-[#6B6A60]">
            Allocated / available hours
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DDD4C4] bg-[#F7F3EB]/60 text-[11px] font-semibold uppercase tracking-wider text-[#6B6A60]">
                <th className="py-3 px-4 min-w-[160px]">EMPLOYEE</th>
                {data.weeks.map((week, idx) => (
                  <th key={idx} className="py-3 px-3 text-center min-w-[110px]">
                    {week}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD4C4]/50">
              {data.timeline.map((row) => (
                <tr
                  key={row.employeeId}
                  onClick={() => navigate(`/team/${row.employeeId}`)}
                  className="cursor-pointer hover:bg-[#F4EFE6]/70 transition-colors group"
                >
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-[#1E2A26] group-hover:text-[#234236] group-hover:underline">
                      {row.name}
                    </div>
                    <div className="text-[11px] text-[#6B6A60]">
                      {row.project}
                    </div>
                  </td>

                  {row.schedule.map((cell, cIdx) => {
                    const isOver = cell.hours > cell.cap;
                    const isSpare = cell.hours < cell.cap * 0.8;
                    const barColor = cell.isLeave
                      ? 'bg-[#4F7A7F]'
                      : isOver
                      ? (cell.hours >= 50 ? 'bg-[#7A2E3A]' : 'bg-[#C4613F]')
                      : isSpare
                      ? 'bg-[#4F7A7F]'
                      : 'bg-[#7E9C7A]';

                    return (
                      <td key={cIdx} className="py-3.5 px-3">
                        <div className="p-2 rounded-[2px] bg-[#F4EFE6] border border-[#DDD4C4]/80 text-center space-y-1">
                          <div className="text-[11px] font-medium text-[#1E2A26]">
                            {cell.isLeave && cell.leaveLabel
                              ? cell.leaveLabel
                              : `${cell.hours} / ${cell.cap}h`}
                          </div>
                          <div className="w-full h-1 bg-[#DDD4C4] rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor}`}
                              style={{ width: `${Math.min(100, (cell.hours / cell.cap) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-[#F7F3EB]/40 border-t border-[#DDD4C4] text-xs text-[#6B6A60] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Hours shown include planned work and team rituals.</span>
          <span className="font-medium text-[#1E2A26]">Leave is deducted from available capacity.</span>
        </div>
      </div>

      {/* Bottom sections: Upcoming leave & Before you commit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Leave */}
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-normal text-[#1E2A26]">
                Upcoming leave
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAddLeaveOpen(true)}
                icon={Plus}
              >
                Add leave
              </Button>
            </div>

            <div className="space-y-3">
              {data.upcomingLeave.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-[4px] border border-[#DDD4C4] bg-[#FBF8F2]"
                >
                  <div>
                    <div className="text-xs md:text-sm font-medium text-[#1E2A26]">
                      {item.employee}
                    </div>
                    <div className="text-[11px] text-[#6B6A60]">
                      {item.dates} · {item.type} · {item.hours}
                    </div>
                  </div>
                  <span className="text-xs text-[#7E9C7A] font-medium">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Before You Commit Callout */}
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#6B6A60]">
              Before you commit
            </div>
            <h3 className="font-heading text-xl font-normal text-[#1E2A26]">
              {data.recoveryCallout.title}
            </h3>
            <p className="text-xs text-[#6B6A60] leading-relaxed">
              {data.recoveryCallout.body}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-[#DDD4C4]">
            <Button
              variant="secondary"
              onClick={() => navigate(data.recoveryCallout.actionRoute)}
              className="w-full gap-1.5 text-xs"
              icon={ArrowUpRight}
              iconPosition="left"
            >
              {data.recoveryCallout.actionLabel}
            </Button>
          </div>
        </div>
      </div>

      {/* Add Allocation Modal */}
      <Modal
        isOpen={isAddAllocationOpen}
        onClose={() => setIsAddAllocationOpen(false)}
        title="Add team allocation"
        subtitle="Schedule project hours into the capacity timeline."
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsAddAllocationOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddAllocation}>
              Confirm allocation
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddAllocation} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">Employee</label>
            <select
              value={allocEmployee}
              onChange={(e) => setAllocEmployee(e.target.value)}
              className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] px-3.5 py-2 text-sm text-[#1E2A26] focus:ring-2 focus:ring-[#B8862F]"
            >
              {data.timeline.map((row) => (
                <option key={row.employeeId} value={row.name}>{row.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">Project</label>
            <Input value={allocProject} onChange={(e) => setAllocProject(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1">Hours / week</label>
              <Input type="number" value={allocHours} onChange={(e) => setAllocHours(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1">Week</label>
              <select
                value={allocWeek}
                onChange={(e) => setAllocWeek(e.target.value)}
                className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] px-3.5 py-2 text-sm text-[#1E2A26] focus:ring-2 focus:ring-[#B8862F]"
              >
                {data.weeks.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Add Leave Modal */}
      <Modal
        isOpen={isAddLeaveOpen}
        onClose={() => setIsAddLeaveOpen(false)}
        title="Schedule leave"
        subtitle="Reduce available working hours for planned time off."
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsAddLeaveOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddLeave}>
              Schedule leave
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddLeave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">Employee</label>
            <select
              value={leaveEmployee}
              onChange={(e) => setLeaveEmployee(e.target.value)}
              className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] px-3.5 py-2 text-sm text-[#1E2A26] focus:ring-2 focus:ring-[#B8862F]"
            >
              {data.timeline.map((row) => (
                <option key={row.employeeId} value={row.name}>{row.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">Leave type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] px-3.5 py-2 text-sm text-[#1E2A26] focus:ring-2 focus:ring-[#B8862F]"
            >
              <option value="Annual leave">Annual leave</option>
              <option value="Sick leave">Sick leave</option>
              <option value="Parental leave">Parental leave</option>
              <option value="Personal / study leave">Personal / study leave</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1">Dates</label>
              <Input value={leaveDates} onChange={(e) => setLeaveDates(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1">Hours deducted</label>
              <Input type="number" value={leaveHours} onChange={(e) => setLeaveHours(e.target.value)} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CapacityPlannerPage;
