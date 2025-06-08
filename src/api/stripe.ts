import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';

// Client-side Stripe instance
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export interface CheckoutSessionRequest {
  priceId: string;
  customerEmail?: string;
  organizationName?: string;
  tier: string;
}

export interface CheckoutSessionResponse {
  sessionId?: string;
  sessionUrl?: string;
  error?: string;
}

// Create checkout session via Supabase Edge Function
export const createCheckoutSession = async (
  request: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    // Call Supabase Edge Function to create checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId: request.priceId,
        customerEmail: request.customerEmail || user.email,
        organizationName: request.organizationName,
        tier: request.tier,
        userId: user.id,
        successUrl: `${window.location.origin}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      return { error: error.message };
    }

    return { 
      sessionId: data.sessionId,
      sessionUrl: data.sessionUrl 
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe not loaded');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    console.error('Redirect error:', error);
    throw error;
  }
};

// Get customer portal URL via Supabase Edge Function
export const getCustomerPortalUrl = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user's organization
    const { data: orgUser } = await supabase
      .from('organization_users')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!orgUser) {
      throw new Error('No organization found');
    }

    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { organizationId: orgUser.organization_id }
    });

    if (error) throw error;
    return data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

// Check subscription status
export const checkSubscriptionStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get user's organization
    const { data: orgUser } = await supabase
      .from('organization_users')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!orgUser) return null;

    // Check for active subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', orgUser.organization_id)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return null;
  }
};

// Get organization's invoices
export const getInvoices = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get user's organization
    const { data: orgUser } = await supabase
      .from('organization_users')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!orgUser) return [];

    // Get invoices
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', orgUser.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
};