-- Security Audit System Migration
-- Creates comprehensive security audit logging tables and functions

-- Create security audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN (
        'authentication_success',
        'authentication_failure', 
        'authorization_failure',
        'csrf_violation',
        'rate_limit_exceeded',
        'suspicious_activity',
        'privilege_escalation_attempt',
        'data_access_violation',
        'input_validation_failure',
        'file_upload_rejected',
        'security_configuration_change'
    )),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB NOT NULL DEFAULT '{}',
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    session_id TEXT,
    request_id TEXT,
    endpoint TEXT,
    method TEXT,
    status_code INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_security_audit_log_event_type ON security_audit_log(event_type);
CREATE INDEX idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_timestamp ON security_audit_log(timestamp DESC);
CREATE INDEX idx_security_audit_log_severity ON security_audit_log(severity);
CREATE INDEX idx_security_audit_log_ip_address ON security_audit_log(ip_address);
CREATE INDEX idx_security_audit_log_organization_id ON security_audit_log(organization_id);

-- GIN index for JSONB details column
CREATE INDEX idx_security_audit_log_details ON security_audit_log USING GIN(details);

-- Create security metrics summary table
CREATE TABLE IF NOT EXISTS security_metrics_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    total_events INTEGER NOT NULL DEFAULT 0,
    authentication_failures INTEGER NOT NULL DEFAULT 0,
    authorization_failures INTEGER NOT NULL DEFAULT 0,
    csrf_violations INTEGER NOT NULL DEFAULT 0,
    rate_limit_violations INTEGER NOT NULL DEFAULT 0,
    suspicious_activities INTEGER NOT NULL DEFAULT 0,
    privilege_escalation_attempts INTEGER NOT NULL DEFAULT 0,
    unique_ips INTEGER NOT NULL DEFAULT 0,
    high_severity_events INTEGER NOT NULL DEFAULT 0,
    critical_severity_events INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(date, organization_id)
);

-- Create index for metrics summary
CREATE INDEX idx_security_metrics_summary_date ON security_metrics_summary(date DESC);
CREATE INDEX idx_security_metrics_summary_org ON security_metrics_summary(organization_id);

-- Create security alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'multiple_failed_logins',
        'suspicious_ip_activity',
        'privilege_escalation_detected',
        'rate_limit_abuse',
        'csrf_attack_detected',
        'xss_attempt_detected',
        'sql_injection_attempt',
        'file_upload_attack',
        'configuration_change'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'false_positive')),
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for security alerts
CREATE INDEX idx_security_alerts_type ON security_alerts(alert_type);
CREATE INDEX idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX idx_security_alerts_status ON security_alerts(status);
CREATE INDEX idx_security_alerts_created_at ON security_alerts(created_at DESC);
CREATE INDEX idx_security_alerts_organization_id ON security_alerts(organization_id);

-- Create blocked IPs table
CREATE TABLE IF NOT EXISTS blocked_ips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    block_type TEXT NOT NULL CHECK (block_type IN ('manual', 'automatic', 'rate_limit', 'suspicious_activity')),
    blocked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for blocked IPs
CREATE INDEX idx_blocked_ips_ip_address ON blocked_ips(ip_address);
CREATE INDEX idx_blocked_ips_is_active ON blocked_ips(is_active);
CREATE INDEX idx_blocked_ips_expires_at ON blocked_ips(expires_at) WHERE expires_at IS NOT NULL;

-- Create function to update security metrics summary
CREATE OR REPLACE FUNCTION update_security_metrics_summary()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO security_metrics_summary (
        date,
        organization_id,
        total_events,
        authentication_failures,
        authorization_failures,
        csrf_violations,
        rate_limit_violations,
        suspicious_activities,
        privilege_escalation_attempts,
        unique_ips,
        high_severity_events,
        critical_severity_events
    )
    VALUES (
        CURRENT_DATE,
        NEW.organization_id,
        1,
        CASE WHEN NEW.event_type = 'authentication_failure' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'authorization_failure' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'csrf_violation' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'rate_limit_exceeded' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'suspicious_activity' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'privilege_escalation_attempt' THEN 1 ELSE 0 END,
        1, -- unique_ips (will be updated by separate function)
        CASE WHEN NEW.severity = 'high' THEN 1 ELSE 0 END,
        CASE WHEN NEW.severity = 'critical' THEN 1 ELSE 0 END
    )
    ON CONFLICT (date, organization_id) DO UPDATE SET
        total_events = security_metrics_summary.total_events + 1,
        authentication_failures = security_metrics_summary.authentication_failures + 
            CASE WHEN NEW.event_type = 'authentication_failure' THEN 1 ELSE 0 END,
        authorization_failures = security_metrics_summary.authorization_failures + 
            CASE WHEN NEW.event_type = 'authorization_failure' THEN 1 ELSE 0 END,
        csrf_violations = security_metrics_summary.csrf_violations + 
            CASE WHEN NEW.event_type = 'csrf_violation' THEN 1 ELSE 0 END,
        rate_limit_violations = security_metrics_summary.rate_limit_violations + 
            CASE WHEN NEW.event_type = 'rate_limit_exceeded' THEN 1 ELSE 0 END,
        suspicious_activities = security_metrics_summary.suspicious_activities + 
            CASE WHEN NEW.event_type = 'suspicious_activity' THEN 1 ELSE 0 END,
        privilege_escalation_attempts = security_metrics_summary.privilege_escalation_attempts + 
            CASE WHEN NEW.event_type = 'privilege_escalation_attempt' THEN 1 ELSE 0 END,
        high_severity_events = security_metrics_summary.high_severity_events + 
            CASE WHEN NEW.severity = 'high' THEN 1 ELSE 0 END,
        critical_severity_events = security_metrics_summary.critical_severity_events + 
            CASE WHEN NEW.severity = 'critical' THEN 1 ELSE 0 END,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic metrics updates
CREATE TRIGGER trigger_update_security_metrics_summary
    AFTER INSERT ON security_audit_log
    FOR EACH ROW
    EXECUTE FUNCTION update_security_metrics_summary();

-- Create function to generate security alerts
CREATE OR REPLACE FUNCTION check_security_alerts()
RETURNS TRIGGER AS $$
DECLARE
    alert_threshold INTEGER;
    recent_events INTEGER;
    alert_exists BOOLEAN;
BEGIN
    -- Check for multiple authentication failures
    IF NEW.event_type = 'authentication_failure' AND NEW.ip_address IS NOT NULL THEN
        SELECT COUNT(*) INTO recent_events
        FROM security_audit_log
        WHERE event_type = 'authentication_failure'
            AND ip_address = NEW.ip_address
            AND timestamp > NOW() - INTERVAL '15 minutes';

        IF recent_events >= 5 THEN
            SELECT EXISTS(
                SELECT 1 FROM security_alerts
                WHERE alert_type = 'multiple_failed_logins'
                    AND ip_address = NEW.ip_address
                    AND status = 'open'
                    AND created_at > NOW() - INTERVAL '1 hour'
            ) INTO alert_exists;

            IF NOT alert_exists THEN
                INSERT INTO security_alerts (
                    alert_type,
                    severity,
                    title,
                    description,
                    details,
                    ip_address,
                    organization_id
                ) VALUES (
                    'multiple_failed_logins',
                    'high',
                    'Multiple Failed Login Attempts',
                    format('IP address %s has %s failed login attempts in the last 15 minutes', NEW.ip_address, recent_events),
                    jsonb_build_object(
                        'ip_address', NEW.ip_address,
                        'failed_attempts', recent_events,
                        'time_window', '15 minutes'
                    ),
                    NEW.ip_address,
                    NEW.organization_id
                );
            END IF;
        END IF;
    END IF;

    -- Check for privilege escalation attempts
    IF NEW.event_type = 'privilege_escalation_attempt' THEN
        INSERT INTO security_alerts (
            alert_type,
            severity,
            title,
            description,
            details,
            user_id,
            ip_address,
            organization_id
        ) VALUES (
            'privilege_escalation_detected',
            'critical',
            'Privilege Escalation Attempt Detected',
            'A user attempted to access resources beyond their permission level',
            NEW.details,
            NEW.user_id,
            NEW.ip_address,
            NEW.organization_id
        );
    END IF;

    -- Check for CSRF attacks
    IF NEW.event_type = 'csrf_violation' THEN
        SELECT COUNT(*) INTO recent_events
        FROM security_audit_log
        WHERE event_type = 'csrf_violation'
            AND ip_address = NEW.ip_address
            AND timestamp > NOW() - INTERVAL '1 hour';

        IF recent_events >= 3 THEN
            SELECT EXISTS(
                SELECT 1 FROM security_alerts
                WHERE alert_type = 'csrf_attack_detected'
                    AND ip_address = NEW.ip_address
                    AND status = 'open'
                    AND created_at > NOW() - INTERVAL '1 hour'
            ) INTO alert_exists;

            IF NOT alert_exists THEN
                INSERT INTO security_alerts (
                    alert_type,
                    severity,
                    title,
                    description,
                    details,
                    ip_address,
                    organization_id
                ) VALUES (
                    'csrf_attack_detected',
                    'high',
                    'CSRF Attack Detected',
                    format('IP address %s has %s CSRF violations in the last hour', NEW.ip_address, recent_events),
                    jsonb_build_object(
                        'ip_address', NEW.ip_address,
                        'csrf_violations', recent_events,
                        'time_window', '1 hour'
                    ),
                    NEW.ip_address,
                    NEW.organization_id
                );
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic alert generation
CREATE TRIGGER trigger_check_security_alerts
    AFTER INSERT ON security_audit_log
    FOR EACH ROW
    EXECUTE FUNCTION check_security_alerts();

-- Create function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete logs older than 90 days
    DELETE FROM security_audit_log
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation
    INSERT INTO security_audit_log (
        event_type,
        details,
        severity
    ) VALUES (
        'security_configuration_change',
        jsonb_build_object(
            'action', 'audit_log_cleanup',
            'deleted_count', deleted_count
        ),
        'low'
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get security dashboard metrics
CREATE OR REPLACE FUNCTION get_security_dashboard_metrics(
    org_id UUID DEFAULT NULL,
    days_back INTEGER DEFAULT 7
)
RETURNS TABLE(
    total_events BIGINT,
    critical_events BIGINT,
    high_events BIGINT,
    authentication_failures BIGINT,
    rate_limit_violations BIGINT,
    top_event_types JSONB,
    top_ips JSONB,
    daily_trend JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE sal.severity = 'critical') as critical_events,
        COUNT(*) FILTER (WHERE sal.severity = 'high') as high_events,
        COUNT(*) FILTER (WHERE sal.event_type = 'authentication_failure') as authentication_failures,
        COUNT(*) FILTER (WHERE sal.event_type = 'rate_limit_exceeded') as rate_limit_violations,
        
        -- Top event types
        (SELECT jsonb_agg(
            jsonb_build_object(
                'event_type', event_type,
                'count', count
            )
        ) FROM (
            SELECT event_type, COUNT(*) as count
            FROM security_audit_log sal2
            WHERE sal2.timestamp > NOW() - (days_back || ' days')::INTERVAL
                AND (org_id IS NULL OR sal2.organization_id = org_id)
            GROUP BY event_type
            ORDER BY count DESC
            LIMIT 10
        ) top_events) as top_event_types,
        
        -- Top IPs
        (SELECT jsonb_agg(
            jsonb_build_object(
                'ip_address', ip_address,
                'count', count
            )
        ) FROM (
            SELECT ip_address, COUNT(*) as count
            FROM security_audit_log sal3
            WHERE sal3.timestamp > NOW() - (days_back || ' days')::INTERVAL
                AND sal3.ip_address IS NOT NULL
                AND (org_id IS NULL OR sal3.organization_id = org_id)
            GROUP BY ip_address
            ORDER BY count DESC
            LIMIT 10
        ) top_ips_data) as top_ips,
        
        -- Daily trend
        (SELECT jsonb_agg(
            jsonb_build_object(
                'date', date,
                'count', count
            ) ORDER BY date
        ) FROM (
            SELECT DATE(timestamp) as date, COUNT(*) as count
            FROM security_audit_log sal4
            WHERE sal4.timestamp > NOW() - (days_back || ' days')::INTERVAL
                AND (org_id IS NULL OR sal4.organization_id = org_id)
            GROUP BY DATE(timestamp)
            ORDER BY date
        ) daily_data) as daily_trend
        
    FROM security_audit_log sal
    WHERE sal.timestamp > NOW() - (days_back || ' days')::INTERVAL
        AND (org_id IS NULL OR sal.organization_id = org_id);
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on security tables
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_metrics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;

-- RLS policies for security_audit_log
CREATE POLICY "Users can view audit logs for their organization" ON security_audit_log
    FOR SELECT TO authenticated
    USING (
        organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin')
        )
    );

-- RLS policies for security_metrics_summary
CREATE POLICY "Users can view metrics for their organization" ON security_metrics_summary
    FOR SELECT TO authenticated
    USING (
        organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin')
        )
    );

-- RLS policies for security_alerts
CREATE POLICY "Users can view alerts for their organization" ON security_alerts
    FOR SELECT TO authenticated
    USING (
        organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin')
        )
    );

CREATE POLICY "Admins can update alerts" ON security_alerts
    FOR UPDATE TO authenticated
    USING (
        organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
        AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'org_admin', 'compliance_manager')
        )
    );

-- RLS policies for blocked_ips
CREATE POLICY "Admins can manage blocked IPs" ON blocked_ips
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'org_admin')
        )
    );

-- Grant permissions
GRANT SELECT ON security_audit_log TO authenticated;
GRANT SELECT ON security_metrics_summary TO authenticated;
GRANT SELECT, UPDATE ON security_alerts TO authenticated;
GRANT ALL ON blocked_ips TO authenticated;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_org_timestamp 
    ON security_audit_log(organization_id, timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_event_severity 
    ON security_audit_log(event_type, severity);

-- Add comment for documentation
COMMENT ON TABLE security_audit_log IS 'Comprehensive security audit logging table for tracking all security-relevant events';
COMMENT ON TABLE security_metrics_summary IS 'Daily aggregated security metrics for reporting and monitoring';
COMMENT ON TABLE security_alerts IS 'Security alerts generated from patterns in audit logs';
COMMENT ON TABLE blocked_ips IS 'IP addresses that have been blocked due to security violations';