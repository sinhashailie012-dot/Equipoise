import React, { useState, useEffect } from 'react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  Sparkles,
  Undo2,
  GripVertical,
  Check,
  MoreHorizontal,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatusChip } from '../components/ui/StatusChip';
import { CapacityBar } from '../components/ui/CapacityBar';
import { Avatar } from '../components/ui/Avatar';
import { Dropdown } from '../components/ui/Dropdown';
import { DatePicker } from '../components/ui/DatePicker';
import { ReassignTaskModal } from '../components/modals/ReassignTaskModal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';
import { workloadService } from '../services/workloadService';
import { getUtilization, getStatusFromThresholds } from '../utils/workload';

// Draggable Task Card Component
function DraggableTaskCard({ task, onReassignClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  const isOverdue = task.status === 'Overdue' || (task.due && task.due.includes('Overdue'));
  const isSuggested = task.isSuggested;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative p-3 rounded-[4px] border transition-shadow select-none ${
        isDragging ? 'shadow-2xl opacity-90 rotate-1' : 'shadow-card'
      } ${
        isSuggested
          ? 'bg-[#FAF3E1] border-[#EBDCBA]'
          : 'bg-[#FBF8F2] border-[#DDD4C4] hover:border-[#8D8C82]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <button
            type="button"
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing text-[#8D8C82] hover:text-[#1E2A26] p-0.5 -ml-1 mt-0.5 rounded-[2px]"
            title="Drag to reassign"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs md:text-sm font-medium text-[#1E2A26] leading-snug truncate">
              {task.title}
            </h4>
            <div className="text-[11px] text-[#6B6A60] mt-0.5">
              Due {task.due} · {task.status}
            </div>
            {isSuggested && (
              <div className="text-[11px] font-semibold text-[#B8862F] mt-1.5 flex items-center gap-1">
                <span>Suggested move → Daniel Kim</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-semibold text-[#1E2A26]">
            {task.hours}h
          </span>
          <button
            type="button"
            onClick={() => onReassignClick(task)}
            className="p-1 text-[#6B6A60] hover:text-[#1E2A26] rounded-[2px] hover:bg-[#EAE4D8]"
            title="Reassign options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({ column, tasks, onReassignClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const totalHours = tasks.reduce((sum, t) => sum + (t.hours || 0), 0);
  const contracted = column.contractedHours || 40;
  const util = getUtilization(totalHours, contracted);
  const statusObj = getStatusFromThresholds(util);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-[4px] border transition-colors ${
        isOver
          ? 'bg-[#EAEFEA] border-[#234236]'
          : 'bg-[#FBF8F2] border-[#DDD4C4]'
      }`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-[#DDD4C4]">
        <div className="flex items-center gap-3 mb-3">
          <Avatar initials={column.initials} name={column.name} size="md" />
          <div>
            <div className="text-xs md:text-sm font-medium text-[#1E2A26]">
              {column.name}
            </div>
            <div className="text-[11px] text-[#6B6A60]">
              {tasks.length} tasks · {column.project}
            </div>
          </div>
        </div>

        {/* Workload Metric & Status Bar */}
        <div className="space-y-1.5 mb-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#1E2A26]">
              {totalHours} / {contracted} hrs
            </span>
            <span className="text-[#6B6A60]">
              {util}%
            </span>
          </div>
          <CapacityBar
            allocated={totalHours}
            capacity={contracted}
            status={statusObj.key}
          />
        </div>

        <div>
          <StatusChip status={statusObj.key} size="sm" />
        </div>
      </div>

      {/* Task Cards List */}
      <div className="p-3 space-y-2.5 flex-1 min-h-[300px]">
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onReassignClick={onReassignClick}
          />
        ))}

        {/* Drop zone placeholder */}
        <div
          className={`border-2 border-dashed rounded-[4px] py-4 text-center text-xs transition-colors ${
            isOver
              ? 'border-[#234236] text-[#234236] bg-[#234236]/5'
              : 'border-[#DDD4C4] text-[#8D8C82]'
          }`}
        >
          Drop a task here
        </div>
      </div>
    </div>
  );
}

export function TaskRebalancerPage() {
  const toast = useToast();
  const [selectedProject, setSelectedProject] = useState('atlas-redesign');
  const [dateRange, setDateRange] = useState('2–8 Nov 2026');

  const [columnsData, setColumnsData] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState({});
  const [suggestion, setSuggestion] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal
  const [selectedTaskForModal, setSelectedTaskForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await workloadService.getRebalancerData(selectedProject);
      setColumnsData(res.columns);
      setSuggestion(res.suggestion);

      // Collect all tasks into a single state
      const allTasks = [];
      res.columns.forEach((col) => {
        if (col.tasks) {
          col.tasks.forEach((t) => allTasks.push(t));
        }
      });
      setTasksData(allTasks);
      setPendingAssignments({});
      setIsDirty(false);
    } catch (err) {
      setError(err.message || 'Failed to load task rebalancer.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProject]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const targetColumnId = over.id;

    const task = tasksData.find((t) => t.id === taskId);
    if (!task) return;

    if (task.assigneeId === targetColumnId) {
      return; // Dropped on same person
    }

    const originalAssigneeId = pendingAssignments[taskId]?.fromEmployeeId || task.assigneeId;
    if (originalAssigneeId === targetColumnId) {
      setPendingAssignments((current) => {
        const next = { ...current };
        delete next[taskId];
        return next;
      });
    } else {
      setPendingAssignments((current) => ({
        ...current,
        [taskId]: {
          taskId,
          fromEmployeeId: originalAssigneeId,
          toEmployeeId: targetColumnId,
        },
      }));
    }

    // Move task to target person
    setTasksData((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, assigneeId: targetColumnId, isSuggested: false } : t
      )
    );
    setIsDirty(
      originalAssigneeId !== targetColumnId ||
      Object.keys(pendingAssignments).some((id) => id !== taskId)
    );

    const targetPerson = columnsData.find((c) => c.id === targetColumnId);
    toast.info(`Moved "${task.title}" to ${targetPerson?.name || 'teammate'}.`);
  };

  const handleAcceptSuggestion = async () => {
    try {
      await workloadService.acceptSuggestion('sugg-1');
      setTasksData((prev) =>
        prev.map((t) =>
          t.id === 'task-2' ? { ...t, assigneeId: 'daniel-kim', isSuggested: false } : t
        )
      );
      setPendingAssignments((current) => {
        const next = { ...current };
        delete next['task-2'];
        return next;
      });
      setSuggestion(null);
      setIsDirty(Object.keys(pendingAssignments).some((taskId) => taskId !== 'task-2'));
      toast.success('Suggestion accepted: 6 hours moved from Asha to Daniel.');
    } catch (err) {
      toast.error('Failed to accept suggestion.');
    }
  };

  const handleDismissSuggestion = async () => {
    try {
      await workloadService.dismissSuggestion('sugg-1');
      setSuggestion(null);
      toast.info('Suggestion dismissed.');
    } catch (err) {
      toast.error('Failed to dismiss suggestion.');
    }
  };

  const handleApplyChanges = async () => {
    try {
      for (const assignment of Object.values(pendingAssignments)) {
        await workloadService.reassignTask(assignment);
        setPendingAssignments((current) => {
          const next = { ...current };
          delete next[assignment.taskId];
          return next;
        });
      }
      setIsDirty(false);
      toast.success('Changes applied. Workload rebalanced successfully.');
    } catch (err) {
      toast.error('Failed to apply changes.');
    }
  };

  const handleUndo = async () => {
    await workloadService.resetRebalancer();
    await loadData();
    toast.info('Reverted all changes to initial state.');
  };

  const projectOptions = [
    { value: 'atlas-redesign', label: 'Atlas redesign · 3 people' },
    { value: 'beacon-launch', label: 'Beacon launch · 3 people' },
    { value: 'core-platform', label: 'Core platform · 2 people' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-14 bg-[#E7E1D4]/40 animate-pulse rounded-[4px]" />
        <div className="h-24 bg-[#E7E1D4]/40 animate-pulse rounded-[4px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
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
            Share the load, thoughtfully.
          </h1>
          <p className="text-xs text-[#6B6A60] mt-1.5">
            Preview a better balance before making changes. Your team's work stays in view.
          </p>
        </div>

        <Button
          variant="primary"
          disabled={!isDirty}
          onClick={handleApplyChanges}
          className="gap-2 text-xs self-start sm:self-auto"
        >
          {isDirty ? 'Apply changes' : 'Apply changes'}
        </Button>
      </div>

      {/* Controls Bar: Project Dropdown, Date, Info, Undo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown
            options={projectOptions}
            value={selectedProject}
            onChange={(val) => setSelectedProject(val)}
            className="w-full sm:w-auto"
          />

          <DatePicker
            value={dateRange}
            onChange={(val) => setDateRange(val)}
          />

          <span className="hidden md:inline-block text-xs text-[#6B6A60]">
            Drag tasks between people to preview a healthier balance.
          </span>
        </div>

        <Button
          variant="secondary"
          onClick={handleUndo}
          className="gap-1.5 text-xs self-end sm:self-auto"
          icon={Undo2}
        >
          Undo
        </Button>
      </div>

      {/* Suggestion Recommendation Banner */}
      {suggestion && (
        <div className="p-4 bg-[#EAF0E9] border border-[#CCE0CB] rounded-[4px] shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B8862F]" />
              <span className="font-heading text-base font-normal text-[#1E2A26]">
                {suggestion.title}
              </span>
            </div>
            <div className="text-xs text-[#6B6A60]">
              {suggestion.taskName}
            </div>
            <div className="text-xs text-[#1E2A26] font-medium pt-1">
              {suggestion.impactText}
            </div>
            <div className="text-[11px] text-[#6B6A60]">
              {suggestion.matchText}
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDismissSuggestion}
              className="text-xs"
            >
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAcceptSuggestion}
              className="gap-1.5 text-xs"
              icon={Check}
            >
              Accept
            </Button>
          </div>
        </div>
      )}

      {/* Drag-and-Drop Columns with @dnd-kit */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columnsData.map((col) => {
            const colTasks = tasksData.filter((t) => t.assigneeId === col.id);
            return (
              <DroppableColumn
                key={col.id}
                column={col}
                tasks={colTasks}
                onReassignClick={(task) => {
                  setSelectedTaskForModal(task);
                  setIsModalOpen(true);
                }}
              />
            );
          })}
        </div>
      </DndContext>

      {/* Board Summary Footer */}
      <div className="p-4 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6B6A60]">
        <div>
          112 hrs across 3 people · 120 hrs capacity · Estimates include team rituals
        </div>
        <div className="font-medium text-[#1E2A26]">
          {isDirty ? 'Pending changes previewed (unsaved)' : 'No changes applied'}
        </div>
      </div>

      {/* Reassign Modal */}
      <ReassignTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTaskForModal || undefined}
        onSuccess={() => {
          loadData();
          setIsDirty(true);
        }}
      />
    </div>
  );
}

export default TaskRebalancerPage;
