-- User Management and Subscription Schema
-- This migration creates the necessary tables for SaaS user management with Stripe integration

-- User Roles table (defines available roles and permissions)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    is_system_role BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Subscriptions table (Stripe integration)
CREATE TABLE IF NOT EXISTS organization_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255) NOT NULL,
    plan_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    user_seats_included INTEGER NOT NULL DEFAULT 3,
    additional_seats INTEGER NOT NULL DEFAULT 0,
    price_per_additional_seat DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_seats_allowed INTEGER GENERATED ALWAYS AS (user_seats_included + additional_seats) STORED,
    trial_end TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL REFERENCES user_roles(name) ON DELETE RESTRICT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invited_by_user_id UUID NOT NULL,
    invited_by_user_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    invitation_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT unique_pending_invitation UNIQUE (email, organization_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Organization Users table (enhanced with role management)
CREATE TABLE IF NOT EXISTS organization_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role_id VARCHAR(50) NOT NULL REFERENCES user_roles(name) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    
    UNIQUE(user_id, organization_id)
);

-- Subscription Plans table (defines available plans)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    user_seats_included INTEGER NOT NULL DEFAULT 3,
    features JSONB NOT NULL DEFAULT '[]',
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing Events table (tracks subscription changes)
CREATE TABLE IF NOT EXISTS billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    stripe_event_id VARCHAR(255) UNIQUE,
    data JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log table (audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(255),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default user roles
INSERT INTO user_roles (name, display_name, description, permissions, is_system_role) VALUES
('viewer', 'Viewer', 'Read-only access to organization data', '["view_dashboard", "view_reports"]', true),
('analyst', 'Security Analyst', 'Can view and work on assigned requirements', '["view_dashboard", "view_requirements", "update_assignments", "view_reports"]', true),
('editor', 'Editor', 'Can create and edit content', '["view_dashboard", "view_requirements", "create_documents", "edit_content", "view_reports"]', true),
('admin', 'Administrator', 'Full access to organization management', '["view_dashboard", "view_requirements", "create_documents", "edit_content", "manage_users", "manage_settings", "view_reports", "manage_billing"]', true),
('owner', 'Owner', 'Complete control over organization', '["*"]', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, description, price_monthly, price_yearly, user_seats_included, features) VALUES
('starter', 'Starter Plan', 'Perfect for small teams getting started with compliance', 29.00, 290.00, 3, '["Basic compliance frameworks", "Document generation", "Basic reporting", "Email support"]'),
('professional', 'Professional Plan', 'Advanced features for growing organizations', 79.00, 790.00, 10, '["All starter features", "Advanced frameworks", "Custom workflows", "API access", "Priority support"]'),
('enterprise', 'Enterprise Plan', 'Complete solution for large organizations', 199.00, 1990.00, 50, '["All professional features", "Custom integrations", "Dedicated support", "Advanced analytics", "SLA guarantees"]')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_subscriptions_org_id ON organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_subscriptions_stripe_sub_id ON organization_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_org_id ON user_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_org_id ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_status ON organization_users(status);
CREATE INDEX IF NOT EXISTS idx_billing_events_org_id ON billing_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_event_id ON billing_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_org_id ON activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_subscriptions_updated_at BEFORE UPDATE ON organization_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_invitations_updated_at BEFORE UPDATE ON user_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_users_updated_at BEFORE UPDATE ON organization_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User roles are readable by all authenticated users
CREATE POLICY "User roles are viewable by authenticated users" ON user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Organization subscriptions are only accessible by organization members
CREATE POLICY "Organization subscriptions are viewable by org members" ON organization_subscriptions
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- User invitations are manageable by organization admins
CREATE POLICY "Organization invitations are manageable by admins" ON user_invitations
    FOR ALL USING (
        organization_id IN (
            SELECT ou.organization_id FROM organization_users ou
            JOIN user_roles ur ON ou.role_id = ur.name
            WHERE ou.user_id = auth.uid() 
            AND ou.status = 'active'
            AND (ur.permissions ? 'manage_users' OR ur.permissions ? '*')
        )
    );

-- Organization users are viewable by organization members
CREATE POLICY "Organization users are viewable by org members" ON organization_users
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Subscription plans are viewable by all authenticated users
CREATE POLICY "Subscription plans are viewable by authenticated users" ON subscription_plans
    FOR SELECT USING (auth.role() = 'authenticated');

-- Billing events are only accessible by organization owners/admins
CREATE POLICY "Billing events are viewable by org admins" ON billing_events
    FOR SELECT USING (
        organization_id IN (
            SELECT ou.organization_id FROM organization_users ou
            JOIN user_roles ur ON ou.role_id = ur.name
            WHERE ou.user_id = auth.uid() 
            AND ou.status = 'active'
            AND (ur.permissions ? 'manage_billing' OR ur.permissions ? '*')
        )
    );

-- Activity logs are viewable by organization members for their org
CREATE POLICY "Activity logs are viewable by org members" ON activity_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Comment for migration tracking
COMMENT ON TABLE user_roles IS 'Defines user roles and their permissions within organizations';
COMMENT ON TABLE organization_subscriptions IS 'Stores Stripe subscription data and seat management';
COMMENT ON TABLE user_invitations IS 'Manages user invitations with token-based acceptance';
COMMENT ON TABLE organization_users IS 'Links users to organizations with role assignments';
COMMENT ON TABLE subscription_plans IS 'Defines available subscription plans and pricing';
COMMENT ON TABLE billing_events IS 'Tracks billing-related events from Stripe webhooks';
COMMENT ON TABLE activity_logs IS 'Audit trail for user and system activities';