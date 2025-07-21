-- Migration: Time-Travel and Restore RPC Functions
-- Purpose: Implement server-side functions for efficient time-travel queries and restore operations

-- 1. Function to get restore points (significant change moments)
CREATE OR REPLACE FUNCTION get_restore_points(
    p_organization_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days'
)
RETURNS TABLE (
    timestamp TIMESTAMPTZ,
    change_count BIGINT,
    affected_tables TEXT[],
    users_involved TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH hourly_changes AS (
        SELECT 
            date_trunc('hour', created_at) AS hour_timestamp,
            COUNT(*) AS changes,
            ARRAY_AGG(DISTINCT table_name) AS tables,
            ARRAY_AGG(DISTINCT user_email) AS users
        FROM audit_trail
        WHERE organization_id = p_organization_id
          AND created_at >= p_start_date
        GROUP BY date_trunc('hour', created_at)
    )
    SELECT 
        hour_timestamp,
        changes,
        tables,
        users
    FROM hourly_changes
    WHERE changes > 5  -- Only show hours with significant activity
    ORDER BY hour_timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to restore a record to a specific point in time
CREATE OR REPLACE FUNCTION restore_record_to_timestamp(
    p_organization_id UUID,
    p_table_name TEXT,
    p_record_id UUID,
    p_target_timestamp TIMESTAMPTZ,
    p_restored_by UUID,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_current_state JSONB;
    v_target_state JSONB;
    v_result JSONB;
    v_changes_count INTEGER := 0;
BEGIN
    -- Security check
    IF NOT EXISTS (
        SELECT 1 FROM organization_users 
        WHERE organization_id = p_organization_id 
          AND user_id = p_restored_by 
          AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: User not part of organization';
    END IF;
    
    -- Get target state at timestamp
    v_target_state := get_record_at_timestamp(p_table_name, p_record_id, p_target_timestamp, p_organization_id);
    
    IF v_target_state IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No record found at target timestamp'
        );
    END IF;
    
    -- Get current state
    EXECUTE format('SELECT to_jsonb(t) FROM %I t WHERE id = $1', p_table_name)
    INTO v_current_state
    USING p_record_id;
    
    -- Perform the restore based on table
    CASE p_table_name
        WHEN 'organization_requirements' THEN
            UPDATE organization_requirements
            SET 
                status = (v_target_state->>'status')::requirement_status,
                fulfillment_percentage = (v_target_state->>'fulfillment_percentage')::INTEGER,
                evidence = v_target_state->>'evidence',
                notes = v_target_state->>'notes',
                responsible_party = v_target_state->>'responsible_party',
                tags = ARRAY(SELECT jsonb_array_elements_text(v_target_state->'tags')),
                risk_level = v_target_state->>'risk_level',
                updated_at = NOW(),
                updated_by = p_restored_by
            WHERE id = p_record_id;
            v_changes_count := 1;
            
        -- Add other tables as needed
        ELSE
            RAISE EXCEPTION 'Restore not implemented for table: %', p_table_name;
    END CASE;
    
    -- Log the restore in audit trail
    INSERT INTO audit_trail (
        organization_id, table_name, record_id, action,
        user_id, user_email, old_values, new_values,
        application_context
    ) VALUES (
        p_organization_id, p_table_name, p_record_id, 'RESTORE',
        p_restored_by, 
        (SELECT email FROM auth.users WHERE id = p_restored_by),
        v_current_state, v_target_state,
        jsonb_build_object(
            'restore_reason', p_reason,
            'restore_timestamp', p_target_timestamp
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'changes_count', v_changes_count,
        'restored_to', p_target_timestamp
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to restore all changes from a user session
CREATE OR REPLACE FUNCTION restore_user_session(
    p_organization_id UUID,
    p_session_id UUID,
    p_restored_by UUID,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_change RECORD;
    v_restored_count INTEGER := 0;
    v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Security check
    IF NOT EXISTS (
        SELECT 1 FROM organization_users 
        WHERE organization_id = p_organization_id 
          AND user_id = p_restored_by 
          AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: User not part of organization';
    END IF;
    
    -- Loop through all changes in the session in reverse order
    FOR v_change IN
        SELECT *
        FROM audit_trail
        WHERE organization_id = p_organization_id
          AND session_id = p_session_id
          AND action != 'RESTORE'
        ORDER BY created_at DESC
    LOOP
        BEGIN
            -- Restore based on action type
            CASE v_change.action
                WHEN 'INSERT' THEN
                    -- Delete the inserted record
                    EXECUTE format('DELETE FROM %I WHERE id = $1', v_change.table_name)
                    USING v_change.record_id;
                    
                WHEN 'UPDATE' THEN
                    -- Restore old values
                    PERFORM restore_record_values(
                        v_change.table_name,
                        v_change.record_id,
                        v_change.old_values
                    );
                    
                WHEN 'DELETE' THEN
                    -- Re-insert the deleted record
                    EXECUTE format('INSERT INTO %I SELECT * FROM jsonb_populate_record(null::%I, $1)', 
                        v_change.table_name, v_change.table_name)
                    USING v_change.old_values;
            END CASE;
            
            v_restored_count := v_restored_count + 1;
        EXCEPTION WHEN OTHERS THEN
            v_errors := array_append(v_errors, 
                format('Failed to restore %s on %s: %s', 
                    v_change.action, v_change.table_name, SQLERRM));
        END;
    END LOOP;
    
    -- Log the session restore
    INSERT INTO restore_history (
        organization_id, restored_by, restore_type,
        restore_point, affected_table, affected_records,
        reason, changes_summary
    ) VALUES (
        p_organization_id, p_restored_by, 'USER_SESSION',
        NOW(), 'multiple', 
        ARRAY(SELECT DISTINCT record_id FROM audit_trail WHERE session_id = p_session_id),
        p_reason,
        jsonb_build_object(
            'session_id', p_session_id,
            'restored_count', v_restored_count,
            'errors', v_errors
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'restored_count', v_restored_count,
        'errors', v_errors
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Helper function to restore record values
CREATE OR REPLACE FUNCTION restore_record_values(
    p_table_name TEXT,
    p_record_id UUID,
    p_values JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    v_sql TEXT;
    v_set_clause TEXT;
BEGIN
    -- Build the SET clause dynamically
    SELECT string_agg(
        format('%I = ($1::jsonb)->>%L', key, key),
        ', '
    ) INTO v_set_clause
    FROM jsonb_object_keys(p_values) AS key
    WHERE key NOT IN ('id', 'created_at'); -- Don't update these
    
    -- Build and execute the UPDATE
    v_sql := format('UPDATE %I SET %s WHERE id = $2', 
        p_table_name, v_set_clause);
    
    EXECUTE v_sql USING p_values, p_record_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to get changes summary for preview
CREATE OR REPLACE FUNCTION preview_restore_changes(
    p_organization_id UUID,
    p_restore_type TEXT,
    p_target_timestamp TIMESTAMPTZ DEFAULT NULL,
    p_session_id UUID DEFAULT NULL,
    p_table_name TEXT DEFAULT NULL,
    p_record_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
    table_name TEXT,
    record_id UUID,
    action TEXT,
    field_changes JSONB,
    change_timestamp TIMESTAMPTZ
) AS $$
BEGIN
    CASE p_restore_type
        WHEN 'TIME_POINT' THEN
            RETURN QUERY
            SELECT 
                at.table_name,
                at.record_id,
                at.action,
                jsonb_object_agg(
                    change.key,
                    jsonb_build_object(
                        'old', at.old_values->change.key,
                        'new', at.new_values->change.key
                    )
                ) AS field_changes,
                at.created_at
            FROM audit_trail at,
                 jsonb_object_keys(COALESCE(at.old_values, '{}'::jsonb) || 
                                  COALESCE(at.new_values, '{}'::jsonb)) AS change(key)
            WHERE at.organization_id = p_organization_id
              AND at.created_at > p_target_timestamp
            GROUP BY at.id, at.table_name, at.record_id, at.action, at.created_at
            ORDER BY at.created_at DESC;
            
        WHEN 'USER_SESSION' THEN
            RETURN QUERY
            SELECT 
                at.table_name,
                at.record_id,
                at.action,
                jsonb_build_object(
                    'changed_fields', at.changed_fields,
                    'old_values', at.old_values,
                    'new_values', at.new_values
                ) AS field_changes,
                at.created_at
            FROM audit_trail at
            WHERE at.organization_id = p_organization_id
              AND at.session_id = p_session_id
            ORDER BY at.created_at DESC;
            
        -- Add other restore types as needed
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(
    p_organization_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
    user_id UUID,
    user_email TEXT,
    session_count BIGINT,
    total_changes BIGINT,
    insert_count BIGINT,
    update_count BIGINT,
    delete_count BIGINT,
    tables_affected TEXT[],
    last_activity TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        at.user_id,
        at.user_email,
        COUNT(DISTINCT at.session_id) AS session_count,
        COUNT(*) AS total_changes,
        COUNT(*) FILTER (WHERE at.action = 'INSERT') AS insert_count,
        COUNT(*) FILTER (WHERE at.action = 'UPDATE') AS update_count,
        COUNT(*) FILTER (WHERE at.action = 'DELETE') AS delete_count,
        ARRAY_AGG(DISTINCT at.table_name) AS tables_affected,
        MAX(at.created_at) AS last_activity
    FROM audit_trail at
    WHERE at.organization_id = p_organization_id
      AND at.created_at BETWEEN p_start_date AND p_end_date
    GROUP BY at.user_id, at.user_email
    ORDER BY total_changes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_restore_points TO authenticated;
GRANT EXECUTE ON FUNCTION restore_record_to_timestamp TO authenticated;
GRANT EXECUTE ON FUNCTION restore_user_session TO authenticated;
GRANT EXECUTE ON FUNCTION preview_restore_changes TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_activity_summary TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION get_restore_points IS 'Get significant change points for an organization to use as restore targets';
COMMENT ON FUNCTION restore_record_to_timestamp IS 'Restore a single record to its state at a specific timestamp';
COMMENT ON FUNCTION restore_user_session IS 'Undo all changes made during a specific user session';
COMMENT ON FUNCTION preview_restore_changes IS 'Preview what changes would be made by a restore operation';
COMMENT ON FUNCTION get_user_activity_summary IS 'Get summary of user activities for the activity view';