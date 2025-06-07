import Stripe from 'stripe';

// Note: In a production environment, this should be in a backend API
// For now, we'll use this client-side approach with fallback to pricing flow
let stripe: Stripe | null = null;

const initializeStripe = () => {
  if (!stripe && import.meta.env.VITE_STRIPE_SECRET_KEY) {
    stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }
  return stripe;
};

export interface CheckoutSessionRequest {
  priceId: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId?: string;
  error?: string;
}

// Create Stripe checkout session
export const createCheckoutSession = async (
  request: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> => {
  const stripeInstance = initializeStripe();
  
  if (!stripeInstance) {
    return { error: 'Stripe not configured. Redirecting to pricing flow.' };
  }
  
  try {
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: request.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: request.successUrl,
      cancel_url: request.cancelUrl,
      customer_email: request.customerEmail,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 14, // 14-day free trial
      },
      metadata: {
        source: 'auditready_landing_page',
      },
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Retrieve checkout session
export const retrieveCheckoutSession = async (sessionId: string) => {
  const stripeInstance = initializeStripe();
  
  if (!stripeInstance) {
    throw new Error('Stripe not configured');
  }
  
  try {
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
};

// Handle webhook events
export const handleWebhookEvent = async (
  payload: string,
  signature: string
) => {
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('Webhook secret not configured');
  }

  const stripeInstance = initializeStripe();
  
  if (!stripeInstance) {
    throw new Error('Stripe not configured');
  }
  
  try {
    const event = stripeInstance.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful payment
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Payment successful:', session.id);
        // Here you would typically:
        // 1. Create user account
        // 2. Set up subscription
        // 3. Send welcome email
        break;
        
      case 'invoice.payment_succeeded':
        // Handle successful recurring payment
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Subscription payment successful:', invoice.id);
        break;
        
      case 'invoice.payment_failed':
        // Handle failed payment
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed:', failedInvoice.id);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
};