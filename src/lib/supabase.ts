import { getSupabase, reconnectSupabase } from './supabaseClient';

export const supabase = getSupabase();
export { reconnectSupabase };