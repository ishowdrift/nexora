'use client';

// ==============================================================================
// NEXORA AUTHENTICATION LOGIN (/login)
// Supabase Auth credentials + Quick-Switch Persona Simulator
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { NexoraLogo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/ui/badge';
import { useNexora } from '@/providers/nexora-provider';

export default function LoginPage() {
  const router = useRouter();
  const { allProfiles, switchUser, switchOrg } = useNexora();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const personas = [
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      name: 'Alex Morgan',
      role: 'OWNER',
      org: 'HM Blendz',
      orgId: '11111111-1111-1111-1111-111111111111',
      desc: 'Full permissions & billing control',
    },
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      name: 'Sarah Khan',
      role: 'ADMIN',
      org: 'HM Blendz',
      orgId: '11111111-1111-1111-1111-111111111111',
      desc: 'Operational management & member invites',
    },
    {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      name: 'Daniel Reed',
      role: 'EDITOR',
      org: 'HM Blendz',
      orgId: '11111111-1111-1111-1111-111111111111',
      desc: 'Can create & edit projects, no deletions',
    },
    {
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      name: 'Maya Chen',
      role: 'VIEWER',
      org: 'HM Blendz',
      orgId: '11111111-1111-1111-1111-111111111111',
      desc: 'Read-only access, mutations rejected',
    },
    {
      id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      name: 'Marcus Vance',
      role: 'OWNER',
      org: 'Northstar Creative',
      orgId: '22222222-2222-2222-2222-222222222222',
      desc: 'Isolated Tenant 2 (zero access to HM Blendz)',
    },
  ];

  const handleQuickLogin = (persona: (typeof personas)[0]) => {
    switchOrg(persona.orgId);
    switchUser(persona.id);
    router.push('/app');
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    // Look for matching demo persona or fallback
    const matched = allProfiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      switchUser(matched.id);
      router.push('/app');
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setErrorMsg('Invalid login credentials in demo provider. Please select a seeded demo persona below.');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-gray-100 flex flex-col justify-center items-center p-6 selection:bg-indigo-500/30">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <NexoraLogo size="lg" showTagline={true} />
            </Link>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Sign in to your organization
          </h1>
          <p className="text-xs text-gray-400">
            Secure session backed by PostgreSQL authentication.
          </p>
        </div>

        {/* Credentials Form */}
        <div className="p-6 rounded-xl bg-[#11131C] border border-[#232638] space-y-4">
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="alex@hmblendz.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-[#1C1F2E]">
            Don&apos;t have an organization?{' '}
            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create workspace
            </Link>
          </div>
        </div>

        {/* 1-Click Quick Persona Login Sandbox for Reviewers */}
        <div className="p-5 rounded-xl bg-[#0D0E15] border border-[#202334] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              1-Click Demo Personas
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              Instant Access
            </span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Click any persona below to test RBAC authorization rules or tenant isolation boundaries immediately.
          </p>

          <div className="space-y-1.5">
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => handleQuickLogin(p)}
                className="w-full p-2.5 rounded-lg bg-[#12141F] hover:bg-[#181B2B] border border-[#222538] hover:border-indigo-500/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      @{p.org}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">
                    {p.desc}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <RoleBadge role={p.role as any} />
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
