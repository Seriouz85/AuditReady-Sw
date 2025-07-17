import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast';

interface AuthState {
  loading: boolean;
  success: boolean;
  error: string | null;
  userInfo: any | null;
}

export const EntraCallbackPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [authState, setAuthState] = useState<AuthState>({
    loading: true,
    success: false,
    error: null,
    userInfo: null
  });

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get authorization code and state from URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Handle OAuth errors
      if (error) {
        throw new Error(errorDescription || `OAuth error: ${error}`);
      }

      if (!code) {
        throw new Error('Authorization code not found');
      }

      // Validate state parameter
      const storedState = sessionStorage.getItem('entra_auth_state');
      const storedTimestamp = sessionStorage.getItem('entra_auth_timestamp');
      
      if (!storedState || state !== storedState) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      // Check timestamp (max 10 minutes)
      if (!storedTimestamp || Date.now() - parseInt(storedTimestamp) > 600000) {
        throw new Error('Authentication session expired');
      }

      // Clean up stored state
      sessionStorage.removeItem('entra_auth_state');
      sessionStorage.removeItem('entra_auth_timestamp');

      // Exchange code for tokens
      const tokenData = await exchangeCodeForTokens(code);
      
      // Get user info from Microsoft Graph
      const userInfo = await getUserInfo(tokenData.access_token);
      
      // Check if user exists in our system
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('user_id, is_active')
        .eq('email', userInfo.mail || userInfo.userPrincipalName)
        .single();

      if (existingUser) {
        if (!existingUser.is_active) {
          throw new Error('Your account has been disabled. Please contact your administrator.');
        }

        // Sign in existing user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userInfo.mail || userInfo.userPrincipalName,
          password: 'entra-sso-user' // Placeholder for SSO users
        });

        if (signInError) {
          // Create session manually for SSO users
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: generateJWT(existingUser.user_id),
            refresh_token: generateRefreshToken()
          });

          if (sessionError) {
            throw new Error('Failed to create user session');
          }
        }
      } else {
        // Auto-provision new user if enabled
        const { data: orgSettings } = await supabase
          .from('organization_settings')
          .select('entra_auto_provision, entra_default_role')
          .single();

        if (!orgSettings?.entra_auto_provision) {
          throw new Error('Your account is not authorized. Please contact your administrator for access.');
        }

        // Create new user
        await provisionNewUser(userInfo, orgSettings.entra_default_role || 'viewer');
      }

      setAuthState({
        loading: false,
        success: true,
        error: null,
        userInfo
      });

      // Redirect to dashboard after success
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Entra ID authentication error:', error);
      setAuthState({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        userInfo: null
      });
    }
  };

  const exchangeCodeForTokens = async (code: string) => {
    // SECURITY: Client secret should NEVER be in frontend code
    // This token exchange must be handled by a backend service/edge function
    console.error('Security violation: Token exchange attempted in frontend');
    throw new Error('Token exchange must be handled server-side for security');
    
    // TODO: Implement server-side token exchange endpoint
    // const response = await fetch('/api/auth/entra/exchange', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ code })
    // });

    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: 'openid profile email User.Read'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    return await response.json();
  };

  const getUserInfo = async (accessToken: string) => {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user info: ${error}`);
    }

    return await response.json();
  };

  const provisionNewUser = async (userInfo: any, defaultRole: string) => {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userInfo.mail || userInfo.userPrincipalName,
      email_confirm: true,
      user_metadata: {
        first_name: userInfo.givenName,
        last_name: userInfo.surname,
        entra_id: userInfo.id,
        provisioned_from: 'entra_id'
      }
    });

    if (authError || !authUser.user) {
      throw new Error('Failed to create user account');
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authUser.user.id,
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
      throw new Error('Failed to create user profile');
    }

    // Assign default role
    const { data: role } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', defaultRole)
      .single();

    if (role) {
      await supabase
        .from('user_role_assignments')
        .insert({
          user_id: authUser.user.id,
          role_id: role.id,
          assigned_at: new Date().toISOString()
        });
    }
  };

  const generateJWT = (userId: string): string => {
    // In production, this should be generated server-side
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    }));
    return `${header}.${payload}.signature`;
  };

  const generateRefreshToken = (): string => {
    return btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
  };

  const handleRetry = () => {
    navigate('/login');
  };

  if (authState.loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'light' ? 'bg-slate-100' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
        <Card className={`w-full max-w-md p-8 text-center ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`}>
          <CardContent className="space-y-6">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
              <Loader className={`h-8 w-8 animate-spin ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Authenticating...
              </h1>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Verifying your Microsoft credentials and setting up your account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authState.success) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'light' ? 'bg-slate-100' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
        <Card className={`w-full max-w-md p-8 text-center ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`}>
          <CardContent className="space-y-6">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-green-100' : 'bg-green-900/30'}`}>
              <CheckCircle className={`h-8 w-8 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Welcome, {authState.userInfo?.givenName}!
              </h1>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Authentication successful. Redirecting to your dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'light' ? 'bg-slate-100' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
      <Card className={`w-full max-w-md p-8 text-center ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`}>
        <CardContent className="space-y-6">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-red-100' : 'bg-red-900/30'}`}>
            <AlertCircle className={`h-8 w-8 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              Authentication Failed
            </h1>
            <p className={`mb-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
              {authState.error}
            </p>
            <Button 
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntraCallbackPage;