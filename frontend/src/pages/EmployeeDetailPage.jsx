import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeftRight, Plus, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Avatar } from '../components/ui/Avatar';
import { MetricCard } from '../components/ui/MetricCard';
import { useApp } from '../context/AppContext';
import { useModals } from '../context/ModalContext';

export function EmployeeDetailPage() {
  const { id = 'asha-patel' } = useParams();
  const navigate = useNavigate();
  const { employees, tasks, addManagerNote } = useApp();
  const { openReassignModal, openScheduleModal } = useModals();

  const employee = employees.find(e => e.id === id) || employees[1]; // default to Asha Patel
  const employeeTasks = tasks.filter(t => t.assigneeId === employee.id);

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');

  const handleSaveNote = () => {
    if (newNote.trim()) {
      addManagerNote(employee.id, newNote);
      setNewNote('');
      setIsAddingNote(false);
    }
  };

  const weeklyHistory = employee.weeklyAllocation || [34, 36, 38, 40, 44, 46, 50, 48];
  const weekLabels = ['14 Sep', '21 Sep', '28 Sep', '5 Oct', '12 Oct', '19 Oct', '26 Oct', '2 Nov'];
  const overtimeHistory = employee.overtimeHistory || [0, 0, 0, 0, 4, 6, 10, 8];

  const getBarColor = (val) => {
    if (val < 32) return '#4F7A7F'; // spare
    if (val <= 40) return '#659670'; // balanced
    if (val <= 44) return '#D4A537'; // stretched
    if (val <= 50) return '#C3542F'; // overloaded
    return '#B93856'; // critical
  };

  return (
    <div className="space-y-6">
      {/* Top back button + Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/workload')}
            className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-primary mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to team workload</span>
          </button>
          <div className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase mb-1">
            PEOPLE OPERATIONS / DESIGN TEAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink-primary font-normal tracking-tight">
            {employee.name}
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            People / {employee.name} · Week of 2–8 November 2026
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={() => openReassignModal(employeeTasks[1] || employeeTasks[0])}
            className="gap-2 text-xs py-2"
          >
            <ArrowLeftRight className="w-4 h-4 text-ink-muted" />
            <span>Reassign task</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => openScheduleModal(employee)}
            className="gap-2 text-xs py-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule 1:1</span>
          </Button>
        </div>
      </div>

      {/* Employee Identity Card */}
      <div className="p-4 bg-card rounded-xl border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar
            initials={employee.initials}
            name={employee.name}
            size="lg"
            bgColor={employee.avatarBg}
            textColor={employee.avatarText}
          />
          <div>
            <div className="text-base font-medium text-ink-primary">{employee.name}</div>
            <div className="text-xs text-ink-secondary">
              {employee.role} · {employee.department} · Reports to {employee.reportsTo}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={employee.status} />
          <span className="text-xs text-ink-muted font-mono">{employee.email}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="This week"
          value={`${employee.allocatedHours} hrs`}
          subtext={`${Math.round((employee.allocatedHours / employee.contractedHours) * 100)}% of 40 hr capacity`}
          dotColor="#C3542F"
        />
        <MetricCard
          title="Burnout risk"
          value={`${employee.riskScore} / 100`}
          subtext="Critical · +8 this week"
          dotColor="#B93856"
        />
        <MetricCard
          title="Overtime"
          value={`${Math.max(0, employee.allocatedHours - employee.contractedHours)} hrs`}
          subtext="3 consecutive weeks ≥6 hrs"
          dotColor="#C3542F"
        />
        <MetricCard
          title="Next planned leave"
          value="16 Nov"
          subtext="2 days · approved"
          dotColor="#1E2A26"
        />
      </div>

      {/* Two-Column Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Eight Weeks of Workload */}
          <div className="bg-card rounded-xl border border-border-subtle p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif text-ink-primary">
                Eight weeks of workload
              </h2>
              <span className="text-xs text-ink-muted">Allocated hours</span>
            </div>

            <div className="h-44 flex items-end justify-between gap-2 pt-4 pb-2 border-b border-border-subtle">
              {weeklyHistory.map((val, idx) => {
                const heightPct = Math.round((val / 60) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-[11px] font-sans text-ink-primary font-medium mb-1">
                      {val}h
                    </span>
                    <div
                      className="w-full max-w-[42px] rounded-t-sm transition-all duration-300"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: getBarColor(val),
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[11px] text-ink-muted pt-2">
              {weekLabels.map((lbl, idx) => (
                <span key={idx} className="flex-1 text-center truncate">
                  {lbl}
                </span>
              ))}
            </div>

            <div className="text-xs text-ink-muted mt-3 pt-2 border-t border-border-subtle/60">
              40 hrs contracted weekly · Above capacity for 4 weeks
            </div>
          </div>

          {/* Current Tasks */}
          <div className="bg-card rounded-xl border border-border-subtle p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif text-ink-primary">
                Current tasks
              </h2>
              <span className="text-xs text-ink-muted">
                {employeeTasks.length} tasks · {employee.allocatedHours} hrs
              </span>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border-subtle text-[10px] uppercase tracking-wider text-ink-muted">
                    <th className="py-2.5 font-semibold">Task / Project</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Hours</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Due</th>
                    <th className="py-2.5 pl-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50">
                  {employeeTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-card-subtle/50 transition-colors">
                      <td className="py-3">
                        <div className="font-medium text-ink-primary text-sm">{t.title}</div>
                        <div className="text-[11px] text-ink-muted">{t.project}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-ink-primary">
                        {t.hours}h
                      </td>
                      <td className="py-3 px-3 text-center text-ink-secondary">
                        {t.due}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        {t.status === 'Overdue' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-700 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>! Overdue</span>
                          </span>
                        ) : (
                          <span className="text-xs text-ink-secondary">
                            {t.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Burnout Indicators */}
          <div className="bg-card rounded-xl border border-border-subtle p-5">
            <h2 className="text-lg font-serif text-ink-primary mb-3">
              Burnout indicators
            </h2>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-serif text-ink-primary">
                {employee.riskScore} / 100
              </div>
              <StatusBadge status={employee.status} size="sm" />
            </div>

            <div className="space-y-2.5 text-xs border-t border-border-subtle pt-3">
              <div className="flex justify-between items-center">
                <span className="text-ink-secondary">Sustained overtime</span>
                <span className="font-medium text-red-700">High</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-secondary">Deadline pressure</span>
                <span className="font-medium text-red-700">High</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-secondary">Recovery time</span>
                <span className="font-medium text-amber-700">Low</span>
              </div>
            </div>

            <div className="text-[11px] text-ink-muted mt-4 pt-2 border-t border-border-subtle/60">
              Signals from work patterns, not a health diagnosis.
            </div>
          </div>

          {/* Manager Notes */}
          <div className="bg-card rounded-xl border border-border-subtle p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-serif text-ink-primary">
                Manager notes
              </h2>
              <span className="text-xs text-ink-muted">Private</span>
            </div>

            {employee.managerNotes && (
              <blockquote className="text-xs text-ink-primary italic bg-card-subtle p-3 rounded-lg border border-border-subtle/80 leading-relaxed">
                "{employee.managerNotes}"
                <div className="not-italic text-[11px] text-ink-muted mt-2 font-normal font-sans">
                  Emma Chen · {employee.managerNoteDate || '4 Nov, 15:30'}
                </div>
              </blockquote>
            )}

            {isAddingNote ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a private manager note..."
                  rows={3}
                  className="w-full text-xs p-2 bg-[#FBF8F2] border border-[#DFD8CB] rounded focus-visible:focus-ochre font-sans"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setIsAddingNote(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSaveNote}>
                    Save note
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAddingNote(true)}
                className="mt-3 w-full gap-1.5 text-xs py-1.5 bg-card-subtle"
              >
                <Plus className="w-3.5 h-3.5 text-ink-muted" />
                <span>Add note</span>
              </Button>
            )}
          </div>

          {/* Leave History */}
          <div className="bg-card rounded-xl border border-border-subtle p-5">
            <h2 className="text-lg font-serif text-ink-primary mb-3">
              Leave history
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle/60">
                <div>
                  <div className="font-medium text-ink-primary">16–17 Nov · Annual leave</div>
                </div>
                <span className="text-brand-800 font-medium">Approved</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle/60">
                <div className="text-ink-secondary">7 Aug · Annual leave · 1 day</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-ink-secondary">15–19 Jun · Annual leave · 5 days</div>
              </div>
            </div>

            <div className="text-[11px] text-ink-muted mt-4 pt-2 border-t border-border-subtle/60">
              90 days since the last full day off
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Card: Overtime History */}
      <div className="bg-card rounded-xl border border-border-subtle p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif text-ink-primary">
            Overtime history
          </h2>
          <span className="text-xs text-ink-muted">Hours above weekly capacity</span>
        </div>

        <div className="h-32 flex items-end justify-between gap-2 pt-2 pb-2 border-b border-border-subtle">
          {overtimeHistory.map((val, idx) => {
            const heightPct = val === 0 ? 3 : Math.round((val / 15) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-[11px] font-sans text-ink-primary font-medium mb-1">
                  {val}
                </span>
                <div
                  className="w-full max-w-[42px] rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: val === 0 ? '#C2BAB0' : '#C3542F',
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-[11px] text-ink-muted pt-2">
          {weekLabels.map((lbl, idx) => (
            <span key={idx} className="flex-1 text-center truncate">
              {lbl}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

