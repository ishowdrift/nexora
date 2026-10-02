-- ==============================================================================
-- NEXORA B2B MULTI-TENANT SAAS - DATABASE SCHEMA MIGRATION (01_schema.sql)
-- Shared Database Schema with organization_id Tenant Partitioning
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Extends Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on profiles email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ------------------------------------------------------------------------------
-- 2. ORGANIZATIONS (Tenant Boundary)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    domain TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- ------------------------------------------------------------------------------
-- 3. ORGANIZATION MEMBERS (Tenant Membership & RBAC)
-- Roles: 'OWNER', 'ADMIN', 'EDITOR', 'VIEWER'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON public.organization_members(role);

-- ------------------------------------------------------------------------------
-- 4. PROJECTS (Tenant Resource)
-- Statuses: 'PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'
-- Priorities: 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED')),
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    budget NUMERIC(12, 2) DEFAULT 0,
    target_date DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_projects_org_id ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. TASKS (Tenant Resource)
-- Statuses: 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'
-- Priorities: 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')),
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    due_date DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON public.tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- ------------------------------------------------------------------------------
-- 6. ASSETS (Digital Asset Management - Tenant Resource)
-- Types: 'DOCUMENT', 'IMAGE', 'BRAND', 'PDF', 'CODE', 'ARCHIVE'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'DOCUMENT' CHECK (type IN ('DOCUMENT', 'IMAGE', 'BRAND', 'PDF', 'CODE', 'ARCHIVE')),
    file_size BIGINT NOT NULL DEFAULT 0, -- In bytes
    mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    storage_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_assets_org_id ON public.assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(type);

-- ------------------------------------------------------------------------------
-- 7. ACTIVITY LOGS (Tenant Audit Log)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_org_id ON public.activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);

-- ------------------------------------------------------------------------------
-- 8. ORGANIZATION SUBSCRIPTIONS (Lifecycle Management)
-- Plans: 'FREE', 'PRO', 'BUSINESS'
-- Statuses: 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    plan TEXT NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO', 'BUSINESS')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE')),
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '30 days'),
    canceled_at TIMESTAMPTZ,
    provider_customer_id TEXT,
    provider_subscription_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_org_subscriptions_org_id ON public.organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_plan ON public.organization_subscriptions(plan);

-- ------------------------------------------------------------------------------
-- 9. ORGANIZATION USAGE STATS (Usage Limits & Aggregations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    members_count INTEGER NOT NULL DEFAULT 1,
    projects_count INTEGER NOT NULL DEFAULT 0,
    assets_count INTEGER NOT NULL DEFAULT 0,
    storage_used BIGINT NOT NULL DEFAULT 0, -- In bytes
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_org_usage_stats_org_id ON public.organization_usage_stats(organization_id);

-- ------------------------------------------------------------------------------
-- 10. INVITATIONS (Member Invitations)
-- Statuses: 'PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER')),
    invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_invitations_org_id ON public.invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
