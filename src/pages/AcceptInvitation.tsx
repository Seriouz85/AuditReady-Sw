import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Mail, User, Building } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

interface InvitationData {
  id: string;
  email: string;
  organization_id: string;
  role_id: string;
  invited_by: string;
  expires_at: string;
  status: string;
  organization: {
    name: string;
  };
  role: {
    display_name: string;
    description: string;
  };
  inviter: {
    user_metadata: {
      first_name?: string;
      last_name?: string;
    };
    email: string;
  };
}

const AcceptInvitation = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (token) {
      validateInvitation(token);
    }
  }, [token]);

  const validateInvitation = async (invitationToken: string) => {
    try {
      setLoading(true);
      
      // Check if invitation exists and is valid
      const { data: invitation, error } = await supabase
        .from('user_invitations')
        .select(`
          *,
          organization:organizations!inner(name),
          role:user_roles!inner(display_name, description),
          inviter:organization_users!invited_by(
            users!inner(email, user_metadata)
          )
        `)
        .eq('token', invitationToken)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !invitation) {
        setError('This invitation link is invalid or has expired.');
        return;
      }

      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(invitation.email);
      
      if (existingUser?.user) {
        setError('A user with this email already exists. Please log in instead.');
        return;
      }

      setInvitationData(invitation as InvitationData);
    } catch (err) {
      console.error('Error validating invitation:', err);
      setError('Failed to validate invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitationData) return;
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    try {
      setAccepting(true);

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitationData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            invited_via_token: token
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Add user to organization
      const { error: orgUserError } = await supabase
        .from('organization_users')
        .insert({
          organization_id: invitationData.organization_id,
          user_id: authData.user.id,
          role_id: invitationData.role_id,
          status: 'active',
          invited_by: invitationData.invited_by,
          invited_at: invitationData.created_at,
          joined_at: new Date().toISOString()
        });

      if (orgUserError) {
        throw orgUserError;
      }

      // Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from('user_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('token', token);

      if (inviteError) {
        console.error('Failed to update invitation status:', inviteError);
        // Don't throw here as the user is already created
      }

      toast({
        title: "Welcome to AuditReady!",
        description: "Your account has been created successfully. You can now access your organization's compliance dashboard.",
      });

      // Redirect to login or dashboard
      navigate('/login', { 
        state: { 
          message: 'Account created successfully. Please log in.',
          email: invitationData.email
        }
      });

    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      toast({
        title: "Failed to accept invitation",
        description: err.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Validating invitation...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle>Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button onClick={() => navigate('/login')} variant="outline">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitationData) {
    return null;
  }

  const inviterName = invitationData.inviter?.user_metadata?.first_name 
    ? `${invitationData.inviter.user_metadata.first_name} ${invitationData.inviter.user_metadata.last_name || ''}`.trim()
    : invitationData.inviter?.email || 'Someone';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <CardTitle className="text-2xl">You're Invited!</CardTitle>
          <CardDescription>
            Complete your account setup to join your organization
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Invitation Details */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center mb-2">
              <Building className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">{invitationData.organization.name}</span>
            </div>
            <div className="flex items-center mb-2">
              <User className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-blue-700">{invitationData.role.display_name}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-blue-700">{invitationData.email}</span>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              Invited by {inviterName}
            </p>
          </div>

          {/* Account Creation Form */}
          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a secure password"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Accept Invitation & Create Account'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Sign in instead
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;