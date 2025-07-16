-- Fix ISO 27002 requirement 5.34 mapping to GDPR group
-- This requirement should be mapped to GDPR Unified Compliance instead of Data Protection & Cryptographic Controls

-- Helper function to get requirement ID by code
CREATE OR REPLACE FUNCTION get_requirement_id_by_code(req_code TEXT, framework_code TEXT) 
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT r.id 
    FROM requirements r 
    JOIN frameworks f ON r.framework_id = f.id 
    WHERE r.code = req_code AND f.code = framework_code
  );
END;
$$ LANGUAGE plpgsql;

-- Helper function to get unified requirement ID
CREATE OR REPLACE FUNCTION get_unified_requirement_id(req_title TEXT, category_name TEXT) 
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT ur.id 
    FROM unified_requirements ur 
    JOIN unified_categories uc ON ur.category_id = uc.id 
    WHERE ur.title = req_title AND uc.name = category_name
  );
END;
$$ LANGUAGE plpgsql;

-- Move ISO 27002 requirement 5.34 to GDPR group
DO $$
DECLARE
  gdpr_unified_req_id UUID;
  iso27002_534_req_id UUID;
  data_protection_unified_req_id UUID;
BEGIN
  -- Get the GDPR unified requirement ID
  gdpr_unified_req_id := get_unified_requirement_id('Comprehensive GDPR Data Protection Implementation', 'GDPR Unified Compliance');
  
  -- Get the ISO 27002 5.34 requirement ID
  iso27002_534_req_id := get_requirement_id_by_code('A.5.34', 'ISO27002');
  
  -- Get the current Data Protection unified requirement ID
  data_protection_unified_req_id := get_unified_requirement_id('Data Protection & Cryptographic Controls', 'Data Protection');
  
  IF gdpr_unified_req_id IS NOT NULL AND iso27002_534_req_id IS NOT NULL THEN
    -- Remove the current mapping from Data Protection category
    DELETE FROM unified_requirement_mappings 
    WHERE unified_requirement_id = data_protection_unified_req_id 
    AND requirement_id = iso27002_534_req_id;
    
    -- Add the mapping to GDPR Unified Compliance category
    INSERT INTO unified_requirement_mappings 
      (unified_requirement_id, requirement_id, mapping_strength, notes)
    VALUES 
      (gdpr_unified_req_id, iso27002_534_req_id, 'exact', 'Privacy and PII protection - moved to GDPR group')
    ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
    
    RAISE NOTICE 'ISO 27002 requirement 5.34 (A.5.34) has been moved to GDPR Unified Compliance group';
  ELSE
    RAISE NOTICE 'Could not find required IDs: GDPR unified ID: %, ISO 27002 5.34 ID: %', gdpr_unified_req_id, iso27002_534_req_id;
  END IF;
END $$;

-- Drop helper functions
DROP FUNCTION get_requirement_id_by_code(TEXT, TEXT);
DROP FUNCTION get_unified_requirement_id(TEXT, TEXT);