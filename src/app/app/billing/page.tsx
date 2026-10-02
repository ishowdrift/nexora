'use client';

// ==============================================================================
// NEXORA BILLING, PLANS & SIMULATED WEBHOOK SYSTEM (/app/billing)
// Commercial SaaS subscription lifecycle, entitlement controls, and webhook simulator
// ==============================================================================

import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Sparkles,
  RefreshCw,
  Terminal,
  AlertCircle,
  ShieldCheck,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useNexora } from '@/providers/nexora-provider';
import { PlanBadge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PLAN_LIMITS, formatBytes } from '@/lib/entitlements';
import { SubscriptionPlan } from '@/types/database';

export default function BillingPage() {
  const {
    currentOrg,
    currentMemberRole,
    subscription,
    usageStats,
    updateSubscriptionPlan,
    simulateWebhook,
    canPerform,
  } = useNexora();

  const [activeTab, setActiveTab] = useState<'plans' | 'webhooks'>('plans');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState<SubscriptionPlan | null>(null);

  // Webhook simulator state
  const [webhookEvent, setWebhookEvent] = useState<
    'subscription.updated' | 'subscription.canceled' | 'invoice.paid' | 'invoice.payment_failed'
  >('subscription.updated');
  const [webhookPlan, setWebhookPlan] = useState<SubscriptionPlan>('BUSINESS');
  const [webhookResult, setWebhookResult] = useState<any | null>(null);
  const [isTriggeringWebhook, setIsTriggeringWebhook] = useState(false);

  const canManageBilling = canPerform('manage_billing');
  const currentPlan = subscription?.plan || 'FREE';

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return;
    setIsUpdatingPlan(plan);
    try {
      await updateSubscriptionPlan(plan);
    } catch (err: any) {
      alert(err.message || 'Permission denied to manage billing');
    } finally {
      setIsUpdatingPlan(null);
    }
  };

  const handleFireWebhook = async () => {
    setIsTriggeringWebhook(true);
    setWebhookResult(null);
    try {
      const payload: any = {
        organization_id: currentOrg?.id,
        plan: webhookPlan,
        timestamp: new Date().toISOString(),
      };
      const res = await simulateWebhook(webhookEvent, payload);
      setWebhookResult(res);
    } catch (err: any) {
      setWebhookResult({ error: err.message || 'Webhook failed' });
    } finally {
      setIsTriggeringWebhook(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1F2333]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            Billing & Subscriptions
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Subscription lifecycle, plan entitlements, and webhook simulations for <strong className="text-gray-300">{currentOrg?.name}</strong>.
          </p>
        </div>

        <div className="flex rounded-lg bg-[#141624] p-0.5 border border-[#232638]">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'plans'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Plans & Quotas
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'webhooks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Webhook Simulator
          </button>
        </div>
      </div>

      {activeTab === 'plans' ? (
        <div className="space-y-6">
          {/* Current Subscription Status Bar */}
          <div className="p-5 rounded-xl bg-[#11131C] border border-[#232638] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">Current Plan:</span>
                <PlanBadge plan={currentPlan} />
                <StatusBadge status={subscription?.status || 'ACTIVE'} />
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Subscription ID: <code className="text-gray-300">{subscription?.provider_subscription_id || 'sub_sim_live'}</code>
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
              <div>
                <span>Renewal Cycle: </span>
                <strong className="text-gray-200">
                  {new Date(subscription?.current_period_end || Date.now() + 30 * 86400000).toLocaleDateString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Pricing Tier Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(['FREE', 'PRO', 'BUSINESS'] as SubscriptionPlan[]).map((planKey) => {
              const plan = PLAN_LIMITS[planKey];
              const isCurrent = currentPlan === planKey;

              return (
                <div
                  key={planKey}
                  className={`relative p-6 rounded-xl bg-[#11131C] border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.15)] bg-gradient-to-b from-[#141624] to-[#11131C]'
                      : 'border-[#232638] hover:border-[#2F344D]'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                      Active Workspace Tier
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {plan.name}
                      </h3>
                      {planKey === 'PRO' && (
                        <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white font-mono">
                        ${plan.priceMonthly}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">/month</span>
                    </div>

                    <div className="mt-5 space-y-2.5 text-xs text-gray-300">
                      <div className="font-semibold text-gray-400 uppercase tracking-wider text-[10px] font-mono pb-1 border-b border-[#1C1F2E]">
                        Entitlement Limits
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span>Up to <strong>{plan.maxMembers}</strong> team seats</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span>Up to <strong>{plan.maxProjects}</strong> active projects</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span><strong>{formatBytes(plan.maxStorageBytes)}</strong> cloud asset storage</span>
                      </div>
                      {plan.features.slice(3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-400">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#1C1F2E]">
                    <Button
                      variant={isCurrent ? 'outline' : 'primary'}
                      size="sm"
                      className="w-full"
                      disabled={isCurrent || !canManageBilling.allowed || isUpdatingPlan !== null}
                      isLoading={isUpdatingPlan === planKey}
                      onClick={() => handleSelectPlan(planKey)}
                      title={!canManageBilling.allowed ? canManageBilling.reason : undefined}
                    >
                      {isCurrent ? 'Current Plan' : `Switch to ${planKey}`}
                    </Button>
                    {!canManageBilling.allowed && (
                      <span className="block text-center text-[10px] text-gray-500 mt-1.5 font-mono">
                        Requires Admin or Owner role
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Webhook Simulator Section */
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Development-Only Webhook Simulator</p>
              <p className="mt-0.5 text-amber-200/80 leading-relaxed">
                This mechanism replicates incoming Stripe/payment provider webhooks. When triggered, it verifies payload schema, validates organization ID, mutates the subscription state, recalibrates plan entitlements, and logs an immutable audit event.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Control Panel */}
            <div className="p-5 rounded-xl bg-[#11131C] border border-[#232638] space-y-4">
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Dispatch Inbound Event
              </h2>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Event Type
                </label>
                <select
                  value={webhookEvent}
                  onChange={(e) => setWebhookEvent(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="subscription.updated">subscription.updated</option>
                  <option value="subscription.canceled">subscription.canceled</option>
                  <option value="invoice.paid">invoice.paid</option>
                  <option value="invoice.payment_failed">invoice.payment_failed</option>
                </select>
              </div>

              {webhookEvent === 'subscription.updated' && (
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Target Subscription Plan
                  </label>
                  <select
                    value={webhookPlan}
                    onChange={(e) => setWebhookPlan(e.target.value as SubscriptionPlan)}
                    className="w-full text-xs px-3 py-2 bg-[#171926] border border-[#26293D] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="FREE">FREE ($0/mo)</option>
                    <option value="PRO">PRO ($49/mo)</option>
                    <option value="BUSINESS">BUSINESS ($199/mo)</option>
                  </select>
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={handleFireWebhook}
                  isLoading={isTriggeringWebhook}
                  icon={<Zap className="w-3.5 h-3.5" />}
                >
                  Simulate Webhook Delivery
                </Button>
              </div>
            </div>

            {/* Execution Inspector */}
            <div className="p-5 rounded-xl bg-[#0D0E15] border border-[#212435] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1D2032]">
                  <span className="text-xs font-mono font-semibold text-gray-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    Webhook Processor Log
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">
                    HTTP 200 OK
                  </span>
                </div>

                <div className="mt-3">
                  {webhookResult ? (
                    <pre className="p-3 rounded-lg bg-[#07080D] border border-[#1B1D2B] text-[11px] font-mono text-emerald-400 overflow-x-auto">
                      {JSON.stringify(webhookResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-gray-500 font-mono py-8 text-center">
                      Select an event and click &quot;Simulate Webhook Delivery&quot; to inspect the server response.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1D2032] text-[11px] font-mono text-gray-400">
                Target Tenant ID: <code>{currentOrg?.id}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
