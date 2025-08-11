import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe - Replace with your publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Lazy load Stripe to improve initial page load
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    if (!stripePublishableKey) {
      console.warn('Stripe publishable key not configured');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(stripePublishableKey).catch(error => {
      console.error('Failed to load Stripe:', error);
      return null;
    });
  }
  return stripePromise;
};

// Pricing configuration
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever',
    features: [
      'Full feature access (demo mode)',
      'Mock data and workflows',
      'Basic compliance templates',
      'Standard reporting',
      'Community support'
    ]
  },
  team: {
    id: 'team',
    name: 'Team',
    price: 499,
    interval: 'month',
    stripePriceId: import.meta.env.VITE_STRIPE_TEAM_PRICE_ID || '', // You'll need to create this in Stripe
    features: [
      'All core features',
      'Multi-framework support',
      'Advanced reporting & analytics',
      'Team collaboration tools',
      'Email support',
      'Up to 5 compliance frameworks'
    ]
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 699,
    interval: 'month',
    stripePriceId: import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID || '', // You'll need to create this in Stripe
    features: [
      'Everything in Team',
      'Custom audit templates',
      'API integrations',
      'Priority support',
      'Advanced security features',
      'Unlimited frameworks',
      'Custom workflows'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    interval: 'month',
    stripePriceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID || '', // You'll need to create this in Stripe
    features: [
      'Everything in Business',
      'White-label solution',
      'Dedicated support manager',
      'Single Sign-On (SSO)',
      'Custom development',
      'SLA guarantees',
      'On-premise deployment',
      '24/7 phone support'
    ]
  }
};

// Create checkout session (for when we have a backend API)
export const createCheckoutSession = async (priceId: string, customerEmail?: string) => {
  try {
    // Import the API function directly for now
    const { createCheckoutSession: apiCreateSession } = await import('@/api/stripe');
    
    const result = await apiCreateSession({
      priceId,
      customerEmail,
      successUrl: `${window.location.origin}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/pricing`,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (priceId: string, customerEmail?: string) => {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe not loaded');
    }

    const sessionId = await createCheckoutSession(priceId, customerEmail);
    
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      console.error('Stripe redirect error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};

// Handle successful payment (to be called after redirect back)
export const handlePaymentSuccess = async (sessionId: string) => {
  try {
    const response = await fetch(`/api/payment-success?session_id=${sessionId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
};