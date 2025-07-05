-- Create organization_requirements table to track organization-specific requirement statuses
-- This table stores each organization's compliance status for requirements they need to fulfill

-- Create requirement status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE requirement_status AS ENUM (
        'not-fulfilled',
        'partially-fulfilled', 
        'fulfilled',
        'not-applicable'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create organization_requirements table
CREATE TABLE IF NOT EXISTS organization_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core relationships
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES requirements_library(id) ON DELETE CASCADE,
    
    -- Compliance status tracking
    status requirement_status DEFAULT 'not-fulfilled',
    fulfillment_percentage INTEGER DEFAULT 0 CHECK (fulfillment_percentage BETWEEN 0 AND 100),
    evidence TEXT,
    evidence_links JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    implementation_guidance TEXT,
    
    -- Responsibility assignment
    responsible_party TEXT,
    responsible_user_id UUID REFERENCES organization_users(id) ON DELETE SET NULL,
    due_date DATE,
    
    -- Categorization
    categories TEXT[] DEFAULT ARRAY[]::TEXT[], -- The 21 unified categories
    applies_to TEXT[] DEFAULT ARRAY[]::TEXT[], -- Organizations, Devices, Applications/Systems, Locations
    tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- Custom tags
    
    -- Risk and priority
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Real-time collaboration fields
    last_edited_by UUID REFERENCES organization_users(id),
    last_edited_at TIMESTAMP DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_by UUID REFERENCES organization_users(id),
    locked_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure each organization has only one status per requirement
    UNIQUE(organization_id, requirement_id)
);

-- Create indexes for performance
CREATE INDEX idx_org_requirements_org_id ON organization_requirements(organization_id);
CREATE INDEX idx_org_requirements_req_id ON organization_requirements(requirement_id);
CREATE INDEX idx_org_requirements_status ON organization_requirements(status);
CREATE INDEX idx_org_requirements_responsible ON organization_requirements(responsible_user_id);
CREATE INDEX idx_org_requirements_applies_to ON organization_requirements USING GIN(applies_to);
CREATE INDEX idx_org_requirements_categories ON organization_requirements USING GIN(categories);
CREATE INDEX idx_org_requirements_due_date ON organization_requirements(due_date) WHERE due_date IS NOT NULL;

-- Create a view for easy querying of requirements with their details
CREATE OR REPLACE VIEW organization_requirements_detailed AS
SELECT 
    org_req.*,
    req.control_id,
    req.title as requirement_title,
    req.description as requirement_description,
    req.category as requirement_category,
    req.standard_id,
    std.name as standard_name,
    std.version as standard_version,
    org.name as organization_name,
    org.slug as organization_slug,
    resp_user.name as responsible_user_name,
    resp_user.email as responsible_user_email
FROM organization_requirements org_req
LEFT JOIN requirements_library req ON org_req.requirement_id = req.id
LEFT JOIN standards_library std ON req.standard_id = std.id
LEFT JOIN organizations org ON org_req.organization_id = org.id
LEFT JOIN organization_users resp_user ON org_req.responsible_user_id = resp_user.id;

-- Function to initialize organization requirements when a standard is assigned
CREATE OR REPLACE FUNCTION initialize_organization_requirements(
    p_organization_id UUID,
    p_standard_id UUID
) RETURNS void AS $$
BEGIN
    -- Insert all requirements for the standard that don't already exist for this organization
    INSERT INTO organization_requirements (
        organization_id,
        requirement_id,
        status,
        fulfillment_percentage,
        priority
    )
    SELECT 
        p_organization_id,
        rl.id,
        'not-fulfilled'::requirement_status,
        0,
        COALESCE(rl.priority, 'medium')
    FROM requirements_library rl
    WHERE rl.standard_id = p_standard_id
    AND rl.is_active = true
    AND NOT EXISTS (
        SELECT 1 
        FROM organization_requirements org_req
        WHERE org_req.organization_id = p_organization_id
        AND org_req.requirement_id = rl.id
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_organization_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organization_requirements_updated_at
    BEFORE UPDATE ON organization_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_organization_requirements_updated_at();

-- Create table for tracking requirement activities (audit trail)
CREATE TABLE IF NOT EXISTS requirement_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_requirement_id UUID NOT NULL REFERENCES organization_requirements(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES requirements_library(id) ON DELETE CASCADE,
    user_id UUID REFERENCES organization_users(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL, -- 'status_change', 'evidence_added', 'note_added', 'assigned', etc.
    old_value JSONB,
    new_value JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_req_activities_org_req ON requirement_activities(organization_requirement_id);
CREATE INDEX idx_req_activities_org ON requirement_activities(organization_id);
CREATE INDEX idx_req_activities_user ON requirement_activities(user_id);
CREATE INDEX idx_req_activities_created ON requirement_activities(created_at DESC);

-- RLS Policies
ALTER TABLE organization_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_activities ENABLE ROW LEVEL SECURITY;

-- Organization members can view and edit their organization's requirements
CREATE POLICY "Organization members can view their requirements"
    ON organization_requirements FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

CREATE POLICY "Organization members can update their requirements"
    ON organization_requirements FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- Organization members can view their requirement activities
CREATE POLICY "Organization members can view their requirement activities"
    ON requirement_activities FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- Only allow inserts through functions (for audit trail)
CREATE POLICY "Requirement activities insert through functions only"
    ON requirement_activities FOR INSERT
    WITH CHECK (false);