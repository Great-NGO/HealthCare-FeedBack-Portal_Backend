import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "./env.js";

/**
 * Supabase client instance for general operations
 * Uses the anonymous key - respects RLS policies
 */
export const supabase: SupabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey
);

/**
 * Supabase admin client for privileged operations
 * Uses the service role key - bypasses RLS policies
 * Use with caution!
 */
export const supabaseAdmin: SupabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey || config.supabaseAnonKey
);

/**
 * Creates a Supabase client with the user's JWT token
 * Used for operations that should respect user's permissions
 * @param accessToken - User's JWT access token
 */
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
