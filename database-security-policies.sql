-- Enhanced RLS Policies for Supabase MFA Integration
-- These policies leverage native Supabase MFA capabilities for enhanced security

-- 1. Helper function to check MFA status
CREATE OR REPLACE FUNCTION check_mfa_required()
RETURNS boolean AS $$
BEGIN
  -- Check if current session has AAL2 (completed MFA)
  -- This uses Supabase's native JWT claims
  RETURN (auth.jwt() ->> 'aal') = 'aal2';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Helper function to check if user has MFA factors enrolled
CREATE OR REPLACE FUNCTION user_has_mfa_enrolled(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  -- Check if user has any verified MFA factors
  -- This integrates with Supabase's native MFA tables
  RETURN EXISTS (
    SELECT 1 
    FROM auth.mfa_factors 
    WHERE user_id = $1 
    AND status = 'verified'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Helper function to get authentication methods used
CREATE OR REPLACE FUNCTION get_recent_auth_methods()
RETURNS text[] AS $$
BEGIN
  -- Extract authentication methods reference (AMR) from JWT
  -- This shows what methods were used (password, totp, etc.)
  RETURN ARRAY(
    SELECT jsonb_array_elements_text(
      COALESCE(auth.jwt() -> 'amr', '[]'::jsonb)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enhanced security policy for sensitive operations
-- Apply to tables that contain sensitive data or critical operations

-- Example: Enhanced policy for organizations table
DROP POLICY IF EXISTS "organizations_mfa_policy" ON organizations;
CREATE POLICY "organizations_mfa_policy"
  ON organizations
  AS RESTRICTIVE
  TO authenticated
  USING (
    -- Standard organization membership check
    id IN (
      SELECT ou.organization_id 
      FROM organization_users ou 
      WHERE ou.user_id = auth.uid() 
      AND ou.status = 'active'
    )
    AND
    -- Enhanced MFA requirement for sensitive operations
    CASE 
      -- For SELECT operations, allow with basic auth
      WHEN current_setting('request.method', true) = 'GET' THEN true
      -- For modifications, require MFA if user has it enrolled
      WHEN user_has_mfa_enrolled() THEN check_mfa_required()
      -- If no MFA enrolled, allow (but encourage enrollment)
      ELSE true
    END
  );

-- 5. Strict MFA policy for high-security tables
-- Example: For sensitive user data or admin functions

-- Example: Enhanced policy for backup_restore_logs (sensitive operations)
DROP POLICY IF EXISTS "backup_restore_mfa_required" ON backup_restore_logs;
CREATE POLICY "backup_restore_mfa_required"
  ON backup_restore_logs
  AS RESTRICTIVE
  TO authenticated
  USING (
    -- Only platform admins can access backup logs
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN user_roles ur ON ou.role_id = ur.id
      WHERE ou.user_id = auth.uid()
      AND ou.status = 'active'
      AND ur.name = 'platform_admin'
    )
    AND
    -- Require MFA completion for all access to backup logs
    check_mfa_required()
  );

-- 6. Time-sensitive MFA policy
-- Require recent MFA verification for critical operations

CREATE OR REPLACE FUNCTION check_recent_mfa(required_within_minutes integer DEFAULT 30)
RETURNS boolean AS $$
DECLARE
  amr_claim jsonb;
  recent_mfa timestamp;
BEGIN
  -- Get authentication methods reference
  amr_claim := auth.jwt() -> 'amr';
  
  -- Find the most recent MFA authentication (totp, phone, etc.)
  SELECT TO_TIMESTAMP(
    (SELECT jsonb_array_elements(amr_claim) ->> 'timestamp')::integer
  ) INTO recent_mfa
  FROM jsonb_array_elements(amr_claim)
  WHERE jsonb_array_elements(amr_claim) ->> 'method' IN ('totp', 'phone')
  ORDER BY (jsonb_array_elements(amr_claim) ->> 'timestamp')::integer DESC
  LIMIT 1;
  
  -- Check if MFA was used recently
  RETURN recent_mfa IS NOT NULL 
    AND recent_mfa > NOW() - (required_within_minutes || ' minutes')::interval;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Policy for financial/billing data requiring recent MFA
DROP POLICY IF EXISTS "billing_recent_mfa_required" ON organization_billing;
CREATE POLICY "billing_recent_mfa_required"
  ON organization_billing
  AS RESTRICTIVE  
  TO authenticated
  USING (
    -- User must be admin of the organization
    organization_id IN (
      SELECT ou.organization_id 
      FROM organization_users ou 
      JOIN user_roles ur ON ou.role_id = ur.id
      WHERE ou.user_id = auth.uid() 
      AND ou.status = 'active'
      AND ur.permissions ? 'manage_billing'
    )
    AND
    -- Require MFA within last 15 minutes for billing access
    (NOT user_has_mfa_enrolled() OR check_recent_mfa(15))
  );

-- 8. Graduated MFA enforcement policy
-- Different security levels based on data sensitivity

CREATE OR REPLACE FUNCTION get_data_sensitivity_level(table_name text)
RETURNS text AS $$
BEGIN
  CASE table_name
    WHEN 'organization_billing', 'payment_methods', 'invoices' THEN RETURN 'high';
    WHEN 'organization_users', 'user_roles', 'mfa_devices' THEN RETURN 'medium';
    ELSE RETURN 'low';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 9. Dynamic MFA policy based on risk assessment
CREATE OR REPLACE FUNCTION assess_operation_risk(
  operation_type text,
  table_name text,
  user_role text DEFAULT NULL
)
RETURNS text AS $$
DECLARE
  risk_level text := 'low';
BEGIN
  -- Base risk assessment
  IF operation_type IN ('DELETE', 'TRUNCATE') THEN
    risk_level := 'high';
  ELSIF operation_type IN ('UPDATE', 'INSERT') THEN
    risk_level := 'medium';
  END IF;
  
  -- Increase risk for sensitive tables
  IF table_name IN ('organization_billing', 'backup_restore_logs', 'mfa_devices') THEN
    risk_level := 'high';
  END IF;
  
  -- Increase risk for admin operations
  IF user_role = 'platform_admin' THEN
    risk_level := 'high';
  END IF;
  
  RETURN risk_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 10. Comprehensive MFA enforcement policy template
-- This can be adapted for any table requiring MFA protection

CREATE OR REPLACE FUNCTION create_mfa_policy(target_table text, policy_name text)
RETURNS void AS $$
DECLARE
  sql_command text;
BEGIN
  sql_command := format('
    CREATE POLICY %I
      ON %I
      AS RESTRICTIVE
      TO authenticated
      USING (
        -- Standard access control (customize per table)
        true  -- Replace with table-specific access rules
        AND
        -- MFA requirement based on operation risk
        CASE 
          WHEN assess_operation_risk(
            current_setting(''request.method'', true), 
            ''%s'', 
            (SELECT ur.name FROM user_roles ur 
             JOIN organization_users ou ON ou.role_id = ur.id 
             WHERE ou.user_id = auth.uid() LIMIT 1)
          ) = ''high'' THEN 
            user_has_mfa_enrolled() AND check_mfa_required()
          WHEN assess_operation_risk(
            current_setting(''request.method'', true), 
            ''%s'', 
            NULL
          ) = ''medium'' THEN 
            (NOT user_has_mfa_enrolled()) OR check_mfa_required()
          ELSE true
        END
      );
  ', policy_name, target_table, target_table, target_table);
  
  EXECUTE sql_command;
END;
$$ LANGUAGE plpgsql;

-- 11. MFA enrollment encouragement policy
-- This policy allows access but logs when MFA should be encouraged

CREATE OR REPLACE FUNCTION log_mfa_recommendation(
  user_id uuid,
  operation_type text,
  table_name text
)
RETURNS void AS $$
BEGIN
  -- Log recommendation for MFA setup (optional analytics)
  INSERT INTO mfa_recommendations (user_id, operation_type, table_name, recommended_at)
  VALUES (user_id, operation_type, table_name, NOW())
  ON CONFLICT (user_id, table_name) DO UPDATE SET 
    recommendation_count = mfa_recommendations.recommendation_count + 1,
    last_recommended_at = NOW();
  
EXCEPTION WHEN others THEN
  -- Silently fail if table doesn't exist (optional feature)
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Security monitoring and alerting
-- Track suspicious activity patterns

CREATE OR REPLACE FUNCTION monitor_security_events()
RETURNS trigger AS $$
DECLARE
  user_has_mfa boolean;
  current_aal text;
  risk_level text;
BEGIN
  -- Get current user's MFA status
  user_has_mfa := user_has_mfa_enrolled();
  current_aal := auth.jwt() ->> 'aal';
  
  -- Assess operation risk
  risk_level := assess_operation_risk(TG_OP, TG_TABLE_NAME);
  
  -- Log high-risk operations without proper MFA
  IF risk_level = 'high' AND user_has_mfa AND current_aal != 'aal2' THEN
    -- Log security event (implement as needed)
    PERFORM log_security_event(
      auth.uid(),
      'HIGH_RISK_WITHOUT_MFA',
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'has_mfa', user_has_mfa,
        'current_aal', current_aal
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Apply MFA monitoring to sensitive tables
-- CREATE TRIGGER security_monitor BEFORE INSERT OR UPDATE OR DELETE ON sensitive_table
--   FOR EACH ROW EXECUTE FUNCTION monitor_security_events();

-- 14. Helper view for MFA status dashboard
CREATE OR REPLACE VIEW user_mfa_status AS
SELECT 
  u.id,
  u.email,
  user_has_mfa_enrolled(u.id) as mfa_enrolled,
  (
    SELECT COUNT(*) 
    FROM auth.mfa_factors mf 
    WHERE mf.user_id = u.id AND mf.status = 'verified'
  ) as verified_factors,
  (
    SELECT array_agg(mf.factor_type)
    FROM auth.mfa_factors mf 
    WHERE mf.user_id = u.id AND mf.status = 'verified'
  ) as factor_types,
  CASE 
    WHEN user_has_mfa_enrolled(u.id) THEN 'Protected'
    ELSE 'Vulnerable'
  END as security_status
FROM auth.users u
WHERE auth.uid() = u.id  -- Only show current user's status
   OR EXISTS (  -- Or if user is platform admin
     SELECT 1 FROM organization_users ou
     JOIN user_roles ur ON ou.role_id = ur.id
     WHERE ou.user_id = auth.uid()
     AND ur.name = 'platform_admin'
   );

-- 15. Security recommendations query
CREATE OR REPLACE FUNCTION get_security_recommendations()
RETURNS TABLE (
  recommendation text,
  priority text,
  description text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE
      WHEN NOT user_has_mfa_enrolled() THEN 'Enable MFA'
      WHEN (auth.jwt() ->> 'aal') != 'aal2' THEN 'Complete MFA Challenge'  
      ELSE 'Security Up to Date'
    END::text as recommendation,
    CASE
      WHEN NOT user_has_mfa_enrolled() THEN 'HIGH'
      WHEN (auth.jwt() ->> 'aal') != 'aal2' THEN 'MEDIUM'
      ELSE 'INFO'
    END::text as priority,
    CASE
      WHEN NOT user_has_mfa_enrolled() THEN 'Set up multi-factor authentication to protect your account from unauthorized access'
      WHEN (auth.jwt() ->> 'aal') != 'aal2' THEN 'Complete the multi-factor authentication challenge to access sensitive features'
      ELSE 'Your account security is properly configured'
    END::text as description;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_mfa_required() TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_mfa_enrolled(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_auth_methods() TO authenticated;
GRANT EXECUTE ON FUNCTION check_recent_mfa(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_security_recommendations() TO authenticated;

GRANT SELECT ON user_mfa_status TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION check_mfa_required() IS 'Checks if current session has completed MFA (AAL2)';
COMMENT ON FUNCTION user_has_mfa_enrolled(uuid) IS 'Checks if user has any verified MFA factors enrolled';
COMMENT ON FUNCTION get_recent_auth_methods() IS 'Returns array of authentication methods used in current session';
COMMENT ON FUNCTION check_recent_mfa(integer) IS 'Checks if MFA was completed within specified minutes';
COMMENT ON VIEW user_mfa_status IS 'Provides MFA status overview for users and admins';
COMMENT ON FUNCTION get_security_recommendations() IS 'Returns personalized security recommendations based on current MFA status';

-- Usage Examples:
/*
-- Example 1: Apply to sensitive user management table
SELECT create_mfa_policy('organization_users', 'org_users_mfa_policy');

-- Example 2: Check if current user needs to enable MFA
SELECT * FROM get_security_recommendations();

-- Example 3: View MFA status for current user
SELECT * FROM user_mfa_status;

-- Example 4: Custom policy for specific table
CREATE POLICY "custom_mfa_policy"
  ON your_sensitive_table
  AS RESTRICTIVE
  TO authenticated
  USING (
    your_access_condition
    AND
    (NOT user_has_mfa_enrolled() OR check_mfa_required())
  );
*/