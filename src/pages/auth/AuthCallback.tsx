import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage(error.message);
          return;
        }

        if (data.session?.user) {
          const user = data.session.user;
          console.log('✅ User authenticated:', user.email);
          
          // Check if this is a new user from invitation
          const organizationId = user.user_metadata?.organization_id;
          const roleId = user.user_metadata?.role_id;
          
          if (organizationId && roleId) {
            // Add user to organization_users table
            try {
              const { error: orgUserError } = await supabase
                .from('organization_users')
                .insert([{
                  user_id: user.id,
                  organization_id: organizationId,
                  role_id: roleId,
                  status: 'active',
                  joined_at: new Date().toISOString()
                }]);

              if (orgUserError && orgUserError.code !== '23505') { // Ignore duplicate key errors
                console.warn('Could not add user to organization:', orgUserError);
              }

              // Update invitation status
              await supabase
                .from('user_invitations')
                .update({ status: 'accepted' })
                .eq('email', user.email)
                .eq('organization_id', organizationId);

              setStatus('success');
              setMessage(`Welcome to your organization! You've been added as a ${user.user_metadata?.role_name || 'user'}.`);
              
              // Redirect to dashboard after successful setup
              setTimeout(() => {
                navigate('/dashboard');
              }, 2000);
              
            } catch (setupError) {
              console.error('Error setting up user organization:', setupError);
              setStatus('error');
              setMessage('Account created but there was an issue setting up your organization access. Please contact support.');
            }
          } else {
            // Regular login/signup
            setStatus('success');
            setMessage('Successfully authenticated!');
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          }
        } else {
          setStatus('error');
          setMessage('Authentication failed. No user session found.');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during authentication.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="w-6 h-6 animate-spin text-blue-600" />}
            {status === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
            {status === 'error' && <XCircle className="w-6 h-6 text-red-600" />}
            
            {status === 'loading' && 'Processing...'}
            {status === 'success' && 'Welcome!'}
            {status === 'error' && 'Authentication Error'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">{message}</p>
          
          {status === 'success' && (
            <p className="text-sm text-green-600">
              Redirecting to your dashboard...
            </p>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Go to Login
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;