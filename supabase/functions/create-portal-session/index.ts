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

interface PortalRequest {
  organizationId: string;
  return_url?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { organizationId, return_url = 'https://localhost:5173/admin/billing' }: PortalRequest = await req.json();

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: 'Missing organizationId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating portal session for organization:', organizationId);

    // Get organization with subscription data
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select(`
        *,
        subscriptions (
          stripe_customer_id,
          stripe_subscription_id,
          status,
          current_period_end
        )
      `)
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      console.error('Organization not found:', orgError);
      return new Response(
        JSON.stringify({ error: 'Organization not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if organization has a Stripe customer ID
    const subscription = org.subscriptions?.[0];
    if (!subscription?.stripe_customer_id) {
      console.error('No Stripe customer found for organization:', organizationId);
      return new Response(
        JSON.stringify({ error: 'No billing setup found for this organization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating portal session for customer:', subscription.stripe_customer_id);

    // Create Stripe customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: return_url,
      configuration: {
        business_profile: {
          headline: 'Manage your AuditReady subscription',
        },
        features: {
          payment_method_update: {
            enabled: true,
          },
          invoice_history: {
            enabled: true,
          },
          customer_update: {
            enabled: true,
            allowed_updates: ['email', 'address', 'phone'],
          },
          subscription_update: {
            enabled: true,
            default_allowed_updates: ['price'],
            proration_behavior: 'create_prorations',
            products: [
              {
                product: Deno.env.get('STRIPE_PRODUCT_ID') || '',
                prices: [
                  Deno.env.get('STRIPE_PRICE_STARTER_MONTHLY') || '',
                  Deno.env.get('STRIPE_PRICE_PROFESSIONAL_MONTHLY') || '',
                  Deno.env.get('STRIPE_PRICE_ENTERPRISE_MONTHLY') || '',
                ],
              },
            ],
          },
        },
      },
    });

    console.log('Portal session created:', portalSession.id);

    // Log portal access for audit
    await supabase
      .from('enhanced_audit_logs')
      .insert({
        organization_id: organizationId,
        action: 'customer_portal_access',
        resource_type: 'billing',
        resource_id: subscription.stripe_customer_id,
        details: {
          stripe_customer_id: subscription.stripe_customer_id,
          return_url,
          portal_session_id: portalSession.id,
        },
        performed_by: null, // Platform admin action
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      });

    return new Response(
      JSON.stringify({
        success: true,
        url: portalSession.url,
        customer_id: subscription.stripe_customer_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating portal session:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to create portal session',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});