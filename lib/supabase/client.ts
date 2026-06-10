/**
 * Supabase client-side helper
 * Uses `@supabase/ssr` for secure cookie-based auth integration
 */
import { createBrowserClient } from '@supabase/ssr';

// Fallback/Placeholder keys for local development preview
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key-123';

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Also export a single shared client instance for the client-side state managers
export const supabase = createClient();
