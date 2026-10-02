// ==============================================================================
// NEXORA B2B SAAS - SUPABASE CLIENT INITIALIZATION
// Browser Client with fallback support
// ==============================================================================

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-nexora.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
