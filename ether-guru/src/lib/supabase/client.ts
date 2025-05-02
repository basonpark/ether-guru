import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Ensure environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or Anon Key in environment variables');
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
