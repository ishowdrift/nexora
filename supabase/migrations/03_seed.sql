-- ==============================================================================
-- NEXORA B2B MULTI-TENANT SAAS - SEED DATA (03_seed.sql)
-- Realistic Seed Data for Multi-Tenancy & Tenant Isolation Verification
-- ==============================================================================

-- Org 1: HM Blendz
-- Org 2: Northstar Creative

DO $$
DECLARE
    -- Organization IDs
    org1_id UUID := '11111111-1111-1111-1111-111111111111';
    org2_id UUID := '22222222-2222-2222-2222-222222222222';

    -- User IDs
    user_alex UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';  -- Alex Morgan (HM Blendz OWNER)
    user_sarah UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'; -- Sarah Khan (HM Blendz ADMIN)
    user_daniel UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc'; -- Daniel Reed (HM Blendz EDITOR)
    user_maya UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';   -- Maya Chen (HM Blendz VIEWER)

    user_marcus UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'; -- Marcus Vance (Northstar OWNER)
    user_elena UUID := 'ffffffff-ffff-ffff-ffff-ffffffffffff';  -- Elena Rostova (Northstar ADMIN)

    -- Project IDs
    proj_hm1 UUID := '10000000-0000-0000-0000-000000000001';
    proj_hm2 UUID := '10000000-0000-0000-0000-000000000002';
    proj_hm3 UUID := '10000000-0000-0000-0000-000000000003';
    proj_hm4 UUID := '10000000-0000-0000-0000-000000000004';

    proj_ns1 UUID := '20000000-0000-0000-0000-000000000001';
    proj_ns2 UUID := '20000000-0000-0000-0000-000000000002';

BEGIN
    -- 1. Insert Profiles
    INSERT INTO public.profiles (id, email, full_name, title, avatar_url) VALUES
    (user_alex, 'alex@hmblendz.com', 'Alex Morgan', 'Founder & CEO', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
    (user_sarah, 'sarah@hmblendz.com', 'Sarah Khan', 'Operations Director', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'),
    (user_daniel, 'daniel@hmblendz.com', 'Daniel Reed', 'Senior Product Designer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
    (user_maya, 'maya@hmblendz.com', 'Maya Chen', 'Junior Analyst', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'),
    (user_marcus, 'marcus@northstar.io', 'Marcus Vance', 'Managing Partner', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
    (user_elena, 'elena@northstar.io', 'Elena Rostova', 'VP of Creative Tech', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

    -- 2. Insert Organizations
    INSERT INTO public.organizations (id, name, slug, domain) VALUES
    (org1_id, 'HM Blendz', 'hm-blendz', 'hmblendz.com'),
    (org2_id, 'Northstar Creative', 'northstar-creative', 'northstar.io')
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Memberships
    -- HM Blendz Members (Alex: OWNER, Sarah: ADMIN, Daniel: EDITOR, Maya: VIEWER)
    INSERT INTO public.organization_members (organization_id, user_id, role) VALUES
    (org1_id, user_alex, 'OWNER'),
    (org1_id, user_sarah, 'ADMIN'),
    (org1_id, user_daniel, 'EDITOR'),
    (org1_id, user_maya, 'VIEWER')
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    -- Northstar Creative Members (Marcus: OWNER, Elena: ADMIN)
    INSERT INTO public.organization_members (organization_id, user_id, role) VALUES
    (org2_id, user_marcus, 'OWNER'),
    (org2_id, user_elena, 'ADMIN')
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    -- 4. Insert Subscriptions
    INSERT INTO public.organization_subscriptions (organization_id, plan, status, current_period_start, current_period_end) VALUES
    (org1_id, 'PRO', 'ACTIVE', now() - interval '10 days', now() + interval '20 days'),
    (org2_id, 'BUSINESS', 'ACTIVE', now() - interval '5 days', now() + interval '25 days')
    ON CONFLICT (organization_id) DO UPDATE SET plan = EXCLUDED.plan;

    -- 5. Insert Usage Stats
    INSERT INTO public.organization_usage_stats (organization_id, members_count, projects_count, assets_count, storage_used) VALUES
    (org1_id, 4, 4, 6, 2411724800), -- 2.25 GB
    (org2_id, 2, 2, 3, 1073741824)  -- 1.00 GB
    ON CONFLICT (organization_id) DO NOTHING;

    -- 6. Insert Projects for HM Blendz
    INSERT INTO public.projects (id, organization_id, name, description, status, priority, budget, target_date, created_by) VALUES
    (proj_hm1, org1_id, 'Website Redesign', 'Revamp corporate digital presence with Next.js and high conversion headless storefront.', 'ACTIVE', 'HIGH', 35000, CURRENT_DATE + interval '45 days', user_alex),
    (proj_hm2, org1_id, 'Q4 Marketing', 'Multi-channel brand campaigns across search, social, and creator sponsorship pipelines.', 'ACTIVE', 'MEDIUM', 22000, CURRENT_DATE + interval '30 days', user_sarah),
    (proj_hm3, org1_id, 'Brand Refresh', 'New typography scale, iconography suite, high-res physical packaging guidelines.', 'PLANNING', 'LOW', 15000, CURRENT_DATE + interval '90 days', user_daniel),
    (proj_hm4, org1_id, 'Operations Upgrade', 'Consolidation of ERP inventory, automated fulfillment webhooks, and vendor sync.', 'COMPLETED', 'URGENT', 48000, CURRENT_DATE - interval '10 days', user_alex)
    ON CONFLICT (id) DO NOTHING;

    -- 7. Insert Projects for Northstar Creative (Isolated Tenant Data)
    INSERT INTO public.projects (id, organization_id, name, description, status, priority, budget, target_date, created_by) VALUES
    (proj_ns1, org2_id, 'Omnichannel Retail Rollout', 'Flagship showroom interactive kiosks and RFID inventory integration.', 'ACTIVE', 'URGENT', 85000, CURRENT_DATE + interval '60 days', user_marcus),
    (proj_ns2, org2_id, 'Design System v2', 'Enterprise-grade React component library with WebGL canvas transitions.', 'PLANNING', 'HIGH', 40000, CURRENT_DATE + interval '75 days', user_elena)
    ON CONFLICT (id) DO NOTHING;

    -- 8. Insert Tasks for HM Blendz Projects
    INSERT INTO public.tasks (organization_id, project_id, title, description, status, priority, assigned_to, created_by, due_date) VALUES
    (org1_id, proj_hm1, 'Finalize Wireframes & IA', 'Review user journey maps and desktop/mobile viewport responsiveness.', 'DONE', 'HIGH', user_daniel, user_alex, CURRENT_DATE - interval '2 days'),
    (org1_id, proj_hm1, 'Setup Supabase Auth & RLS', 'Configure tenant isolation tables and database security helper functions.', 'IN_PROGRESS', 'URGENT', user_sarah, user_alex, CURRENT_DATE + interval '5 days'),
    (org1_id, proj_hm1, 'Integrate Stripe Billing Simulator', 'Connect webhooks for trial and paid plan tier lifecycle events.', 'TODO', 'MEDIUM', user_daniel, user_sarah, CURRENT_DATE + interval '12 days'),
    (org1_id, proj_hm1, 'Lighthouse Performance Audit', 'Ensure Core Web Vitals score is 95+ across mobile and desktop.', 'TODO', 'LOW', user_maya, user_sarah, CURRENT_DATE + interval '20 days'),

    (org1_id, proj_hm2, 'Influencer Contract Signoff', 'Finalize terms with key lifestyle creators for November holiday pushes.', 'IN_PROGRESS', 'HIGH', user_sarah, user_alex, CURRENT_DATE + interval '3 days'),
    (org1_id, proj_hm2, 'Ad Creative Asset Delivery', '1080x1920 video renders and static graphic variants.', 'REVIEW', 'MEDIUM', user_daniel, user_sarah, CURRENT_DATE + interval '1 day'),

    (org1_id, proj_hm4, 'Migrate PostgreSQL Database', 'Execute dry-run data migration and verify zero downtime replication.', 'DONE', 'URGENT', user_alex, user_alex, CURRENT_DATE - interval '14 days');

    -- 9. Insert Tasks for Northstar Creative (Tenant 2)
    INSERT INTO public.tasks (organization_id, project_id, title, description, status, priority, assigned_to, created_by, due_date) VALUES
    (org2_id, proj_ns1, 'Deploy Touchscreen Kiosk App', 'Chromium embedded container on Intel NUC displays.', 'IN_PROGRESS', 'URGENT', user_elena, user_marcus, CURRENT_DATE + interval '10 days'),
    (org2_id, proj_ns2, 'Component Accessibility Audit', 'WCAG AAA color contrast validation on all dark surfaces.', 'TODO', 'HIGH', user_marcus, user_elena, CURRENT_DATE + interval '25 days');

    -- 10. Insert Digital Assets for HM Blendz
    INSERT INTO public.assets (organization_id, name, description, type, file_size, mime_type, storage_path, uploaded_by) VALUES
    (org1_id, 'NEXORA_Brand_Guidelines_2026.pdf', 'Complete visual guidelines, color hex specifications, and typography hierarchy.', 'PDF', 14200000, 'application/pdf', 'hm-blendz/brand_guidelines.pdf', user_alex),
    (org1_id, 'Primary_Wordmark_Vector.svg', 'Scalable vector logo lockup with electric indigo gradient accents.', 'BRAND', 840000, 'image/svg+xml', 'hm-blendz/wordmark.svg', user_daniel),
    (org1_id, 'Q4_Financial_Projections.xlsx', 'Consolidated revenue model, CAC projections, and LTV forecasts.', 'DOCUMENT', 4850000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'hm-blendz/q4_projections.xlsx', user_sarah),
    (org1_id, 'Executive_Keynote_Deck.pdf', 'Board of directors deck summarizing enterprise operations milestones.', 'PDF', 28900000, 'application/pdf', 'hm-blendz/board_deck.pdf', user_alex);

    -- 11. Insert Digital Assets for Northstar Creative
    INSERT INTO public.assets (organization_id, name, description, type, file_size, mime_type, storage_path, uploaded_by) VALUES
    (org2_id, 'Northstar_Architecture_Diagram.png', 'Cloud infrastructure topology and multi-region failover mapping.', 'IMAGE', 6200000, 'image/png', 'northstar/architecture.png', user_marcus);

    -- 12. Insert Activity Logs for HM Blendz
    INSERT INTO public.activity_logs (organization_id, actor_user_id, action, entity_type, entity_id, metadata, created_at) VALUES
    (org1_id, user_alex, 'organization.created', 'organization', org1_id::text, '{"name": "HM Blendz", "plan": "PRO"}'::jsonb, now() - interval '14 days'),
    (org1_id, user_alex, 'member.invited', 'member', user_sarah::text, '{"email": "sarah@hmblendz.com", "role": "ADMIN"}'::jsonb, now() - interval '13 days'),
    (org1_id, user_sarah, 'project.created', 'project', proj_hm1::text, '{"name": "Website Redesign", "priority": "HIGH"}'::jsonb, now() - interval '10 days'),
    (org1_id, user_daniel, 'asset.uploaded', 'asset', 'brand_guidelines'::text, '{"filename": "NEXORA_Brand_Guidelines_2026.pdf", "size_mb": 14.2}'::jsonb, now() - interval '4 days'),
    (org1_id, user_sarah, 'member.role_changed', 'member', user_maya::text, '{"previous_role": "MEMBER", "new_role": "VIEWER"}'::jsonb, now() - interval '2 days'),
    (org1_id, user_alex, 'subscription.renewed', 'subscription', org1_id::text, '{"plan": "PRO", "amount": "$99.00", "status": "ACTIVE"}'::jsonb, now() - interval '1 day');

    -- 13. Insert Activity Logs for Northstar Creative
    INSERT INTO public.activity_logs (organization_id, actor_user_id, action, entity_type, entity_id, metadata, created_at) VALUES
    (org2_id, user_marcus, 'organization.created', 'organization', org2_id::text, '{"name": "Northstar Creative", "plan": "BUSINESS"}'::jsonb, now() - interval '20 days'),
    (org2_id, user_marcus, 'project.created', 'project', proj_ns1::text, '{"name": "Omnichannel Retail Rollout"}'::jsonb, now() - interval '15 days');

    -- 14. Insert Pending Invitation for HM Blendz
    INSERT INTO public.invitations (organization_id, email, role, invited_by, token, status, expires_at) VALUES
    (org1_id, 'kevin.tech@partner.co', 'EDITOR', user_sarah, 'inv_token_9823fbc01', 'PENDING', now() + interval '5 days');

END $$;
