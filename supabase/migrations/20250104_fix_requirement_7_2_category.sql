-- Fix category mapping for ISO/IEC 27001 requirement 7.2 "Competence"
-- Move from "Awareness" to "Governance & Leadership"
-- 
-- This migration corrects the unified category mapping for requirement 7.2
-- which should be categorized under "Governance & Leadership" instead of "Awareness"

-- Step 1: Find and update the unified requirement mapping
-- Get the Governance & Leadership category ID
DO $$
DECLARE
    governance_category_id UUID;
    governance_unified_req_id UUID;
    competence_req_id UUID;
BEGIN
    -- Get the Governance & Leadership category ID
    SELECT id INTO governance_category_id 
    FROM unified_compliance_categories 
    WHERE name = 'Governance & Leadership';
    
    -- Get or create a unified requirement for Governance & Leadership
    SELECT id INTO governance_unified_req_id
    FROM unified_requirements 
    WHERE unified_compliance_category_id = governance_category_id
    LIMIT 1;
    
    -- If no unified requirement exists, create one
    IF governance_unified_req_id IS NULL THEN
        INSERT INTO unified_requirements (unified_compliance_category_id, created_at, updated_at)
        VALUES (governance_category_id, NOW(), NOW())
        RETURNING id INTO governance_unified_req_id;
    END IF;
    
    -- Get the requirement 7.2 Competence ID
    SELECT rl.id INTO competence_req_id
    FROM requirements_library rl
    JOIN standards_library sl ON rl.standard_id = sl.id
    WHERE rl.control_id = '7.2' 
      AND rl.title ILIKE '%competence%'
      AND sl.name ILIKE '%ISO/IEC 27001%'
    LIMIT 1;
    
    -- Update the mapping if both IDs are found
    IF competence_req_id IS NOT NULL AND governance_unified_req_id IS NOT NULL THEN
        -- Update existing mapping or insert if doesn't exist
        INSERT INTO unified_requirement_mappings (requirement_id, unified_requirement_id, created_at, updated_at)
        VALUES (competence_req_id, governance_unified_req_id, NOW(), NOW())
        ON CONFLICT (requirement_id) 
        DO UPDATE SET 
            unified_requirement_id = governance_unified_req_id,
            updated_at = NOW();
            
        RAISE NOTICE 'Successfully updated requirement 7.2 Competence to Governance & Leadership category';
    ELSE
        RAISE NOTICE 'Could not find requirement 7.2 Competence or Governance & Leadership category';
    END IF;
END $$;