# NEXORA — Multi-Tenant B2B SaaS Platform

> **"Business operations, organized."**

NEXORA is a production-style multi-tenant B2B operations web application engineered around organizational workspaces. Independent companies run on the same platform while every organization’s data remains strictly isolated at the database, server, and presentation tiers.

---

## 🏛 Core Architectural Principles

1. **Shared Database Schema with `organization_id` Partitioning**
   - All tenant-owned tables (`projects`, `tasks`, `assets`, `activity_logs`, `organization_subscriptions`, `organization_usage_stats`, `invitations`) contain foreign keys referencing `public.organizations(id)`.
   - Avoids database-per-tenant overhead while delivering mathematical security through PostgreSQL Row-Level Security.

2. **PostgreSQL Row-Level Security (RLS)**
   - Security Definer database functions (`get_user_org_ids()`, `is_org_member(target_org_id)`, `get_org_role(target_org_id)`, `has_org_role(target_org_id, allowed_roles)`) prevent policy recursion and strictly guarantee that `Organization A` can never read or mutate `Organization B`'s data.

3. **Four-Tier Role-Based Access Control (RBAC)**
   - Roles belong to a user's *membership* inside an organization, not globally:
     - **`OWNER`**: Unrestricted authority; subscription management; danger zone & transfer ownership.
     - **`ADMIN`**: Workspace operations; invitations; role modifications (for Editor/Viewer); project/task/asset management.
     - **`EDITOR`**: Can create and modify projects, tasks, and upload assets. Cannot delete projects or alter team roles.
     - **`VIEWER`**: Strictly read-only access. Mutation requests are blocked on the server and rejected by database RLS.

4. **Commercial Subscription & Entitlements Engine**
   - Three tiers (`FREE`, `PRO`, `BUSINESS`) enforcing quotas on team seats, active projects, and secure asset storage.
   - Built-in **Simulated Webhook System** (`/api/webhooks/billing`) replicating Stripe events (`subscription.created`, `subscription.updated`, `subscription.canceled`, `invoice.paid`, `invoice.payment_failed`).

5. **Immutable Audit Trail**
   - Append-only compliance log (`activity_logs`) capturing the actor, action tag, target resource, and JSONB metadata for every state-changing event.

---

## 🛠 Technology Stack

- **Framework**: Next.js 15 (App Router, Server Actions, Server Components)
- **Language**: TypeScript 5 (Strict Mode)
- **Database & Auth**: PostgreSQL / Supabase with Row-Level Security (`@supabase/ssr`)
- **Styling**: Tailwind CSS (Dark Enterprise Editorial aesthetic inspired by Linear & Vercel)
- **Icons**: Lucide React
- **Validation**: Schema-level type checking and permission matrices

---

## 🚀 Getting Started

### 1. Installation

```bash
cd d:\WEBSITE\NEXORA
npm install
```

### 2. Configure Environment Variables

Copy the provided `.env.example`:

```bash
cp .env.example .env.local
```

Default `.env.local` contents:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-server-only
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=true
```

> **Zero-Friction Evaluation**: With `NEXT_PUBLIC_DEMO_MODE=true`, NEXORA boots immediately using a high-fidelity deterministic multi-tenant store with seeded accounts and simulated RLS boundaries.

### 3. Launch Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄 PostgreSQL & Supabase Database Migrations

The full SQL migration files are located in `supabase/migrations/`:

| File | Purpose |
|------|---------|
| [`01_schema.sql`](supabase/migrations/01_schema.sql) | DDL schema defining all 10 relational tables, foreign keys, constraints, and indexes. |
| [`02_rls_policies.sql`](supabase/migrations/02_rls_policies.sql) | Row-Level Security activation, helper functions, and SELECT/INSERT/UPDATE/DELETE policies. |
| [`03_seed.sql`](supabase/migrations/03_seed.sql) | Realistic seed dataset for `HM Blendz` and `Northstar Creative`. |

To run against a live Supabase instance:
1. Open the Supabase Studio dashboard -> **SQL Editor**.
2. Execute `01_schema.sql`, followed by `02_rls_policies.sql`, and `03_seed.sql`.

---

## 🧪 Tenant Isolation & RBAC Testing Guide

NEXORA includes a dedicated security testing suite at `/app/security` and an automated API test endpoint at `/api/security/test`.

### Test Scenarios:

1. **Cross-Tenant Data Isolation**:
   - Organization A (`HM Blendz`): Projects include *Website Redesign*, *Q4 Marketing*, *Brand Refresh*, *Operations Upgrade*.
   - Organization B (`Northstar Creative`): Projects include *Omnichannel Retail Rollout*, *Design System v2*.
   - **Verification**: Switch to HM Blendz. Notice Northstar projects are completely excluded. Switch to Northstar Creative. Notice HM Blendz projects are completely excluded.

2. **Direct ID Access Probe**:
   - Navigate to `/app/projects/20000000-0000-0000-0000-000000000001` (Northstar's project ID) while active in HM Blendz.
   - **Verification**: Returns a strict `404 / 403 Tenant Isolation Boundary` screen. The database RLS policy prevents cross-tenant leaks.

3. **Role-Based Access Control**:
   - Switch persona in the sidebar to **Maya Chen (VIEWER)**:
     - The `+ New Project`, `+ Add Task`, and `+ Upload Asset` buttons display permission warnings or are disabled.
     - Direct mutation attempts return `[RBAC Violation] Role 'VIEWER' is not authorized`.
   - Switch persona to **Sarah Khan (ADMIN)**:
     - Can manage projects, invite members, and change roles of Editors and Viewers.
     - Cannot demote or remove the Owner (Alex Morgan).
   - Switch persona to **Alex Morgan (OWNER)**:
     - Unrestricted administrative and billing authority.

4. **Billing & Webhooks**:
   - Navigate to `/app/billing`.
   - Under the **Webhook Simulator** tab, trigger `subscription.updated` or `invoice.payment_failed`.
   - Inspect the live JSON processor output and note the corresponding entry automatically logged in `/app/activity`.

---

## 📁 Project Directory Structure

```
nexora/
├── supabase/
│   └── migrations/
│       ├── 01_schema.sql            # PostgreSQL relational tables & indexes
│       ├── 02_rls_policies.sql      # Supabase RLS security definer policies
│       └── 03_seed.sql              # HM Blendz & Northstar seed data
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── security/test/       # Tenant isolation assertion API
│   │   │   └── webhooks/billing/    # Simulated billing webhook endpoint
│   │   ├── app/                     # Authenticated SaaS application workspace
│   │   │   ├── activity/            # Immutable audit logs
│   │   │   ├── assets/              # Digital asset management
│   │   │   ├── billing/             # Subscription tiers & webhooks
│   │   │   ├── projects/            # Project catalog & [id] details
│   │   │   ├── security/            # Tenant isolation test runner
│   │   │   ├── settings/            # Profile, org settings & danger zone
│   │   │   ├── tasks/               # Global Kanban sprint boards
│   │   │   ├── team/                # Team directory & invitations
│   │   │   └── page.tsx             # Main operations dashboard
│   │   ├── forgot-password/         # Password recovery
│   │   ├── invite/                  # Invitation acceptance flow
│   │   ├── login/                   # Supabase auth & persona switcher
│   │   ├── signup/                  # Registration & workspace onboarding
│   │   ├── globals.css              # Dark Enterprise Editorial styling
│   │   ├── layout.tsx               # Root layout & NexoraProvider
│   │   └── page.tsx                 # Commercial landing page
│   ├── components/
│   │   ├── brand/logo.tsx           # Nexora monogram & wordmark
│   │   ├── layout/                  # Sidebar, TopNav, AppLayout
│   │   └── ui/                      # Badge, Button, Modal, EmptyState, StatCard
│   ├── lib/
│   │   ├── entitlements.ts          # Subscription plan quotas
│   │   ├── permissions.ts           # RBAC permission matrix
│   │   ├── store/nexora-store.ts    # Multi-tenant state repository & RLS simulation
│   │   └── supabase/                # Browser and server Supabase clients
│   ├── providers/
│   │   └── nexora-provider.tsx      # React context with live tenant switching
│   └── types/
│       └── database.ts              # TypeScript database models & RBAC types
├── .env.example                     # Environment template
├── middleware.ts                    # Route protection & security headers
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Custom design tokens
└── tsconfig.json                    # Strict TypeScript configuration
```
