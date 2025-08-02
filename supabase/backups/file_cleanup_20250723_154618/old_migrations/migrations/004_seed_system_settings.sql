-- ============================================================================
-- Seed Initial System Settings
-- ============================================================================

-- General Settings
INSERT INTO system_settings (key, value, category, description, data_type, is_sensitive) VALUES 
('platform_name', '"AuditReady Platform"', 'general', 'The name of the platform displayed to users', 'string', false),
('maintenance_mode', 'false', 'general', 'Enable maintenance mode to prevent user access', 'boolean', false),
('platform_logo_url', '"/auditready-logo-2.png"', 'general', 'URL to platform logo', 'string', false),
('support_email', '"support@auditready.com"', 'general', 'Support contact email', 'string', false);

-- Security Settings
INSERT INTO system_settings (key, value, category, description, data_type, is_sensitive) VALUES 
('session_timeout', '24', 'security', 'User session timeout in hours', 'number', false),
('enforce_mfa', 'false', 'security', 'Require multi-factor authentication for all users', 'boolean', false),
('password_min_length', '8', 'security', 'Minimum password length', 'number', false),
('password_require_special', 'true', 'security', 'Require special characters in passwords', 'boolean', false),
('max_login_attempts', '5', 'security', 'Maximum failed login attempts before lockout', 'number', false),
('lockout_duration', '30', 'security', 'Account lockout duration in minutes', 'number', false);

-- Email Settings
INSERT INTO system_settings (key, value, category, description, data_type, is_sensitive) VALUES 
('email_enabled', 'true', 'email', 'Enable email notifications', 'boolean', false),
('smtp_host', '"smtp.sendgrid.net"', 'email', 'SMTP server hostname', 'string', false),
('smtp_port', '587', 'email', 'SMTP server port', 'number', false),
('smtp_username', '"apikey"', 'email', 'SMTP username', 'string', false),
('smtp_password', '"SG.xxxxx"', 'email', 'SMTP password', 'string', true),
('smtp_from_email', '"noreply@auditready.com"', 'email', 'Default from email address', 'string', false),
('smtp_from_name', '"AuditReady Platform"', 'email', 'Default from name', 'string', false);

-- Limits Settings  
INSERT INTO system_settings (key, value, category, description, data_type, is_sensitive) VALUES 
('max_organizations_per_admin', '100', 'limits', 'Maximum organizations a platform admin can manage', 'number', false),
('max_file_upload_size_mb', '50', 'limits', 'Maximum file upload size in MB', 'number', false),
('max_users_per_organization', '1000', 'limits', 'Maximum users per organization', 'number', false),
('api_rate_limit_per_minute', '60', 'limits', 'API rate limit per minute per user', 'number', false);

-- Compliance Settings
INSERT INTO system_settings (key, value, category, description, data_type, is_sensitive) VALUES 
('audit_log_retention_days', '365', 'compliance', 'Number of days to retain audit logs', 'number', false),
('require_evidence_for_compliance', 'true', 'compliance', 'Require evidence uploads for compliance claims', 'boolean', false),
('compliance_review_required', 'false', 'compliance', 'Require manual review of compliance submissions', 'boolean', false);

-- Backup Settings
INSERT INTO system_settings (key, value, category, description, data_type, is_sensitive) VALUES 
('backup_enabled', 'true', 'backup', 'Enable automatic data backups', 'boolean', false),
('backup_frequency_hours', '24', 'backup', 'Backup frequency in hours', 'number', false),
('backup_retention_days', '30', 'backup', 'Backup retention period in days', 'number', false),
('backup_storage_location', '"s3://auditready-backups"', 'backup', 'Backup storage location', 'string', false);

-- Billing Settings
INSERT INTO system_settings (key, value, category, description, data_type, is_sensitive) VALUES 
('stripe_webhook_secret', '"whsec_xxxxx"', 'billing', 'Stripe webhook endpoint secret', 'string', true),
('trial_period_days', '14', 'billing', 'Free trial period in days', 'number', false),
('grace_period_days', '7', 'billing', 'Grace period after subscription expires', 'number', false),
('auto_suspend_unpaid', 'true', 'billing', 'Automatically suspend organizations with unpaid invoices', 'boolean', false);

-- ============================================================================
-- Create indexes for system settings
-- ============================================================================

CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_category ON system_settings(category);

-- ============================================================================
-- Helper function to get system setting
-- ============================================================================

CREATE OR REPLACE FUNCTION get_system_setting(setting_key TEXT)
RETURNS JSONB AS $$
DECLARE
    setting_value JSONB;
BEGIN
    SELECT value INTO setting_value
    FROM system_settings
    WHERE key = setting_key;
    
    RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_system_setting(TEXT) TO authenticated;