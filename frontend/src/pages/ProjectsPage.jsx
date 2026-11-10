import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { MetricCard } from '../components/ui/MetricCard';
import { Avatar } from '../components/ui/Avatar';
import { useApp } from '../context/AppContext';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { projects } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active projects');

  const filteredProjects = projects.filter((p) => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase mb-1">
            PEOPLE OPERATIONS / DESIGN TEAM
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink-primary font-normal tracking-tight">
            Good work needs a clear plan.
          </h1>
          <p className="text-xs text-ink-secondary mt-1.5">
            3 active projects · Shared commitments, individual impact.
          </p>
        </div>

        <Button
          variant="primary"
          className="gap-1.5 text-xs py-2.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New project</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-card p-3 rounded-lg border border-border-subtle">
        <div className="flex-1 max-w-sm">
          <SearchInput
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-1.5"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            options={['Active projects', 'All projects', 'Completed']}
            className="py-1.5 text-xs"
          />
          <Select
            value="All project leads"
            options={['All project leads', 'Asha Patel', 'Marcus Reed', 'Mei Tan']}
            className="py-1.5 text-xs"
          />
          <span className="text-ink-muted text-xs hidden md:inline ml-2">
            Week of 2–8 Nov 2026
          </span>
        </div>
      </div>

      {/* 3 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Active projects"
          value="3"
          subtext="8 people contributing"
          dotColor="#1E2A26"
        />
        <MetricCard
          title="Weekly commitments"
          value="306 hrs"
          subtext="Across 42 active tasks"
          dotColor="#1E2A26"
        />
        <MetricCard
          title="Projects needing care"
          value="2"
          subtext="Atlas and Beacon"
          dotColor="#C3542F"
        />
      </div>

      {/* Project Cards List */}
      <div className="space-y-5">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-card rounded-xl border border-border-subtle p-5 sm:p-6 space-y-4 hover:border-[#C5BCAB] transition-colors"
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
              <div className="flex items-start gap-3">
                <div
                  className="w-1 self-stretch rounded-full mt-1 shrink-0"
                  style={{ backgroundColor: project.accentColor }}
                />
                <div>
                  <h3 className="text-xl font-serif text-ink-primary font-normal">
                    {project.name}
                  </h3>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    {project.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-ink-primary">
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: project.accentColor }}
                  />
                  <span>{project.status}</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/rebalancer')}
                  className="gap-1.5 text-xs py-1.5 bg-card-subtle"
                >
                  <span>View project</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted" />
                </Button>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
              {/* Project Lead */}
              <div>
                <div className="text-[11px] text-ink-muted mb-1.5">Project lead</div>
                <div className="flex items-center gap-2">
                  <Avatar initials={project.leadInitials} name={project.lead} size="sm" />
                  <span className="font-medium text-ink-primary">{project.lead}</span>
                </div>
              </div>

              {/* Weekly Allocation */}
              <div>
                <div className="text-[11px] text-ink-muted mb-1.5">Weekly allocation</div>
                <div className="font-medium text-ink-primary mb-1">
                  {project.weeklyAllocation} / {project.weeklyCapacity} hrs · {project.percentage}%
                </div>
                <div className="w-full h-1.5 bg-[#EAE4D8] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, project.percentage)}%`,
                      backgroundColor: project.accentColor,
                    }}
                  />
                </div>
              </div>

              {/* Delivery Progress */}
              <div>
                <div className="text-[11px] text-ink-muted mb-1.5">Delivery progress</div>
                <div className="font-medium text-ink-primary">
                  {project.completedTasks} / {project.totalTasks} complete
                </div>
                <div className="text-[11px] text-ink-muted mt-0.5">
                  {project.activeTasks} active tasks
                </div>
              </div>

              {/* Next Milestone & Contributors */}
              <div>
                <div className="text-[11px] text-ink-muted mb-1.5">Next milestone</div>
                <div className="font-medium text-ink-primary">
                  {project.nextMilestone}
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-ink-muted">
                  <span>Project due {project.projectDueDate.split(' ')[0]} {project.projectDueDate.split(' ')[1]}</span>
                  <div className="flex items-center -space-x-1.5">
                    {project.contributors.map((c, i) => (
                      <Avatar
                        key={i}
                        initials={c}
                        size="xs"
                        bgColor="#EAE4D8"
                        textColor="#1E2A26"
                        className="ring-1 ring-white"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Note Footer */}
            <div className="pt-3 border-t border-border-subtle/60 text-xs text-ink-secondary">
              {project.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

