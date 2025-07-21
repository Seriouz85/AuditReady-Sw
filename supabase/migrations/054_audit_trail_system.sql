-- Migration: Comprehensive Audit Trail System for Time-Travel and Restore Capabilities
-- Purpose: Enable point-in-time recovery, user action tracking, and compliance auditing

-- 1. Create audit trail table
CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'RESTORE')),
    user_id UUID NOT NULL,
    user_email TEXT NOT NULL,
    session_id UUID,
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    application_context JSONB, -- For tracking which page/feature triggered the change
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Performance indexes
    CONSTRAINT audit_trail_org_check CHECK (organization_id IS NOT NULL)
);

-- Create indexes for performance
CREATE INDEX idx_audit_org_time ON audit_trail(organization_id, created_at DESC);
CREATE INDEX idx_audit_user_time ON audit_trail(user_id, created_at DESC);
CREATE INDEX idx_audit_table_record ON audit_trail(table_name, record_id, created_at DESC);
CREATE INDEX idx_audit_session ON audit_trail(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_audit_action ON audit_trail(action, created_at DESC);

-- 2. Create restore history table
CREATE TABLE IF NOT EXISTS restore_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    restored_by UUID NOT NULL,
    restore_type TEXT NOT NULL CHECK (restore_type IN ('FIELD', 'RECORD', 'USER_SESSION', 'TIME_POINT', 'BULK')),
    restore_point TIMESTAMPTZ NOT NULL,
    
    -- What was restored
    affected_table TEXT NOT NULL,
    affected_records UUID[],
    affected_fields TEXT[],
    
    -- Restore metadata
    reason TEXT,
    approved_by UUID,
    approval_timestamp TIMESTAMPTZ,
    
    -- Audit
    changes_summary JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_restore_history_org ON restore_history(organization_id, created_at DESC);

-- 3. Create session tracking table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    session_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    session_end TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    
    -- Session metadata
    total_changes INTEGER DEFAULT 0,
    tables_modified TEXT[],
    
    CONSTRAINT session_org_check CHECK (organization_id IS NOT NULL)
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id, session_start DESC);
CREATE INDEX idx_sessions_org ON user_sessions(organization_id, session_start DESC);

-- 4. Create backup metadata table
CREATE TABLE IF NOT EXISTS backup_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    backup_type TEXT NOT NULL CHECK (backup_type IN ('AUTOMATIC', 'MANUAL', 'PRE_RESTORE')),
    backup_scope TEXT NOT NULL CHECK (backup_scope IN ('FULL', 'INCREMENTAL', 'TABLE', 'RECORD')),
    
    -- Backup details
    tables_included TEXT[],
    record_count INTEGER,
    size_bytes BIGINT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED')),
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_backup_metadata_org ON backup_metadata(organization_id, created_at DESC);

-- 5. Function to get change diff
CREATE OR REPLACE FUNCTION jsonb_diff(old_val JSONB, new_val JSONB)
RETURNS TABLE(field TEXT, old_value JSONB, new_value JSONB) AS $$
BEGIN
    -- Find changed fields
    RETURN QUERY
    SELECT 
        key AS field,
        old_val->key AS old_value,
        new_val->key AS new_value
    FROM (
        SELECT DISTINCT key 
        FROM (
            SELECT jsonb_object_keys(old_val) AS key
            UNION
            SELECT jsonb_object_keys(new_val) AS key
        ) keys
    ) all_keys
    WHERE (old_val->key IS DISTINCT FROM new_val->key);
END;
$$ LANGUAGE plpgsql;

-- 6. Function to log audit trail
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_organization_id UUID;
    v_old_values JSONB;
    v_new_values JSONB;
    v_changed_fields TEXT[];
BEGIN
    -- Get user context (this assumes you set these in your application)
    v_user_id := COALESCE(current_setting('app.current_user_id', true)::UUID, '00000000-0000-0000-0000-000000000000'::UUID);
    v_user_email := COALESCE(current_setting('app.current_user_email', true), 'system');
    
    -- Determine organization_id based on the table
    IF TG_TABLE_NAME = 'organizations' THEN
        v_organization_id := COALESCE(NEW.id, OLD.id);
    ELSIF TG_TABLE_NAME IN ('organization_requirements', 'organization_standards') THEN
        v_organization_id := COALESCE(NEW.organization_id, OLD.organization_id);
    ELSE
        -- For other tables, try to get from context
        v_organization_id := current_setting('app.current_organization_id', true)::UUID;
    END IF;
    
    -- Skip if no organization context (system operations)
    IF v_organization_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Prepare data based on operation
    IF TG_OP = 'DELETE' THEN
        v_old_values := to_jsonb(OLD);
        v_new_values := NULL;
        v_changed_fields := ARRAY(SELECT jsonb_object_keys(v_old_values));
    ELSIF TG_OP = 'INSERT' THEN
        v_old_values := NULL;
        v_new_values := to_jsonb(NEW);
        v_changed_fields := ARRAY(SELECT jsonb_object_keys(v_new_values));
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_values := to_jsonb(OLD);
        v_new_values := to_jsonb(NEW);
        
        -- Get only changed fields
        SELECT ARRAY_AGG(field) INTO v_changed_fields
        FROM jsonb_diff(v_old_values, v_new_values);
    END IF;
    
    -- Insert audit record
    INSERT INTO audit_trail (
        organization_id,
        table_name,
        record_id,
        action,
        user_id,
        user_email,
        session_id,
        old_values,
        new_values,
        changed_fields,
        ip_address,
        user_agent
    ) VALUES (
        v_organization_id,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        v_user_id,
        v_user_email,
        current_setting('app.current_session_id', true)::UUID,
        v_old_values,
        v_new_values,
        v_changed_fields,
        current_setting('app.current_ip_address', true)::INET,
        current_setting('app.current_user_agent', true)
    );
    
    -- Update session tracking
    UPDATE user_sessions 
    SET total_changes = total_changes + 1,
        tables_modified = ARRAY(SELECT DISTINCT unnest(tables_modified || TG_TABLE_NAME::TEXT))
    WHERE id = current_setting('app.current_session_id', true)::UUID;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create audit triggers for critical tables
CREATE TRIGGER audit_organization_requirements
    AFTER INSERT OR UPDATE OR DELETE ON organization_requirements
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_organizations
    AFTER INSERT OR UPDATE OR DELETE ON organizations
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_organization_standards
    AFTER INSERT OR UPDATE OR DELETE ON organization_standards
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- 8. Function to get point-in-time data
CREATE OR REPLACE FUNCTION get_record_at_timestamp(
    p_table_name TEXT,
    p_record_id UUID,
    p_timestamp TIMESTAMPTZ,
    p_organization_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_record JSONB;
    v_audit RECORD;
BEGIN
    -- Get the latest state before the timestamp
    FOR v_audit IN
        SELECT *
        FROM audit_trail
        WHERE table_name = p_table_name
          AND record_id = p_record_id
          AND organization_id = p_organization_id
          AND created_at <= p_timestamp
        ORDER BY created_at DESC
    LOOP
        IF v_audit.action = 'DELETE' THEN
            -- Record was deleted before this timestamp
            RETURN NULL;
        ELSIF v_audit.action = 'INSERT' THEN
            -- This is the creation, return the values
            RETURN v_audit.new_values;
        ELSIF v_audit.action = 'UPDATE' THEN
            -- Apply updates backwards to reconstruct the state
            IF v_record IS NULL THEN
                -- Start with current state and work backwards
                EXECUTE format('SELECT to_jsonb(t) FROM %I t WHERE id = $1', p_table_name)
                INTO v_record
                USING p_record_id;
            END IF;
            
            -- Apply the old values for this update
            v_record := v_record || v_audit.old_values;
        END IF;
    END LOOP;
    
    RETURN v_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RLS policies for audit tables
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE restore_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_metadata ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their organization's audit trail
CREATE POLICY "Users can view their organization's audit trail"
    ON audit_trail FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
    ));

CREATE POLICY "Users can view their organization's restore history"
    ON restore_history FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
    ));

CREATE POLICY "Users can view their organization's sessions"
    ON user_sessions FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
    ));

-- 10. Grant permissions
GRANT SELECT ON audit_trail TO authenticated;
GRANT SELECT ON restore_history TO authenticated;
GRANT SELECT ON user_sessions TO authenticated;
GRANT SELECT ON backup_metadata TO authenticated;

-- Add comment
COMMENT ON TABLE audit_trail IS 'Comprehensive audit trail for all data changes, enabling time-travel queries and point-in-time recovery';
COMMENT ON TABLE restore_history IS 'History of all restore operations performed by users';
COMMENT ON TABLE user_sessions IS 'Track user sessions for grouping related changes';
COMMENT ON TABLE backup_metadata IS 'Metadata about backups created by the system';