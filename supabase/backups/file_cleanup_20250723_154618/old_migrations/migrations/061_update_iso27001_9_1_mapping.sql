-- Update ISO/IEC 27001 requirement 9.1 mapping from Network Monitoring & Defense to Governance & Leadership

DO $$
DECLARE
  v_requirement_id UUID;
  v_old_category_id UUID;
  v_new_category_id UUID;
  v_old_unified_req_id UUID;
  v_new_unified_req_id UUID;
BEGIN
  -- Get the requirement ID for ISO/IEC 27001 9.1
  SELECT rl.id INTO v_requirement_id
  FROM requirements_library rl
  JOIN standards_library sl ON rl.standard_id = sl.id
  WHERE sl.name = 'ISO/IEC 27001' 
    AND rl.control_id = '9.1';
  
  IF v_requirement_id IS NULL THEN
    RAISE NOTICE 'ISO/IEC 27001 requirement 9.1 not found';
    RETURN;
  END IF;
  
  -- Get the old and new category IDs
  SELECT id INTO v_old_category_id 
  FROM unified_compliance_categories 
  WHERE name = 'Network Monitoring & Defense';
  
  SELECT id INTO v_new_category_id 
  FROM unified_compliance_categories 
  WHERE name = 'Governance & Leadership';
  
  IF v_old_category_id IS NULL OR v_new_category_id IS NULL THEN
    RAISE NOTICE 'Could not find required categories';
    RETURN;
  END IF;
  
  -- Get the current unified requirement ID
  SELECT urm.unified_requirement_id INTO v_old_unified_req_id
  FROM unified_requirement_mappings urm
  JOIN unified_requirements ur ON urm.unified_requirement_id = ur.id
  WHERE urm.requirement_id = v_requirement_id
    AND ur.category_id = v_old_category_id;
  
  -- Get or create unified requirement for Governance & Leadership
  SELECT id INTO v_new_unified_req_id
  FROM unified_requirements
  WHERE category_id = v_new_category_id
  LIMIT 1;
  
  IF v_new_unified_req_id IS NULL THEN
    INSERT INTO unified_requirements (
      id,
      category_id,
      title,
      description,
      implementation_guidance,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_new_category_id,
      'Governance & Leadership Requirements',
      'Unified requirements for Governance & Leadership',
      'Implement controls as per the Governance & Leadership category guidelines',
      NOW(),
      NOW()
    ) RETURNING id INTO v_new_unified_req_id;
  END IF;
  
  -- Update the mapping if it exists
  IF v_old_unified_req_id IS NOT NULL THEN
    UPDATE unified_requirement_mappings
    SET unified_requirement_id = v_new_unified_req_id
    WHERE requirement_id = v_requirement_id
      AND unified_requirement_id = v_old_unified_req_id;
    
    RAISE NOTICE 'Updated mapping for ISO/IEC 27001 9.1: Monitoring, measurement, analysis and evaluation from Network Monitoring & Defense to Governance & Leadership';
  ELSE
    -- Create new mapping if none exists
    INSERT INTO unified_requirement_mappings (
      id,
      requirement_id,
      unified_requirement_id,
      created_at
    ) VALUES (
      gen_random_uuid(),
      v_requirement_id,
      v_new_unified_req_id,
      NOW()
    ) ON CONFLICT (requirement_id, unified_requirement_id) DO NOTHING;
    
    RAISE NOTICE 'Created new mapping for ISO/IEC 27001 9.1: Monitoring, measurement, analysis and evaluation to Governance & Leadership';
  END IF;
  
END $$;