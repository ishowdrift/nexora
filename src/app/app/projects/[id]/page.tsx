'use client';

// ==============================================================================
// NEXORA PROJECT DETAILS & TASK WORKSPACE (/app/projects/[id])
// Project metadata, assignee task tracking, status boards, and RLS boundary guards
// ==============================================================================

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit3,
  User,
  ShieldAlert,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useNexora } from '@/providers/nexora-provider';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Task, TaskStatus, TaskPriority } from '@/types/database';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const {
    currentOrg,
    projects,
    tasks,
    members,
    createTask,
    updateTask,
    deleteTask,
    deleteProject,
    canPerform,
  } = useNexora();

  // Find project within current isolated tenant
  const project = projects.find((p) => p.id === projectId);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'TODO' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    due_date: '',
    assigned_to: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canCreateTask = canPerform('create_tasks');
  const canEditTask = canPerform('edit_tasks');
  const canDeleteTask = canPerform('delete_tasks');
  const canDeleteProj = canPerform('delete_projects');

  // If project is not found in the current tenant, show strict RLS boundary screen
  if (!project) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center animate-fade-in">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-block mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Project Not Found or Access Denied
        </h2>
        <p className="mt-2 text-xs text-gray-400 leading-relaxed font-mono">
          [PostgreSQL RLS Boundary] The requested resource ID (<code>{projectId}</code>) either does not exist or belongs to another organization tenant. Cross-tenant row queries are strictly excluded.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/app/projects">
            <Button size="sm" variant="secondary" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Projects
            </Button>
          </Link>
          <Link href="/app/security">
            <Button size="sm" variant="primary">
              Run Tenant Isolation Test
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.project_id === projectId);
  const completedTasks = projectTasks.filter((t) => t.status === 'DONE');

  const handleOpenCreateTask = () => {
    setTaskForm({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assigned_to: members[0]?.user_id || '',
    });
    setErrorMessage(null);
    setIsTaskModalOpen(true);
  };

  const handleCreateOrUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      setErrorMessage('Task title is required');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          status: taskForm.status,
          priority: taskForm.priority,
          due_date: taskForm.due_date || null,
          assigned_to: taskForm.assigned_to || null,
        });
        setEditingTask(null);
      } else {
        await createTask({
          project_id: projectId,
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          status: taskForm.status,
          priority: taskForm.priority,
          due_date: taskForm.due_date || null,
          assigned_to: taskForm.assigned_to || null,
        });
        setIsTaskModalOpen(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err: any) {
      alert(err.message || 'Permission denied to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete project '${project.name}'? This cannot be undone.`)) return;
    try {
      await deleteProject(project.id);
      router.push('/app/projects');
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/app/projects" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Projects
        </Link>
        <span>/</span>
        <span className="text-gray-200 font-medium truncate">{project.name}</span>
      </div>

      {/* Project Header Card */}
      <div className="p-6 rounded-xl bg-[#11131C] border border-[#232638] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>
            <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
              {project.description || 'No description provided for this project.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenCreateTask}
              disabled={!canCreateTask.allowed}
              title={canCreateTask.reason}
            >
              Add Task
            </Button>

            {canDeleteProj.allowed && (
              <Button
                size="sm"
                variant="outline"
                className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={handleDeleteProject}
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Metadata Details Bar */}
        <div className="pt-4 border-t border-[#1C1F2E] flex flex-wrap items-center gap-6 text-xs text-gray-400 font-mono">
          {project.budget ? (
            <div className="flex items-center gap-1.5 text-gray-300">
              <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
              <span>Budget: ${project.budget.toLocaleString()}</span>
            </div>
          ) : null}

          {project.target_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target: {project.target_date}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Completion: {completedTasks.length}/{projectTasks.length} tasks</span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto text-gray-500 text-[11px]">
            <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Task List / Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1F2333]">
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Project Tasks</span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 text-xs font-mono">
              {projectTasks.length}
            </span>
          </h2>
        </div>

        {projectTasks.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="w-6 h-6" />}
            title="No tasks assigned yet"
            description="Create tasks to organize sprints, assign work to teammates, and track milestones."
            actionLabel="Add Task"
            onAction={handleOpenCreateTask}
            actionDisabled={!canCreateTask.allowed}
            disabledReason={canCreateTask.reason}
          />
        ) : (
          <div className="space-y-2.5">
            {projectTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-[#11131C] border border-[#232638] hover:border-[#2F344D] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-medium tracking-tight ${
                        task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400 pt-0.5">
                    {task.assignee && (
                      <span className="flex items-center gap-1 text-gray-300">
                        <User className="w-3 h-3 text-indigo-400" />
                        {task.assignee.full_name}
                      </span>
                    )}
                    {task.due_date && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3" />
                        Due {task.due_date}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) => handleQuickStatusChange(task.id, e.target.value as TaskStatus)}
                    disabled={!canEditTask.allowed}
                    className="text-xs bg-[#171926] text-gray-200 border border-[#26293D] rounded-lg px-2.5 py-1.5 focus:outline-none disabled:opacity-50"
                    aria-label="Update task status"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="DONE">DONE</option>
                  </select>

                  {canDeleteTask.allowed && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Creation Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Task to Project"
        description={`Assign a task under '${project.name}'.`}
      >
        <form onSubmit={handleCreateOrUpdateTask} className="space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Write integration test suite for RLS"
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
              rows={3}
              placeholder="Detailed acceptance criteria..."
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
                    {m.profile?.full_name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTaskModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Add Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
