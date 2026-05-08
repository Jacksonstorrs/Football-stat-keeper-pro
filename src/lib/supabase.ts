import { createClient } from "@supabase/supabase-js";  

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;  
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;  

export const supabase = createClient(supabaseUrl, supabaseAnonKey);  

// Initialize database schema if not exists  
export async function initDatabase() {  
  try {  
    // Create tables if they don't exist  
    await supabase.from('game_data').select('id').limit(1);  
    await supabase.from('teams').select('id').limit(1);  
  } catch (error) {  
    console.error('Database initialization failed:', error);  
    throw new Error('Database schema not found. Please create tables in Supabase.');  
  }  
}  