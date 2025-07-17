import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Secure CORS configuration - restrict to specific origins
const getAllowedOrigins = () => {
  const prodOrigins = [
    'https://app.auditready.com',
    'https://auditready.com',
    'https://www.auditready.com'
  ];
  
  const devOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost'
  ];
  
  // In development, allow dev origins, in production only prod origins
  const isDev = Deno.env.get('ENVIRONMENT') === 'development';
  return isDev ? [...prodOrigins, ...devOrigins] : prodOrigins;
};

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = getAllowedOrigins();
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated and is a platform admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is platform admin
    const { data: isAdmin } = await supabase
      .from('platform_administrators')
      .select('id')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Platform administrator access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...params } = await req.json();

    let result;

    switch (action) {
      // Product Management
      case 'list_products':
        const products = await stripe.products.list({ 
          active: true, 
          limit: 100,
          expand: ['data.default_price']
        });
        result = { products: products.data };
        break;

      case 'create_product':
        const newProduct = await stripe.products.create(params.productData);
        result = { product: newProduct };
        break;

      case 'update_product':
        const updatedProduct = await stripe.products.update(params.productId, params.updates);
        result = { product: updatedProduct };
        break;

      // Price Management
      case 'list_prices':
        const pricesOptions: any = { active: true, limit: 100 };
        if (params.productId) pricesOptions.product = params.productId;
        const prices = await stripe.prices.list(pricesOptions);
        result = { prices: prices.data };
        break;

      case 'create_price':
        const newPrice = await stripe.prices.create(params.priceData);
        result = { price: newPrice };
        break;

      case 'update_price':
        const updatedPrice = await stripe.prices.update(params.priceId, params.updates);
        result = { price: updatedPrice };
        break;

      // Coupon Management
      case 'list_coupons':
        const coupons = await stripe.coupons.list({ limit: 100 });
        result = { coupons: coupons.data };
        break;

      case 'create_coupon':
        const newCoupon = await stripe.coupons.create(params.couponData);
        result = { coupon: newCoupon };
        break;

      case 'update_coupon':
        const updatedCoupon = await stripe.coupons.update(params.couponId, params.updates);
        result = { coupon: updatedCoupon };
        break;

      case 'delete_coupon':
        await stripe.coupons.del(params.couponId);
        result = { success: true };
        break;

      // Promotion Code Management
      case 'list_promotion_codes':
        const promotionCodesOptions: any = { limit: 100 };
        if (params.couponId) promotionCodesOptions.coupon = params.couponId;
        const promotionCodes = await stripe.promotionCodes.list(promotionCodesOptions);
        result = { promotion_codes: promotionCodes.data };
        break;

      case 'create_promotion_code':
        const newPromotionCode = await stripe.promotionCodes.create(params.promoData);
        result = { promotion_code: newPromotionCode };
        break;

      case 'update_promotion_code':
        const updatedPromotionCode = await stripe.promotionCodes.update(params.promoCodeId, params.updates);
        result = { promotion_code: updatedPromotionCode };
        break;

      // Customer Management
      case 'list_customers':
        const customers = await stripe.customers.list({ 
          limit: 100,
          expand: ['data.subscriptions']
        });
        result = { customers: customers.data };
        break;

      case 'get_customer':
        const customer = await stripe.customers.retrieve(params.customerId, {
          expand: ['subscriptions']
        });
        result = { customer };
        break;

      case 'update_customer':
        const updatedCustomer = await stripe.customers.update(params.customerId, params.updates);
        result = { customer: updatedCustomer };
        break;

      // Subscription Management
      case 'list_subscriptions':
        const subsOptions: any = { 
          limit: 100,
          expand: ['data.customer', 'data.items.data.price']
        };
        if (params.customerId) subsOptions.customer = params.customerId;
        const subscriptions = await stripe.subscriptions.list(subsOptions);
        result = { subscriptions: subscriptions.data };
        break;

      case 'cancel_subscription':
        const canceledSub = await stripe.subscriptions.update(params.subscriptionId, {
          cancel_at_period_end: params.at_period_end
        });
        result = { subscription: canceledSub };
        break;

      case 'update_subscription':
        const updatedSub = await stripe.subscriptions.update(params.subscriptionId, params.updates);
        result = { subscription: updatedSub };
        break;

      // Analytics
      case 'get_analytics':
        // Get active subscriptions
        const activeSubs = await stripe.subscriptions.list({ 
          status: 'active',
          limit: 100 
        });

        // Calculate analytics
        const monthlyRevenue = activeSubs.data.reduce((total, sub) => {
          return total + (sub.items.data[0]?.price?.unit_amount || 0);
        }, 0) / 100; // Convert from cents

        const analytics = {
          totalRevenue: monthlyRevenue * 12,
          monthlyRevenue,
          activeSubscriptions: activeSubs.data.length,
          churnRate: 2.5, // Placeholder - would need historical data
          averageRevenuePerUser: activeSubs.data.length > 0 ? monthlyRevenue / activeSubs.data.length : 0,
          pendingInvoices: 0, // Placeholder - would query invoices
          connectionStatus: true
        };

        result = { analytics };
        break;

      // Reset Password (through Supabase Auth)
      case 'reset_password':
        const { error: resetError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: params.email
        });

        if (resetError) {
          throw new Error(`Failed to generate password reset: ${resetError.message}`);
        }

        result = { success: true };
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in stripe-admin function:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});