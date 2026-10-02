'use client';

// ==============================================================================
// NEXORA TASKS MANAGEMENT (/app/tasks)
// Global task board across all organization projects with RBAC enforcement
// ==============================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  User,
  Clock,
  Trash2,
  FolderKanban,
} from 'lucide-react';
import { useNexora } from '@/providers/nexora-provider';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { Task, TaskStatus, TaskPriority } from '@/types/database';

export default function TasksPage() {
  const {
    currentOrg,
    tasks,
    projects,
    members,
    createTask,
    updateTask,
    deleteTask,
    canPerform,
  } = useNexora();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    project_id: '',
    title: '',
    description: '',
    status: 'TODO' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    due_date: '',
    assigned_to: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canCreate = canPerform('create_tasks');
  const canEdit = canPerform('edit_tasks');
  const canDelete = canPerform('delete_tasks');

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'ALL' || t.assigned_to === assigneeFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter]);

  const handleOpenCreate = () => {
    setTaskForm({
      project_id: projects[0]?.id || '',
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assigned_to: members[0]?.user_id || '',
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      setFormError('Task title is required');
      return;
    }
    if (!taskForm.project_id) {
      setFormError('Please select a project for this task');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await createTask({
        project_id: taskForm.project_id,
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        status: taskForm.status,
        priority: taskForm.priority,
        due_date: taskForm.due_date || null,
        assigned_to: taskForm.assigned_to || null,
      });
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err: any) {
      alert(err.message || 'Permission denied to update task status');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Permanently remove this task?')) return;
    try {
      await deleteTask(taskId);
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  const columns: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1F2333]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            Workspace Tasks
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Sprint board and task milestones for <strong className="text-gray-300">{currentOrg?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-[#141624] p-0.5 border border-[#232638]">
            <button
              onClick={() => setViewMode('board')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'board'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>

          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenCreate}
            disabled={!canCreate.allowed}
            title={canCreate.reason}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#12141F] border border-[#232638] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-[#12141F] text-gray-300 border border-[#232638] rounded-lg px-2.5 py-1.5 focus:outline-none"
            aria-label="Filter tasks by priority"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="text-xs bg-[#12141F] text-gray-300 border border-[#232638] rounded-lg px-2.5 py-1.5 focus:outline-none"
            aria-label="Filter tasks by assignee"
          >
            <option value="ALL">All Assignees</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.profile?.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((columnStatus) => {
            const columnTasks = filteredTasks.filter((t) => t.status === columnStatus);
            return (
              <div
                key={columnStatus}
                className="rounded-xl bg-[#0F101A] border border-[#212436] p-3 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#1C1F2E]">
                  <span className="text-xs font-mono font-semibold text-gray-300">
                    {columnStatus.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-gray-500 bg-[#171926] px-1.5 py-0.5 rounded">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[220px]">
                  {columnTasks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-600 border border-dashed border-[#1E2130] rounded-lg">
                      No tasks in {columnStatus.toLowerCase().replace('_', ' ')}
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-lg bg-[#141624] border border-[#232638] hover:border-[#31364F] space-y-2 transition-all shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-white line-clamp-2">
                            {task.title}
                          </span>
                          <PriorityBadge priority={task.priority} />
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-gray-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-[#1C1F2E] flex items-center justify-between text-[10px] font-mono text-gray-400">
                          <span className="text-indigo-400 truncate max-w-[100px]">
                            {task.project_name || 'Project'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {task.assignee && (
                              <span className="text-gray-300 truncate max-w-[80px]">
                                {task.assignee.full_name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Switcher & Delete Button */}
                        <div className="flex items-center justify-between pt-1">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                            disabled={!canEdit.allowed}
                            className="text-[10px] bg-[#1A1D2D] text-gray-300 border border-[#292D42] rounded px-1.5 py-1 focus:outline-none"
                            aria-label="Change task column status"
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="REVIEW">Review</option>
                            <option value="DONE">Done</option>
                          </select>

                          {canDelete.allowed && (
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="text-gray-500 hover:text-rose-400 p-1"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="w-6 h-6" />}
              title="No tasks found"
              description="No tasks match the active filters or criteria."
              actionLabel="Create Task"
              onAction={handleOpenCreate}
              actionDisabled={!canCreate.allowed}
              disabledReason={canCreate.reason}
            />
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-[#11131C] border border-[#232638] flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white truncate">
                      {task.title}
                    </span>
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500">
                    <span>{task.project_name}</span>
                    {task.assignee && <span>• {task.assignee.full_name}</span>}
                    {task.due_date && <span>• Due {task.due_date}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                    disabled={!canEdit.allowed}
                    className="text-xs bg-[#171926] text-gray-200 border border-[#26293D] rounded-lg px-2 py-1 focus:outline-none"
                    aria-label="Change status"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="DONE">DONE</option>
                  </select>

                  {canDelete.allowed && (
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1 rounded text-gray-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        description={`Add a task to ${currentOrg?.name}.`}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Select Project <span className="text-rose-400">*</span>
            </label>
            <select
              value={taskForm.project_id}
              onChange={(e) => setTaskForm({ ...taskForm, project_id: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Audit database indexes"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Task details and deliverables..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Assignee
              </label>
              <select
                value={taskForm.assigned_to}
                onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.profile?.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
