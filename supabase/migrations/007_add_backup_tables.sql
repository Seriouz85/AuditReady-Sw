-- ============================================================================
-- Backup Management Tables
-- ============================================================================

-- Backup history table
CREATE TABLE IF NOT EXISTS backup_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    size_bytes BIGINT,
    tables TEXT[],
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
    file_path TEXT,
    storage_location TEXT,
    compression_type TEXT DEFAULT 'gzip',
    encryption_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_by UUID REFERENCES platform_administrators(id),
    error_message TEXT,
    metadata JSONB
);

-- Backup schedules
CREATE TABLE IF NOT EXISTS backup_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    time TIME NOT NULL, -- Time of day to run backup
    enabled BOOLEAN DEFAULT true,
    tables TEXT[],
    retention_days INTEGER DEFAULT 30,
    compression BOOLEAN DEFAULT true,
    encryption BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES platform_administrators(id)
);

-- Backup restore logs
CREATE TABLE IF NOT EXISTS backup_restore_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_id UUID REFERENCES backup_history(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
    tables_restored TEXT[],
    records_restored INTEGER,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    restored_by UUID REFERENCES platform_administrators(id),
    error_message TEXT,
    metadata JSONB
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_backup_history_status ON backup_history(status);
CREATE INDEX idx_backup_history_created ON backup_history(created_at);
CREATE INDEX idx_backup_schedules_enabled ON backup_schedules(enabled);
CREATE INDEX idx_backup_schedules_next_run ON backup_schedules(next_run_at) WHERE enabled = true;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_restore_logs ENABLE ROW LEVEL SECURITY;

-- Platform admin policies
CREATE POLICY "Platform admins access backup_history" ON backup_history
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

CREATE POLICY "Platform admins access backup_schedules" ON backup_schedules
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

CREATE POLICY "Platform admins access backup_restore_logs" ON backup_restore_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_backup_schedules_updated_at 
    BEFORE UPDATE ON backup_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- BACKUP MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to calculate next backup run time
CREATE OR REPLACE FUNCTION calculate_next_backup_run(
    frequency TEXT,
    backup_time TIME,
    last_run TIMESTAMP DEFAULT NULL
) RETURNS TIMESTAMP AS $$
DECLARE
    base_date TIMESTAMP;
    next_run TIMESTAMP;
BEGIN
    -- Use last run date or current date as base
    base_date := COALESCE(last_run, NOW());
    
    -- Calculate next run based on frequency
    CASE frequency
        WHEN 'daily' THEN
            next_run := DATE_TRUNC('day', base_date) + INTERVAL '1 day' + backup_time;
        WHEN 'weekly' THEN
            -- Run on Sundays
            next_run := DATE_TRUNC('week', base_date) + INTERVAL '1 week' + backup_time;
        WHEN 'monthly' THEN
            -- Run on the 1st of each month
            next_run := DATE_TRUNC('month', base_date) + INTERVAL '1 month' + backup_time;
        ELSE
            -- Default to daily
            next_run := DATE_TRUNC('day', base_date) + INTERVAL '1 day' + backup_time;
    END CASE;
    
    -- If the calculated time is in the past, add another interval
    IF next_run <= NOW() THEN
        CASE frequency
            WHEN 'daily' THEN
                next_run := next_run + INTERVAL '1 day';
            WHEN 'weekly' THEN
                next_run := next_run + INTERVAL '1 week';
            WHEN 'monthly' THEN
                next_run := next_run + INTERVAL '1 month';
        END CASE;
    END IF;
    
    RETURN next_run;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending backup schedules
CREATE OR REPLACE FUNCTION get_pending_backup_schedules()
RETURNS TABLE (
    schedule_id UUID,
    schedule_name TEXT,
    tables TEXT[],
    compression BOOLEAN,
    encryption BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bs.id,
        bs.name,
        bs.tables,
        bs.compression,
        bs.encryption
    FROM backup_schedules bs
    WHERE bs.enabled = true
      AND bs.next_run_at <= NOW()
    ORDER BY bs.next_run_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update backup schedule after run
CREATE OR REPLACE FUNCTION update_backup_schedule_after_run(
    schedule_id UUID,
    success BOOLEAN DEFAULT true
) RETURNS VOID AS $$
DECLARE
    schedule_rec RECORD;
BEGIN
    -- Get schedule details
    SELECT * INTO schedule_rec
    FROM backup_schedules
    WHERE id = schedule_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Backup schedule not found: %', schedule_id;
    END IF;
    
    -- Update last run and calculate next run
    UPDATE backup_schedules
    SET 
        last_run_at = NOW(),
        next_run_at = calculate_next_backup_run(
            schedule_rec.frequency,
            schedule_rec.time,
            NOW()
        ),
        updated_at = NOW()
    WHERE id = schedule_id;
    
    -- Log the schedule execution
    INSERT INTO enhanced_audit_logs (
        action,
        resource_type,
        resource_id,
        actor_type,
        details
    ) VALUES (
        CASE WHEN success THEN 'backup_schedule_executed' ELSE 'backup_schedule_failed' END,
        'backup_schedule',
        schedule_id,
        'system',
        jsonb_build_object(
            'schedule_name', schedule_rec.name,
            'success', success,
            'timestamp', NOW()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_next_backup_run(TEXT, TIME, TIMESTAMP) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_backup_schedules() TO authenticated;
GRANT EXECUTE ON FUNCTION update_backup_schedule_after_run(UUID, BOOLEAN) TO authenticated;