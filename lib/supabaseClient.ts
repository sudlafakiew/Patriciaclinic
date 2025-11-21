
import { createClient } from '@supabase/supabase-js';

// Credentials provided by user
const DEFAULT_URL = 'https://gbltkenplrbrraufyyvg.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdibHRrZW5wbHJicnJhdWZ5eXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNTI2OTEsImV4cCI6MjA3MjgyODY5MX0.FddlOa9JM7tGqd7mCp10dHtaCdGu6XXi2Y9J3a8msMc';

// Helper to validate URL
const isValidUrl = (urlString: string | null): boolean => {
  if (!urlString) return false;
  try {
    return urlString.startsWith('http://') || urlString.startsWith('https://');
  } catch (e) {
    return false;
  }
};

// 1. Try to get config from Environment Variables
const ENV_URL = process.env.SUPABASE_URL;
const ENV_KEY = process.env.SUPABASE_ANON_KEY;

// 2. Try to get config from Local Storage (for runtime configuration override)
const LOCAL_URL = typeof window !== 'undefined' ? localStorage.getItem('sb_url') : null;
const LOCAL_KEY = typeof window !== 'undefined' ? localStorage.getItem('sb_key') : null;

// 3. Resolve final configuration
// Priority: Valid Local Storage > Environment Variable > Hardcoded Default
const supabaseUrl = (isValidUrl(LOCAL_URL) ? LOCAL_URL : null) || ENV_URL || DEFAULT_URL;
const supabaseAnonKey = LOCAL_KEY || ENV_KEY || DEFAULT_KEY;

// Initialize Client
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export const isConfigured = () => {
  // Since we now have valid defaults, the app is always configured.
  return true;
};

export const configureSupabase = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sb_url', url);
    localStorage.setItem('sb_key', key);
    window.location.reload(); // Reload to re-initialize client with new keys
  }
};

export const resetConfiguration = () => {
   if (typeof window !== 'undefined') {
    localStorage.removeItem('sb_url');
    localStorage.removeItem('sb_key');
    window.location.reload();
  }
};
