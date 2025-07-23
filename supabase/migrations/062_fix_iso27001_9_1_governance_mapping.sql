-- Fix ISO/IEC 27001 requirement 9.1 mapping to Governance & Leadership
-- This requirement should be in governance group, not network monitoring

DO $$
DECLARE
  v_requirement_id UUID;
  v_governance_category_id UUID;
  v_governance_unified_req_id UUID;
  v_current_mapping_count INT;
BEGIN
  -- Get the requirement ID for ISO/IEC 27001 9.1
  SELECT rl.id INTO v_requirement_id
  FROM requirements_library rl
  JOIN standards_library sl ON rl.standard_id = sl.id
  WHERE sl.name ILIKE '%ISO%27001%' 
    AND rl.control_id = '9.1'
    AND rl.title ILIKE '%Monitoring, measurement, analysis and evaluation%';
  
  IF v_requirement_id IS NULL THEN
    RAISE NOTICE 'ISO/IEC 27001 requirement 9.1 not found';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found requirement 9.1 with ID: %', v_requirement_id;
  
  -- Get the Governance & Leadership category ID
  SELECT id INTO v_governance_category_id 
  FROM unified_compliance_categories 
  WHERE name = 'Governance & Leadership';
  
  IF v_governance_category_id IS NULL THEN
    RAISE NOTICE 'Governance & Leadership category not found';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found Governance & Leadership category with ID: %', v_governance_category_id;
  
  -- Get or create unified requirement for Governance & Leadership
  SELECT id INTO v_governance_unified_req_id
  FROM unified_requirements
  WHERE category_id = v_governance_category_id
  LIMIT 1;
  
  IF v_governance_unified_req_id IS NULL THEN
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
      v_governance_category_id,
      'Governance & Leadership Requirements',
      'Unified requirements for governance and leadership controls',
      'Implement governance controls including monitoring, measurement, analysis and evaluation',
      NOW(),
      NOW()
    ) RETURNING id INTO v_governance_unified_req_id;
    
    RAISE NOTICE 'Created new governance unified requirement with ID: %', v_governance_unified_req_id;
  ELSE
    RAISE NOTICE 'Found existing governance unified requirement with ID: %', v_governance_unified_req_id;
  END IF;
  
  -- Check if there's already a mapping for this requirement
  SELECT COUNT(*) INTO v_current_mapping_count
  FROM unified_requirement_mappings
  WHERE requirement_id = v_requirement_id;
  
  RAISE NOTICE 'Current mapping count for requirement 9.1: %', v_current_mapping_count;
  
  -- Delete any existing mappings for this requirement
  DELETE FROM unified_requirement_mappings
  WHERE requirement_id = v_requirement_id;
  
  RAISE NOTICE 'Deleted % existing mappings', v_current_mapping_count;
  
  -- Create new mapping to Governance & Leadership
  INSERT INTO unified_requirement_mappings (
    id,
    requirement_id,
    unified_requirement_id,
    created_at
  ) VALUES (
    gen_random_uuid(),
    v_requirement_id,
    v_governance_unified_req_id,
    NOW()
  );
  
  RAISE NOTICE '✅ Successfully mapped ISO/IEC 27001 9.1 "Monitoring, measurement, analysis and evaluation" to Governance & Leadership';
  
  -- Verify the mapping
  SELECT COUNT(*) INTO v_current_mapping_count
  FROM unified_requirement_mappings urm
  JOIN unified_requirements ur ON urm.unified_requirement_id = ur.id
  JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
  WHERE urm.requirement_id = v_requirement_id
    AND ucc.name = 'Governance & Leadership';
    
  IF v_current_mapping_count > 0 THEN
    RAISE NOTICE '✅ Verification successful: Requirement 9.1 is now mapped to Governance & Leadership';
  ELSE
    RAISE NOTICE '❌ Verification failed: Mapping was not created properly';
  END IF;
  
END $$;