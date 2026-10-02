-- ==============================================================================
-- NEXORA B2B MULTI-TENANT SAAS - ROW-LEVEL SECURITY (02_rls_policies.sql)
-- Strict Tenant Isolation & Role-Based Access Control Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SECURITY DEFINER HELPER FUNCTIONS
-- Using SECURITY DEFINER avoids recursive RLS evaluation when querying
-- organization_members from within table policies.
-- ------------------------------------------------------------------------------

-- Get all organization IDs that the current authenticated user belongs to
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS TABLE (org_id UUID) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT organization_id
    FROM public.organization_members
    WHERE user_id = auth.uid();
END;
$$;

-- Check if current authenticated user is a member of an organization
CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = target_org_id
          AND user_id = auth.uid()
    );
END;
$$;

-- Get current authenticated user's role in a specific organization
CREATE OR REPLACE FUNCTION public.get_org_role(target_org_id UUID)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.organization_members
    WHERE organization_id = target_org_id
      AND user_id = auth.uid()
    LIMIT 1;

    RETURN user_role;
END;
$$;

-- Check if current authenticated user has one of the allowed roles in an organization
CREATE OR REPLACE FUNCTION public.has_org_role(target_org_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    user_role := public.get_org_role(target_org_id);
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN user_role = ANY(allowed_roles);
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. ENABLE ROW-LEVEL SECURITY ON ALL TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Users can read their own profile, or profiles of peers in the same organization
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (
        id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.organization_members om1
            JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
            WHERE om1.user_id = auth.uid() AND om2.user_id = public.profiles.id
        )
    );

CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 4. ORGANIZATIONS POLICIES
-- ------------------------------------------------------------------------------
-- Members can view their organizations
CREATE POLICY "organizations_select_policy" ON public.organizations
    FOR SELECT USING (
        id IN (SELECT org_id FROM public.get_user_org_ids())
    );

-- Any authenticated user can create a new organization
CREATE POLICY "organizations_insert_policy" ON public.organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only OWNER and ADMIN can update organization details
CREATE POLICY "organizations_update_policy" ON public.organizations
    FOR UPDATE USING (
        public.has_org_role(id, ARRAY['OWNER', 'ADMIN'])
    );

-- Only OWNER can delete an organization
CREATE POLICY "organizations_delete_policy" ON public.organizations
    FOR DELETE USING (
        public.has_org_role(id, ARRAY['OWNER'])
    );

-- ------------------------------------------------------------------------------
-- 5. ORGANIZATION MEMBERS POLICIES
-- ------------------------------------------------------------------------------
-- Members can see other members in the same organization
CREATE POLICY "org_members_select_policy" ON public.organization_members
    FOR SELECT USING (
        organization_id IN (SELECT org_id FROM public.get_user_org_ids())
    );

-- OWNER and ADMIN can add members
CREATE POLICY "org_members_insert_policy" ON public.organization_members
    FOR INSERT WITH CHECK (
        -- User can add self if creating a new org (bootstrap)
        (user_id = auth.uid() AND role = 'OWNER')
        OR public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN'])
    );

-- Role updates: OWNER can update any role, ADMIN can update EDITOR/VIEWER
CREATE POLICY "org_members_update_policy" ON public.organization_members
    FOR UPDATE USING (
        public.has_org_role(organization_id, ARRAY['OWNER'])
        OR (public.has_org_role(organization_id, ARRAY['ADMIN']) AND role IN ('EDITOR', 'VIEWER'))
    );

-- Member deletion: OWNER can remove anyone, ADMIN can remove EDITOR/VIEWER, user can remove self (leave)
CREATE POLICY "org_members_delete_policy" ON public.organization_members
    FOR DELETE USING (
        user_id = auth.uid()
        OR public.has_org_role(organization_id, ARRAY['OWNER'])
        OR (public.has_org_role(organization_id, ARRAY['ADMIN']) AND role IN ('EDITOR', 'VIEWER'))
    );

-- ------------------------------------------------------------------------------
-- 6. PROJECTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "projects_select_policy" ON public.projects
    FOR SELECT USING (
        public.is_org_member(organization_id)
    );

CREATE POLICY "projects_insert_policy" ON public.projects
    FOR INSERT WITH CHECK (
        public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN', 'EDITOR'])
    );

CREATE POLICY "projects_update_policy" ON public.projects
    FOR UPDATE USING (
        public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN', 'EDITOR'])
    );

CREATE POLICY "projects_delete_policy" ON public.projects
    FOR DELETE USING (
        public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN'])
    );

-- ------------------------------------------------------------------------------
-- 7. TASKS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "tasks_select_policy" ON public.tasks
    FOR SELECT USING (
        public.is_org_member(organization_id)
    );

CREATE POLICY "tasks_insert_policy" ON public.tasks
    FOR INSERT WITH CHECK (
        public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN', 'EDITOR'])
    );

CREATE POLICY "tasks_update_policy" ON public.tasks
    FOR UPDATE USING (
        public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN', 'EDITOR'])
    );

CREATE POLICY "tasks_delete_policy" ON public.tasks
    FOR DELETE USING (
        public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN'])
    );

-- ------------------------------------------------------------------------------
-- 8. ASSETS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "assets_select_policy" ON public.assets
    FOR SELECT USING (
        public.is_org_member(organization_id)
    );

CREATE POLICY "assets_insert_policy" ON public.assets
    FOR INSERT WITH CHECK (
        public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN', 'EDITOR'])
    );

CREATE POLICY "assets_update_policy" ON public.assets
    FOR UPDATE USING (
        public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN', 'EDITOR'])
    );

CREATE POLICY "assets_delete_policy" ON public.assets
    FOR DELETE USING (
        public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN'])
    );

-- ------------------------------------------------------------------------------
-- 9. ACTIVITY LOGS POLICIES (Append-only audit trail)
-- ------------------------------------------------------------------------------
CREATE POLICY "activity_logs_select_policy" ON public.activity_logs
    FOR SELECT USING (
        public.is_org_member(organization_id)
    );

CREATE POLICY "activity_logs_insert_policy" ON public.activity_logs
    FOR INSERT WITH CHECK (
        public.is_org_member(organization_id)
    );

-- No UPDATE or DELETE allowed on activity_logs to ensure audit log immutability!

-- ------------------------------------------------------------------------------
-- 10. ORGANIZATION SUBSCRIPTIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "org_subscriptions_select_policy" ON public.organization_subscriptions
    FOR SELECT USING (
        public.is_org_member(organization_id)
    );

CREATE POLICY "org_subscriptions_update_policy" ON public.organization_subscriptions
    FOR UPDATE USING (
        public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN'])
    );

-- ------------------------------------------------------------------------------
-- 11. ORGANIZATION USAGE STATS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "org_usage_stats_select_policy" ON public.organization_usage_stats
    FOR SELECT USING (
        public.is_org_member(organization_id)
    );

-- ------------------------------------------------------------------------------
-- 12. INVITATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "invitations_select_policy" ON public.invitations
    FOR SELECT USING (
        public.is_org_member(organization_id)
        OR (email = auth.jwt() ->> 'email')
    );

CREATE POLICY "invitations_insert_policy" ON public.invitations
    FOR INSERT WITH CHECK (
        public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN'])
    );

CREATE POLICY "invitations_update_policy" ON public.invitations
    FOR UPDATE USING (
        public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN'])
        OR (email = auth.jwt() ->> 'email')
    );

CREATE POLICY "invitations_delete_policy" ON public.invitations
    FOR DELETE USING (
        public.has_org_role(organization_id, ARRAY['OWNER', 'ADMIN'])
    );
