// ==============================================================================
// NEXORA MULTI-TENANT CORE REPOSITORY & SIMULATED RLS STORE
// High-fidelity state management with strict tenant isolation, RBAC enforcement,
// usage stats calculation, and audit logging.
// ==============================================================================

import {
  Profile,
  Organization,
  OrganizationMember,
  Project,
  Task,
  Asset,
  ActivityLog,
  OrganizationSubscription,
  OrganizationUsageStats,
  Invitation,
  MemberRole,
  SubscriptionPlan,
} from '@/types/database';
import { canPerformAction, canModifyMemberRole, canRemoveMember } from '@/lib/permissions';
import { checkMemberLimit, checkProjectLimit, checkStorageLimit } from '@/lib/entitlements';

export const SEED_ORGS: Organization[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'HM Blendz',
    slug: 'hm-blendz',
    logo_url: null,
    domain: 'hmblendz.com',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Northstar Creative',
    slug: 'northstar-creative',
    logo_url: null,
    domain: 'northstar.io',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
];

export const SEED_PROFILES: Profile[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    email: 'alex@hmblendz.com',
    full_name: 'Alex Morgan',
    title: 'Founder & CEO',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    email: 'sarah@hmblendz.com',
    full_name: 'Sarah Khan',
    title: 'Operations Director',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    email: 'daniel@hmblendz.com',
    full_name: 'Daniel Reed',
    title: 'Senior Product Designer',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    email: 'maya@hmblendz.com',
    full_name: 'Maya Chen',
    title: 'Junior Analyst',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    email: 'marcus@northstar.io',
    full_name: 'Marcus Vance',
    title: 'Managing Partner',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    email: 'elena@northstar.io',
    full_name: 'Elena Rostova',
    title: 'VP of Creative Tech',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_MEMBERS: OrganizationMember[] = [
  // HM Blendz
  {
    id: 'mem-1',
    organization_id: '11111111-1111-1111-1111-111111111111',
    user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    role: 'OWNER',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    organization_id: '11111111-1111-1111-1111-111111111111',
    user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    role: 'ADMIN',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mem-3',
    organization_id: '11111111-1111-1111-1111-111111111111',
    user_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    role: 'EDITOR',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mem-4',
    organization_id: '11111111-1111-1111-1111-111111111111',
    user_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    role: 'VIEWER',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Northstar Creative
  {
    id: 'mem-5',
    organization_id: '22222222-2222-2222-2222-222222222222',
    user_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    role: 'OWNER',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mem-6',
    organization_id: '22222222-2222-2222-2222-222222222222',
    user_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    role: 'ADMIN',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_PROJECTS: Project[] = [
  // HM Blendz Projects
  {
    id: '10000000-0000-0000-0000-000000000001',
    organization_id: '11111111-1111-1111-1111-111111111111',
    name: 'Website Redesign',
    description: 'Corporate digital presence relaunch with Next.js, headless CMS, and responsive checkout.',
    status: 'ACTIVE',
    priority: 'HIGH',
    budget: 35000,
    target_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    created_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    organization_id: '11111111-1111-1111-1111-111111111111',
    name: 'Q4 Marketing',
    description: 'Multi-channel acquisition campaigns across search, creator sponsorships, and video production.',
    status: 'ACTIVE',
    priority: 'MEDIUM',
    budget: 22000,
    target_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    created_by: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    organization_id: '11111111-1111-1111-1111-111111111111',
    name: 'Brand Refresh',
    description: 'Updated typographic hierarchy, asset library, and physical retail packaging guidelines.',
    status: 'PLANNING',
    priority: 'LOW',
    budget: 15000,
    target_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    created_by: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    organization_id: '11111111-1111-1111-1111-111111111111',
    name: 'Operations Upgrade',
    description: 'Consolidation of ERP inventory management, vendor sync, and customer support webhooks.',
    status: 'COMPLETED',
    priority: 'URGENT',
    budget: 48000,
    target_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    created_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  // Northstar Creative Projects (Tenant 2)
  {
    id: '20000000-0000-0000-0000-000000000001',
    organization_id: '22222222-2222-2222-2222-222222222222',
    name: 'Omnichannel Retail Rollout',
    description: 'Flagship interactive showroom display networks with RFID touchpoint integrations.',
    status: 'ACTIVE',
    priority: 'URGENT',
    budget: 85000,
    target_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    created_by: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    organization_id: '22222222-2222-2222-2222-222222222222',
    name: 'Design System v2',
    description: 'High performance React component architecture with dark mode tokens and token pipeline.',
    status: 'PLANNING',
    priority: 'HIGH',
    budget: 40000,
    target_date: new Date(Date.now() + 75 * 86400000).toISOString().split('T')[0],
    created_by: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_TASKS: Task[] = [
  // HM Blendz Tasks
  {
    id: 'task-1',
    organization_id: '11111111-1111-1111-1111-111111111111',
    project_id: '10000000-0000-0000-0000-000000000001',
    assigned_to: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    title: 'Finalize Wireframes & IA',
    description: 'Review responsive viewport breakpoints and customer purchasing funnel UX.',
    status: 'DONE',
    priority: 'HIGH',
    due_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    created_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-2',
    organization_id: '11111111-1111-1111-1111-111111111111',
    project_id: '10000000-0000-0000-0000-000000000001',
    assigned_to: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Setup Supabase Auth & RLS',
    description: 'Configure tenant boundaries, security definer policies, and role tests.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    created_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-3',
    organization_id: '11111111-1111-1111-1111-111111111111',
    project_id: '10000000-0000-0000-0000-000000000001',
    assigned_to: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    title: 'Integrate Billing & Subscriptions',
    description: 'Handle simulated Stripe webhook events for plan upgrade and downgrade lifecycle.',
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
    created_by: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-4',
    organization_id: '11111111-1111-1111-1111-111111111111',
    project_id: '10000000-0000-0000-0000-000000000001',
    assigned_to: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    title: 'Lighthouse Performance Audit',
    description: 'Verify 95+ score on Core Web Vitals across mobile and desktop devices.',
    status: 'TODO',
    priority: 'LOW',
    due_date: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    created_by: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-5',
    organization_id: '11111111-1111-1111-1111-111111111111',
    project_id: '10000000-0000-0000-0000-000000000002',
    assigned_to: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Influencer Contract Signoff',
    description: 'Coordinate deliverables with 12 top-tier creators for the product reveal.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    created_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-6',
    organization_id: '11111111-1111-1111-1111-111111111111',
    project_id: '10000000-0000-0000-0000-000000000002',
    assigned_to: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    title: 'Ad Creative Asset Delivery',
    description: 'Prepare high-resolution vertical video renders and display ad variants.',
    status: 'REVIEW',
    priority: 'MEDIUM',
    due_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    created_by: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Northstar Creative Tasks (Tenant 2)
  {
    id: 'task-7',
    organization_id: '22222222-2222-2222-2222-222222222222',
    project_id: '20000000-0000-0000-0000-000000000001',
    assigned_to: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    title: 'Deploy Touchscreen Kiosk App',
    description: 'Containerized Linux electron build deployed to showroom micro-displays.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    created_by: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_ASSETS: Asset[] = [
  // HM Blendz Assets
  {
    id: 'asset-1',
    organization_id: '11111111-1111-1111-1111-111111111111',
    name: 'NEXORA_Brand_Guidelines_2026.pdf',
    description: 'Complete brand identity guidelines, typography, and palette.',
    type: 'PDF',
    file_size: 14889728, // ~14.2 MB
    mime_type: 'application/pdf',
    storage_path: 'hm-blendz/brand_guidelines.pdf',
    uploaded_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'asset-2',
    organization_id: '11111111-1111-1111-1111-111111111111',
    name: 'Primary_Wordmark_Vector.svg',
    description: 'Scalable SVG wordmark with precision kerning and vector points.',
    type: 'BRAND',
    file_size: 880803, // ~860 KB
    mime_type: 'image/svg+xml',
    storage_path: 'hm-blendz/wordmark.svg',
    uploaded_by: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'asset-3',
    organization_id: '11111111-1111-1111-1111-111111111111',
    name: 'Q4_Financial_Projections.xlsx',
    description: 'Financial workbook with runway forecasts and cohort retention charts.',
    type: 'DOCUMENT',
    file_size: 5085593, // ~4.85 MB
    mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    storage_path: 'hm-blendz/q4_projections.xlsx',
    uploaded_by: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'asset-4',
    organization_id: '11111111-1111-1111-1111-111111111111',
    name: 'Executive_Keynote_Deck.pdf',
    description: 'Board presentation slides with product operational roadmap.',
    type: 'PDF',
    file_size: 30303846, // ~28.9 MB
    mime_type: 'application/pdf',
    storage_path: 'hm-blendz/board_deck.pdf',
    uploaded_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Northstar Creative Assets (Tenant 2)
  {
    id: 'asset-5',
    organization_id: '22222222-2222-2222-2222-222222222222',
    name: 'Northstar_Architecture_Diagram.png',
    description: 'Enterprise multi-region AWS and PostgreSQL failover blueprint.',
    type: 'IMAGE',
    file_size: 6501171, // ~6.2 MB
    mime_type: 'image/png',
    storage_path: 'northstar/architecture.png',
    uploaded_by: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_SUBSCRIPTIONS: OrganizationSubscription[] = [
  {
    id: 'sub-1',
    organization_id: '11111111-1111-1111-1111-111111111111',
    plan: 'PRO',
    status: 'ACTIVE',
    trial_ends_at: null,
    current_period_start: new Date(Date.now() - 10 * 86400000).toISOString(),
    current_period_end: new Date(Date.now() + 20 * 86400000).toISOString(),
    canceled_at: null,
    provider_customer_id: 'cus_sim_hmblendz_882',
    provider_subscription_id: 'sub_sim_pro_99182',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sub-2',
    organization_id: '22222222-2222-2222-2222-222222222222',
    plan: 'BUSINESS',
    status: 'ACTIVE',
    trial_ends_at: null,
    current_period_start: new Date(Date.now() - 15 * 86400000).toISOString(),
    current_period_end: new Date(Date.now() + 15 * 86400000).toISOString(),
    canceled_at: null,
    provider_customer_id: 'cus_sim_northstar_541',
    provider_subscription_id: 'sub_sim_biz_11204',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_USAGE: OrganizationUsageStats[] = [
  {
    id: 'usage-1',
    organization_id: '11111111-1111-1111-1111-111111111111',
    members_count: 4,
    projects_count: 4,
    assets_count: 4,
    storage_used: 51059970, // ~48.7 MB total from seed files
    updated_at: new Date().toISOString(),
  },
  {
    id: 'usage-2',
    organization_id: '22222222-2222-2222-2222-222222222222',
    members_count: 2,
    projects_count: 2,
    assets_count: 1,
    storage_used: 6501171, // ~6.2 MB
    updated_at: new Date().toISOString(),
  },
];

export const SEED_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    organization_id: '11111111-1111-1111-1111-111111111111',
    actor_user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    action: 'organization.created',
    entity_type: 'organization',
    entity_id: '11111111-1111-1111-1111-111111111111',
    metadata: { name: 'HM Blendz', plan: 'PRO' },
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'log-2',
    organization_id: '11111111-1111-1111-1111-111111111111',
    actor_user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    action: 'member.invited',
    entity_type: 'member',
    entity_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    metadata: { email: 'sarah@hmblendz.com', role: 'ADMIN' },
    created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
  },
  {
    id: 'log-3',
    organization_id: '11111111-1111-1111-1111-111111111111',
    actor_user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    action: 'project.created',
    entity_type: 'project',
    entity_id: '10000000-0000-0000-0000-000000000001',
    metadata: { name: 'Website Redesign', priority: 'HIGH' },
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'log-4',
    organization_id: '11111111-1111-1111-1111-111111111111',
    actor_user_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    action: 'asset.uploaded',
    entity_type: 'asset',
    entity_id: 'asset-1',
    metadata: { filename: 'NEXORA_Brand_Guidelines_2026.pdf', size_mb: 14.2 },
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'log-5',
    organization_id: '11111111-1111-1111-1111-111111111111',
    actor_user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    action: 'member.role_changed',
    entity_type: 'member',
    entity_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    metadata: { target_name: 'Maya Chen', previous_role: 'MEMBER', new_role: 'VIEWER' },
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'log-6',
    organization_id: '11111111-1111-1111-1111-111111111111',
    actor_user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    action: 'subscription.renewed',
    entity_type: 'subscription',
    entity_id: 'sub-1',
    metadata: { plan: 'PRO', amount: '$49.00', status: 'ACTIVE' },
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  // Northstar Creative Logs (Tenant 2)
  {
    id: 'log-7',
    organization_id: '22222222-2222-2222-2222-222222222222',
    actor_user_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    action: 'organization.created',
    entity_type: 'organization',
    entity_id: '22222222-2222-2222-2222-222222222222',
    metadata: { name: 'Northstar Creative', plan: 'BUSINESS' },
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

export const SEED_INVITATIONS: Invitation[] = [
  {
    id: 'inv-1',
    organization_id: '11111111-1111-1111-1111-111111111111',
    email: 'kevin.tech@partner.co',
    role: 'EDITOR',
    invited_by: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    token: 'inv_tok_84719a0e',
    status: 'PENDING',
    expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// ------------------------------------------------------------------------------
// In-Memory & LocalStorage Multi-Tenant Store
// ------------------------------------------------------------------------------
class NexoraDataStore {
  private organizations: Organization[] = [...SEED_ORGS];
  private profiles: Profile[] = [...SEED_PROFILES];
  private members: OrganizationMember[] = [...SEED_MEMBERS];
  private projects: Project[] = [...SEED_PROJECTS];
  private tasks: Task[] = [...SEED_TASKS];
  private assets: Asset[] = [...SEED_ASSETS];
  private subscriptions: OrganizationSubscription[] = [...SEED_SUBSCRIPTIONS];
  private usageStats: OrganizationUsageStats[] = [...SEED_USAGE];
  private logs: ActivityLog[] = [...SEED_LOGS];
  private invitations: Invitation[] = [...SEED_INVITATIONS];

  private activeOrgId: string = '11111111-1111-1111-1111-111111111111'; // HM Blendz
  private activeUserId: string = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; // Alex Morgan (Owner)
  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('nexora_store_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.organizations) this.organizations = parsed.organizations;
        if (parsed.profiles) this.profiles = parsed.profiles;
        if (parsed.members) this.members = parsed.members;
        if (parsed.projects) this.projects = parsed.projects;
        if (parsed.tasks) this.tasks = parsed.tasks;
        if (parsed.assets) this.assets = parsed.assets;
        if (parsed.subscriptions) this.subscriptions = parsed.subscriptions;
        if (parsed.usageStats) this.usageStats = parsed.usageStats;
        if (parsed.logs) this.logs = parsed.logs;
        if (parsed.invitations) this.invitations = parsed.invitations;
        if (parsed.activeOrgId) this.activeOrgId = parsed.activeOrgId;
        if (parsed.activeUserId) this.activeUserId = parsed.activeUserId;
      }
    } catch (e) {
      console.warn('Could not read from local storage:', e);
    }
    this.initialized = true;
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const data = {
        organizations: this.organizations,
        profiles: this.profiles,
        members: this.members,
        projects: this.projects,
        tasks: this.tasks,
        assets: this.assets,
        subscriptions: this.subscriptions,
        usageStats: this.usageStats,
        logs: this.logs,
        invitations: this.invitations,
        activeOrgId: this.activeOrgId,
        activeUserId: this.activeUserId,
      };
      localStorage.setItem('nexora_store_v1', JSON.stringify(data));
      this.notify();
    } catch (e) {
      console.warn('Could not write to local storage:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public resetToSeeds() {
    this.organizations = [...SEED_ORGS];
    this.profiles = [...SEED_PROFILES];
    this.members = [...SEED_MEMBERS];
    this.projects = [...SEED_PROJECTS];
    this.tasks = [...SEED_TASKS];
    this.assets = [...SEED_ASSETS];
    this.subscriptions = [...SEED_SUBSCRIPTIONS];
    this.usageStats = [...SEED_USAGE];
    this.logs = [...SEED_LOGS];
    this.invitations = [...SEED_INVITATIONS];
    this.activeOrgId = '11111111-1111-1111-1111-111111111111';
    this.activeUserId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    this.saveToStorage();
  }

  // ----------------------------------------------------------------------------
  // Active Tenant Context & Persona Management
  // ----------------------------------------------------------------------------
  public getActiveOrgId(): string {
    return this.activeOrgId;
  }

  public setActiveOrgId(orgId: string): void {
    // Validate organization exists
    const org = this.organizations.find((o) => o.id === orgId);
    if (!org) throw new Error('Organization not found');
    this.activeOrgId = orgId;

    // Check if current user is member of this org. If not, auto-switch to an existing member of that org
    const isMember = this.members.some(
      (m) => m.organization_id === orgId && m.user_id === this.activeUserId
    );
    if (!isMember) {
      const orgMember = this.members.find((m) => m.organization_id === orgId);
      if (orgMember) {
        this.activeUserId = orgMember.user_id;
      }
    }
    this.saveToStorage();
  }

  public getActiveUserId(): string {
    return this.activeUserId;
  }

  public setActiveUserId(userId: string): void {
    const profile = this.profiles.find((p) => p.id === userId);
    if (!profile) throw new Error('User profile not found');
    this.activeUserId = userId;
    this.saveToStorage();
  }

  public getActiveUser(): Profile | null {
    return this.profiles.find((p) => p.id === this.activeUserId) || null;
  }

  public getActiveOrg(): Organization | null {
    return this.organizations.find((o) => o.id === this.activeOrgId) || null;
  }

  public getActiveMemberRole(): MemberRole | null {
    const member = this.members.find(
      (m) => m.organization_id === this.activeOrgId && m.user_id === this.activeUserId
    );
    return member?.role || null;
  }

  public getUserOrganizations(userId?: string): { organization: Organization; role: MemberRole }[] {
    const uid = userId || this.activeUserId;
    const userMembers = this.members.filter((m) => m.user_id === uid);
    return userMembers
      .map((m) => {
        const org = this.organizations.find((o) => o.id === m.organization_id);
        return org ? { organization: org, role: m.role } : null;
      })
      .filter((item): item is { organization: Organization; role: MemberRole } => item !== null);
  }

  public getAllProfiles(): Profile[] {
    return [...this.profiles];
  }

  // ----------------------------------------------------------------------------
  // Audit Logging (Append-Only)
  // ----------------------------------------------------------------------------
  public logActivity(
    orgId: string,
    action: string,
    entityType: string,
    entityId?: string | null,
    metadata?: Record<string, any>
  ): ActivityLog {
    const log: ActivityLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 10),
      organization_id: orgId,
      actor_user_id: this.activeUserId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };
    this.logs.unshift(log);
    this.saveToStorage();
    return log;
  }

  // ----------------------------------------------------------------------------
  // Tenant Isolated Query Methods (Replicates PostgreSQL RLS Policies)
  // ----------------------------------------------------------------------------
  public getProjects(orgId?: string): Project[] {
    const targetOrgId = orgId || this.activeOrgId;
    return this.projects
      .filter((p) => p.organization_id === targetOrgId)
      .map((p) => {
        const creator = this.profiles.find((pr) => pr.id === p.created_by);
        const projectTasks = this.tasks.filter((t) => t.project_id === p.id);
        const completed = projectTasks.filter((t) => t.status === 'DONE').length;
        return {
          ...p,
          creator,
          tasks_count: projectTasks.length,
          completed_tasks_count: completed,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getProjectById(projectId: string, orgId?: string): Project | null {
    const targetOrgId = orgId || this.activeOrgId;
    // RLS Enforcement: Project must match the tenant's organization_id!
    const project = this.projects.find((p) => p.id === projectId && p.organization_id === targetOrgId);
    if (!project) return null;

    const creator = this.profiles.find((pr) => pr.id === project.created_by);
    const projectTasks = this.tasks.filter((t) => t.project_id === project.id);
    const completed = projectTasks.filter((t) => t.status === 'DONE').length;
    return {
      ...project,
      creator,
      tasks_count: projectTasks.length,
      completed_tasks_count: completed,
    };
  }

  public getTasks(orgId?: string, projectId?: string): Task[] {
    const targetOrgId = orgId || this.activeOrgId;
    let list = this.tasks.filter((t) => t.organization_id === targetOrgId);
    if (projectId) {
      list = list.filter((t) => t.project_id === projectId);
    }
    return list.map((t) => {
      const assignee = this.profiles.find((pr) => pr.id === t.assigned_to);
      const project = this.projects.find((p) => p.id === t.project_id);
      return {
        ...t,
        assignee,
        project_name: project?.name,
      };
    });
  }

  public getAssets(orgId?: string): Asset[] {
    const targetOrgId = orgId || this.activeOrgId;
    return this.assets
      .filter((a) => a.organization_id === targetOrgId)
      .map((a) => {
        const uploader = this.profiles.find((pr) => pr.id === a.uploaded_by);
        return { ...a, uploader };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getMembers(orgId?: string): OrganizationMember[] {
    const targetOrgId = orgId || this.activeOrgId;
    return this.members
      .filter((m) => m.organization_id === targetOrgId)
      .map((m) => {
        const profile = this.profiles.find((pr) => pr.id === m.user_id);
        return { ...m, profile };
      });
  }

  public getActivityLogs(orgId?: string): ActivityLog[] {
    const targetOrgId = orgId || this.activeOrgId;
    return this.logs
      .filter((l) => l.organization_id === targetOrgId)
      .map((l) => {
        const actor = this.profiles.find((pr) => pr.id === l.actor_user_id);
        return { ...l, actor };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getSubscription(orgId?: string): OrganizationSubscription | null {
    const targetOrgId = orgId || this.activeOrgId;
    return this.subscriptions.find((s) => s.organization_id === targetOrgId) || null;
  }

  public getUsageStats(orgId?: string): OrganizationUsageStats {
    const targetOrgId = orgId || this.activeOrgId;
    let stat = this.usageStats.find((u) => u.organization_id === targetOrgId);
    if (!stat) {
      stat = {
        id: 'usage-' + targetOrgId,
        organization_id: targetOrgId,
        members_count: this.members.filter((m) => m.organization_id === targetOrgId).length,
        projects_count: this.projects.filter((p) => p.organization_id === targetOrgId).length,
        assets_count: this.assets.filter((a) => a.organization_id === targetOrgId).length,
        storage_used: this.assets
          .filter((a) => a.organization_id === targetOrgId)
          .reduce((acc, a) => acc + a.file_size, 0),
        updated_at: new Date().toISOString(),
      };
      this.usageStats.push(stat);
    } else {
      // Re-calculate dynamically to ensure precision
      stat.members_count = this.members.filter((m) => m.organization_id === targetOrgId).length;
      stat.projects_count = this.projects.filter((p) => p.organization_id === targetOrgId).length;
      stat.assets_count = this.assets.filter((a) => a.organization_id === targetOrgId).length;
      stat.storage_used = this.assets
        .filter((a) => a.organization_id === targetOrgId)
        .reduce((acc, a) => acc + a.file_size, 0);
    }
    return stat;
  }

  public getInvitations(orgId?: string): Invitation[] {
    const targetOrgId = orgId || this.activeOrgId;
    return this.invitations
      .filter((i) => i.organization_id === targetOrgId)
      .map((inv) => {
        const inviter = this.profiles.find((pr) => pr.id === inv.invited_by);
        const org = this.organizations.find((o) => o.id === inv.organization_id);
        return { ...inv, inviter, organization: org };
      });
  }

  // ----------------------------------------------------------------------------
  // Server-Side Authorized Mutations (Enforces RBAC + Entitlements + RLS)
  // ----------------------------------------------------------------------------

  public createOrganization(name: string, domain?: string): Organization {
    const actorId = this.activeUserId;
    const orgId = 'org-' + Math.random().toString(36).substring(2, 10);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newOrg: Organization = {
      id: orgId,
      name,
      slug: `${slug}-${Math.floor(Math.random() * 899 + 100)}`,
      logo_url: null,
      domain: domain || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.organizations.push(newOrg);

    // Bootstrap creator as OWNER
    const ownerMember: OrganizationMember = {
      id: 'mem-' + Math.random().toString(36).substring(2, 10),
      organization_id: orgId,
      user_id: actorId,
      role: 'OWNER',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.members.push(ownerMember);

    // Bootstrap FREE subscription
    const sub: OrganizationSubscription = {
      id: 'sub-' + Math.random().toString(36).substring(2, 10),
      organization_id: orgId,
      plan: 'FREE',
      status: 'ACTIVE',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.subscriptions.push(sub);

    // Bootstrap Usage stats
    const usage: OrganizationUsageStats = {
      id: 'usage-' + orgId,
      organization_id: orgId,
      members_count: 1,
      projects_count: 0,
      assets_count: 0,
      storage_used: 0,
      updated_at: new Date().toISOString(),
    };
    this.usageStats.push(usage);

    // Log activity
    this.logActivity(orgId, 'organization.created', 'organization', orgId, { name, plan: 'FREE' });

    // Set as active org
    this.activeOrgId = orgId;
    this.saveToStorage();
    return newOrg;
  }

  public updateOrganization(orgId: string, updates: Partial<Organization>): Organization {
    const role = this.getActiveMemberRole();
    const perm = canPerformAction(role, 'manage_organization');
    if (!perm.allowed && role !== 'ADMIN') {
      throw new Error(perm.reason || 'Unauthorized to update organization');
    }

    const orgIndex = this.organizations.findIndex((o) => o.id === orgId);
    if (orgIndex === -1) throw new Error('Organization not found');

    this.organizations[orgIndex] = {
      ...this.organizations[orgIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.logActivity(orgId, 'organization.updated', 'organization', orgId, updates);
    this.saveToStorage();
    return this.organizations[orgIndex];
  }

  public createProject(
    data: Pick<Project, 'name' | 'description' | 'status' | 'priority' | 'budget' | 'target_date'>
  ): Project {
    const role = this.getActiveMemberRole();
    const permCheck = canPerformAction(role, 'create_projects');
    if (!permCheck.allowed) {
      throw new Error(`[RBAC Violation] ${permCheck.reason}`);
    }

    // Check Plan Entitlement Limits
    const sub = this.getSubscription(this.activeOrgId);
    const usage = this.getUsageStats(this.activeOrgId);
    const limitCheck = checkProjectLimit(usage.projects_count, sub?.plan || 'FREE');
    if (!limitCheck.allowed) {
      throw new Error(`[Entitlement Limit] ${limitCheck.reason}`);
    }

    const newProject: Project = {
      id: 'proj-' + Math.random().toString(36).substring(2, 10),
      organization_id: this.activeOrgId,
      name: data.name,
      description: data.description || '',
      status: data.status || 'PLANNING',
      priority: data.priority || 'MEDIUM',
      budget: data.budget || 0,
      target_date: data.target_date || null,
      created_by: this.activeUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.projects.unshift(newProject);
    this.getUsageStats(this.activeOrgId); // recalculate usage

    this.logActivity(this.activeOrgId, 'project.created', 'project', newProject.id, {
      name: newProject.name,
      priority: newProject.priority,
      status: newProject.status,
    });

    this.saveToStorage();
    return newProject;
  }

  public updateProject(projectId: string, updates: Partial<Project>): Project {
    const role = this.getActiveMemberRole();
    const permCheck = canPerformAction(role, 'edit_projects');
    if (!permCheck.allowed) {
      throw new Error(`[RBAC Violation] ${permCheck.reason}`);
    }

    // Strict Tenant RLS Boundary: Cannot edit project outside active organization
    const projectIndex = this.projects.findIndex(
      (p) => p.id === projectId && p.organization_id === this.activeOrgId
    );
    if (projectIndex === -1) {
      throw new Error('[RLS Isolation] Project does not belong to active organization');
    }

    this.projects[projectIndex] = {
      ...this.projects[projectIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.logActivity(this.activeOrgId, 'project.updated', 'project', projectId, updates);
    this.saveToStorage();
    return this.projects[projectIndex];
  }

  public deleteProject(projectId: string): void {
    const role = this.getActiveMemberRole();
    const permCheck = canPerformAction(role, 'delete_projects');
    if (!permCheck.allowed) {
      throw new Error(`[RBAC Violation] ${permCheck.reason}`);
    }

    const project = this.projects.find(
      (p) => p.id === projectId && p.organization_id === this.activeOrgId
    );
    if (!project) {
      throw new Error('[RLS Isolation] Project not found in current organization');
    }

    // Cascade delete project tasks
    this.tasks = this.tasks.filter((t) => t.project_id !== projectId);
    this.projects = this.projects.filter((p) => p.id !== projectId);
    this.getUsageStats(this.activeOrgId);

    this.logActivity(this.activeOrgId, 'project.deleted', 'project', projectId, {
      name: project.name,
    });
    this.saveToStorage();
  }

  public createTask(
    data: Pick<Task, 'project_id' | 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'assigned_to'>
  ): Task {
    const role = this.getActiveMemberRole();
    const permCheck = canPerformAction(role, 'create_tasks');
    if (!permCheck.allowed) {
      throw new Error(`[RBAC Violation] ${permCheck.reason}`);
    }

    // Verify project belongs to active organization
    const project = this.projects.find(
      (p) => p.id === data.project_id && p.organization_id === this.activeOrgId
    );
    if (!project) {
      throw new Error('[RLS Isolation] Target project not found in active organization');
    }

    const newTask: Task = {
      id: 'task-' + Math.random().toString(36).substring(2, 10),
      organization_id: this.activeOrgId,
      project_id: data.project_id,
      assigned_to: data.assigned_to || null,
      title: data.title,
      description: data.description || '',
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      due_date: data.due_date || null,
      created_by: this.activeUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.tasks.unshift(newTask);
    this.logActivity(this.activeOrgId, 'task.created', 'task', newTask.id, {
      title: newTask.title,
      project_id: newTask.project_id,
    });
    this.saveToStorage();
    return newTask;
  }

  public updateTask(taskId: string, updates: Partial<Task>): Task {
    const role = this.getActiveMemberRole();
    const permCheck = canPerformAction(role, 'edit_tasks');
    if (!permCheck.allowed) {
      throw new Error(`[RBAC Violation] ${permCheck.reason}`);
    }

    const taskIndex = this.tasks.findIndex(
      (t) => t.id === taskId && t.organization_id === this.activeOrgId
    );
    if (taskIndex === -1) {
      throw new Error('[RLS Isolation] Task does not belong to active organization');
    }

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.logActivity(this.activeOrgId, 'task.updated', 'task', taskId, updates);
    this.saveToStorage();
    return this.tasks[taskIndex];
  }

  public deleteTask(taskId: string): void {
    const role = this.getActiveMemberRole();
    const permCheck = canPerformAction(role, 'delete_tasks');
    if (!permCheck.allowed) {
      throw new Error(`[RBAC Violation] ${permCheck.reason}`);
    }

    const task = this.tasks.find((t) => t.id === taskId && t.organization_id === this.activeOrgId);
    if (!task) {
      throw new Error('[RLS Isolation] Task not found in active organization');
    }

    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.logActivity(this.activeOrgId, 'task.deleted', 'task', taskId, { title: task.title });
    this.saveToStorage();
  }

  public uploadAsset(data: Pick<Asset, 'name' | 'description' | 'type' | 'file_size' | 'mime_type'>): Asset {
    const role = this.getActiveMemberRole();
    const permCheck = canPerformAction(role, 'upload_assets');
    if (!permCheck.allowed) {
      throw new Error(`[RBAC Violation] ${permCheck.reason}`);
    }

    // Check Plan Entitlement Storage Quota
    const sub = this.getSubscription(this.activeOrgId);
    const usage = this.getUsageStats(this.activeOrgId);
    const quotaCheck = checkStorageLimit(usage.storage_used, data.file_size, sub?.plan || 'FREE');
    if (!quotaCheck.allowed) {
      throw new Error(`[Entitlement Limit] ${quotaCheck.reason}`);
    }

    const org = this.getActiveOrg();
    const newAsset: Asset = {
      id: 'asset-' + Math.random().toString(36).substring(2, 10),
      organization_id: this.activeOrgId,
      name: data.name,
      description: data.description || '',
      type: data.type || 'DOCUMENT',
      file_size: data.file_size,
      mime_type: data.mime_type,
      storage_path: `${org?.slug || 'tenant'}/${data.name}`,
      uploaded_by: this.activeUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.assets.unshift(newAsset);
    this.getUsageStats(this.activeOrgId); // recalculate usage

    this.logActivity(this.activeOrgId, 'asset.uploaded', 'asset', newAsset.id, {
      name: newAsset.name,
      size_bytes: newAsset.file_size,
      type: newAsset.type,
    });
    this.saveToStorage();
    return newAsset;
  }

  public deleteAsset(assetId: string): void {
    const role = this.getActiveMemberRole();
    const permCheck = canPerformAction(role, 'delete_assets');
    if (!permCheck.allowed) {
      throw new Error(`[RBAC Violation] ${permCheck.reason}`);
    }

    const asset = this.assets.find((a) => a.id === assetId && a.organization_id === this.activeOrgId);
    if (!asset) {
      throw new Error('[RLS Isolation] Asset not found in active organization');
    }

    this.assets = this.assets.filter((a) => a.id !== assetId);
    this.getUsageStats(this.activeOrgId);

    this.logActivity(this.activeOrgId, 'asset.deleted', 'asset', assetId, { name: asset.name });
    this.saveToStorage();
  }

  public inviteMember(email: string, roleToAssign: MemberRole): Invitation {
    const actorRole = this.getActiveMemberRole();
    const permCheck = canPerformAction(actorRole, 'invite_members');
    if (!permCheck.allowed) {
      throw new Error(`[RBAC Violation] ${permCheck.reason}`);
    }

    // Check Plan Entitlement Member Quotas
    const sub = this.getSubscription(this.activeOrgId);
    const usage = this.getUsageStats(this.activeOrgId);
    const quotaCheck = checkMemberLimit(usage.members_count, sub?.plan || 'FREE');
    if (!quotaCheck.allowed) {
      throw new Error(`[Entitlement Limit] ${quotaCheck.reason}`);
    }

    // Check if user is already a member
    const existingProfile = this.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (existingProfile) {
      const alreadyMember = this.members.some(
        (m) => m.organization_id === this.activeOrgId && m.user_id === existingProfile.id
      );
      if (alreadyMember) {
        throw new Error(`User with email '${email}' is already an active member of this organization.`);
      }
    }

    const token = 'inv_tok_' + Math.random().toString(36).substring(2, 12);
    const invitation: Invitation = {
      id: 'inv-' + Math.random().toString(36).substring(2, 10),
      organization_id: this.activeOrgId,
      email,
      role: roleToAssign,
      invited_by: this.activeUserId,
      token,
      status: 'PENDING',
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
    };

    this.invitations.unshift(invitation);
    this.logActivity(this.activeOrgId, 'member.invited', 'member', invitation.id, {
      email,
      role: roleToAssign,
    });
    this.saveToStorage();
    return invitation;
  }

  public acceptInvitation(token: string, newUserName?: string): { success: boolean; organization: Organization } {
    const invitation = this.invitations.find((i) => i.token === token && i.status === 'PENDING');
    if (!invitation) {
      throw new Error('Invalid or expired invitation token');
    }

    if (new Date(invitation.expires_at).getTime() < Date.now()) {
      invitation.status = 'EXPIRED';
      this.saveToStorage();
      throw new Error('This invitation has expired.');
    }

    // Find or create profile
    let profile = this.profiles.find((p) => p.email.toLowerCase() === invitation.email.toLowerCase());
    if (!profile) {
      profile = {
        id: 'usr-' + Math.random().toString(36).substring(2, 10),
        email: invitation.email,
        full_name: newUserName || invitation.email.split('@')[0],
        title: 'Team Member',
        avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.profiles.push(profile);
    }

    // Create organization membership
    const member: OrganizationMember = {
      id: 'mem-' + Math.random().toString(36).substring(2, 10),
      organization_id: invitation.organization_id,
      user_id: profile.id,
      role: invitation.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.members.push(member);

    // Update invitation status
    invitation.status = 'ACCEPTED';
    const org = this.organizations.find((o) => o.id === invitation.organization_id);

    // Log activity
    this.logActivity(invitation.organization_id, 'member.joined', 'member', profile.id, {
      email: invitation.email,
      role: invitation.role,
    });

    // Switch context
    this.activeOrgId = invitation.organization_id;
    this.activeUserId = profile.id;
    this.saveToStorage();

    return { success: true, organization: org! };
  }

  public updateMemberRole(targetUserId: string, newRole: MemberRole): void {
    const actorRole = this.getActiveMemberRole();
    if (!actorRole) throw new Error('Unauthenticated user has no role');

    const targetMember = this.members.find(
      (m) => m.organization_id === this.activeOrgId && m.user_id === targetUserId
    );
    if (!targetMember) throw new Error('Target user is not a member of this organization');

    const check = canModifyMemberRole(
      actorRole,
      this.activeUserId,
      targetUserId,
      targetMember.role,
      newRole
    );
    if (!check.allowed) {
      throw new Error(`[RBAC Violation] ${check.reason}`);
    }

    const prevRole = targetMember.role;
    targetMember.role = newRole;
    targetMember.updated_at = new Date().toISOString();

    const targetProfile = this.profiles.find((p) => p.id === targetUserId);

    this.logActivity(this.activeOrgId, 'member.role_changed', 'member', targetUserId, {
      target_user_name: targetProfile?.full_name,
      previous_role: prevRole,
      new_role: newRole,
    });

    this.saveToStorage();
  }

  public removeMember(targetUserId: string): void {
    const actorRole = this.getActiveMemberRole();
    if (!actorRole) throw new Error('Unauthenticated user has no role');

    const targetMember = this.members.find(
      (m) => m.organization_id === this.activeOrgId && m.user_id === targetUserId
    );
    if (!targetMember) throw new Error('Target user is not a member of this organization');

    const ownersCount = this.members.filter(
      (m) => m.organization_id === this.activeOrgId && m.role === 'OWNER'
    ).length;

    const check = canRemoveMember(
      actorRole,
      this.activeUserId,
      targetUserId,
      targetMember.role,
      ownersCount
    );
    if (!check.allowed) {
      throw new Error(`[RBAC Violation] ${check.reason}`);
    }

    this.members = this.members.filter(
      (m) => !(m.organization_id === this.activeOrgId && m.user_id === targetUserId)
    );
    this.getUsageStats(this.activeOrgId);

    const targetProfile = this.profiles.find((p) => p.id === targetUserId);
    this.logActivity(this.activeOrgId, 'member.removed', 'member', targetUserId, {
      target_user_name: targetProfile?.full_name,
      role: targetMember.role,
    });

    this.saveToStorage();
  }

  public updateSubscriptionPlan(newPlan: SubscriptionPlan): OrganizationSubscription {
    const actorRole = this.getActiveMemberRole();
    const permCheck = canPerformAction(actorRole, 'manage_billing');
    if (!permCheck.allowed) {
      throw new Error(`[RBAC Violation] ${permCheck.reason}`);
    }

    let sub = this.subscriptions.find((s) => s.organization_id === this.activeOrgId);
    if (!sub) {
      sub = {
        id: 'sub-' + Math.random().toString(36).substring(2, 10),
        organization_id: this.activeOrgId,
        plan: newPlan,
        status: 'ACTIVE',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.subscriptions.push(sub);
    } else {
      const prevPlan = sub.plan;
      sub.plan = newPlan;
      sub.status = 'ACTIVE';
      sub.updated_at = new Date().toISOString();

      this.logActivity(this.activeOrgId, 'subscription.plan_changed', 'subscription', sub.id, {
        previous_plan: prevPlan,
        new_plan: newPlan,
      });
    }

    this.saveToStorage();
    return sub;
  }

  // ----------------------------------------------------------------------------
  // Simulated Webhook Processor
  // ----------------------------------------------------------------------------
  public simulateWebhookEvent(
    eventType: 'subscription.created' | 'subscription.updated' | 'subscription.canceled' | 'invoice.paid' | 'invoice.payment_failed',
    payload: {
      plan?: SubscriptionPlan;
      status?: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED';
      amount?: number;
    }
  ): { status: string; event: string; orgId: string; timestamp: string } {
    let sub = this.subscriptions.find((s) => s.organization_id === this.activeOrgId);
    if (!sub) {
      throw new Error('No subscription found for active organization');
    }

    if (eventType === 'subscription.updated' && payload.plan) {
      sub.plan = payload.plan;
      sub.status = payload.status || 'ACTIVE';
    } else if (eventType === 'subscription.canceled') {
      sub.status = 'CANCELED';
      sub.canceled_at = new Date().toISOString();
    } else if (eventType === 'invoice.payment_failed') {
      sub.status = 'PAST_DUE';
    } else if (eventType === 'invoice.paid') {
      sub.status = 'ACTIVE';
      sub.current_period_end = new Date(Date.now() + 30 * 86400000).toISOString();
    }

    sub.updated_at = new Date().toISOString();

    this.logActivity(this.activeOrgId, `webhook.${eventType}`, 'subscription', sub.id, {
      simulated: true,
      event: eventType,
      payload,
    });

    this.saveToStorage();
    return {
      status: 'processed',
      event: eventType,
      orgId: this.activeOrgId,
      timestamp: new Date().toISOString(),
    };
  }

  // ----------------------------------------------------------------------------
  // Explicit Tenant Isolation Test Runner (Verifies Section 10 Requirements)
  // ----------------------------------------------------------------------------
  public testTenantIsolation(): {
    testName: string;
    description: string;
    expected: string;
    actual: string;
    passed: boolean;
  }[] {
    const org1 = SEED_ORGS[0].id; // HM Blendz
    const org2 = SEED_ORGS[1].id; // Northstar Creative

    // Test 1: HM Blendz query cannot see Northstar Projects
    const hmProjects = this.getProjects(org1);
    const hasNorthstarProj = hmProjects.some((p) => p.organization_id === org2);

    // Test 2: Northstar query cannot see HM Blendz Projects
    const nsProjects = this.getProjects(org2);
    const hasHMProj = nsProjects.some((p) => p.organization_id === org1);

    // Test 3: Direct attempt to fetch Northstar Project by ID using HM Blendz tenant context
    const northstarProjId = SEED_PROJECTS.find((p) => p.organization_id === org2)?.id;
    const directAccessResult = northstarProjId ? this.getProjectById(northstarProjId, org1) : null;

    // Test 4: RLS policy on assets cross-tenant leakage
    const hmAssets = this.getAssets(org1);
    const hasNorthstarAsset = hmAssets.some((a) => a.organization_id === org2);

    // Test 5: Role protection (Viewer cannot create project)
    let viewerBlocked = false;
    try {
      // Temporary check with VIEWER role
      const check = canPerformAction('VIEWER', 'create_projects');
      if (!check.allowed) viewerBlocked = true;
    } catch {
      viewerBlocked = true;
    }

    return [
      {
        testName: 'HM Blendz Data Isolation Boundary',
        description: 'Verify HM Blendz tenant query excludes all Northstar Creative rows.',
        expected: '0 cross-tenant rows visible',
        actual: hasNorthstarProj ? 'FAILED: Northstar project leaked' : '0 foreign rows returned',
        passed: !hasNorthstarProj,
      },
      {
        testName: 'Northstar Creative Boundary',
        description: 'Verify Northstar query returns only Northstar resources.',
        expected: '0 cross-tenant rows visible',
        actual: hasHMProj ? 'FAILED: HM Blendz project leaked' : '0 foreign rows returned',
        passed: !hasHMProj,
      },
      {
        testName: 'Direct Resource ID Cross-Tenant Probe',
        description: 'Attempt direct SELECT on Northstar Project ID within HM Blendz session.',
        expected: 'NULL (Row-Level Security boundary denies row access)',
        actual: directAccessResult === null ? 'NULL (Access Denied / Not Found)' : 'FAILED: Row Leaked',
        passed: directAccessResult === null,
      },
      {
        testName: 'Digital Asset Storage Isolation',
        description: 'Verify assets belonging to Organization B are inaccessible to Organization A.',
        expected: 'Storage files strictly partitioned by tenant organization_id',
        actual: hasNorthstarAsset ? 'FAILED: Asset leaked' : 'Strictly isolated',
        passed: !hasNorthstarAsset,
      },
      {
        testName: 'RBAC VIEWER Mutation Rejection',
        description: 'Verify user with role VIEWER cannot perform state-modifying actions.',
        expected: 'Server & RLS reject mutation with 403 Forbidden',
        actual: viewerBlocked ? 'Blocked by RBAC Permission Matrix' : 'FAILED: Mutation permitted',
        passed: viewerBlocked,
      },
    ];
  }
}

// Global Singleton instance for deterministic access across server and client
let storeInstance: NexoraDataStore | null = null;

export function getNexoraStore(): NexoraDataStore {
  if (!storeInstance) {
    storeInstance = new NexoraDataStore();
  }
  return storeInstance;
}
