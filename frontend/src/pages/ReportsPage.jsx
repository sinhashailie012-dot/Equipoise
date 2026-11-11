import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileText, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { KpiCard } from '../components/ui/KpiCard';
import { Dropdown } from '../components/ui/Dropdown';
import { CapacityBar } from '../components/ui/CapacityBar';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';
import { DemandCapacityChart, RiskTrendChart } from '../components/charts/DemandCapacityChart';
import { reportService } from '../services/reportService';

export function ReportsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [selectedTeam, setSelectedTeam] = useState('design-team');
  const [selectedRange, setSelectedRange] = useState('last-8-weeks');
  const [selectedProject, setSelectedProject] = useState('all');

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await reportService.getReportData({
        team: selectedTeam,
        range: selectedRange,
        project: selectedProject,
      });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load report analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTeam, selectedRange, selectedProject]);

  const handleExportCSV = async () => {
    try {
      await reportService.exportCsv(data);
      toast.success('Report exported to CSV.');
    } catch (err) {
      toast.error('Failed to export CSV.');
    }
  };

  const handleExportPDF = () => {
    toast.info('Preparing print / PDF export...');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const teamOptions = [
    { value: 'design-team', label: 'Design team · 8 people' },
    { value: 'engineering', label: 'Engineering · 12 people' },
    { value: 'all', label: 'All teams · 26 people' },
  ];

  const rangeOptions = [
    { value: 'last-8-weeks', label: 'Last 8 weeks' },
    { value: 'last-4-weeks', label: 'Last 4 weeks' },
    { value: 'last-12-weeks', label: 'Last 12 weeks' },
  ];

  const projectOptions = [
    { value: 'all', label: 'All projects' },
    { value: 'atlas-redesign', label: 'Atlas redesign' },
    { value: 'beacon-launch', label: 'Beacon launch' },
    { value: 'core-platform', label: 'Core platform' },
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-[#E7E1D4]/40 animate-pulse rounded-[4px]" />
          <div className="h-64 bg-[#E7E1D4]/40 animate-pulse rounded-[4px]" />
        </div>
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
            Look beyond the busy week.
          </h1>
          <p className="text-xs text-[#6B6A60] mt-1.5">
            Workload & wellbeing report · {data.dateRange}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto no-print">
          <Button
            variant="secondary"
            onClick={handleExportCSV}
            className="gap-2 text-xs"
            icon={Download}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            onClick={handleExportPDF}
            className="gap-2 text-xs"
            icon={FileText}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs no-print">
        <div className="flex flex-wrap items-center gap-2.5">
          <Dropdown
            options={teamOptions}
            value={selectedTeam}
            onChange={(val) => setSelectedTeam(val)}
          />

          <Dropdown
            options={rangeOptions}
            value={selectedRange}
            onChange={(val) => setSelectedRange(val)}
          />

          <Dropdown
            options={projectOptions}
            value={selectedProject}
            onChange={(val) => setSelectedProject(val)}
          />
        </div>

        <div className="text-xs text-[#6B6A60] self-end sm:self-auto">
          Prepared 5 Nov 2026 · Live estimates
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Average utilization"
          value={data.kpis.averageUtilization.value}
          note={data.kpis.averageUtilization.note}
        />
        <KpiCard
          title="Current overtime"
          value={data.kpis.currentOvertime.value}
          note={data.kpis.currentOvertime.note}
          dotColor="#C4613F"
        />
        <KpiCard
          title="Current at-risk people"
          value={data.kpis.currentAtRisk.value}
          note={data.kpis.currentAtRisk.note}
          dotColor="#7A2E3A"
        />
        <KpiCard
          title="Team risk trend"
          value={data.kpis.teamRiskTrend.value}
          note={data.kpis.teamRiskTrend.note}
          dotColor="#D4A537"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand is nearing capacity */}
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading text-lg font-normal text-[#1E2A26]">
                Demand is nearing capacity
              </h2>
              <span className="text-xs text-[#6B6A60]">Allocated hours / 320 available</span>
            </div>
            <DemandCapacityChart data={data.demandChart.map(d => ({ label: d.week, value: d.hours }))} />
          </div>
          <p className="text-xs text-[#6B6A60] pt-3 border-t border-[#DDD4C4] mt-2">
            This week's utilization is 96%, down 2 percentage points from last week. The average still conceals individual overload.
          </p>
        </div>

        {/* Risk is rising with overtime */}
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading text-lg font-normal text-[#1E2A26]">
                Risk is rising with overtime
              </h2>
              <span className="text-xs text-[#6B6A60]">Team risk score / 100</span>
            </div>
            <RiskTrendChart data={data.riskChart.map(r => ({ label: r.week, value: r.score }))} />
          </div>
          <p className="text-xs text-[#6B6A60] pt-3 border-t border-[#DDD4C4] mt-2">
            Risk increased 22 points in eight weeks. Sustained overtime is the primary contributing signal.
          </p>
        </div>
      </div>

      {/* THE TAKEAWAY Banner */}
      <div className="p-6 bg-[#234236] text-white rounded-[4px] shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] font-semibold tracking-wider text-[#A9BCB4] uppercase">
            THE TAKEAWAY
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-normal text-white leading-snug whitespace-pre-line">
            {data.takeaway.headline}
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 max-w-lg">
          <p className="text-xs text-[#C2CEC9] leading-relaxed">
            {data.takeaway.body}
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate(data.takeaway.actionRoute)}
            className="text-xs shrink-0 whitespace-nowrap bg-white text-[#234236] border-white hover:bg-[#F2ECE0]"
            icon={ArrowUpRight}
            iconPosition="left"
          >
            {data.takeaway.actionLabel}
          </Button>
        </div>
      </div>

      {/* Where the pressure sits Table */}
      <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#DDD4C4] flex items-center justify-between">
          <h2 className="font-heading text-base font-normal text-[#1E2A26]">
            Where the pressure sits
          </h2>
          <span className="text-xs text-[#6B6A60]">Week of 2 November</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DDD4C4] bg-[#F7F3EB]/60 text-[11px] uppercase tracking-wider text-[#6B6A60]">
                <th className="py-2.5 px-4 font-semibold">PROJECT</th>
                <th className="py-2.5 px-4 font-semibold min-w-[180px]">ALLOCATION / CAPACITY</th>
                <th className="py-2.5 px-4 font-semibold">UTILIZATION</th>
                <th className="py-2.5 px-4 font-semibold">OVERDUE</th>
                <th className="py-2.5 px-4 font-semibold">PEOPLE AT RISK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD4C4]/50">
              {data.pressureTable.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => navigate('/projects')}
                  className="cursor-pointer hover:bg-[#F4EFE6]/60 transition-colors group"
                >
                  <td className="py-3 px-4 font-medium text-[#1E2A26] group-hover:text-[#234236] group-hover:underline">
                    {row.project}
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="text-[11px] text-[#1E2A26]">{row.allocation}</div>
                      <CapacityBar
                        allocated={row.allocated}
                        capacity={row.capacity}
                        status={row.statusVariant}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-[#1E2A26]">
                    {row.utilization}
                  </td>
                  <td className="py-3 px-4 text-[#6B6A60]">
                    {row.overdue}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#1E2A26]">
                    {row.peopleAtRisk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Note */}
      <p className="text-[11px] text-[#6B6A60] leading-relaxed pt-2">
        Methodology: estimates include delivery work and team rituals. Available hours account for contracted schedules and approved leave. Risk is a work-pattern indicator, not a clinical measure. Individual data is visible only to authorized managers.
      </p>
    </div>
  );
}

export default ReportsPage;
