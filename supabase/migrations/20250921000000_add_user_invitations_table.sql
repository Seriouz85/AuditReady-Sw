-- User invitations table for managing user invitations
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invitation_token TEXT UNIQUE NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_org ON user_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires ON user_invitations(expires_at);

-- RLS policies
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Platform admins can access all invitations
CREATE POLICY "platform_admins_all_access" ON user_invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'platform_admin'
        )
    );

-- Policy: Organization admins can manage invitations for their organization
CREATE POLICY "org_admins_manage_invitations" ON user_invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_users ou
            JOIN users u ON u.id = ou.user_id
            WHERE u.id = auth.uid() 
            AND ou.organization_id = user_invitations.organization_id
            AND ou.role IN ('admin', 'owner')
        )
    );

-- Policy: Public can view invitations by token (for accepting invitations)
CREATE POLICY "public_view_by_token" ON user_invitations
    FOR SELECT USING (
        invitation_token IS NOT NULL
        AND status = 'pending'
        AND expires_at > NOW()
    );

-- Function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
    UPDATE user_invitations 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run this function daily (if pg_cron is available)
-- Note: This requires pg_cron extension which may not be available in all Supabase projects
-- SELECT cron.schedule('expire-invitations', '0 1 * * *', 'SELECT expire_old_invitations();');

-- Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_user_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_invitations_updated_at
    BEFORE UPDATE ON user_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_user_invitations_updated_at();

-- Insert initial demo data if demo organization exists
INSERT INTO user_invitations (
    email,
    name,
    role,
    organization_id,
    invitation_token,
    invited_by,
    invited_at,
    expires_at,
    status
)
SELECT 
    'demo-invited@auditready.com',
    'Demo Invited User',
    'analyst',
    o.id,
    'demo-invitation-token-12345',
    u.id,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '6 days',
    'pending'
FROM organizations o
CROSS JOIN users u
WHERE o.name = 'Demo Organization'
AND u.email = 'demo@auditready.com'
AND NOT EXISTS (
    SELECT 1 FROM user_invitations 
    WHERE email = 'demo-invited@auditready.com'
)
LIMIT 1;