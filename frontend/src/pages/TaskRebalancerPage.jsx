import React, { useState } from 'react';
import { Sparkles, Undo2, Calendar, GripVertical, Check, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { StatusBadge } from '../components/ui/StatusBadge';
import { WorkloadBar } from '../components/ui/WorkloadBar';
import { Avatar } from '../components/ui/Avatar';
import { useApp } from '../context/AppContext';
import { useModals } from '../context/ModalContext';
import { cn } from '../lib/utils';

export function TaskRebalancerPage() {
  const { employees, tasks, reassignTask, undoLastReassign, pendingChanges, setPendingChanges } = useApp();
  const { openReassignModal } = useModals();

  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [changesApplied, setChangesApplied] = useState(false);

  // The 3 people for Atlas redesign
  const asha = employees.find(e => e.id === 'asha-patel') || employees[1];
  const daniel = employees.find(e => e.id === 'daniel-kim') || employees[6];
  const james = employees.find(e => e.id === 'james-okafor') || employees[4];

  const atlasPeople = [asha, daniel, james];

  const ashaTasks = tasks.filter(t => t.assigneeId === asha.id);
  const danielTasks = tasks.filter(t => t.assigneeId === daniel.id);
  const jamesTasks = tasks.filter(t => t.assigneeId === james.id);

  const totalAtlasHours = atlasPeople.reduce((acc, p) => acc + p.allocatedHours, 0);
  const totalAtlasCapacity = atlasPeople.reduce((acc, p) => acc + p.contractedHours, 0);

  const handleAcceptSuggestion = () => {
    reassignTask('task-2', 'daniel-kim');
    setSuggestionDismissed(true);
  };

  const handleApplyChanges = () => {
    setChangesApplied(true);
    setPendingChanges(false);
    setTimeout(() => setChangesApplied(false), 2000);
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
            Share the load, thoughtfully.
          </h1>
          <p className="text-xs text-ink-secondary mt-1.5">
            Preview a better balance before making changes. Your team's work stays in view.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={undoLastReassign}
            className="gap-1.5 text-xs py-2"
          >
            <Undo2 className="w-3.5 h-3.5 text-ink-muted" />
            <span>Undo</span>
          </Button>
          <Button
            variant="primary"
            onClick={handleApplyChanges}
            disabled={!pendingChanges}
            className="text-xs py-2"
          >
            {changesApplied ? 'Changes saved!' : 'Apply changes'}
          </Button>
        </div>
      </div>

      {/* Filter and helper bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Select
            value="Atlas redesign · 3 people"
            options={['Atlas redesign · 3 people', 'Beacon launch · 3 people', 'Core platform · 2 people']}
            className="py-1.5"
          />
          <Button variant="secondary" className="gap-2 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-ink-muted" />
            <span>2–8 Nov 2026</span>
          </Button>
        </div>
        <div className="text-ink-muted italic">
          Drag tasks between people to preview a healthier balance.
        </div>
      </div>

      {/* Smart Suggestion Banner */}
      {!suggestionDismissed && asha.allocatedHours > 42 && (
        <div className="p-4 sm:p-5 bg-[#EFF5F1] rounded-xl border border-[#C2D9CF] shadow-subtle space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-white border border-[#C2D9CF] text-brand-800 shrink-0">
                <Sparkles className="w-5 h-5 text-brand-700" />
              </div>
              <div>
                <h3 className="text-base font-serif font-medium text-ink-primary">
                  Move 6 hrs from Asha to Daniel
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Research synthesis · Atlas redesign · Due 6 Nov
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSuggestionDismissed(true)}
                className="text-xs bg-white"
              >
                Dismiss
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptSuggestion}
                className="gap-1.5 text-xs bg-brand-800 hover:bg-brand-700"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-primary border-t border-[#C2D9CF]/60 pt-2 font-mono">
            <div>
              <span className="font-sans text-ink-secondary">Asha: </span>
              {asha.allocatedHours} → {asha.allocatedHours - 6} hrs · {Math.round((asha.allocatedHours / 40) * 100)}% → {Math.round(((asha.allocatedHours - 6) / 40) * 100)}%
              <span className="mx-3 text-border-subtle font-sans">|</span>
              <span className="font-sans text-ink-secondary">Daniel: </span>
              {daniel.allocatedHours} → {daniel.allocatedHours + 6} hrs · {Math.round((daniel.allocatedHours / 40) * 100)}% → {Math.round(((daniel.allocatedHours + 6) / 40) * 100)}%
            </div>
            <div className="text-[11px] text-ink-muted font-sans">
              Skill match: research synthesis · No deadline change
            </div>
          </div>
        </div>
      )}

      {/* 3 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Asha Patel */}
        <div className="flex flex-col bg-card rounded-xl border border-border-subtle p-4 space-y-4">
          <div className="space-y-2 pb-3 border-b border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar
                  initials={asha.initials}
                  name={asha.name}
                  bgColor={asha.avatarBg}
                  textColor={asha.avatarText}
                />
                <div>
                  <div className="font-medium text-sm text-ink-primary">{asha.name}</div>
                  <div className="text-[11px] text-ink-muted">
                    {ashaTasks.length} tasks · Atlas redesign
                  </div>
                </div>
              </div>
              <StatusBadge status={asha.status} size="sm" />
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-ink-primary">
                  {asha.allocatedHours} / {asha.contractedHours} hrs
                </span>
                <span className="text-ink-muted">
                  {Math.round((asha.allocatedHours / asha.contractedHours) * 100)}%
                </span>
              </div>
              <WorkloadBar
                allocated={asha.allocatedHours}
                capacity={asha.contractedHours}
                status={asha.status}
              />
            </div>
          </div>

          {/* Asha's Tasks */}
          <div className="space-y-2.5 flex-1">
            {ashaTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => openReassignModal(t)}
                className={cn(
                  "p-3 rounded-lg border transition-all cursor-pointer group select-none",
                  t.isSuggested
                    ? "bg-[#FEFBF3] border-ochre-400 shadow-sm ring-1 ring-ochre-400/50"
                    : "bg-card-subtle border-border-subtle hover:border-[#C5BCAB]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-ink-muted/50 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-ink-primary group-hover:text-brand-800">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-ink-muted mt-0.5">
                        Due {t.due} · {t.status}
                      </div>
                      {t.isSuggested && (
                        <div className="text-[10px] font-medium text-ochre-700 mt-1 flex items-center gap-1">
                          <span>Suggested move → Daniel Kim</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-mono font-medium text-ink-secondary">
                      {t.hours}h
                    </span>
                    <button className="text-ink-muted hover:text-ink-primary p-0.5 rounded">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Drop Target */}
            <div className="border border-dashed border-[#DFD8CB] rounded-lg p-3 text-center text-xs text-ink-muted hover:bg-card-hover/40 transition-colors">
              Drop a task here
            </div>
          </div>
        </div>

        {/* Column 2: Daniel Kim */}
        <div className="flex flex-col bg-card rounded-xl border border-border-subtle p-4 space-y-4">
          <div className="space-y-2 pb-3 border-b border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar
                  initials={daniel.initials}
                  name={daniel.name}
                  bgColor={daniel.avatarBg}
                  textColor={daniel.avatarText}
                />
                <div>
                  <div className="font-medium text-sm text-ink-primary">{daniel.name}</div>
                  <div className="text-[11px] text-ink-muted">
                    {danielTasks.length} tasks · Atlas redesign
                  </div>
                </div>
              </div>
              <StatusBadge status={daniel.status} size="sm" />
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-ink-primary">
                  {daniel.allocatedHours} / {daniel.contractedHours} hrs
                </span>
                <span className="text-ink-muted">
                  {Math.round((daniel.allocatedHours / daniel.contractedHours) * 100)}%
                </span>
              </div>
              <WorkloadBar
                allocated={daniel.allocatedHours}
                capacity={daniel.contractedHours}
                status={daniel.status}
              />
            </div>
          </div>

          {/* Daniel's Tasks */}
          <div className="space-y-2.5 flex-1">
            {danielTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => openReassignModal(t)}
                className="p-3 rounded-lg border border-border-subtle bg-card-subtle hover:border-[#C5BCAB] transition-all cursor-pointer group select-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-ink-muted/50 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-ink-primary group-hover:text-brand-800">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-ink-muted mt-0.5">
                        Due {t.due} · {t.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-mono font-medium text-ink-secondary">
                      {t.hours}h
                    </span>
                    <button className="text-ink-muted hover:text-ink-primary p-0.5 rounded">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Drop Target */}
            <div className="border border-dashed border-[#DFD8CB] rounded-lg p-3 text-center text-xs text-ink-muted hover:bg-card-hover/40 transition-colors">
              Drop a task here
            </div>
          </div>
        </div>

        {/* Column 3: James Okafor */}
        <div className="flex flex-col bg-card rounded-xl border border-border-subtle p-4 space-y-4">
          <div className="space-y-2 pb-3 border-b border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar
                  initials={james.initials}
                  name={james.name}
                  bgColor={james.avatarBg}
                  textColor={james.avatarText}
                />
                <div>
                  <div className="font-medium text-sm text-ink-primary">{james.name}</div>
                  <div className="text-[11px] text-ink-muted">
                    {jamesTasks.length} tasks · Atlas redesign
                  </div>
                </div>
              </div>
              <StatusBadge status={james.status} size="sm" />
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-ink-primary">
                  {james.allocatedHours} / {james.contractedHours} hrs
                </span>
                <span className="text-ink-muted">
                  {Math.round((james.allocatedHours / james.contractedHours) * 100)}%
                </span>
              </div>
              <WorkloadBar
                allocated={james.allocatedHours}
                capacity={james.contractedHours}
                status={james.status}
              />
            </div>
          </div>

          {/* James's Tasks */}
          <div className="space-y-2.5 flex-1">
            {jamesTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => openReassignModal(t)}
                className="p-3 rounded-lg border border-border-subtle bg-card-subtle hover:border-[#C5BCAB] transition-all cursor-pointer group select-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-ink-muted/50 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-ink-primary group-hover:text-brand-800">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-ink-muted mt-0.5">
                        Due {t.due} · {t.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-mono font-medium text-ink-secondary">
                      {t.hours}h
                    </span>
                    <button className="text-ink-muted hover:text-ink-primary p-0.5 rounded">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Drop Target */}
            <div className="border border-dashed border-[#DFD8CB] rounded-lg p-3 text-center text-xs text-ink-muted hover:bg-card-hover/40 transition-colors">
              Drop a task here
            </div>
          </div>
        </div>
      </div>

      {/* Rebalancer Footer */}
      <div className="p-4 bg-card rounded-lg border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-muted">
        <div>
          {totalAtlasHours} hrs across 3 people · {totalAtlasCapacity} hrs capacity · Estimates include team rituals
        </div>
        <div className="font-medium text-ink-primary">
          {pendingChanges ? '1 change pending review' : 'No changes applied'}
        </div>
      </div>
    </div>
  );
}

