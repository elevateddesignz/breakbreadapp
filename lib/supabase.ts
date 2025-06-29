import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Load environment variables from app.json extra config
const SUPABASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Strong runtime check to fail fast if env vars missing
if (!SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL. Check your app.json extra config.');
}
if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_ANON_KEY. Check your app.json extra config.');
}

// Create and export Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);