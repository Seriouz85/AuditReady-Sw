import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface TokenExchangeRequest {
  code: string;
  state?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope: string;
}

interface UserInfo {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
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

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Get environment variables
    const tenantId = Deno.env.get('ENTRA_TENANT_ID');
    const clientId = Deno.env.get('ENTRA_CLIENT_ID');
    const clientSecret = Deno.env.get('ENTRA_CLIENT_SECRET');
    const redirectUri = Deno.env.get('ENTRA_REDIRECT_URI');

    if (!tenantId || !clientId || !clientSecret || !redirectUri) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { code, state }: TokenExchangeRequest = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Authorization code is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Exchange authorization code for tokens
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    
    const tokenRequestBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: 'openid profile email User.Read'
    });

    console.log('Exchanging authorization code for tokens...');
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenRequestBody.toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Token exchange failed',
          details: tokenResponse.status === 400 ? 'Invalid authorization code' : 'Authentication service error'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const tokenData: TokenResponse = await tokenResponse.json();

    // Get user information from Microsoft Graph
    console.log('Fetching user information from Microsoft Graph...');
    const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!graphResponse.ok) {
      const errorText = await graphResponse.text();
      console.error('Failed to get user info from Graph:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve user information' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userInfo: UserInfo = await graphResponse.json();

    // Check if user exists in our system
    const { data: existingUser, error: userLookupError } = await supabase
      .from('user_profiles')
      .select('user_id, is_active, first_name, last_name')
      .eq('email', userInfo.mail || userInfo.userPrincipalName)
      .single();

    if (userLookupError && userLookupError.code !== 'PGRST116') {
      console.error('Database error during user lookup:', userLookupError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let userId: string;

    if (existingUser) {
      // Check if user is active
      if (!existingUser.is_active) {
        return new Response(
          JSON.stringify({ 
            error: 'Account disabled',
            message: 'Your account has been disabled. Please contact your administrator.'
          }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      userId = existingUser.user_id;
      console.log('Existing user found:', existingUser.user_id);

    } else {
      // Check if auto-provisioning is enabled
      const { data: orgSettings, error: settingsError } = await supabase
        .from('organization_settings')
        .select('entra_auto_provision, entra_default_role')
        .single();

      if (settingsError || !orgSettings?.entra_auto_provision) {
        return new Response(
          JSON.stringify({ 
            error: 'Unauthorized',
            message: 'Your account is not authorized. Please contact your administrator for access.'
          }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Auto-provision new user
      console.log('Auto-provisioning new user:', userInfo.mail || userInfo.userPrincipalName);
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userInfo.mail || userInfo.userPrincipalName,
        email_confirm: true,
        user_metadata: {
          first_name: userInfo.givenName,
          last_name: userInfo.surname,
          entra_id: userInfo.id,
          provisioned_from: 'entra_id'
        }
      });

      if (createError || !newUser.user) {
        console.error('Failed to create user:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user account' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      userId = newUser.user.id;

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          first_name: userInfo.givenName,
          last_name: userInfo.surname,
          email: userInfo.mail || userInfo.userPrincipalName,
          job_title: userInfo.jobTitle,
          department: userInfo.department,
          entra_id: userInfo.id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Failed to create user profile:', profileError);
        // Continue anyway - profile can be created later
      }

      // Assign default role
      const defaultRole = orgSettings.entra_default_role || 'viewer';
      const { data: role } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', defaultRole)
        .single();

      if (role) {
        await supabase
          .from('user_role_assignments')
          .insert({
            user_id: userId,
            role_id: role.id,
            assigned_at: new Date().toISOString()
          });
      }
    }

    // Generate Supabase session tokens
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userInfo.mail || userInfo.userPrincipalName,
      options: {
        redirectTo: `${Deno.env.get('SITE_URL')}/app/dashboard`
      }
    });

    if (sessionError || !sessionData) {
      console.error('Failed to generate session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return success response with session data
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: userInfo.mail || userInfo.userPrincipalName,
          first_name: userInfo.givenName,
          last_name: userInfo.surname,
          display_name: userInfo.displayName
        },
        session: {
          access_token: sessionData.properties?.access_token,
          refresh_token: sessionData.properties?.refresh_token,
          expires_in: sessionData.properties?.expires_in || 3600
        },
        redirect_url: sessionData.properties?.action_link
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in token exchange:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred during authentication'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});