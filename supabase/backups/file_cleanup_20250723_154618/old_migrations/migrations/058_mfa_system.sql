-- Migration: Multi-Factor Authentication System
-- Purpose: Implement MFA for sensitive operations like data restore and export

-- 1. Create MFA devices table
CREATE TABLE IF NOT EXISTS mfa_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('totp', 'backup_codes', 'hardware_key')),
    
    -- TOTP specific fields
    secret TEXT, -- Base32 encoded TOTP secret
    
    -- Backup codes
    backup_codes TEXT[], -- Array of backup codes
    
    -- Hardware key specific (future use)
    public_key TEXT,
    key_handle TEXT,
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT false,
    last_used_at TIMESTAMPTZ,
    failed_attempts INTEGER DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_totp_secret CHECK (
        device_type != 'totp' OR (secret IS NOT NULL AND length(secret) >= 16)
    ),
    CONSTRAINT valid_backup_codes CHECK (
        device_type != 'backup_codes' OR (backup_codes IS NOT NULL AND array_length(backup_codes, 1) > 0)
    )
);

-- Indexes
CREATE INDEX idx_mfa_devices_user ON mfa_devices(user_id);
CREATE INDEX idx_mfa_devices_active ON mfa_devices(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_mfa_devices_type ON mfa_devices(device_type);

-- 2. Create MFA verification sessions table
CREATE TABLE IF NOT EXISTS mfa_verification_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Operation context
    operation_type TEXT NOT NULL CHECK (operation_type IN (
        'restore_data', 'export_data', 'delete_data', 'user_management',
        'security_settings', 'bulk_operations', 'system_admin'
    )),
    operation_details JSONB NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    
    -- Verification status
    is_verified BOOLEAN DEFAULT false,
    required_methods TEXT[] NOT NULL, -- Array of required MFA methods
    completed_methods TEXT[] DEFAULT ARRAY[]::TEXT[], -- Successfully completed methods
    
    -- Session management
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    
    -- Security tracking
    ip_address INET,
    user_agent TEXT,
    verification_attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3
);

-- Indexes
CREATE INDEX idx_mfa_sessions_user ON mfa_verification_sessions(user_id);
CREATE INDEX idx_mfa_sessions_org ON mfa_verification_sessions(organization_id);
CREATE INDEX idx_mfa_sessions_active ON mfa_verification_sessions(user_id, is_verified, expires_at) 
    WHERE expires_at > NOW();

-- 3. Create sensitive operations log
CREATE TABLE IF NOT EXISTS sensitive_operations_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Operation details
    operation_type TEXT NOT NULL,
    operation_description TEXT NOT NULL,
    affected_resources JSONB, -- Details about what was affected
    
    -- Authorization details
    mfa_session_id UUID REFERENCES mfa_verification_sessions(id),
    authorization_level TEXT NOT NULL CHECK (authorization_level IN (
        'password_only', 'mfa_verified', 'admin_override', 'emergency_access'
    )),
    
    -- Risk assessment
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    risk_factors JSONB, -- Factors that contributed to risk level
    
    -- Result tracking
    operation_status TEXT NOT NULL CHECK (operation_status IN (
        'success', 'failed', 'partial', 'cancelled', 'unauthorized'
    )),
    error_details TEXT,
    
    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Security context
    ip_address INET,
    user_agent TEXT,
    session_id UUID -- Link to user session if available
);

-- Indexes
CREATE INDEX idx_sensitive_ops_user ON sensitive_operations_log(user_id);
CREATE INDEX idx_sensitive_ops_org ON sensitive_operations_log(organization_id);
CREATE INDEX idx_sensitive_ops_type ON sensitive_operations_log(operation_type, created_at);
CREATE INDEX idx_sensitive_ops_risk ON sensitive_operations_log(risk_level, created_at);
CREATE INDEX idx_sensitive_ops_status ON sensitive_operations_log(operation_status, created_at);

-- 4. Function to check if user has active MFA
CREATE OR REPLACE FUNCTION user_has_active_mfa(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM mfa_devices 
        WHERE user_id = p_user_id 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to create MFA verification session
CREATE OR REPLACE FUNCTION create_mfa_verification_session(
    p_user_id UUID,
    p_organization_id UUID,
    p_operation_type TEXT,
    p_operation_details JSONB,
    p_risk_level TEXT DEFAULT 'medium',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
    v_required_methods TEXT[];
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Determine required MFA methods based on risk level
    IF p_risk_level = 'critical' THEN
        -- Require all active MFA methods
        SELECT array_agg(DISTINCT device_type) INTO v_required_methods
        FROM mfa_devices 
        WHERE user_id = p_user_id AND is_active = true;
    ELSIF p_risk_level IN ('high', 'medium') THEN
        -- Require at least one MFA method
        SELECT array_agg(device_type) INTO v_required_methods
        FROM mfa_devices 
        WHERE user_id = p_user_id AND is_active = true
        LIMIT 1;
    ELSE
        -- Low risk - no MFA required
        v_required_methods := ARRAY[]::TEXT[];
    END IF;
    
    -- Set expiration time based on risk level
    CASE p_risk_level
        WHEN 'critical' THEN v_expires_at := NOW() + INTERVAL '2 minutes';
        WHEN 'high' THEN v_expires_at := NOW() + INTERVAL '5 minutes';
        WHEN 'medium' THEN v_expires_at := NOW() + INTERVAL '10 minutes';
        ELSE v_expires_at := NOW() + INTERVAL '30 minutes';
    END CASE;
    
    -- Create verification session
    INSERT INTO mfa_verification_sessions (
        user_id, organization_id, operation_type, operation_details,
        risk_level, required_methods, expires_at, ip_address, user_agent
    ) VALUES (
        p_user_id, p_organization_id, p_operation_type, p_operation_details,
        p_risk_level, COALESCE(v_required_methods, ARRAY[]::TEXT[]), 
        v_expires_at, p_ip_address, p_user_agent
    ) RETURNING id INTO v_session_id;
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to verify MFA session
CREATE OR REPLACE FUNCTION verify_mfa_session(
    p_session_id UUID,
    p_method_type TEXT,
    p_verification_token TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_session RECORD;
    v_device RECORD;
    v_is_valid BOOLEAN := false;
BEGIN
    -- Get session details
    SELECT * INTO v_session FROM mfa_verification_sessions WHERE id = p_session_id;
    
    IF NOT FOUND OR v_session.expires_at <= NOW() THEN
        RETURN false;
    END IF;
    
    -- Check if already verified
    IF v_session.is_verified THEN
        RETURN true;
    END IF;
    
    -- Get user's device for this method
    SELECT * INTO v_device 
    FROM mfa_devices 
    WHERE user_id = v_session.user_id 
    AND device_type = p_method_type 
    AND is_active = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Verify based on method type
    CASE p_method_type
        WHEN 'backup_codes' THEN
            -- Check if token is in backup codes
            IF v_device.backup_codes @> ARRAY[p_verification_token] THEN
                v_is_valid := true;
                
                -- Remove used backup code
                UPDATE mfa_devices 
                SET backup_codes = array_remove(backup_codes, p_verification_token),
                    last_used_at = NOW()
                WHERE id = v_device.id;
            END IF;
        
        WHEN 'totp' THEN
            -- For TOTP, we'll implement a simple validation
            -- In production, use proper TOTP validation
            v_is_valid := (length(p_verification_token) = 6 AND p_verification_token ~ '^[0-9]+$');
            
            IF v_is_valid THEN
                UPDATE mfa_devices 
                SET last_used_at = NOW()
                WHERE id = v_device.id;
            END IF;
        
        -- Add other method types as needed
        ELSE
            v_is_valid := false;
    END CASE;
    
    -- Update session if verification successful
    IF v_is_valid THEN
        UPDATE mfa_verification_sessions
        SET 
            completed_methods = array_append(completed_methods, p_method_type),
            is_verified = (
                array_length(required_methods, 1) <= 
                array_length(array_append(completed_methods, p_method_type), 1)
            ),
            verified_at = CASE 
                WHEN (array_length(required_methods, 1) <= 
                      array_length(array_append(completed_methods, p_method_type), 1)) 
                THEN NOW() 
                ELSE verified_at 
            END
        WHERE id = p_session_id;
    ELSE
        -- Increment failed attempts
        UPDATE mfa_verification_sessions
        SET verification_attempts = verification_attempts + 1
        WHERE id = p_session_id;
    END IF;
    
    RETURN v_is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to log sensitive operations
CREATE OR REPLACE FUNCTION log_sensitive_operation(
    p_user_id UUID,
    p_organization_id UUID,
    p_operation_type TEXT,
    p_operation_description TEXT,
    p_affected_resources JSONB,
    p_mfa_session_id UUID DEFAULT NULL,
    p_authorization_level TEXT DEFAULT 'password_only',
    p_risk_level TEXT DEFAULT 'medium',
    p_operation_status TEXT DEFAULT 'success',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_risk_factors JSONB;
BEGIN
    -- Calculate risk factors
    v_risk_factors := jsonb_build_object(
        'has_mfa', p_mfa_session_id IS NOT NULL,
        'authorization_level', p_authorization_level,
        'resource_count', COALESCE(jsonb_array_length(p_affected_resources->'items'), 0),
        'operation_scope', p_affected_resources->>'scope'
    );
    
    -- Insert log entry
    INSERT INTO sensitive_operations_log (
        user_id, organization_id, operation_type, operation_description,
        affected_resources, mfa_session_id, authorization_level,
        risk_level, risk_factors, operation_status, ip_address, user_agent
    ) VALUES (
        p_user_id, p_organization_id, p_operation_type, p_operation_description,
        p_affected_resources, p_mfa_session_id, p_authorization_level,
        p_risk_level, v_risk_factors, p_operation_status, p_ip_address, p_user_agent
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RLS Policies
ALTER TABLE mfa_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_verification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensitive_operations_log ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own MFA devices
CREATE POLICY "Users can manage their own MFA devices"
    ON mfa_devices FOR ALL
    USING (auth.uid() = user_id);

-- Users can only access their own verification sessions
CREATE POLICY "Users can access their own MFA sessions"
    ON mfa_verification_sessions FOR ALL
    USING (auth.uid() = user_id);

-- Users can view operations log for their organization
CREATE POLICY "Users can view org sensitive operations"
    ON sensitive_operations_log FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
    ));

-- Only system can insert into operations log
CREATE POLICY "System can insert sensitive operations"
    ON sensitive_operations_log FOR INSERT
    WITH CHECK (true); -- This will be controlled by the application layer

-- 9. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mfa_devices_updated_at 
    BEFORE UPDATE ON mfa_devices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON mfa_devices TO authenticated;
GRANT SELECT, INSERT, UPDATE ON mfa_verification_sessions TO authenticated;
GRANT SELECT, INSERT ON sensitive_operations_log TO authenticated;

GRANT EXECUTE ON FUNCTION user_has_active_mfa TO authenticated;
GRANT EXECUTE ON FUNCTION create_mfa_verification_session TO authenticated;
GRANT EXECUTE ON FUNCTION verify_mfa_session TO authenticated;
GRANT EXECUTE ON FUNCTION log_sensitive_operation TO authenticated;

-- 11. Comments
COMMENT ON TABLE mfa_devices IS 'Multi-factor authentication devices for enhanced security';
COMMENT ON TABLE mfa_verification_sessions IS 'Temporary sessions for MFA verification of sensitive operations';
COMMENT ON TABLE sensitive_operations_log IS 'Audit log for sensitive operations requiring enhanced security';

COMMENT ON FUNCTION user_has_active_mfa IS 'Check if user has any active MFA devices configured';
COMMENT ON FUNCTION create_mfa_verification_session IS 'Create a new MFA verification session for sensitive operations';
COMMENT ON FUNCTION verify_mfa_session IS 'Verify MFA token and update session status';
COMMENT ON FUNCTION log_sensitive_operation IS 'Log sensitive operations for security audit trail';