import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { MetricCard } from '../components/ui/MetricCard';
import { capacityWeeks, teamCapacityTimeline, upcomingLeaveList } from '../data/capacity';
import { cn } from '../lib/utils';

export function CapacityPlannerPage() {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState('Design team · 8 people');

  const getCellBarColor = (item) => {
    if (item.isLeave) return 'bg-[#4F7A7F]';
    if (item.status === 'critical') return 'bg-[#B93856]';
    if (item.status === 'overloaded') return 'bg-[#C3542F]';
    if (item.status === 'stretched') return 'bg-[#D4A537]';
    if (item.status === 'spare') return 'bg-[#4F7A7F]';
    return 'bg-[#659670]';
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
            Make space for what's next.
          </h1>
          <p className="text-xs text-ink-secondary mt-1.5">
            A six-week planning horizon · Committed work, known leave, and room to breathe.
          </p>
        </div>

        <Button
          variant="primary"
          className="gap-1.5 text-xs py-2.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add allocation</span>
        </Button>
      </div>

      {/* Filter and timeline selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-card p-3 rounded-lg border border-border-subtle">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedTeam}
            onChange={setSelectedTeam}
            options={['Design team · 8 people', 'Core team · 4 people']}
            className="py-1.5"
          />
          <Button variant="secondary" className="gap-2 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-ink-muted" />
            <span>2 Nov – 13 Dec 2026</span>
          </Button>
          <Button variant="secondary" className="py-1.5 text-xs">
            Today
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="secondary" className="py-1.5 text-xs font-medium">
            <span>Weeks</span>
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Current allocation"
          value="96%"
          subtext="Week of 2 November"
          dotColor="#1E2A26"
        />
        <MetricCard
          title="Next week"
          value="93%"
          subtext="296 of 320 hrs committed"
          dotColor="#1E2A26"
        />
        <MetricCard
          title="Known leave"
          value="24 hrs"
          subtext="3 days in this horizon"
          dotColor="#4F7A7F"
        />
        <MetricCard
          title="Capacity in 6 weeks"
          value="68 hrs"
          subtext="Uncommitted · week of 7 Dec"
          dotColor="#659670"
        />
      </div>

      {/* Timeline Matrix */}
      <div className="bg-card rounded-xl border border-border-subtle p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif text-ink-primary">
            Team capacity timeline
          </h2>
          <span className="text-xs text-ink-muted">Allocated / available hours</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border-subtle text-[11px] text-ink-muted">
                <th className="py-2.5 pr-4 font-semibold w-48">Employee</th>
                {capacityWeeks.map((wk, i) => (
                  <th key={i} className="py-2.5 px-2 text-center font-semibold whitespace-nowrap">
                    {wk}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {teamCapacityTimeline.map((emp, i) => (
                <tr key={i} className="hover:bg-card-subtle/50 transition-colors">
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => navigate(`/workload/${emp.employeeId}`)}
                      className="font-medium text-sm text-ink-primary hover:underline text-left block"
                    >
                      {emp.name}
                    </button>
                    <div className="text-[11px] text-ink-muted">{emp.project}</div>
                  </td>
                  {emp.schedule.map((item, idx) => {
                    const fillPct = Math.min(100, Math.round((item.hours / item.cap) * 100));
                    return (
                      <td key={idx} className="py-3 px-2 text-center">
                        <div className="flex flex-col items-center justify-center p-2 rounded bg-card-subtle border border-border-subtle/60 w-24 mx-auto">
                          <span className="font-mono text-xs font-medium text-ink-primary mb-1">
                            {item.leaveLabel || `${item.hours} / ${item.cap}h`}
                          </span>
                          <div className="w-full h-1 bg-[#EAE4D8] rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", getCellBarColor(item))}
                              style={{ width: `${fillPct}%` }}
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

        <div className="text-xs text-ink-muted mt-4 pt-3 border-t border-border-subtle/60">
          Hours shown include planned work and team rituals. <strong className="font-medium text-ink-primary">Leave is deducted from available capacity.</strong>
        </div>
      </div>

      {/* Bottom Split: Upcoming Leave + Before You Commit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Leave */}
        <div className="bg-card rounded-xl border border-border-subtle p-5">
          <h2 className="text-lg font-serif text-ink-primary mb-4">
            Upcoming leave
          </h2>

          <div className="space-y-3 text-xs">
            {upcomingLeaveList.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-card-subtle border border-border-subtle/60"
              >
                <div>
                  <div className="font-medium text-ink-primary text-sm">{item.name}</div>
                  <div className="text-ink-muted mt-0.5">
                    {item.dates} · {item.type} · {item.hours}
                  </div>
                </div>
                <span className="text-brand-800 font-medium">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Before You Commit */}
        <div className="bg-card rounded-xl border border-border-subtle p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              BEFORE YOU COMMIT
            </div>
            <h3 className="text-xl font-serif text-ink-primary font-normal mb-2">
              Protect the recovery window.
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Asha returns to a 24-hour week on 16 November. Keep Atlas handoff work with Daniel, rather than compressing it around her leave.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-border-subtle/60">
            <Button
              variant="secondary"
              onClick={() => navigate('/rebalancer')}
              className="gap-2 text-xs py-2 bg-card-subtle"
            >
              <span>Review Atlas allocations</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

