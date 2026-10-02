'use client';

// ==============================================================================
// NEXORA TENANT AUDIT TRAIL & ACTIVITY LOGS (/app/activity)
// Append-only compliance log strictly partitioned by organization_id
// ==============================================================================

import React, { useState, useMemo } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { useNexora } from '@/providers/nexora-provider';
import { EmptyState } from '@/components/ui/empty-state';
import { ActivityLog } from '@/types/database';

export default function ActivityPage() {
  const { currentOrg, activityLogs } = useNexora();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      const actorName = log.actor?.full_name?.toLowerCase() || 'system';
      const matchesSearch =
        actorName.includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = actionFilter === 'ALL' || log.action.startsWith(actionFilter);
      return matchesSearch && matchesAction;
    });
  }, [activityLogs, searchQuery, actionFilter]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('created') || action.includes('joined') || action.includes('uploaded')) {
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    }
    if (action.includes('updated') || action.includes('changed') || action.includes('renewed')) {
      return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
    }
    if (action.includes('deleted') || action.includes('removed') || action.includes('canceled')) {
      return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
    }
    return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1F2333]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-indigo-400" />
            Audit Logs & Compliance
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Immutable, append-only security events for <strong className="text-gray-300">{currentOrg?.name}</strong>.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-[#141624] border border-[#232638] text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Tenant Isolated (RLS)</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by actor or action keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#12141F] border border-[#232638] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs bg-[#12141F] text-gray-300 border border-[#232638] rounded-lg px-2.5 py-1.5 focus:outline-none"
            aria-label="Filter by action category"
          >
            <option value="ALL">All Event Types</option>
            <option value="project">Project Events</option>
            <option value="task">Task Events</option>
            <option value="member">Member Events</option>
            <option value="asset">Asset Events</option>
            <option value="subscription">Subscription & Webhooks</option>
            <option value="organization">Organization Settings</option>
          </select>
        </div>
      </div>

      {/* Audit Log Stream */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="w-6 h-6" />}
          title="No audit events found"
          description="Actions performed in this workspace automatically appear in this immutable log."
        />
      ) : (
        <div className="rounded-xl bg-[#11131C] border border-[#232638] divide-y divide-[#1D2030]">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div key={log.id} className="p-4 hover:bg-[#141726]/40 transition-colors">
                <div
                  className="flex items-start justify-between gap-4 cursor-pointer"
                  onClick={() => toggleExpand(log.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Actor Avatar */}
                    {log.actor?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={log.actor.avatar_url}
                        alt={log.actor.full_name}
                        className="w-7 h-7 rounded-full object-cover border border-[#262A3E] mt-0.5"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-300 flex items-center justify-center text-xs font-bold mt-0.5 border border-indigo-500/20">
                        {log.actor?.full_name?.charAt(0) || 'S'}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="text-xs text-gray-200">
                        <strong className="text-white font-medium">
                          {log.actor?.full_name || 'System / Webhook'}
                        </strong>{' '}
                        <span className="text-gray-400 font-mono text-[11px]">
                          ({log.actor?.title || 'System Process'})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>

                        <span className="text-[11px] font-mono text-gray-500">
                          entity: {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right flex-shrink-0">
                    <div className="text-[11px] font-mono text-gray-500">
                      <div>{new Date(log.created_at).toLocaleTimeString()}</div>
                      <div>{new Date(log.created_at).toLocaleDateString()}</div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded JSON Metadata Payload */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#1C1F2E] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        Audit Metadata Payload (JSONB)
                      </span>
                      <span>Tenant: {currentOrg?.name}</span>
                    </div>

                    <pre className="p-3 rounded-lg bg-[#0A0B10] border border-[#212435] text-[11px] font-mono text-indigo-300 overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
