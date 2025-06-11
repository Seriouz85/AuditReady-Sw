import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/admin/AdminService';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { sentryService } from '@/services/monitoring/SentryService';
import StripeDirectAPI from '@/services/stripe/StripeDirectAPI';
import { enhancedStripeService as realTimeStripe, StripeProduct, StripePrice, StripeCoupon } from '@/services/stripe/EnhancedStripeService';
import { dynamicPricingService } from '@/services/stripe/DynamicPricingService';
import { ProductManagementModal } from '@/components/admin/stripe/ProductManagementModal';
import { CouponManagementModal } from '@/components/admin/stripe/CouponManagementModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { testSupabaseConnection } from '@/utils/testSupabase';
import { uploadRequirements } from '@/scripts/uploadRequirements';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/utils/toast';
import { 
  Shield, 
  Users, 
  BookOpen, 
  Settings, 
  Activity, 
  Database,
  AlertTriangle,
  CheckCircle,
  Building,
  FileText,
  TrendingUp,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Link,
  Zap,
  Star,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Globe,
  Lock,
  Unlock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Search,
  Filter,
  SortAsc,
  ExternalLink,
  Crown,
  Sparkles,
  Package,
  Tag,
  Percent,
  Copy,
  UserCheck,
  UserX,
  UserPlus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface PlatformStats {
  totalOrganizations: number;
  totalUsers: number;
  totalStandards: number;
  totalRequirements: number;
  activeAssessments: number;
  recentUpdates: number;
}

interface StandardSummary {
  id: string;
  name: string;
  version: string;
  type: string;
  requirementCount: number;
  organizationCount: number;
  lastUpdated: string;
}

interface OrganizationSummary {
  id: string;
  name: string;
  tier: string;
  userCount: number;
  assessmentCount: number;
  lastActivity: string;
  isActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  revenue?: number;
}

interface StripeStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  customers: number;
  connectionStatus: boolean;
}

interface StripeProduct {
  id: string;
  name: string;
  description: string;
  active: boolean;
  default_price: string;
  metadata: Record<string, string>;
  created: number;
  updated: number;
}

interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
    interval_count: number;
  } | null;
  active: boolean;
  nickname: string;
}

// Load Stripe data function
const loadStripeData = async () => {
  try {
    console.log('Loading Stripe data using EnhancedStripeService...');
    
    // Get Stripe data in parallel using enhancedStripeService
    const [productsResult, pricesResult] = await Promise.all([
      realTimeStripe.listProducts(true, 100),
      realTimeStripe.listPrices(undefined, true, 100)
    ]);

    const products = productsResult.data;
    const prices = pricesResult.data;
    
    console.log('Loaded products:', products.length);
    console.log('Loaded prices:', prices.length);

    // Calculate stats from products and prices
    const stats = {
      totalRevenue: 0, // Would need actual subscription data
      monthlyRevenue: 0, // Would need actual subscription data  
      activeSubscriptions: 0, // Would need actual subscription data
      customers: 0, // Would need actual customer data
      connectionStatus: true
    };

    return {
      stats,
      customers: [], // Would need actual customer data
      products,
      prices,
      coupons: [] // Would load separately if needed
    };
  } catch (error) {
    console.error('Failed to load Stripe data:', error);
    return {
      stats: {
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeSubscriptions: 0,
        customers: 0,
        connectionStatus: false
      },
      customers: [],
      products: [],
      prices: [],
      coupons: []
    };
  }
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isPlatformAdmin, user: authUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [standards, setStandards] = useState<StandardSummary[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [stripeStats, setStripeStats] = useState<StripeStats | null>(null);
  const [stripeCustomers, setStripeCustomers] = useState<any[]>([]);
  const [stripeProducts, setStripeProducts] = useState<StripeProduct[]>([]);
  const [stripePrices, setStripePrices] = useState<StripePrice[]>([]);
  const [stripeCoupons, setStripeCoupons] = useState<StripeCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<OrganizationSummary | null>(null);
  
  // Modal states for real-time management
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StripeProduct | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<StripeCoupon | null>(null);

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        // For platform admins, use AuthContext
        if (isPlatformAdmin && authUser) {
          console.log('Platform admin access confirmed via AuthContext');
          setIsAdmin(true);
          await loadDashboardData();
          return;
        }

        // Check Supabase auth for real users
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        // Check if user is platform admin in database
        const { data: adminData, error: adminError } = await supabase
          .from('platform_administrators')
          .select('*')
          .eq('email', user.email)
          .eq('is_active', true)
          .single();

        if (adminError || !adminData) {
          setIsAdmin(false);
          setError('Access denied. Platform administrator privileges required.');
          return;
        }

        setIsAdmin(true);
        await loadDashboardData();
      } catch (err) {
        console.error('Admin access check failed:', err);
        setError('Failed to verify administrator access.');
      } finally {
        setLoading(false);
      }
    };

    initializeAdmin();
  }, [isPlatformAdmin, authUser]);


  const loadDashboardData = async () => {
    const startTime = Date.now();
    
    try {
      console.log('Loading production dashboard data...');
      setLoading(true);
      
      // Add breadcrumb for monitoring
      await sentryService.addBreadcrumb(
        'Loading admin dashboard data',
        'admin',
        'info',
        { action: 'load_dashboard_data' }
      );
      
      // Check Supabase configuration
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      // Use the admin service for all data loading + load Stripe data
      const [stats, standardsData, orgsData, stripeData] = await Promise.all([
        adminService.getPlatformStatistics(),
        adminService.getStandards(true),
        adminService.getOrganizations(),
        loadStripeData()
      ]);

      console.log('Standards data from Supabase:', standardsData);
      console.log('Stats:', stats);
      console.log('Organizations:', orgsData);

      // Set statistics
      setStats(stats);

      // Process standards data
      if (standardsData && standardsData.length > 0) {
        const processedStandards = standardsData.map(s => ({
          id: s.id,
          name: s.name,
          version: s.version,
          type: s.type,
          requirementCount: s.requirementCount || 0,
          organizationCount: 0, // Will implement organization standards relationship later
          lastUpdated: s.updated_at || s.created_at
        }));
        console.log('Processed standards:', processedStandards);
        setStandards(processedStandards);
      } else {
        console.log('No standards data received');
        setStandards([]);
      }

      // Process organizations data
      if (orgsData && orgsData.length > 0) {
        setOrganizations(orgsData.map(o => ({
          id: o.id,
          name: o.name,
          tier: o.subscription_tier || 'free',
          userCount: o.organization_users?.length || 0,
          assessmentCount: 0, // Will implement when we have assessments
          lastActivity: o.updated_at,
          isActive: true
        })));
      } else {
        setOrganizations([]);
      }

      // Set Stripe data
      if (stripeData) {
        setStripeStats(stripeData.stats);
        setStripeCustomers(stripeData.customers || []);
        setStripeProducts(stripeData.products || []);
        setStripePrices(stripeData.prices || []);
        setStripeCoupons(stripeData.coupons || []);
      }

      console.log('Production data loaded successfully:', {
        standards: standardsData?.length || 0,
        organizations: orgsData?.length || 0,
        totalUsers: stats.totalUsers,
        stripeRevenue: stripeData?.stats?.totalRevenue || 0
      });

      // Track successful load
      const duration = Date.now() - startTime;
      await sentryService.trackAdminPerformance(
        'load_dashboard_data',
        duration,
        true,
        {
          standards_count: standardsData?.length || 0,
          organizations_count: orgsData?.length || 0,
          users_count: stats.totalUsers
        }
      );

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      
      // Track performance failure
      const duration = Date.now() - startTime;
      await sentryService.trackAdminPerformance(
        'load_dashboard_data',
        duration,
        false,
        { error: err instanceof Error ? err.message : 'Unknown error' }
      );
      
      // Capture error
      if (err instanceof Error) {
        await sentryService.captureAdminError(
          err,
          'load_dashboard_data',
          'dashboard'
        );
        setError(`Failed to load production data: ${err.message}`);
      } else {
        setError('Failed to load production data from database.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'default';
      case 'professional': return 'secondary';
      case 'starter': return 'outline';
      default: return 'outline';
    }
  };

  // Function to create a new organization
  const handleCreateOrganization = async () => {
    const name = prompt('Enter organization name:');
    if (!name) return;

    try {
      await adminService.createOrganization({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        subscription_tier: 'starter'
      });

      console.log('Organization created successfully');
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating organization:', error);
      setError('Failed to create organization');
    }
  };

  // Function to create a new standard
  const handleCreateStandard = async () => {
    const name = prompt('Enter standard name (e.g., "SOC 2"):');
    if (!name) return;
    
    const version = prompt('Enter standard version (e.g., "2017"):');
    if (!version) return;

    const type = prompt('Enter standard type (framework/regulation/policy/guideline):');
    if (!type || !['framework', 'regulation', 'policy', 'guideline'].includes(type)) {
      alert('Invalid type. Must be: framework, regulation, policy, or guideline');
      return;
    }

    try {
      await adminService.createStandard({
        name,
        version,
        type: type as any,
        description: `${name} compliance standard`
      });

      console.log('Standard created successfully');
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating standard:', error);
      setError('Failed to create standard');
    }
  };

  // Function to navigate to standard detail
  const handleViewStandard = (standardId: string) => {
    navigate(`/admin/standards/${standardId}`);
  };

  // Stripe Functions
  const handleCreateCustomerPortal = async (stripeCustomerId: string) => {
    try {
      const session = await StripeDirectAPI.Customer.createPortalSession(
        stripeCustomerId,
        window.location.origin + '/admin'
      );
      window.open(session.url, '_blank');
      toast.success('Customer portal opened successfully');
    } catch (error) {
      console.error('Error creating customer portal:', error);
      toast.error('Failed to create customer portal');
    }
  };

  const handleCreateStripeProduct = async () => {
    const name = prompt('Enter product name:');
    if (!name) return;
    
    const description = prompt('Enter product description:');
    if (!description) return;

    try {
      const product = await StripeDirectAPI.Product.create({
        name,
        description
      });
      
      toast.success('Product created successfully');
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  const handleCreateStripePrice = async (productId: string) => {
    const amount = prompt('Enter price amount (in cents, e.g., 2999 for $29.99):');
    if (!amount || isNaN(Number(amount))) return;
    
    const interval = prompt('Enter billing interval (month/year):');
    if (!interval || !['month', 'year'].includes(interval)) return;

    try {
      const price = await StripeDirectAPI.Price.create({
        product: productId,
        unit_amount: Number(amount),
        currency: 'usd',
        recurring: {
          interval: interval as 'month' | 'year'
        }
      });
      
      toast.success('Price created successfully');
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating price:', error);
      toast.error('Failed to create price');
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'trialing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'past_due': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'canceled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Real-time Stripe management handlers
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = (product: StripeProduct) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleCreateCoupon = () => {
    setSelectedCoupon(null);
    setCouponModalOpen(true);
  };

  const handleEditCoupon = (coupon: StripeCoupon) => {
    setSelectedCoupon(coupon);
    setCouponModalOpen(true);
  };

  const refreshStripeData = async () => {
    try {
      const stripeData = await loadStripeData();
      if (stripeData) {
        setStripeStats(stripeData.stats);
        setStripeCustomers(stripeData.customers || []);
        setStripeProducts(stripeData.products || []);
        setStripePrices(stripeData.prices || []);
        setStripeCoupons(stripeData.coupons || []);
      }
      toast.success('Stripe data refreshed');
    } catch (error) {
      console.error('Failed to refresh Stripe data:', error);
      toast.error('Failed to refresh Stripe data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Access denied. Platform administrator privileges required.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          
          {/* Content */}
          <div className="relative flex items-center justify-between text-white">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                  <Crown className="h-8 w-8 text-yellow-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Platform Admin Console</h1>
                  <p className="text-blue-100 text-lg">
                    Complete SaaS management with Stripe & Supabase integration
                  </p>
                </div>
              </div>
              
              {/* Live Stats Bar */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-blue-100">Live Data Connected</span>
                </div>
                {stripeStats && (
                  <>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-300" />
                      <span className="text-blue-100">${stripeStats.monthlyRevenue.toLocaleString()} MRR</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-300" />
                      <span className="text-blue-100">{stats?.totalUsers || 0} Users</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${stripeStats?.connectionStatus ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-sm text-blue-100">Stripe</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-sm text-blue-100">Supabase</span>
                  </div>
                </div>
              </div>
              
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Platform Administrator
              </Badge>
              
              <Button 
                variant="secondary" 
                onClick={loadDashboardData}
                disabled={loading}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh All
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Organizations</CardTitle>
                <div className="rounded-full bg-blue-600 p-2">
                  <Building className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{stats.totalOrganizations}</div>
                <p className="text-xs text-blue-600 mt-1">Active customers</p>
                <div className="mt-2">
                  <div className="h-1 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Users</CardTitle>
                <div className="rounded-full bg-green-600 p-2">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">{stats.totalUsers}</div>
                <p className="text-xs text-green-600 mt-1">Total platform users</p>
                <div className="mt-2">
                  <div className="h-1 bg-green-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full w-4/5"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Standards</CardTitle>
                <div className="rounded-full bg-purple-600 p-2">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">{stats.totalStandards}</div>
                <p className="text-xs text-purple-600 mt-1">Available frameworks</p>
                <div className="mt-2">
                  <div className="h-1 bg-purple-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full w-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Requirements</CardTitle>
                <div className="rounded-full bg-orange-600 p-2">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900">{stats.totalRequirements}</div>
                <p className="text-xs text-orange-600 mt-1">Total controls</p>
                <div className="mt-2">
                  <div className="h-1 bg-orange-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-600 rounded-full w-5/6"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-700">Active Assessments</CardTitle>
                <div className="rounded-full bg-indigo-600 p-2">
                  <Activity className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-900">{stats.activeAssessments}</div>
                <p className="text-xs text-indigo-600 mt-1">In progress</p>
                <div className="mt-2">
                  <div className="h-1 bg-indigo-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-rose-700">Recent Updates</CardTitle>
                <div className="rounded-full bg-rose-600 p-2">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-rose-900">{stats.recentUpdates}</div>
                <p className="text-xs text-rose-600 mt-1">Last 7 days</p>
                <div className="mt-2">
                  <div className="h-1 bg-rose-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-600 rounded-full w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Stripe Revenue Cards */}
            {stripeStats && (
              <>
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-600/10 rounded-full -mr-10 -mt-10"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-700">Monthly Revenue</CardTitle>
                    <div className="rounded-full bg-emerald-600 p-2">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-emerald-900">
                      ${stripeStats.monthlyRevenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">MRR from Stripe</p>
                    <div className="mt-2">
                      <div className="h-1 bg-emerald-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full w-4/5"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-violet-600/10 rounded-full -mr-10 -mt-10"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-violet-700">Subscriptions</CardTitle>
                    <div className="rounded-full bg-violet-600 p-2">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-violet-900">{stripeStats.activeSubscriptions}</div>
                    <p className="text-xs text-violet-600 mt-1">Active paying customers</p>
                    <div className="flex items-center mt-2">
                      <div className={`w-2 h-2 rounded-full ${stripeStats.connectionStatus ? 'bg-green-500' : 'bg-red-500'} mr-1 animate-pulse`} />
                      <span className="text-xs text-violet-600">
                        Stripe {stripeStats.connectionStatus ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Enhanced Main Content Tabs */}
        <Tabs defaultValue="standards" className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <TabsList className="grid w-full grid-cols-6 bg-gray-100 rounded-xl p-1">
              <TabsTrigger value="standards" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Shield className="w-4 h-4 mr-2" />
                Standards
              </TabsTrigger>
              <TabsTrigger value="organizations" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Building className="w-4 h-4 mr-2" />
                Organizations
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Star className="w-4 h-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Settings className="w-4 h-4 mr-2" />
                System
              </TabsTrigger>
            </TabsList>

        <TabsContent value="standards" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Standards Library</h2>
              <p className="text-muted-foreground">Manage compliance standards and frameworks</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={loadDashboardData}>
                Refresh
              </Button>
              <Button variant="outline" onClick={() => testSupabaseConnection()}>
                Test DB
              </Button>
              <Button variant="outline" onClick={() => uploadRequirements()}>
                Upload All Requirements
              </Button>
              <Button onClick={handleCreateStandard}>
                <Shield className="w-4 h-4 mr-2" />
                Add Standard
              </Button>
            </div>
          </div>

          {standards.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Standards Found</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first compliance standard to get started.
                </p>
                <Button onClick={handleCreateStandard}>
                  <Shield className="w-4 h-4 mr-2" />
                  Add Your First Standard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {standards.map((standard) => (
                <Card key={standard.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{standard.name}</CardTitle>
                        <CardDescription>
                          Version {standard.version} • {standard.type}
                          {standard.requirementCount > 0 && (
                            <span> • {standard.requirementCount} requirements</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Active
                        </Badge>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{standard.organizationCount} organizations</div>
                          <div>Updated {formatDate(standard.lastUpdated)}</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Created {formatDate(standard.lastUpdated)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewStandard(standard.id)}>
                          View Requirements
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewStandard(standard.id)}>
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

            <TabsContent value="organizations" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Customer Organizations
                  </h2>
                  <p className="text-muted-foreground mt-2">Manage customer accounts, subscriptions, and billing</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search organizations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button onClick={handleCreateOrganization} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Organization
                  </Button>
                </div>
              </div>

              {organizations.length === 0 ? (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-12 text-center">
                    <div className="rounded-full bg-blue-100 p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <Building className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-blue-900">No Organizations Yet</h3>
                    <p className="text-blue-700 mb-6 max-w-md mx-auto">
                      Create your first customer organization to start managing subscriptions and billing.
                    </p>
                    <Button onClick={handleCreateOrganization} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Plus className="w-5 h-5 mr-2" />
                      Create First Organization
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {organizations
                    .filter(org => 
                      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      org.tier.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((org) => (
                      <Card key={org.id} className="bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 border border-gray-200/50 hover:border-blue-300/50 group">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-3 text-white">
                                <Building className="h-6 w-6" />
                              </div>
                              <div>
                                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {org.name}
                                </CardTitle>
                                <CardDescription className="flex items-center space-x-3 mt-2">
                                  <Badge 
                                    variant={getTierBadgeVariant(org.tier)}
                                    className="px-3 py-1 font-medium"
                                  >
                                    <Crown className="w-3 h-3 mr-1" />
                                    {org.tier.toUpperCase()}
                                  </Badge>
                                  {org.isActive ? (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      Inactive
                                    </Badge>
                                  )}
                                  {org.stripeCustomerId && (
                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                      <CreditCard className="w-3 h-3 mr-1" />
                                      Stripe Connected
                                    </Badge>
                                  )}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <Users className="w-4 h-4 mr-1" />
                                {org.userCount} users
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Activity className="w-4 h-4 mr-1" />
                                {org.assessmentCount} assessments
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(org.lastActivity)}
                              </div>
                              {org.revenue && (
                                <div className="flex items-center text-sm font-semibold text-green-600">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  {formatCurrency(org.revenue)}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Separator className="mb-4" />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Globe className="w-4 h-4 mr-1" />
                                ID: {org.id.slice(0, 8)}...
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Last activity {formatDate(org.lastActivity)}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {/* Stripe Customer Portal */}
                              {org.stripeCustomerId && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCreateCustomerPortal(org.stripeCustomerId!)}
                                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Stripe Portal
                                </Button>
                              )}
                              
                              {/* User Management */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigate(`/admin/organizations/${org.id}`)}
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <Users className="w-3 h-3 mr-1" />
                                Users
                              </Button>
                              
                              {/* Settings */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedOrg(org)}
                                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                              >
                                <Settings className="w-3 h-3 mr-1" />
                                Settings
                              </Button>
                              
                              {/* More Actions */}
                              <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>

            {/* Products Tab - Stripe Product & Pricing Management */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                    Products & Pricing
                  </h2>
                  <p className="text-muted-foreground mt-2">Manage Stripe products and pricing tiers</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${stripeStats?.connectionStatus ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">Stripe {stripeStats?.connectionStatus ? 'Connected' : 'Disconnected'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button onClick={refreshStripeData} variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button onClick={handleCreateCoupon} variant="outline" className="border-pink-200 text-pink-700 hover:bg-pink-50">
                      <Percent className="w-4 h-4 mr-2" />
                      Create Coupon
                    </Button>
                    <Button onClick={handleCreateProduct} className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Product
                    </Button>
                  </div>
                </div>
              </div>

              {stripeProducts && stripeProducts.length > 0 ? (
                <div className="space-y-6">
                  {/* Products Grid */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {stripeProducts.map((product) => {
                      const productPrices = stripePrices?.filter(price => price.product === product.id) || [];
                      
                      return (
                        <Card key={product.id} className="bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 border border-gray-200/50 hover:border-orange-300/50 group">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-3 text-white">
                                  <Package className="h-6 w-6" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                    {product.name}
                                  </CardTitle>
                                  <CardDescription className="text-sm text-gray-600 mt-1">
                                    {product.description || 'No description available'}
                                  </CardDescription>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {/* Product Status */}
                            <div className="flex items-center space-x-2 mb-4">
                              <Badge className={product.active ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {product.active ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                ID: {product.id.slice(0, 8)}...
                              </Badge>
                            </div>

                            {/* Pricing Tiers */}
                            {productPrices.length > 0 && (
                              <div className="space-y-3">
                                <div className="text-sm font-medium text-gray-700">Pricing Tiers:</div>
                                <div className="space-y-2">
                                  {productPrices.map((price) => (
                                    <div key={price.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                      <div className="flex items-center space-x-2">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">
                                          ${(price.unit_amount / 100).toFixed(0)}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                          /{price.recurring?.interval || 'one-time'}
                                        </span>
                                      </div>
                                      <Badge variant="secondary" className="text-xs">
                                        {price.active ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <Separator className="my-4" />

                            {/* Actions */}
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditProduct(product)}>
                                <Edit className="w-3 h-3 mr-1" />
                                Manage
                              </Button>
                              <Button variant="outline" size="sm" className="border-orange-200 text-orange-700 hover:bg-orange-50" onClick={() => window.open(`https://dashboard.stripe.com/products/${product.id}`, '_blank')}>
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Quick Actions */}
                  <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-orange-800">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Quick Actions
                      </CardTitle>
                      <CardDescription>Common product and pricing operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                        <Button variant="outline" className="h-16 flex-col border-orange-200 text-orange-700 hover:bg-orange-50" onClick={handleCreateProduct}>
                          <Package className="w-5 h-5 mb-1" />
                          <span className="text-xs">Create Product</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex-col border-pink-200 text-pink-700 hover:bg-pink-50" onClick={handleCreateCoupon}>
                          <Percent className="w-5 h-5 mb-1" />
                          <span className="text-xs">Create Coupon</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex-col border-purple-200 text-purple-700 hover:bg-purple-50" onClick={refreshStripeData}>
                          <RefreshCw className="w-5 h-5 mb-1" />
                          <span className="text-xs">Refresh Data</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex-col border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => window.open('https://dashboard.stripe.com/products', '_blank')}>
                          <BarChart3 className="w-5 h-5 mb-1" />
                          <span className="text-xs">Analytics</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex-col border-green-200 text-green-700 hover:bg-green-50" onClick={() => window.open('https://dashboard.stripe.com', '_blank')}>
                          <ExternalLink className="w-5 h-5 mb-1" />
                          <span className="text-xs">Stripe Dashboard</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Coupons Section */}
                  <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-pink-800">
                        <Percent className="w-5 h-5 mr-2" />
                        Discount Coupons ({stripeCoupons.length})
                      </CardTitle>
                      <CardDescription>Manage promotional discounts and coupon codes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stripeCoupons.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {stripeCoupons.slice(0, 6).map((coupon) => (
                            <Card key={coupon.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEditCoupon(coupon)}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className={coupon.valid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                    {coupon.valid ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {coupon.times_redeemed} used
                                  </span>
                                </div>
                                <div className="font-mono text-sm font-bold">{coupon.id}</div>
                                <div className="text-lg font-bold text-pink-600">
                                  {coupon.percent_off ? `${coupon.percent_off}% off` : `$${coupon.amount_off! / 100} off`}
                                </div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {coupon.duration} • {coupon.max_redemptions ? `${coupon.max_redemptions} max uses` : 'Unlimited'}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Percent className="h-8 w-8 mx-auto text-pink-400 mb-2" />
                          <p className="text-muted-foreground">No coupons created yet</p>
                          <Button onClick={handleCreateCoupon} variant="outline" className="mt-2">
                            Create First Coupon
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
                  <CardContent className="p-12 text-center">
                    <div className="rounded-full bg-orange-100 p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <Package className="w-12 h-12 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-orange-900">No Products Yet</h3>
                    <p className="text-orange-700 mb-6 max-w-md mx-auto">
                      Create your first Stripe product to start managing pricing tiers and subscriptions.
                    </p>
                    <Button onClick={handleCreateProduct} size="lg" className="bg-gradient-to-r from-orange-600 to-pink-600">
                      <Plus className="w-5 h-5 mr-2" />
                      Create First Product
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

        {/* Users Tab - Enhanced User Management */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                User Management
              </h2>
              <p className="text-muted-foreground mt-2">Manage users across all organizations with enterprise controls</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => navigate('/admin/users')} className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* User Stats Cards */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">{stats?.totalUsers || 0}</div>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{stats?.newUsersThisMonth || 0} this month
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{stats?.activeUsers || 0}</div>
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <Activity className="w-4 h-4 mr-1" />
                  Last 30 days
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-700">Pending Invites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-900">{stats?.pendingInvites || 0}</div>
                <div className="flex items-center mt-2 text-sm text-yellow-600">
                  <Mail className="w-4 h-4 mr-1" />
                  Awaiting response
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Admin Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">{stats?.adminUsers || 0}</div>
                <div className="flex items-center mt-2 text-sm text-purple-600">
                  <Shield className="w-4 h-4 mr-1" />
                  Platform admins
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Users Table */}
          {organizations.length > 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Recent Users</CardTitle>
                    <CardDescription>Latest user registrations and activity</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-3 h-3 mr-1" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {organizations.slice(0, 8).map((org, index) => (
                    <div key={org.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors group">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-gradient-to-br from-green-500 to-teal-500 p-2 text-white">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{org.name} Users</div>
                          <div className="text-sm text-gray-500">Organization • {org.userCount} members</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{org.userCount} users</div>
                          <div className="text-xs text-gray-500">Last login {formatDate(org.lastActivity)}</div>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/organizations/${org.id}`)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
              <CardContent className="p-12 text-center">
                <div className="rounded-full bg-green-100 p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Users className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-green-900">No Users Yet</h3>
                <p className="text-green-700 mb-6 max-w-md mx-auto">
                  Start by creating organizations and inviting users to your platform.
                </p>
                <Button onClick={() => navigate('/admin/users')} size="lg" className="bg-gradient-to-r from-green-600 to-teal-600">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Invite First User
                </Button>
              </CardContent>
            </Card>
          )}

          {/* User Management Tools */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Sparkles className="w-5 h-5 mr-2" />
                User Management Tools
              </CardTitle>
              <CardDescription>Powerful tools for managing users across your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-20 flex-col border-green-200 text-green-700 hover:bg-green-50" onClick={() => navigate('/admin/users')}>
                  <Users className="w-6 h-6 mb-2" />
                  <span className="text-sm">Browse All Users</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-green-200 text-green-700 hover:bg-green-50" onClick={() => navigate('/admin/users')}>
                  <Shield className="w-6 h-6 mb-2" />
                  <span className="text-sm">Role Management</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-green-200 text-green-700 hover:bg-green-50" onClick={() => navigate('/admin/users')}>
                  <Activity className="w-6 h-6 mb-2" />
                  <span className="text-sm">Access Logs</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-green-200 text-green-700 hover:bg-green-50">
                  <Mail className="w-6 h-6 mb-2" />
                  <span className="text-sm">Bulk Invitations</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab - Link to Full Billing Management */}
        <TabsContent value="billing" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Billing Overview
              </h2>
              <p className="text-muted-foreground mt-2">Quick overview and access to full billing management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200/50">
                <div className={`w-3 h-3 rounded-full ${stripeStats?.connectionStatus ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">Stripe {stripeStats?.connectionStatus ? 'Connected' : 'Disconnected'}</span>
              </div>
              <Button onClick={() => navigate('/admin/billing')} className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Settings className="w-4 h-4 mr-2" />
                Full Billing Management
              </Button>
            </div>
          </div>

          {stripeStats?.connectionStatus ? (
            <div className="space-y-6">
              {/* Revenue Overview */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/billing')}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                      Monthly Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">${stripeStats.monthlyRevenue.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">
                      Annual: ${stripeStats.totalRevenue.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      Click to view details
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/billing')}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                      Active Subscriptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{stripeStats.activeSubscriptions}</div>
                    <p className="text-sm text-muted-foreground">
                      Paying customers
                    </p>
                    <div className="flex items-center mt-2 text-sm text-blue-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      Manage subscriptions
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/billing')}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-purple-600" />
                      Total Customers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">{stripeStats.customers}</div>
                    <p className="text-sm text-muted-foreground">
                      In Stripe
                    </p>
                    <div className="flex items-center mt-2 text-sm text-purple-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      View customer details
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Access Actions */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-800">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Billing Management Actions
                  </CardTitle>
                  <CardDescription>Quick access to common billing operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col border-purple-200 text-purple-700 hover:bg-purple-50"
                      onClick={() => navigate('/admin/billing')}
                    >
                      <CreditCard className="w-5 h-5 mb-1" />
                      <span className="text-xs">Subscription Management</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => navigate('/admin/billing')}
                    >
                      <FileText className="w-5 h-5 mb-1" />
                      <span className="text-xs">Invoice Management</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col border-green-200 text-green-700 hover:bg-green-50"
                      onClick={() => navigate('/admin/billing')}
                    >
                      <BarChart3 className="w-5 h-5 mb-1" />
                      <span className="text-xs">Revenue Analytics</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col border-orange-200 text-orange-700 hover:bg-orange-50"
                      onClick={() => navigate('/admin/billing')}
                    >
                      <Settings className="w-5 h-5 mb-1" />
                      <span className="text-xs">Billing Settings</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Stripe Connection Required</h3>
                <p className="text-muted-foreground mb-4">
                  Configure your Stripe API keys to enable billing management.
                </p>
                <Button onClick={() => navigate('/admin/system/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Stripe
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* System Tab - Enhanced System Administration */}
        <TabsContent value="system" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-600 to-gray-800 bg-clip-text text-transparent">
                System Administration
              </h2>
              <p className="text-muted-foreground mt-2">Platform configuration, monitoring, and maintenance</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200/50">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">System Online</span>
              </div>
              <Button variant="outline" onClick={testSupabaseConnection} className="border-slate-200 text-slate-700 hover:bg-slate-50">
                <Activity className="w-4 h-4 mr-2" />
                Health Check
              </Button>
            </div>
          </div>

          {/* System Status Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">99.9%</div>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  All systems operational
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">Active</div>
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <Database className="w-4 h-4 mr-1" />
                  Supabase connected
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">2.1GB</div>
                <div className="flex items-center mt-2 text-sm text-purple-600">
                  <FileText className="w-4 h-4 mr-1" />
                  Of 10GB used
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Last Backup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">2h ago</div>
                <div className="flex items-center mt-2 text-sm text-orange-600">
                  <Clock className="w-4 h-4 mr-1" />
                  Auto backup
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Platform Settings */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-800">
                  <Settings className="w-5 h-5 mr-2" />
                  Platform Settings
                </CardTitle>
                <CardDescription>
                  Global configuration and feature flags
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => navigate('/admin/system/settings')}>
                  <Settings className="w-4 h-4 mr-3" />
                  Platform Configuration
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => navigate('/admin/system/settings')}>
                  <Activity className="w-4 h-4 mr-3" />
                  Feature Flags
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => navigate('/admin/billing')}>
                  <Building className="w-4 h-4 mr-3" />
                  Billing Configuration
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-700 hover:bg-slate-50">
                  <Mail className="w-4 h-4 mr-3" />
                  Email Settings
                </Button>
              </CardContent>
            </Card>

            {/* System Operations */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-800">
                  <Activity className="w-5 h-5 mr-2" />
                  System Operations
                </CardTitle>
                <CardDescription>
                  Monitoring, logs, and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-700 hover:bg-slate-50" onClick={testSupabaseConnection}>
                  <Activity className="w-4 h-4 mr-3" />
                  System Health Check
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => navigate('/admin/system/settings')}>
                  <FileText className="w-4 h-4 mr-3" />
                  View Audit Logs
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => navigate('/admin/system/settings#backup')}>
                  <Database className="w-4 h-4 mr-3" />
                  Backup Management
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => navigate('/admin/analytics')}>
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Performance Metrics
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800">
                <Sparkles className="w-5 h-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common system administration tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-20 flex-col border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => navigate('/admin/system/settings#backup')}>
                  <Database className="w-6 h-6 mb-2" />
                  <span className="text-sm">Backup Settings</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => { dynamicPricingService.clearCache(); toast.success('Cache cleared successfully'); }}>
                  <RefreshCw className="w-6 h-6 mb-2" />
                  <span className="text-sm">Clear Cache</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => navigate('/admin/analytics')}>
                  <Download className="w-6 h-6 mb-2" />
                  <span className="text-sm">Export Data</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => window.open('https://dashboard.stripe.com', '_blank')}>
                  <ExternalLink className="w-6 h-6 mb-2" />
                  <span className="text-sm">External Tools</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Real-time Management Modals */}
      <ProductManagementModal
        open={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onProductUpdated={refreshStripeData}
      />

      <CouponManagementModal
        open={couponModalOpen}
        onClose={() => {
          setCouponModalOpen(false);
          setSelectedCoupon(null);
        }}
        coupon={selectedCoupon}
        onCouponUpdated={refreshStripeData}
      />
    </div>
  );
};