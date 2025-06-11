import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const { organizationId, tier, amount, interval, successUrl, cancelUrl } = await req.json()

    // Get organization details
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      throw new Error('Organization not found')
    }

    // Define price IDs based on tier and interval
    const priceIds = {
      starter: {
        monthly: Deno.env.get('STRIPE_PRICE_STARTER_MONTHLY') || 'price_starter_monthly',
        yearly: Deno.env.get('STRIPE_PRICE_STARTER_YEARLY') || 'price_starter_yearly',
      },
      professional: {
        monthly: Deno.env.get('STRIPE_PRICE_PROFESSIONAL_MONTHLY') || 'price_professional_monthly',
        yearly: Deno.env.get('STRIPE_PRICE_PROFESSIONAL_YEARLY') || 'price_professional_yearly',
      },
      enterprise: {
        monthly: Deno.env.get('STRIPE_PRICE_ENTERPRISE_MONTHLY') || 'price_enterprise_monthly',
        yearly: Deno.env.get('STRIPE_PRICE_ENTERPRISE_YEARLY') || 'price_enterprise_yearly',
      },
    }

    const priceId = priceIds[tier]?.[interval]
    if (!priceId) {
      throw new Error('Invalid tier or interval')
    }

    // Check if customer exists
    let customerId = org.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: org.billing_email || org.name + '@example.com',
        name: org.name,
        metadata: {
          organization_id: organizationId,
          organization_slug: org.slug,
        },
      })

      customerId = customer.id

      // Update organization with Stripe customer ID
      await supabaseClient
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', organizationId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          organization_id: organizationId,
          tier: tier,
        },
        trial_period_days: interval === 'monthly' ? 14 : 0,
      },
      metadata: {
        organization_id: organizationId,
      },
    })

    // Log the checkout session creation
    await supabaseClient.from('enhanced_audit_logs').insert({
      action: 'checkout_session_created',
      resource_type: 'subscription',
      resource_id: session.id,
      details: {
        organization_id: organizationId,
        tier,
        interval,
        session_url: session.url,
      },
    })

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Checkout session error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})