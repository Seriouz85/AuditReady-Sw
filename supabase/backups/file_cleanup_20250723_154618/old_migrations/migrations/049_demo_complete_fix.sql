-- Complete fix for demo organization access and pre-populated standards
-- This migration ensures demo account works without RLS issues

-- Step 1: Re-enable RLS on tables (we need proper policies, not disabled RLS)
ALTER TABLE organization_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing demo-related policies to start fresh
DROP POLICY IF EXISTS "Demo organization users bypass auth checks" ON organization_users;
DROP POLICY IF EXISTS "Demo organization standards bypass auth" ON organization_standards;
DROP POLICY IF EXISTS "Demo organization requirements bypass auth" ON organization_requirements;
DROP POLICY IF EXISTS "Allow anonymous access to demo organization" ON organization_users;
DROP POLICY IF EXISTS "Demo organization can be accessed without auth" ON organization_users;

-- Step 3: Create bulletproof demo policies that don't cause recursion
-- For organization_users - allow access to demo org without user checks
CREATE POLICY "demo_org_users_access"
ON organization_users
FOR ALL
TO public
USING (organization_id = '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid);

-- For organization_standards - allow access to demo org standards
CREATE POLICY "demo_org_standards_access"
ON organization_standards
FOR ALL
TO public
USING (organization_id = '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid);

-- For organization_requirements - allow access to demo org requirements
CREATE POLICY "demo_org_requirements_access"
ON organization_requirements
FOR ALL
TO public
USING (organization_id = '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid);

-- Step 4: Ensure public access to library tables
GRANT SELECT ON standards_library TO anon, authenticated;
GRANT SELECT ON requirements_library TO anon, authenticated;

-- Step 5: Pre-populate demo organization with essential standards
-- First, get the standard IDs we need
DO $$
DECLARE
    iso27001_id uuid;
    iso27002_id uuid;
    nis2_id uuid;
    gdpr_id uuid;
    cis_id uuid;
    demo_org_id uuid := '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid;
BEGIN
    -- Get standard IDs
    SELECT id INTO iso27001_id FROM standards_library WHERE name ILIKE '%ISO 27001%' LIMIT 1;
    SELECT id INTO iso27002_id FROM standards_library WHERE name ILIKE '%ISO 27002%' LIMIT 1;
    SELECT id INTO nis2_id FROM standards_library WHERE name ILIKE '%NIS2%' OR name ILIKE '%NIS 2%' LIMIT 1;
    SELECT id INTO gdpr_id FROM standards_library WHERE name ILIKE '%GDPR%' LIMIT 1;
    SELECT id INTO cis_id FROM standards_library WHERE name ILIKE '%CIS%' LIMIT 1;

    -- Clear existing demo standards to avoid duplicates
    DELETE FROM organization_requirements WHERE organization_id = demo_org_id;
    DELETE FROM organization_standards WHERE organization_id = demo_org_id;

    -- Add standards to demo organization if they exist
    IF iso27001_id IS NOT NULL THEN
        INSERT INTO organization_standards (organization_id, standard_id, is_applicable)
        VALUES (demo_org_id, iso27001_id, true);
        
        -- Add requirements for this standard
        INSERT INTO organization_requirements (organization_id, requirement_id, status)
        SELECT demo_org_id, rl.id, 
               CASE 
                   WHEN random() < 0.67 THEN 'fulfilled'::requirement_status
                   WHEN random() < 0.87 THEN 'partially-fulfilled'::requirement_status
                   WHEN rl.description ILIKE '%penetration%' OR rl.description ILIKE '%pen test%' THEN 'not-applicable'::requirement_status
                   ELSE 'not-fulfilled'::requirement_status
               END
        FROM requirements_library rl 
        WHERE rl.standard_id = iso27001_id AND rl.is_active = true;
    END IF;

    IF iso27002_id IS NOT NULL THEN
        INSERT INTO organization_standards (organization_id, standard_id, is_applicable)
        VALUES (demo_org_id, iso27002_id, true);
        
        INSERT INTO organization_requirements (organization_id, requirement_id, status)
        SELECT demo_org_id, rl.id, 
               CASE 
                   WHEN random() < 0.67 THEN 'fulfilled'::requirement_status
                   WHEN random() < 0.87 THEN 'partially-fulfilled'::requirement_status
                   WHEN rl.description ILIKE '%penetration%' OR rl.description ILIKE '%pen test%' THEN 'not-applicable'::requirement_status
                   ELSE 'not-fulfilled'::requirement_status
               END
        FROM requirements_library rl 
        WHERE rl.standard_id = iso27002_id AND rl.is_active = true;
    END IF;

    IF nis2_id IS NOT NULL THEN
        INSERT INTO organization_standards (organization_id, standard_id, is_applicable)
        VALUES (demo_org_id, nis2_id, true);
        
        INSERT INTO organization_requirements (organization_id, requirement_id, status)
        SELECT demo_org_id, rl.id, 
               CASE 
                   WHEN random() < 0.67 THEN 'fulfilled'::requirement_status
                   WHEN random() < 0.87 THEN 'partially-fulfilled'::requirement_status
                   WHEN rl.description ILIKE '%penetration%' OR rl.description ILIKE '%pen test%' THEN 'not-applicable'::requirement_status
                   ELSE 'not-fulfilled'::requirement_status
               END
        FROM requirements_library rl 
        WHERE rl.standard_id = nis2_id AND rl.is_active = true;
    END IF;

    IF gdpr_id IS NOT NULL THEN
        INSERT INTO organization_standards (organization_id, standard_id, is_applicable)
        VALUES (demo_org_id, gdpr_id, true);
        
        INSERT INTO organization_requirements (organization_id, requirement_id, status)
        SELECT demo_org_id, rl.id, 
               CASE 
                   WHEN random() < 0.67 THEN 'fulfilled'::requirement_status
                   WHEN random() < 0.87 THEN 'partially-fulfilled'::requirement_status
                   WHEN rl.description ILIKE '%penetration%' OR rl.description ILIKE '%pen test%' THEN 'not-applicable'::requirement_status
                   ELSE 'not-fulfilled'::requirement_status
               END
        FROM requirements_library rl 
        WHERE rl.standard_id = gdpr_id AND rl.is_active = true;
    END IF;

    IF cis_id IS NOT NULL THEN
        INSERT INTO organization_standards (organization_id, standard_id, is_applicable)
        VALUES (demo_org_id, cis_id, true);
        
        INSERT INTO organization_requirements (organization_id, requirement_id, status)
        SELECT demo_org_id, rl.id, 
               CASE 
                   WHEN random() < 0.67 THEN 'fulfilled'::requirement_status
                   WHEN random() < 0.87 THEN 'partially-fulfilled'::requirement_status
                   WHEN rl.description ILIKE '%penetration%' OR rl.description ILIKE '%pen test%' THEN 'not-applicable'::requirement_status
                   ELSE 'not-fulfilled'::requirement_status
               END
        FROM requirements_library rl 
        WHERE rl.standard_id = cis_id AND rl.is_active = true;
    END IF;

    RAISE NOTICE 'Demo organization standards and requirements have been populated successfully';
END $$;