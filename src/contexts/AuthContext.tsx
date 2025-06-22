import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast';
import { documentUploadService } from '@/services/documents/DocumentUploadService';

interface Organization {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  company_size?: string;
  subscription_tier: string;
  stripe_customer_id?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  name: string;
  display_name: string;
  permissions: string[];
}

interface OrganizationUser {
  id: string;
  organization_id: string;
  user_id: string;
  role_id: string;
  status: string;
  joined_at?: string;
  last_login_at?: string;
  metadata: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  userRole: UserRole | null;
  organizationUser: OrganizationUser | null;
  loading: boolean;
  isDemo: boolean;
  isPlatformAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [organizationUser, setOrganizationUser] = useState<OrganizationUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  // Check if this is a demo account (ONLY demo@auditready.com gets mock data)
  const isDemo = user?.email === 'demo@auditready.com';

  const hasPermission = (permission: string): boolean => {
    // Platform admins have all permissions
    if (isPlatformAdmin) {
      return true;
    }
    
    // Special check for platform admin permission
    if (permission === 'platform_admin') {
      return isPlatformAdmin;
    }
    
    if (isDemo) {
      // Demo users have comprehensive permissions for showcasing features
      const demoPermissions = [
        'view_dashboard',
        'view_standards',
        'view_requirements',
        'view_assessments',
        'view_documents',
        'create_documents',
        'access_lms',
        'create_lms_content',
        'edit_lms_content',
        'view_lms_reports',
        'admin_lms',
        'view_reports',
        'manage_org_settings',
        'manage_org_users'
      ];
      return demoPermissions.includes(permission);
    }
    
    return userRole?.permissions?.includes(permission) || false;
  };

  const loadUserData = async (userId: string) => {
    try {
      
      // First check if user is platform admin
      if (user?.email) {
        const { data: adminData, error: adminError } = await supabase
          .from('platform_administrators')
          .select('*')
          .eq('email', user.email)
          .eq('is_active', true)
          .single();
        
        if (adminData) {
          setIsPlatformAdmin(true);
          return; // Platform admins don't need organization data
        }
        
        if (adminError && adminError.code !== 'PGRST116') {
          console.warn('Platform admin check failed:', adminError);
        }
      }
      
      if (isDemo) {
        // Load demo organization data
        await loadDemoData();
        return;
      }

      // Load user's organization relationship
      const { data: orgUserData, error: orgUserError } = await supabase
        .from('organization_users')
        .select(`
          *,
          organization:organizations(*),
          role:user_roles(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (orgUserError) {
        if (orgUserError.code === 'PGRST116') {
          // No organization found - user needs onboarding
          console.log('User has no organization - needs onboarding');
          return;
        }
        console.warn('Organization data fetch failed:', {
          code: orgUserError.code,
          message: orgUserError.message,
          details: orgUserError.details
        });
        return; // Don't throw error, just return gracefully
      }

      if (orgUserData) {
        setOrganizationUser(orgUserData);
        setOrganization(orgUserData.organization);
        setUserRole(orgUserData.role);

        // Update last login (silently fail if it doesn't work)
        try {
          await supabase
            .from('organization_users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', orgUserData.id);
        } catch (updateError) {
          console.warn('Failed to update last login:', updateError);
        }
      }
    } catch (error) {
      console.warn('Error loading user data:', error);
      // Don't show toast error for non-critical data loading failures
      // Only log for debugging purposes
    }
  };

  const loadDemoData = async () => {
    // Create demo organization structure
    const demoOrg: Organization = {
      id: 'demo-org',
      name: 'Demo Company',
      slug: 'demo-company',
      industry: 'Technology',
      company_size: '51-200',
      subscription_tier: 'demo',
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const demoRole: UserRole = {
      id: 'demo-role',
      name: 'demo_admin',
      display_name: 'Demo Administrator',
      permissions: [
        'view_dashboard',
        'view_standards',
        'view_requirements',
        'view_assessments',
        'view_documents',
        'create_documents',
        'access_lms',
        'create_lms_content',
        'edit_lms_content',
        'view_lms_reports',
        'admin_lms',
        'view_reports',
        'manage_org_settings',
        'manage_org_users'
      ]
    };

    const demoOrgUser: OrganizationUser = {
      id: 'demo-org-user',
      organization_id: 'demo-org',
      user_id: user?.id || 'demo-user',
      role_id: 'demo-role',
      status: 'active',
      joined_at: new Date().toISOString(),
      metadata: { is_demo: true }
    };

    setOrganization(demoOrg);
    setUserRole(demoRole);
    setOrganizationUser(demoOrgUser);
    
    // Initialize demo documents
    documentUploadService.initializeDemoDocuments();
  };

  const refreshUserData = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);

      // Check for demo credentials first
      if (email === 'demo@auditready.com' && password === 'AuditReady@Demo2025!') {
        // Use mock authentication for demo
        const { mockSignIn } = await import('@/lib/mockAuth');
        const mockUser = await mockSignIn(email, password);
        
        if (mockUser) {
          // Convert mock user to Supabase User format
          const demoUser: User = {
            id: 'demo-user-id',
            email: 'demo@auditready.com',
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            user_metadata: { name: 'Demo User' },
            app_metadata: {},
            role: 'authenticated'
          };
          
          setUser(demoUser);
          await loadDemoData();
          // Ensure loading is false so ProtectedRoute doesn't redirect
          setLoading(false);
          return {};
        }
      }

      // Handle platform admin with real Supabase authentication
      if (email.toLowerCase() === 'payam.razifar@gmail.com' && password === 'knejs2015') {
        console.log('Platform admin login detected - attempting real Supabase auth');
        try {
          // Use real Supabase authentication
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password
          });

          if (data.user && !error) {
            console.log('Platform admin successfully authenticated with Supabase');
            setUser(data.user);
            setIsPlatformAdmin(true);
            // Ensure loading is false so ProtectedRoute doesn't redirect
            setLoading(false);
            return {};
          } else {
            console.log('Platform admin Supabase auth failed, error:', error?.message);
            return { error: error?.message || 'Platform admin authentication failed' };
          }
        } catch (error) {
          console.error('Error in platform admin auth:', error);
          return { error: 'Platform admin authentication failed' };
        }
      }

      // Real Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        try {
          await loadUserData(data.user.id);
        } catch (userDataError) {
          console.warn('Failed to load user data during sign in:', userDataError);
          // Don't block sign in if user data fails to load
        }
      }

      return {};
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (!isDemo) {
        await supabase.auth.signOut();
      }
      
      setUser(null);
      setOrganization(null);
      setUserRole(null);
      setOrganizationUser(null);
      setIsPlatformAdmin(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let subscription: any = null;
    
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          // Only load user data if we're not on public pages
          const isPublicPage = window.location.pathname === '/' || 
                              window.location.pathname === '/login' || 
                              window.location.pathname === '/signup' || 
                              window.location.pathname === '/pricing' || 
                              window.location.pathname === '/about';
          
          if (!isPublicPage) {
            try {
              await loadUserData(session.user.id);
            } catch (userDataError) {
              console.warn('Failed to load user data during initialization:', userDataError);
              // Don't block initialization if user data fails to load
            }
          }
        }

        // Listen to auth changes
        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              setUser(session.user);
              // Only load user data after sign in if we're not on public pages
              const isPublicPage = window.location.pathname === '/' || 
                                  window.location.pathname === '/login' || 
                                  window.location.pathname === '/signup' || 
                                  window.location.pathname === '/pricing' || 
                                  window.location.pathname === '/about';
              
              if (!isPublicPage) {
                try {
                  await loadUserData(session.user.id);
                } catch (userDataError) {
                  console.warn('Failed to load user data after sign in:', userDataError);
                  // Don't block sign in if user data fails to load
                }
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setOrganization(null);
              setUserRole(null);
              setOrganizationUser(null);
              setIsPlatformAdmin(false);
            }
          }
        );
        
        subscription = data.subscription;
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    organization,
    userRole,
    organizationUser,
    loading,
    isPlatformAdmin,
    isDemo,
    signIn,
    signOut,
    refreshUserData,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};