-- Fix DORA Requirements Database Mappings
-- This SQL script fixes the unified_requirement_mappings table to ensure 
-- DORA requirements have proper single category mappings

-- First, let's see what we're working with
SELECT 
    rl.control_id,
    rl.title,
    rl.framework,
    ucc.name as category_name,
    COUNT(*) as mapping_count
FROM requirements_library rl
LEFT JOIN unified_requirement_mappings urm ON rl.id = urm.requirement_id
LEFT JOIN unified_requirements ur ON urm.unified_requirement_id = ur.id
LEFT JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
WHERE rl.framework = 'DORA'
GROUP BY rl.control_id, rl.title, rl.framework, ucc.name
ORDER BY rl.control_id;

-- STEP 1: Clean up any duplicate or incorrect mappings for DORA requirements
-- Remove all existing unified_requirement_mappings for DORA requirements
DELETE FROM unified_requirement_mappings 
WHERE requirement_id IN (
    SELECT id FROM requirements_library WHERE framework = 'DORA'
);

-- STEP 2: Get the unified category IDs we need
-- Let's check what unified categories exist
SELECT id, name FROM unified_compliance_categories 
WHERE name IN (
    'Governance & Leadership',
    'Risk Management',
    'Business Continuity & Disaster Recovery Management',
    'Incident Response Management',
    'Supplier & Third-Party Risk Management'
);

-- STEP 3: Create proper mappings for each DORA article
-- We need to find the unified_requirements that match our categories

-- For Articles 1-5: Governance & Leadership
WITH governance_unified AS (
    SELECT ur.id as unified_req_id
    FROM unified_requirements ur
    JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
    WHERE ucc.name = 'Governance & Leadership'
    LIMIT 1
),
governance_dora AS (
    SELECT id as req_id, control_id
    FROM requirements_library 
    WHERE framework = 'DORA' 
    AND control_id IN ('Article 1', 'Article 2', 'Article 3', 'Article 4', 'Article 5')
)
INSERT INTO unified_requirement_mappings (unified_requirement_id, requirement_id)
SELECT gu.unified_req_id, gd.req_id
FROM governance_unified gu
CROSS JOIN governance_dora gd;

-- For Articles 6-11: Risk Management
WITH risk_unified AS (
    SELECT ur.id as unified_req_id
    FROM unified_requirements ur
    JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
    WHERE ucc.name = 'Risk Management'
    LIMIT 1
),
risk_dora AS (
    SELECT id as req_id, control_id
    FROM requirements_library 
    WHERE framework = 'DORA' 
    AND control_id IN ('Article 6', 'Article 7', 'Article 8', 'Article 9', 'Article 10', 'Article 11')
)
INSERT INTO unified_requirement_mappings (unified_requirement_id, requirement_id)
SELECT ru.unified_req_id, rd.req_id
FROM risk_unified ru
CROSS JOIN risk_dora rd;

-- For Articles 12-14, 18-21: Business Continuity & Disaster Recovery Management
WITH bcdr_unified AS (
    SELECT ur.id as unified_req_id
    FROM unified_requirements ur
    JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
    WHERE ucc.name = 'Business Continuity & Disaster Recovery Management'
    LIMIT 1
),
bcdr_dora AS (
    SELECT id as req_id, control_id
    FROM requirements_library 
    WHERE framework = 'DORA' 
    AND control_id IN ('Article 12', 'Article 13', 'Article 14', 'Article 18', 'Article 19', 'Article 20', 'Article 21')
)
INSERT INTO unified_requirement_mappings (unified_requirement_id, requirement_id)
SELECT bu.unified_req_id, bd.req_id
FROM bcdr_unified bu
CROSS JOIN bcdr_dora bd;

-- For Articles 15-17: Incident Response Management  
WITH incident_unified AS (
    SELECT ur.id as unified_req_id
    FROM unified_requirements ur
    JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
    WHERE ucc.name = 'Incident Response Management'
    LIMIT 1
),
incident_dora AS (
    SELECT id as req_id, control_id
    FROM requirements_library 
    WHERE framework = 'DORA' 
    AND control_id IN ('Article 15', 'Article 16', 'Article 17')
)
INSERT INTO unified_requirement_mappings (unified_requirement_id, requirement_id)
SELECT iu.unified_req_id, id_dora.req_id
FROM incident_unified iu
CROSS JOIN incident_dora id_dora;

-- For Articles 22-28: Supplier & Third-Party Risk Management
WITH supplier_unified AS (
    SELECT ur.id as unified_req_id
    FROM unified_requirements ur
    JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
    WHERE ucc.name = 'Supplier & Third-Party Risk Management'
    LIMIT 1
),
supplier_dora AS (
    SELECT id as req_id, control_id
    FROM requirements_library 
    WHERE framework = 'DORA' 
    AND control_id IN ('Article 22', 'Article 23', 'Article 24', 'Article 25', 'Article 26', 'Article 27', 'Article 28')
)
INSERT INTO unified_requirement_mappings (unified_requirement_id, requirement_id)
SELECT su.unified_req_id, sd.req_id
FROM supplier_unified su
CROSS JOIN supplier_dora sd;

-- STEP 4: Verify the mappings are correct
SELECT 
    rl.control_id,
    rl.title,
    ucc.name as category_name,
    COUNT(*) as mapping_count
FROM requirements_library rl
JOIN unified_requirement_mappings urm ON rl.id = urm.requirement_id
JOIN unified_requirements ur ON urm.unified_requirement_id = ur.id
JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
WHERE rl.framework = 'DORA'
GROUP BY rl.control_id, rl.title, ucc.name
HAVING COUNT(*) > 1  -- This should return no rows if mappings are clean
ORDER BY rl.control_id;

-- STEP 5: Clean up any old-style tags in requirements_library.tags field
UPDATE requirements_library 
SET tags = '[]'::jsonb
WHERE framework = 'DORA' 
AND (tags IS NOT NULL AND jsonb_array_length(tags) > 0);

-- FINAL VERIFICATION: Check all DORA requirements have exactly one category mapping
SELECT 
    rl.control_id,
    rl.title,
    ucc.name as category_name
FROM requirements_library rl
JOIN unified_requirement_mappings urm ON rl.id = urm.requirement_id
JOIN unified_requirements ur ON urm.unified_requirement_id = ur.id
JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
WHERE rl.framework = 'DORA'
ORDER BY rl.control_id;

-- This should show each DORA Article with exactly one clean category name