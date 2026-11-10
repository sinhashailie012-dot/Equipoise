import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle, AlertTriangle, Info, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useApp } from '../context/AppContext';
import { useModals } from '../context/ModalContext';
import { cn } from '../lib/utils';

export function AlertsPage() {
  const navigate = useNavigate();
  const { alerts, markAllAlertsRead, markAlertRead, employees } = useApp();
  const { openScheduleModal, openReassignModal } = useModals();

  const [activeTab, setActiveTab] = useState('all'); // all, unread, archived
  const [selectedSeverity, setSelectedSeverity] = useState('All severities');

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const handleAction = (alert) => {
    markAlertRead(alert.id);
    if (alert.actionType === 'modal') {
      if (alert.modalType === 'schedule-1-1') {
        const emp = employees.find(e => e.id === alert.personId) || employees[1];
        openScheduleModal(emp);
      } else if (alert.modalType === 'reassign-task') {
        openReassignModal();
      }
    } else if (alert.actionRoute) {
      navigate(alert.actionRoute);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (activeTab === 'unread' && a.isRead) return false;
    if (activeTab === 'archived' && !a.isArchived) return false;
    if (selectedSeverity !== 'All severities') {
      if (selectedSeverity === 'Critical' && a.category !== 'critical') return false;
      if (selectedSeverity === 'Needs attention' && a.category !== 'needs-attention') return false;
      if (selectedSeverity === 'For your awareness' && a.category !== 'awareness') return false;
    }
    return true;
  });

  const criticalGroup = filteredAlerts.filter(a => a.category === 'critical');
  const needsAttentionGroup = filteredAlerts.filter(a => a.category === 'needs-attention');
  const awarenessGroup = filteredAlerts.filter(a => a.category === 'awareness');

  const renderAlertCard = (alert, icon) => (
    <div
      key={alert.id}
      className={cn(
        "p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        alert.isRead
          ? "bg-card/60 border-border-subtle/60 opacity-80"
          : "bg-card border-border-subtle shadow-subtle"
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-ink-muted uppercase">
            <span>{alert.sender}</span>
            <span>·</span>
            <span>{alert.time}</span>
            {!alert.isRead && (
              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                UNREAD
              </span>
            )}
          </div>
          <h4 className="text-sm font-medium text-ink-primary mt-1">
            {alert.title}
          </h4>
          <p className="text-xs text-ink-secondary mt-0.5">
            {alert.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleAction(alert)}
          className="text-xs py-1.5 bg-card-subtle"
        >
          {alert.actionLabel}
        </Button>
        <button
          onClick={() => markAlertRead(alert.id)}
          className="text-ink-muted hover:text-ink-primary p-1.5 rounded hover:bg-[#EAE4D8]/60 transition-colors"
          title="Options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase mb-1">
            PEOPLE OPERATIONS / DESIGN TEAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink-primary font-normal tracking-tight">
            The signals worth your attention.
          </h1>
          <p className="text-xs text-ink-secondary mt-1.5">
            {unreadCount} unread alerts · Your daily view of pressure, progress, and possibilities.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={markAllAlertsRead}
          className="gap-1.5 text-xs py-2 self-start sm:self-auto"
        >
          <Check className="w-3.5 h-3.5 text-brand-700" />
          <span>Mark all as read</span>
        </Button>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
            All alerts · {alerts.length}
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-medium transition-colors",
              activeTab === 'unread'
                ? "bg-brand-800 text-white"
                : "bg-card text-ink-secondary border border-border-subtle hover:bg-card-hover"
            )}
          >
            Unread · {unreadCount}
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-medium transition-colors",
              activeTab === 'archived'
                ? "bg-brand-800 text-white"
                : "bg-card text-ink-secondary border border-border-subtle hover:bg-card-hover"
            )}
          >
            Archived
          </button>
        </div>

        <Select
          value={selectedSeverity}
          onChange={setSelectedSeverity}
          options={['All severities', 'Critical', 'Needs attention', 'For your awareness']}
          className="py-1.5 text-xs"
        />
      </div>

      {/* Critical Alerts Section */}
      {criticalGroup.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-l-2 border-red-700 pl-2.5">
            <h3 className="text-base font-serif text-ink-primary font-medium">
              Critical · {criticalGroup.length}
            </h3>
            <span className="text-xs text-ink-muted">Respond today</span>
          </div>
          <div className="space-y-2.5">
            {criticalGroup.map(a =>
              renderAlertCard(a, <AlertCircle className="w-5 h-5 text-red-700" />)
            )}
          </div>
        </div>
      )}

      {/* Needs Attention Alerts Section */}
      {needsAttentionGroup.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-l-2 border-amber-600 pl-2.5">
            <h3 className="text-base font-serif text-ink-primary font-medium">
              Needs attention · {needsAttentionGroup.length}
            </h3>
            <span className="text-xs text-ink-muted">Review this week</span>
          </div>
          <div className="space-y-2.5">
            {needsAttentionGroup.map(a =>
              renderAlertCard(a, <AlertTriangle className="w-5 h-5 text-amber-600" />)
            )}
          </div>
        </div>
      )}

      {/* For your awareness Section */}
      {awarenessGroup.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-l-2 border-[#4F7A7F] pl-2.5">
            <h3 className="text-base font-serif text-ink-primary font-medium">
              For your awareness · {awarenessGroup.length}
            </h3>
            <span className="text-xs text-ink-muted">Planning and opportunities</span>
          </div>
          <div className="space-y-2.5">
            {awarenessGroup.map(a =>
              renderAlertCard(a, <Info className="w-5 h-5 text-[#4F7A7F]" />)
            )}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-border-subtle/80 text-xs text-ink-muted">
        <div>You receive a daily digest at 09:00 and immediate critical alerts.</div>
        <button
          onClick={() => navigate('/settings')}
          className="text-ink-primary font-medium hover:underline flex items-center gap-1"
        >
          <span>Manage notification preferences</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

