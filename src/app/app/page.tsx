'use client';

// ==============================================================================
// NEXORA WORKSPACE DASHBOARD (/app)
// Dense, high-signal enterprise operations overview
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  CheckSquare,
  Users,
  HardDrive,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useNexora } from '@/providers/nexora-provider';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge, PriorityBadge, RoleBadge, PlanBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { getPlanLimits, formatBytes } from '@/lib/entitlements';
import { ProjectStatus, ProjectPriority } from '@/types/database';

export default function DashboardPage() {
  const {
    currentOrg,
    currentUser,
    currentMemberRole,
    projects,
    tasks,
    members,
    activityLogs,
    subscription,
    usageStats,
    createProject,
    canPerform,
  } = useNexora();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ProjectPriority>('MEDIUM');
  const [budget, setBudget] = useState('20000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const planLimits = getPlanLimits(subscription?.plan || 'FREE');
  const canCreate = canPerform('create_projects');

  const pendingTasks = tasks.filter((t) => t.status !== 'DONE');
  const completedTasks = tasks.filter((t) => t.status === 'DONE');
  const recentProjects = projects.slice(0, 4);
  const recentLogs = activityLogs.slice(0, 5);

  // Storage calculation
  const storagePercentage = (usageStats.storage_used / planLimits.maxStorageBytes) * 100;
  const projectsPercentage = (usageStats.projects_count / planLimits.maxProjects) * 100;
  const membersPercentage = (usageStats.members_count / planLimits.maxMembers) * 100;

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Project name is required');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await createProject({
        name: name.trim(),
        description: description.trim(),
        status: 'ACTIVE',
        priority,
        budget: parseFloat(budget) || 0,
      });
      setIsCreateModalOpen(false);
      setName('');
      setDescription('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Organization Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1F2333]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              {currentOrg?.name}
            </h1>
            <PlanBadge plan={subscription?.plan || 'FREE'} />
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {subscription?.status || 'ACTIVE'}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400 font-mono">
            Tenant ID: <span className="text-gray-300">{currentOrg?.id}</span> • Domain: {currentOrg?.domain || 'Custom'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!canCreate.allowed}
            title={canCreate.reason}
          >
            New Project
          </Button>

          <Link href="/app/security">
            <Button size="sm" variant="secondary" icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}>
              Audit RLS
            </Button>
          </Link>
        </div>
      </div>

      {/* Permission Warning Notice if Viewer */}
      {currentMemberRole === 'VIEWER' && (
        <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-700/50 flex items-center gap-3 text-xs text-zinc-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            You are browsing as <strong>Maya Chen (VIEWER)</strong>. You have read-only access to this workspace. State mutation actions will be blocked by the server & PostgreSQL RLS policies. Switch persona in the sidebar to test Owner or Admin actions.
          </span>
        </div>
      )}

      {/* Key Usage & Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Projects"
          value={usageStats.projects_count}
          total={planLimits.maxProjects}
          percentage={projectsPercentage}
          icon={<FolderKanban className="w-4 h-4" />}
          subtitle={`${projects.filter((p) => p.status === 'ACTIVE').length} currently active in cycle`}
          color="indigo"
        />

        <StatCard
          label="Team Members"
          value={usageStats.members_count}
          total={planLimits.maxMembers}
          percentage={membersPercentage}
          icon={<Users className="w-4 h-4" />}
          subtitle={`${members.filter((m) => m.role === 'OWNER' || m.role === 'ADMIN').length} management seats`}
          color="sky"
        />

        <StatCard
          label="Secure Storage"
          value={formatBytes(usageStats.storage_used)}
          total={formatBytes(planLimits.maxStorageBytes)}
          percentage={storagePercentage}
          icon={<HardDrive className="w-4 h-4" />}
          subtitle={`${usageStats.assets_count} uploaded digital assets`}
          color="emerald"
        />

        <StatCard
          label="Pending Tasks"
          value={pendingTasks.length}
          total={tasks.length}
          percentage={tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}
          icon={<CheckSquare className="w-4 h-4" />}
          subtitle={`${completedTasks.length} tasks completed`}
          color="amber"
        />
      </div>

      {/* Secondary Row: Projects Overview & Operational Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2333]">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Current Projects
              </h2>
            </div>
            <Link
              href="/app/projects"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              View all ({projects.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              icon={<FolderKanban className="w-6 h-6" />}
              title="No projects yet"
              description="Create your first project to start organizing your team's work under this organization."
              actionLabel="Create Project"
              onAction={() => setIsCreateModalOpen(true)}
              actionDisabled={!canCreate.allowed}
              disabledReason={canCreate.reason}
            />
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => {
                const totalProjTasks = project.tasks_count || 0;
                const completedProjTasks = project.completed_tasks_count || 0;
                const progress = totalProjTasks > 0 ? (completedProjTasks / totalProjTasks) * 100 : 0;

                return (
                  <Link
                    key={project.id}
                    href={`/app/projects/${project.id}`}
                    className="block p-4 rounded-xl bg-[#11131C] border border-[#232638] hover:border-[#2F344D] hover:bg-[#141624] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                            {project.name}
                          </h3>
                          <StatusBadge status={project.status} />
                          <PriorityBadge priority={project.priority} />
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {project.description || 'No description provided.'}
                        </p>
                      </div>

                      <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#1C1F2E] flex items-center justify-between text-xs text-gray-400 font-mono">
                      <div className="flex items-center gap-3">
                        <span>Tasks: {completedProjTasks}/{totalProjTasks}</span>
                        {project.budget ? (
                          <span>Budget: ${project.budget.toLocaleString()}</span>
                        ) : null}
                      </div>

                      <div className="w-24 h-1.5 bg-[#1B1E2B] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1/3): Audit Trail & Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2333]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Recent Organization Activity
              </h2>
            </div>
            <Link
              href="/app/activity"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              Full log
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-[#11131C] border border-[#232638] space-y-4">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">
                No activity recorded yet for this organization.
              </p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs pb-3 border-b border-[#1B1E2D] last:border-0 last:pb-0">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {log.actor?.full_name?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200">
                      <strong className="text-white font-medium">
                        {log.actor?.full_name || 'System'}
                      </strong>{' '}
                      <span className="text-gray-400">performed</span>{' '}
                      <code className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded">
                        {log.action}
                      </code>
                    </p>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Subscription Entitlement Quick Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#121422] to-[#151829] border border-[#262A3F]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">
                Subscription Plan
              </span>
              <PlanBadge plan={subscription?.plan || 'FREE'} />
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Plan includes {planLimits.maxMembers} members, {planLimits.maxProjects} projects, and {formatBytes(planLimits.maxStorageBytes)} asset storage.
            </p>
            <div className="mt-3 pt-3 border-t border-[#202438] flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-mono">
                ${planLimits.priceMonthly}/mo
              </span>
              <Link href="/app/billing">
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Manage Tier
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        description={`Add an operational project to ${currentOrg?.name}. Protected by Row-Level Security.`}
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Project Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Omnichannel Digital Storefront"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Operational goals, delivery milestones, and team targets..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
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
                Estimated Budget ($)
              </label>
              <input
                type="number"
                placeholder="25000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
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
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
