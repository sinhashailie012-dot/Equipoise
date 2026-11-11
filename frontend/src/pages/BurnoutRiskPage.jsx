import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { KpiCard } from '../components/ui/KpiCard';
import { StatusChip } from '../components/ui/StatusChip';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';
import { ScheduleMeetingModal } from '../components/modals/ScheduleMeetingModal';
import { burnoutService } from '../services/burnoutService';

export function BurnoutRiskPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal
  const [selectedPersonFor1on1, setSelectedPersonFor1on1] = useState(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedPlanPerson, setSelectedPlanPerson] = useState(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await burnoutService.getBurnoutRiskData();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load burnout risk data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpen1on1 = (person) => {
    setSelectedPersonFor1on1({
      id: person.id,
      name: person.name,
      initials: person.initials,
      role: person.role,
    });
    setIsScheduleOpen(true);
  };

  const handle1on1Success = () => {
    loadData();
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
        <SkeletonTable rows={4} cols={5} />
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
            Notice early. Respond with care.
          </h1>
          <p className="text-xs text-[#6B6A60] mt-1.5">
            Work-pattern signals help you start a conversation, not make a diagnosis.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            const el = document.getElementById('intervention-tracker');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            toast.info('Viewing active interventions.');
          }}
          className="text-xs self-start sm:self-auto"
        >
          Review interventions
        </Button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Employees at risk"
          value={data.kpis.employeesAtRisk.value}
          note={data.kpis.employeesAtRisk.note}
          dotColor="#C4613F"
        />
        <KpiCard
          title="Critical signals"
          value={data.kpis.criticalSignals.value}
          note={data.kpis.criticalSignals.note}
          dotColor="#7A2E3A"
        />
        <KpiCard
          title="Open interventions"
          value={data.kpis.openInterventions.value}
          note={data.kpis.openInterventions.note}
          dotColor="#D4A537"
        />
        <KpiCard
          title="Team risk score"
          value={data.kpis.teamRiskScore.value}
          note={data.kpis.teamRiskScore.note}
          dotColor="#D4A537"
        />
      </div>

      {/* Prioritize a conversation */}
      <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDD4C4] pb-3">
          <h2 className="font-heading text-lg font-normal text-[#1E2A26]">
            Prioritize a conversation
          </h2>
          <span className="text-xs text-[#6B6A60]">
            Ranked by risk score
          </span>
        </div>

        <div className="space-y-3">
          {data.conversations.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F4EFE6]/60 transition-colors"
            >
              {/* Score + Profile + Signals */}
              <div className="flex items-start sm:items-center gap-4 flex-1">
                <div className="text-center shrink-0 pr-3 border-r border-[#DDD4C4]">
                  <div className="font-heading text-3xl font-normal text-[#1E2A26]">
                    {item.score}
                  </div>
                  <div className="text-[10px] uppercase font-semibold text-[#6B6A60]">
                    OUT OF 100
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar initials={item.initials} name={item.name} size="md" />
                  <div>
                    <div
                      onClick={() => navigate(`/team/${item.id}`)}
                      className="text-xs md:text-sm font-medium text-[#1E2A26] hover:underline cursor-pointer"
                    >
                      {item.name}
                    </div>
                    <div className="text-[11px] text-[#6B6A60]">
                      {item.role}
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block pl-4 text-xs border-l border-[#DDD4C4] flex-1">
                  <div className="text-[#6B6A60]">{item.signals}</div>
                  <div className="font-medium text-[#1E2A26] mt-0.5">{item.recommendation}</div>
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                <StatusChip status={item.status} size="sm" />
                {item.actionType === 'schedule-1-1' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpen1on1(item)}
                    icon={Calendar}
                  >
                    Schedule 1:1
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedPlanPerson(item)}
                  >
                    Review plan
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row: What's driving risk & Care is a practice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What's driving risk */}
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-base font-normal text-[#1E2A26] mb-4">
              What's driving risk
            </h3>
            <div className="space-y-4">
              {data.drivers.map((driver, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1E2A26]">{driver.label}</span>
                    <span className="text-[#6B6A60]">{driver.count}</span>
                  </div>
                  <div className="w-full h-2 bg-[#EAE4D8] rounded-[2px] overflow-hidden">
                    <div
                      className="h-full rounded-[2px]"
                      style={{
                        width: `${driver.percentage * 2}%`,
                        backgroundColor: driver.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#6B6A60] pt-4 mt-4 border-t border-[#DDD4C4]">
            Signals may overlap. Risk uses an 8-week rolling window and is refreshed each morning.
          </p>
        </div>

        {/* Care is a practice */}
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-5 shadow-card flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#6B6A60]">
              Care is a practice
            </div>
            <h3 className="font-heading text-xl font-normal text-[#1E2A26]">
              Start with curiosity, not a score.
            </h3>
            <p className="text-xs text-[#1E2A26] italic bg-[#F4EFE6] p-3 rounded-[4px] border border-[#DDD4C4]">
              "How is the workload feeling this week? What could we change or take off your plate?"
            </p>
            <ol className="text-xs text-[#6B6A60] space-y-1.5 list-decimal pl-4">
              <li>Agree on one immediate change.</li>
              <li>Protect uninterrupted recovery time.</li>
              <li>Check back within seven days.</li>
            </ol>
          </div>
          <p className="text-[11px] text-[#8D8C82] pt-4 mt-4 border-t border-[#DDD4C4]">
            Only managers and workspace admins can view individual risk signals. Never use this score for performance evaluation.
          </p>
        </div>
      </div>

      {/* Intervention tracker */}
      <div id="intervention-tracker" className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#DDD4C4] flex items-center justify-between">
          <h2 className="font-heading text-base font-normal text-[#1E2A26]">
            Intervention tracker
          </h2>
          <span className="text-xs text-[#6B6A60]">This week</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DDD4C4] bg-[#F7F3EB]/60 text-[11px] uppercase tracking-wider text-[#6B6A60]">
                <th className="py-2.5 px-4 font-semibold">PERSON</th>
                <th className="py-2.5 px-4 font-semibold">AGREED NEXT STEP</th>
                <th className="py-2.5 px-4 font-semibold">OWNER</th>
                <th className="py-2.5 px-4 font-semibold">DUE</th>
                <th className="py-2.5 px-4 font-semibold">STATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD4C4]/50">
              {data.interventions.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/team/${row.personId}`)}
                  className="cursor-pointer hover:bg-[#F4EFE6]/60 transition-colors group"
                >
                  <td className="py-3 px-4 font-medium text-[#1E2A26] group-hover:text-[#234236] group-hover:underline">
                    {row.person}
                  </td>
                  <td className="py-3 px-4 text-[#1E2A26]">
                    {row.agreedStep}
                  </td>
                  <td className="py-3 px-4 text-[#6B6A60]">
                    {row.owner}
                  </td>
                  <td className="py-3 px-4 text-[#6B6A60]">
                    {row.due}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium border ${
                        row.state === 'Scheduled' || row.state === 'Completed'
                          ? 'bg-[#EAF0E9] text-[#375734] border-[#CCE0CB]'
                          : 'bg-[#FAF3E1] text-[#7B5E1A] border-[#EBDCBA]'
                      }`}
                    >
                      {row.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule 1:1 Modal */}
      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        employee={selectedPersonFor1on1 || undefined}
        onSuccess={handle1on1Success}
      />

      {/* Plan Review Modal */}
      <Modal
        isOpen={!!selectedPlanPerson}
        onClose={() => setSelectedPlanPerson(null)}
        title={`Workload Plan · ${selectedPlanPerson?.name}`}
        subtitle="Review action items and mitigation recommendations."
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSelectedPlanPerson(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                navigate(`/team/${selectedPlanPerson?.id}`);
              }}
            >
              Open employee detail
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs md:text-sm text-[#1E2A26]">
          <div className="p-3 bg-[#F4EFE6] rounded-[4px] border border-[#DDD4C4]">
            <div className="font-semibold text-[#1E2A26] mb-1">Recommended Action:</div>
            <div>{selectedPlanPerson?.recommendation}</div>
          </div>
          <p className="text-xs text-[#6B6A60] leading-relaxed">
            Sustained high utilization detected across previous sprint cycles. Consider redistributing pending backlog items in Task Rebalancer.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default BurnoutRiskPage;
