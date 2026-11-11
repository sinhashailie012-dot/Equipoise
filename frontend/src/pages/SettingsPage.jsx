import React, { useState, useEffect } from 'react';
import { Pencil, Plus, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { Dropdown } from '../components/ui/Dropdown';
import { StatusChip } from '../components/ui/StatusChip';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { SkeletonCard } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';
import { settingsService } from '../services/settingsService';

export function SettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'hours' | 'thresholds' | 'roles' | 'notifications'

  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [capacity, setCapacity] = useState('40 hours');
  const [timeZone, setTimeZone] = useState('London · GMT (UTC+0)');
  const [workdays, setWorkdays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [workdayStarts, setWorkdayStarts] = useState('09:00');
  const [workdayEnds, setWorkdayEnds] = useState('18:00');
  const [unpaidBreak, setUnpaidBreak] = useState('60 minutes');
  const [deductLeave, setDeductLeave] = useState(true);

  // Thresholds
  const [thresholds, setThresholds] = useState([]);
  const [atRiskScore, setAtRiskScore] = useState('Above 60 / 100');
  const [criticalRiskScore, setCriticalRiskScore] = useState('80 / 100 and above');
  const [editingThreshold, setEditingThreshold] = useState(null);

  // Notifications
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [weekendEmail, setWeekendEmail] = useState(false);

  // Invite modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Contributor');

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await settingsService.getSettings();
      setSettings(res);

      if (res.workingHours) {
        setCapacity(res.workingHours.defaultWeeklyCapacity || '40 hours');
        setTimeZone(res.workingHours.workspaceTimeZone || 'London · GMT (UTC+0)');
        setWorkdays(res.workingHours.workdays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
        setWorkdayStarts(res.workingHours.workdayStarts || '09:00');
        setWorkdayEnds(res.workingHours.workdayEnds || '18:00');
        setUnpaidBreak(res.workingHours.unpaidBreak || '60 minutes');
        setDeductLeave(res.workingHours.deductLeaveAutomatically !== false);
      }

      if (res.thresholds) {
        setThresholds(res.thresholds);
      }

      if (res.riskScores) {
        setAtRiskScore(res.riskScores.atRiskScore || 'Above 60 / 100');
        setCriticalRiskScore(res.riskScores.criticalRiskScore || '80 / 100 and above');
      }

      if (res.notifications) {
        setCriticalAlerts(res.notifications.immediateCriticalAlerts !== false);
        setDailyDigest(res.notifications.dailyDigest !== false);
        setWeekendEmail(!!res.notifications.weekendEmail);
      }
    } catch (err) {
      setError(err.message || 'Failed to load settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const toggleDay = (day) => {
    if (workdays.includes(day)) {
      setWorkdays(workdays.filter((d) => d !== day));
    } else {
      setWorkdays([...workdays, day]);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await settingsService.updateSettings({
        workingHours: {
          defaultWeeklyCapacity: capacity,
          workspaceTimeZone: timeZone,
          workdays,
          workdayStarts,
          workdayEnds,
          unpaidBreak,
          deductLeaveAutomatically: deductLeave,
        },
        thresholds,
        riskScores: {
          atRiskScore,
          criticalRiskScore,
        },
        notifications: {
          immediateCriticalAlerts: criticalAlerts,
          dailyDigest,
          weekendEmail,
        },
      });
      toast.success('Settings saved successfully.');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    try {
      await settingsService.inviteMember({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        description: 'New team member',
      });
      toast.success(`Invitation sent to ${inviteEmail}.`);
      setIsInviteOpen(false);
      setInviteName('');
      setInviteEmail('');
      loadSettings();
    } catch (err) {
      toast.error('Failed to invite member.');
    }
  };

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const capacityOptions = [
    { value: '35 hours', label: '35 hours' },
    { value: '37.5 hours', label: '37.5 hours' },
    { value: '40 hours', label: '40 hours' },
    { value: '45 hours', label: '45 hours' },
  ];

  const timeZoneOptions = [
    { value: 'London · GMT (UTC+0)', label: 'London · GMT (UTC+0)' },
    { value: 'New York · EST (UTC-5)', label: 'New York · EST (UTC-5)' },
    { value: 'San Francisco · PST (UTC-8)', label: 'San Francisco · PST (UTC-8)' },
    { value: 'Berlin · CET (UTC+1)', label: 'Berlin · CET (UTC+1)' },
  ];

  const breakOptions = [
    { value: '30 minutes', label: '30 minutes' },
    { value: '45 minutes', label: '45 minutes' },
    { value: '60 minutes', label: '60 minutes' },
  ];

  const tabs = [
    { id: 'workspace', label: 'Workspace' },
    { id: 'hours', label: 'Working hours' },
    { id: 'thresholds', label: 'Thresholds' },
    { id: 'roles', label: 'Roles & access' },
    { id: 'notifications', label: 'Notifications' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-[#E7E1D4]/40 animate-pulse rounded-[4px]" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !settings) {
    return <ErrorState message={error} onRetry={loadSettings} />;
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
            Set a healthy baseline.
          </h1>
          <p className="text-xs text-[#6B6A60] mt-1.5">
            Workspace settings · Changes apply to Forma Studio's 8-person design team.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            onClick={loadSettings}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>

      {/* Underline Tabs */}
      <div className="border-b border-[#DDD4C4]">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id)}
          variant="underline"
        />
      </div>

      {/* Section 1: Working hours */}
      {(activeTab === 'workspace' || activeTab === 'hours') && (
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-6 shadow-card space-y-6">
          <div>
            <h2 className="font-heading text-xl font-normal text-[#1E2A26]">
              Working hours
            </h2>
            <p className="text-xs text-[#6B6A60] mt-1">
              A realistic working week makes every capacity signal more useful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1.5">
                Default weekly capacity
              </label>
              <Dropdown
                options={capacityOptions}
                value={capacity}
                onChange={setCapacity}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1.5">
                Workspace time zone
              </label>
              <Dropdown
                options={timeZoneOptions}
                value={timeZone}
                onChange={setTimeZone}
                className="w-full"
              />
            </div>
          </div>

          {/* Workdays Pills */}
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-2">
              Standard workdays
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {allDays.map((day) => {
                const isSelected = workdays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`w-12 h-9 rounded-[4px] text-xs font-medium border transition-colors focus:ring-2 focus:ring-[#B8862F] ${
                      isSelected
                        ? 'bg-[#234236] text-white border-[#234236]'
                        : 'bg-[#FBF8F2] text-[#6B6A60] border-[#DDD4C4] hover:bg-[#F2ECE0]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Starts, Ends, Break row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1.5">
                Workday starts
              </label>
              <Input
                type="text"
                value={workdayStarts}
                onChange={(e) => setWorkdayStarts(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1.5">
                Workday ends
              </label>
              <Input
                type="text"
                value={workdayEnds}
                onChange={(e) => setWorkdayEnds(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1.5">
                Unpaid break
              </label>
              <Dropdown
                options={breakOptions}
                value={unpaidBreak}
                onChange={setUnpaidBreak}
                className="w-full"
              />
            </div>
          </div>

          {/* Deduct leave toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-[#DDD4C4]">
            <div>
              <div className="text-xs md:text-sm font-medium text-[#1E2A26]">
                Deduct approved leave automatically
              </div>
              <div className="text-[11px] text-[#6B6A60]">
                Annual leave and public holidays reduce available capacity.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDeductLeave(!deductLeave)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                deductLeave ? 'bg-[#234236]' : 'bg-[#DDD4C4]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  deductLeave ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <p className="text-[11px] text-[#8D8C82]">
            8 working hours per day · Individual schedules can be adjusted in employee profiles.
          </p>
        </div>
      )}

      {/* Section 2: Thresholds */}
      {(activeTab === 'workspace' || activeTab === 'thresholds') && (
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-6 shadow-card space-y-6">
          <div>
            <h2 className="font-heading text-xl font-normal text-[#1E2A26]">
              Thresholds
            </h2>
            <p className="text-xs text-[#6B6A60] mt-1">
              Flag pressure early. Labels are always shown alongside color.
            </p>
          </div>

          <div className="space-y-3">
            {thresholds.map((th, idx) => (
              <div
                key={th.band || idx}
                className="flex items-center justify-between p-3 rounded-[4px] border border-[#DDD4C4] bg-[#FBF8F2] hover:bg-[#F4EFE6]/60 transition-colors"
              >
                <div className="w-36">
                  <StatusChip status={th.band} label={th.label} size="sm" />
                </div>

                <div className="flex-1 px-4 text-xs font-semibold text-[#1E2A26]">
                  {th.range}
                </div>

                <div className="hidden sm:block text-xs text-[#6B6A60] pr-6">
                  {th.note}
                </div>

                <button
                  type="button"
                  onClick={() => setEditingThreshold(th)}
                  className="p-1.5 text-[#6B6A60] hover:text-[#1E2A26] rounded-[2px] hover:bg-[#EAE4D8]"
                  title="Edit threshold"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#DDD4C4]">
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1.5">
                At-risk score
              </label>
              <Input
                value={atRiskScore}
                onChange={(e) => setAtRiskScore(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1.5">
                Critical risk score
              </label>
              <Input
                value={criticalRiskScore}
                onChange={(e) => setCriticalRiskScore(e.target.value)}
              />
            </div>
          </div>

          <p className="text-[11px] text-[#8D8C82]">
            Burnout risk combines overtime, deadline pressure, and recovery over 8 weeks. It is not a health diagnosis.
          </p>
        </div>
      )}

      {/* Section 3: Roles & access */}
      {(activeTab === 'workspace' || activeTab === 'roles') && (
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-normal text-[#1E2A26]">
                Roles & access
              </h2>
              <p className="text-xs text-[#6B6A60] mt-1">
                Give people the context they need, and keep sensitive signals private.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              icon={Plus}
            >
              Invite member
            </Button>
          </div>

          <div className="space-y-3">
            {settings.members?.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-[4px] border border-[#DDD4C4] bg-[#FBF8F2] gap-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar initials={member.initials} name={member.name} size="md" />
                  <div>
                    <div className="text-xs md:text-sm font-medium text-[#1E2A26]">
                      {member.name}
                    </div>
                    <div className="text-[11px] text-[#6B6A60]">
                      {member.description}
                    </div>
                  </div>
                </div>

                <div className="text-xs font-medium text-[#1E2A26] px-3 py-1 bg-[#F4EFE6] border border-[#DDD4C4] rounded-[4px] self-start sm:self-auto">
                  {member.role}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#8D8C82]">
            7 other contributors share Daniel's permission level. Risk signals and manager notes are never visible to contributors.
          </p>
        </div>
      )}

      {/* Section 4: Notifications */}
      {(activeTab === 'workspace' || activeTab === 'notifications') && (
        <div className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-6 shadow-card space-y-6">
          <div>
            <h2 className="font-heading text-xl font-normal text-[#1E2A26]">
              Notifications
            </h2>
            <p className="text-xs text-[#6B6A60] mt-1">
              Useful signals, without adding noise.
            </p>
          </div>

          <div className="space-y-4">
            {/* Immediate critical alerts */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD4C4]">
              <div>
                <div className="text-xs md:text-sm font-medium text-[#1E2A26]">
                  Immediate critical alerts
                </div>
                <div className="text-[11px] text-[#6B6A60]">
                  Notify managers when workload or risk becomes critical.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCriticalAlerts(!criticalAlerts)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  criticalAlerts ? 'bg-[#234236]' : 'bg-[#DDD4C4]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    criticalAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Daily digest at 09:00 */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD4C4]">
              <div>
                <div className="text-xs md:text-sm font-medium text-[#1E2A26]">
                  Daily digest at 09:00
                </div>
                <div className="text-[11px] text-[#6B6A60]">
                  A single summary of workload changes and recommended actions.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDailyDigest(!dailyDigest)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  dailyDigest ? 'bg-[#234236]' : 'bg-[#DDD4C4]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    dailyDigest ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Weekend email notifications */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs md:text-sm font-medium text-[#1E2A26]">
                  Weekend email notifications
                </div>
                <div className="text-[11px] text-[#6B6A60]">
                  Keep non-critical updates for the next working day.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWeekendEmail(!weekendEmail)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  weekendEmail ? 'bg-[#234236]' : 'bg-[#DDD4C4]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    weekendEmail ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Threshold Modal */}
      <Modal
        isOpen={!!editingThreshold}
        onClose={() => setEditingThreshold(null)}
        title={`Edit ${editingThreshold?.label} Threshold`}
        subtitle="Modify the threshold percentage range."
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditingThreshold(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setThresholds((current) =>
                  current.map((threshold) =>
                    threshold.band === editingThreshold?.band ? editingThreshold : threshold
                  )
                );
                setEditingThreshold(null);
                toast.success('Threshold updated. Save changes to apply it.');
              }}
            >
              Update threshold
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-medium text-[#6B6A60]">Percentage Range</label>
          <Input
            value={editingThreshold?.range || ''}
            onChange={(e) =>
              setEditingThreshold({ ...editingThreshold, range: e.target.value })
            }
          />
          <label className="block text-xs font-medium text-[#6B6A60]">Note / Hours calculation</label>
          <Input
            value={editingThreshold?.note || ''}
            onChange={(e) =>
              setEditingThreshold({ ...editingThreshold, note: e.target.value })
            }
          />
        </div>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite team member"
        subtitle="Grant workspace access with role-based permissions."
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleInviteSubmit}>
              Send invitation
            </Button>
          </div>
        }
      >
        <form onSubmit={handleInviteSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">Full Name</label>
            <Input
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. Jordan Lee"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">Work Email</label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="jordan.lee@forma.studio"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] px-3.5 py-2 text-sm text-[#1E2A26] focus:ring-2 focus:ring-[#B8862F]"
            >
              <option value="Contributor">Contributor (Own tasks & allocation only)</option>
              <option value="Manager">Manager (Team workload & interventions)</option>
              <option value="Workspace admin">Workspace admin (Full administration)</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SettingsPage;
