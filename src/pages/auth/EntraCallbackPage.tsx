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

      // Exchange code for tokens and get user info via secure edge function
      const authResult = await exchangeCodeForTokens(code);
      
      if (!authResult.success) {
        throw new Error(authResult.message || 'Authentication failed');
      }

      // Set session using tokens from edge function
      if (authResult.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: authResult.session.access_token,
          refresh_token: authResult.session.refresh_token
        });

        if (sessionError) {
          throw new Error('Failed to create user session');
        }
      }

      setAuthState({
        loading: false,
        success: true,
        error: null,
        userInfo: authResult.user
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
    // Use secure server-side token exchange via Supabase Edge Function
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/entra-token-exchange`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.message || errorData.error || 'Token exchange failed');
    }

    return await response.json();
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
                Welcome, {authState.userInfo?.first_name || authState.userInfo?.display_name}!
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