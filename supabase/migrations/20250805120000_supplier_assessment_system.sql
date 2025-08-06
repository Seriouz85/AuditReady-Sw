-- Supplier Assessment System Migration
-- This migration creates the database schema for the enhanced supplier assessment workflow

-- Enable RLS
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Supplier Assessment Campaigns
CREATE TABLE IF NOT EXISTS supplier_assessment_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'in_progress', 'completed', 'expired', 'cancelled')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    sent_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Risk scoring
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level VARCHAR(20) DEFAULT 'unknown' CHECK (risk_level IN ('low', 'medium', 'high', 'critical', 'unknown')),
    last_calculated_at TIMESTAMP WITH TIME ZONE,
    
    -- Assessment settings
    allow_delegation BOOLEAN DEFAULT true,
    require_evidence BOOLEAN DEFAULT false,
    send_reminders BOOLEAN DEFAULT true,
    reminder_frequency_days INTEGER DEFAULT 7,
    
    UNIQUE(organization_id, supplier_id, name)
);

-- Standards included in assessment campaigns
CREATE TABLE IF NOT EXISTS supplier_assessment_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES supplier_assessment_campaigns(id) ON DELETE CASCADE,
    standard_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(campaign_id, standard_id)
);

-- Requirements included in assessment campaigns
CREATE TABLE IF NOT EXISTS supplier_assessment_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES supplier_assessment_campaigns(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    standard_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT true,
    weight DECIMAL(3,2) DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 10),
    custom_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(campaign_id, requirement_id)
);

-- External supplier users (isolated from main users table)
CREATE TABLE IF NOT EXISTS supplier_external_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES supplier_assessment_campaigns(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    phone VARCHAR(50),
    
    -- Authentication
    invite_token VARCHAR(255) UNIQUE,
    invite_sent_at TIMESTAMP WITH TIME ZONE,
    invite_accepted_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    -- Role within supplier organization
    role VARCHAR(50) DEFAULT 'contributor' CHECK (role IN ('primary', 'contributor', 'viewer')),
    
    -- Session management
    session_token VARCHAR(255),
    session_expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(campaign_id, email)
);

-- Supplier responses to requirements
CREATE TABLE IF NOT EXISTS supplier_requirement_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES supplier_assessment_campaigns(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    supplier_user_id UUID NOT NULL REFERENCES supplier_external_users(id) ON DELETE CASCADE,
    
    -- Response data
    fulfillment_level VARCHAR(50) NOT NULL CHECK (fulfillment_level IN ('fulfilled', 'partially_fulfilled', 'not_fulfilled', 'not_applicable', 'in_progress')),
    response_text TEXT,
    evidence_description TEXT,
    confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    
    -- Workflow
    is_draft BOOLEAN DEFAULT true,
    reviewed_by UUID REFERENCES supplier_external_users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(campaign_id, requirement_id)
);

-- Evidence files uploaded by suppliers
CREATE TABLE IF NOT EXISTS supplier_evidence_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES supplier_requirement_responses(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    storage_path VARCHAR(500) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES supplier_external_users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Security
    virus_scan_status VARCHAR(20) DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'error')),
    is_approved BOOLEAN DEFAULT false
);

-- Supplier delegation records
CREATE TABLE IF NOT EXISTS supplier_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES supplier_assessment_campaigns(id) ON DELETE CASCADE,
    delegated_by UUID NOT NULL REFERENCES supplier_external_users(id),
    delegated_to UUID NOT NULL REFERENCES supplier_external_users(id),
    requirement_ids UUID[] NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CHECK (delegated_by != delegated_to)
);

-- Assessment activity log
CREATE TABLE IF NOT EXISTS supplier_assessment_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES supplier_assessment_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES supplier_external_users(id),
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Email templates for supplier communications
CREATE TABLE IF NOT EXISTS supplier_email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('invitation', 'reminder', 'completion', 'escalation')),
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(organization_id, template_type, is_default) WHERE is_default = true
);

-- Automated reminders and notifications
CREATE TABLE IF NOT EXISTS supplier_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES supplier_assessment_campaigns(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Supplier risk factors and KPIs
CREATE TABLE IF NOT EXISTS supplier_risk_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES supplier_assessment_campaigns(id) ON DELETE CASCADE,
    factor_type VARCHAR(50) NOT NULL,
    factor_name VARCHAR(255) NOT NULL,
    weight DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    current_value DECIMAL(10,2),
    max_value DECIMAL(10,2),
    risk_impact INTEGER CHECK (risk_impact >= 1 AND risk_impact <= 5),
    description TEXT,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_supplier_assessment_campaigns_org_supplier ON supplier_assessment_campaigns(organization_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_assessment_campaigns_status ON supplier_assessment_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_supplier_assessment_campaigns_due_date ON supplier_assessment_campaigns(due_date);
CREATE INDEX IF NOT EXISTS idx_supplier_assessment_campaigns_risk_level ON supplier_assessment_campaigns(risk_level);

CREATE INDEX IF NOT EXISTS idx_supplier_external_users_supplier ON supplier_external_users(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_external_users_campaign ON supplier_external_users(campaign_id);
CREATE INDEX IF NOT EXISTS idx_supplier_external_users_email ON supplier_external_users(email);
CREATE INDEX IF NOT EXISTS idx_supplier_external_users_invite_token ON supplier_external_users(invite_token);
CREATE INDEX IF NOT EXISTS idx_supplier_external_users_session ON supplier_external_users(session_token);

CREATE INDEX IF NOT EXISTS idx_supplier_requirement_responses_campaign ON supplier_requirement_responses(campaign_id);
CREATE INDEX IF NOT EXISTS idx_supplier_requirement_responses_requirement ON supplier_requirement_responses(requirement_id);
CREATE INDEX IF NOT EXISTS idx_supplier_requirement_responses_user ON supplier_requirement_responses(supplier_user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_requirement_responses_fulfillment ON supplier_requirement_responses(fulfillment_level);

CREATE INDEX IF NOT EXISTS idx_supplier_evidence_files_response ON supplier_evidence_files(response_id);
CREATE INDEX IF NOT EXISTS idx_supplier_evidence_files_uploaded_by ON supplier_evidence_files(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_supplier_delegations_campaign ON supplier_delegations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_supplier_delegations_delegated_by ON supplier_delegations(delegated_by);
CREATE INDEX IF NOT EXISTS idx_supplier_delegations_delegated_to ON supplier_delegations(delegated_to);

CREATE INDEX IF NOT EXISTS idx_supplier_assessment_activities_campaign ON supplier_assessment_activities(campaign_id);
CREATE INDEX IF NOT EXISTS idx_supplier_assessment_activities_user ON supplier_assessment_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_assessment_activities_type ON supplier_assessment_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_supplier_assessment_activities_created_at ON supplier_assessment_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_supplier_notifications_campaign ON supplier_notifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_supplier_notifications_scheduled ON supplier_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_supplier_notifications_status ON supplier_notifications(delivery_status);

-- Row Level Security Policies

-- Supplier Assessment Campaigns
ALTER TABLE supplier_assessment_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaigns from their organization" ON supplier_assessment_campaigns
    FOR SELECT USING (organization_id = auth.jwt() ->> 'organization_id');

CREATE POLICY "Users can create campaigns in their organization" ON supplier_assessment_campaigns
    FOR INSERT WITH CHECK (organization_id = auth.jwt() ->> 'organization_id');

CREATE POLICY "Users can update campaigns they created" ON supplier_assessment_campaigns
    FOR UPDATE USING (
        organization_id = auth.jwt() ->> 'organization_id' AND
        created_by = auth.uid()
    );

-- Supplier Assessment Standards
ALTER TABLE supplier_assessment_standards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaign standards from their organization" ON supplier_assessment_standards
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM supplier_assessment_campaigns 
            WHERE organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- Supplier Assessment Requirements
ALTER TABLE supplier_assessment_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaign requirements from their organization" ON supplier_assessment_requirements
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM supplier_assessment_campaigns 
            WHERE organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- Supplier External Users (Special isolation policies)
ALTER TABLE supplier_external_users ENABLE ROW LEVEL SECURITY;

-- Internal users can see external users from their org's campaigns
CREATE POLICY "Internal users can view external users from their campaigns" ON supplier_external_users
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM supplier_assessment_campaigns 
            WHERE organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- External suppliers can only see themselves
CREATE POLICY "External users can view themselves" ON supplier_external_users
    FOR SELECT USING (auth.uid() = id);

-- Supplier Requirement Responses (Dual access pattern)
ALTER TABLE supplier_requirement_responses ENABLE ROW LEVEL SECURITY;

-- Internal users can see responses from their org's campaigns
CREATE POLICY "Internal users can view responses from their campaigns" ON supplier_requirement_responses
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM supplier_assessment_campaigns 
            WHERE organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- External users can only access their campaign responses
CREATE POLICY "External users can manage their campaign responses" ON supplier_requirement_responses
    FOR ALL USING (
        supplier_user_id = auth.uid() OR
        campaign_id IN (
            SELECT campaign_id FROM supplier_external_users 
            WHERE id = auth.uid()
        )
    );

-- Evidence Files
ALTER TABLE supplier_evidence_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evidence from accessible responses" ON supplier_evidence_files
    FOR SELECT USING (
        response_id IN (
            SELECT id FROM supplier_requirement_responses
            WHERE (
                campaign_id IN (
                    SELECT id FROM supplier_assessment_campaigns 
                    WHERE organization_id = auth.jwt() ->> 'organization_id'
                ) OR
                supplier_user_id = auth.uid()
            )
        )
    );

-- Assessment Activities
ALTER TABLE supplier_assessment_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities from their campaigns" ON supplier_assessment_activities
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM supplier_assessment_campaigns 
            WHERE organization_id = auth.jwt() ->> 'organization_id'
        ) OR
        user_id = auth.uid()
    );

-- Email Templates
ALTER TABLE supplier_email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage email templates in their organization" ON supplier_email_templates
    FOR ALL USING (organization_id = auth.jwt() ->> 'organization_id');

-- Notifications
ALTER TABLE supplier_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications from their campaigns" ON supplier_notifications
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM supplier_assessment_campaigns 
            WHERE organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- Risk Factors
ALTER TABLE supplier_risk_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view risk factors from their campaigns" ON supplier_risk_factors
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM supplier_assessment_campaigns 
            WHERE organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- Supplier Delegations
ALTER TABLE supplier_delegations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "External users can manage delegations in their campaigns" ON supplier_delegations
    FOR ALL USING (
        delegated_by = auth.uid() OR 
        delegated_to = auth.uid() OR
        campaign_id IN (
            SELECT id FROM supplier_assessment_campaigns 
            WHERE organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_supplier_assessment_campaigns_updated_at BEFORE UPDATE ON supplier_assessment_campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_supplier_external_users_updated_at BEFORE UPDATE ON supplier_external_users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_supplier_requirement_responses_updated_at BEFORE UPDATE ON supplier_requirement_responses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_supplier_email_templates_updated_at BEFORE UPDATE ON supplier_email_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert default email templates
INSERT INTO supplier_email_templates (organization_id, template_type, subject, body_html, body_text, is_default, created_by) 
SELECT 
    o.id as organization_id,
    'invitation' as template_type,
    'Security Assessment Invitation from {{organization_name}}' as subject,
    '<h2>Security Assessment Invitation</h2><p>Dear {{supplier_contact_name}},</p><p>As part of our ongoing supplier security program, we are requesting your participation in a security assessment.</p><p><strong>Assessment Details:</strong></p><ul><li>Supplier: {{supplier_name}}</li><li>Due Date: {{due_date}}</li><li>Standards: {{standards_list}}</li></ul><p>Please click the link below to access your secure assessment portal:</p><p><a href="{{assessment_link}}">Access Assessment</a></p><p>Best regards,<br>{{internal_user_name}}<br>{{organization_name}}</p>' as body_html,
    'Security Assessment Invitation\n\nDear {{supplier_contact_name}},\n\nAs part of our ongoing supplier security program, we are requesting your participation in a security assessment.\n\nAssessment Details:\n- Supplier: {{supplier_name}}\n- Due Date: {{due_date}}\n- Standards: {{standards_list}}\n\nPlease access your secure assessment portal at: {{assessment_link}}\n\nBest regards,\n{{internal_user_name}}\n{{organization_name}}' as body_text,
    true as is_default,
    (SELECT id FROM users WHERE email = 'demo@auditready.com' LIMIT 1) as created_by
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM supplier_email_templates 
    WHERE organization_id = o.id AND template_type = 'invitation' AND is_default = true
);

-- Function to calculate supplier risk score
CREATE OR REPLACE FUNCTION calculate_supplier_risk_score(campaign_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_requirements INTEGER;
    fulfilled_count INTEGER;
    partial_count INTEGER;
    not_fulfilled_count INTEGER;
    critical_not_fulfilled INTEGER;
    risk_score INTEGER;
BEGIN
    -- Get total requirements count
    SELECT COUNT(*) INTO total_requirements
    FROM supplier_assessment_requirements
    WHERE campaign_id = campaign_uuid AND is_mandatory = true;
    
    IF total_requirements = 0 THEN
        RETURN 0;
    END IF;
    
    -- Get fulfillment counts
    SELECT 
        COUNT(CASE WHEN srr.fulfillment_level = 'fulfilled' THEN 1 END),
        COUNT(CASE WHEN srr.fulfillment_level = 'partially_fulfilled' THEN 1 END),
        COUNT(CASE WHEN srr.fulfillment_level = 'not_fulfilled' THEN 1 END),
        COUNT(CASE WHEN srr.fulfillment_level = 'not_fulfilled' AND sar.weight >= 2.0 THEN 1 END)
    INTO fulfilled_count, partial_count, not_fulfilled_count, critical_not_fulfilled
    FROM supplier_requirement_responses srr
    JOIN supplier_assessment_requirements sar ON srr.requirement_id = sar.requirement_id
    WHERE srr.campaign_id = campaign_uuid 
    AND sar.is_mandatory = true
    AND srr.is_draft = false;
    
    -- Calculate base compliance score (0-100)
    risk_score := ROUND(((fulfilled_count + partial_count * 0.5) / total_requirements::DECIMAL) * 100);
    
    -- Apply penalty for critical unfulfilled requirements
    risk_score := risk_score - (critical_not_fulfilled * 15);
    
    -- Ensure score stays within bounds
    risk_score := GREATEST(0, LEAST(100, risk_score));
    
    -- Invert to make it a risk score (higher = more risky)
    risk_score := 100 - risk_score;
    
    RETURN risk_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update risk level based on score
CREATE OR REPLACE FUNCTION update_supplier_risk_level()
RETURNS TRIGGER AS $$
DECLARE
    new_risk_level VARCHAR(20);
BEGIN
    -- Determine risk level based on score
    CASE 
        WHEN NEW.risk_score >= 80 THEN new_risk_level := 'critical';
        WHEN NEW.risk_score >= 60 THEN new_risk_level := 'high';
        WHEN NEW.risk_score >= 40 THEN new_risk_level := 'medium';
        WHEN NEW.risk_score >= 0 THEN new_risk_level := 'low';
        ELSE new_risk_level := 'unknown';
    END CASE;
    
    NEW.risk_level := new_risk_level;
    NEW.last_calculated_at := now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_supplier_risk_level_trigger 
    BEFORE UPDATE ON supplier_assessment_campaigns
    FOR EACH ROW 
    WHEN (OLD.risk_score IS DISTINCT FROM NEW.risk_score)
    EXECUTE FUNCTION update_supplier_risk_level();

COMMENT ON TABLE supplier_assessment_campaigns IS 'Main table for supplier security assessment campaigns';
COMMENT ON TABLE supplier_external_users IS 'Isolated user accounts for external suppliers - completely separate from main users table';
COMMENT ON TABLE supplier_requirement_responses IS 'Supplier responses to security requirements';
COMMENT ON TABLE supplier_evidence_files IS 'Evidence files uploaded by suppliers';
COMMENT ON TABLE supplier_delegations IS 'Delegation of assessment tasks within supplier organizations';
COMMENT ON TABLE supplier_assessment_activities IS 'Audit log of all assessment activities';
COMMENT ON TABLE supplier_email_templates IS 'Customizable email templates for supplier communications';
COMMENT ON TABLE supplier_notifications IS 'Scheduled and sent notifications to suppliers';
COMMENT ON TABLE supplier_risk_factors IS 'Risk factors and KPIs calculated from supplier assessments';