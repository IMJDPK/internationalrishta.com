/**
 * Supabase service-role client — bypasses RLS for webhook and admin server writes.
 * NEVER import from client components or browser bundles.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireServiceRoleEnv(): { url: string; serviceRoleKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url) {
    throw new Error(
      "[supabase/service] Missing NEXT_PUBLIC_SUPABASE_URL for service-role client."
    );
  }
  if (!serviceRoleKey) {
    throw new Error(
      "[supabase/service] Missing SUPABASE_SERVICE_ROLE_KEY. " +
        "Required for Stripe webhook DB writes that bypass RLS."
    );
  }

  return { url, serviceRoleKey };
}

export function createServiceClient(): SupabaseClient {
  const { url, serviceRoleKey } = requireServiceRoleEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
