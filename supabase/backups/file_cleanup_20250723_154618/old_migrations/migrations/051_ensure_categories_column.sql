-- Ensure categories and related columns exist in organization_requirements table
-- This migration adds missing columns that should exist but might not be in some environments

-- Add categories column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='organization_requirements' 
        AND column_name='categories'
    ) THEN
        ALTER TABLE organization_requirements 
        ADD COLUMN categories TEXT[] DEFAULT ARRAY[]::TEXT[];
        
        -- Add index for categories if it doesn't exist
        CREATE INDEX IF NOT EXISTS idx_org_requirements_categories 
        ON organization_requirements USING GIN(categories);
    END IF;
END $$;

-- Add applies_to column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='organization_requirements' 
        AND column_name='applies_to'
    ) THEN
        ALTER TABLE organization_requirements 
        ADD COLUMN applies_to TEXT[] DEFAULT ARRAY[]::TEXT[];
        
        -- Add index for applies_to if it doesn't exist
        CREATE INDEX IF NOT EXISTS idx_org_requirements_applies_to 
        ON organization_requirements USING GIN(applies_to);
    END IF;
END $$;

-- Add implementation_guidance column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='organization_requirements' 
        AND column_name='implementation_guidance'
    ) THEN
        ALTER TABLE organization_requirements 
        ADD COLUMN implementation_guidance TEXT;
    END IF;
END $$;

-- Update the initialization function to include default categories
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
        priority,
        categories,
        applies_to
    )
    SELECT 
        p_organization_id,
        rl.id,
        'not-fulfilled'::requirement_status,
        0,
        COALESCE(rl.priority, 'medium'),
        CASE 
            -- Assign default categories based on requirement category/type
            WHEN LOWER(rl.category) LIKE '%access%' OR LOWER(rl.title) LIKE '%access%' THEN ARRAY['5'] -- Identity & Access Management
            WHEN LOWER(rl.category) LIKE '%data%' OR LOWER(rl.title) LIKE '%data%' THEN ARRAY['6'] -- Data Protection
            WHEN LOWER(rl.category) LIKE '%network%' OR LOWER(rl.title) LIKE '%network%' THEN ARRAY['10'] -- Network Infrastructure Management
            WHEN LOWER(rl.category) LIKE '%risk%' OR LOWER(rl.title) LIKE '%risk%' THEN ARRAY['2'] -- Risk Management
            WHEN LOWER(rl.category) LIKE '%governance%' OR LOWER(rl.title) LIKE '%governance%' THEN ARRAY['1'] -- Governance & Leadership
            WHEN LOWER(rl.category) LIKE '%incident%' OR LOWER(rl.title) LIKE '%incident%' THEN ARRAY['16'] -- Incident Response Management
            WHEN LOWER(rl.category) LIKE '%audit%' OR LOWER(rl.title) LIKE '%audit%' THEN ARRAY['20'] -- Audit Log Management
            WHEN LOWER(rl.category) LIKE '%malware%' OR LOWER(rl.title) LIKE '%malware%' THEN ARRAY['17'] -- Malware Defenses
            WHEN LOWER(rl.category) LIKE '%training%' OR LOWER(rl.title) LIKE '%training%' THEN ARRAY['14'] -- Security Awareness & Skills Training
            WHEN LOWER(rl.category) LIKE '%physical%' OR LOWER(rl.title) LIKE '%physical%' THEN ARRAY['9'] -- Physical & Environmental Security Controls
            ELSE ARRAY['1'] -- Default to Governance & Leadership
        END,
        ARRAY['Organizations'] -- Default applies_to
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

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';