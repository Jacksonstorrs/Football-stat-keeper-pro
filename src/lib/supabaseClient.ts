import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let supabaseInstance: SupabaseClient | null = null;

export function initSupabase(): SupabaseClient {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  // Optional auth state listener
  supabaseInstance.auth.onAuthStateChange((_event, session) => {
    // Handle session changes if needed
  });
  return supabaseInstance;
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    initSupabase();
  }
  return supabaseInstance!;
}

export function reconnectSupabase(): void {
  initSupabase();
}