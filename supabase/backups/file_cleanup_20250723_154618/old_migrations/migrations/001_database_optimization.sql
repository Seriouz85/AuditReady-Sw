-- Database Optimization Migration
-- This migration adds indexes, optimizations, and performance improvements
-- while preserving all existing data and requirements

-- Create indexes for better query performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_created_at ON organizations(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_subscription_tier ON organizations(subscription_tier);

-- User-related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Assessment-related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_organization_id ON assessments(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_framework_id ON assessments(framework_id);

-- Compliance framework indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_frameworks_category ON compliance_frameworks(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_frameworks_status ON compliance_frameworks(status);

-- Control-related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_controls_framework_id ON controls(framework_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_controls_category ON controls(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_controls_priority ON controls(priority);

-- Assessment controls indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_controls_assessment_id ON assessment_controls(assessment_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_controls_control_id ON assessment_controls(control_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_controls_status ON assessment_controls(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_controls_assigned_to ON assessment_controls(assigned_to);

-- Risk-related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_organization_id ON risks(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_status ON risks(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_severity ON risks(severity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_likelihood ON risks(likelihood);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_created_at ON risks(created_at);

-- Document-related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_organization_id ON documents(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Evidence-related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_assessment_control_id ON evidence(assessment_control_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_uploaded_by ON evidence(uploaded_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_created_at ON evidence(created_at);

-- Activity log indexes for audit trail
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_organization_id ON activity_logs(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- LMS-related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_organization_id ON courses(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_org_status ON assessments(organization_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_controls_assess_status ON assessment_controls(assessment_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_org_severity ON risks(organization_id, severity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_org_active ON users(organization_id, is_active);

-- Performance optimization: Update statistics
ANALYZE organizations;
ANALYZE users;
ANALYZE assessments;
ANALYZE assessment_controls;
ANALYZE controls;
ANALYZE risks;
ANALYZE documents;
ANALYZE evidence;
ANALYZE activity_logs;

-- Create materialized view for dashboard analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS org_dashboard_stats AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT a.id) as total_assessments,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_assessments,
    COUNT(DISTINCT r.id) as total_risks,
    COUNT(DISTINCT CASE WHEN r.status = 'open' THEN r.id END) as open_risks,
    COUNT(DISTINCT CASE WHEN r.severity = 'high' THEN r.id END) as high_risks,
    AVG(CASE WHEN a.status = 'completed' THEN a.compliance_score END) as avg_compliance_score,
    MAX(a.updated_at) as last_assessment_update
FROM organizations o
LEFT JOIN users u ON o.id = u.organization_id AND u.is_active = true
LEFT JOIN assessments a ON o.id = a.organization_id
LEFT JOIN risks r ON o.id = r.organization_id
WHERE o.status = 'active'
GROUP BY o.id, o.name;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_dashboard_stats_org_id ON org_dashboard_stats(organization_id);

-- Create function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY org_dashboard_stats;
END;
$$;

-- Create materialized view for compliance progress tracking
CREATE MATERIALIZED VIEW IF NOT EXISTS compliance_progress_view AS
SELECT 
    a.id as assessment_id,
    a.organization_id,
    a.framework_id,
    cf.name as framework_name,
    COUNT(ac.id) as total_controls,
    COUNT(CASE WHEN ac.status = 'fulfilled' THEN 1 END) as fulfilled_controls,
    COUNT(CASE WHEN ac.status = 'partially_fulfilled' THEN 1 END) as partial_controls,
    COUNT(CASE WHEN ac.status = 'not_fulfilled' THEN 1 END) as not_fulfilled_controls,
    COUNT(CASE WHEN ac.status = 'not_applicable' THEN 1 END) as not_applicable_controls,
    ROUND(
        (COUNT(CASE WHEN ac.status = 'fulfilled' THEN 1 END) * 100.0) / 
        NULLIF(COUNT(CASE WHEN ac.status != 'not_applicable' THEN 1 END), 0), 
        2
    ) as compliance_percentage,
    a.updated_at
FROM assessments a
JOIN compliance_frameworks cf ON a.framework_id = cf.id
LEFT JOIN assessment_controls ac ON a.id = ac.assessment_id
GROUP BY a.id, a.organization_id, a.framework_id, cf.name, a.updated_at;

-- Create index on compliance progress view
CREATE UNIQUE INDEX IF NOT EXISTS idx_compliance_progress_assessment_id ON compliance_progress_view(assessment_id);
CREATE INDEX IF NOT EXISTS idx_compliance_progress_org_id ON compliance_progress_view(organization_id);

-- Create function to refresh compliance progress
CREATE OR REPLACE FUNCTION refresh_compliance_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY compliance_progress_view;
END;
$$;

-- Enable Row Level Security policies optimization
-- Add policy indexes for better RLS performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_rls ON organizations(id) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_rls ON users(organization_id, id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_rls ON assessments(organization_id, id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_rls ON risks(organization_id, id);

-- Optimize table storage
-- Enable compression for large text fields (preserving all data)
ALTER TABLE documents 
  ALTER COLUMN content SET STORAGE EXTENDED,
  ALTER COLUMN metadata SET STORAGE EXTENDED;

ALTER TABLE evidence 
  ALTER COLUMN description SET STORAGE EXTENDED,
  ALTER COLUMN metadata SET STORAGE EXTENDED;

ALTER TABLE activity_logs 
  ALTER COLUMN details SET STORAGE EXTENDED;

-- Create partial indexes for active records only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_organizations ON organizations(id, created_at) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_users ON users(organization_id, id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_open_assessments ON assessments(organization_id, created_at) WHERE status IN ('draft', 'in_progress');
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_risks ON risks(organization_id, severity, created_at) WHERE status IN ('open', 'in_progress');

-- Add constraint for data integrity (non-destructive)
ALTER TABLE assessment_controls 
  ADD CONSTRAINT IF NOT EXISTS check_valid_status 
  CHECK (status IN ('not_started', 'in_progress', 'fulfilled', 'partially_fulfilled', 'not_fulfilled', 'not_applicable'));

ALTER TABLE risks 
  ADD CONSTRAINT IF NOT EXISTS check_valid_severity 
  CHECK (severity IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE risks 
  ADD CONSTRAINT IF NOT EXISTS check_valid_likelihood 
  CHECK (likelihood IN ('low', 'medium', 'high'));

-- Create function for automatic statistics updates
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update table statistics for query planner optimization
    ANALYZE organizations;
    ANALYZE users;
    ANALYZE assessments;
    ANALYZE assessment_controls;
    ANALYZE controls;
    ANALYZE compliance_frameworks;
    ANALYZE risks;
    ANALYZE documents;
    ANALYZE evidence;
    ANALYZE activity_logs;
    
    -- Log the statistics update
    INSERT INTO activity_logs (organization_id, user_id, action, entity_type, details, created_at)
    VALUES (
        NULL, 
        NULL, 
        'system_maintenance', 
        'database', 
        '{"type": "statistics_update", "timestamp": "' || NOW() || '"}',
        NOW()
    );
END;
$$;

-- Schedule regular maintenance (commented out - should be set up in production)
-- SELECT cron.schedule('update-stats', '0 2 * * *', 'SELECT update_table_statistics();');
-- SELECT cron.schedule('refresh-dashboard', '*/30 * * * *', 'SELECT refresh_dashboard_stats();');
-- SELECT cron.schedule('refresh-compliance', '*/15 * * * *', 'SELECT refresh_compliance_progress();');

-- Add database monitoring table for performance tracking
CREATE TABLE IF NOT EXISTS database_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4),
    metric_unit VARCHAR(20),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create index for performance metrics
CREATE INDEX IF NOT EXISTS idx_db_metrics_name_time ON database_performance_metrics(metric_name, recorded_at);

-- Create function to log performance metrics
CREATE OR REPLACE FUNCTION log_performance_metric(
    p_metric_name VARCHAR(100),
    p_metric_value DECIMAL(15,4),
    p_metric_unit VARCHAR(20) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO database_performance_metrics (metric_name, metric_value, metric_unit, metadata)
    VALUES (p_metric_name, p_metric_value, p_metric_unit, p_metadata);
END;
$$;

-- Create maintenance summary view
CREATE OR REPLACE VIEW database_health_summary AS
SELECT 
    schemaname,
    tablename,
    attname as column_name,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats 
WHERE schemaname = 'public' 
  AND tablename IN ('organizations', 'users', 'assessments', 'risks', 'documents')
ORDER BY schemaname, tablename, attname;

-- Initial refresh of materialized views
SELECT refresh_dashboard_stats();
SELECT refresh_compliance_progress();

-- Log the completion of database optimization
SELECT log_performance_metric('migration_completed', 1, 'boolean', '{"migration": "001_database_optimization", "timestamp": "' || NOW() || '"}');

COMMIT;