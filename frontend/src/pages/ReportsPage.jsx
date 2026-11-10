import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileText, Calendar, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { MetricCard } from '../components/ui/MetricCard';
import { DemandCapacityChart, RiskTrendChart } from '../components/charts/DemandCapacityChart';
import { useApp } from '../context/AppContext';

export function ReportsPage() {
  const navigate = useNavigate();
  const { projects } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState('');

  const handleExportCSV = () => {
    setDownloadSuccess('CSV Export started...');
    setTimeout(() => setDownloadSuccess(''), 2500);
  };

  const handleExportPDF = () => {
    setDownloadSuccess('PDF Report generated...');
    setTimeout(() => setDownloadSuccess(''), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase mb-1">
            PEOPLE OPERATIONS / DESIGN TEAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink-primary font-normal tracking-tight">
            Look beyond the busy week.
          </h1>
          <p className="text-xs text-ink-secondary mt-1.5">
            Workload & wellbeing report · 14 September – 8 November 2026
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button variant="secondary" onClick={handleExportCSV} className="gap-2 text-xs py-2">
            <Download className="w-4 h-4 text-ink-muted" />
            <span>Export CSV</span>
          </Button>
          <Button variant="primary" onClick={handleExportPDF} className="gap-2 text-xs py-2">
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-2.5 bg-brand-50 border border-brand-200 text-brand-900 rounded text-xs">
          {downloadSuccess}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-card p-3 rounded-lg border border-border-subtle">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value="Design team · 8 people"
            options={['Design team · 8 people', 'Core team · 4 people']}
            className="py-1.5"
          />
          <Button variant="secondary" className="gap-2 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-ink-muted" />
            <span>Last 8 weeks</span>
          </Button>
          <Select
            value="All projects"
            options={['All projects', 'Atlas redesign', 'Beacon launch', 'Core platform']}
            className="py-1.5"
          />
        </div>
        <div className="text-ink-muted">
          Prepared 5 Nov 2026 · Live estimates
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Average utilization"
          value="90%"
          subtext="2,310 / 2,560 available hours"
          dotColor="#1E2A26"
        />
        <MetricCard
          title="Current overtime"
          value="24 hrs"
          subtext="Unchanged from last week"
          dotColor="#C3542F"
        />
        <MetricCard
          title="Current at-risk people"
          value="3"
          subtext="Up from 1 four weeks ago"
          dotColor="#B93856"
        />
        <MetricCard
          title="Team risk trend"
          value="+22 pts"
          subtext="36 → 58 over eight weeks"
          dotColor="#D4A537"
        />
      </div>

      {/* Two Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand is nearing capacity */}
        <div className="bg-card rounded-xl border border-border-subtle p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-serif text-ink-primary">
                Demand is nearing capacity
              </h2>
              <span className="text-xs text-ink-muted">Allocated hours / 320 available</span>
            </div>
            <DemandCapacityChart />
          </div>
          <div className="text-xs text-ink-secondary mt-3 pt-2 border-t border-border-subtle/60 leading-relaxed">
            This week's utilization is 96%, down 2 percentage points from last week. The average still conceals individual overload.
          </div>
        </div>

        {/* Risk is rising with overtime */}
        <div className="bg-card rounded-xl border border-border-subtle p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-serif text-ink-primary">
                Risk is rising with overtime
              </h2>
              <span className="text-xs text-ink-muted">Team risk score / 100</span>
            </div>
            <RiskTrendChart />
          </div>
          <div className="text-xs text-ink-secondary mt-3 pt-2 border-t border-border-subtle/60 leading-relaxed">
            Risk increased 22 points in eight weeks. Sustained overtime is the primary contributing signal.
          </div>
        </div>
      </div>

      {/* Takeaway Banner */}
      <div className="bg-brand-800 text-white rounded-xl p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-xl">
          <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-700 text-[#C2D9CF]">
            THE TAKEAWAY
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-normal leading-snug">
            The team isn't short on hours.<br />
            The hours are unevenly shared.
          </h3>
        </div>

        <div className="space-y-4 max-w-md lg:text-right">
          <p className="text-xs text-[#C2CEC9] leading-relaxed">
            38 unallocated hours sit alongside 24 excess hours. Start with the proposed 6-hour Atlas transfer, then review Beacon's scope.
          </p>
          <button
            onClick={() => navigate('/rebalancer')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-brand-900 rounded text-xs font-semibold hover:bg-gray-100 transition-colors"
          >
            <span>Open task rebalancer</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Where the pressure sits Table */}
      <div className="bg-card rounded-xl border border-border-subtle overflow-hidden">
        <div className="p-5 pb-3 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-lg font-serif text-ink-primary">
            Where the pressure sits
          </h2>
          <span className="text-xs text-ink-muted">Week of 2 November</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-card-subtle/40 text-[10px] uppercase tracking-wider text-ink-muted">
                <th className="py-2.5 px-5 font-semibold">Project</th>
                <th className="py-2.5 px-4 font-semibold w-64">Allocation / Capacity</th>
                <th className="py-2.5 px-4 font-semibold">Utilization</th>
                <th className="py-2.5 px-4 font-semibold">Overdue</th>
                <th className="py-2.5 px-5 font-semibold">People at risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-card-subtle/40 transition-colors">
                  <td className="py-3 px-5 font-medium text-ink-primary text-sm">
                    {proj.name}
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="text-xs text-ink-secondary">
                        {proj.weeklyAllocation} / {proj.weeklyCapacity} hrs
                      </div>
                      <div className="w-full h-1.5 bg-[#EAE4D8] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, proj.percentage)}%`,
                            backgroundColor: proj.accentColor,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-ink-primary">
                    {proj.percentage}%
                  </td>
                  <td className="py-3 px-4 text-ink-secondary">
                    {proj.overdueTasks} tasks
                  </td>
                  <td className="py-3 px-5">
                    {proj.atRiskPeople > 0 ? (
                      <span className="text-red-700 font-medium">
                        {proj.atRiskPeople} {proj.atRiskPeople === 1 ? 'person' : 'people'}
                      </span>
                    ) : (
                      <span className="text-ink-muted">0 people</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-card-subtle/30 border-t border-border-subtle text-xs text-ink-muted leading-relaxed">
          Methodology: estimates include delivery work and team rituals. Available hours account for contracted schedules and approved leave. Risk is a work-pattern indicator, not a clinical measure. Individual data is visible only to authorized managers.
        </div>
      </div>
    </div>
  );
}

