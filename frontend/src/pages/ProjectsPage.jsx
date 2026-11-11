import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUpRight, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SearchInput, Input } from '../components/ui/Input';
import { Dropdown } from '../components/ui/Dropdown';
import { KpiCard } from '../components/ui/KpiCard';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';
import { projectService } from '../services/projectService';

export function ProjectsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLead, setSelectedLead] = useState('all');

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Project Modal
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectSubtitle, setNewProjectSubtitle] = useState('');
  const [newProjectLead, setNewProjectLead] = useState('Asha Patel');
  const [newProjectCapacity, setNewProjectCapacity] = useState('80');
  const [newProjectDueDate, setNewProjectDueDate] = useState('15 Dec 2026');

  // View Project Detail Modal
  const [selectedProject, setSelectedProject] = useState(null);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await projectService.getProjects({
        search: searchQuery,
        status: selectedStatus,
        lead: selectedLead,
      });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [searchQuery, selectedStatus, selectedLead]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await projectService.createProject({
        name: newProjectName,
        subtitle: newProjectSubtitle,
        lead: newProjectLead,
        weeklyCapacity: Number(newProjectCapacity),
        projectDueDate: newProjectDueDate,
      });
      toast.success(`Project "${newProjectName}" created successfully.`);
      setIsNewProjectOpen(false);
      setNewProjectName('');
      setNewProjectSubtitle('');
      loadProjects();
    } catch (err) {
      toast.error('Failed to create project.');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Active projects' },
    { value: 'attention', label: 'Needs attention' },
    { value: 'risk', label: 'At risk' },
    { value: 'track', label: 'On track' },
  ];

  const leadOptions = [
    { value: 'all', label: 'All project leads' },
    { value: 'Asha', label: 'Asha Patel' },
    { value: 'Marcus', label: 'Marcus Reed' },
    { value: 'Mei', label: 'Mei Tan' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-[#E7E1D4]/40 animate-pulse rounded-[4px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="space-y-4">
          <div className="h-44 bg-[#E7E1D4]/40 animate-pulse rounded-[4px]" />
          <div className="h-44 bg-[#E7E1D4]/40 animate-pulse rounded-[4px]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error} onRetry={loadProjects} />;
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
            Good work needs a clear plan.
          </h1>
          <p className="text-xs text-[#6B6A60] mt-1.5">
            {data.projects.length} active projects · Shared commitments, individual impact.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsNewProjectOpen(true)}
          className="gap-1.5 text-xs self-start sm:self-auto"
          icon={Plus}
        >
          New project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="w-full sm:w-64">
          <SearchInput
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Dropdown
            options={statusOptions}
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
          />

          <Dropdown
            options={leadOptions}
            value={selectedLead}
            onChange={(val) => setSelectedLead(val)}
          />

          <span className="text-xs text-[#6B6A60] hidden md:inline-block">
            Week of 2–8 Nov 2026
          </span>
        </div>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Active projects"
          value={data.kpis.activeProjects.value}
          note={data.kpis.activeProjects.note}
        />
        <KpiCard
          title="Weekly commitments"
          value={data.kpis.weeklyCommitments.value}
          note={data.kpis.weeklyCommitments.note}
        />
        <KpiCard
          title="Projects needing care"
          value={data.kpis.projectsNeedingCare.value}
          note={data.kpis.projectsNeedingCare.note}
          dotColor="#C4613F"
        />
      </div>

      {/* Project Cards List */}
      <div className="space-y-4">
        {data.projects.map((proj) => {
          const isOver = proj.weeklyAllocation > proj.weeklyCapacity;
          const statusColor = proj.accentColor || (isOver ? '#C4613F' : '#D4A537');

          return (
            <div
              key={proj.id}
              className="bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] p-6 shadow-card space-y-5"
            >
              {/* Project Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="border-l-2 pl-3" style={{ borderColor: statusColor }}>
                  <h3 className="font-heading text-2xl font-normal text-[#1E2A26]">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-[#6B6A60] mt-0.5">
                    {proj.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: statusColor }}>
                    <span className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: statusColor }} />
                    <span>{proj.status}</span>
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedProject(proj)}
                    className="gap-1 text-xs"
                    icon={ArrowUpRight}
                    iconPosition="left"
                  >
                    View project
                  </Button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-y border-[#DDD4C4]/60 text-xs">
                {/* Project Lead */}
                <div>
                  <div className="text-[#6B6A60] text-[11px] uppercase tracking-wider mb-1.5">
                    Project lead
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar initials={proj.leadInitials} name={proj.lead} size="sm" />
                    <div>
                      <div className="font-medium text-[#1E2A26]">{proj.lead}</div>
                    </div>
                  </div>
                </div>

                {/* Weekly Allocation */}
                <div>
                  <div className="text-[#6B6A60] text-[11px] uppercase tracking-wider mb-1.5">
                    Weekly allocation
                  </div>
                  <div className="font-medium text-[#1E2A26]">
                    {proj.weeklyAllocation} / {proj.weeklyCapacity} hrs · {proj.percentage}%
                  </div>
                  <div className="w-full h-1 bg-[#EAE4D8] rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, proj.percentage)}%`,
                        backgroundColor: statusColor,
                      }}
                    />
                  </div>
                </div>

                {/* Delivery Progress */}
                <div>
                  <div className="text-[#6B6A60] text-[11px] uppercase tracking-wider mb-1.5">
                    Delivery progress
                  </div>
                  <div className="font-medium text-[#1E2A26]">
                    {proj.completedTasks} / {proj.totalTasks} complete
                  </div>
                  <div className="text-[11px] text-[#6B6A60]">
                    {proj.activeTasks} active tasks
                  </div>
                </div>

                {/* Next Milestone */}
                <div>
                  <div className="text-[#6B6A60] text-[11px] uppercase tracking-wider mb-1.5">
                    Next milestone
                  </div>
                  <div className="font-medium text-[#1E2A26]">
                    {proj.nextMilestone}
                  </div>
                  <div className="text-[11px] text-[#6B6A60]">
                    Project due {proj.projectDueDate}
                  </div>
                </div>
              </div>

              {/* Contributors and Note Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <p className="text-xs text-[#6B6A60] flex-1">
                  {proj.note}
                </p>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                  {proj.contributors.map((init, i) => (
                    <Avatar
                      key={i}
                      initials={init}
                      size="sm"
                      bgColor="#EAE4D8"
                      textColor="#1E2A26"
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        title="Create new project"
        subtitle="Establish team commitments and delivery milestones."
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsNewProjectOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateProject}>
              Create project
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateProject} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">Project Name</label>
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="e.g. Design System V2"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B6A60] mb-1">Subtitle / Purpose</label>
            <Input
              value={newProjectSubtitle}
              onChange={(e) => setNewProjectSubtitle(e.target.value)}
              placeholder="Clear scope summary..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1">Project Lead</label>
              <select
                value={newProjectLead}
                onChange={(e) => setNewProjectLead(e.target.value)}
                className="w-full bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] px-3.5 py-2 text-sm text-[#1E2A26] focus:ring-2 focus:ring-[#B8862F]"
              >
                <option value="Asha Patel">Asha Patel</option>
                <option value="Marcus Reed">Marcus Reed</option>
                <option value="Mei Tan">Mei Tan</option>
                <option value="Sofia Rivera">Sofia Rivera</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B6A60] mb-1">Target Due Date</label>
              <Input
                value={newProjectDueDate}
                onChange={(e) => setNewProjectDueDate(e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Project Detail Modal */}
      <Modal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.name || 'Project Details'}
        subtitle={selectedProject?.subtitle}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSelectedProject(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                navigate('/rebalancer');
              }}
            >
              Rebalance this project
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs md:text-sm text-[#1E2A26]">
          <div className="p-3 bg-[#F4EFE6] rounded-[4px] border border-[#DDD4C4] space-y-1">
            <div className="font-semibold text-[#1E2A26]">Status Summary:</div>
            <p className="text-xs text-[#6B6A60]">{selectedProject?.note}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#6B6A60]">Weekly Commitment:</span>{' '}
              <span className="font-medium text-[#1E2A26]">{selectedProject?.weeklyAllocation} hrs</span>
            </div>
            <div>
              <span className="text-[#6B6A60]">Contracted Capacity:</span>{' '}
              <span className="font-medium text-[#1E2A26]">{selectedProject?.weeklyCapacity} hrs</span>
            </div>
            <div>
              <span className="text-[#6B6A60]">Active Tasks:</span>{' '}
              <span className="font-medium text-[#1E2A26]">{selectedProject?.activeTasks} tasks</span>
            </div>
            <div>
              <span className="text-[#6B6A60]">Project Due:</span>{' '}
              <span className="font-medium text-[#1E2A26]">{selectedProject?.projectDueDate}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ProjectsPage;
