import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

let supabase: SupabaseClient | null = null;

export async function initSupabaseClient(retries = 3, delay = 500): Promise<SupabaseClient> {
  for (let i = 0; i < retries; i++) {
    try {
      supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_ANON_KEY);
      await supabase.auth.getSession();
      return supabase;
    } catch (error) {
      if (i < retries - 1) await new Promise((resolve) => setTimeout(resolve, delay));
      else throw error;
    }
  }
  throw new Error('Unexpected error on Supabase client init');
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) throw new Error('Supabase client not initialized!');
  return supabase;
}
