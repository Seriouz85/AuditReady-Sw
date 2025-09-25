import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Mail, 
  Copy, 
  ExternalLink,
  User,
  Shield,
  Calendar
} from 'lucide-react';

interface InvitationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationData: {
    email: string;
    organizationName: string;
    roleName: string;
    invitationToken?: string;
    expiresAt?: string;
  };
}

export const InvitationSuccessModal: React.FC<InvitationSuccessModalProps> = ({
  isOpen,
  onClose,
  invitationData
}) => {
  const invitationUrl = `${window.location.origin}/auth/accept-invitation?token=${invitationData.invitationToken || 'demo-token'}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    console.log('Copied to clipboard:', text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby="invitation-success-description">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <DialogTitle>Invitation Created Successfully!</DialogTitle>
          </div>
          <DialogDescription id="invitation-success-description">
            The invitation has been created. In development mode, emails are logged to console.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success Message */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">Invitation Created</h3>
                  <p className="text-sm text-green-700 mt-1">
                    An invitation has been created for <strong>{invitationData.email}</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invitation Details */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Invitation Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Email
                  </span>
                  <span className="font-medium">{invitationData.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </span>
                  <Badge variant="secondary">{invitationData.roleName}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Expires
                  </span>
                  <span className="text-sm">
                    {invitationData.expiresAt 
                      ? new Date(invitationData.expiresAt).toLocaleDateString()
                      : 'In 7 days'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Development Mode Notice */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-amber-900 mb-2">📧 Development Mode</h3>
              <p className="text-sm text-amber-700">
                In development mode, emails are not actually sent. Instead, the invitation details 
                are logged to the browser console. Check the console to see the email content.
              </p>
              <div className="mt-3">
                <p className="text-sm font-medium text-amber-900 mb-2">Invitation URL:</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={invitationUrl}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-amber-300 rounded-md font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(invitationUrl)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                console.log('📧 Invitation Details:', invitationData);
                console.log('🔗 Invitation URL:', invitationUrl);
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Log to Console
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};