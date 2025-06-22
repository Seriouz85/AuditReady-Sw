-- ============================================================================
-- Integration and Synchronization Schema
-- External system integrations, data sync, and API management
-- ============================================================================

-- ============================================================================
-- EXTERNAL INTEGRATIONS
-- ============================================================================

-- Integration configurations (AD/LDAP, SSO, third-party tools)
CREATE TABLE integration_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL, -- 'azure_ad', 'okta', 'google_workspace', 'slack', 'jira'
    name TEXT NOT NULL,
    configuration JSONB NOT NULL, -- Integration-specific config (encrypted sensitive data)
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'error', 'disabled')),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id),
    UNIQUE(organization_id, integration_type, name)
);

-- Sync jobs and scheduling
CREATE TABLE sync_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_config_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL, -- 'full_sync', 'incremental_sync', 'user_import', 'data_export'
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    records_processed INTEGER DEFAULT 0,
    records_total INTEGER,
    error_details JSONB,
    result_summary JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- External user mapping (for SSO and user provisioning)
CREATE TABLE external_user_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    internal_user_id UUID REFERENCES organization_users(id) ON DELETE CASCADE,
    external_system TEXT NOT NULL, -- 'azure_ad', 'okta', etc.
    external_user_id TEXT NOT NULL,
    external_username TEXT,
    external_email TEXT,
    additional_attributes JSONB DEFAULT '{}',
    last_synced_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, external_system, external_user_id)
);

-- ============================================================================
-- API MANAGEMENT
-- ============================================================================

-- API keys for external access
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE, -- Hashed API key for security
    key_prefix TEXT NOT NULL, -- First few characters for identification
    permissions JSONB NOT NULL DEFAULT '[]', -- Array of allowed permissions
    rate_limit_per_hour INTEGER DEFAULT 1000,
    allowed_ip_ranges TEXT[], -- CIDR blocks for IP restrictions
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- API usage tracking and rate limiting
CREATE TABLE api_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    ip_address INET,
    user_agent TEXT,
    request_timestamp TIMESTAMP DEFAULT NOW()
);

-- Webhook configurations
CREATE TABLE webhook_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- Array of events to listen for
    secret_key TEXT, -- For webhook signature verification
    is_active BOOLEAN DEFAULT true,
    retry_count INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Webhook delivery logs
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_config_id UUID REFERENCES webhook_configs(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'retrying')),
    http_status_code INTEGER,
    response_body TEXT,
    attempt_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- DATA EXPORT AND REPORTING
-- ============================================================================

-- Export job management
CREATE TABLE export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    export_type TEXT NOT NULL, -- 'compliance_report', 'assessment_data', 'user_activity', 'full_backup'
    format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv', 'json', 'xml')),
    parameters JSONB DEFAULT '{}', -- Export parameters (date ranges, filters, etc.)
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_path TEXT, -- Path to generated file in storage
    file_size BIGINT,
    download_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Scheduled reports
CREATE TABLE scheduled_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL,
    schedule_expression TEXT NOT NULL, -- Cron expression
    parameters JSONB DEFAULT '{}',
    recipients TEXT[] NOT NULL, -- Email addresses
    format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv')),
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- ============================================================================
-- BACKUP AND RECOVERY
-- ============================================================================

-- Backup configurations
CREATE TABLE backup_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential')),
    schedule_expression TEXT NOT NULL, -- Cron expression
    retention_days INTEGER DEFAULT 30,
    compression_enabled BOOLEAN DEFAULT true,
    encryption_enabled BOOLEAN DEFAULT true,
    storage_location TEXT NOT NULL, -- S3 bucket, Azure blob, etc.
    is_active BOOLEAN DEFAULT true,
    last_backup_at TIMESTAMP,
    next_backup_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Backup execution logs
CREATE TABLE backup_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_config_id UUID REFERENCES backup_configs(id) ON DELETE CASCADE,
    backup_type TEXT NOT NULL,
    status TEXT DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed', 'cancelled')),
    file_path TEXT,
    file_size BIGINT,
    records_backed_up INTEGER,
    compression_ratio DECIMAL(5,2),
    duration_seconds INTEGER,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- ============================================================================
-- BUSINESS INTELLIGENCE AND ANALYTICS
-- ============================================================================

-- Custom dashboards and views
CREATE TABLE custom_dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    layout_config JSONB NOT NULL, -- Dashboard layout and widget configuration
    data_sources JSONB NOT NULL, -- Queries and data source configurations
    permissions JSONB DEFAULT '{}', -- Who can view/edit this dashboard
    is_public BOOLEAN DEFAULT false,
    refresh_interval_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Saved queries and analytics
CREATE TABLE saved_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    query_type TEXT NOT NULL, -- 'sql', 'aggregation', 'report'
    query_definition JSONB NOT NULL,
    result_schema JSONB, -- Expected result structure
    is_public BOOLEAN DEFAULT false,
    execution_count INTEGER DEFAULT 0,
    avg_execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- ============================================================================
-- ENHANCED NOTIFICATIONS
-- ============================================================================

-- Notification templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_type TEXT NOT NULL, -- 'email', 'sms', 'slack', 'teams', 'webhook'
    subject_template TEXT,
    body_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Available template variables
    is_system_template BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Notification delivery tracking
CREATE TABLE notification_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    template_id UUID REFERENCES notification_templates(id),
    delivery_method TEXT NOT NULL, -- 'email', 'sms', 'push', 'webhook'
    recipient TEXT NOT NULL, -- Email, phone number, user ID, etc.
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    delivery_details JSONB,
    error_message TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Integration and sync indexes
CREATE INDEX idx_integration_configs_org_type ON integration_configs(organization_id, integration_type);
CREATE INDEX idx_sync_jobs_config_id ON sync_jobs(integration_config_id);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX idx_external_user_mappings_org_external ON external_user_mappings(organization_id, external_system);

-- API management indexes
CREATE INDEX idx_api_keys_org_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_usage_logs_key_id ON api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_logs_timestamp ON api_usage_logs(request_timestamp);
CREATE INDEX idx_webhook_configs_org_id ON webhook_configs(organization_id);
CREATE INDEX idx_webhook_deliveries_config_id ON webhook_deliveries(webhook_config_id);

-- Export and reporting indexes
CREATE INDEX idx_export_jobs_org_id ON export_jobs(organization_id);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);
CREATE INDEX idx_scheduled_reports_org_id ON scheduled_reports(organization_id);
CREATE INDEX idx_scheduled_reports_next_run ON scheduled_reports(next_run_at) WHERE is_active = true;

-- Backup indexes
CREATE INDEX idx_backup_configs_org_id ON backup_configs(organization_id);
CREATE INDEX idx_backup_logs_config_id ON backup_logs(backup_config_id);
CREATE INDEX idx_backup_logs_started_at ON backup_logs(started_at);

-- Analytics indexes
CREATE INDEX idx_custom_dashboards_org_id ON custom_dashboards(organization_id);
CREATE INDEX idx_saved_queries_org_id ON saved_queries(organization_id);

-- Notification indexes
CREATE INDEX idx_notification_templates_org_id ON notification_templates(organization_id);
CREATE INDEX idx_notification_deliveries_org_id ON notification_deliveries(organization_id);
CREATE INDEX idx_notification_deliveries_status ON notification_deliveries(status);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_user_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;

-- Create organization-scoped RLS policies
CREATE POLICY "Organization members access own integrations" ON integration_configs
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        )
        OR EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- API keys are only accessible by organization admins
CREATE POLICY "Organization admins access own API keys" ON api_keys
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT ou.organization_id FROM organization_users ou
            WHERE ou.email = auth.email() 
            AND ou.is_active = true 
            AND ou.role IN ('organization_admin')
        )
        OR EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- Apply similar policies to other tables
CREATE POLICY "Organization members access own exports" ON export_jobs
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        )
        OR EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- ============================================================================
-- TRIGGERS FOR TIMESTAMP UPDATES
-- ============================================================================

CREATE TRIGGER update_integration_configs_updated_at 
    BEFORE UPDATE ON integration_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_jobs_updated_at 
    BEFORE UPDATE ON sync_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_configs_updated_at 
    BEFORE UPDATE ON webhook_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_export_jobs_updated_at 
    BEFORE UPDATE ON export_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_reports_updated_at 
    BEFORE UPDATE ON scheduled_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backup_configs_updated_at 
    BEFORE UPDATE ON backup_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_dashboards_updated_at 
    BEFORE UPDATE ON custom_dashboards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_queries_updated_at 
    BEFORE UPDATE ON saved_queries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at 
    BEFORE UPDATE ON notification_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ADVANCED FUNCTIONS
-- ============================================================================

-- Function to clean up old API usage logs
CREATE OR REPLACE FUNCTION cleanup_old_api_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM api_usage_logs 
    WHERE request_timestamp < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate API usage statistics
CREATE OR REPLACE FUNCTION get_api_usage_stats(
    api_key_id_param UUID,
    period_hours INTEGER DEFAULT 24
)
RETURNS TABLE(
    total_requests INTEGER,
    successful_requests INTEGER,
    error_requests INTEGER,
    avg_response_time_ms DECIMAL,
    total_data_transferred_mb DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_requests,
        COUNT(CASE WHEN status_code < 400 THEN 1 END)::INTEGER as successful_requests,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END)::INTEGER as error_requests,
        ROUND(AVG(response_time_ms), 2) as avg_response_time_ms,
        ROUND(SUM(COALESCE(request_size_bytes, 0) + COALESCE(response_size_bytes, 0))::DECIMAL / 1024 / 1024, 2) as total_data_transferred_mb
    FROM api_usage_logs
    WHERE api_key_id = api_key_id_param
    AND request_timestamp >= NOW() - (period_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE integration_configs IS 'External system integration configurations';
COMMENT ON TABLE sync_jobs IS 'Background jobs for data synchronization';
COMMENT ON TABLE api_keys IS 'API access keys for external integrations';
COMMENT ON TABLE webhook_configs IS 'Webhook configurations for real-time notifications';
COMMENT ON TABLE export_jobs IS 'Data export and report generation jobs';
COMMENT ON TABLE backup_configs IS 'Automated backup configurations';
COMMENT ON TABLE custom_dashboards IS 'User-created custom analytics dashboards';
COMMENT ON TABLE notification_templates IS 'Customizable notification templates';

-- Insert default system notification templates
INSERT INTO notification_templates (organization_id, name, template_type, subject_template, body_template, is_system_template) VALUES 
(NULL, 'Requirement Overdue', 'email', 'Compliance Requirement Overdue: {{requirement_title}}', 'The requirement "{{requirement_title}}" is now overdue. Please take immediate action to maintain compliance.', true),
(NULL, 'Assessment Completed', 'email', 'Assessment Completed: {{assessment_name}}', 'The assessment "{{assessment_name}}" has been completed successfully. Compliance score: {{compliance_score}}%', true),
(NULL, 'User Invitation', 'email', 'Invitation to join {{organization_name}}', 'You have been invited to join {{organization_name}} on AuditReady. Click here to accept: {{invitation_link}}', true);