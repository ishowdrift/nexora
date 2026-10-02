'use client';

// ==============================================================================
// NEXORA COMMERCIAL PRODUCT LANDING PAGE (/)
// Dark Enterprise Editorial SaaS design language showcasing architectural depth
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Lock,
  Database,
  ArrowRight,
  CheckCircle2,
  Layers,
  ScrollText,
  CreditCard,
  FolderKanban,
  Zap,
} from 'lucide-react';
import { NexoraLogo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { useNexora } from '@/providers/nexora-provider';

export default function HomePage() {
  const { currentOrg, currentUser, currentMemberRole } = useNexora();

  return (
    <div className="min-h-screen bg-[#090A0F] text-gray-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Global Navigation */}
      <header className="h-20 border-b border-[#1A1D2B] bg-[#090A0F]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <NexoraLogo size="md" showTagline={false} />

          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-gray-400">
            <Link href="/app" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/app/projects" className="hover:text-white transition-colors">
              Projects
            </Link>
            <Link href="/app/tasks" className="hover:text-white transition-colors">
              Tasks
            </Link>
            <Link href="/app/assets" className="hover:text-white transition-colors">
              Assets
            </Link>
            <Link href="/app/team" className="hover:text-white transition-colors">
              Team
            </Link>
            <Link href="/app/security" className="hover:text-emerald-400 text-emerald-400/90 font-mono transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              RLS Tests
            </Link>
            <Link href="/app/billing" className="hover:text-white transition-colors">
              Billing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button size="sm" variant="ghost" className="text-xs">
                Sign In
              </Button>
            </Link>
            <Link href="/app">
              <Button size="sm" variant="primary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Open App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-24 pb-20 px-6 overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/10 blur-[140px] pointer-events-none rounded-full" />

          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>Production-Style Multi-Tenant B2B Architecture</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Business operations, <br />
              <span className="bg-gradient-to-r from-indigo-300 via-indigo-100 to-violet-300 bg-clip-text text-transparent">
                organized.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              NEXORA is a high-performance business operations platform engineered with shared PostgreSQL schemas, Row-Level Security boundaries, four-tier RBAC, and strict tenant isolation.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/app">
                <Button size="lg" variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                  Enter Live Workspace
                </Button>
              </Link>
              <Link href="/app/security">
                <Button size="lg" variant="secondary" icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}>
                  Run Tenant Isolation Tests
                </Button>
              </Link>
            </div>

            {/* Live Context Badge */}
            <div className="pt-8 flex items-center justify-center gap-2 text-xs font-mono text-gray-500">
              <span>Active Tenant:</span>
              <span className="text-gray-300 font-semibold">{currentOrg?.name}</span>
              <span>•</span>
              <span>Actor Persona:</span>
              <span className="text-indigo-400 font-semibold">{currentUser?.full_name} ({currentMemberRole})</span>
            </div>
          </div>

          {/* Interactive Workspace Preview Mock */}
          <div className="max-w-5xl mx-auto mt-16 rounded-2xl bg-[#0D0E15] border border-[#212435] p-3 shadow-2xl relative group">
            <div className="flex items-center justify-between pb-3 px-3 border-b border-[#1A1D2B] text-xs font-mono text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                <span className="text-gray-400 ml-2">app.nexora.internal/workspace/{currentOrg?.slug}</span>
              </div>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                PostgreSQL RLS Active
              </span>
            </div>

            <div className="p-6 bg-[#11131C] rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-lg bg-[#141724] border border-[#23273D] space-y-1">
                <div className="text-[11px] font-mono text-gray-400 uppercase">Tenant Scope</div>
                <div className="text-sm font-bold text-white">{currentOrg?.name}</div>
                <div className="text-xs text-gray-400">Strictly isolated database tenant</div>
              </div>
              <div className="p-4 rounded-lg bg-[#141724] border border-[#23273D] space-y-1">
                <div className="text-[11px] font-mono text-gray-400 uppercase">Access Matrix</div>
                <div className="text-sm font-bold text-indigo-300">Role: {currentMemberRole}</div>
                <div className="text-xs text-gray-400">Server verified permissions</div>
              </div>
              <div className="p-4 rounded-lg bg-[#141724] border border-[#23273D] space-y-1">
                <div className="text-[11px] font-mono text-gray-400 uppercase">Data Boundary</div>
                <div className="text-sm font-bold text-emerald-300">0 Cross-Tenant Leaks</div>
                <div className="text-xs text-gray-400">Automated SQL tests passing</div>
              </div>
            </div>
          </div>
        </section>

        {/* Architectural Pillars */}
        <section id="architecture" className="py-20 px-6 border-t border-[#1A1D2B] bg-[#0A0B10]">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Architected for Commercial SaaS Demands
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
                No mock authorization. NEXORA enforces security through relational database modeling and server execution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-[#11131C] border border-[#212435] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  Shared Database Schema
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Every tenant-owned table carries <code>organization_id</code>. Avoids costly database-per-tenant proliferation while delivering complete structural isolation.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#11131C] border border-[#212435] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  PostgreSQL Row-Level Security
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Policies evaluate <code>is_org_member(organization_id)</code> via SECURITY DEFINER functions, ensuring Organization A can never query Organization B.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#11131C] border border-[#212435] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  Four-Tier RBAC Matrix
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Distinct OWNER, ADMIN, EDITOR, and VIEWER roles. Mutation attempts from Viewers are blocked at the server and database layers with 403 Forbidden.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#11131C] border border-[#212435] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                  <ScrollText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  Immutable Audit Logs
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  State-changing operations trigger append-only log records with JSONB metadata, capturing the actor, target resource, and timestamp.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#11131C] border border-[#212435] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  Subscription Entitlements
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Free, Pro, and Business tiers enforce real usage limits on team seats, active projects, and file storage. Includes developer webhook simulator.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#11131C] border border-[#212435] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  Live Organization Switcher
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Switch instantly between HM Blendz and Northstar Creative. The application clears state and reloads strictly scoped tenant data without leaks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SaaS Pages & Modules Directory */}
        <section className="py-20 px-6 border-t border-[#1A1D2B] bg-[#0E1018]">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300">
                <span>Application Routes & Workspaces</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Explore the SaaS Application Pages
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
                Every section below is fully interactive and backed by multi-tenant data isolation and RBAC.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/app"
                className="p-5 rounded-xl bg-[#12141F] border border-[#212435] hover:border-indigo-500/50 hover:bg-[#161826] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-indigo-400">/app</span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                    Operations Dashboard
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Tenant metrics, plan usage limits, recent projects, and quick operational actions.
                  </p>
                </div>
              </Link>

              <Link
                href="/app/projects"
                className="p-5 rounded-xl bg-[#12141F] border border-[#212435] hover:border-indigo-500/50 hover:bg-[#161826] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-indigo-400">/app/projects</span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                    Project Management
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Project catalog with status & priority filters, sorting, creation, and detail views.
                  </p>
                </div>
              </Link>

              <Link
                href="/app/tasks"
                className="p-5 rounded-xl bg-[#12141F] border border-[#212435] hover:border-indigo-500/50 hover:bg-[#161826] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-indigo-400">/app/tasks</span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                    Workspace Tasks & Kanban
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Multi-column sprint board with TODO, In Progress, Review, Done, and assignee filters.
                  </p>
                </div>
              </Link>

              <Link
                href="/app/assets"
                className="p-5 rounded-xl bg-[#12141F] border border-[#212435] hover:border-indigo-500/50 hover:bg-[#161826] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-indigo-400">/app/assets</span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                    Digital Asset Management
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Cloud file storage, category filters, and live storage quota telemetry.
                  </p>
                </div>
              </Link>

              <Link
                href="/app/team"
                className="p-5 rounded-xl bg-[#12141F] border border-[#212435] hover:border-indigo-500/50 hover:bg-[#161826] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-indigo-400">/app/team</span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                    Team Roster & Invitations
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Member directory, RBAC role modifications, and simulated invite acceptance links.
                  </p>
                </div>
              </Link>

              <Link
                href="/app/security"
                className="p-5 rounded-xl bg-[#12141F] border border-emerald-500/40 hover:border-emerald-400 hover:bg-[#141924] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-400">/app/security</span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-emerald-300 mt-2 group-hover:text-emerald-200 transition-colors">
                    Tenant Isolation & RLS Suite
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Automated SQL assertion runner proving 0 cross-tenant data leaks and direct ID probe tests.
                  </p>
                </div>
              </Link>

              <Link
                href="/app/activity"
                className="p-5 rounded-xl bg-[#12141F] border border-[#212435] hover:border-indigo-500/50 hover:bg-[#161826] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-indigo-400">/app/activity</span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                    Immutable Audit Trail
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Append-only compliance log with actor badges and expandable JSONB metadata.
                  </p>
                </div>
              </Link>

              <Link
                href="/app/billing"
                className="p-5 rounded-xl bg-[#12141F] border border-[#212435] hover:border-indigo-500/50 hover:bg-[#161826] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-indigo-400">/app/billing</span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                    Billing & Webhook Simulator
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Plan upgrade controls (Free/Pro/Business) and simulated Stripe webhook testing console.
                  </p>
                </div>
              </Link>

              <Link
                href="/login"
                className="p-5 rounded-xl bg-[#12141F] border border-[#212435] hover:border-indigo-500/50 hover:bg-[#161826] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-indigo-400">/login</span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                    1-Click Persona Login
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Instant login as Owner (Alex), Admin (Sarah), Editor (Daniel), or Viewer (Maya).
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-20 px-6 border-t border-[#1A1D2B] text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Ready to explore the application?
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Login as any of the seeded personas to experience Owner, Admin, Editor, and Viewer permission boundaries firsthand.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link href="/login">
                <Button size="lg" variant="primary">
                  Sign In to Workspace
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-[#1A1D2B] px-6 flex items-center justify-between text-xs text-gray-500 font-mono">
        <div>NEXORA © 2026. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <span>PostgreSQL + Supabase RLS</span>
          <span>•</span>
          <span>Next.js App Router</span>
        </div>
      </footer>
    </div>
  );
}
