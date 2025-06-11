/**
 * Subscription Service for Onboarding Integration
 * Connects onboarding flow to Stripe subscriptions
 */

import StripeDirectAPI from '@/services/stripe/StripeDirectAPI';
import SupabaseDirectAPI from '@/services/supabase/SupabaseDirectAPI';
import { supabase } from '@/lib/supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  stripePriceId: string;
  stripeProductId: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    users: number;
    storage: number; // GB
    assessments: number;
    support: string;
  };
  popular?: boolean;
  recommended?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    stripePriceId: '',
    stripeProductId: '',
    price: 0,
    interval: 'month',
    features: [
      'Basic compliance assessments',
      'Up to 1 user',
      'Community support',
      'Basic templates'
    ],
    limits: {
      users: 1,
      storage: 1,
      assessments: 5,
      support: 'Community'
    }
  },
  {
    id: 'team',
    name: 'Team',
    stripePriceId: 'price_1RXLE3BDPoJ4xbIHao66CAtl',
    stripeProductId: 'prod_SSFje56jEZVKWd',
    price: 499,
    interval: 'month',
    features: [
      'Advanced compliance frameworks',
      'Up to 10 users',
      'Email support',
      'Custom templates',
      'Basic reporting'
    ],
    limits: {
      users: 10,
      storage: 25,
      assessments: 50,
      support: 'Email'
    },
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    stripePriceId: 'price_1RXLE3BDPoJ4xbIH4qddyWHp',
    stripeProductId: 'prod_SSFjvpZ8VojfbX',
    price: 699,
    interval: 'month',
    features: [
      'All compliance frameworks',
      'Up to 100 users',
      'Priority support',
      'Advanced reporting',
      'API access',
      'SSO integration'
    ],
    limits: {
      users: 100,
      storage: 100,
      assessments: 200,
      support: 'Priority'
    },
    recommended: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    stripePriceId: 'price_1RXLE4BDPoJ4xbIHKcncU8ej',
    stripeProductId: 'prod_SSFjEKVTVVW6oE',
    price: 999,
    interval: 'month',
    features: [
      'White-label solution',
      'Unlimited users',
      'Dedicated support',
      'Custom development',
      'On-premise deployment',
      'Advanced analytics'
    ],
    limits: {
      users: -1, // unlimited
      storage: -1, // unlimited
      assessments: -1, // unlimited
      support: 'Dedicated'
    }
  }
];

export class SubscriptionService {
  
  // Get plan by ID
  static getPlan(planId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null;
  }

  // Get recommended plan based on organization size
  static getRecommendedPlan(organizationSize: string): SubscriptionPlan {
    const size = parseInt(organizationSize) || 0;
    
    if (size <= 1) return SUBSCRIPTION_PLANS[0]; // Free
    if (size <= 10) return SUBSCRIPTION_PLANS[1]; // Team
    if (size <= 100) return SUBSCRIPTION_PLANS[2]; // Business
    return SUBSCRIPTION_PLANS[3]; // Enterprise
  }

  // Create Stripe customer and organization
  static async createCustomerAndOrganization(data: {
    organizationName: string;
    email: string;
    planId: string;
    userId: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const plan = this.getPlan(data.planId);
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      // Create organization in Supabase first
      const organization = await SupabaseDirectAPI.Organization.createOrganization({
        name: data.organizationName,
        slug: data.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        subscription_tier: data.planId,
        owner_id: data.userId
      });

      let stripeCustomerId = null;
      let subscriptionId = null;

      // Only create Stripe customer for paid plans
      if (plan.price > 0) {
        // Create Stripe customer
        const customer = await StripeDirectAPI.Customer.create({
          email: data.email,
          name: data.organizationName,
          metadata: {
            organization_id: organization.id,
            plan_id: data.planId,
            ...data.metadata
          }
        });

        stripeCustomerId = customer.id;

        // Create subscription for paid plans
        const subscription = await StripeDirectAPI.Subscription.create({
          customer: customer.id,
          items: [{
            price: plan.stripePriceId
          }],
          payment_behavior: 'default_incomplete',
          payment_settings: {
            save_default_payment_method: 'on_subscription'
          },
          metadata: {
            organization_id: organization.id,
            plan_id: data.planId
          }
        });

        subscriptionId = subscription.id;
      }

      // Update organization with Stripe data
      if (stripeCustomerId) {
        await SupabaseDirectAPI.Database.query('organizations', true)
          .update({
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: subscriptionId
          })
          .eq('id', organization.id);
      }

      return {
        organization,
        stripeCustomerId,
        subscriptionId,
        plan,
        requiresPayment: plan.price > 0
      };

    } catch (error) {
      console.error('Error creating customer and organization:', error);
      throw error;
    }
  }

  // Create checkout session for subscription
  static async createCheckoutSession(data: {
    planId: string;
    customerEmail: string;
    organizationId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    try {
      const plan = this.getPlan(data.planId);
      if (!plan || plan.price === 0) {
        throw new Error('Invalid plan for checkout');
      }

      const session = await StripeDirectAPI.Checkout.createSession({
        mode: 'subscription',
        line_items: [{
          price: plan.stripePriceId,
          quantity: 1
        }],
        customer_email: data.customerEmail,
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        subscription_data: {
          metadata: {
            organization_id: data.organizationId,
            plan_id: data.planId
          }
        },
        metadata: {
          organization_id: data.organizationId,
          plan_id: data.planId
        }
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Handle successful subscription (webhook or polling)
  static async handleSubscriptionSuccess(subscriptionId: string) {
    try {
      // Get subscription from Stripe
      const subscription = await StripeDirectAPI.Subscription.retrieve(subscriptionId, ['customer']);
      
      const customer = subscription.customer as any;
      const organizationId = subscription.metadata?.organization_id;
      
      if (!organizationId) {
        throw new Error('Organization ID not found in subscription metadata');
      }

      // Update organization with subscription status
      await SupabaseDirectAPI.Database.query('organizations', true)
        .update({
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customer.id,
          status: 'active',
          subscription_status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        })
        .eq('id', organizationId);

      // Update user's organization access
      const { data: orgUser } = await SupabaseDirectAPI.Database.query('organization_users')
        .select('user_id')
        .eq('organization_id', organizationId)
        .eq('role', 'owner')
        .single();

      if (orgUser) {
        // Send welcome email, setup organization, etc.
        console.log(`✅ Subscription activated for organization ${organizationId}`);
      }

      return { success: true, organizationId };
    } catch (error) {
      console.error('Error handling subscription success:', error);
      throw error;
    }
  }

  // Get organization's current subscription status
  static async getOrganizationSubscription(organizationId: string) {
    try {
      const { data: org } = await SupabaseDirectAPI.Database.query('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (!org) {
        throw new Error('Organization not found');
      }

      let stripeData = null;
      if (org.stripe_subscription_id) {
        try {
          stripeData = await StripeDirectAPI.Subscription.retrieve(org.stripe_subscription_id);
        } catch (error) {
          console.warn('Failed to fetch Stripe subscription:', error);
        }
      }

      const plan = this.getPlan(org.subscription_tier);

      return {
        organization: org,
        plan,
        stripeData,
        isActive: org.status === 'active',
        requiresPayment: plan?.price && plan.price > 0
      };
    } catch (error) {
      console.error('Error getting organization subscription:', error);
      throw error;
    }
  }

  // Change subscription plan
  static async changeSubscriptionPlan(organizationId: string, newPlanId: string) {
    try {
      const currentSub = await this.getOrganizationSubscription(organizationId);
      const newPlan = this.getPlan(newPlanId);
      
      if (!newPlan) {
        throw new Error('Invalid new plan');
      }

      // If switching to/from free plan
      if (currentSub.plan?.price === 0 || newPlan.price === 0) {
        // Handle free plan transitions separately
        await SupabaseDirectAPI.Database.query('organizations', true)
          .update({ subscription_tier: newPlanId })
          .eq('id', organizationId);
        
        return { requiresPayment: newPlan.price > 0 };
      }

      // Update existing Stripe subscription
      if (currentSub.stripeData && newPlan.stripePriceId) {
        const updatedSub = await StripeDirectAPI.Subscription.update(currentSub.stripeData.id, {
          items: [{
            id: currentSub.stripeData.items.data[0].id,
            price: newPlan.stripePriceId
          }],
          proration_behavior: 'create_prorations'
        });

        // Update database
        await SupabaseDirectAPI.Database.query('organizations', true)
          .update({ subscription_tier: newPlanId })
          .eq('id', organizationId);

        return { updatedSubscription: updatedSub };
      }

      throw new Error('Unable to update subscription');
    } catch (error) {
      console.error('Error changing subscription plan:', error);
      throw error;
    }
  }

  // Cancel subscription
  static async cancelSubscription(organizationId: string, immediately = false) {
    try {
      const currentSub = await this.getOrganizationSubscription(organizationId);
      
      if (!currentSub.stripeData) {
        throw new Error('No active subscription to cancel');
      }

      const canceledSub = await StripeDirectAPI.Subscription.cancel(currentSub.stripeData.id, {
        cancel_at_period_end: !immediately
      });

      // Update organization status
      await SupabaseDirectAPI.Database.query('organizations', true)
        .update({
          subscription_status: canceledSub.status,
          status: immediately ? 'cancelled' : 'active' // Keep active until period end
        })
        .eq('id', organizationId);

      return canceledSub;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
}

export default SubscriptionService;