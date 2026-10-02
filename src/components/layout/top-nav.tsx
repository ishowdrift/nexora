'use client';

import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  Plus,
  Menu,
  Shield,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useNexora } from '@/providers/nexora-provider';
import { RoleBadge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface TopNavProps {
  onOpenMobileMenu: () => void;
}

export function TopNav({ onOpenMobileMenu }: TopNavProps) {
  const {
    currentOrg,
    currentMemberRole,
    currentUser,
    userOrganizations,
    switchOrg,
    createOrganization,
    resetToDemoSeeds,
  } = useNexora();

  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDomain, setNewOrgDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
      setCreateError('Organization name is required');
      return;
    }
    setIsSubmitting(true);
    setCreateError(null);
    try {
      createOrganization(newOrgName.trim(), newOrgDomain.trim() || undefined);
      setIsCreateOrgModalOpen(false);
      setNewOrgName('');
      setNewOrgDomain('');
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-[#0D0E15]/90 backdrop-blur-md border-b border-[#1F2333] px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0">
        {/* Left Section: Mobile Menu + Org Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 lg:hidden"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Organization Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#141622] hover:bg-[#1B1E2E] border border-[#26293D] text-left transition-colors group"
              aria-label="Select organization"
            >
              <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                  {currentOrg?.name || 'Select Workspace'}
                  <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-white transition-transform" />
                </span>
                <span className="text-[10px] text-gray-400 font-mono -mt-0.5">
                  {currentMemberRole ? `${currentMemberRole} access` : 'No role'}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isOrgDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsOrgDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#12141F] border border-[#25283B] shadow-2xl p-2 z-50 animate-scale-in">
                  <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 border-b border-[#1E2130]">
                    Your Organizations (Tenants)
                  </div>

                  <div className="py-1 space-y-1 max-h-56 overflow-y-auto">
                    {userOrganizations.map((item) => {
                      const isCurrent = item.organization.id === currentOrg?.id;
                      return (
                        <button
                          key={item.organization.id}
                          onClick={() => {
                            switchOrg(item.organization.id);
                            setIsOrgDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                            isCurrent
                              ? 'bg-indigo-600/20 text-white font-medium border border-indigo-500/30'
                              : 'text-gray-300 hover:bg-[#1A1D2B]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full bg-indigo-500/60" />
                            <span className="truncate">{item.organization.name}</span>
                          </div>
                          <RoleBadge role={item.role} />
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-[#1E2130]">
                    <button
                      onClick={() => {
                        setIsOrgDropdownOpen(false);
                        setIsCreateOrgModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-indigo-300 hover:bg-indigo-500/10 transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Organization</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Section: RLS Status + Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick RLS & Isolation Status Pill */}
          <Link
            href="/app/security"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#131623] hover:bg-[#1A1E30] border border-[#23273D] text-[11px] font-mono text-gray-300 transition-colors"
            title="Click to view full tenant isolation test suite"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-400">RLS:</span>
            <span className="text-emerald-400 font-semibold">Active & Isolated</span>
          </Link>

          {/* Quick Demo Reset Button */}
          <button
            onClick={() => {
              if (confirm('Reset store back to default seed data? All temporary changes will reset.')) {
                resetToDemoSeeds();
              }
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors border border-[#232638]"
            title="Reset to default seed data"
            aria-label="Reset demo data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Create Organization Modal */}
      <Modal
        isOpen={isCreateOrgModalOpen}
        onClose={() => setIsCreateOrgModalOpen(false)}
        title="Create New Organization"
        description="Provision a brand-new multi-tenant workspace with isolated PostgreSQL boundary."
      >
        <form onSubmit={handleCreateOrg} className="space-y-4">
          {createError && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Organization Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vertex Studio"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Company Domain (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. vertexstudio.io"
              value={newOrgDomain}
              onChange={(e) => setNewOrgDomain(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Used for single-sign-on matching and domain email routing.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOrgModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Provision Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
