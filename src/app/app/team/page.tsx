'use client';

// ==============================================================================
// NEXORA TEAM & ACCESS CONTROL (/app/team)
// Member directory, RBAC role management, and invitation dispatch
// ==============================================================================

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Copy,
  Check,
  Clock,
  ArrowRight,
  AlertTriangle,
  Mail,
} from 'lucide-react';
import { useNexora } from '@/providers/nexora-provider';
import { RoleBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { MemberRole } from '@/types/database';
import { getPlanLimits } from '@/lib/entitlements';

export default function TeamPage() {
  const {
    currentOrg,
    currentUser,
    currentMemberRole,
    members,
    invitations,
    subscription,
    usageStats,
    inviteMember,
    updateMemberRole,
    removeMember,
    acceptInvitation,
    canPerform,
  } = useNexora();

  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');

  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('EDITOR');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  // Role modification modal state
  const [roleModalMember, setRoleModalMember] = useState<any | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<MemberRole>('VIEWER');
  const [roleChangeError, setRoleChangeError] = useState<string | null>(null);

  // Member removal modal
  const [removeModalMember, setRemoveModalMember] = useState<any | null>(null);

  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const canInvite = canPerform('invite_members');
  const canChangeRoles = canPerform('change_member_roles');
  const canRemove = canPerform('remove_members');

  const planLimits = getPlanLimits(subscription?.plan || 'FREE');

  const handleOpenInvite = () => {
    setInviteEmail('');
    setInviteRole('EDITOR');
    setInviteError(null);
    setIsInviteModalOpen(true);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setInviteError('Email address is required');
      return;
    }
    setIsInviting(true);
    setInviteError(null);
    try {
      await inviteMember(inviteEmail.trim(), inviteRole);
      setIsInviteModalOpen(false);
      setActiveTab('invitations');
    } catch (err: any) {
      setInviteError(err.message || 'Failed to dispatch invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleOpenRoleModal = (member: any) => {
    setRoleModalMember(member);
    setSelectedNewRole(member.role);
    setRoleChangeError(null);
  };

  const handleConfirmRoleChange = async () => {
    if (!roleModalMember) return;
    try {
      await updateMemberRole(roleModalMember.user_id, selectedNewRole);
      setRoleModalMember(null);
    } catch (err: any) {
      setRoleChangeError(err.message || 'Permission denied to update role');
    }
  };

  const handleConfirmRemoval = async () => {
    if (!removeModalMember) return;
    try {
      await removeMember(removeModalMember.user_id);
      setRemoveModalMember(null);
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  const handleSimulatedAccept = async (token: string) => {
    try {
      await acceptInvitation(token);
      alert('Invitation accepted! User has joined this workspace.');
    } catch (err: any) {
      alert(err.message || 'Failed to accept invitation');
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1F2333]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Team & Access Control
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            RBAC permission hierarchy and membership roster for <strong className="text-gray-300">{currentOrg?.name}</strong>.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<UserPlus className="w-3.5 h-3.5" />}
          onClick={handleOpenInvite}
          disabled={!canInvite.allowed}
          title={canInvite.reason}
        >
          Invite Member
        </Button>
      </div>

      {/* Member limit quota counter */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#11131C] border border-[#232638] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Plan Seat Quota:</span>
          <span className="text-white font-bold">{usageStats.members_count}</span>
          <span className="text-gray-500">/</span>
          <span className="text-gray-300">{planLimits.maxMembers} seats occupied</span>
        </div>
        <span className="text-indigo-400 text-[11px]">
          {planLimits.name}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#1F2333]">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Active Members ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('invitations')}
          className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'invitations'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Pending Invitations ({invitations.filter((i) => i.status === 'PENDING').length})
        </button>
      </div>

      {/* Members Table */}
      {activeTab === 'members' && (
        <div className="rounded-xl bg-[#11131C] border border-[#232638] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141624] border-b border-[#212436] text-gray-400 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Title / Role</th>
                  <th className="py-3 px-4">Access Level</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D2030] text-gray-300">
                {members.map((member) => {
                  const isCurrent = member.user_id === currentUser?.id;
                  return (
                    <tr key={member.id} className="hover:bg-[#141726]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {member.profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.profile.avatar_url}
                              alt={member.profile.full_name}
                              className="w-8 h-8 rounded-full object-cover border border-[#262A3E]"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs">
                              {member.profile?.full_name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white flex items-center gap-1.5">
                              {member.profile?.full_name}
                              {isCurrent && (
                                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              {member.profile?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-gray-400">
                        {member.profile?.title || 'Operational Staff'}
                      </td>

                      <td className="py-3.5 px-4">
                        <RoleBadge role={member.role} />
                      </td>

                      <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canChangeRoles.allowed && (
                            <button
                              onClick={() => handleOpenRoleModal(member)}
                              className="px-2 py-1 rounded bg-[#171A28] hover:bg-[#202438] text-[11px] text-gray-300 border border-[#272B40] transition-colors"
                            >
                              Change Role
                            </button>
                          )}

                          {canRemove.allowed && (
                            <button
                              onClick={() => setRemoveModalMember(member)}
                              className="p-1.5 rounded text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Remove Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invitations Table */}
      {activeTab === 'invitations' && (
        <div className="rounded-xl bg-[#11131C] border border-[#232638] overflow-hidden">
          {invitations.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No invitations pending. Click &quot;Invite Member&quot; to invite a teammate.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141624] border-b border-[#212436] text-gray-400 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Invited Email</th>
                    <th className="py-3 px-4">Proposed Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4 text-right">Dev Simulator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D2030] text-gray-300">
                  {invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#141726]/50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-mono text-white">{inv.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <RoleBadge role={inv.role} />
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono ${
                            inv.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">
                        {new Date(inv.expires_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inv.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => copyInviteLink(inv.token)}
                              className="px-2 py-1 rounded bg-[#171A28] hover:bg-[#202438] text-[11px] text-gray-300 border border-[#272B40] flex items-center gap-1"
                              title="Copy invitation link"
                            >
                              {copiedToken === inv.token ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>Copy Link</span>
                            </button>
                            <button
                              onClick={() => handleSimulatedAccept(inv.token)}
                              className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[11px] text-white flex items-center gap-1 font-medium"
                              title="Instantly accept this invitation as the invited user"
                            >
                              <span>Accept as User</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Member to Workspace"
        description={`Send invitation for ${currentOrg?.name}. Subject to plan seat limits.`}
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          {inviteError && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              {inviteError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Organization Role <span className="text-rose-400">*</span>
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as MemberRole)}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              {currentMemberRole === 'OWNER' && <option value="ADMIN">ADMIN - Workspace Management</option>}
              <option value="EDITOR">EDITOR - Project & Asset Creation</option>
              <option value="VIEWER">VIEWER - Read-Only Access</option>
            </select>
            <p className="mt-1 text-[11px] text-gray-500">
              Only Organization Owners can grant Admin privileges.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isInviting}
            >
              Dispatch Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        isOpen={roleModalMember !== null}
        onClose={() => setRoleModalMember(null)}
        title="Modify Organization Role"
        description={`Update role for ${roleModalMember?.profile?.full_name}. Protected by RBAC rules.`}
      >
        <div className="space-y-4">
          {roleChangeError && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              {roleChangeError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              New Assigned Role
            </label>
            <select
              value={selectedNewRole}
              onChange={(e) => setSelectedNewRole(e.target.value as MemberRole)}
              className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              {currentMemberRole === 'OWNER' && <option value="OWNER">OWNER</option>}
              {currentMemberRole === 'OWNER' && <option value="ADMIN">ADMIN</option>}
              <option value="EDITOR">EDITOR</option>
              <option value="VIEWER">VIEWER</option>
            </select>
          </div>

          <div className="p-3 rounded-lg bg-[#141724] border border-[#222538] text-[11px] text-gray-400 space-y-1">
            <p className="font-semibold text-gray-300">RBAC Enforcement Rules:</p>
            <p>• Admins cannot elevate someone to Owner or alter Owner roles.</p>
            <p>• Users cannot escalate or change their own role.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRoleModalMember(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmRoleChange}
            >
              Update Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={removeModalMember !== null}
        onClose={() => setRemoveModalMember(null)}
        title="Remove Member from Organization"
        description="Revoke workspace access for this account."
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-300">
            Are you sure you want to remove{' '}
            <strong className="text-white font-semibold">
              {removeModalMember?.profile?.full_name}
            </strong>{' '}
            from <strong className="text-white font-semibold">{currentOrg?.name}</strong>?
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRemoveModalMember(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmRemoval}
            >
              Remove Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
