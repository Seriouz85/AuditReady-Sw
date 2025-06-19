import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Create main Supabase client (singleton pattern to avoid multiple instances)
let supabaseInstance: ReturnType<typeof createClient> | null = null;
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'auditready_auth', // Unique storage key to avoid conflicts
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: { 'x-client-info': 'auditready-app' },
      },
    });
  }
  return supabaseInstance;
})();

// Create admin client for platform admin operations (only if service role key is available)
// This bypasses RLS for admin operations
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

const createAdminClient = () => {
  if (supabaseServiceRoleKey) {
    // Create proper admin client with service role key
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        storageKey: 'auditready_service_role', // Unique key for service role
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: { 'x-client-info': 'auditready-service-role' },
      },
    });
  } else {
    // For demo purposes, return the same client to avoid multiple instances
    // In production, this should throw an error or redirect to setup
    return supabaseInstance;
  }
};

export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createAdminClient();
  }
  return supabaseAdminInstance;
})();

// Demo credentials for showcase purposes
export const DEMO_EMAIL = "demo@auditready.com";
export const DEMO_PASSWORD = "AuditReady@Demo2025!";

// Auth helper functions
export const supabaseAuth = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign up new user
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  // Get session
  getSession: () => {
    return supabase.auth.getSession();
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },
};