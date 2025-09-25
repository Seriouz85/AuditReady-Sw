import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Eye, 
  Send, 
  Calendar,
  Building,
  User,
  Shield,
  ExternalLink,
  Palette
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getTemplate, getTemplateOptions, type EmailTemplateData } from '@/services/email/EmailTemplates';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
  invitationData: {
    email: string;
    organizationName: string;
    roleName: string;
    inviterName: string;
    invitationToken: string;
    expiresAt: string;
  };
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  onSend,
  invitationData
}) => {
  const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html');
  const [selectedTemplate, setSelectedTemplate] = useState('professional');

  const acceptUrl = `${window.location.origin}/auth/accept-invitation?token=${invitationData.invitationToken}`;
  const expirationDate = new Date(invitationData.expiresAt).toLocaleDateString();

  // Generate content using selected template
  const template = getTemplate(selectedTemplate);
  const templateData: EmailTemplateData = {
    email: invitationData.email,
    organizationName: invitationData.organizationName,
    roleName: invitationData.roleName,
    inviterName: invitationData.inviterName,
    invitationToken: invitationData.invitationToken,
    expiresAt: invitationData.expiresAt
  };
  
  const htmlContent = template.generateHtml(templateData);
  const textContent = template.generateText(templateData);

  // Legacy static content (keeping for reference)
  const staticHtmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're invited to join ${invitationData.organizationName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e1e5e9; border-top: none; }
        .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .info-card { background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .role-badge { background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 You're Invited!</h1>
        <p>Join ${invitationData.organizationName} on AuditReady</p>
      </div>
      
      <div class="content">
        <h2>Welcome to the team!</h2>
        <p>Hi there! 👋</p>
        
        <p><strong>${invitationData.inviterName}</strong> has invited you to join <strong>${invitationData.organizationName}</strong> on AuditReady, our comprehensive audit readiness and compliance management platform.</p>
        
        <div class="info-card">
          <h3>🏢 Organization Details</h3>
          <p><strong>Organization:</strong> ${invitationData.organizationName}</p>
          <p><strong>Your Role:</strong> <span class="role-badge">${invitationData.roleName}</span></p>
          <p><strong>Invited by:</strong> ${invitationData.inviterName}</p>
        </div>
        
        <div class="warning">
          <strong>⏰ Time Sensitive:</strong> This invitation expires on <strong>${expirationDate}</strong>. Please accept it before then to gain access.
        </div>
        
        <p style="text-align: center;">
          <a href="${acceptUrl}" class="button">Accept Invitation & Get Started</a>
        </p>
        
        <h3>🚀 What you'll get access to:</h3>
        <ul>
          <li><strong>Compliance Management:</strong> ISO 27001, NIS2, CIS Controls, and more</li>
          <li><strong>Assessment Tools:</strong> Real-time compliance gap analysis</li>
          <li><strong>Document Generation:</strong> Professional PDF reports</li>
          <li><strong>Learning Management:</strong> Compliance training and courses</li>
          <li><strong>Risk Management:</strong> Comprehensive risk tracking</li>
          <li><strong>Team Collaboration:</strong> Real-time collaboration tools</li>
        </ul>
        
        <p>If you have any questions or need assistance, please don't hesitate to reach out to your team administrator or our support team.</p>
        
        <p>Welcome aboard! 🎯</p>
        
        <p>Best regards,<br>
        The AuditReady Team</p>
      </div>
      
      <div class="footer">
        <p style="color: #6b7280; font-size: 14px;">
          If you're having trouble with the button above, copy and paste this link into your browser:<br>
          <a href="${acceptUrl}" style="color: #3b82f6; word-break: break-all;">${acceptUrl}</a>
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
          This invitation was sent to ${invitationData.email}. If you weren't expecting this invitation, you can safely ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Email Invitation Preview
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {invitationData.email}
              </Badge>
            </div>
          </div>
          <DialogDescription>
            Preview the invitation email before sending to {invitationData.email} for {invitationData.organizationName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Email Header Info */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Email Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">To:</span>
                  <span className="truncate">{invitationData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Org:</span>
                  <span className="truncate">{invitationData.organizationName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Role:</span>
                  <span className="truncate">{invitationData.roleName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Expires:</span>
                  <span className="truncate">{expirationDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Selection and Preview Mode Toggle */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {/* Template Selector */}
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="template-select" className="text-sm font-medium">Template:</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-[180px]" id="template-select">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {getTemplateOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            {/* Preview Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={previewMode === 'html' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('html')}
              >
                HTML Preview
              </Button>
              <Button
                variant={previewMode === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('text')}
              >
                Text Preview
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`data:text/html,${encodeURIComponent(htmlContent)}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open in New Tab
            </Button>
          </div>

          {/* Email Preview */}
          <div className="flex-1 border rounded-lg overflow-hidden">
            {previewMode === 'html' ? (
              <iframe
                srcDoc={htmlContent}
                className="w-full h-full border-0"
                title="Email HTML Preview"
              />
            ) : (
              <div className="h-full overflow-auto p-4 bg-gray-50 font-mono text-sm whitespace-pre-wrap">
                {textContent}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Preview your invitation email before sending
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSend} className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send Invitation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};