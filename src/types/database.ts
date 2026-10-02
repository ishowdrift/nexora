// ==============================================================================
// NEXORA B2B MULTI-TENANT SAAS - DATABASE TYPES & RBAC PERMISSION MATRIX
// ==============================================================================

export type MemberRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type AssetType = 'DOCUMENT' | 'IMAGE' | 'BRAND' | 'PDF' | 'CODE' | 'ARCHIVE';

export type SubscriptionPlan = 'FREE' | 'PRO' | 'BUSINESS';
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  title?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  domain?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget?: number;
  target_date?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  tasks_count?: number;
  completed_tasks_count?: number;
}

export interface Task {
  id: string;
  organization_id: string;
  project_id: string;
  assigned_to?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  assignee?: Profile;
  project_name?: string;
}

export interface Asset {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  type: AssetType;
  file_size: number; // in bytes
  mime_type: string;
  storage_path: string;
  uploaded_by?: string | null;
  created_at: string;
  updated_at: string;
  uploader?: Profile;
}

export interface ActivityLog {
  id: string;
  organization_id: string;
  actor_user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  actor?: Profile;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trial_ends_at?: string | null;
  current_period_start: string;
  current_period_end: string;
  canceled_at?: string | null;
  provider_customer_id?: string | null;
  provider_subscription_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationUsageStats {
  id: string;
  organization_id: string;
  members_count: number;
  projects_count: number;
  assets_count: number;
  storage_used: number; // bytes
  updated_at: string;
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: MemberRole;
  invited_by?: string | null;
  token: string;
  expires_at: string;
  status: InvitationStatus;
  created_at: string;
  inviter?: Profile;
  organization?: Organization;
}

// ------------------------------------------------------------------------------
// Centralized RBAC Permission Types
// ------------------------------------------------------------------------------
export type Permission =
  | 'view_dashboard'
  | 'view_projects'
  | 'create_projects'
  | 'edit_projects'
  | 'delete_projects'
  | 'view_tasks'
  | 'create_tasks'
  | 'edit_tasks'
  | 'delete_tasks'
  | 'view_assets'
  | 'upload_assets'
  | 'delete_assets'
  | 'view_members'
  | 'invite_members'
  | 'change_member_roles'
  | 'remove_members'
  | 'view_billing'
  | 'manage_billing'
  | 'view_audit_logs'
  | 'manage_organization';

export interface PlanLimits {
  name: string;
  priceMonthly: number;
  maxMembers: number;
  maxProjects: number;
  maxStorageBytes: number; // bytes
  features: string[];
}
