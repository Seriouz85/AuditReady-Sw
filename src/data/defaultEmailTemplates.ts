/**
 * Default Email Templates
 * Pre-configured email templates for common notifications
 */

import { EmailTemplate, EmailCategory, EmailPriority, TemplateVariable } from '@/services/email/EmailNotificationService';

export interface DefaultTemplate {
  name: string;
  subject: string;
  html_body: string;
  text_body?: string;
  category: EmailCategory;
  priority: EmailPriority;
  variables: TemplateVariable[];
  metadata: Record<string, any>;
}

export const defaultEmailTemplates: DefaultTemplate[] = [
  // ISO 27001 Assessment Reminder
  {
    name: 'ISO 27001 Assessment Reminder',
    subject: 'Action Required: {{assessmentName}} assessment due in {{daysLeft}} days',
    category: 'assessment',
    priority: 'high',
    variables: [
      { name: 'userName', description: 'User\'s full name', type: 'string', required: true },
      { name: 'organizationName', description: 'Organization name', type: 'string', required: true },
      { name: 'assessmentName', description: 'Name of the assessment', type: 'string', required: true },
      { name: 'daysLeft', description: 'Days until due date', type: 'number', required: true },
      { name: 'dueDate', description: 'Assessment due date', type: 'date', required: true },
      { name: 'completionPercentage', description: 'Current completion percentage', type: 'number', required: true },
      { name: 'assessmentUrl', description: 'Direct link to assessment', type: 'string', required: true }
    ],
    html_body: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ISO 27001 Assessment Reminder</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
        .header p { color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px; border-radius: 8px; }
        .alert-box h2 { color: #92400e; margin: 0 0 10px 0; font-size: 20px; }
        .assessment-details { background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #374151; }
        .detail-value { color: #6b7280; }
        .progress-bar { background: #e2e8f0; height: 8px; border-radius: 4px; margin: 8px 0; }
        .progress-fill { background: linear-gradient(to right, #10b981, #059669); height: 100%; border-radius: 4px; width: {{completionPercentage}}%; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ ISO 27001 Assessment</h1>
            <p>{{organizationName}} Compliance Portal</p>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <h2>⏰ Action Required</h2>
                <p>Your <strong>{{assessmentName}}</strong> assessment is due in <strong>{{daysLeft}} days</strong> and is currently <strong>{{completionPercentage}}% complete</strong>.</p>
            </div>
            
            <p>Hello {{userName}},</p>
            
            <p>Your ISO 27001 compliance assessment is approaching its deadline. Completing this assessment is crucial for maintaining your organization's information security certification and ensuring continuous compliance.</p>
            
            <div class="assessment-details">
                <h3 style="margin-top: 0; color: #374151;">📋 Assessment Overview</h3>
                <div class="detail-row">
                    <span class="detail-label">Assessment:</span>
                    <span class="detail-value">{{assessmentName}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Organization:</span>
                    <span class="detail-value">{{organizationName}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Due Date:</span>
                    <span class="detail-value">{{dueDate}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Days Remaining:</span>
                    <span class="detail-value">{{daysLeft}} days</span>
                </div>
                <div style="margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span class="detail-label">Progress:</span>
                        <span class="detail-value">{{completionPercentage}}% Complete</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            </div>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                <h3 style="color: #065f46; margin: 0 0 10px 0;">🎯 What's Next?</h3>
                <ul style="margin: 0; color: #047857;">
                    <li>Complete remaining assessment questions</li>
                    <li>Upload required evidence documents</li>
                    <li>Review and submit your responses</li>
                    <li>Schedule follow-up activities if needed</li>
                </ul>
            </div>
            
            <p style="text-align: center;">
                <a href="{{assessmentUrl}}" class="cta-button">Continue Assessment →</a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px; padding: 15px; background: #f8fafc; border-radius: 6px;">
                <strong>Need assistance?</strong> Our compliance experts are here to help. Contact support or join our weekly compliance office hours for guidance on ISO 27001 requirements.
            </p>
            
            <p>Best regards,<br>
            <strong>The AuditReady Compliance Team</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>AuditReady</strong> - Your Trusted Compliance Partner</p>
            <p style="font-size: 12px; color: #9ca3af;">ISO 27001 | NIS2 | CIS Controls | GDPR Compliance Management</p>
        </div>
    </div>
</body>
</html>`,
    text_body: `Assessment Reminder - {{assessmentName}}

Hello {{userName}},

Your {{assessmentName}} assessment is due in {{daysLeft}} days ({{dueDate}}).

Please complete your assessment at: {{assessmentUrl}}

Need help? Reply to this email or contact our support team.

Best regards,
The AuditReady Team`,
    metadata: { category: 'assessment', automated: true, triggerDays: [7, 3, 1] }
  },

  // NIS2 Compliance Alert
  {
    name: 'NIS2 Compliance Alert',
    subject: '🚨 NIS2 Directive: New cybersecurity requirements for {{organizationName}}',
    category: 'compliance',
    priority: 'critical',
    variables: [
      { name: 'userName', description: 'User\'s full name', type: 'string', required: true },
      { name: 'organizationName', description: 'Organization name', type: 'string', required: true },
      { name: 'sector', description: 'Organization sector (Essential/Important)', type: 'string', required: true },
      { name: 'complianceDeadline', description: 'NIS2 compliance deadline', type: 'date', required: true },
      { name: 'assessmentUrl', description: 'Link to NIS2 assessment', type: 'string', required: true },
      { name: 'gapAnalysisUrl', description: 'Link to gap analysis report', type: 'string', required: true }
    ],
    html_body: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NIS2 Compliance Alert</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #fef2f2; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
        .header p { color: #fecaca; margin: 10px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .alert-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin-bottom: 30px; border-radius: 8px; }
        .alert-box h2 { color: #991b1b; margin: 0 0 10px 0; font-size: 20px; }
        .directive-details { background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #374151; }
        .detail-value { color: #6b7280; }
        .requirement-list { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 10px 20px 0; }
        .secondary-button { display: inline-block; background: white; color: #dc2626; border: 2px solid #dc2626; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 NIS2 Directive Alert</h1>
            <p>Critical Cybersecurity Compliance Update</p>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <h2>⚠️ Immediate Action Required</h2>
                <p>The EU NIS2 Directive introduces <strong>mandatory cybersecurity requirements</strong> for {{organizationName}} as a <strong>{{sector}} entity</strong>.</p>
            </div>
            
            <p>Dear {{userName}},</p>
            
            <p>The Network and Information Security Directive 2 (NIS2) has entered into force, bringing <strong>enhanced cybersecurity requirements</strong> and <strong>significant penalties</strong> for non-compliance. Your organization must take immediate action to ensure compliance.</p>
            
            <div class="directive-details">
                <h3 style="margin-top: 0; color: #374151;">📋 NIS2 Compliance Overview</h3>
                <div class="detail-row">
                    <span class="detail-label">Organization:</span>
                    <span class="detail-value">{{organizationName}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Entity Type:</span>
                    <span class="detail-value">{{sector}} Entity</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Compliance Deadline:</span>
                    <span class="detail-value">{{complianceDeadline}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Maximum Fine:</span>
                    <span class="detail-value">€10M or 2% of annual turnover</span>
                </div>
            </div>
            
            <div class="requirement-list">
                <h3 style="color: #92400e; margin: 0 0 15px 0;">🎯 Key NIS2 Requirements</h3>
                <ul style="margin: 0; color: #78350f;">
                    <li><strong>Cybersecurity Risk Management:</strong> Comprehensive risk assessment and management measures</li>
                    <li><strong>Incident Reporting:</strong> 24-hour initial reporting, detailed reports within 72 hours</li>
                    <li><strong>Business Continuity:</strong> Crisis management and business continuity planning</li>
                    <li><strong>Supply Chain Security:</strong> Third-party cybersecurity due diligence</li>
                    <li><strong>Vulnerability Management:</strong> Regular security testing and vulnerability handling</li>
                    <li><strong>Governance:</strong> Top management accountability and cybersecurity training</li>
                </ul>
            </div>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                <h3 style="color: #065f46; margin: 0 0 10px 0;">✅ Immediate Next Steps</h3>
                <ol style="margin: 0; color: #047857;">
                    <li><strong>Complete NIS2 Gap Analysis</strong> - Identify current compliance gaps</li>
                    <li><strong>Start Risk Assessment</strong> - Begin comprehensive cybersecurity risk evaluation</li>
                    <li><strong>Review Incident Response Plan</strong> - Ensure 24/72 hour reporting capability</li>
                    <li><strong>Assess Supply Chain</strong> - Evaluate third-party cybersecurity measures</li>
                    <li><strong>Schedule Management Briefing</strong> - Inform leadership of compliance requirements</li>
                </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{assessmentUrl}}" class="cta-button">Start NIS2 Assessment</a>
                <a href="{{gapAnalysisUrl}}" class="secondary-button">Gap Analysis Report</a>
            </div>
            
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; margin: 20px 0;">
                <h3 style="color: #991b1b; margin: 0 0 10px 0;">⚡ Compliance Penalties</h3>
                <p style="color: #7f1d1d; margin: 0; font-size: 14px;">
                    <strong>Essential Entities:</strong> Up to €10M or 2% of annual turnover<br>
                    <strong>Important Entities:</strong> Up to €7M or 1.4% of annual turnover<br>
                    <strong>Personal Liability:</strong> Senior management can be held personally responsible
                </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; padding: 15px; background: #f8fafc; border-radius: 6px;">
                <strong>Expert Support Available:</strong> Our NIS2 compliance specialists are ready to guide you through every step. Schedule a consultation to develop your tailored compliance roadmap.
            </p>
            
            <p>Immediate action is required to ensure compliance and avoid significant penalties.</p>
            
            <p>Best regards,<br>
            <strong>The AuditReady NIS2 Compliance Team</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>AuditReady</strong> - NIS2 Directive Compliance Experts</p>
            <p style="font-size: 12px; color: #9ca3af;">Cybersecurity | Risk Management | Incident Response | Supply Chain Security</p>
        </div>
    </div>
</body>
</html>`,
    text_body: `NIS2 Directive Compliance Alert

Dear {{userName}},

CRITICAL: The EU NIS2 Directive requires immediate action from {{organizationName}} as a {{sector}} entity.

Key Requirements:
- Cybersecurity risk management measures
- 24/72 hour incident reporting
- Business continuity planning  
- Supply chain security assessments
- Vulnerability management
- Top management accountability

Compliance Deadline: {{complianceDeadline}}
Maximum Penalties: €10M or 2% annual turnover

IMMEDIATE ACTIONS:
1. Complete NIS2 assessment: {{assessmentUrl}}
2. Review gap analysis: {{gapAnalysisUrl}}
3. Start risk assessment process
4. Update incident response procedures

Contact our NIS2 experts for immediate assistance.

The AuditReady NIS2 Compliance Team`,
    metadata: { category: 'compliance', automated: false, priority_override: true, directive: 'NIS2' }
  },

  // Compliance Alerts
  {
    name: 'Compliance Alert - Standards Update',
    subject: 'Important: {{standardName}} compliance requirements updated',
    category: 'compliance',
    priority: 'critical',
    variables: [
      { name: 'userName', description: 'User\'s full name', type: 'string', required: true },
      { name: 'standardName', description: 'Name of the compliance standard', type: 'string', required: true },
      { name: 'updateSummary', description: 'Brief summary of updates', type: 'string', required: true },
      { name: 'effectiveDate', description: 'When changes take effect', type: 'date', required: true },
      { name: 'detailsUrl', description: 'Link to detailed information', type: 'string', required: true }
    ],
    html_body: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compliance Alert</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .alert-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin-bottom: 30px; border-radius: 8px; }
        .alert-box h2 { color: #991b1b; margin: 0 0 10px 0; font-size: 20px; }
        .update-details { background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Compliance Alert</h1>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <h2>⚠️ Standards Update Required</h2>
                <p>The <strong>{{standardName}}</strong> compliance standard has been updated and requires your attention.</p>
            </div>
            
            <p>Hello {{userName}},</p>
            
            <p>We want to inform you of important updates to the {{standardName}} compliance requirements that may affect your organization.</p>
            
            <div class="update-details">
                <h3 style="margin-top: 0; color: #374151;">Update Summary</h3>
                <p>{{updateSummary}}</p>
                <p><strong>Effective Date:</strong> {{effectiveDate}}</p>
            </div>
            
            <p style="text-align: center;">
                <a href="{{detailsUrl}}" class="cta-button">View Full Details</a>
            </p>
            
            <p><strong>What you need to do:</strong></p>
            <ul>
                <li>Review the updated requirements</li>
                <li>Update your compliance documentation</li>
                <li>Schedule any necessary assessments</li>
                <li>Train relevant team members</li>
            </ul>
            
            <p>Our compliance experts are available to help you navigate these changes. Contact us if you need assistance.</p>
            
            <p>Best regards,<br>
            The AuditReady Compliance Team</p>
        </div>
        
        <div class="footer">
            <p>AuditReady - Compliance Made Simple</p>
        </div>
    </div>
</body>
</html>`,
    text_body: `Compliance Alert - {{standardName}} Update

Hello {{userName}},

The {{standardName}} compliance standard has been updated:

Update Summary: {{updateSummary}}
Effective Date: {{effectiveDate}}

View full details: {{detailsUrl}}

Actions needed:
- Review updated requirements
- Update compliance documentation  
- Schedule necessary assessments
- Train relevant team members

Contact us if you need assistance.

Best regards,
The AuditReady Compliance Team`,
    metadata: { category: 'compliance', automated: false, priority_override: true }
  },

  // Onboarding Welcome
  {
    name: 'Welcome to AuditReady',
    subject: 'Welcome to AuditReady, {{userName}}! Let\'s get started',
    category: 'onboarding',
    priority: 'high',
    variables: [
      { name: 'userName', description: 'User\'s full name', type: 'string', required: true },
      { name: 'companyName', description: 'Organization name', type: 'string', required: true },
      { name: 'dashboardUrl', description: 'Link to dashboard', type: 'string', required: true },
      { name: 'supportEmail', description: 'Support contact email', type: 'string', required: true }
    ],
    html_body: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AuditReady</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 32px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .welcome-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 30px; border-radius: 8px; text-align: center; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .feature { text-align: center; padding: 20px; border-radius: 12px; background: #f8fafc; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to AuditReady!</h1>
        </div>
        
        <div class="content">
            <div class="welcome-box">
                <h2 style="color: #065f46; margin: 0 0 10px 0;">Hello {{userName}}!</h2>
                <p style="margin: 0; font-size: 18px;">Welcome to {{companyName}}'s compliance management platform.</p>
            </div>
            
            <p>We're excited to help you streamline your compliance processes and stay audit-ready at all times.</p>
            
            <div class="features">
                <div class="feature">
                    <h3>📊 Assessments</h3>
                    <p>Complete compliance assessments for various standards and frameworks.</p>
                </div>
                <div class="feature">
                    <h3>📚 Learning Hub</h3>
                    <p>Access training materials and compliance resources.</p>
                </div>
                <div class="feature">
                    <h3>📈 Dashboard</h3>
                    <p>Track your compliance progress and metrics in real-time.</p>
                </div>
            </div>
            
            <p style="text-align: center;">
                <a href="{{dashboardUrl}}" class="cta-button">Go to Dashboard</a>
            </p>
            
            <p><strong>Quick Start Guide:</strong></p>
            <ol>
                <li><strong>Explore your dashboard</strong> - Get familiar with your compliance overview</li>
                <li><strong>Complete your profile</strong> - Add your role and responsibilities</li>
                <li><strong>Start your first assessment</strong> - Begin with the most relevant compliance framework</li>
                <li><strong>Set up notifications</strong> - Stay informed about due dates and updates</li>
            </ol>
            
            <p>Need help getting started? Our support team is here for you at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
            
            <p>Welcome aboard!<br>
            The AuditReady Team</p>
        </div>
        
        <div class="footer">
            <p>AuditReady - Compliance Made Simple</p>
        </div>
    </div>
</body>
</html>`,
    text_body: `Welcome to AuditReady!

Hello {{userName}},

Welcome to {{companyName}}'s compliance management platform! We're excited to help you streamline your compliance processes.

Quick Start Guide:
1. Explore your dashboard - {{dashboardUrl}}
2. Complete your profile
3. Start your first assessment
4. Set up notifications

Key features:
- Complete compliance assessments
- Access training materials
- Track progress in real-time

Need help? Contact us at {{supportEmail}}

Welcome aboard!
The AuditReady Team`,
    metadata: { category: 'onboarding', sequence: 1, automated: true }
  },

  // Report Ready Notification
  {
    name: 'Report Ready for Download',
    subject: 'Your {{reportType}} report is ready for download',
    category: 'report',
    priority: 'normal',
    variables: [
      { name: 'userName', description: 'User\'s full name', type: 'string', required: true },
      { name: 'reportType', description: 'Type of report generated', type: 'string', required: true },
      { name: 'reportName', description: 'Name of the report', type: 'string', required: true },
      { name: 'downloadUrl', description: 'Direct download link', type: 'string', required: true },
      { name: 'expiryDate', description: 'When download link expires', type: 'date', required: true }
    ],
    html_body: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Ready</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .report-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px; border-radius: 8px; }
        .report-details { background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
        .expiry-notice { background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Report Ready</h1>
        </div>
        
        <div class="content">
            <div class="report-box">
                <h2 style="color: #1e40af; margin: 0 0 10px 0;">Your report has been generated!</h2>
                <p style="margin: 0;">{{reportName}} is ready for download.</p>
            </div>
            
            <p>Hello {{userName}},</p>
            
            <p>Great news! Your requested {{reportType}} report has been successfully generated and is ready for download.</p>
            
            <div class="report-details">
                <h3 style="margin-top: 0; color: #374151;">Report Details</h3>
                <p><strong>Report Type:</strong> {{reportType}}</p>
                <p><strong>Report Name:</strong> {{reportName}}</p>
                <p><strong>Generated:</strong> {{currentDate}}</p>
            </div>
            
            <p style="text-align: center;">
                <a href="{{downloadUrl}}" class="cta-button">Download Report</a>
            </p>
            
            <div class="expiry-notice">
                <p style="margin: 0;"><strong>Note:</strong> This download link will expire on {{expiryDate}}. Please download your report soon.</p>
            </div>
            
            <p>If you have any questions about this report or need a different format, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>
            The AuditReady Team</p>
        </div>
        
        <div class="footer">
            <p>AuditReady - Compliance Made Simple</p>
        </div>
    </div>
</body>
</html>`,
    text_body: `Report Ready - {{reportName}}

Hello {{userName}},

Your {{reportType}} report "{{reportName}}" has been generated and is ready for download.

Download link: {{downloadUrl}}

Please note: This download link expires on {{expiryDate}}.

Questions? Contact our support team.

Best regards,
The AuditReady Team`,
    metadata: { category: 'report', automated: true, expiry_hours: 72 }
  },

  // Team Update Notification
  {
    name: 'Team Update - Weekly Progress',
    subject: 'Weekly compliance update for {{teamName}}',
    category: 'team',
    priority: 'normal',
    variables: [
      { name: 'userName', description: 'User\'s full name', type: 'string', required: true },
      { name: 'teamName', description: 'Team or department name', type: 'string', required: true },
      { name: 'completedAssessments', description: 'Number of completed assessments', type: 'number', required: true },
      { name: 'pendingAssessments', description: 'Number of pending assessments', type: 'number', required: true },
      { name: 'dashboardUrl', description: 'Link to team dashboard', type: 'string', required: true }
    ],
    html_body: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Progress Update</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat-card { text-align: center; padding: 20px; border-radius: 12px; background: #f8fafc; }
        .stat-number { font-size: 32px; font-weight: 700; color: #7c3aed; }
        .stat-label { font-size: 14px; color: #6b7280; font-weight: 500; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👥 Team Progress Update</h1>
        </div>
        
        <div class="content">
            <p>Hello {{userName}},</p>
            
            <p>Here's your weekly compliance progress update for <strong>{{teamName}}</strong>:</p>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">{{completedAssessments}}</div>
                    <div class="stat-label">Completed Assessments</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{{pendingAssessments}}</div>
                    <div class="stat-label">Pending Assessments</div>
                </div>
            </div>
            
            <p style="text-align: center;">
                <a href="{{dashboardUrl}}" class="cta-button">View Team Dashboard</a>
            </p>
            
            <p><strong>This Week's Highlights:</strong></p>
            <ul>
                <li>{{completedAssessments}} assessments completed by the team</li>
                <li>{{pendingAssessments}} assessments still in progress</li>
                <li>All team members are actively engaged in compliance activities</li>
            </ul>
            
            <p>Keep up the excellent work! Consistent compliance efforts help keep our organization secure and audit-ready.</p>
            
            <p>Best regards,<br>
            The AuditReady Team</p>
        </div>
        
        <div class="footer">
            <p>AuditReady - Compliance Made Simple</p>
        </div>
    </div>
</body>
</html>`,
    text_body: `Team Progress Update - {{teamName}}

Hello {{userName}},

Weekly compliance update for {{teamName}}:

Completed Assessments: {{completedAssessments}}
Pending Assessments: {{pendingAssessments}}

View team dashboard: {{dashboardUrl}}

This Week's Highlights:
- {{completedAssessments}} assessments completed
- {{pendingAssessments}} assessments in progress
- All team members actively engaged

Keep up the excellent work!

Best regards,
The AuditReady Team`,
    metadata: { category: 'team', automated: true, frequency: 'weekly' }
  }
];

// Function to seed default templates
export const seedDefaultTemplates = async () => {
  const { emailService } = await import('@/services/email/EmailNotificationService');
  
  try {
    console.log('🌱 Seeding default email templates...');
    
    for (const template of defaultEmailTemplates) {
      try {
        // Check if template already exists
        const existing = await emailService.getTemplate(template.name);
        if (existing) {
          console.log(`✅ Template "${template.name}" already exists, skipping...`);
          continue;
        }
        
        // Create the template
        await emailService.createTemplate({
          ...template,
          is_active: true
        });
        
        console.log(`✅ Created template: "${template.name}"`);
      } catch (error) {
        console.error(`❌ Failed to create template "${template.name}":`, error);
      }
    }
    
    console.log('🎉 Default email templates seeded successfully!');
    return { success: true, count: defaultEmailTemplates.length };
  } catch (error) {
    console.error('❌ Failed to seed default templates:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};