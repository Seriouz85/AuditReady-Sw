-- Cybersecurity Validation Framework Database Schema
-- Comprehensive security validation system for AI Knowledge Nexus

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Security Validation Logs
CREATE TABLE security_validation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_hash TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('web_scraped', 'user_generated', 'ai_generated', 'external_api')),
    source_url TEXT,
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    validation_result JSONB NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    threats_count INTEGER DEFAULT 0,
    passed BOOLEAN NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    processing_time_ms INTEGER,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    framework_context TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Monitoring Events
CREATE TABLE security_monitoring_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL CHECK (event_type IN ('threat_detected', 'validation_failed', 'suspicious_activity', 'policy_violation')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    source TEXT NOT NULL,
    details JSONB NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Approval Queue
CREATE TABLE content_approval_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_hash TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('web_scraped', 'user_generated', 'ai_generated', 'external_api')),
    source_url TEXT,
    content_preview TEXT NOT NULL,
    full_content TEXT NOT NULL,
    validation_result JSONB NOT NULL,
    submission_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitter_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    estimated_review_time INTEGER, -- in minutes
    framework_context TEXT[],
    current_status TEXT NOT NULL DEFAULT 'pending' CHECK (current_status IN ('pending', 'in_review', 'escalated', 'approved', 'rejected', 'quarantined')),
    assigned_reviewer UUID REFERENCES auth.users(id),
    review_deadline TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    approved_reason TEXT,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejected_by UUID REFERENCES auth.users(id),
    rejected_reason TEXT,
    quarantined_at TIMESTAMP WITH TIME ZONE,
    quarantined_by UUID REFERENCES auth.users(id),
    quarantined_reason TEXT,
    escalated_at TIMESTAMP WITH TIME ZONE,
    escalated_by UUID REFERENCES auth.users(id),
    escalated_reason TEXT,
    security_notes TEXT,
    remediation_applied TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Security Actions Log
CREATE TABLE admin_security_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content_approval_queue(id),
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('approve', 'reject', 'quarantine', 'escalate', 'modify')),
    reason TEXT NOT NULL,
    security_notes TEXT,
    remediation_applied TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Expert Workflows
CREATE TABLE security_expert_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id TEXT UNIQUE NOT NULL,
    content_id UUID REFERENCES content_approval_queue(id) NOT NULL,
    workflow_type TEXT NOT NULL CHECK (workflow_type IN ('standard', 'expedited', 'deep_analysis', 'compliance_focused')),
    stages JSONB NOT NULL,
    current_stage INTEGER DEFAULT 0,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_experts UUID[],
    escalation_rules JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Incidents
CREATE TABLE security_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id TEXT UNIQUE NOT NULL,
    incident_type TEXT NOT NULL CHECK (incident_type IN ('data_breach', 'malware_detected', 'phishing_campaign', 'compliance_violation', 'system_compromise')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_content TEXT[],
    affected_users UUID[],
    affected_organizations UUID[],
    detection_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_team UUID[],
    containment_actions TEXT[],
    investigation_findings TEXT[],
    remediation_steps TEXT[],
    status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'investigating', 'contained', 'remediated', 'closed')),
    estimated_impact JSONB,
    actual_impact JSONB,
    lessons_learned TEXT,
    post_incident_actions TEXT[],
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Alerts
CREATE TABLE security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id TEXT UNIQUE NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('threat_detected', 'compliance_violation', 'anomaly_detected', 'policy_breach', 'system_compromise')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_systems TEXT[],
    affected_users UUID[],
    detection_method TEXT NOT NULL CHECK (detection_method IN ('automated', 'ai_analysis', 'manual_review', 'external_source')),
    indicators JSONB,
    recommendations TEXT[],
    escalated BOOLEAN DEFAULT FALSE,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    response_actions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Response Actions
CREATE TABLE security_response_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_id TEXT UNIQUE NOT NULL,
    alert_id UUID REFERENCES security_alerts(id),
    incident_id UUID REFERENCES security_incidents(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('block', 'quarantine', 'alert', 'investigate', 'escalate', 'remediate')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    automated BOOLEAN DEFAULT FALSE,
    executed_by UUID REFERENCES auth.users(id),
    executed_at TIMESTAMP WITH TIME ZONE,
    completion_time TIMESTAMP WITH TIME ZONE,
    result TEXT,
    details JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Monitoring Rules
CREATE TABLE security_monitoring_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id TEXT UNIQUE NOT NULL,
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('threshold', 'pattern', 'anomaly', 'ml_model')),
    enabled BOOLEAN DEFAULT TRUE,
    conditions JSONB NOT NULL,
    actions TEXT[],
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    notification_channels TEXT[],
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    last_triggered TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    false_positive_count INTEGER DEFAULT 0,
    effectiveness_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threat Intelligence
CREATE TABLE threat_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL,
    threat_type TEXT NOT NULL,
    indicators JSONB NOT NULL,
    context JSONB,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Metrics (Real-time)
CREATE TABLE security_metrics_realtime (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    validation_count INTEGER DEFAULT 0,
    threat_count INTEGER DEFAULT 0,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    confidence_score DECIMAL(3,2),
    processing_time INTEGER,
    content_type TEXT,
    organization_id UUID REFERENCES organizations(id),
    framework_context TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Compliance Reports
CREATE TABLE security_compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id TEXT UNIQUE NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    organization_id UUID REFERENCES organizations(id),
    frameworks_assessed TEXT[],
    compliance_scores JSONB NOT NULL,
    findings JSONB NOT NULL,
    risk_assessment JSONB NOT NULL,
    recommendations TEXT[],
    report_period_start TIMESTAMP WITH TIME ZONE,
    report_period_end TIMESTAMP WITH TIME ZONE,
    generated_by UUID REFERENCES auth.users(id),
    report_format TEXT DEFAULT 'json' CHECK (report_format IN ('json', 'pdf', 'csv')),
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secure Knowledge Sources (for RAG integration)
CREATE TABLE secure_knowledge_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('web_scraped', 'api_source', 'uploaded_document', 'expert_contributed')),
    security_status TEXT NOT NULL DEFAULT 'pending' CHECK (security_status IN ('validated', 'pending', 'quarantined', 'rejected', 'approved_with_conditions')),
    validation_result JSONB,
    security_score DECIMAL(3,2) CHECK (security_score >= 0 AND security_score <= 1),
    framework_relevance TEXT[],
    last_validation TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    approval_notes TEXT,
    auto_revalidation_schedule TEXT,
    content_hash TEXT NOT NULL,
    metadata JSONB,
    extraction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Source Content (separate table for large content)
CREATE TABLE knowledge_source_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES secure_knowledge_sources(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_length INTEGER,
    content_encoding TEXT DEFAULT 'utf-8',
    content_language TEXT DEFAULT 'en',
    extracted_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Ingestion Pipelines
CREATE TABLE content_ingestion_pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_id TEXT UNIQUE NOT NULL,
    source_url TEXT NOT NULL,
    ingestion_type TEXT NOT NULL CHECK (ingestion_type IN ('automated', 'manual', 'scheduled')),
    security_requirements JSONB NOT NULL,
    processing_stages JSONB NOT NULL,
    current_stage INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'security_review', 'approved', 'rejected', 'completed', 'failed')),
    estimated_completion TIMESTAMP WITH TIME ZONE,
    actual_completion TIMESTAMP WITH TIME ZONE,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secure RAG Operations Log
CREATE TABLE secure_rag_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id TEXT UNIQUE NOT NULL,
    query_hash TEXT NOT NULL,
    frameworks TEXT[],
    security_level TEXT NOT NULL CHECK (security_level IN ('standard', 'high', 'critical')),
    validation_passed BOOLEAN NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    threats_detected INTEGER DEFAULT 0,
    sources_used INTEGER DEFAULT 0,
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    processing_time_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_security_validation_logs_content_hash ON security_validation_logs(content_hash);
CREATE INDEX idx_security_validation_logs_organization ON security_validation_logs(organization_id, validated_at);
CREATE INDEX idx_security_validation_logs_risk_level ON security_validation_logs(risk_level, validated_at);
CREATE INDEX idx_security_validation_logs_user ON security_validation_logs(user_id, validated_at);

CREATE INDEX idx_security_monitoring_events_severity ON security_monitoring_events(severity, timestamp);
CREATE INDEX idx_security_monitoring_events_organization ON security_monitoring_events(organization_id, timestamp);
CREATE INDEX idx_security_monitoring_events_resolved ON security_monitoring_events(resolved, timestamp);

CREATE INDEX idx_content_approval_queue_status ON content_approval_queue(current_status, submission_timestamp);
CREATE INDEX idx_content_approval_queue_priority ON content_approval_queue(priority, submission_timestamp);
CREATE INDEX idx_content_approval_queue_reviewer ON content_approval_queue(assigned_reviewer, current_status);

CREATE INDEX idx_security_alerts_severity ON security_alerts(severity, created_at);
CREATE INDEX idx_security_alerts_resolved ON security_alerts(resolved, created_at);
CREATE INDEX idx_security_alerts_type ON security_alerts(alert_type, created_at);

CREATE INDEX idx_security_incidents_status ON security_incidents(status, detection_timestamp);
CREATE INDEX idx_security_incidents_severity ON security_incidents(severity, detection_timestamp);

CREATE INDEX idx_secure_knowledge_sources_status ON secure_knowledge_sources(security_status, last_validation);
CREATE INDEX idx_secure_knowledge_sources_domain ON secure_knowledge_sources(domain, security_status);
CREATE INDEX idx_secure_knowledge_sources_frameworks ON secure_knowledge_sources USING GIN(framework_relevance);

CREATE INDEX idx_security_metrics_realtime_timestamp ON security_metrics_realtime(timestamp);
CREATE INDEX idx_security_metrics_realtime_organization ON security_metrics_realtime(organization_id, timestamp);

CREATE INDEX idx_secure_rag_operations_user ON secure_rag_operations(user_id, timestamp);
CREATE INDEX idx_secure_rag_operations_organization ON secure_rag_operations(organization_id, timestamp);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_avg_security_score()
RETURNS DECIMAL(3,2) AS $$
BEGIN
    RETURN (
        SELECT AVG(security_score)
        FROM secure_knowledge_sources
        WHERE security_status = 'validated'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if demo enhancement is needed
CREATE OR REPLACE FUNCTION check_demo_enhancement_needed()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM requirements r
        JOIN organizations o ON r.organization_id = o.id
        WHERE o.subscription_tier = 'demo'
        AND r.completion_status = 'not_started'
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to set demo requirement statuses (for optimization)
CREATE OR REPLACE FUNCTION set_demo_requirement_statuses()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    WITH demo_orgs AS (
        SELECT id FROM organizations WHERE subscription_tier = 'demo'
    ),
    random_updates AS (
        UPDATE requirements
        SET completion_status = CASE
            WHEN random() < 0.35 THEN 'fulfilled'
            WHEN random() < 0.65 THEN 'partially_fulfilled'
            ELSE 'not_fulfilled'
        END,
        updated_at = NOW()
        WHERE organization_id IN (SELECT id FROM demo_orgs)
        AND completion_status = 'not_started'
        RETURNING id
    )
    SELECT COUNT(*) INTO updated_count FROM random_updates;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for demo compliance stats
CREATE MATERIALIZED VIEW demo_compliance_stats AS
SELECT 
    COUNT(*) as total_requirements,
    COUNT(CASE WHEN r.completion_status = 'fulfilled' THEN 1 END) as fulfilled,
    COUNT(CASE WHEN r.completion_status = 'partially_fulfilled' THEN 1 END) as partially_fulfilled,
    COUNT(CASE WHEN r.completion_status = 'not_fulfilled' THEN 1 END) as not_fulfilled,
    COUNT(CASE WHEN r.completion_status = 'not_started' THEN 1 END) as not_started
FROM requirements r
JOIN organizations o ON r.organization_id = o.id
WHERE o.subscription_tier = 'demo';

-- Create index on materialized view
CREATE UNIQUE INDEX idx_demo_compliance_stats ON demo_compliance_stats (total_requirements);

-- Function to refresh demo stats
CREATE OR REPLACE FUNCTION refresh_demo_compliance_stats()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW demo_compliance_stats;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE security_validation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_monitoring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_security_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_expert_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_response_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_monitoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE secure_knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_source_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ingestion_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE secure_rag_operations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform admins (full access)
CREATE POLICY "Platform admins can access all security data" ON security_validation_logs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM platform_administrators WHERE email = auth.jwt() ->> 'email' AND is_active = true)
    );

CREATE POLICY "Platform admins can access all monitoring events" ON security_monitoring_events
    FOR ALL USING (
        EXISTS (SELECT 1 FROM platform_administrators WHERE email = auth.jwt() ->> 'email' AND is_active = true)
    );

CREATE POLICY "Platform admins can access all approval queue" ON content_approval_queue
    FOR ALL USING (
        EXISTS (SELECT 1 FROM platform_administrators WHERE email = auth.jwt() ->> 'email' AND is_active = true)
    );

-- RLS Policies for organization-level access
CREATE POLICY "Users can access their organization security logs" ON security_validation_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access their organization monitoring events" ON security_monitoring_events
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Add trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_validation_logs_updated_at
    BEFORE UPDATE ON security_validation_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_monitoring_events_updated_at
    BEFORE UPDATE ON security_monitoring_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_approval_queue_updated_at
    BEFORE UPDATE ON content_approval_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_expert_workflows_updated_at
    BEFORE UPDATE ON security_expert_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_incidents_updated_at
    BEFORE UPDATE ON security_incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_alerts_updated_at
    BEFORE UPDATE ON security_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_secure_knowledge_sources_updated_at
    BEFORE UPDATE ON secure_knowledge_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_ingestion_pipelines_updated_at
    BEFORE UPDATE ON content_ingestion_pipelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample monitoring rules
INSERT INTO security_monitoring_rules (rule_id, rule_name, rule_type, conditions, actions, severity, notification_channels, created_by) VALUES
('rule_critical_threats', 'Critical Threat Detection', 'threshold', '{"min_threats": 1, "threat_severity": "critical"}', ARRAY['alert', 'quarantine', 'escalate'], 'critical', ARRAY['email', 'slack', 'sms'], uuid_generate_v4()),
('rule_high_risk_content', 'High Risk Content Pattern', 'pattern', '{"patterns": ["javascript:", "data:text/html", "eval\\("]}', ARRAY['alert', 'block'], 'high', ARRAY['email', 'slack'], uuid_generate_v4()),
('rule_anomaly_detection', 'Validation Anomaly Detection', 'anomaly', '{"confidence_threshold": 0.9, "risk_level": "critical"}', ARRAY['alert', 'investigate'], 'medium', ARRAY['email'], uuid_generate_v4());

-- Comments for documentation
COMMENT ON TABLE security_validation_logs IS 'Comprehensive log of all security validations performed on content';
COMMENT ON TABLE security_monitoring_events IS 'Real-time security monitoring events and alerts';
COMMENT ON TABLE content_approval_queue IS 'Queue for content requiring manual security review and approval';
COMMENT ON TABLE admin_security_actions IS 'Audit trail of all admin security actions and decisions';
COMMENT ON TABLE security_expert_workflows IS 'Complex security review workflows requiring expert analysis';
COMMENT ON TABLE security_incidents IS 'Security incident tracking and response management';
COMMENT ON TABLE security_alerts IS 'Real-time security alerts and threat notifications';
COMMENT ON TABLE security_monitoring_rules IS 'Configurable rules for automated security monitoring';
COMMENT ON TABLE secure_knowledge_sources IS 'Validated and secure knowledge sources for RAG system';
COMMENT ON TABLE secure_rag_operations IS 'Log of secure RAG operations and queries';

-- Grant permissions for application access
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;