-- ============================================================================
-- Enhanced Tables for Platform Admin Features
-- ============================================================================

-- Enhanced audit logs with more detailed tracking
CREATE TABLE IF NOT EXISTS enhanced_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID,
    actor_type TEXT NOT NULL,
    actor_email TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    resource_name TEXT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    request_id UUID,
    duration_ms INTEGER,
    status TEXT DEFAULT 'success', -- 'success', 'failure', 'partial'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced user invitations with better tracking
CREATE TABLE IF NOT EXISTS enhanced_user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role_id UUID,
    invitation_token UUID DEFAULT uuid_generate_v4(),
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'expired', 'revoked'
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    revoked_at TIMESTAMP,
    revoked_by UUID REFERENCES platform_administrators(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES platform_administrators(id)
);

-- User roles table for RBAC
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions TEXT[],
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- Billing and subscription tracking
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    tier TEXT NOT NULL,
    status TEXT NOT NULL, -- 'active', 'trialing', 'past_due', 'canceled', 'unpaid'
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoice tracking
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_invoice_id TEXT UNIQUE,
    amount_due INTEGER, -- in cents
    amount_paid INTEGER, -- in cents
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL, -- 'draft', 'open', 'paid', 'void', 'uncollectible'
    invoice_pdf TEXT,
    hosted_invoice_url TEXT,
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    due_date TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Platform usage metrics
CREATE TABLE IF NOT EXISTS platform_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL, -- 'api_calls', 'storage_bytes', 'user_logins', etc.
    metric_value BIGINT NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_enhanced_audit_logs_actor ON enhanced_audit_logs(actor_id, actor_type);
CREATE INDEX idx_enhanced_audit_logs_resource ON enhanced_audit_logs(resource_type, resource_id);
CREATE INDEX idx_enhanced_audit_logs_created ON enhanced_audit_logs(created_at);
CREATE INDEX idx_enhanced_audit_logs_action ON enhanced_audit_logs(action);

CREATE INDEX idx_user_invitations_email ON enhanced_user_invitations(email);
CREATE INDEX idx_user_invitations_token ON enhanced_user_invitations(invitation_token);
CREATE INDEX idx_user_invitations_status ON enhanced_user_invitations(status);

CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE enhanced_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

-- Platform admin policies
CREATE POLICY "Platform admins access enhanced_audit_logs" ON enhanced_audit_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

CREATE POLICY "Platform admins access user_invitations" ON enhanced_user_invitations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

CREATE POLICY "Platform admins access user_roles" ON user_roles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

CREATE POLICY "Platform admins access subscriptions" ON subscriptions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

CREATE POLICY "Platform admins access invoices" ON invoices
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- Organization user policies (can only see their own data)
CREATE POLICY "Org users view own subscriptions" ON subscriptions
    FOR SELECT TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        )
    );

CREATE POLICY "Org users view own invoices" ON invoices
    FOR SELECT TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();