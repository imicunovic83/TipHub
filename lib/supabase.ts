import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Singleton client — Supabase logs "Multiple GoTrueClient instances detected"
// when more than one client shares the same auth-token storage key, and an
// auth state change (e.g. signOut) on one instance doesn't always propagate
// to listeners on the others. Reusing a single instance fixes the broken
// logout-button -> header-still-shows-user bug and silences the warning.
let cached: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  if (!cached) {
    cached = createClient(supabaseUrl, supabaseAnonKey);
  }
  return cached;
}
