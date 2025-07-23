-- Quick fix to ensure ISO/IEC 27001 9.1 maps to Governance & Leadership
-- Run this directly in your Supabase SQL editor

DO $$
DECLARE
  v_req_id UUID;
  v_gov_cat_id UUID;
  v_gov_unified_id UUID;
BEGIN
  -- Find ISO/IEC 27001 9.1 requirement
  SELECT rl.id INTO v_req_id
  FROM requirements_library rl
  JOIN standards_library sl ON rl.standard_id = sl.id
  WHERE sl.name ILIKE '%27001%' 
    AND rl.control_id = '9.1';
  
  -- Find Governance & Leadership category
  SELECT id INTO v_gov_cat_id
  FROM unified_compliance_categories
  WHERE name = 'Governance & Leadership';
  
  -- Find or create governance unified requirement
  SELECT id INTO v_gov_unified_id
  FROM unified_requirements
  WHERE category_id = v_gov_cat_id
  LIMIT 1;
  
  IF v_gov_unified_id IS NULL THEN
    INSERT INTO unified_requirements (category_id, title, description)
    VALUES (v_gov_cat_id, 'Governance & Leadership', 'Governance requirements')
    RETURNING id INTO v_gov_unified_id;
  END IF;
  
  -- Delete existing mapping and create correct one
  DELETE FROM unified_requirement_mappings WHERE requirement_id = v_req_id;
  
  INSERT INTO unified_requirement_mappings (requirement_id, unified_requirement_id)
  VALUES (v_req_id, v_gov_unified_id)
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'ISO/IEC 27001 9.1 now maps to Governance & Leadership';
END $$;