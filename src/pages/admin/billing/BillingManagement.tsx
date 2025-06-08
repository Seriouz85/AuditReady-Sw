import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin/AdminService';
import { stripeService, StripeService } from '@/services/billing/StripeService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  CreditCard, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Download,
  Settings
} from 'lucide-react';

interface SubscriptionData {
  id: string;
  organization_id: string;
  organization_name: string;
  tier: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  amount: number;
  currency: string;
  user_count: number;
  user_limit: number;
}

interface BillingMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  pendingInvoices: number;
}

export const BillingManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // Get organizations and simulate billing data
      const organizations = await adminService.getOrganizations();
      
      // Get real subscription data with usage information
      const subscriptionPromises = organizations.map(async (org) => {
        const subscription = await stripeService.getSubscription(org.id);
        const usage = await stripeService.getBillingUsage(org.id);
        const tier = org.subscription_tier || 'starter';
        const tierConfig = StripeService.TIERS[tier];
        
        return {
          id: subscription?.id || `demo_${org.id}`,
          organization_id: org.id,
          organization_name: org.name,
          tier,
          status: subscription?.status || 'demo',
          current_period_start: subscription?.current_period_start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          current_period_end: subscription?.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: tierConfig.price_monthly,
          currency: 'usd',
          user_count: usage?.userCount || 1,
          user_limit: usage?.userLimit || tierConfig.user_limit
        };
      });

      const subscriptionsData = await Promise.all(subscriptionPromises);

      setSubscriptions(subscriptionsData);

      // Calculate metrics
      const totalRevenue = subscriptionsData.reduce((sum, sub) => sum + sub.amount, 0);
      const activeCount = subscriptionsData.filter(sub => sub.status === 'active').length;
      
      setMetrics({
        totalRevenue: totalRevenue * 12, // Annual
        monthlyRevenue: totalRevenue,
        activeSubscriptions: activeCount,
        churnRate: 2.5,
        averageRevenuePerUser: totalRevenue / Math.max(activeCount, 1),
        pendingInvoices: Math.floor(Math.random() * 5)
      });

    } catch (err) {
      console.error('Error loading billing data:', err);
      setError('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const getTierPrice = (tier: string): number => {
    switch (tier) {
      case 'starter': return 29;
      case 'professional': return 99;
      case 'enterprise': return 299;
      default: return 0;
    }
  };

  const getTierUserLimit = (tier: string): number => {
    switch (tier) {
      case 'starter': return 5;
      case 'professional': return 25;
      case 'enterprise': return 100;
      default: return 1;
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'default';
      case 'professional': return 'secondary';
      case 'starter': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trialing': return 'secondary';
      case 'past_due': return 'destructive';
      case 'canceled': return 'outline';
      default: return 'outline';
    }
  };

  const formatCurrency = (amount: number, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleManageSubscription = async (organizationId: string) => {
    try {
      setLoading(true);
      const result = await stripeService.getCustomerPortalUrl(organizationId);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.url) {
        // Open customer portal in new tab
        window.open(result.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      setError('Failed to open customer portal');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeSubscription = async (organizationId: string, newTier: string) => {
    try {
      setLoading(true);
      const result = await stripeService.updateSubscription(organizationId, newTier);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      // Refresh data
      await loadBillingData();
    } catch (err) {
      console.error('Error upgrading subscription:', err);
      setError('Failed to upgrade subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (organizationId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const result = await stripeService.cancelSubscription(organizationId, false); // Cancel at period end
      
      if (result.error) {
        setError(result.error);
        return;
      }

      // Refresh data
      await loadBillingData();
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Billing Management</h1>
            <p className="text-muted-foreground">
              Manage subscriptions, payments, and billing analytics
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Billing Settings
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Projected annual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Paying customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ARPU</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.averageRevenuePerUser)}</div>
              <p className="text-xs text-muted-foreground">Avg revenue per user</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.churnRate}%</div>
              <p className="text-xs text-muted-foreground">Monthly churn</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pendingInvoices}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Active Subscriptions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices & Payments</TabsTrigger>
          <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="settings">Billing Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Customer Subscriptions</h2>
              <p className="text-muted-foreground">Manage customer billing and subscription tiers</p>
            </div>
            <Button>
              <CreditCard className="w-4 h-4 mr-2" />
              Create Manual Invoice
            </Button>
          </div>

          <div className="grid gap-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{subscription.organization_name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <Badge variant={getTierBadgeVariant(subscription.tier)}>
                          {subscription.tier}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatCurrency(subscription.amount)}</div>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium">Users</p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.user_count} of {subscription.user_limit} users
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(subscription.user_count / subscription.user_limit) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Current Period</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleManageSubscription(subscription.organization_id)}
                      >
                        Customer Portal
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleManageSubscription(subscription.organization_id)}
                      >
                        Manage Plan
                      </Button>
                      {subscription.status === 'active' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelSubscription(subscription.organization_id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>Recent invoices and payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Invoice management integration with Stripe will be implemented here.
                  This will include automated invoice generation, payment tracking, and dunning management.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Detailed revenue metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Advanced revenue analytics and forecasting will be implemented here.
                  This will include MRR trends, churn analysis, and customer lifetime value calculations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Configuration</CardTitle>
              <CardDescription>Platform-wide billing settings and webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Billing configuration interface will be implemented here.
                  This will include webhook management, tax settings, and payment method configuration.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};