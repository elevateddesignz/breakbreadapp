import { createClient } from '@supabase/supabase-js';

// Load environment variables (these must be set in app.json or .env)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Strong runtime check to fail fast if env vars missing
if (!SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL. Check your .env or app config.');
}
if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_ANON_KEY. Check your .env or app config.');
}

// Create and export Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);