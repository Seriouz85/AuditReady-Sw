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

interface InvoiceRequest {
  organizationId: string;
  limit?: number;
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
    const { organizationId, limit = 50 }: InvoiceRequest = await req.json();

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: 'Missing organizationId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching invoices for organization:', organizationId);

    // Get organization's Stripe customer ID
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('organization_id', organizationId)
      .single();

    if (subError || !subscription?.stripe_customer_id) {
      console.error('No Stripe customer found for organization:', organizationId);
      return new Response(
        JSON.stringify({ 
          error: 'No billing setup found for this organization',
          invoices: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: subscription.stripe_customer_id,
      limit: limit,
      expand: ['data.payment_intent'],
    });

    // Transform Stripe invoices to our format
    const transformedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      organization_id: organizationId,
      stripe_invoice_id: invoice.id,
      amount_due: invoice.amount_due / 100, // Convert from cents
      amount_paid: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      status: invoice.status,
      invoice_pdf: invoice.invoice_pdf,
      period_start: new Date(invoice.period_start * 1000).toISOString(),
      period_end: new Date(invoice.period_end * 1000).toISOString(),
      created_at: new Date(invoice.created * 1000).toISOString(),
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
      hosted_invoice_url: invoice.hosted_invoice_url,
      payment_intent_status: invoice.payment_intent?.status || null,
      subscription_id: invoice.subscription,
      customer_email: invoice.customer_email,
      number: invoice.number,
      description: invoice.description,
      lines: invoice.lines.data.map(line => ({
        id: line.id,
        description: line.description,
        amount: line.amount / 100,
        quantity: line.quantity,
        price: line.price ? {
          id: line.price.id,
          unit_amount: line.price.unit_amount ? line.price.unit_amount / 100 : 0,
          currency: line.price.currency,
          nickname: line.price.nickname,
        } : null,
      })),
    }));

    // Update local invoice cache
    if (transformedInvoices.length > 0) {
      const invoiceInserts = transformedInvoices.map(inv => ({
        organization_id: inv.organization_id,
        stripe_invoice_id: inv.stripe_invoice_id,
        amount_due: inv.amount_due,
        amount_paid: inv.amount_paid,
        currency: inv.currency,
        status: inv.status,
        invoice_pdf: inv.invoice_pdf,
        period_start: inv.period_start,
        period_end: inv.period_end,
        due_date: inv.due_date,
        created_at: inv.created_at,
      }));

      // Upsert invoices to local database
      await supabase
        .from('invoices')
        .upsert(invoiceInserts, { 
          onConflict: 'stripe_invoice_id',
          ignoreDuplicates: false 
        });
    }

    console.log(`Fetched ${transformedInvoices.length} invoices for organization ${organizationId}`);

    return new Response(
      JSON.stringify({
        success: true,
        invoices: transformedInvoices,
        total_count: invoices.has_more ? -1 : transformedInvoices.length, // -1 indicates there might be more
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching invoices:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to fetch invoices',
        invoices: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});