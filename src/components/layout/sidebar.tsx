'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  FileBox,
  Users,
  ScrollText,
  CreditCard,
  ShieldCheck,
  Settings,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { NexoraLogo } from '@/components/brand/logo';
import { useNexora } from '@/providers/nexora-provider';
import { RoleBadge } from '@/components/ui/badge';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const {
    currentOrg,
    currentUser,
    currentMemberRole,
    allProfiles,
    switchUser,
    subscription,
  } = useNexora();

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Projects', href: '/app/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/app/tasks', icon: CheckSquare },
    { name: 'Digital Assets', href: '/app/assets', icon: FileBox },
    { name: 'Team & Access', href: '/app/team', icon: Users },
    { name: 'Audit Logs', href: '/app/activity', icon: ScrollText },
    { name: 'Billing & Plans', href: '/app/billing', icon: CreditCard },
    { name: 'Security & RLS', href: '/app/security', icon: ShieldCheck, badge: 'Tests' },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full bg-[#0D0E15] border-r border-[#1F2333] select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-[#1F2333]">
        <Link href="/app" onClick={onCloseMobile}>
          <NexoraLogo size="sm" showTagline={false} />
        </Link>
      </div>

      {/* Organization Header Mini Widget */}
      <div className="px-4 py-3 border-b border-[#1A1D2B] bg-[#11131C]/60">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
            Active Tenant
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
            Isolated
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-white truncate max-w-[140px]">
            {currentOrg?.name || 'No Organization'}
          </span>
          <RoleBadge role={currentMemberRole} />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-mono uppercase tracking-wider text-gray-400">
          Workspace Operations
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-[#161824]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <item.icon
                  className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.2 text-[9px] font-mono bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Interactive Persona Switcher for Quick RBAC Validation */}
      <div className="p-3 border-t border-[#1F2333] bg-[#0E1018]">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            <UserCheck className="w-3 h-3 text-indigo-400" />
            <span>Simulate Persona</span>
          </div>
          <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">
            RBAC
          </span>
        </div>

        <div className="relative">
          <select
            value={currentUser?.id}
            onChange={(e) => switchUser(e.target.value)}
            className="w-full text-xs bg-[#161826] text-gray-200 border border-[#2B2F44] rounded-lg px-2.5 py-2 appearance-none focus:outline-none focus:border-indigo-500 font-sans cursor-pointer hover:bg-[#1A1D2F]"
            aria-label="Switch active persona"
          >
            {allProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name} ({p.title || 'User'})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

        {/* Current User Details */}
        <div className="mt-2.5 flex items-center gap-2 px-1">
          {currentUser?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name}
              className="w-7 h-7 rounded-full object-cover border border-[#2B2F44]"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/30">
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-gray-200 truncate">
              {currentUser?.full_name}
            </span>
            <span className="text-[10px] text-gray-400 font-mono truncate">
              {currentUser?.email}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
