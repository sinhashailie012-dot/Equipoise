import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/Input';
import { StatusChip } from '../components/ui/StatusChip';
import { CapacityBar } from '../components/ui/CapacityBar';
import { Avatar } from '../components/ui/Avatar';
import { Tabs } from '../components/ui/Tabs';
import { Dropdown } from '../components/ui/Dropdown';
import { DatePicker } from '../components/ui/DatePicker';
import { Modal } from '../components/ui/Modal';
import { SkeletonTable } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';
import { employeeService } from '../services/employeeService';
import { getUtilization, getStatusFromThresholds } from '../utils/workload';

export function TeamWorkloadPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('design-team');
  const [dateRange, setDateRange] = useState('2–8 Nov 2026');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'at-risk', 'spare'
  const [sortOrder, setSortOrder] = useState('highest'); // 'highest', 'lowest', 'name'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const teamOptions = [
    { value: 'design-team', label: 'Design team · 8 people' },
    { value: 'engineering', label: 'Engineering · 12 people' },
    { value: 'product', label: 'Product · 6 people' },
    { value: 'all', label: 'All teams · 26 people' },
  ];

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await employeeService.getEmployees({
        search: searchQuery,
        tab: activeTab,
        team: selectedTeam === 'design-team' ? 'design' : selectedTeam,
        sortBy: sortOrder === 'highest' ? 'allocation' : sortOrder === 'lowest' ? 'lowest' : 'name',
      });

      let list = res;
      if (statusFilter !== 'all') {
        list = list.filter((e) => e.status === statusFilter);
      }
      setEmployees(list);
    } catch (err) {
      setError(err.message || 'Failed to load team workload data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchQuery, activeTab, sortOrder, selectedTeam, statusFilter]);

  const toggleSort = () => {
    const nextSort = sortOrder === 'highest' ? 'lowest' : sortOrder === 'lowest' ? 'name' : 'highest';
    setSortOrder(nextSort);
    toast.info(`Sorted by ${nextSort === 'highest' ? 'highest allocation' : nextSort === 'lowest' ? 'lowest allocation' : 'name'}`);
  };

  // Calculations for summary footer
  const totalAllocated = employees.reduce((acc, e) => acc + (e.allocatedHours || 0), 0);
  const totalCapacity = employees.reduce((acc, e) => acc + (e.contractedHours || 40), 0);
  const totalTasks = employees.reduce((acc, e) => acc + (e.activeTasks || 0), 0);

  const tabs = [
    { id: 'all', label: 'All people', count: 8 },
    { id: 'at-risk', label: 'At risk', count: 3 },
    { id: 'spare', label: 'Spare capacity', count: 2 },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-[#6B6A60] uppercase mb-1">
            PEOPLE OPERATIONS / DESIGN TEAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading text-[#1E2A26] font-normal tracking-tight">
            Workload is a team conversation.
          </h1>
          <p className="text-xs text-[#6B6A60] mt-1.5">
            8 people · 320 contracted hours · Week of 2 November 2026
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/rebalancer')}
          className="gap-2 text-xs self-start sm:self-auto"
          icon={ArrowLeftRight}
        >
          Rebalance tasks
        </Button>
      </div>

      {/* Controls Bar: Search, Team Dropdown, Date, Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="w-full sm:w-64">
            <SearchInput
              placeholder="Search people or projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dropdown
            options={teamOptions}
            value={selectedTeam}
            onChange={(val) => setSelectedTeam(val)}
            className="w-full sm:w-auto"
          />

          <DatePicker
            value={dateRange}
            onChange={(val) => setDateRange(val)}
          />
        </div>

        <Button
          variant="secondary"
          onClick={() => setShowFilterModal(true)}
          className="gap-1.5 text-xs shrink-0"
          icon={SlidersHorizontal}
        >
          Filters
        </Button>
      </div>

      {/* Tabs and Sort Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDD4C4] pb-3">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
          variant="pill"
        />

        <button
          type="button"
          onClick={toggleSort}
          className="text-xs text-[#6B6A60] hover:text-[#1E2A26] flex items-center gap-1 font-medium select-none focus:outline-none focus:ring-2 focus:ring-[#B8862F] rounded-[2px] p-1 self-start sm:self-auto"
        >
          <span>
            Sort: {sortOrder === 'highest' ? 'highest allocation first ↓' : sortOrder === 'lowest' ? 'lowest allocation first ↑' : 'alphabetical'}
          </span>
          <ArrowUpDown className="w-3.5 h-3.5 text-[#8D8C82]" />
        </button>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <SkeletonTable rows={8} cols={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEmployees} />
      ) : (
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#1E2A26] border-collapse">
              <thead>
                <tr className="border-b border-[#DDD4C4] bg-[#F7F3EB]/60 text-[11px] font-semibold uppercase tracking-wider text-[#6B6A60]">
                  <th className="py-3 px-4">EMPLOYEE</th>
                  <th className="py-3 px-4 min-w-[200px]">WEEKLY ALLOCATION</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">TASKS</th>
                  <th className="py-3 px-4">NEXT DEADLINE</th>
                  <th className="py-3 px-4">PROJECT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD4C4]/50">
                {employees.map((emp) => {
                  const util = getUtilization(emp.allocatedHours, emp.contractedHours);
                  const isOverdue = emp.overdueTasks > 0;

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => navigate(`/team/${emp.id}`)}
                      className="cursor-pointer hover:bg-[#F4EFE6]/70 transition-colors group"
                    >
                      {/* Employee Cell */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar
                            initials={emp.initials}
                            name={emp.name}
                            size="md"
                          />
                          <div>
                            <div className="text-xs md:text-sm font-medium text-[#1E2A26] group-hover:text-[#234236] group-hover:underline">
                              {emp.name}
                            </div>
                            <div className="text-[11px] text-[#6B6A60]">
                              {emp.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Weekly Allocation Cell */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[#1E2A26]">
                              {emp.allocatedHours} / {emp.contractedHours} hrs
                            </span>
                            <span className="text-[#6B6A60] font-normal">
                              {util}%
                            </span>
                          </div>
                          <CapacityBar
                            allocated={emp.allocatedHours}
                            capacity={emp.contractedHours}
                            status={emp.status}
                          />
                        </div>
                      </td>

                      {/* Status Cell */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusChip status={emp.status} size="sm" />
                      </td>

                      {/* Tasks Cell */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                        <div className="font-medium text-[#1E2A26]">
                          {emp.activeTasks} active
                        </div>
                        <div className={isOverdue ? 'text-[#C4613F] font-medium' : 'text-[#7E9C7A]'}>
                          {isOverdue ? `${emp.overdueTasks} overdue` : 'On track'}
                        </div>
                      </td>

                      {/* Next Deadline Cell */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#1E2A26]">
                        {emp.nextDeadline || '—'}
                      </td>

                      {/* Project Cell */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#6B6A60]">
                        {emp.project || 'General'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 bg-[#F7F3EB]/50 border-t border-[#DDD4C4] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6B6A60]">
            <div>Showing all {employees.length} people · {totalTasks} active tasks</div>
            <div className="font-medium text-[#1E2A26]">
              {totalAllocated} hrs allocated / {totalCapacity} hrs capacity
            </div>
          </div>
        </div>
      )}

      {/* Bottom Explanatory Callouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <div className="p-5 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-card space-y-2">
          <h3 className="font-heading text-base font-normal text-[#1E2A26]">
            Read the balance, not just the average.
          </h3>
          <p className="text-xs text-[#6B6A60] leading-relaxed">
            96% team utilization hides 24 excess hours and 38 unallocated hours. Rebalancing can reduce pressure without adding headcount.
          </p>
        </div>

        <div className="p-5 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-card space-y-2">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-[#6B6A60]">
            How allocation is calculated
          </h4>
          <p className="text-xs text-[#6B6A60] leading-relaxed">
            Estimated task hours ÷ available working hours. The marker on each bar shows contracted capacity. Leave reduces available hours.
          </p>
        </div>
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Team Workload"
        subtitle="Narrow down team members by status or workload pressure."
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setStatusFilter('all');
                setShowFilterModal(false);
                toast.info('Filters cleared.');
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowFilterModal(false);
                toast.success('Filters applied.');
              }}
            >
              Apply filters
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'critical', 'overloaded', 'stretched', 'balanced', 'spare'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-2 text-xs font-medium rounded-[4px] border text-left transition-colors ${
                    statusFilter === st
                      ? 'bg-[#234236] text-white border-[#234236]'
                      : 'bg-[#FBF8F2] text-[#1E2A26] border-[#DDD4C4] hover:bg-[#F2ECE0]'
                  }`}
                >
                  {st === 'all' ? 'All statuses' : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TeamWorkloadPage;
