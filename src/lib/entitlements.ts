// ==============================================================================
// NEXORA SUBSCRIPTION PLAN ENTITLEMENTS & USAGE LIMITS ENGINE
// ==============================================================================

import { SubscriptionPlan, PlanLimits } from '@/types/database';

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: {
    name: 'Free Tier',
    priceMonthly: 0,
    maxMembers: 5,
    maxProjects: 5,
    maxStorageBytes: 1 * 1024 * 1024 * 1024, // 1 GB
    features: [
      'Up to 5 team members',
      'Up to 5 active projects',
      '1 GB secure asset storage',
      'Standard task boards',
      'Community support',
    ],
  },
  PRO: {
    name: 'Pro Operations',
    priceMonthly: 49,
    maxMembers: 25,
    maxProjects: 50,
    maxStorageBytes: 25 * 1024 * 1024 * 1024, // 25 GB
    features: [
      'Up to 25 team members',
      'Up to 50 active projects',
      '25 GB secure asset storage',
      'Advanced task priorities & filters',
      'Full organization audit logs',
      'Priority email support',
    ],
  },
  BUSINESS: {
    name: 'Business Enterprise',
    priceMonthly: 199,
    maxMembers: 100,
    maxProjects: 500,
    maxStorageBytes: 100 * 1024 * 1024 * 1024, // 100 GB
    features: [
      'Up to 100 team members',
      'Unlimited / 500 active projects',
      '100 GB secure asset storage',
      'Comprehensive security & compliance audit logs',
      'Simulated webhook ingestion & custom webhooks',
      'Dedicated operations architect support',
    ],
  },
};

export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Checks whether an organization can add another member.
 */
export function checkMemberLimit(
  currentMembersCount: number,
  plan: SubscriptionPlan
): { allowed: boolean; maxAllowed: number; currentCount: number; reason?: string } {
  const limits = getPlanLimits(plan);
  if (currentMembersCount >= limits.maxMembers) {
    return {
      allowed: false,
      maxAllowed: limits.maxMembers,
      currentCount: currentMembersCount,
      reason: `Plan member limit reached (${currentMembersCount}/${limits.maxMembers}). Upgrade your plan to invite more team members.`,
    };
  }
  return {
    allowed: true,
    maxAllowed: limits.maxMembers,
    currentCount: currentMembersCount,
  };
}

/**
 * Checks whether an organization can create another project.
 */
export function checkProjectLimit(
  currentProjectsCount: number,
  plan: SubscriptionPlan
): { allowed: boolean; maxAllowed: number; currentCount: number; reason?: string } {
  const limits = getPlanLimits(plan);
  if (currentProjectsCount >= limits.maxProjects) {
    return {
      allowed: false,
      maxAllowed: limits.maxProjects,
      currentCount: currentProjectsCount,
      reason: `Plan project limit reached (${currentProjectsCount}/${limits.maxProjects}). Upgrade to Pro or Business to create more projects.`,
    };
  }
  return {
    allowed: true,
    maxAllowed: limits.maxProjects,
    currentCount: currentProjectsCount,
  };
}

/**
 * Checks whether an organization has enough storage quota for an upload.
 */
export function checkStorageLimit(
  currentStorageBytes: number,
  additionalBytes: number,
  plan: SubscriptionPlan
): { allowed: boolean; maxBytes: number; currentBytes: number; reason?: string } {
  const limits = getPlanLimits(plan);
  const projectedTotal = currentStorageBytes + additionalBytes;
  if (projectedTotal > limits.maxStorageBytes) {
    return {
      allowed: false,
      maxBytes: limits.maxStorageBytes,
      currentBytes: currentStorageBytes,
      reason: `Storage limit exceeded. Current: ${formatBytes(currentStorageBytes)}, Upload: ${formatBytes(additionalBytes)}, Limit: ${formatBytes(limits.maxStorageBytes)}. Upgrade your plan for additional storage.`,
    };
  }
  return {
    allowed: true,
    maxBytes: limits.maxStorageBytes,
    currentBytes: currentStorageBytes,
  };
}
