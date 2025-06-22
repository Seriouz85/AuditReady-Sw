import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Loader } from 'lucide-react';
import { useTheme } from 'next-themes';

interface EntraIdLoginButtonProps {
  tenantId?: string;
  clientId?: string;
  redirectUri?: string;
  domainHint?: string;
  onLoginStart?: () => void;
  onLoginComplete?: (user: any) => void;
  onLoginError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const EntraIdLoginButton = ({
  tenantId,
  clientId,
  redirectUri,
  domainHint,
  onLoginStart,
  onLoginComplete,
  onLoginError,
  disabled = false,
  className = ""
}: EntraIdLoginButtonProps) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // In demo mode, show demo notification
    if (!tenantId || !clientId) {
      onLoginError?.('Demo Mode: Enterprise SSO would authenticate here with configured Entra ID');
      return;
    }

    try {
      setIsLoading(true);
      onLoginStart?.();

      // Build authorization URL
      const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`);
      const params = {
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri || window.location.origin + '/auth/callback/entra',
        scope: 'openid profile email User.Read',
        response_mode: 'query',
        state: generateState(),
        ...(domainHint && { domain_hint: domainHint })
      };

      Object.entries(params).forEach(([key, value]) => {
        if (value) authUrl.searchParams.append(key, value);
      });

      // Store state for validation
      sessionStorage.setItem('entra_auth_state', params.state);
      sessionStorage.setItem('entra_auth_timestamp', Date.now().toString());

      // Redirect to Entra ID
      window.location.href = authUrl.toString();

    } catch (error) {
      setIsLoading(false);
      onLoginError?.(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const generateState = (): string => {
    return btoa(JSON.stringify({
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(2)
    }));
  };

  return (
    <Button
      type="button"
      onClick={handleLogin}
      disabled={disabled || isLoading}
      className={`h-12 rounded-full font-semibold shadow-sm border transition-all flex items-center justify-center gap-2 ${
        theme === 'light' 
          ? 'bg-white hover:bg-gray-50 text-gray-700 border-slate-200' 
          : 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-500'
      } ${className}`}
      title="Sign in with Microsoft"
    >
      {isLoading ? (
        <Loader className="w-5 h-5 animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#f25022" d="M1 1h10v10H1z"/>
          <path fill="#00a4ef" d="M13 1h10v10H13z"/>
          <path fill="#7fba00" d="M1 13h10v10H1z"/>
          <path fill="#ffb900" d="M13 13h10v10H13z"/>
        </svg>
      )}
      <span className="text-sm">
        {isLoading ? 'Signing in...' : 'Microsoft'}
      </span>
    </Button>
  );
};

export default EntraIdLoginButton;