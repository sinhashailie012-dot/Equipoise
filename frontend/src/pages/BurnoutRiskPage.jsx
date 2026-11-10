import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Avatar } from '../components/ui/Avatar';
import { useApp } from '../context/AppContext';
import { useModals } from '../context/ModalContext';

export function BurnoutRiskPage() {
  const navigate = useNavigate();
  const { employees, interventions } = useApp();
  const { openScheduleModal } = useModals();

  const atRiskPeople = employees.filter(e => e.riskScore >= 60).sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase mb-1">
            PEOPLE OPERATIONS / DESIGN TEAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink-primary font-normal tracking-tight">
            Notice early. Respond with care.
          </h1>
          <p className="text-xs text-ink-secondary mt-1.5">
            Work-pattern signals help you start a conversation, not make a diagnosis.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            const el = document.getElementById('intervention-tracker');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs py-2.5 self-start sm:self-auto"
        >
          Review interventions
        </Button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Employees at risk"
          value="3 of 8"
          subtext="Risk scores above 60"
          dotColor="#C3542F"
        />
        <MetricCard
          title="Critical signals"
          value="2"
          subtext="Marcus and Asha score ≥80"
          dotColor="#B93856"
        />
        <MetricCard
          title="Open interventions"
          value="3"
          subtext="2 need attention today"
          dotColor="#D4A537"
        />
        <MetricCard
          title="Team risk score"
          value="58 / 100"
          subtext="Elevated · +6 this week"
          dotColor="#D4A537"
        />
      </div>

      {/* Prioritize a Conversation */}
      <div className="bg-card rounded-xl border border-border-subtle p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif text-ink-primary">
            Prioritize a conversation
          </h2>
          <span className="text-xs text-ink-muted">Ranked by risk score</span>
        </div>

        <div className="divide-y divide-border-subtle/50">
          {atRiskPeople.map((emp) => (
            <div
              key={emp.id}
              className="py-4 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Score and Employee info */}
              <div className="flex items-center gap-6">
                <div className="w-16">
                  <div className="text-3xl font-serif text-ink-primary font-normal leading-none">
                    {emp.riskScore}
                  </div>
                  <div className="text-[10px] uppercase font-semibold text-ink-muted mt-1">
                    OUT OF 100
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar
                    initials={emp.initials}
                    name={emp.name}
                    bgColor={emp.avatarBg}
                    textColor={emp.avatarText}
                  />
                  <div>
                    <button
                      onClick={() => navigate(`/workload/${emp.id}`)}
                      className="font-medium text-sm text-ink-primary hover:underline text-left block"
                    >
                      {emp.name}
                    </button>
                    <div className="text-xs text-ink-muted">{emp.role}</div>
                  </div>
                </div>
              </div>

              {/* Signals & Suggested Action */}
              <div className="flex-1 md:px-6">
                <div className="text-xs text-ink-muted">
                  {emp.signals?.join(' · ') || 'Above capacity'}
                </div>
                <div className="text-xs font-medium text-ink-primary mt-0.5">
                  {emp.suggestedAction}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={emp.status} size="sm" />
                {emp.id === 'asha-patel' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openScheduleModal(emp)}
                    className="text-xs py-1.5"
                  >
                    Schedule 1:1
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/workload/${emp.id}`)}
                    className="text-xs py-1.5"
                  >
                    Review plan
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Driving Risk + Care Practice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What's driving risk */}
        <div className="bg-card rounded-xl border border-border-subtle p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-serif text-ink-primary mb-4">
              What's driving risk
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium text-ink-primary">Sustained overtime</span>
                  <span className="text-ink-secondary">3 of 8 people</span>
                </div>
                <div className="w-full h-2 bg-[#EAE4D8] rounded-full overflow-hidden">
                  <div className="w-[37.5%] h-full bg-[#C3542F] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium text-ink-primary">Deadline compression</span>
                  <span className="text-ink-secondary">3 of 8 people</span>
                </div>
                <div className="w-full h-2 bg-[#EAE4D8] rounded-full overflow-hidden">
                  <div className="w-[37.5%] h-full bg-[#D4A537] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium text-ink-primary">Limited recovery time</span>
                  <span className="text-ink-secondary">2 of 8 people</span>
                </div>
                <div className="w-full h-2 bg-[#EAE4D8] rounded-full overflow-hidden">
                  <div className="w-[25%] h-full bg-[#4F7A7F] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-ink-muted mt-6 pt-3 border-t border-border-subtle/60">
            Signals may overlap. Risk uses an 8-week rolling window and is refreshed each morning.
          </div>
        </div>

        {/* Care is a practice */}
        <div className="bg-card rounded-xl border border-border-subtle p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              CARE IS A PRACTICE
            </div>
            <h3 className="text-xl font-serif text-ink-primary font-normal mb-3">
              Start with curiosity, not a score.
            </h3>

            <blockquote className="text-xs italic text-ink-secondary bg-card-subtle p-3 rounded-lg border border-border-subtle/80 leading-relaxed mb-4">
              "How is the workload feeling this week? What could we change or take off your plate?"
            </blockquote>

            <ol className="text-xs text-ink-primary space-y-2 list-decimal list-inside font-medium">
              <li>Agree on one immediate change.</li>
              <li>Protect uninterrupted recovery time.</li>
              <li>Check back within seven days.</li>
            </ol>
          </div>

          <div className="text-[11px] text-ink-muted mt-4 pt-3 border-t border-border-subtle/60">
            Only managers and workspace admins can view individual risk signals. Never use this score for performance evaluation.
          </div>
        </div>
      </div>

      {/* Intervention Tracker */}
      <div id="intervention-tracker" className="bg-card rounded-xl border border-border-subtle overflow-hidden">
        <div className="p-5 pb-3 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-lg font-serif text-ink-primary">
            Intervention tracker
          </h2>
          <span className="text-xs text-ink-muted">This week</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-card-subtle/40 text-[10px] uppercase tracking-wider text-ink-muted">
                <th className="py-2.5 px-5 font-semibold">Person</th>
                <th className="py-2.5 px-4 font-semibold">Agreed Next Step</th>
                <th className="py-2.5 px-4 font-semibold">Owner</th>
                <th className="py-2.5 px-4 font-semibold">Due</th>
                <th className="py-2.5 px-5 font-semibold">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {interventions.map((item) => (
                <tr key={item.id} className="hover:bg-card-subtle/40 transition-colors">
                  <td className="py-3 px-5 font-medium text-ink-primary">
                    <button
                      onClick={() => navigate(`/workload/${item.personId}`)}
                      className="hover:underline text-left"
                    >
                      {item.person}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-ink-secondary">{item.agreedStep}</td>
                  <td className="py-3 px-4 text-ink-muted">{item.owner}</td>
                  <td className="py-3 px-4 text-ink-secondary">{item.due}</td>
                  <td className="py-3 px-5 text-brand-800 font-medium">{item.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

