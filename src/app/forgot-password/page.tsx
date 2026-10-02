'use client';

// ==============================================================================
// NEXORA PASSWORD RESET (/forgot-password)
// Password reset instructions flow
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { NexoraLogo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
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
            Reset Account Password
          </h1>
          <p className="text-xs text-gray-400">
            Enter your work email to receive password recovery instructions.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-[#11131C] border border-[#232638] space-y-4">
          {isSubmitted ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Recovery Email Dispatched
              </h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                If an account exists for <strong className="text-gray-300">{email}</strong>, a secure password reset link has been dispatched.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button size="sm" variant="secondary" className="w-full">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full"
              >
                Send Recovery Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
