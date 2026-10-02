// ==============================================================================
// NEXORA RBAC PERMISSION ENFORCEMENT ENGINE
// Server and Client verified authorization logic
// ==============================================================================

import { MemberRole, Permission } from '@/types/database';

export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
};

export const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
  OWNER: [
    'view_dashboard',
    'view_projects',
    'create_projects',
    'edit_projects',
    'delete_projects',
    'view_tasks',
    'create_tasks',
    'edit_tasks',
    'delete_tasks',
    'view_assets',
    'upload_assets',
    'delete_assets',
    'view_members',
    'invite_members',
    'change_member_roles',
    'remove_members',
    'view_billing',
    'manage_billing',
    'view_audit_logs',
    'manage_organization',
  ],
  ADMIN: [
    'view_dashboard',
    'view_projects',
    'create_projects',
    'edit_projects',
    'delete_projects',
    'view_tasks',
    'create_tasks',
    'edit_tasks',
    'delete_tasks',
    'view_assets',
    'upload_assets',
    'delete_assets',
    'view_members',
    'invite_members',
    'change_member_roles',
    'remove_members',
    'view_billing',
    'manage_billing',
    'view_audit_logs',
    // Excluded: manage_organization (destructive ownership actions like org deletion)
  ],
  EDITOR: [
    'view_dashboard',
    'view_projects',
    'create_projects',
    'edit_projects',
    'view_tasks',
    'create_tasks',
    'edit_tasks',
    'view_assets',
    'upload_assets',
    'view_members',
    // Excluded: delete operations, member management, billing, audit logs, org settings
  ],
  VIEWER: [
    'view_dashboard',
    'view_projects',
    'view_tasks',
    'view_assets',
    'view_members',
    // Strictly read-only access across all domains
  ],
};

/**
 * Check if a given role is granted a specific permission.
 */
export function hasPermission(role: MemberRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Evaluate whether an actor with a given role can perform an action, returning a human-readable reason if denied.
 */
export function canPerformAction(
  actorRole: MemberRole | undefined | null,
  action: Permission
): { allowed: boolean; reason?: string } {
  if (!actorRole) {
    return {
      allowed: false,
      reason: 'Authentication required. No tenant role found.',
    };
  }

  const allowed = hasPermission(actorRole, action);
  if (!allowed) {
    return {
      allowed: false,
      reason: `Role '${actorRole}' is not authorized to execute '${action}'.`,
    };
  }

  return { allowed: true };
}

/**
 * Validates whether an actor can change target member's role.
 * - OWNER can assign any role to anyone.
 * - ADMIN can only change roles of EDITOR or VIEWER, and cannot grant OWNER.
 * - EDITOR & VIEWER cannot change any roles.
 * - Users cannot elevate their own role.
 */
export function canModifyMemberRole(
  actorRole: MemberRole,
  actorUserId: string,
  targetUserId: string,
  targetCurrentRole: MemberRole,
  newRole: MemberRole
): { allowed: boolean; reason?: string } {
  // Prevent self-role modification to stop privilege escalation
  if (actorUserId === targetUserId) {
    return {
      allowed: false,
      reason: 'Users cannot modify their own organization role.',
    };
  }

  if (actorRole === 'OWNER') {
    return { allowed: true };
  }

  if (actorRole === 'ADMIN') {
    // Admin cannot touch an OWNER
    if (targetCurrentRole === 'OWNER') {
      return {
        allowed: false,
        reason: 'Administrators cannot alter an Owner’s role.',
      };
    }
    // Admin cannot promote someone to OWNER
    if (newRole === 'OWNER') {
      return {
        allowed: false,
        reason: 'Only the Organization Owner can transfer or grant Owner status.',
      };
    }
    // Admin cannot modify another ADMIN's role
    if (targetCurrentRole === 'ADMIN') {
      return {
        allowed: false,
        reason: 'Administrators cannot modify other Administrators.',
      };
    }
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Insufficient permissions. Only Owners and Admins can update roles.',
  };
}

/**
 * Validates whether an actor can remove a member from the organization.
 */
export function canRemoveMember(
  actorRole: MemberRole,
  actorUserId: string,
  targetUserId: string,
  targetRole: MemberRole,
  totalOwnersCount: number
): { allowed: boolean; reason?: string } {
  // A user leaving voluntarily is permitted unless they are the sole owner
  if (actorUserId === targetUserId) {
    if (targetRole === 'OWNER' && totalOwnersCount <= 1) {
      return {
        allowed: false,
        reason: 'The sole Owner cannot leave the organization without transferring ownership first.',
      };
    }
    return { allowed: true };
  }

  if (actorRole === 'OWNER') {
    if (targetRole === 'OWNER' && totalOwnersCount <= 1) {
      return {
        allowed: false,
        reason: 'Cannot remove the only organization Owner.',
      };
    }
    return { allowed: true };
  }

  if (actorRole === 'ADMIN') {
    if (targetRole === 'OWNER') {
      return {
        allowed: false,
        reason: 'Admins cannot remove an Organization Owner.',
      };
    }
    if (targetRole === 'ADMIN') {
      return {
        allowed: false,
        reason: 'Admins cannot remove fellow Administrators.',
      };
    }
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Insufficient permissions to remove members.',
  };
}
