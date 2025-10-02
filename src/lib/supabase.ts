import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Supabase configuration

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Create main Supabase client (singleton pattern to avoid multiple instances)
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

function createSupabaseClient() {
  if (!supabaseInstance) {
    // Validate configuration - if missing, create a dummy client to prevent crashes
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase configuration missing. Creating dummy client.');
      // Create a minimal client that won't crash but also won't work
      supabaseInstance = createClient('https://example.supabase.co', 'dummy-key', {
        auth: {
          storageKey: 'auditready_auth', // Unique storage key to avoid conflicts
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          headers: { 'x-client-info': 'auditready-app' },
        },
      });
    } else {
      // Create the real Supabase client
      supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          storageKey: 'auditready_auth', // Unique storage key to avoid conflicts
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          headers: { 'x-client-info': 'auditready-app' },
        },
      });
    }
  }
  return supabaseInstance;
}

// Lazy-load the Supabase client to avoid initialization errors
export const supabase = (() => {
  let client: ReturnType<typeof createClient<Database>> | null = null;
  return new Proxy({} as ReturnType<typeof createClient<Database>>, {
    get(target, prop) {
      if (!client) {
        client = createSupabaseClient();
      }
      return (client as any)[prop];
    }
  });
})();

// Create admin client for platform admin operations (only if service role key is available)
// This bypasses RLS for admin operations
let supabaseAdminInstance: ReturnType<typeof createClient<Database>> | null = null;

function createAdminClient() {
  if (!supabaseAdminInstance) {
    if (supabaseServiceRoleKey) {
      // Create proper admin client with service role key
      supabaseAdminInstance = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
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
      // Return the same instance reference to avoid creating multiple clients
      // This ensures we don't create a new client instance
      return createSupabaseClient(); // Return existing singleton
    }
  }
  return supabaseAdminInstance;
}

// Lazy-load the admin client as well
export const supabaseAdmin = (() => {
  let client: ReturnType<typeof createClient<Database>> | null = null;
  return new Proxy({} as ReturnType<typeof createClient<Database>>, {
    get(target, prop) {
      if (!client) {
        client = createAdminClient();
      }
      return (client as any)[prop];
    }
  });
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