import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  AlertCircle,
  AlertTriangle,
  Info,
  MoreHorizontal,
  ArrowRight,
  Plus,
  Clock,
  Archive,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { Dropdown } from '../components/ui/Dropdown';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { SkeletonCard } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';
import { ScheduleMeetingModal } from '../components/modals/ScheduleMeetingModal';
import { ReassignTaskModal } from '../components/modals/ReassignTaskModal';
import { alertService } from '../services/alertService';

export function AlertsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'archived'
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(6);
  const [totalCount, setTotalCount] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [ruleName, setRuleName] = useState('Capacity warning rule');
  const [ruleThreshold, setRuleThreshold] = useState('115');
  const [ruleSeverity, setRuleSeverity] = useState('needs-attention');

  // Menu popover tracking
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await alertService.getAlerts({
        tab: activeTab,
        severity: selectedSeverity,
      });
      setAlerts(res.alerts);
      setUnreadCount(res.unreadCount);
      setTotalCount(res.totalCount);
    } catch (err) {
      setError(err.message || 'Failed to load alerts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [activeTab, selectedSeverity]);

  const handleMarkAllRead = async () => {
    try {
      await alertService.markAllAlertsRead();
      toast.success('All alerts marked as read.');
      fetchAlerts();
    } catch (err) {
      toast.error('Failed to mark alerts as read.');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await alertService.markAlertRead(id);
      toast.info('Alert marked as read.');
      setOpenMenuId(null);
      fetchAlerts();
    } catch (err) {
      toast.error('Failed to update alert.');
    }
  };

  const handleSnooze = async (id) => {
    try {
      await alertService.snoozeAlert(id, 24);
      toast.info('Alert snoozed for 24 hours.');
      setOpenMenuId(null);
      fetchAlerts();
    } catch (err) {
      toast.error('Failed to snooze alert.');
    }
  };

  const handleArchive = async (id) => {
    try {
      await alertService.archiveAlert(id);
      toast.info('Alert archived.');
      setOpenMenuId(null);
      fetchAlerts();
    } catch (err) {
      toast.error('Failed to archive alert.');
    }
  };

  const handleActionClick = (alert) => {
    alertService.markAlertRead(alert.id);
    if (alert.actionLabel === 'Schedule 1:1') {
      setIsScheduleOpen(true);
    } else if (alert.actionLabel === 'Review suggestion') {
      setIsReassignOpen(true);
    } else if (alert.actionRoute) {
      navigate(alert.actionRoute);
    } else if (alert.actionLabel === 'Review workload') {
      navigate('/team');
    } else if (alert.actionLabel === 'Rebalance tasks') {
      navigate('/rebalancer');
    } else if (alert.actionLabel === 'View employee') {
      navigate('/team/asha-patel');
    } else if (alert.actionLabel === 'Open planner') {
      navigate('/planner');
    }
  };

  const handleAddRuleSubmit = async (e) => {
    e.preventDefault();
    try {
      await alertService.addAlertRule({
        name: ruleName,
        threshold: Number(ruleThreshold),
        severity: ruleSeverity,
      });
      toast.success(`Rule "${ruleName}" created successfully.`);
      setIsAddRuleOpen(false);
    } catch (err) {
      toast.error('Failed to create alert rule.');
    }
  };

  const severityOptions = [
    { value: 'all', label: 'All severities' },
    { value: 'critical', label: 'Critical only' },
    { value: 'needs-attention', label: 'Needs attention' },
    { value: 'awareness', label: 'For your awareness' },
  ];

  const tabs = [
    { id: 'all', label: 'All alerts', count: totalCount },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'archived', label: 'Archived' },
  ];

  const criticalAlerts = alerts.filter((a) => a.category === 'critical');
  const needsAttentionAlerts = alerts.filter((a) => a.category === 'needs-attention');
  const awarenessAlerts = alerts.filter((a) => a.category === 'awareness');

  const renderAlertCard = (alert, icon) => (
    <div
      key={alert.id}
      className={`p-4 rounded-[4px] border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative ${
        alert.isRead
          ? 'bg-[#FBF8F2]/70 border-[#DDD4C4] opacity-85'
          : 'bg-[#FBF8F2] border-[#DDD4C4] shadow-card'
      }`}
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] mb-0.5">
            <span className="font-semibold text-[#1E2A26] uppercase tracking-wider">
              {alert.sender}
            </span>
            <span className="text-[#6B6A60]">{alert.time}</span>
            {!alert.isRead && (
              <span className="text-[10px] font-semibold text-[#234236] uppercase tracking-wider bg-[#EAF0E9] px-1.5 py-0.2 rounded-[2px]">
                UNREAD
              </span>
            )}
          </div>
          <h4 className="text-sm font-medium text-[#1E2A26] leading-snug">
            {alert.title}
          </h4>
          <p className="text-xs text-[#6B6A60] mt-0.5 leading-relaxed">
            {alert.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 relative">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleActionClick(alert)}
          className="text-xs"
        >
          {alert.actionLabel}
        </Button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenuId(openMenuId === alert.id ? null : alert.id)}
            className="p-1.5 text-[#6B6A60] hover:text-[#1E2A26] rounded-[4px] hover:bg-[#EAE4D8] focus:outline-none focus:ring-2 focus:ring-[#B8862F]"
            aria-label="Alert actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {openMenuId === alert.id && (
            <div className="absolute right-0 mt-1 w-44 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-modal py-1 z-30 text-xs">
              {!alert.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(alert.id)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#F2ECE0] flex items-center gap-2 text-[#1E2A26]"
                >
                  <Check className="w-3.5 h-3.5 text-[#7E9C7A]" />
                  <span>Mark as read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSnooze(alert.id)}
                className="w-full text-left px-3 py-1.5 hover:bg-[#F2ECE0] flex items-center gap-2 text-[#1E2A26]"
              >
                <Clock className="w-3.5 h-3.5 text-[#D4A537]" />
                <span>Snooze 24 hours</span>
              </button>
              <button
                type="button"
                onClick={() => handleArchive(alert.id)}
                className="w-full text-left px-3 py-1.5 hover:bg-[#F2ECE0] flex items-center gap-2 text-[#7A2E3A]"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive alert</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-[#6B6A60] uppercase mb-1">
            PEOPLE OPERATIONS / DESIGN TEAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading text-[#1E2A26] font-normal tracking-tight">
            The signals worth your attention.
          </h1>
          <p className="text-xs text-[#6B6A60] mt-1.5">
            {unreadCount} unread alerts · Your daily view of pressure, progress, and possibilities.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            onClick={() => setIsAddRuleOpen(true)}
            className="gap-1.5 text-xs"
            icon={Plus}
          >
            Add rule
          </Button>
          <Button
            variant="primary"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="gap-1.5 text-xs"
            icon={Check}
          >
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Controls: Tabs & Severity dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDD4C4] pb-3">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id)}
          variant="pill"
        />

        <Dropdown
          options={severityOptions}
          value={selectedSeverity}
          onChange={(val) => setSelectedSeverity(val)}
          className="w-full sm:w-48"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAlerts} />
      ) : alerts.length === 0 ? (
        <div className="p-8 text-center bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] text-xs text-[#6B6A60]">
          No alerts found for the selected view.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Critical Section */}
          {criticalAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-l-2 border-[#7A2E3A] pl-2.5">
                <h3 className="font-heading text-lg font-normal text-[#1E2A26]">
                  Critical · {criticalAlerts.length}
                </h3>
                <span className="text-xs text-[#6B6A60]">Respond today</span>
              </div>
              <div className="space-y-2.5">
                {criticalAlerts.map((a) =>
                  renderAlertCard(a, <AlertCircle className="w-4 h-4 text-[#7A2E3A]" />)
                )}
              </div>
            </div>
          )}

          {/* Needs attention Section */}
          {needsAttentionAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-l-2 border-[#D4A537] pl-2.5">
                <h3 className="font-heading text-lg font-normal text-[#1E2A26]">
                  Needs attention · {needsAttentionAlerts.length}
                </h3>
                <span className="text-xs text-[#6B6A60]">Review this week</span>
              </div>
              <div className="space-y-2.5">
                {needsAttentionAlerts.map((a) =>
                  renderAlertCard(a, <AlertTriangle className="w-4 h-4 text-[#D4A537]" />)
                )}
              </div>
            </div>
          )}

          {/* For your awareness Section */}
          {awarenessAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-l-2 border-[#4F7A7F] pl-2.5">
                <h3 className="font-heading text-lg font-normal text-[#1E2A26]">
                  For your awareness · {awarenessAlerts.length}
                </h3>
                <span className="text-xs text-[#6B6A60]">Planning and opportunities</span>
              </div>
              <div className="space-y-2.5">
                {awarenessAlerts.map((a) =>
                  renderAlertCard(a, <Info className="w-4 h-4 text-[#4F7A7F]" />)
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer info & Notification link */}
      <div className="p-4 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6B6A60]">
        <div>You receive a daily digest at 09:00 and immediate critical alerts.</div>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="text-[#1E2A26] font-medium hover:underline inline-flex items-center gap-1"
        >
          <span>Manage notification preferences</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modals */}
      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSuccess={fetchAlerts}
      />

      <ReassignTaskModal
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        onSuccess={fetchAlerts}
      />

      {/* Add Alert Rule Modal */}
      <Modal
        isOpen={isAddRuleOpen}
        onClose={() => setIsAddRuleOpen(false)}
        title="Add automated alert rule"
        subtitle="Configure real-time notifications when workloads or overtime cross thresholds."
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsAddRuleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddRuleSubmit}>
              Save rule
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddRuleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">Rule Name</label>
            <Input value={ruleName} onChange={(e) => setRuleName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1">Capacity % threshold</label>
              <Input type="number" value={ruleThreshold} onChange={(e) => setRuleThreshold(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1">Severity</label>
              <select
                value={ruleSeverity}
                onChange={(e) => setRuleSeverity(e.target.value)}
                className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] px-3.5 py-2 text-sm text-[#1E2A26] focus:ring-2 focus:ring-[#B8862F]"
              >
                <option value="critical">Critical</option>
                <option value="needs-attention">Needs attention</option>
                <option value="awareness">For your awareness</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AlertsPage;
