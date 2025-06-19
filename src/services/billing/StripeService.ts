import { supabase } from '@/lib/supabase';

export interface SubscriptionTier {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  user_limit: number;
  storage_limit_gb: number;
  support_level: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: {
    name: string;
    email: string;
    address: BillingAddress;
  };
  is_default: boolean;
}

export interface Invoice {
  id: string;
  organization_id: string;
  stripe_invoice_id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  invoice_pdf: string;
  period_start: string;
  period_end: string;
  created_at: string;
  due_date: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  stripe_subscription_id: string;
  tier: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export class StripeService {
  // Subscription tier definitions
  static readonly TIERS: Record<string, SubscriptionTier> = {
    free: {
      id: 'free',
      name: 'Free',
      price_monthly: 0,
      price_yearly: 0,
      features: [
        'Full feature access (demo)',
        'Demo workflows',
        'Community support',
        'Testing environment'
      ],
      user_limit: 1,
      storage_limit_gb: 1,
      support_level: 'community'
    },
    team: {
      id: 'team',
      name: 'Team',
      price_monthly: 499,
      price_yearly: 4990, // ~€416/month
      features: [
        'Up to 50 team members',
        'Multi-framework compliance tracking',
        'Team collaboration tools',
        'Automated requirement assignments',
        'Email notifications',
        'Basic reporting & analytics',
        'Email support'
      ],
      user_limit: 50,
      storage_limit_gb: 100,
      support_level: 'email'
    },
    business: {
      id: 'business',
      name: 'Business',
      price_monthly: 699,
      price_yearly: 6990, // ~€582/month
      features: [
        'Everything in Team',
        'Up to 250 team members',
        'AuditReady Risk Management',
        'Learning Management System',
        'Advanced reporting & analytics',
        'Custom templates & workflows',
        'API integrations',
        'Priority email support',
        'Slack/Teams integration'
      ],
      user_limit: 250,
      storage_limit_gb: 500,
      support_level: 'priority_email'
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      price_monthly: 999,
      price_yearly: 9990, // ~€832/month
      features: [
        'Everything in Business',
        'Unlimited team members',
        'Phishing Simulation Tool',
        'AuditReady AI Editor',
        'Advanced threat detection',
        'Custom compliance frameworks',
        'White-label solutions',
        'Dedicated account manager',
        'SSO & SAML integration',
        'On-premise deployment options',
        '24/7 phone support',
        'SLA guarantees'
      ],
      user_limit: -1, // Unlimited
      storage_limit_gb: -1, // Unlimited
      support_level: 'dedicated'
    }
  };

  // Create a new subscription for an organization
  async createSubscription(organizationId: string, tier: string, billingInterval: 'monthly' | 'yearly' = 'monthly'): Promise<{ sessionUrl?: string; error?: string }> {
    try {
      // Validate tier
      if (!StripeService.TIERS[tier]) {
        throw new Error(`Invalid subscription tier: ${tier}`);
      }

      const tierConfig = StripeService.TIERS[tier];
      const amount = billingInterval === 'yearly' ? tierConfig.price_yearly : tierConfig.price_monthly;

      // Create checkout session via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          organizationId,
          tier,
          amount,
          interval: billingInterval,
          successUrl: `${window.location.origin}/app?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/app/billing`
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        return { error: error.message };
      }

      return { sessionUrl: data.url };
    } catch (error) {
      console.error('Error in createSubscription:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get organization's current subscription
  async getSubscription(organizationId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No subscription found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  // Update subscription tier
  async updateSubscription(organizationId: string, newTier: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current subscription
      const subscription = await this.getSubscription(organizationId);
      if (!subscription) {
        return { success: false, error: 'No active subscription found' };
      }

      // Update via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('update-subscription', {
        body: {
          subscriptionId: subscription.stripe_subscription_id,
          newTier
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Cancel subscription
  async cancelSubscription(organizationId: string, immediately = false): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = await this.getSubscription(organizationId);
      if (!subscription) {
        return { success: false, error: 'No active subscription found' };
      }

      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscriptionId: subscription.stripe_subscription_id,
          immediately
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get customer portal URL for self-service billing
  async getCustomerPortalUrl(organizationId: string): Promise<{ url?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { organizationId }
      });

      if (error) {
        return { error: error.message };
      }

      return { url: data.url };
    } catch (error) {
      console.error('Error creating portal session:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get organization's invoices
  async getInvoices(organizationId: string, limit = 10): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInvoices:', error);
      return [];
    }
  }

  // Get organization's payment methods
  async getPaymentMethods(organizationId: string): Promise<PaymentMethod[]> {
    try {
      // This would typically call a Supabase Edge Function that queries Stripe
      const { data, error } = await supabase.functions.invoke('get-payment-methods', {
        body: { organizationId }
      });

      if (error) {
        console.error('Error fetching payment methods:', error);
        return [];
      }

      return data.paymentMethods || [];
    } catch (error) {
      console.error('Error in getPaymentMethods:', error);
      return [];
    }
  }

  // Add a new payment method
  async addPaymentMethod(organizationId: string): Promise<{ setupIntent?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('create-setup-intent', {
        body: { organizationId }
      });

      if (error) {
        return { error: error.message };
      }

      return { setupIntent: data.clientSecret };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Delete a payment method
  async deletePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('delete-payment-method', {
        body: { paymentMethodId }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Set default payment method
  async setDefaultPaymentMethod(organizationId: string, paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('set-default-payment-method', {
        body: { organizationId, paymentMethodId }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get billing usage and limits for an organization
  async getBillingUsage(organizationId: string): Promise<{
    currentTier: string;
    userCount: number;
    userLimit: number;
    storageUsedGB: number;
    storageLimit: number;
    apiCallsThisMonth: number;
    apiCallLimit: number;
  } | null> {
    try {
      // Get organization details
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('subscription_tier')
        .eq('id', organizationId)
        .single();

      if (orgError) throw orgError;

      // Get user count
      const { count: userCount } = await supabase
        .from('organization_users')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      const currentTier = org.subscription_tier || 'starter';
      const tierConfig = StripeService.TIERS[currentTier];

      return {
        currentTier,
        userCount: userCount || 0,
        userLimit: tierConfig.user_limit,
        storageUsedGB: 0, // TODO: Calculate actual storage usage
        storageLimit: tierConfig.storage_limit_gb,
        apiCallsThisMonth: 0, // TODO: Calculate from API logs
        apiCallLimit: -1 // TODO: Implement API limits
      };
    } catch (error) {
      console.error('Error fetching billing usage:', error);
      return null;
    }
  }

  // Check if organization can add more users
  async canAddUser(organizationId: string): Promise<boolean> {
    try {
      const usage = await this.getBillingUsage(organizationId);
      if (!usage) return false;

      if (usage.userLimit === -1) return true; // Unlimited
      return usage.userCount < usage.userLimit;
    } catch (error) {
      console.error('Error checking user limit:', error);
      return false;
    }
  }

  // Get tier upgrade recommendations
  getTierRecommendation(currentUsage: { userCount: number; storageUsedGB: number }): string | null {
    const { userCount, storageUsedGB } = currentUsage;

    if (userCount > 25 || storageUsedGB > 100) {
      return 'enterprise';
    } else if (userCount > 5 || storageUsedGB > 10) {
      return 'professional';
    }

    return null;
  }
}

export const stripeService = new StripeService();