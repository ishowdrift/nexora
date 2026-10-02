'use client';

// ==============================================================================
// NEXORA REGISTRATION & ORGANIZATION ONBOARDING (/signup)
// Provisions new tenant boundary, profile, and Owner membership
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { NexoraLogo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { useNexora } from '@/providers/nexora-provider';

export default function SignUpPage() {
  const router = useRouter();
  const { createOrganization } = useNexora();

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgDomain, setOrgDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all personal credentials');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleCompleteSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setErrorMsg('Organization name is required');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      createOrganization(orgName.trim(), orgDomain.trim() || undefined);
      router.push('/app');
    } catch (err: any) {
      setErrorMsg(err.message || 'Provisioning failed');
      setIsLoading(false);
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
            {step === 1 ? 'Create your administrator account' : 'Provision your workspace'}
          </h1>
          <p className="text-xs text-gray-400">
            {step === 1
              ? 'Step 1 of 2: Personal profile authentication'
              : 'Step 2 of 2: Multi-tenant organization setup'}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-[#11131C] border border-[#232638] space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              {errorMsg}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Miller"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Work Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="jordan@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Master Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={8}
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
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Continue to Organization Setup
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCompleteSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Company / Organization Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Industrial Solutions"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Primary Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. apexindustrial.com"
                  value={orgDomain}
                  onChange={(e) => setOrgDomain(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#141724] border border-[#202436] text-[11px] text-gray-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tenant Isolation Provisioning:</span>
                </div>
                <p>• You will be assigned as Organization <strong>OWNER</strong>.</p>
                <p>• Dedicated RLS partition key created.</p>
                <p>• Bootstraps default Free Tier entitlement limits.</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  isLoading={isLoading}
                >
                  Provision & Launch Workspace
                </Button>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-[#1C1F2E]">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
