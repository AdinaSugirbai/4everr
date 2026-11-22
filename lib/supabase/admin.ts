import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client: it bypasses Row Level Security.
 * SERVER ONLY. Never import this file in a browser component, and never name the key NEXT_PUBLIC_*.
 * Returns null when SUPABASE_SERVICE_ROLE_KEY is not set, so the caller can answer with a clear error.
 */
export function supabaseAdmin(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
