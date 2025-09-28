// Admin Dashboard Utilities
// Extracted from AdminDashboard.tsx to support component architecture

import { stripeAdminService, StripeProduct as AdminStripeProduct, StripePrice as AdminStripePrice, StripeCoupon } from '@/services/stripe/StripeAdminService';
import { adminService } from '@/services/admin/AdminService';
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast';
import type { PlatformStats, StandardSummary, OrganizationSummary, StripeStats } from './AdminSharedTypes';

// Load Stripe data function with timeout
export const loadStripeData = async () => {
  try {
    console.log('Loading Stripe data using secure StripeAdminService...');
    
    // Add overall timeout for all Stripe operations
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Stripe data loading timeout')), 10000); // 10 second overall timeout
    });
    
    // Get Stripe data in parallel using secure stripeAdminService
    const dataPromise = Promise.all([
      stripeAdminService.listProducts(),
      stripeAdminService.listPrices(),
      stripeAdminService.listCoupons(),
      stripeAdminService.getAnalytics()
    ]);
    
    const [products, prices, coupons, analytics] = await Promise.race([dataPromise, timeoutPromise]) as any;
    
    console.log('Loaded products:', products.length);
    console.log('Loaded prices:', prices.length);
    console.log('Loaded coupons:', coupons.length);
    console.log('Analytics:', analytics);

    return {
      stats: analytics,
      customers: [] as any[], // Load customers separately if needed
      products,
      prices,
      coupons
    };
  } catch (error) {
    console.error('Failed to load Stripe data:', error);
    return {
      stats: {
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeSubscriptions: 0,
        customers: 0,
        churnRate: 0,
        averageRevenuePerUser: 0,
        pendingInvoices: 0,
        connectionStatus: false
      },
      customers: [],
      products: [],
      prices: [],
      coupons: []
    };
  }
};

// Load dashboard data utility
export const loadDashboardData = async () => {
  try {
    const [
      platformStats,
      standardsResponse,
      organizationsResponse,
      stripeData
    ] = await Promise.allSettled([
      adminService.getPlatformStatistics(),
      adminService.getStandards(),
      adminService.getOrganizations(),
      loadStripeData()
    ]);

    // Extract results from Promise.allSettled
    const stats = platformStats.status === 'fulfilled' ? platformStats.value : null;
    const standards = standardsResponse.status === 'fulfilled' ? standardsResponse.value : [];
    const organizations = organizationsResponse.status === 'fulfilled' ? organizationsResponse.value : [];
    const stripe = stripeData.status === 'fulfilled' ? stripeData.value : {
      stats: null,
      customers: [],
      products: [],
      prices: [],
      coupons: []
    };

    return {
      stats,
      standards,
      organizations,
      stripeStats: stripe.stats,
      stripeCustomers: stripe.customers,
      stripeProducts: stripe.products,
      stripePrices: stripe.prices,
      stripeCoupons: stripe.coupons
    };
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    throw error;
  }
};

// Organization management utilities
export const updateOrganization = async (orgId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', orgId)
      .select()
      .single();

    if (error) throw error;
    
    toast.success('Organization updated successfully');
    return data;
  } catch (error) {
    console.error('Error updating organization:', error);
    toast.error('Failed to update organization');
    throw error;
  }
};

export const deleteOrganization = async (orgId: string) => {
  try {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', orgId);

    if (error) throw error;
    
    toast.success('Organization deleted successfully');
  } catch (error) {
    console.error('Error deleting organization:', error);
    toast.error('Failed to delete organization');
    throw error;
  }
};

// Standards management utilities
export const refreshStandards = async () => {
  try {
    return await adminService.getStandards();
  } catch (error) {
    console.error('Error refreshing standards:', error);
    toast.error('Failed to refresh standards');
    throw error;
  }
};

export const deleteStandard = async (standardId: string) => {
  try {
    const { error } = await supabase
      .from('standards')
      .delete()
      .eq('id', standardId);

    if (error) throw error;
    
    toast.success('Standard deleted successfully');
  } catch (error) {
    console.error('Error deleting standard:', error);
    toast.error('Failed to delete standard');
    throw error;
  }
};

// User management utilities
export const getUsersList = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        is_active,
        created_at,
        last_sign_in_at,
        organization:organization_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to fetch users');
    return [];
  }
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', userId);

    if (error) throw error;
    
    toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    console.error('Error updating user status:', error);
    toast.error('Failed to update user status');
    throw error;
  }
};

// Format utilities
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Search and filter utilities
export const filterOrganizations = (organizations: OrganizationSummary[], searchTerm: string) => {
  if (!searchTerm) return organizations;
  
  const term = searchTerm.toLowerCase();
  return organizations.filter(org =>
    org.name.toLowerCase().includes(term) ||
    org.tier.toLowerCase().includes(term) ||
    org.industry?.toLowerCase().includes(term) ||
    org.companySize?.toLowerCase().includes(term)
  );
};

export const filterStandards = (standards: StandardSummary[], searchTerm: string) => {
  if (!searchTerm) return standards;
  
  const term = searchTerm.toLowerCase();
  return standards.filter(standard =>
    standard.name.toLowerCase().includes(term) ||
    standard.type.toLowerCase().includes(term) ||
    standard.version.toLowerCase().includes(term)
  );
};

// Status utilities
export const getOrganizationStatusColor = (isActive: boolean) => {
  return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

export const getOrganizationStatusText = (isActive: boolean) => {
  return isActive ? 'Active' : 'Inactive';
};

export const getTierColor = (tier: string) => {
  switch (tier.toLowerCase()) {
    case 'enterprise':
      return 'bg-purple-100 text-purple-800';
    case 'professional':
      return 'bg-blue-100 text-blue-800';
    case 'starter':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Badge variant utilities for organizations
export const getTierBadgeVariant = (tier: string) => {
  switch (tier) {
    case 'enterprise': return 'default';
    case 'professional': return 'secondary';
    case 'starter': return 'outline';
    default: return 'outline';
  }
};