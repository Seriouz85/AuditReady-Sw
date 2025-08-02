-- ============================================================================
-- Comprehensive Row Level Security (RLS) Policies
-- Complete multi-tenant data isolation with role-based access control
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- ============================================================================

-- Function to check if user is platform admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM platform_administrators 
        WHERE email = auth.email() AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organization IDs
CREATE OR REPLACE FUNCTION get_user_organizations()
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT organization_id 
        FROM organization_users 
        WHERE email = auth.email() AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
BEGIN
    -- Platform admins have all permissions
    IF is_platform_admin() THEN
        RETURN true;
    END IF;

    -- Get user's role permissions
    SELECT ur.permissions INTO user_permissions
    FROM organization_users ou
    JOIN user_roles ur ON ou.role_id = ur.name
    WHERE ou.email = auth.email() AND ou.is_active = true
    LIMIT 1;

    -- Check if user has wildcard permission or specific permission
    RETURN user_permissions ? '*' OR user_permissions ? permission_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access organization data
CREATE OR REPLACE FUNCTION can_access_organization(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Platform admins can access all organizations
    IF is_platform_admin() THEN
        RETURN true;
    END IF;

    -- Check if user belongs to organization
    RETURN org_id = ANY(get_user_organizations());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organization role
CREATE OR REPLACE FUNCTION get_user_role(org_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role_id INTO user_role
    FROM organization_users 
    WHERE email = auth.email() 
    AND organization_id = org_id 
    AND is_active = true;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CORE ORGANIZATION AND USER POLICIES
-- ============================================================================

-- Organizations: Users can only access their own organizations
DROP POLICY IF EXISTS "Organization users access own org" ON organizations;
CREATE POLICY "Organization access control" ON organizations
    FOR ALL TO authenticated
    USING (can_access_organization(id))
    WITH CHECK (can_access_organization(id));

-- Organization users: Enhanced with role-based access
DROP POLICY IF EXISTS "Organization users access own org users" ON organization_users;
CREATE POLICY "Organization users access control" ON organization_users
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id))
    WITH CHECK (can_access_organization(organization_id));

-- Organization standards: Read access for members, manage for admins
CREATE POLICY "Organization standards access control" ON organization_standards
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_standards'));

-- ============================================================================
-- ASSESSMENT AND COMPLIANCE POLICIES
-- ============================================================================

-- Assessments: Role-based access control
DROP POLICY IF EXISTS "Organization users access own assessments" ON assessments;
CREATE POLICY "Assessment access control" ON assessments
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('create_assessments'));

-- Assessment requirements: Same as assessments but with requirement-level permissions
CREATE POLICY "Assessment requirements access control" ON assessment_requirements
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM assessments a 
            WHERE a.id = assessment_id 
            AND can_access_organization(a.organization_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments a 
            WHERE a.id = assessment_id 
            AND can_access_organization(a.organization_id)
            AND user_has_permission('edit_assessments')
        )
    );

-- Assessment templates: Read for all, create/edit for authorized users
CREATE POLICY "Assessment templates access control" ON assessment_templates
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id) OR is_public = true)
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('create_templates'));

-- Assessment workflow: Same organization access
CREATE POLICY "Assessment workflow access control" ON assessment_workflow
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM assessments a 
            WHERE a.id = assessment_id 
            AND can_access_organization(a.organization_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments a 
            WHERE a.id = assessment_id 
            AND can_access_organization(a.organization_id)
            AND user_has_permission('edit_assessments')
        )
    );

-- Assessment comments: Read for organization members, create for contributors
CREATE POLICY "Assessment comments access control" ON assessment_comments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM assessments a 
            WHERE a.id = assessment_id 
            AND can_access_organization(a.organization_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments a 
            WHERE a.id = assessment_id 
            AND can_access_organization(a.organization_id)
            AND user_has_permission('edit_assessments')
        )
    );

-- Assessment findings: Same as assessments
CREATE POLICY "Assessment findings access control" ON assessment_findings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM assessments a 
            WHERE a.id = assessment_id 
            AND can_access_organization(a.organization_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments a 
            WHERE a.id = assessment_id 
            AND can_access_organization(a.organization_id)
            AND user_has_permission('edit_assessments')
        )
    );

-- Compliance evidence: Access through assessment requirements
CREATE POLICY "Compliance evidence access control" ON compliance_evidence
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('upload_evidence'));

-- ============================================================================
-- DOCUMENT MANAGEMENT POLICIES
-- ============================================================================

-- Document library: Role-based with document sensitivity levels
DROP POLICY IF EXISTS "Organization members access own documents" ON document_library;
CREATE POLICY "Document library access control" ON document_library
    FOR SELECT TO authenticated
    USING (
        can_access_organization(organization_id) AND (
            access_level = 'organization' OR
            access_level = 'public' OR
            (access_level = 'restricted' AND get_user_role(organization_id) = ANY(allowed_roles))
        )
    );

CREATE POLICY "Document library create control" ON document_library
    FOR INSERT TO authenticated
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('create_documents'));

CREATE POLICY "Document library update control" ON document_library
    FOR UPDATE TO authenticated
    USING (
        can_access_organization(organization_id) AND (
            user_has_permission('edit_documents') OR
            created_by IN (
                SELECT id FROM organization_users 
                WHERE email = auth.email() AND organization_id = document_library.organization_id
            )
        )
    )
    WITH CHECK (
        can_access_organization(organization_id) AND (
            user_has_permission('edit_documents') OR
            created_by IN (
                SELECT id FROM organization_users 
                WHERE email = auth.email() AND organization_id = document_library.organization_id
            )
        )
    );

CREATE POLICY "Document library delete control" ON document_library
    FOR DELETE TO authenticated
    USING (
        can_access_organization(organization_id) AND (
            user_has_permission('delete_documents') OR
            (user_has_permission('edit_documents') AND created_by IN (
                SELECT id FROM organization_users 
                WHERE email = auth.email() AND organization_id = document_library.organization_id
            ))
        )
    );

-- Document versions: Access through parent document
CREATE POLICY "Document versions access control" ON document_versions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM document_library dl 
            WHERE dl.id = document_id 
            AND can_access_organization(dl.organization_id)
        )
    );

-- Document reviews: Reviewers and document owners
CREATE POLICY "Document reviews access control" ON document_reviews
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM document_library dl 
            WHERE dl.id = document_id 
            AND can_access_organization(dl.organization_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM document_library dl 
            WHERE dl.id = document_id 
            AND can_access_organization(dl.organization_id)
            AND user_has_permission('review_documents')
        )
    );

-- Requirement documents: Access through both requirements and documents
CREATE POLICY "Requirement documents access control" ON requirement_documents
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('edit_documents'));

-- ============================================================================
-- GAP ANALYSIS AND RECOMMENDATIONS POLICIES
-- ============================================================================

-- Gap analysis: Organization members can read, analysts can create/edit
CREATE POLICY "Gap analysis access control" ON gap_analysis
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('create_gap_analysis'));

-- Gap items: Access through parent gap analysis
CREATE POLICY "Gap items access control" ON gap_items
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM gap_analysis ga 
            WHERE ga.id = gap_analysis_id 
            AND can_access_organization(ga.organization_id)
        )
    );

-- Recommendations: Read for all, create for system and authorized users
CREATE POLICY "Recommendations access control" ON recommendations
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('create_recommendations'));

-- ============================================================================
-- MONITORING AND ALERTING POLICIES
-- ============================================================================

-- Monitoring rules: Admins can manage, all can read
DROP POLICY IF EXISTS "Organization members access own monitoring" ON monitoring_rules;
CREATE POLICY "Monitoring rules access control" ON monitoring_rules
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_monitoring'));

-- Compliance alerts: All organization members can read, specific roles can resolve
DROP POLICY IF EXISTS "Organization members access own compliance alerts" ON compliance_alerts;
CREATE POLICY "Compliance alerts access control" ON compliance_alerts
    FOR SELECT TO authenticated
    USING (can_access_organization(organization_id));

CREATE POLICY "Compliance alerts update control" ON compliance_alerts
    FOR UPDATE TO authenticated
    USING (can_access_organization(organization_id) AND user_has_permission('resolve_alerts'))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('resolve_alerts'));

-- Alert history: Read-only access for organization members
CREATE POLICY "Alert history access control" ON alert_history
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM compliance_alerts ca 
            WHERE ca.id = alert_id 
            AND can_access_organization(ca.organization_id)
        )
    );

-- ============================================================================
-- LEARNING MANAGEMENT SYSTEM POLICIES
-- ============================================================================

-- Learning content: Read for all, create/edit for content creators
DROP POLICY IF EXISTS "Organization members access own learning content" ON learning_content;
CREATE POLICY "Learning content access control" ON learning_content
    FOR SELECT TO authenticated
    USING (can_access_organization(organization_id) AND is_published = true);

CREATE POLICY "Learning content management control" ON learning_content
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id) AND user_has_permission('manage_learning_content'))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_learning_content'));

-- Learning paths: Similar to learning content
DROP POLICY IF EXISTS "Organization members access own learning paths" ON learning_paths;
CREATE POLICY "Learning paths access control" ON learning_paths
    FOR SELECT TO authenticated
    USING (can_access_organization(organization_id));

CREATE POLICY "Learning paths management control" ON learning_paths
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id) AND user_has_permission('manage_learning_content'))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_learning_content'));

-- User learning progress: Users can see own progress, managers can see team progress
DROP POLICY IF EXISTS "Users access own learning progress" ON user_learning_progress;
CREATE POLICY "Learning progress access control" ON user_learning_progress
    FOR SELECT TO authenticated
    USING (
        user_id IN (
            SELECT id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        ) OR
        user_has_permission('view_team_progress')
    );

CREATE POLICY "Learning progress update control" ON user_learning_progress
    FOR ALL TO authenticated
    USING (
        user_id IN (
            SELECT id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        )
    )
    WITH CHECK (
        user_id IN (
            SELECT id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- Training assignments: Assignees can view, managers can create/manage
DROP POLICY IF EXISTS "Organization members access own training assignments" ON training_assignments;
CREATE POLICY "Training assignments access control" ON training_assignments
    FOR SELECT TO authenticated
    USING (
        can_access_organization(organization_id) AND (
            assigned_to_user_id IN (
                SELECT id FROM organization_users 
                WHERE email = auth.email() AND is_active = true
            ) OR
            user_has_permission('manage_training')
        )
    );

CREATE POLICY "Training assignments management control" ON training_assignments
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id) AND user_has_permission('manage_training'))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_training'));

-- ============================================================================
-- REAL-TIME COLLABORATION POLICIES
-- ============================================================================

-- User presence: Users can see presence in accessible entities
DROP POLICY IF EXISTS "Organization members access own user presence" ON user_presence;
CREATE POLICY "User presence access control" ON user_presence
    FOR ALL TO authenticated
    USING (
        user_id IN (
            SELECT ou.id FROM organization_users ou
            WHERE ou.email = auth.email() AND ou.is_active = true
        ) OR
        user_id IN (
            SELECT ou.id FROM organization_users ou
            WHERE ou.organization_id IN (
                SELECT organization_id FROM organization_users 
                WHERE email = auth.email() AND is_active = true
            ) AND ou.is_active = true
        )
    );

-- Activity feed: Organization members can read, system and users can create
DROP POLICY IF EXISTS "Organization members access own activity feed" ON activity_feed;
CREATE POLICY "Activity feed access control" ON activity_feed
    FOR SELECT TO authenticated
    USING (can_access_organization(organization_id));

CREATE POLICY "Activity feed create control" ON activity_feed
    FOR INSERT TO authenticated
    WITH CHECK (can_access_organization(organization_id));

-- Change log: Admins and auditors can read
DROP POLICY IF EXISTS "Organization members access own change log" ON change_log;
CREATE POLICY "Change log access control" ON change_log
    FOR SELECT TO authenticated
    USING (can_access_organization(organization_id) AND user_has_permission('view_audit_logs'));

-- ============================================================================
-- INTEGRATION AND API POLICIES
-- ============================================================================

-- Integration configs: Admins only
DROP POLICY IF EXISTS "Organization members access own integrations" ON integration_configs;
CREATE POLICY "Integration configs access control" ON integration_configs
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id) AND user_has_permission('manage_integrations'))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_integrations'));

-- API keys: Super admins only
DROP POLICY IF EXISTS "Organization admins access own API keys" ON api_keys;
CREATE POLICY "API keys access control" ON api_keys
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id) AND user_has_permission('manage_api_keys'))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_api_keys'));

-- Export jobs: Users can see own exports, admins can see all
DROP POLICY IF EXISTS "Organization members access own exports" ON export_jobs;
CREATE POLICY "Export jobs access control" ON export_jobs
    FOR ALL TO authenticated
    USING (
        can_access_organization(organization_id) AND (
            created_by IN (
                SELECT id FROM organization_users 
                WHERE email = auth.email() AND is_active = true
            ) OR
            user_has_permission('view_all_exports')
        )
    )
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('create_exports'));

-- ============================================================================
-- SECURITY AND COMPLIANCE TRACKING POLICIES
-- ============================================================================

-- Security events: Security team and admins
CREATE POLICY "Security events access control" ON security_events
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id) AND user_has_permission('view_security_events'))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_security'));

-- Risk assessments: Risk managers and compliance team
CREATE POLICY "Risk assessments access control" ON risk_assessments
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_risk'));

-- Compliance tests: Compliance team can manage, all can view results
CREATE POLICY "Compliance tests access control" ON compliance_tests
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_compliance_tests'));

-- Vendors: Procurement and compliance teams
CREATE POLICY "Vendors access control" ON vendors
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_vendors'));

-- Incidents: Security and compliance teams
CREATE POLICY "Incidents access control" ON incidents
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_incidents'));

-- ============================================================================
-- NOTIFICATION POLICIES
-- ============================================================================

-- Notifications: Users see own notifications, admins can manage
DROP POLICY IF EXISTS "Organization members access own notifications" ON notifications;
CREATE POLICY "Notifications access control" ON notifications
    FOR SELECT TO authenticated
    USING (
        can_access_organization(organization_id) AND (
            user_id IN (
                SELECT id FROM organization_users 
                WHERE email = auth.email() AND is_active = true
            ) OR
            user_has_permission('manage_notifications')
        )
    );

CREATE POLICY "Notifications update control" ON notifications
    FOR UPDATE TO authenticated
    USING (
        user_id IN (
            SELECT id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        )
    )
    WITH CHECK (
        user_id IN (
            SELECT id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- Notification templates: Admins can manage
CREATE POLICY "Notification templates access control" ON notification_templates
    FOR ALL TO authenticated
    USING (
        organization_id IS NULL OR 
        (can_access_organization(organization_id) AND user_has_permission('manage_notifications'))
    )
    WITH CHECK (
        organization_id IS NULL OR 
        (can_access_organization(organization_id) AND user_has_permission('manage_notifications'))
    );

-- ============================================================================
-- SUBSCRIPTION AND BILLING POLICIES
-- ============================================================================

-- Organization subscriptions: Billing admins only
DROP POLICY IF EXISTS "Organization subscriptions are viewable by org members" ON organization_subscriptions;
CREATE POLICY "Organization subscriptions access control" ON organization_subscriptions
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id) AND user_has_permission('manage_billing'))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_billing'));

-- User invitations: Admins can manage
DROP POLICY IF EXISTS "Organization invitations are manageable by admins" ON user_invitations;
CREATE POLICY "User invitations access control" ON user_invitations
    FOR ALL TO authenticated
    USING (can_access_organization(organization_id) AND user_has_permission('manage_users'))
    WITH CHECK (can_access_organization(organization_id) AND user_has_permission('manage_users'));

-- ============================================================================
-- FUNCTION TO VALIDATE RLS SETUP
-- ============================================================================

-- Function to validate RLS is properly configured
CREATE OR REPLACE FUNCTION validate_rls_setup()
RETURNS TABLE(
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count INTEGER,
    has_select_policy BOOLEAN,
    has_insert_policy BOOLEAN,
    has_update_policy BOOLEAN,
    has_delete_policy BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.relname::TEXT as table_name,
        c.relrowsecurity as rls_enabled,
        COUNT(p.polname)::INTEGER as policy_count,
        COUNT(CASE WHEN p.polcmd = 'r' THEN 1 END) > 0 as has_select_policy,
        COUNT(CASE WHEN p.polcmd = 'a' THEN 1 END) > 0 as has_insert_policy,
        COUNT(CASE WHEN p.polcmd = 'w' THEN 1 END) > 0 as has_update_policy,
        COUNT(CASE WHEN p.polcmd = 'd' THEN 1 END) > 0 as has_delete_policy
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    LEFT JOIN pg_policy p ON p.polrelid = c.oid
    WHERE n.nspname = 'public' 
    AND c.relkind = 'r'
    AND c.relname NOT LIKE 'pg_%'
    AND c.relname NOT IN ('migration_status', 'platform_administrators', 'platform_settings', 'standards_library', 'requirements_library', 'user_roles', 'subscription_plans')
    GROUP BY c.relname, c.relrowsecurity
    ORDER BY c.relname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION is_platform_admin IS 'Checks if current user is a platform administrator';
COMMENT ON FUNCTION get_user_organizations IS 'Returns array of organization IDs user has access to';
COMMENT ON FUNCTION user_has_permission IS 'Checks if user has specific permission within their role';
COMMENT ON FUNCTION can_access_organization IS 'Determines if user can access specific organization data';
COMMENT ON FUNCTION get_user_role IS 'Returns user role within specific organization';
COMMENT ON FUNCTION validate_rls_setup IS 'Validates RLS configuration across all tables';

-- Run validation to ensure RLS is properly configured
SELECT * FROM validate_rls_setup();

-- Insert default platform setting for RLS validation
INSERT INTO platform_settings (key, value, description, category) VALUES 
('rls_enabled', 'true', 'Row Level Security is enabled and configured', 'security')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;