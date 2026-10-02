'use client';

// ==============================================================================
// NEXORA INVITATION ONBOARDING (/invite)
// Allows invited teammates to review workspace terms, role, and join
// ==============================================================================

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { NexoraLogo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/ui/badge';
import { useNexora } from '@/providers/nexora-provider';

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const { invitations, acceptInvitation } = useNexora();

  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const invitation = invitations.find((i) => i.token === token);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('No token provided in request');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await acceptInvitation(token, fullName.trim() || undefined);
      router.push('/app');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept invitation');
      setIsSubmitting(false);
    }
  };

  if (!token || !invitation) {
    return (
      <div className="p-8 rounded-xl bg-[#11131C] border border-[#232638] text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-white">
          Invalid or Expired Invitation
        </h2>
        <p className="text-xs text-gray-400 max-w-xs mx-auto">
          This invitation token does not exist or has expired. Please request a new invitation from your workspace administrator.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button size="sm" variant="secondary">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-[#11131C] border border-[#232638] space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-[#1C1F2E]">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">
            {invitation.organization?.name || 'Workspace Invitation'}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">Assigned Access:</span>
            <RoleBadge role={invitation.role} />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleAccept} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Invited Email Address
          </label>
          <input
            type="email"
            disabled
            value={invitation.email}
            className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-gray-400 font-mono cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Your Full Name (Display Name)
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Kevin Smith"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="p-3 rounded-lg bg-[#141724] border border-[#202436] text-[11px] text-gray-400 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-Tenant Access Protocol:</span>
          </div>
          <p>• You will be enrolled into <strong>{invitation.organization?.name}</strong>.</p>
          <p>• Row-Level Security rules will scope your visibility to this organization.</p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="w-full"
          isLoading={isSubmitting}
          icon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Accept Invitation & Join
        </Button>
      </form>
    </div>
  );
}

export default function InvitePage() {
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
            Workspace Invitation
          </h1>
          <p className="text-xs text-gray-400">
            Join your team on the NEXORA business operations platform.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-gray-500 font-mono">
              Loading invitation details...
            </div>
          }
        >
          <InviteContent />
        </Suspense>
      </div>
    </div>
  );
}
