'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { TopNav } from './top-nav';
import { X, ShieldAlert, Sparkles } from 'lucide-react';
import { useNexora } from '@/providers/nexora-provider';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentOrg, currentUser, currentMemberRole, isLoading } = useNexora();

  return (
    <div className="min-h-screen bg-[#090A0F] text-gray-100 flex flex-col font-sans">
      {/* Top Demo & Reviewer Ribbon */}
      <div className="bg-[#101320] border-b border-[#202436] px-4 py-1.5 text-[11px] font-mono flex items-center justify-between overflow-x-auto text-gray-300">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gray-400">NEXORA Multi-Tenant Core:</span>
          <span className="text-white font-medium">{currentOrg?.name}</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">Actor:</span>
          <span className="text-indigo-300 font-medium">{currentUser?.full_name}</span>
          <span className="text-gray-500">({currentMemberRole})</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-gray-400 text-[10px]">
          <span>PostgreSQL RLS Enforced</span>
          <span>•</span>
          <span>Shared Schema Partitioning</span>
          <span>•</span>
          <span className="text-indigo-400">Deterministic Store Active</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Persistent Sidebar */}
        <div className="hidden lg:block h-[calc(100vh-2rem)] sticky top-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Slide-out Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-64 max-w-[80vw] h-full bg-[#0D0E15] z-50 flex flex-col shadow-2xl animate-scale-in">
              <div className="absolute top-4 right-3 z-10">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopNav onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-400 font-mono">
                  Loading isolated tenant context...
                </span>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
