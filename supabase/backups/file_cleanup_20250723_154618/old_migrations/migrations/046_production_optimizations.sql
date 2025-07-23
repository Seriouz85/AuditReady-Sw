-- Production Database Optimizations
-- Migration 046: Performance indexes and security enhancements

-- Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_users_email_active 
ON organization_users(email, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_requirements_updated_at 
ON organization_requirements(updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_requirements_status_updated 
ON assessment_requirements(status, updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_standards_type_active 
ON standards(type, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_requirements_library_category_id 
ON requirements_library(category_id, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_organization_published 
ON courses(organization_id, is_published) WHERE is_published = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_organization_type 
ON documents(organization_id, document_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_organization_status 
ON risks(organization_id, status);

-- Query Performance Views
CREATE OR REPLACE VIEW active_organization_summary AS
SELECT 
    o.id,
    o.name,
    o.status,
    o.subscription_tier,
    COUNT(ou.id) as user_count,
    COUNT(CASE WHEN ou.is_active THEN 1 END) as active_user_count,
    o.created_at,
    o.updated_at
FROM organizations o
LEFT JOIN organization_users ou ON o.id = ou.organization_id
WHERE o.status = 'active'
GROUP BY o.id, o.name, o.status, o.subscription_tier, o.created_at, o.updated_at;

-- Audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    user_id UUID,
    organization_id UUID,
    resource_type TEXT,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type_created 
ON security_audit_log(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_org 
ON security_audit_log(user_id, organization_id, created_at DESC);

-- Security audit trigger function
CREATE OR REPLACE FUNCTION log_sensitive_operation()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log for non-demo accounts
    IF TG_TABLE_NAME = 'organization_users' AND NEW.email != 'demo@auditready.com' THEN
        INSERT INTO security_audit_log (
            event_type,
            user_id,
            organization_id,
            resource_type,
            resource_id,
            metadata
        ) VALUES (
            TG_OP,
            auth.uid(),
            COALESCE(NEW.organization_id, OLD.organization_id),
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            jsonb_build_object(
                'old', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
                'new', CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_organization_users ON organization_users;
CREATE TRIGGER audit_organization_users
    AFTER INSERT OR UPDATE OR DELETE ON organization_users
    FOR EACH ROW EXECUTE FUNCTION log_sensitive_operation();

DROP TRIGGER IF EXISTS audit_organization_requirements ON organization_requirements;
CREATE TRIGGER audit_organization_requirements
    AFTER UPDATE ON organization_requirements
    FOR EACH ROW EXECUTE FUNCTION log_sensitive_operation();

-- Backup tables for critical data
CREATE TABLE IF NOT EXISTS organization_requirements_backup (
    id UUID,
    organization_id UUID,
    requirement_id UUID,
    status TEXT,
    previous_status TEXT,
    updated_by UUID,
    updated_at TIMESTAMPTZ,
    backup_created_at TIMESTAMPTZ DEFAULT now()
);

-- Backup trigger for status changes
CREATE OR REPLACE FUNCTION backup_status_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO organization_requirements_backup (
            id, organization_id, requirement_id, status, 
            previous_status, updated_by, updated_at
        ) VALUES (
            OLD.id, OLD.organization_id, OLD.requirement_id, 
            NEW.status, OLD.status, NEW.updated_by, NEW.updated_at
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS backup_requirement_status_changes ON organization_requirements;
CREATE TRIGGER backup_requirement_status_changes
    AFTER UPDATE ON organization_requirements
    FOR EACH ROW EXECUTE FUNCTION backup_status_changes();

-- Performance monitoring view
CREATE OR REPLACE VIEW database_performance_metrics AS
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    ROUND((100 * idx_scan / NULLIF(seq_scan + idx_scan, 0))::numeric, 2) as index_usage_pct
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_tup_read DESC;

-- Query performance analysis
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    mean_exec_time,
    calls,
    total_exec_time,
    min_exec_time,
    max_exec_time,
    stddev_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- queries taking more than 100ms on average
ORDER BY mean_exec_time DESC;

-- Platform settings for maintenance mode
INSERT INTO platform_settings (key, value, description) VALUES 
('maintenance_mode', 'false', 'Global maintenance mode flag')
ON CONFLICT (key) DO NOTHING;

INSERT INTO platform_settings (key, value, description) VALUES 
('backup_retention_days', '30', 'Number of days to retain backups')
ON CONFLICT (key) DO NOTHING;

-- RLS policies for audit log (only platform admins can read)
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform admins can view audit logs" ON security_audit_log;
CREATE POLICY "Platform admins can view audit logs" ON security_audit_log
    FOR SELECT USING (is_platform_admin());

-- Function to clean old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
DECLARE
    retention_days integer;
BEGIN
    -- Get retention period from settings
    SELECT (value::integer) INTO retention_days 
    FROM platform_settings 
    WHERE key = 'backup_retention_days';
    
    -- Default to 30 days if not set
    retention_days := COALESCE(retention_days, 30);
    
    -- Delete old audit logs
    DELETE FROM security_audit_log 
    WHERE created_at < (now() - (retention_days || ' days')::interval);
    
    -- Delete old backup records
    DELETE FROM organization_requirements_backup 
    WHERE backup_created_at < (now() - (retention_days || ' days')::interval);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT cleanup_old_audit_logs();');

-- Comments for documentation
COMMENT ON TABLE security_audit_log IS 'Logs sensitive operations for security auditing';
COMMENT ON TABLE organization_requirements_backup IS 'Backup of requirement status changes for audit trail';
COMMENT ON VIEW active_organization_summary IS 'Optimized view for organization dashboard queries';
COMMENT ON VIEW database_performance_metrics IS 'Database performance monitoring metrics';
COMMENT ON FUNCTION cleanup_old_audit_logs() IS 'Scheduled cleanup of old audit and backup records';

-- Grant necessary permissions
GRANT SELECT ON active_organization_summary TO authenticated;
GRANT SELECT ON database_performance_metrics TO service_role;
GRANT SELECT ON slow_queries TO service_role;