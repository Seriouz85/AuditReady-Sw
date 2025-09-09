-- ============================================================================
-- EMAIL NOTIFICATION SYSTEM - Database Schema
-- Apply this migration in your Supabase SQL Editor
-- ============================================================================

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'system',
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    priority VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'
);

-- Email Notifications Table  
CREATE TABLE IF NOT EXISTS email_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES email_templates(id),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    provider VARCHAR(50) DEFAULT 'supabase',
    provider_message_id VARCHAR(255),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    template_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Queue Table
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_id UUID REFERENCES email_notifications(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 2,
    attempts INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    locked_at TIMESTAMP WITH TIME ZONE,
    locked_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Preferences Table
CREATE TABLE IF NOT EXISTS email_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    organization_id UUID REFERENCES organizations(id),
    assessment_reminders BOOLEAN DEFAULT true,
    compliance_alerts BOOLEAN DEFAULT true,
    report_ready BOOLEAN DEFAULT true,
    team_updates BOOLEAN DEFAULT true,
    onboarding_emails BOOLEAN DEFAULT true,
    weekly_digest BOOLEAN DEFAULT false,
    frequency VARCHAR(20) DEFAULT 'realtime',
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone VARCHAR(50) DEFAULT 'UTC',
    unsubscribed_all BOOLEAN DEFAULT false,
    unsubscribe_token VARCHAR(255) UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Analytics Table
CREATE TABLE IF NOT EXISTS email_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    template_id UUID REFERENCES email_templates(id),
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    avg_send_time_ms INTEGER,
    open_rate DECIMAL(5,2) DEFAULT 0,
    click_rate DECIMAL(5,2) DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, organization_id, template_id)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_recipient ON email_notifications(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_notifications_org ON email_notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON email_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_next_retry ON email_queue(next_retry_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority);
CREATE INDEX IF NOT EXISTS idx_email_analytics_date ON email_analytics(date);
CREATE INDEX IF NOT EXISTS idx_email_analytics_org ON email_analytics(organization_id);

-- RLS Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;  
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;

-- Email Templates Policies
CREATE POLICY "Allow authenticated users to view email templates" ON email_templates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow platform admins to manage email templates" ON email_templates
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('platform_admin', 'admin')
        )
    );

-- Email Notifications Policies  
CREATE POLICY "Allow users to view their own notifications" ON email_notifications
    FOR SELECT TO authenticated USING (
        recipient_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('platform_admin', 'admin')
        )
    );

CREATE POLICY "Allow platform admins to manage all notifications" ON email_notifications
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('platform_admin', 'admin')
        )
    );

-- Email Queue Policies
CREATE POLICY "Allow platform admins to manage email queue" ON email_queue
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('platform_admin', 'admin')
        )
    );

-- Email Preferences Policies
CREATE POLICY "Allow users to manage their own preferences" ON email_preferences
    FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Allow platform admins to view all preferences" ON email_preferences
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('platform_admin', 'admin')
        )
    );

-- Email Analytics Policies
CREATE POLICY "Allow platform admins to view analytics" ON email_analytics
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('platform_admin', 'admin')
        )
    );

-- Updated At Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_preferences_updated_at BEFORE UPDATE ON email_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_analytics_updated_at BEFORE UPDATE ON email_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Default Email Templates
INSERT INTO email_templates (name, subject, html_body, text_body, category, variables, priority, metadata) VALUES 
('ISO 27001 Assessment Reminder', 
'📋 Reminder: ISO 27001 Assessment Due {{dueDate}}', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 8px 8px; }
        .progress { background: #f8f9fa; border-radius: 4px; padding: 15px; margin: 20px 0; }
        .progress-bar { background: #28a745; height: 8px; border-radius: 4px; }
        .cta { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 ISO 27001 Assessment Due Soon</h1>
        </div>
        <div class="content">
            <p>Hello {{userName}},</p>
            
            <p>This is a friendly reminder that your <strong>ISO 27001 Information Security Assessment</strong> is due on <strong>{{dueDate}}</strong>.</p>
            
            <div class="progress">
                <h3>Current Progress</h3>
                <div class="progress-bar" style="width: {{progressPercentage}}%"></div>
                <p><strong>{{completedControls}}</strong> of <strong>{{totalControls}}</strong> controls completed ({{progressPercentage}}%)</p>
            </div>
            
            <p><strong>Remaining Tasks:</strong></p>
            <ul>
                <li>Review and update risk assessments</li>
                <li>Complete security control implementation evidence</li>
                <li>Submit management review documentation</li>
                <li>Verify business continuity procedures</li>
            </ul>
            
            <p>Your assessment coordinator <strong>{{coordinatorName}}</strong> is available to assist with any questions.</p>
            
            <a href="{{assessmentUrl}}" class="cta">Continue Assessment →</a>
            
            <p style="color: #dc3545; font-weight: 500;">⏰ Time remaining: {{timeRemaining}}</p>
        </div>
        <div class="footer">
            <p>AuditReady - Your Compliance Management Platform</p>
        </div>
    </div>
</body>
</html>', 
'ISO 27001 Assessment Reminder

Hello {{userName}},

Your ISO 27001 Information Security Assessment is due on {{dueDate}}.

Progress: {{completedControls}} of {{totalControls}} controls completed ({{progressPercentage}}%)

Continue Assessment: {{assessmentUrl}}

Time remaining: {{timeRemaining}}

Best regards,
AuditReady Team', 
'assessment', 
'[{"name": "userName", "description": "Name of the user", "type": "string", "required": true}, {"name": "dueDate", "description": "Assessment due date", "type": "date", "required": true}, {"name": "progressPercentage", "description": "Completion percentage", "type": "number", "required": true}, {"name": "completedControls", "description": "Number of completed controls", "type": "number", "required": true}, {"name": "totalControls", "description": "Total number of controls", "type": "number", "required": true}, {"name": "coordinatorName", "description": "Name of assessment coordinator", "type": "string", "required": true}, {"name": "assessmentUrl", "description": "Link to continue assessment", "type": "string", "required": true}, {"name": "timeRemaining", "description": "Time remaining until due date", "type": "string", "required": true}]'::jsonb, 
'high', 
'{"category": "compliance", "framework": "ISO 27001"}'::jsonb),

('NIS2 Compliance Alert', 
'🚨 Critical: NIS2 Directive Compliance Alert', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 8px 8px; }
        .alert { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 4px; padding: 15px; margin: 20px 0; color: #c53030; }
        .cta { background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 NIS2 Compliance Alert</h1>
        </div>
        <div class="content">
            <p>Hello {{userName}},</p>
            
            <div class="alert">
                <strong>⚠️ Critical Compliance Update Required</strong><br>
                New NIS2 Directive requirements have been identified that require immediate attention.
            </div>
            
            <p><strong>Alert Details:</strong></p>
            <ul>
                <li><strong>Type:</strong> {{alertType}}</li>
                <li><strong>Severity:</strong> {{severity}}</li>
                <li><strong>Deadline:</strong> {{deadline}}</li>
                <li><strong>Affected Systems:</strong> {{affectedSystems}}</li>
            </ul>
            
            <p><strong>Required Actions:</strong></p>
            <ol>
                <li>Review updated compliance requirements</li>
                <li>Update security incident response procedures</li>
                <li>Implement enhanced monitoring controls</li>
                <li>Submit compliance documentation</li>
            </ol>
            
            <p>For organizations classified as essential or important entities under NIS2, compliance is mandatory and non-compliance may result in significant penalties.</p>
            
            <a href="{{complianceUrl}}" class="cta">Review Requirements →</a>
            
            <p><strong>Need Help?</strong> Contact our compliance team at <a href="mailto:compliance@auditready.com">compliance@auditready.com</a></p>
        </div>
        <div class="footer">
            <p>AuditReady - Your Compliance Management Platform</p>
        </div>
    </div>
</body>
</html>', 
'NIS2 Compliance Alert

Hello {{userName}},

CRITICAL: New NIS2 Directive requirements require immediate attention.

Alert Details:
- Type: {{alertType}}
- Severity: {{severity}}
- Deadline: {{deadline}}
- Affected Systems: {{affectedSystems}}

Required Actions:
1. Review updated compliance requirements
2. Update security incident response procedures  
3. Implement enhanced monitoring controls
4. Submit compliance documentation

Review Requirements: {{complianceUrl}}

Contact: compliance@auditready.com

AuditReady Team', 
'compliance', 
'[{"name": "userName", "description": "Name of the user", "type": "string", "required": true}, {"name": "alertType", "description": "Type of compliance alert", "type": "string", "required": true}, {"name": "severity", "description": "Alert severity level", "type": "string", "required": true}, {"name": "deadline", "description": "Compliance deadline", "type": "date", "required": true}, {"name": "affectedSystems", "description": "Systems affected by the alert", "type": "string", "required": true}, {"name": "complianceUrl", "description": "Link to compliance requirements", "type": "string", "required": true}]'::jsonb, 
'critical', 
'{"category": "compliance", "framework": "NIS2"}'::jsonb),

('Welcome to AuditReady', 
'🎉 Welcome to AuditReady - Your Compliance Journey Starts Here!', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 8px 8px; }
        .feature { background: #f8f9fa; border-radius: 4px; padding: 15px; margin: 15px 0; }
        .cta { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to AuditReady!</h1>
        </div>
        <div class="content">
            <p>Hello {{userName}},</p>
            
            <p>Welcome to <strong>AuditReady</strong> - your comprehensive compliance management platform! We''re excited to help you streamline your audit readiness and compliance processes.</p>
            
            <h3>🚀 Get Started with These Key Features:</h3>
            
            <div class="feature">
                <h4>📋 Assessment Management</h4>
                <p>Create, manage, and track compliance assessments across multiple frameworks including ISO 27001, NIS2, CIS Controls, and more.</p>
            </div>
            
            <div class="feature">
                <h4>📊 Real-time Dashboard</h4>
                <p>Monitor your compliance posture with interactive dashboards showing progress, gaps, and key metrics.</p>
            </div>
            
            <div class="feature">
                <h4>📚 Learning Management</h4>
                <p>Access comprehensive training courses and certification paths to build your team''s compliance knowledge.</p>
            </div>
            
            <div class="feature">
                <h4>📄 Document Generation</h4>
                <p>Generate professional compliance reports, policies, and documentation with one click.</p>
            </div>
            
            <h3>🏁 Quick Start Guide:</h3>
            <ol>
                <li>Complete your organization profile</li>
                <li>Select your compliance frameworks</li>
                <li>Invite team members</li>
                <li>Start your first assessment</li>
            </ol>
            
            <a href="{{onboardingUrl}}" class="cta">Start Onboarding →</a>
            
            <p><strong>Need help getting started?</strong> Our support team is here to help:</p>
            <ul>
                <li>📧 Email: <a href="mailto:support@auditready.com">support@auditready.com</a></li>
                <li>📞 Phone: {{supportPhone}}</li>
                <li>💬 Live Chat: Available in the platform</li>
            </ul>
        </div>
        <div class="footer">
            <p>AuditReady - Your Compliance Management Platform</p>
        </div>
    </div>
</body>
</html>', 
'Welcome to AuditReady!

Hello {{userName}},

Welcome to AuditReady - your comprehensive compliance management platform!

Key Features:
📋 Assessment Management - Multiple compliance frameworks
📊 Real-time Dashboard - Monitor compliance posture  
📚 Learning Management - Training and certification
📄 Document Generation - Professional reports and policies

Quick Start:
1. Complete organization profile
2. Select compliance frameworks
3. Invite team members  
4. Start first assessment

Get Started: {{onboardingUrl}}

Need Help?
Email: support@auditready.com
Phone: {{supportPhone}}
Live Chat: Available in platform

Welcome aboard!
AuditReady Team', 
'onboarding', 
'[{"name": "userName", "description": "Name of the user", "type": "string", "required": true}, {"name": "onboardingUrl", "description": "Link to onboarding process", "type": "string", "required": true}, {"name": "supportPhone", "description": "Support phone number", "type": "string", "required": false}]'::jsonb, 
'normal', 
'{"category": "onboarding", "type": "welcome"}'::jsonb);