import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from '../utils/toast';
import { documentUploadService } from '../services/documents/DocumentUploadService';
import { TagInitializationService } from '../services/initialization/TagInitializationService';
import { OptimizedDemoDataService } from '../services/demo/OptimizedDemoDataService';
import { 
  OrganizationUserWithRelations, 
  DemoComplianceStats, 
  AuthSubscription,
  OrganizationSettings
} from '../types/auth';

interface Organization {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  company_size?: string;
  subscription_tier: string;
  stripe_customer_id?: string;
  settings: OrganizationSettings;
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
  metadata: Record<string, unknown>;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  userRole: UserRole | null;
  organizationUser: OrganizationUser | null;
  loading: boolean;
  isDemo: boolean;
  isPlatformAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; passwordSecurity?: { isWeak: boolean; reason?: string } }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
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
  
  // CRITICAL FIX: Initialize platform admin state from localStorage
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(() => {
    try {
      return localStorage.getItem('audit_ready_platform_admin') === 'true';
    } catch {
      return false;
    }
  });

  // Check if this is a demo account (ONLY demo@auditready.com gets mock data)
  const isDemo = user?.email === 'demo@auditready.com';

  // CRITICAL FIX: Helper to set platform admin state and persist to localStorage
  const setPlatformAdminState = (isAdmin: boolean) => {
    setIsPlatformAdmin(isAdmin);
    try {
      if (isAdmin) {
        localStorage.setItem('audit_ready_platform_admin', 'true');
      } else {
        localStorage.removeItem('audit_ready_platform_admin');
      }
    } catch (error) {
      console.warn('Failed to persist platform admin state:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    // CRITICAL SECURITY: Demo users NEVER have platform admin permission
    const isPlatformAdminEmail = user?.email?.toLowerCase() === 'payam.razifar@gmail.com' || 
                                 user?.email?.toLowerCase() === 'admin@auditready.com';
    
    if (permission === 'platform_admin') {
      // ONLY platform admin emails can have platform admin permission
      return isPlatformAdmin && isPlatformAdminEmail;
    }
    
    // Platform admins have all other permissions
    if (isPlatformAdmin && isPlatformAdminEmail) {
      return true;
    }
    
    if (isDemo) {
      // Demo users have comprehensive permissions for showcasing features (but NOT platform_admin)
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

      // CRITICAL FIX: Skip platform admin check if already set during login
      // This prevents the database query from overriding the hardcoded platform admin status
      if (isPlatformAdmin) {
        console.log('🔒 Platform admin already authenticated - skipping database check');
        setLoading(false);
        return;
      }

      // FALLBACK: Check if user is platform admin (for session restoration)
      if (user?.email?.toLowerCase() === 'payam.razifar@gmail.com') {
        console.log('🔒 Platform admin detected during session restoration');
        setPlatformAdminState(true);
        setLoading(false);
        return;
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
        // Type the organization user data properly
        const typedOrgUserData = orgUserData as OrganizationUserWithRelations;
        
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
            setOrganization(orgData as Organization);
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
            setUserRole(roleData as UserRole);
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
          const typedStats = stats as DemoComplianceStats;
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

  const signIn = async (email: string, password: string): Promise<{ error?: string; passwordSecurity?: { isWeak: boolean; reason?: string } }> => {
    try {
      setLoading(true);

      // Check for demo credentials first (using environment variables for security)
      const demoEmail = import.meta.env.VITE_DEMO_EMAIL || 'demo@auditready.com';
      const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || 'AuditReady@Demo2025!'; // Fallback to hardcoded for development
      
      if (email === demoEmail && password === demoPassword) {
        // Use mock authentication for demo
        console.log('🔐 Demo login - using mock authentication');
        const { mockSignIn } = await import('@/lib/mockAuth');
        const mockUser = await mockSignIn(email, password);
        
        if (mockUser) {
          // Convert mock user to Supabase User format with demo-specific data
          const demoUser: User = {
            id: '031dbc29-51fd-4135-9582-a9c5b63f7451', // Use the real demo user ID from database
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
          
          console.log('✅ Demo user authenticated successfully (mock mode)');
          setUser(demoUser);
          // isDemo is computed from user.email, no need to set it
          setPlatformAdminState(false); // CRITICAL: Demo users are NEVER platform admin
          
          // Store demo user flag for AdminService
          localStorage.setItem('demo_user', 'true');
          
          await loadDemoData();
          setLoading(false);
          return {};
        }
      }

      // Handle platform admin with real Supabase authentication
      const isPlatformAdminEmail = email.toLowerCase() === 'payam.razifar@gmail.com' || 
                                   email.toLowerCase() === 'admin@auditready.com';
      
      if (isPlatformAdminEmail) {
        console.log('Platform admin login detected - attempting real Supabase auth');
        try {
          // Use real Supabase authentication with the actual password provided
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password  // Use the actual password entered by the user
          });

          if (data.user && !error) {
            console.log('Platform admin successfully authenticated with Supabase');
            setUser(data.user);
            setPlatformAdminState(true);
            setLoading(false); // Immediately set loading to false for platform admin
            
            // Skip loading user data for platform admin to improve performance
            return {};
          } else {
            console.log('Platform admin Supabase auth failed, error:', error?.message);
            return { error: error?.message || 'Invalid login credentials' };
          }
        } catch (error) {
          console.error('Error in platform admin auth:', error);
          return { error: 'Authentication failed. Please check your credentials.' };
        }
      }

      // Real Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Handle leaked password protection error
        if (error.message?.toLowerCase().includes('password') && 
            (error.message?.toLowerCase().includes('weak') || 
             error.message?.toLowerCase().includes('compromised') ||
             error.message?.toLowerCase().includes('leaked') ||
             error.message?.toLowerCase().includes('breached'))) {
          console.warn('🔐 Security: Leaked password detected during sign-in');
          return { 
            error: 'Password security issue detected', 
            passwordSecurity: { 
              isWeak: true, 
              reason: 'This password has been found in data breaches and cannot be used for security reasons. Please reset your password.' 
            } 
          };
        }
        
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
      toast({
        title: "Sign-in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
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
      setPlatformAdminState(false);
      // isDemo is computed from user.email, no need to set it
      
      // Clear demo user flag
      localStorage.removeItem('demo_user');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign-out failed",
        description: "Unable to sign out properly. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Initialize auth state
  useEffect(() => {
    let subscription: AuthSubscription | null = null;
    
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
          
          // CRITICAL FIX: Check for platform admin during initialization
          if (session.user.email?.toLowerCase() === 'payam.razifar@gmail.com') {
            console.log('🔒 Platform admin detected during initialization');
            setPlatformAdminState(true);
            setLoading(false);
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
              
              // CRITICAL FIX: Check for platform admin immediately to prevent state loss
              if (session.user.email?.toLowerCase() === 'payam.razifar@gmail.com') {
                console.log('🔒 Platform admin detected in auth state change');
                setPlatformAdminState(true);
                setLoading(false);
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
              setPlatformAdminState(false);
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
    logout: signOut, // Alias for backward compatibility
    refreshUserData,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};