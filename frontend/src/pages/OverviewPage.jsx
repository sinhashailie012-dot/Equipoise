import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { StatusChip } from '../components/ui/StatusChip';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { DatePicker } from '../components/ui/DatePicker';
import { SkeletonCard } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { BurnoutGauge } from '../components/charts/BurnoutGauge';
import { OvertimeBarChart } from '../components/charts/OvertimeBarChart';
import { workloadService } from '../services/workloadService';
import { getHeatmapColor } from '../utils/workload';

export function OverviewPage() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('2–8 Nov 2026');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async (range = dateRange) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await workloadService.getOverviewData(range);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load team overview data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(dateRange);
  }, [dateRange]);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-[#E7E1D4]/40 animate-pulse rounded-[4px]" />
          <div className="h-72 bg-[#E7E1D4]/40 animate-pulse rounded-[4px]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error} onRetry={() => loadData(dateRange)} />;
  }

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-[#6B6A60] uppercase mb-1">
            PEOPLE OPERATIONS / DESIGN TEAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading text-[#1E2A26] font-normal tracking-tight">
            A clearer view of your team.
          </h1>
          <p className="text-xs text-[#6B6A60] mt-1.5">
            Thursday, 5 November 2026 · A little attention today can make next week better.
          </p>
        </div>
        <div>
          <DatePicker
            value={dateRange}
            onChange={(val) => setDateRange(val)}
          />
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Team utilization"
          value={data.kpis.teamUtilization.value}
          note={data.kpis.teamUtilization.note}
          onClick={() => navigate('/team')}
        />
        <KpiCard
          title="At-risk employees"
          value={data.kpis.atRiskEmployees.value}
          note={data.kpis.atRiskEmployees.note}
          dotColor="#C4613F"
          onClick={() => navigate('/burnout')}
        />
        <KpiCard
          title="Overdue tasks"
          value={data.kpis.overdueTasks.value}
          note={data.kpis.overdueTasks.note}
          dotColor="#D4A537"
          onClick={() => navigate('/team')}
        />
        <KpiCard
          title="Spare capacity"
          value={data.kpis.spareCapacity.value}
          note={data.kpis.spareCapacity.note}
          dotColor="#4F7A7F"
          onClick={() => navigate('/rebalancer')}
        />
      </div>

      {/* Row 1: Heatmap (2/3) + Burnout Gauge (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload Heatmap */}
        <div className="lg:col-span-2 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-normal text-[#1E2A26]">
                Workload, at a glance
              </h2>
              <span className="text-xs text-[#6B6A60]">8-week view</span>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs text-[#1E2A26]">
                <thead>
                  <tr className="border-b border-[#DDD4C4] text-[#6B6A60] text-[11px]">
                    <th className="text-left py-2 font-normal pr-4 whitespace-nowrap">
                      Hours / 40h capacity
                    </th>
                    {data.heatmap.weeks.map((week, idx) => (
                      <th key={idx} className="text-center py-2 px-1 font-normal whitespace-nowrap">
                        {week}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD4C4]/50">
                  {data.heatmap.rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => navigate(`/team/${row.id}`)}
                      className="cursor-pointer hover:bg-[#F4EFE6]/60 transition-colors group"
                    >
                      <td className="py-2.5 pr-4 text-xs font-medium text-[#1E2A26] whitespace-nowrap group-hover:text-[#234236] group-hover:underline">
                        {row.name}
                      </td>
                      {row.hours.map((hrs, colIdx) => {
                        const cellColor = getHeatmapColor(hrs, 40);
                        return (
                          <td key={colIdx} className="py-2.5 px-1 text-center">
                            <span
                              className="inline-block w-8 py-1 rounded-[2px] font-medium text-[11px]"
                              style={{
                                backgroundColor: cellColor.bgColor,
                                color: cellColor.textColor,
                              }}
                            >
                              {hrs}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-4 mt-2 border-t border-[#DDD4C4] text-[11px] text-[#6B6A60]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-[#4F7A7F]" />
              <span>&lt;80%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-[#7E9C7A]" />
              <span>80–100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-[#D4A537]" />
              <span>101–110%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-[#C4613F]" />
              <span>111–125%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-[#7A2E3A]" />
              <span>&gt;125%</span>
            </div>
          </div>
        </div>

        {/* Team Burnout Risk Gauge Card */}
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-lg font-normal text-[#1E2A26] mb-2">
              Team burnout risk
            </h2>
            <div className="py-2">
              <BurnoutGauge
                score={data.teamBurnoutRisk.score}
                maxScore={100}
                label="Elevated"
                trend={data.teamBurnoutRisk.change}
              />
            </div>
            <p className="text-xs text-[#6B6A60] leading-relaxed mt-4">
              {data.teamBurnoutRisk.insight}
            </p>
          </div>

          <div className="pt-4 border-t border-[#DDD4C4] space-y-2">
            <Button
              variant="secondary"
              onClick={() => navigate('/burnout')}
              className="w-full gap-1.5 text-xs"
              icon={ArrowUpRight}
              iconPosition="left"
            >
              Open risk center
            </Button>
            <p className="text-[10px] text-[#8D8C82] text-center">
              Work-pattern indicator, not a medical assessment.
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Needs attention (1/2) + Overtime climbing (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Attention List */}
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-normal text-[#1E2A26]">
                Needs attention
              </h2>
              <span className="text-xs text-[#6B6A60]">
                {data.needsAttention.length} people
              </span>
            </div>

            <div className="space-y-3">
              {data.needsAttention.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-3 rounded-[4px] border border-[#DDD4C4] bg-[#FBF8F2] hover:bg-[#F4EFE6]/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      initials={person.initials}
                      name={person.name}
                      size="md"
                    />
                    <div>
                      <div className="text-xs md:text-sm font-medium text-[#1E2A26]">
                        {person.name}
                      </div>
                      <div className="text-[11px] text-[#6B6A60]">
                        {person.allocated} · {person.overdue}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusChip status={person.status} size="sm" />
                    <button
                      type="button"
                      onClick={() => navigate(`/team/${person.id}`)}
                      className="text-xs text-[#1E2A26] font-medium hover:text-[#234236] inline-flex items-center gap-1"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overtime is Climbing Chart */}
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading text-lg font-normal text-[#1E2A26]">
                Overtime is climbing
              </h2>
              <span className="text-xs text-[#6B6A60]">Hours / week</span>
            </div>
            <OvertimeBarChart data={data.overtimeHistory.map(d => ({ label: d.week, value: d.hours }))} />
          </div>
          <p className="text-xs text-[#6B6A60] pt-3 border-t border-[#DDD4C4]">
            24 excess hours this week, concentrated in 3 people.
          </p>
        </div>
      </div>

      {/* Bottom Rebalance Banner */}
      <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading text-base font-normal text-[#1E2A26]">
            {data.recommendation.title}
          </h3>
          <p className="text-xs text-[#6B6A60] mt-0.5">
            {data.recommendation.body}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate(data.recommendation.actionRoute)}
          className="gap-2 text-xs shrink-0 w-full sm:w-auto"
          icon={ArrowRight}
          iconPosition="left"
        >
          {data.recommendation.actionLabel}
        </Button>
      </div>
    </div>
  );
}

export default OverviewPage;
