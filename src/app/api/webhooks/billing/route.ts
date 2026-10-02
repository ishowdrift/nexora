// ==============================================================================
// NEXORA SIMULATED BILLING WEBHOOK INGESTION ENDPOINT (/api/webhooks/billing)
// Server-side endpoint demonstrating billing event handling & entitlement updates
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getNexoraStore } from '@/lib/store/nexora-store';
import { SubscriptionPlan } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate signature / event payload structure
    const { event, organization_id, data } = body;

    if (!event || !organization_id) {
      return NextResponse.json(
        {
          error: 'Invalid webhook payload: event and organization_id are required fields',
          simulated: true,
        },
        { status: 400 }
      );
    }

    const validEvents = [
      'subscription.created',
      'subscription.updated',
      'subscription.canceled',
      'invoice.paid',
      'invoice.payment_failed',
    ];

    if (!validEvents.includes(event)) {
      return NextResponse.json(
        {
          error: `Unsupported webhook event: ${event}`,
          supported_events: validEvents,
          simulated: true,
        },
        { status: 400 }
      );
    }

    // 2. Identify the organization & execute business logic
    const store = getNexoraStore();

    // Process event
    const result = store.simulateWebhookEvent(event as any, {
      plan: data?.plan as SubscriptionPlan,
      status: data?.status,
      amount: data?.amount,
    });

    // 3. Return verified response
    return NextResponse.json({
      success: true,
      simulated: true,
      message: `Webhook event '${event}' successfully processed for tenant ${organization_id}`,
      execution: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Internal webhook processing failure',
        simulated: true,
      },
      { status: 500 }
    );
  }
}
