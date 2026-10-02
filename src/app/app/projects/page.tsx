'use client';

// ==============================================================================
// NEXORA PROJECTS MANAGEMENT (/app/projects)
// Multi-tenant project catalog with filtering, sorting, RBAC and entitlement limits
// ==============================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useNexora } from '@/providers/nexora-provider';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { Project, ProjectStatus, ProjectPriority } from '@/types/database';

export default function ProjectsPage() {
  const {
    currentOrg,
    projects,
    createProject,
    updateProject,
    deleteProject,
    canPerform,
  } = useNexora();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'budget'>('date');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as ProjectStatus,
    priority: 'MEDIUM' as ProjectPriority,
    budget: '25000',
    target_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canCreate = canPerform('create_projects');
  const canEdit = canPerform('edit_projects');
  const canDelete = canPerform('delete_projects');

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || p.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'budget') {
          return (b.budget || 0) - (a.budget || 0);
        }
        return 0;
      });
  }, [projects, searchQuery, statusFilter, priorityFilter, sortBy]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      budget: '30000',
      target_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      budget: project.budget?.toString() || '0',
      target_date: project.target_date || '',
    });
    setFormError(null);
  };

  const handleOpenDelete = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingProject(project);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Project title is required');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await createProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        budget: parseFloat(formData.budget) || 0,
        target_date: formData.target_date || null,
      });
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      await updateProject(editingProject.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        budget: parseFloat(formData.budget) || 0,
        target_date: formData.target_date || null,
      });
      setEditingProject(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    setIsSubmitting(true);
    try {
      await deleteProject(deletingProject.id);
      setDeletingProject(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1F2333]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            Projects
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Tenant-isolated projects for <strong className="text-gray-300">{currentOrg?.name}</strong>.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleOpenCreate}
          disabled={!canCreate.allowed}
          title={canCreate.reason}
        >
          New Project
        </Button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#12141F] border border-[#232638] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-[#12141F] text-gray-300 border border-[#232638] rounded-lg px-2.5 py-1.5 focus:outline-none"
              aria-label="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-[#12141F] text-gray-300 border border-[#232638] rounded-lg px-2.5 py-1.5 focus:outline-none"
            aria-label="Filter by priority"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-[#12141F] text-gray-300 border border-[#232638] rounded-lg px-2.5 py-1.5 focus:outline-none"
              aria-label="Sort projects"
            >
              <option value="date">Newest First</option>
              <option value="name">Project Name</option>
              <option value="budget">Highest Budget</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-6 h-6" />}
          title={searchQuery ? 'No matching projects' : 'No projects yet'}
          description={
            searchQuery
              ? 'Try adjusting your search criteria or clear your active filters.'
              : 'Create your first project to start organizing team deliverables under this workspace.'
          }
          actionLabel={searchQuery ? undefined : 'Create Project'}
          onAction={handleOpenCreate}
          actionDisabled={!canCreate.allowed}
          disabledReason={canCreate.reason}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const totalTasks = project.tasks_count || 0;
            const completedTasks = project.completed_tasks_count || 0;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return (
              <div
                key={project.id}
                className="relative p-5 rounded-xl bg-[#11131C] border border-[#232638] hover:border-[#2F344D] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={project.status} />
                      <PriorityBadge priority={project.priority} />
                    </div>

                    <div className="flex items-center gap-1">
                      {canEdit.allowed && (
                        <button
                          onClick={(e) => handleOpenEdit(project, e)}
                          className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                          title="Edit Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete.allowed && (
                        <button
                          onClick={(e) => handleOpenDelete(project, e)}
                          className="p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <Link href={`/app/projects/${project.id}`} className="block mt-3 group-hover:text-indigo-300">
                    <h3 className="text-base font-semibold text-white tracking-tight flex items-center justify-between">
                      <span>{project.name}</span>
                      <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                  </Link>

                  <p className="mt-1.5 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#1C1F2E] space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      Tasks: {completedTasks}/{totalTasks}
                    </span>
                    {project.target_date && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {project.target_date}
                      </span>
                    )}
                  </div>

                  <div className="w-full h-1.5 bg-[#1B1E2B] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isCreateModalOpen || editingProject !== null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProject(null);
        }}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        description={`Configure project metadata for ${currentOrg?.name}.`}
      >
        <form onSubmit={editingProject ? handleEdit : handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Project Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Website Redesign"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Operational objectives, scope, and deliverables..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="PLANNING">PLANNING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ON_HOLD">ON_HOLD</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectPriority })}
                className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Estimated Budget ($)
              </label>
              <input
                type="number"
                placeholder="25000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingProject(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deletingProject !== null}
        onClose={() => setDeletingProject(null)}
        title="Delete Project"
        description="This action is destructive and requires Admin or Owner role."
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-300">
            Are you sure you want to permanently delete project{' '}
            <strong className="text-white font-semibold">{deletingProject?.name}</strong>? All associated tasks will be removed.
          </p>

          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[11px] text-rose-300 font-mono">
            Audit Event: project.deleted will be recorded with your user ID.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingProject(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={isSubmitting}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
