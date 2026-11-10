import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Calendar, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { StatusBadge } from '../components/ui/StatusBadge';
import { WorkloadBar } from '../components/ui/WorkloadBar';
import { Avatar } from '../components/ui/Avatar';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

export function TeamWorkloadPage() {
  const navigate = useNavigate();
  const { employees } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, at-risk, spare
  const [sortBy, setSortBy] = useState('highest');

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'at-risk') {
      return emp.riskScore >= 60 || emp.status === 'critical' || emp.status === 'overloaded';
    }
    if (activeTab === 'spare') {
      return emp.status === 'spare';
    }
    return true;
  });

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortBy === 'highest') {
      return b.allocatedHours - a.allocatedHours;
    }
    if (sortBy === 'lowest') {
      return a.allocatedHours - b.allocatedHours;
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const totalAllocated = employees.reduce((acc, e) => acc + e.allocatedHours, 0);
  const totalContracted = employees.reduce((acc, e) => acc + e.contractedHours, 0);
  const totalTasks = employees.reduce((acc, e) => acc + e.activeTasks, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase mb-1">
            PEOPLE OPERATIONS / DESIGN TEAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink-primary font-normal tracking-tight">
            Workload is a team conversation.
          </h1>
          <p className="text-xs text-ink-secondary mt-1.5">
            8 people · 320 contracted hours · Week of 2 November 2026
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/rebalancer')}
          className="gap-2 text-xs py-2.5 self-start sm:self-auto"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Rebalance tasks</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border-subtle">
        <div className="flex-1 max-w-sm">
          <SearchInput
            placeholder="Search people or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-1.5"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value="Design team · 8 people"
            options={['Design team · 8 people', 'Core team · 4 people', 'External · 2 people']}
            className="py-1.5 text-xs"
          />
          <Button variant="secondary" className="gap-2 text-xs py-1.5">
            <Calendar className="w-3.5 h-3.5 text-ink-muted" />
            <span>2–8 Nov 2026</span>
          </Button>
          <Button variant="secondary" className="gap-2 text-xs py-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-ink-muted" />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-medium transition-colors",
              activeTab === 'all'
                ? "bg-brand-800 text-white"
                : "bg-card text-ink-secondary border border-border-subtle hover:bg-card-hover"
            )}
          >
            All people · {employees.length}
          </button>
          <button
            onClick={() => setActiveTab('at-risk')}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-medium transition-colors",
              activeTab === 'at-risk'
                ? "bg-brand-800 text-white"
                : "bg-card text-ink-secondary border border-border-subtle hover:bg-card-hover"
            )}
          >
            At risk · 3
          </button>
          <button
            onClick={() => setActiveTab('spare')}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-medium transition-colors",
              activeTab === 'spare'
                ? "bg-brand-800 text-white"
                : "bg-card text-ink-secondary border border-border-subtle hover:bg-card-hover"
            )}
          >
            Spare capacity · 2
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-ink-primary font-medium focus:outline-none cursor-pointer"
          >
            <option value="highest">highest allocation first ↓</option>
            <option value="lowest">lowest allocation first ↑</option>
            <option value="name">name alphabetically</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card rounded-xl border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-card-subtle/50 text-[10px] uppercase tracking-wider text-ink-muted">
                <th className="py-3 px-5 font-semibold">Employee</th>
                <th className="py-3 px-4 font-semibold w-72">Weekly Allocation</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Tasks</th>
                <th className="py-3 px-4 font-semibold">Next Deadline</th>
                <th className="py-3 px-5 font-semibold">Project</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {sortedEmployees.map((emp) => {
                const pct = Math.round((emp.allocatedHours / emp.contractedHours) * 100);
                return (
                  <tr
                    key={emp.id}
                    onClick={() => navigate(`/workload/${emp.id}`)}
                    className="hover:bg-card-hover/40 transition-colors cursor-pointer group"
                  >
                    {/* Employee info */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={emp.initials}
                          name={emp.name}
                          bgColor={emp.avatarBg}
                          textColor={emp.avatarText}
                        />
                        <div>
                          <div className="font-medium text-sm text-ink-primary group-hover:text-brand-800 transition-colors">
                            {emp.name}
                          </div>
                          <div className="text-[11px] text-ink-muted">{emp.role}</div>
                        </div>
                      </div>
                    </td>

                    {/* Allocation Progress Bar */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-ink-primary">
                            {emp.allocatedHours} / {emp.contractedHours} hrs
                          </span>
                          <span className="text-ink-muted">{pct}%</span>
                        </div>
                        <WorkloadBar
                          allocated={emp.allocatedHours}
                          capacity={emp.contractedHours}
                          status={emp.status}
                        />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={emp.status} size="sm" />
                    </td>

                    {/* Tasks */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-ink-primary">
                        {emp.activeTasks} active
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        {emp.overdueTasks > 0 ? (
                          <span className="text-red-700 font-medium">
                            {emp.overdueTasks} overdue
                          </span>
                        ) : (
                          'On track'
                        )}
                      </div>
                    </td>

                    {/* Next Deadline */}
                    <td className="py-3.5 px-4 text-ink-secondary">
                      {emp.nextDeadline}
                    </td>

                    {/* Project */}
                    <td className="py-3.5 px-5 text-ink-secondary">
                      {emp.project}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-card-subtle/40 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-muted">
          <div>Showing all {filteredEmployees.length} people · {totalTasks} active tasks</div>
          <div className="font-medium text-ink-primary">
            {totalAllocated} hrs allocated / {totalContracted} hrs capacity
          </div>
        </div>
      </div>

      {/* Bottom Commentary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <h3 className="text-base font-serif text-ink-primary">
            Read the balance, not just the average.
          </h3>
          <p className="text-xs text-ink-secondary leading-relaxed">
            96% team utilization hides 24 excess hours and 38 unallocated hours. Rebalancing can reduce pressure without adding headcount.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wide">
            How allocation is calculated
          </h4>
          <p className="text-xs text-ink-muted leading-relaxed">
            Estimated task hours / available working hours. The marker on each bar shows contracted capacity. Leave reduces available hours.
          </p>
        </div>
      </div>
    </div>
  );
}

