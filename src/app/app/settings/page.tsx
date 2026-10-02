'use client';

// ==============================================================================
// NEXORA WORKSPACE & PROFILE SETTINGS (/app/settings)
// Profile management, workspace metadata, and RBAC-guarded danger zone
// ==============================================================================

import React, { useState } from 'react';
import {
  Settings,
  User,
  Building2,
  ShieldAlert,
  Save,
  Trash2,
  Check,
} from 'lucide-react';
import { useNexora } from '@/providers/nexora-provider';
import { RoleBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

export default function SettingsPage() {
  const {
    currentOrg,
    currentUser,
    currentMemberRole,
    canPerform,
  } = useNexora();

  const [activeTab, setActiveTab] = useState<'profile' | 'organization'>('profile');

  // Profile form
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [userTitle, setUserTitle] = useState(currentUser?.title || '');
  const [isSavedProfile, setIsSavedProfile] = useState(false);

  // Org form
  const [orgName, setOrgName] = useState(currentOrg?.name || '');
  const [orgDomain, setOrgDomain] = useState(currentOrg?.domain || '');
  const [isSavedOrg, setIsSavedOrg] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canManageOrg = canPerform('manage_organization');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      currentUser.full_name = fullName;
      currentUser.title = userTitle;
    }
    setIsSavedProfile(true);
    setTimeout(() => setIsSavedProfile(false), 2000);
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageOrg.allowed) {
      alert(canManageOrg.reason || 'Permission denied');
      return;
    }
    if (currentOrg) {
      currentOrg.name = orgName;
      currentOrg.domain = orgDomain;
    }
    setIsSavedOrg(true);
    setTimeout(() => setIsSavedOrg(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1F2333]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Workspace Settings
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Account preferences and configuration for <strong className="text-gray-300">{currentOrg?.name}</strong>.
          </p>
        </div>

        <RoleBadge role={currentMemberRole} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#1F2333]">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          User Profile
        </button>
        <button
          onClick={() => setActiveTab('organization')}
          className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'organization'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Organization & Security
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="p-6 rounded-xl bg-[#11131C] border border-[#232638] max-w-2xl space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={userTitle}
                onChange={(e) => setUserTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full text-xs px-3 py-2 bg-[#151722] border border-[#232638] rounded-lg text-gray-400 font-mono cursor-not-allowed"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Managed via Supabase Auth identity provider.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {isSavedProfile && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                  <Check className="w-3.5 h-3.5" />
                  Profile updated successfully
                </span>
              )}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={<Save className="w-3.5 h-3.5" />}
                className="ml-auto"
              >
                Save Profile
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl">
          <div className="p-6 rounded-xl bg-[#11131C] border border-[#232638] space-y-4">
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Organization Information
            </h3>

            <form onSubmit={handleSaveOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  disabled={!canManageOrg.allowed}
                  className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Tenant Domain
                </label>
                <input
                  type="text"
                  value={orgDomain}
                  onChange={(e) => setOrgDomain(e.target.value)}
                  disabled={!canManageOrg.allowed}
                  className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Tenant Partition Identifier (Slug)
                </label>
                <input
                  type="text"
                  disabled
                  value={currentOrg?.slug || ''}
                  className="w-full text-xs px-3 py-2 bg-[#151722] border border-[#232638] rounded-lg text-gray-400 font-mono cursor-not-allowed"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {isSavedOrg && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                    <Check className="w-3.5 h-3.5" />
                    Organization saved
                  </span>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!canManageOrg.allowed}
                  title={canManageOrg.reason}
                  className="ml-auto"
                >
                  Save Settings
                </Button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="p-6 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
            <h3 className="text-sm font-semibold text-rose-300 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Organization Danger Zone
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Deleting an organization irrevocably wipes all projects, tasks, digital assets, and audit logs. This operation requires <strong>OWNER</strong> role.
            </p>
            <div className="pt-2">
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                disabled={currentMemberRole !== 'OWNER'}
                title={currentMemberRole !== 'OWNER' ? 'Only the Organization Owner can perform this action' : undefined}
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete Organization
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Org Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Organization Deletion"
        description="Destructive action requiring Owner privileges."
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-300 leading-relaxed">
            Please confirm you want to delete <strong className="text-white font-bold">{currentOrg?.name}</strong>. All tenant tables in PostgreSQL with <code>organization_id = &apos;{currentOrg?.id}&apos;</code> will be dropped.
          </p>

          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-mono text-rose-300">
            For security testing in this demo environment, organization deletion is blocked to maintain test repeatability.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                alert('Safety lock: Demo organizations are protected from permanent deletion.');
                setIsDeleteModalOpen(false);
              }}
            >
              Acknowledge Block
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
