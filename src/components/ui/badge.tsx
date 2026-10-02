import React from 'react';
import { MemberRole, ProjectStatus, ProjectPriority, TaskStatus, SubscriptionStatus, SubscriptionPlan } from '@/types/database';

export function RoleBadge({ role }: { role: MemberRole | null | undefined }) {
  if (!role) return null;

  const styles: Record<MemberRole, { bg: string; text: string; border: string }> = {
    OWNER: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-300',
      border: 'border-purple-500/30',
    },
    ADMIN: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-300',
      border: 'border-indigo-500/30',
    },
    EDITOR: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-300',
      border: 'border-sky-500/30',
    },
    VIEWER: {
      bg: 'bg-zinc-500/10',
      text: 'text-zinc-400',
      border: 'border-zinc-500/30',
    },
  };

  const style = styles[role] || styles.VIEWER;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${style.bg} ${style.text} ${style.border}`}
    >
      {role}
    </span>
  );
}

export function StatusBadge({ status }: { status: ProjectStatus | TaskStatus | SubscriptionStatus }) {
  const styles: Record<string, { bg: string; text: string; border: string; label: string }> = {
    // Project & Task Statuses
    PLANNING: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20', label: 'Planning' },
    ACTIVE: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20', label: 'Active' },
    ON_HOLD: { bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/20', label: 'On Hold' },
    COMPLETED: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/20', label: 'Completed' },
    
    TODO: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20', label: 'To Do' },
    IN_PROGRESS: { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/20', label: 'In Progress' },
    REVIEW: { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/20', label: 'Review' },
    DONE: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20', label: 'Done' },

    // Subscription Statuses
    TRIALING: { bg: 'bg-sky-500/10', text: 'text-sky-300', border: 'border-sky-500/20', label: 'Trialing' },
    PAST_DUE: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20', label: 'Past Due' },
    CANCELED: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Canceled' },
    INCOMPLETE: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', label: 'Incomplete' },
  };

  const item = styles[status] || {
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-300',
    border: 'border-zinc-500/20',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${item.bg} ${item.text} ${item.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {item.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ProjectPriority }) {
  const styles: Record<ProjectPriority, { bg: string; text: string; border: string }> = {
    LOW: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' },
    MEDIUM: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/20' },
    HIGH: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' },
    URGENT: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20' },
  };

  const item = styles[priority] || styles.MEDIUM;

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider font-semibold border ${item.bg} ${item.text} ${item.border}`}
    >
      {priority}
    </span>
  );
}

export function PlanBadge({ plan }: { plan: SubscriptionPlan }) {
  const styles: Record<SubscriptionPlan, { bg: string; text: string; border: string }> = {
    FREE: { bg: 'bg-zinc-500/15', text: 'text-zinc-300', border: 'border-zinc-500/30' },
    PRO: { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/40' },
    BUSINESS: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40' },
  };

  const item = styles[plan] || styles.FREE;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold tracking-wide border ${item.bg} ${item.text} ${item.border}`}
    >
      {plan}
    </span>
  );
}
