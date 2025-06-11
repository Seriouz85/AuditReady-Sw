import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ConfigRequest {
  keys?: string[];
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
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is platform admin (optional security check)
    const { data: isAdmin } = await supabase
      .from('platform_administrators')
      .select('id')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    // For now, allow any authenticated user to get publishable key
    // In production, you might want to restrict this to admins only

    const config = {
      publishableKey: Deno.env.get('STRIPE_PUBLISHABLE_KEY') || '',
      // Never expose secret key to client
      secretKey: isAdmin ? (Deno.env.get('STRIPE_SECRET_KEY') || '') : null,
      webhookSecret: isAdmin ? (Deno.env.get('STRIPE_WEBHOOK_SECRET') || '') : null,
    };

    // Filter out null values for non-admin users
    const filteredConfig = Object.fromEntries(
      Object.entries(config).filter(([_, value]) => value !== null)
    );

    return new Response(
      JSON.stringify(filteredConfig),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting Stripe config:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to get Stripe configuration',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});