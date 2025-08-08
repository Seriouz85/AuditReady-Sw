import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
// import { toast } from '@/utils/toast'; // TODO: Add toast notifications
import { documentUploadService } from '@/services/documents/DocumentUploadService';
import { TagInitializationService } from '@/services/initialization/TagInitializationService';
import { OptimizedDemoDataService } from '@/services/demo/OptimizedDemoDataService';

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
        'view_lms_content',
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
      // CRITICAL SECURITY FIX: Check if this is a demo account FIRST
      // Demo accounts should NEVER access real database data
      if (user?.email === 'demo@auditready.com') {
        console.log('🛡️ SECURITY: Demo account detected in loadUserData - loading demo data instead');
        await loadDemoData();
        return;
      }

      // First check if user is platform admin
      if (user?.email) {
        console.log('Checking platform admin status for email:', user.email);
        
        // Use a more efficient query with timeout
        try {
          const { data: adminData, error: adminError } = await Promise.race([
            supabase
              .from('platform_administrators')
              .select('*')
              .ilike('email', user.email)
              .eq('is_active', true)
              .single(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Platform admin check timeout')), 3000)
            )
          ]) as any;
          
          if (adminData) {
            console.log('Platform admin access confirmed:', adminData);
            setIsPlatformAdmin(true);
            setLoading(false); // CRITICAL FIX: Clear loading state for platform admins
            return; // Platform admins don't need organization data
          }
          
          if (adminError) {
            if (adminError.code !== 'PGRST116') {
              console.warn('Platform admin check failed:', adminError);
            } else {
              console.log('No platform admin record found for:', user.email);
            }
          }
        } catch (timeoutError) {
          console.warn('Platform admin check timed out, proceeding as regular user');
          // Don't set loading to false here, let it continue to check organization data
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
          setLoading(false); // Ensure loading state is cleared
          return;
        }
        console.warn('Organization data fetch failed:', {
          code: orgUserError.code,
          message: orgUserError.message,
          details: orgUserError.details
        });
        setLoading(false); // Ensure loading state is cleared
        return; // Don't throw error, just return gracefully
      }

      if (orgUserData) {
        // Cast to any to avoid type issues with database relations
        const typedOrgUserData = orgUserData as any;
        
        setOrganizationUser(typedOrgUserData);
        
        // Handle organization data with fallback
        if (typedOrgUserData.organization && typeof typedOrgUserData.organization === 'object' && !('error' in typedOrgUserData.organization)) {
          setOrganization(typedOrgUserData.organization);
        } else {
          console.warn('Organization data not properly loaded, will fetch separately');
          // Fetch organization separately if relation failed
          const { data: orgData } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', typedOrgUserData.organization_id)
            .single();
          if (orgData) {
            setOrganization(orgData as unknown as Organization);
          }
        }
        
        // Handle role data with fallback
        if (typedOrgUserData.role && typeof typedOrgUserData.role === 'object' && !('error' in typedOrgUserData.role)) {
          setUserRole(typedOrgUserData.role);
        } else {
          console.warn('Role data not properly loaded, will fetch separately');
          // Fetch role separately if relation failed
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('*')
            .eq('id', typedOrgUserData.role_id)
            .single();
          if (roleData) {
            setUserRole(roleData as unknown as UserRole);
          }
        }

        // Initialize unified category tags for the organization
        try {
          await TagInitializationService.initializeUnifiedCategoryTags();
          const orgId = typedOrgUserData.organization?.id || typedOrgUserData.organization_id;
          console.log('Initialized unified category tags for organization:', orgId);
        } catch (tagError) {
          console.warn('Failed to initialize unified category tags for organization:', tagError);
          // Don't block user login if tag initialization fails
        }

        // Update last login (silently fail if it doesn't work)
        try {
          await supabase
            .from('organization_users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', typedOrgUserData.id);
        } catch (updateError) {
          console.warn('Failed to update last login:', updateError);
        }
      }
    } catch (error) {
      console.warn('Error loading user data:', error);
      setLoading(false); // CRITICAL FIX: Always clear loading state on error
      // Don't show toast error for non-critical data loading failures
      // Only log for debugging purposes
    }
  };

  const loadDemoData = async () => {
    setLoading(false); // Ensure loading state is cleared for demo users
    // Create demo organization structure (using real database org)
    const demoOrg: Organization = {
      id: '34adc4bb-d1e7-43bd-8249-89c76520533d', // Real demo org ID from database
      name: 'Demo Organization',
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
      organization_id: '34adc4bb-d1e7-43bd-8249-89c76520533d', // Real demo org ID
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
    
    // Initialize unified category tags and apply to existing demo requirements
    try {
      console.log('Initializing unified category tags for demo account...');
      await TagInitializationService.initializeUnifiedCategoryTags();
      
      // Apply unified category tagging to existing demo requirements
      const taggedCount = await TagInitializationService.applyUnifiedCategoryTaggingToExistingRequirements(demoOrg.id);
      if (taggedCount > 0) {
        console.log(`Applied unified category tagging to ${taggedCount} demo requirements`);
      }

      // Populate categories field from existing tags for SaaS readiness (only if categories column exists)
      try {
        const categoriesPopulated = await TagInitializationService.populateCategoriesFromTags(demoOrg.id);
        if (categoriesPopulated > 0) {
          console.log(`Populated categories field for ${categoriesPopulated} demo requirements`);
        }
      } catch (categoriesError) {
        console.log('Categories column not available, skipping category population');
      }

      // Use optimized demo data enhancement (10-20x faster)
      console.log('🚀 Using optimized demo data enhancement...');
      
      // First check if we need to enhance (uses efficient caching)
      const needsEnhancement = !await OptimizedDemoDataService.isDemoDataEnhanced();
      
      if (needsEnhancement) {
        // Use database function for super fast enhancement
        try {
          const { data, error } = await supabase.rpc('check_demo_enhancement_needed');
          
          if (!error && data === true) {
            // Run the optimized enhancement on database side
            const { error: enhanceError } = await supabase.rpc('set_demo_requirement_statuses');
            
            if (!enhanceError) {
              await OptimizedDemoDataService.markDemoDataAsEnhanced();
              console.log('✅ Demo data enhanced using optimized database function');
            } else {
              // Fallback to client-side batch optimization
              await OptimizedDemoDataService.enhanceDemoDataOptimized();
            }
          } else {
            console.log('✅ Demo data already properly enhanced (database check)');
            await OptimizedDemoDataService.markDemoDataAsEnhanced();
          }
        } catch (dbError) {
          // If database functions don't exist yet, use optimized client method
          console.log('Using optimized client-side enhancement...');
          await OptimizedDemoDataService.enhanceDemoDataOptimized();
        }
      } else {
        console.log('✅ Demo data already enhanced (cached - instant)');
      }
      
      // Get stats from materialized view (instant) or fallback
      try {
        const { data: stats } = await supabase
          .from('demo_compliance_stats')
          .select('*')
          .single();
          
        if (stats) {
          const typedStats = stats as any; // Cast to handle unknown types
          console.log('Demo data statistics (from view):', {
            fulfilled: Math.round((typedStats.fulfilled / typedStats.total_requirements) * 100) + '%',
            partiallyFulfilled: Math.round((typedStats.partially_fulfilled / typedStats.total_requirements) * 100) + '%',
            notFulfilled: Math.round((typedStats.not_fulfilled / typedStats.total_requirements) * 100) + '%'
          });
        }
      } catch (viewError) {
        // Fallback to regular stats if view doesn't exist
        const stats = await OptimizedDemoDataService.getDemoDataStatistics();
        if (stats) {
          console.log('Demo data statistics:', stats.percentages);
        }
      }
    } catch (error) {
      console.warn('Failed to initialize demo account enhancements:', error);
      // Don't block demo initialization if enhancement fails
    }
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
        // CRITICAL SECURITY: Clear any existing Supabase session first
        console.log('🛡️ SECURITY: Clearing contaminated session for demo login');
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.warn('Could not clear existing session:', signOutError);
        }
        
        // Use mock authentication for demo
        const { mockSignIn } = await import('@/lib/mockAuth');
        const mockUser = await mockSignIn(email, password);
        
        if (mockUser) {
          // Convert mock user to Supabase User format with demo-specific data
          const demoUser: User = {
            id: 'demo-user-id',
            email: 'demo@auditready.com',
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            user_metadata: { 
              name: 'Demo User',
              first_name: 'Demo',
              last_name: 'User',
              avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo User'
            },
            app_metadata: {},
            role: 'authenticated'
          };
          
          console.log('🛡️ SECURITY: Setting clean demo user:', demoUser);
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
            setLoading(false); // Immediately set loading to false for platform admin
            
            // Skip loading user data for platform admin to improve performance
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
          
          // CRITICAL SECURITY: Skip data loading for demo accounts during initialization
          if (session.user.email === 'demo@auditready.com') {
            console.log('🛡️ SECURITY: Demo account detected in initialization - loading demo data only');
            await loadDemoData();
            return;
          }
          
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
              
              // CRITICAL SECURITY: Skip data loading for demo accounts
              if (session.user.email === 'demo@auditready.com') {
                console.log('🛡️ SECURITY: Demo account detected in auth state change - skipping database access');
                await loadDemoData();
                return;
              }
              
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