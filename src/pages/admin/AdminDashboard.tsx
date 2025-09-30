import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/admin/AdminService';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/utils/toast';
import StripeDirectAPI from '@/services/stripe/StripeDirectAPI';
import { ProductManagementModal } from '@/components/admin/stripe/ProductManagementModal';
import { CouponManagementModal } from '@/components/admin/stripe/CouponManagementModal';
import { CreateStandardModal } from '@/components/admin/standards/CreateStandardModal';

// Extracted Components
import { AdminDashboardHeader } from '@/components/admin/dashboard/AdminDashboardHeader';
import { StatsWidget } from '@/components/admin/dashboard/widgets/StatsWidget';
import { StandardsManagement } from '@/components/admin/dashboard/management/StandardsManagement';
import { ComplianceManagement } from '@/components/admin/dashboard/management/ComplianceManagement';
import { OrganizationsManagement } from '@/components/admin/dashboard/management/OrganizationsManagement';
import { UsersManagement } from '@/components/admin/dashboard/management/UsersManagement';
import { ProductsManagement } from '@/components/admin/dashboard/management/ProductsManagement';
import { BillingManagement } from '@/components/admin/dashboard/management/BillingManagement';
import { AiMappingManagement } from '@/components/admin/dashboard/management/AiMappingManagement';
import { SystemManagement } from '@/components/admin/dashboard/management/SystemManagement';

// Shared Types and Utilities
import { loadStripeData } from '@/components/admin/dashboard/shared/AdminUtilities';
import type { 
  PlatformStats, 
  StandardSummary, 
  OrganizationSummary, 
  StripeStats,
  OrganizationForm
} from '@/components/admin/dashboard/shared/AdminSharedTypes';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isPlatformAdmin, user: authUser, signOut } = useAuth();
  
  // Core State
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data State
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [standards, setStandards] = useState<StandardSummary[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [stripeStats, setStripeStats] = useState<StripeStats | null>(null);
  const [stripeCustomers, setStripeCustomers] = useState<any[]>([]);
  const [stripeProducts, setStripeProducts] = useState<any[]>([]);
  const [stripePrices, setStripePrices] = useState<any[]>([]);
  const [stripeCoupons, setStripeCoupons] = useState<any[]>([]);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<OrganizationSummary | null>(null);
  
  // Modal States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [createStandardModalOpen, setCreateStandardModalOpen] = useState(false);
  const [orgSettingsOpen, setOrgSettingsOpen] = useState(false);
  
  // Selected Items
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<any | null>(null);
  const [editingOrg, setEditingOrg] = useState<OrganizationSummary | null>(null);
  
  // Form State
  const [orgForm, setOrgForm] = useState<OrganizationForm>({
    name: '',
    subscription_tier: '',
    industry: '',
    company_size: ''
  });

  // Load dashboard data - RESTORED FROM WORKING VERSION
  const loadAllData = async () => {
    try {
      setLoading(true);

      // Load data individually with detailed error logging (ORIGINAL WORKING APPROACH)
      let stats, standardsData, orgsData, stripeData;

      try {
        stats = await adminService.getPlatformStatistics();
      } catch (error) {
        console.error('Error loading stats:', error);
        stats = { totalOrganizations: 0, totalUsers: 0, totalStandards: 0, totalRequirements: 0, activeAssessments: 0, recentUpdates: 0 };
      }

      try {
        standardsData = await adminService.getStandards(true);
      } catch (error) {
        console.error('Error loading standards:', error);
        standardsData = [];
      }

      try {
        orgsData = await adminService.getOrganizations();
      } catch (error) {
        console.error('Error loading organizations:', error);
        orgsData = [];
      }

      try {
        stripeData = await loadStripeData();
      } catch (error) {
        console.error('Error loading Stripe data:', error);
        stripeData = null;
      }

      // Set statistics
      setStats(stats);

      // Process standards data (CRITICAL TRANSFORMATION)
      if (standardsData && standardsData.length > 0) {
        const processedStandards = standardsData.map((s: any) => ({
          id: s.id,
          name: s.name,
          version: s.version,
          type: s.type,
          requirementCount: s.requirementCount || 0,
          organizationCount: 0,
          lastUpdated: s.updated_at || s.created_at
        }));
        setStandards(processedStandards);
      } else {
        setStandards([]);
      }

      // Process organizations data (CRITICAL TRANSFORMATION)
      if (orgsData && orgsData.length > 0) {
        setOrganizations(orgsData.map((o: any) => ({
          id: o.id,
          name: o.name,
          tier: o.subscription_tier || 'free',
          userCount: o.organization_users?.length || 0,
          assessmentCount: 0,
          lastActivity: o.updated_at,
          isActive: true,
          stripeCustomerId: o.stripe_customer_id,
          industry: o.industry,
          companySize: o.company_size
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
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize admin check and data loading
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        if (isPlatformAdmin && authUser) {
          setIsAdmin(true);
          await loadAllData();
          return;
        }

        // Additional auth checks would go here
        navigate('/login');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setError('Failed to verify admin access');
      }
    };

    initializeAdmin();
  }, [isPlatformAdmin, authUser, navigate]);

  // Event Handlers
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleCreateStandard = () => {
    setCreateStandardModalOpen(true);
  };

  const handleStandardCreated = async () => {
    await loadAllData();
  };

  const handleViewStandard = (standardId: string) => {
    navigate(`/admin/standards/${standardId}`);
  };

  const handleCreateOrganization = async () => {
    const name = prompt('Enter organization name:');
    if (!name) return;
    
    const industry = prompt('Enter industry (optional):') || '';
    const companySize = prompt('Enter company size (1-10, 11-50, 51-200, 201-1000, 1000+):') || '';

    try {
      await adminService.createOrganization({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        subscription_tier: 'team',
        industry,
        company_size: companySize
      });

      toast.success('Organization created successfully');
      await loadAllData();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
    }
  };

  const handleEditOrganization = (org: OrganizationSummary) => {
    setEditingOrg(org);
    setOrgForm({
      name: org.name,
      subscription_tier: org.tier,
      industry: org.industry || '',
      company_size: org.companySize || ''
    });
    setOrgSettingsOpen(true);
  };

  const handleSaveOrganization = async () => {
    if (!editingOrg) return;

    try {
      await adminService.updateOrganization(editingOrg.id, {
        name: orgForm.name,
        subscription_tier: orgForm.subscription_tier,
        industry: orgForm.industry,
        company_size: orgForm.company_size
      });
      
      toast.success('Organization updated successfully');
      setOrgSettingsOpen(false);
      setEditingOrg(null);
      await loadAllData();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Failed to update organization');
    }
  };

  const handleToggleOrganizationStatus = async (org: OrganizationSummary) => {
    try {
      await adminService.toggleOrganizationStatus(org.id, !org.isActive);
      toast.success(`Organization ${!org.isActive ? 'activated' : 'deactivated'} successfully`);
      await loadAllData();
    } catch (error) {
      console.error('Error toggling organization status:', error);
      toast.error('Failed to change organization status');
    }
  };

  const handleDeleteOrganization = async (org: OrganizationSummary) => {
    const confirmed = confirm(
      `Are you sure you want to delete "${org.name}"? This action cannot be undone and will remove all associated data.`
    );
    
    if (!confirmed) return;

    try {
      await adminService.deleteOrganization(org.id);
      toast.success('Organization deleted successfully');
      await loadAllData();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Failed to delete organization');
    }
  };

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
      await StripeDirectAPI.Product.create({ name, description });
      toast.success('Product created successfully');
      await loadAllData();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  // Loading state
  if (isAdmin === null || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Enhanced Header */}
          <AdminDashboardHeader
            stats={stats}
            stripeStats={stripeStats}
            authUser={authUser}
            loading={loading}
            onRefresh={loadAllData}
            onLogout={handleLogout}
          />

          {/* Enhanced Stats Overview */}
          {stats && (
            <StatsWidget
              stats={stats}
              organizations={organizations}
              standards={standards}
              stripeStats={stripeStats}
              loading={loading}
            />
          )}

          {/* Enhanced Main Content Tabs */}
          <Tabs defaultValue="standards" className="space-y-6">
            <TabsList className="grid w-full grid-cols-8 bg-gray-100 rounded-xl p-1">
              <TabsTrigger value="standards" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Standards
              </TabsTrigger>
              <TabsTrigger value="compliance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Compliance
              </TabsTrigger>
              <TabsTrigger value="organizations" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Organizations
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Users
              </TabsTrigger>
              <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Products
              </TabsTrigger>
              <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Billing
              </TabsTrigger>
              <TabsTrigger value="ai-mapping" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                AI Mapping
              </TabsTrigger>
              <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standards">
              <StandardsManagement
                standards={standards}
                loading={loading}
                onCreateStandard={handleCreateStandard}
                onViewStandard={handleViewStandard}
              />
            </TabsContent>

            <TabsContent value="compliance">
              <ComplianceManagement loading={loading} />
            </TabsContent>

            <TabsContent value="organizations">
              <OrganizationsManagement
                organizations={organizations}
                loading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onCreateOrganization={handleCreateOrganization}
                onEditOrganization={handleEditOrganization}
                onToggleOrganizationStatus={handleToggleOrganizationStatus}
                onDeleteOrganization={handleDeleteOrganization}
                onCreateCustomerPortal={handleCreateCustomerPortal}
              />
            </TabsContent>

            <TabsContent value="users">
              <UsersManagement
                stats={stats}
                organizations={organizations}
                loading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </TabsContent>

            <TabsContent value="products">
              <ProductsManagement
                stripeProducts={stripeProducts}
                stripePrices={stripePrices}
                loading={loading}
                onCreateProduct={handleCreateStripeProduct}
                onEditProduct={setSelectedProduct}
                onDeleteProduct={(id) => console.log('Delete product:', id)}
              />
            </TabsContent>

            <TabsContent value="billing">
              <BillingManagement
                stripeStats={stripeStats}
                stripeCustomers={stripeCustomers}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="ai-mapping">
              <AiMappingManagement loading={loading} />
            </TabsContent>

            <TabsContent value="system">
              <SystemManagement loading={loading} onRefresh={loadAllData} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
        <CreateStandardModal
          open={createStandardModalOpen}
          onOpenChange={setCreateStandardModalOpen}
          onSuccess={handleStandardCreated}
        />

        <ProductManagementModal
          open={productModalOpen}
          onOpenChange={setProductModalOpen}
          product={selectedProduct}
          onSuccess={loadAllData}
        />

        <CouponManagementModal
          open={couponModalOpen}
          onOpenChange={setCouponModalOpen}
          coupon={selectedCoupon}
          onSuccess={loadAllData}
        />

        {/* Organization Settings Dialog */}
        <Dialog open={orgSettingsOpen} onOpenChange={setOrgSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Organization</DialogTitle>
              <DialogDescription>
                Update organization details and settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="tier">Subscription Tier</Label>
                <Input
                  id="tier"
                  value={orgForm.subscription_tier}
                  onChange={(e) => setOrgForm(prev => ({ ...prev, subscription_tier: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={orgForm.industry}
                  onChange={(e) => setOrgForm(prev => ({ ...prev, industry: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="size">Company Size</Label>
                <Input
                  id="size"
                  value={orgForm.company_size}
                  onChange={(e) => setOrgForm(prev => ({ ...prev, company_size: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOrgSettingsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveOrganization}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};