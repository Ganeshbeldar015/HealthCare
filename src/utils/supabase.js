// utils/supabase.js
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not defined in environment variables');
  throw new Error('VITE_SUPABASE_URL is required');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not defined in environment variables');
  throw new Error('VITE_SUPABASE_ANON_KEY is required');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    console.log('🔗 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key length:', supabaseAnonKey?.length || 0);
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return { success: false, error };
    } else {
      console.log('✅ Supabase connected successfully');
      return { success: true, data };
    }
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
    return { success: false, error: err };
  }
};

export { supabase };