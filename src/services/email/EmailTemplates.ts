export interface EmailTemplateData {
  email: string;
  organizationName: string;
  roleName: string;
  inviterName: string;
  invitationToken: string;
  expiresAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  generateHtml: (data: EmailTemplateData) => string;
  generateText: (data: EmailTemplateData) => string;
}

const getAcceptUrl = (token: string) => `${window.location.origin}/invite/${token}`;
const getExpirationDate = (expiresAt: string) => new Date(expiresAt).toLocaleDateString();

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, corporate design with comprehensive information',
    generateHtml: (data: EmailTemplateData) => {
      const acceptUrl = getAcceptUrl(data.invitationToken);
      const expirationDate = getExpirationDate(data.expiresAt);
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You're invited to join ${data.organizationName}</title>
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
            <p>Join ${data.organizationName} on AuditReady</p>
          </div>
          
          <div class="content">
            <h2>Welcome to the team!</h2>
            <p>Hi there! 👋</p>
            
            <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.organizationName}</strong> on AuditReady, our comprehensive audit readiness and compliance management platform.</p>
            
            <div class="info-card">
              <h3>🏢 Organization Details</h3>
              <p><strong>Organization:</strong> ${data.organizationName}</p>
              <p><strong>Your Role:</strong> <span class="role-badge">${data.roleName}</span></p>
              <p><strong>Invited by:</strong> ${data.inviterName}</p>
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
              This invitation was sent to ${data.email}. If you weren't expecting this invitation, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `;
    },
    generateText: (data: EmailTemplateData) => {
      const acceptUrl = getAcceptUrl(data.invitationToken);
      const expirationDate = getExpirationDate(data.expiresAt);
      
      return `
You're invited to join ${data.organizationName} on AuditReady!

Hi there!

${data.inviterName} has invited you to join ${data.organizationName} on AuditReady, our comprehensive audit readiness and compliance management platform.

Organization Details:
- Organization: ${data.organizationName}
- Your Role: ${data.roleName}
- Invited by: ${data.inviterName}

⏰ IMPORTANT: This invitation expires on ${expirationDate}. Please accept it before then to gain access.

To accept your invitation and get started, visit:
${acceptUrl}

What you'll get access to:
- Compliance Management: ISO 27001, NIS2, CIS Controls, and more
- Assessment Tools: Real-time compliance gap analysis
- Document Generation: Professional PDF reports
- Learning Management: Compliance training and courses
- Risk Management: Comprehensive risk tracking
- Team Collaboration: Real-time collaboration tools

If you have any questions or need assistance, please don't hesitate to reach out to your team administrator or our support team.

Welcome aboard!

Best regards,
The AuditReady Team

---
If you weren't expecting this invitation, you can safely ignore this email.
This invitation was sent to ${data.email}.
      `.trim();
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, clean design with essential information only',
    generateHtml: (data: EmailTemplateData) => {
      const acceptUrl = getAcceptUrl(data.invitationToken);
      const expirationDate = getExpirationDate(data.expiresAt);
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation to ${data.organizationName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 500px; margin: 40px auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; font-size: 14px; color: #6b7280; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>You're Invited</h1>
            <p>Join ${data.organizationName} on AuditReady</p>
          </div>
          
          <p>Hello,</p>
          
          <p>${data.inviterName} has invited you to join ${data.organizationName} as a ${data.roleName}.</p>
          
          <div class="details">
            <p><strong>Organization:</strong> ${data.organizationName}</p>
            <p><strong>Role:</strong> ${data.roleName}</p>
            <p><strong>Expires:</strong> ${expirationDate}</p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" class="button">Accept Invitation</a>
          </p>
          
          <p>This invitation will expire on ${expirationDate}.</p>
          
          <div class="footer">
            <p>If you have any questions, contact ${data.inviterName}</p>
            <p style="font-size: 12px; margin-top: 20px;">
              This invitation was sent to ${data.email}<br>
              If you didn't expect this, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `;
    },
    generateText: (data: EmailTemplateData) => {
      const acceptUrl = getAcceptUrl(data.invitationToken);
      const expirationDate = getExpirationDate(data.expiresAt);
      
      return `
You're invited to join ${data.organizationName}

Hello,

${data.inviterName} has invited you to join ${data.organizationName} as a ${data.roleName}.

Organization: ${data.organizationName}
Role: ${data.roleName}
Expires: ${expirationDate}

Accept your invitation: ${acceptUrl}

This invitation will expire on ${expirationDate}.

If you have any questions, contact ${data.inviterName}.

This invitation was sent to ${data.email}.
If you didn't expect this, you can safely ignore this email.
      `.trim();
    }
  },
  {
    id: 'formal',
    name: 'Formal',
    description: 'Traditional business format with formal tone',
    generateHtml: (data: EmailTemplateData) => {
      const acceptUrl = getAcceptUrl(data.invitationToken);
      const expirationDate = getExpirationDate(data.expiresAt);
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Official Invitation - ${data.organizationName}</title>
          <style>
            body { font-family: Georgia, serif; line-height: 1.8; color: #1f2937; max-width: 650px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
            .letterhead { font-size: 24px; font-weight: bold; color: #374151; margin-bottom: 10px; }
            .subtitle { font-size: 16px; color: #6b7280; }
            .content { margin: 30px 0; }
            .button { display: inline-block; background: #1f2937; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; margin: 25px 0; }
            .details-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
            .details-table td { padding: 12px; border: 1px solid #e5e7eb; }
            .details-table td:first-child { background: #f9fafb; font-weight: 600; }
            .signature { margin-top: 40px; }
            .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="letterhead">AuditReady Platform</div>
            <div class="subtitle">Compliance Management System</div>
          </div>
          
          <div class="content">
            <p>Dear Colleague,</p>
            
            <p>You are hereby formally invited to join <strong>${data.organizationName}</strong> on the AuditReady compliance management platform. This invitation has been extended by ${data.inviterName}.</p>
            
            <table class="details-table">
              <tr>
                <td>Organization</td>
                <td>${data.organizationName}</td>
              </tr>
              <tr>
                <td>Assigned Role</td>
                <td>${data.roleName}</td>
              </tr>
              <tr>
                <td>Invited By</td>
                <td>${data.inviterName}</td>
              </tr>
              <tr>
                <td>Invitation Expires</td>
                <td>${expirationDate}</td>
              </tr>
            </table>
            
            <p>AuditReady is an enterprise-grade compliance management solution designed to streamline audit readiness processes across multiple regulatory frameworks including ISO 27001, NIS2, CIS Controls, and other industry standards.</p>
            
            <p style="text-align: center;">
              <a href="${acceptUrl}" class="button">Accept Official Invitation</a>
            </p>
            
            <p><strong>Please note:</strong> This invitation is time-sensitive and will expire on ${expirationDate}. We recommend accepting this invitation at your earliest convenience to ensure uninterrupted access to your organization's compliance management tools.</p>
            
            <div class="signature">
              <p>Respectfully,</p>
              <p><strong>The AuditReady Administration Team</strong><br>
              Enterprise Compliance Solutions</p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Important:</strong> This is an official invitation sent to ${data.email}. If you have received this invitation in error, please disregard this message.</p>
            
            <p>Alternative Access: If the button above does not function, please copy and paste the following URL into your web browser:</p>
            <p style="word-break: break-all; font-family: monospace; background: #f3f4f6; padding: 10px; border-radius: 4px;">${acceptUrl}</p>
          </div>
        </body>
        </html>
      `;
    },
    generateText: (data: EmailTemplateData) => {
      const acceptUrl = getAcceptUrl(data.invitationToken);
      const expirationDate = getExpirationDate(data.expiresAt);
      
      return `
AUDITREADY PLATFORM
Compliance Management System

Dear Colleague,

You are hereby formally invited to join ${data.organizationName} on the AuditReady compliance management platform. This invitation has been extended by ${data.inviterName}.

INVITATION DETAILS:
Organization: ${data.organizationName}
Assigned Role: ${data.roleName}
Invited By: ${data.inviterName}
Invitation Expires: ${expirationDate}

AuditReady is an enterprise-grade compliance management solution designed to streamline audit readiness processes across multiple regulatory frameworks including ISO 27001, NIS2, CIS Controls, and other industry standards.

To accept this official invitation, please visit:
${acceptUrl}

IMPORTANT: This invitation is time-sensitive and will expire on ${expirationDate}. We recommend accepting this invitation at your earliest convenience to ensure uninterrupted access to your organization's compliance management tools.

Respectfully,
The AuditReady Administration Team
Enterprise Compliance Solutions

---
This is an official invitation sent to ${data.email}. 
If you have received this invitation in error, please disregard this message.
      `.trim();
    }
  }
];

export const getTemplate = (templateId: string): EmailTemplate => {
  return emailTemplates.find(template => template.id === templateId) || emailTemplates[0];
};

export const getTemplateOptions = () => {
  return emailTemplates.map(template => ({
    value: template.id,
    label: template.name,
    description: template.description
  }));
};