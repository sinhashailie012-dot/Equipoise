import React, { useState } from 'react';
import { Clock, Plus, Pencil, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Avatar } from '../components/ui/Avatar';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

export function SettingsPage() {
  const { settings, setSettings } = useApp();

  const [activeTab, setActiveTab] = useState('working-hours');
  const [capacity, setCapacity] = useState(settings.workingHours.defaultWeeklyCapacity);
  const [timeZone, setTimeZone] = useState(settings.workingHours.workspaceTimeZone);
  const [workdays, setWorkdays] = useState(settings.workingHours.workdays);
  const [startsAt, setStartsAt] = useState(settings.workingHours.workdayStarts);
  const [endsAt, setEndsAt] = useState(settings.workingHours.workdayEnds);
  const [unpaidBreak, setUnpaidBreak] = useState(settings.workingHours.unpaidBreak);
  const [deductLeave, setDeductLeave] = useState(settings.workingHours.deductLeaveAutomatically);

  // Notification toggles
  const [criticalAlerts, setCriticalAlerts] = useState(settings.notifications.immediateCriticalAlerts);
  const [dailyDigest, setDailyDigest] = useState(settings.notifications.dailyDigest);
  const [weekendEmail, setWeekendEmail] = useState(settings.notifications.weekendEmail);

  const [savedMessage, setSavedMessage] = useState(false);

  const toggleDay = (day) => {
    if (workdays.includes(day)) {
      setWorkdays(workdays.filter(d => d !== day));
    } else {
      setWorkdays([...workdays, day]);
    }
  };

  const handleSave = () => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        defaultWeeklyCapacity: capacity,
        workspaceTimeZone: timeZone,
        workdays,
        workdayStarts: startsAt,
        workdayEnds: endsAt,
        unpaidBreak,
        deductLeaveAutomatically: deductLeave,
      },
      notifications: {
        immediateCriticalAlerts: criticalAlerts,
        dailyDigest,
        weekendEmail,
      },
    }));
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase mb-1">
            PEOPLE OPERATIONS / DESIGN TEAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink-primary font-normal tracking-tight">
            Set a healthy baseline.
          </h1>
          <p className="text-xs text-ink-secondary mt-1.5">
            Workspace settings · Changes apply to Forma Studio's 8-person design team.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button variant="secondary" className="text-xs py-2">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            selected={savedMessage}
            className="text-xs py-2 gap-1.5"
          >
            {savedMessage && <Check className="w-3.5 h-3.5" />}
            <span>{savedMessage ? 'Saved!' : 'Save changes'}</span>
          </Button>
        </div>
      </div>

      {/* Subnav Tabs */}
      <div className="border-b border-border-subtle flex gap-6 text-xs font-medium">
        {[
          { id: 'workspace', label: 'Workspace' },
          { id: 'working-hours', label: 'Working hours' },
          { id: 'thresholds', label: 'Thresholds' },
          { id: 'roles-access', label: 'Roles & access' },
          { id: 'notifications', label: 'Notifications' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-3 relative transition-colors focus-visible:focus-ochre",
              activeTab === tab.id
                ? "text-brand-900 font-semibold border-b-2 border-brand-800 -mb-[1px]"
                : "text-ink-secondary hover:text-ink-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: Working hours */}
      <div className="bg-card rounded-xl border border-border-subtle p-6 space-y-6">
        <div>
          <h2 className="text-lg font-serif text-ink-primary">
            Working hours
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            A realistic working week makes every capacity signal more useful.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1.5">
              Default weekly capacity
            </label>
            <Select
              value={capacity}
              onChange={setCapacity}
              options={['35 hours', '37.5 hours', '40 hours', '45 hours']}
              className="w-full py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1.5">
              Workspace time zone
            </label>
            <Select
              value={timeZone}
              onChange={setTimeZone}
              options={['London · GMT (UTC+0)', 'New York · EST (UTC-5)', 'San Francisco · PST (UTC-8)']}
              className="w-full py-2"
            />
          </div>
        </div>

        {/* Days of week */}
        <div>
          <label className="block text-xs font-medium text-ink-primary mb-2">
            Working days
          </label>
          <div className="flex flex-wrap gap-2">
            {allDays.map((day) => {
              const isSelected = workdays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "px-4 py-2 rounded text-xs font-medium transition-colors focus-visible:focus-ochre",
                    isSelected
                      ? "bg-brand-800 text-white"
                      : "bg-[#F4EFE6] text-ink-muted hover:text-ink-primary"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Start / End / Break */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1.5">
              Workday starts
            </label>
            <div className="relative">
              <input
                type="text"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full bg-[#FBF8F2] border border-[#DFD8CB] rounded px-3 py-2 text-sm focus-visible:focus-ochre"
              />
              <Clock className="w-4 h-4 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1.5">
              Workday ends
            </label>
            <div className="relative">
              <input
                type="text"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full bg-[#FBF8F2] border border-[#DFD8CB] rounded px-3 py-2 text-sm focus-visible:focus-ochre"
              />
              <Clock className="w-4 h-4 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1.5">
              Unpaid break
            </label>
            <Select
              value={unpaidBreak}
              onChange={setUnpaidBreak}
              options={['30 minutes', '45 minutes', '60 minutes', '90 minutes']}
              className="w-full py-2"
            />
          </div>
        </div>

        {/* Toggle Switch: Deduct approved leave */}
        <div className="flex items-center justify-between p-4 bg-card-subtle rounded-lg border border-border-subtle">
          <div>
            <div className="text-sm font-medium text-ink-primary">
              Deduct approved leave automatically
            </div>
            <div className="text-xs text-ink-secondary mt-0.5">
              Annual leave and public holidays reduce available capacity.
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={deductLeave}
            onClick={() => setDeductLeave(!deductLeave)}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative focus-visible:focus-ochre",
              deductLeave ? "bg-brand-800" : "bg-[#DFD8CB]"
            )}
          >
            <span
              className={cn(
                "block w-4 h-4 bg-white rounded-full transition-transform absolute top-1",
                deductLeave ? "left-6" : "left-1"
              )}
            />
          </button>
        </div>

        <div className="text-xs text-ink-muted pt-1">
          8 working hours per day · Individual schedules can be adjusted in employee profiles.
        </div>
      </div>

      {/* Section 2: Thresholds */}
      <div className="bg-card rounded-xl border border-border-subtle p-6 space-y-6">
        <div>
          <h2 className="text-lg font-serif text-ink-primary">
            Thresholds
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Flag pressure early. Labels are always shown alongside color.
          </p>
        </div>

        <div className="divide-y divide-border-subtle/60 text-xs">
          {settings.thresholds.map((item, idx) => (
            <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="w-36">
                <StatusBadge status={item.band} label={item.label} size="sm" />
              </div>
              <div className="flex items-center gap-2 font-mono text-ink-primary">
                <span>{item.range}</span>
                <Pencil className="w-3 h-3 text-ink-muted hover:text-ink-primary cursor-pointer" />
              </div>
              <div className="text-ink-secondary">
                {item.note}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-border-subtle">
          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1.5">
              At-risk score
            </label>
            <Select
              value={settings.riskScores.atRiskScore}
              options={['Above 50 / 100', 'Above 60 / 100', 'Above 70 / 100']}
              className="w-full py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1.5">
              Critical risk score
            </label>
            <Select
              value={settings.riskScores.criticalRiskScore}
              options={['75 / 100 and above', '80 / 100 and above', '85 / 100 and above']}
              className="w-full py-2"
            />
          </div>
        </div>

        <div className="text-xs text-ink-muted pt-1">
          Burnout risk combines overtime, deadline pressure, and recovery over 8 weeks. It is not a health diagnosis.
        </div>
      </div>

      {/* Section 3: Roles & Access */}
      <div className="bg-card rounded-xl border border-border-subtle p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-serif text-ink-primary">
              Roles & access
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Give people the context they need, and keep sensitive signals private.
            </p>
          </div>
          <Button variant="secondary" size="sm" className="gap-1.5 text-xs py-1.5 bg-card-subtle self-start">
            <Plus className="w-3.5 h-3.5 text-ink-muted" />
            <span>Invite member</span>
          </Button>
        </div>

        <div className="divide-y divide-border-subtle/60 text-xs">
          {settings.members.map((member) => (
            <div key={member.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar initials={member.initials} name={member.name} size="md" />
                <div>
                  <div className="font-medium text-sm text-ink-primary">{member.name}</div>
                  <div className="text-ink-secondary text-xs">{member.description}</div>
                </div>
              </div>
              <Select
                value={member.role}
                options={['Workspace admin', 'Manager', 'Contributor', 'Viewer']}
                className="py-1 text-xs"
              />
            </div>
          ))}
        </div>

        <div className="text-xs text-ink-muted pt-1">
          7 other contributors share Daniel's permission level. Risk signals and manager notes are never visible to contributors.
        </div>
      </div>

      {/* Section 4: Notifications */}
      <div className="bg-card rounded-xl border border-border-subtle p-6 space-y-6">
        <div>
          <h2 className="text-lg font-serif text-ink-primary">
            Notifications
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Useful signals, without adding noise.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-card-subtle rounded-lg border border-border-subtle">
            <div>
              <div className="text-sm font-medium text-ink-primary">
                Immediate critical alerts
              </div>
              <div className="text-xs text-ink-secondary mt-0.5">
                Notify managers when workload or risk becomes critical.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={criticalAlerts}
              onClick={() => setCriticalAlerts(!criticalAlerts)}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative focus-visible:focus-ochre",
                criticalAlerts ? "bg-brand-800" : "bg-[#DFD8CB]"
              )}
            >
              <span
                className={cn(
                  "block w-4 h-4 bg-white rounded-full transition-transform absolute top-1",
                  criticalAlerts ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-card-subtle rounded-lg border border-border-subtle">
            <div>
              <div className="text-sm font-medium text-ink-primary">
                Daily digest at 09:00
              </div>
              <div className="text-xs text-ink-secondary mt-0.5">
                A single summary of workload changes and recommended actions.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={dailyDigest}
              onClick={() => setDailyDigest(!dailyDigest)}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative focus-visible:focus-ochre",
                dailyDigest ? "bg-brand-800" : "bg-[#DFD8CB]"
              )}
            >
              <span
                className={cn(
                  "block w-4 h-4 bg-white rounded-full transition-transform absolute top-1",
                  dailyDigest ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-card-subtle rounded-lg border border-border-subtle">
            <div>
              <div className="text-sm font-medium text-ink-primary">
                Weekend email notifications
              </div>
              <div className="text-xs text-ink-secondary mt-0.5">
                Keep non-critical updates for the next working day.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={weekendEmail}
              onClick={() => setWeekendEmail(!weekendEmail)}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative focus-visible:focus-ochre",
                weekendEmail ? "bg-brand-800" : "bg-[#DFD8CB]"
              )}
            >
              <span
                className={cn(
                  "block w-4 h-4 bg-white rounded-full transition-transform absolute top-1",
                  weekendEmail ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

