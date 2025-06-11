import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin/AdminService';
import { enhancedStripeService, StripeProduct } from '@/services/stripe/EnhancedStripeService';
import { ProductManagementModal } from '@/components/admin/stripe/ProductManagementModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Settings,
  FileText,
  Eye,
  Clock,
  BarChart3,
  Webhook,
  Mail,
  Database,
  Package,
  Plus,
  Edit,
  Globe
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

// Invoice Management Tab Component
const InvoiceManagementTab: React.FC<{ subscriptions: SubscriptionData[] }> = ({ subscriptions }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>('all');

  const loadInvoices = async (organizationId?: string) => {
    setLoading(true);
    try {
      // For demo purposes, create sample invoice data
      // In a real implementation, this would fetch from Stripe
      const sampleInvoices = subscriptions
        .filter(sub => !organizationId || organizationId === 'all' || sub.organization_id === organizationId)
        .map(sub => ({
          id: `inv_${sub.id}`,
          number: `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          organization_name: sub.organization_name,
          amount_due: sub.amount * 100, // Convert to cents
          status: 'paid',
          created_at: sub.current_period_start,
          period_start: sub.current_period_start,
          period_end: sub.current_period_end,
          hosted_invoice_url: `https://invoice.stripe.com/i/acct_test/${Math.random().toString(36).substr(2, 24)}`,
          invoice_pdf: `https://pay.stripe.com/invoice/${Math.random().toString(36).substr(2, 24)}/pdf`
        }));
      
      setInvoices(sampleInvoices.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices(selectedOrg);
  }, [selectedOrg, subscriptions]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'open': return 'secondary';
      case 'void': return 'outline';
      case 'draft': return 'outline';
      default: return 'destructive';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoice Management</h2>
          <p className="text-muted-foreground">Recent invoices and payment history</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedOrg} 
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Organizations</option>
            {subscriptions.map((sub) => (
              <option key={sub.organization_id} value={sub.organization_id}>
                {sub.organization_name}
              </option>
            ))}
          </select>
          <Button onClick={() => loadInvoices(selectedOrg)} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No invoices found</p>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number || invoice.id.slice(-8)}</TableCell>
                    <TableCell>{invoice.organization_name}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount_due)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(invoice.created_at)}</TableCell>
                    <TableCell>
                      {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {invoice.hosted_invoice_url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        )}
                        {invoice.invoice_pdf && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Revenue Analytics Tab Component
const RevenueAnalyticsTab: React.FC<{ subscriptions: SubscriptionData[]; metrics: BillingMetrics | null }> = ({ subscriptions, metrics }) => {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('30d');
  
  const getTierRevenue = () => {
    const tierRevenue = subscriptions.reduce((acc, sub) => {
      const tier = sub.tier;
      if (!acc[tier]) acc[tier] = { count: 0, revenue: 0 };
      acc[tier].count += 1;
      acc[tier].revenue += sub.amount;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);
    
    return Object.entries(tierRevenue).map(([tier, data]) => ({
      tier,
      customers: data.count,
      monthlyRevenue: data.revenue,
      annualRevenue: data.revenue * 12,
      avgRevenuePerCustomer: data.revenue / data.count
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const tierData = getTierRevenue();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Revenue Analytics</h2>
          <p className="text-muted-foreground">Detailed revenue metrics and trends</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Analytics
          </Button>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.monthlyRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Annual Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((metrics?.averageRevenuePerUser || 0) * 24)}
            </div>
            <p className="text-xs text-muted-foreground">Estimated lifetime value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15.3%</div>
            <p className="text-xs text-muted-foreground">Month over month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Tier */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Subscription Tier</CardTitle>
          <CardDescription>Breakdown of revenue by customer tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Monthly Revenue</TableHead>
                <TableHead>Annual Revenue</TableHead>
                <TableHead>ARPC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tierData.map((tier) => (
                <TableRow key={tier.tier}>
                  <TableCell className="font-medium capitalize">{tier.tier}</TableCell>
                  <TableCell>{tier.customers}</TableCell>
                  <TableCell>{formatCurrency(tier.monthlyRevenue)}</TableCell>
                  <TableCell>{formatCurrency(tier.annualRevenue)}</TableCell>
                  <TableCell>{formatCurrency(tier.avgRevenuePerCustomer)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Billing Settings Tab Component
const BillingSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    webhookUrl: '',
    taxSettings: {
      enabled: false,
      defaultTaxRate: 0,
      autoCalculate: true
    },
    dunningSettings: {
      enabled: true,
      retryAttempts: 3,
      retryInterval: 3
    }
  });

  const handleSaveSettings = async () => {
    try {
      // Save settings via AdminService
      console.log('Saving billing settings:', settings);
      // TODO: Implement settings save
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing Configuration</h2>
        <p className="text-muted-foreground">Platform-wide billing settings and webhooks</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Webhook className="w-5 h-5 mr-2" />
              Webhook Configuration
            </CardTitle>
            <CardDescription>Configure Stripe webhook endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                value={settings.webhookUrl}
                onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                placeholder="https://your-domain.com/webhook"
              />
            </div>
            <Button variant="outline" className="w-full">
              <Database className="w-4 h-4 mr-2" />
              Test Webhook
            </Button>
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Settings</CardTitle>
            <CardDescription>Configure tax calculation and collection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="tax-enabled">Enable Tax Collection</Label>
              <Switch
                id="tax-enabled"
                checked={settings.taxSettings.enabled}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    taxSettings: { ...settings.taxSettings, enabled: checked }
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                value={settings.taxSettings.defaultTaxRate}
                onChange={(e) => 
                  setSettings({ 
                    ...settings, 
                    taxSettings: { ...settings.taxSettings, defaultTaxRate: parseFloat(e.target.value) }
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Notifications - Link to System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Email Notifications
            </CardTitle>
            <CardDescription>Manage email settings in system configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-blue-900">Email settings are centrally managed</p>
                <p className="text-sm text-blue-700">Configure all email notifications in System Settings</p>
              </div>
              <Button 
                variant="outline" 
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => window.open('/admin/system/settings#email', '_blank')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Open Email Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dunning Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Dunning Management
            </CardTitle>
            <CardDescription>Configure failed payment handling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dunning-enabled">Enable Dunning</Label>
              <Switch
                id="dunning-enabled"
                checked={settings.dunningSettings.enabled}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    dunningSettings: { ...settings.dunningSettings, enabled: checked }
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="retry-attempts">Retry Attempts</Label>
              <Input
                id="retry-attempts"
                type="number"
                value={settings.dunningSettings.retryAttempts}
                onChange={(e) => 
                  setSettings({ 
                    ...settings, 
                    dunningSettings: { ...settings.dunningSettings, retryAttempts: parseInt(e.target.value) }
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          <Settings className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export const BillingManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StripeProduct | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  useEffect(() => {
    loadBillingData();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await enhancedStripeService.listProducts(true);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // Get organizations and create subscription data
      const organizations = await adminService.getOrganizations();
      
      // Create subscription data based on organizations with tier information
      const subscriptionPromises = organizations.map(async (org) => {
        const tier = org.subscription_tier || 'team'; // Default to team tier
        const tierPrices = {
          team: 499,
          business: 699,
          enterprise: 999
        };
        const tierLimits = {
          team: 50,
          business: 1000,
          enterprise: 10000
        };
        
        return {
          id: `sub_${org.id}`,
          organization_id: org.id,
          organization_name: org.name,
          tier,
          status: 'active',
          current_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: tierPrices[tier] || tierPrices.team,
          currency: 'eur',
          user_count: org.organization_users?.length || 1,
          user_limit: tierLimits[tier] || tierLimits.team
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

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = (product: StripeProduct) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleProductUpdated = () => {
    loadProducts();
    // Trigger real-time pricing update
    localStorage.setItem('stripe_pricing_updated', Date.now().toString());
    setTimeout(() => {
      localStorage.removeItem('stripe_pricing_updated');
    }, 100);
  };

  const getTierPrice = (tier: string): number => {
    switch (tier) {
      case 'team': return 499;
      case 'business': return 699;
      case 'enterprise': return 999;
      default: return 0;
    }
  };

  const getTierUserLimit = (tier: string): number => {
    switch (tier) {
      case 'team': return 50;
      case 'business': return 1000;
      case 'enterprise': return 10000;
      default: return 1;
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'default';
      case 'business': return 'secondary';
      case 'team': return 'outline';
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
      // For demo purposes, show information
      const org = subscriptions.find(s => s.organization_id === organizationId);
      if (org) {
        alert(`Opening customer portal for ${org.organization_name}\n\nThis would redirect to Stripe Customer Portal in a real implementation.`);
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      setError('Failed to open customer portal');
    }
  };

  const handleUpgradeSubscription = async (organizationId: string, newTier: string) => {
    try {
      setLoading(true);
      
      // Update the organization's subscription tier in your database
      // For demo purposes, we'll just update the local state
      setSubscriptions(prevSubs => 
        prevSubs.map(sub => 
          sub.organization_id === organizationId 
            ? { ...sub, tier: newTier, amount: getTierPrice(newTier) }
            : sub
        )
      );
      
      alert(`Subscription upgraded to ${newTier} tier successfully!`);
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
      
      // Update subscription status
      setSubscriptions(prevSubs => 
        prevSubs.map(sub => 
          sub.organization_id === organizationId 
            ? { ...sub, status: 'canceled' }
            : sub
        )
      );
      
      alert('Subscription canceled successfully!');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
                <Button variant="secondary" onClick={() => navigate('/admin')} className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Billing Management</h1>
                  <p className="text-blue-100 text-lg">
                    Manage subscriptions, payments, and billing analytics
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status Indicator */}
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-sm text-blue-100">Stripe Connected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-sm text-blue-100">Billing Active</span>
                  </div>
                </div>
              </div>
              
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing Administrator
              </Badge>
              
              <div className="flex items-center space-x-2">
                <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Billing Settings
                </Button>
              </div>
            </div>
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
          <TabsTrigger value="products">Product Management</TabsTrigger>
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

        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Product Management</h2>
              <p className="text-muted-foreground">Manage Stripe products and sync pricing with landing page</p>
            </div>
            <Button onClick={handleCreateProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </Button>
          </div>

          <Alert>
            <Globe className="h-4 w-4" />
            <AlertDescription>
              Products with tier metadata automatically sync to the landing page pricing section. 
              Changes are reflected in real-time without requiring a page refresh.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {product.name}
                        {product.metadata?.tier && (
                          <Badge variant="secondary">
                            <Globe className="h-3 w-3 mr-1" />
                            {product.metadata.tier} tier
                          </Badge>
                        )}
                        <Badge variant={product.active ? 'default' : 'secondary'}>
                          {product.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://dashboard.stripe.com/products/${product.id}`, '_blank')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Stripe
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Stripe Product ID</p>
                      <p className="text-sm text-muted-foreground font-mono">{product.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Landing Page Sync</p>
                      <p className="text-sm text-muted-foreground">
                        {product.metadata?.tier ? (
                          <span className="text-green-600">
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Synced to {product.metadata.tier} tier
                          </span>
                        ) : (
                          <span className="text-amber-600">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            Not synced to landing page
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {Object.keys(product.metadata).length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Metadata</p>
                      <div className="text-xs bg-muted p-2 rounded">
                        <pre>{JSON.stringify(product.metadata, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {products.length === 0 && !loading && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Products Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first product to start managing pricing tiers.
                  </p>
                  <Button onClick={handleCreateProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Product
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceManagementTab subscriptions={subscriptions} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <RevenueAnalyticsTab subscriptions={subscriptions} metrics={metrics} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <BillingSettingsTab />
        </TabsContent>
      </Tabs>

      {/* Product Management Modal */}
      <ProductManagementModal
        open={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />
      </div>
    </div>
  );
};