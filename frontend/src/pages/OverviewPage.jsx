import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, ArrowUpRight } from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { BurnoutGauge } from '../components/charts/BurnoutGauge';
import { OvertimeBarChart } from '../components/charts/OvertimeBarChart';
import { useApp } from '../context/AppContext';
import { heatmapEmployees, weekLabels, getHeatmapColor } from '../data/metrics';

export function OverviewPage() {
  const navigate = useNavigate();
  const { employees } = useApp();

  const totalAllocated = employees.reduce((acc, e) => acc + e.allocatedHours, 0);
  const totalContracted = employees.reduce((acc, e) => acc + e.contractedHours, 0);
  const teamUtilization = Math.round((totalAllocated / totalContracted) * 100);

  const atRiskCount = employees.filter(e => e.riskScore >= 60).length;
  const overdueCount = employees.reduce((acc, e) => acc + e.overdueTasks, 0);
  const spareCapacityHrs = employees
    .filter(e => e.allocatedHours < e.contractedHours)
    .reduce((acc, e) => acc + (e.contractedHours - e.allocatedHours), 0);

  // Top 3 at-risk people for "Needs attention"
  const needsAttentionList = [...employees]
    .filter(e => e.status !== 'balanced' && e.status !== 'spare')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase mb-1">
            PEOPLE OPERATIONS / DESIGN TEAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink-primary font-normal tracking-tight">
            A clearer view of your team.
          </h1>
          <p className="text-xs text-ink-secondary mt-1.5">
            Thursday, 5 November 2026 · A little attention today can make next week better.
          </p>
        </div>
        <div>
          <Button variant="secondary" className="gap-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-ink-muted" />
            <span>2–8 Nov 2026</span>
          </Button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Team utilization"
          value={`${teamUtilization}%`}
          subtext={`${totalAllocated} of ${totalContracted} hrs allocated`}
          dotColor="#1E2A26"
        />
        <MetricCard
          title="At-risk employees"
          value={`${atRiskCount} of 8`}
          subtext="Risk score above 60"
          dotColor="#C3542F"
        />
        <MetricCard
          title="Overdue tasks"
          value={overdueCount}
          subtext="Across 3 people"
          dotColor="#D4A537"
        />
        <MetricCard
          title="Spare capacity"
          value={`${spareCapacityHrs} hrs`}
          subtext="Available across 4 people"
          dotColor="#4F7A7F"
        />
      </div>

      {/* Grid: Heatmap + Burnout Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap (2 cols) */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border-subtle p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif text-ink-primary">
              Workload, at a glance
            </h2>
            <span className="text-xs text-ink-muted">8-week view</span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border-subtle/80 text-[11px] text-ink-muted">
                  <th className="py-2 pr-3 font-normal">Hours / 40h capacity</th>
                  {weekLabels.map((wk, i) => (
                    <th key={i} className="py-2 px-1.5 text-center font-normal whitespace-nowrap">
                      {wk}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/40">
                {heatmapEmployees.map((emp, i) => (
                  <tr key={i} className="hover:bg-card-subtle/50 transition-colors">
                    <td className="py-2.5 pr-3 font-medium text-ink-primary whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/workload/${emp.name.toLowerCase().replace(' ', '-')}`)}
                        className="hover:underline text-left"
                      >
                        {emp.name}
                      </button>
                    </td>
                    {emp.values.map((val, idx) => (
                      <td key={idx} className="py-1 px-1 text-center">
                        <div
                          className={`w-8 h-7 mx-auto flex items-center justify-center rounded font-sans text-xs ${getHeatmapColor(val)}`}
                        >
                          {val}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-5 pt-3 border-t border-border-subtle/60 text-[11px] text-ink-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#DEE8E6]" />
              <span>&lt;80%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#E6EBDF]" />
              <span>80–100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#EFE4C9]" />
              <span>101–110%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#F0DED5]" />
              <span>111–125%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#EADADF]" />
              <span>&gt;125%</span>
            </div>
          </div>
        </div>

        {/* Burnout Risk Card (1 col) */}
        <div className="bg-card rounded-xl border border-border-subtle p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-serif text-ink-primary mb-4">
              Team burnout risk
            </h2>
            <BurnoutGauge score={58} />
          </div>

          <div className="space-y-4 mt-4">
            <p className="text-xs text-ink-secondary leading-relaxed">
              Sustained overtime is the strongest signal. Start with Marcus and Asha.
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate('/burnout')}
              className="w-full gap-2 text-xs py-2 bg-card-subtle"
            >
              <span>Open risk center</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted" />
            </Button>
            <div className="text-[11px] text-ink-muted text-center pt-1 border-t border-border-subtle/60">
              Work-pattern indicator, not a medical assessment.
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Needs attention + Overtime is climbing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs attention */}
        <div className="bg-card rounded-xl border border-border-subtle p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif text-ink-primary">
                Needs attention
              </h2>
              <span className="text-xs text-ink-muted">3 people</span>
            </div>

            <div className="space-y-3">
              {needsAttentionList.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card-subtle border border-border-subtle"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      initials={emp.initials}
                      name={emp.name}
                      bgColor={emp.avatarBg}
                      textColor={emp.avatarText}
                    />
                    <div>
                      <div className="text-sm font-medium text-ink-primary">{emp.name}</div>
                      <div className="text-xs text-ink-muted">
                        {emp.allocatedHours} hrs allocated · {emp.overdueTasks} overdue
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={emp.status} size="sm" />
                    <button
                      onClick={() => navigate(`/workload/${emp.id}`)}
                      className="text-xs text-ink-primary font-medium hover:underline flex items-center gap-1"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overtime is climbing */}
        <div className="bg-card rounded-xl border border-border-subtle p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-serif text-ink-primary">
                Overtime is climbing
              </h2>
              <span className="text-xs text-ink-muted">Hours / week</span>
            </div>
            <OvertimeBarChart />
          </div>
          <div className="text-xs text-ink-muted mt-3 pt-2 border-t border-border-subtle/60">
            24 excess hours this week, concentrated in 3 people.
          </div>
        </div>
      </div>

      {/* Bottom Action Banner */}
      <div className="bg-[#E4EDE8] rounded-xl border border-[#C2D9CF] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-brand-900">
            A small move could make a real difference.
          </h3>
          <p className="text-xs text-brand-800/90 mt-0.5">
            Move 6 hrs from Asha to Daniel without changing the Atlas deadline.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/rebalancer')}
          className="gap-2 text-xs shrink-0 py-2.5"
        >
          <span>Review rebalance</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

