// ==============================================================================
// NEXORA TENANT ISOLATION API TEST ENDPOINT (/api/security/test)
// Executes automated multi-tenant database & RLS policy boundary assertions
// ==============================================================================

import { NextResponse } from 'next/server';
import { getNexoraStore } from '@/lib/store/nexora-store';

export async function GET() {
  const store = getNexoraStore();
  const results = store.testTenantIsolation();
  const allPassed = results.every((r) => r.passed);

  return NextResponse.json({
    status: allPassed ? 'HEALTHY_AND_ISOLATED' : 'BREACH_DETECTED',
    timestamp: new Date().toISOString(),
    database_partitioning: 'shared_schema_organization_id',
    rls_enforcement: 'PostgreSQL Row-Level Security Enabled',
    test_assertions: results,
    metrics: {
      total_tests: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
    },
  });
}
