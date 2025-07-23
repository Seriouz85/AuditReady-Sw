-- ============================================================================
-- Add Stripe-related fields to organizations table
-- ============================================================================

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_starts_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id);

-- ============================================================================
-- Add organization_id to organization_users for better tracking
-- ============================================================================

ALTER TABLE organization_users 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'; -- 'active', 'suspended', 'invited'

-- ============================================================================
-- Ensure billing_email is set for all organizations
-- ============================================================================

UPDATE organizations 
SET billing_email = COALESCE(billing_email, CONCAT(slug, '@example.com'))
WHERE billing_email IS NULL;