-- Final fix for ISO/IEC 27001 9.1 mapping to Governance & Leadership
-- This ensures the database mapping is correct

DO $$
DECLARE
  v_requirement_id UUID;
  v_governance_category_id UUID;
  v_network_category_id UUID;
  v_governance_unified_req_id UUID;
  v_old_mapping_count INT;
BEGIN
  RAISE NOTICE 'Starting ISO/IEC 27001 9.1 mapping fix...';
  
  -- Find ISO/IEC 27001 requirement 9.1
  SELECT rl.id INTO v_requirement_id
  FROM requirements_library rl
  JOIN standards_library sl ON rl.standard_id = sl.id
  WHERE sl.name ILIKE '%ISO%27001%' 
    AND rl.control_id = '9.1'
    AND rl.title ILIKE '%Monitoring, measurement, analysis and evaluation%';
  
  IF v_requirement_id IS NULL THEN
    RAISE NOTICE '❌ ISO/IEC 27001 requirement 9.1 not found';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Found requirement 9.1: %', v_requirement_id;
  
  -- Get category IDs
  SELECT id INTO v_governance_category_id 
  FROM unified_compliance_categories 
  WHERE name = 'Governance & Leadership';
  
  SELECT id INTO v_network_category_id 
  FROM unified_compliance_categories 
  WHERE name = 'Network Monitoring & Defense';
  
  IF v_governance_category_id IS NULL THEN
    RAISE NOTICE '❌ Governance & Leadership category not found';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Found Governance & Leadership category: %', v_governance_category_id;
  
  -- Get or create governance unified requirement
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
      'Unified requirements for governance and leadership controls including monitoring and evaluation',
      'Implement governance controls such as monitoring, measurement, analysis and evaluation of the ISMS',
      NOW(),
      NOW()
    ) RETURNING id INTO v_governance_unified_req_id;
    
    RAISE NOTICE '✅ Created governance unified requirement: %', v_governance_unified_req_id;
  ELSE
    RAISE NOTICE '✅ Found existing governance unified requirement: %', v_governance_unified_req_id;
  END IF;
  
  -- Check current mappings
  SELECT COUNT(*) INTO v_old_mapping_count
  FROM unified_requirement_mappings
  WHERE requirement_id = v_requirement_id;
  
  RAISE NOTICE '📊 Current mapping count for 9.1: %', v_old_mapping_count;
  
  -- Delete ALL existing mappings for this requirement
  DELETE FROM unified_requirement_mappings
  WHERE requirement_id = v_requirement_id;
  
  RAISE NOTICE '🗑️ Deleted % old mappings', v_old_mapping_count;
  
  -- Create the correct mapping to Governance & Leadership
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
  ) ON CONFLICT (requirement_id, unified_requirement_id) DO NOTHING;
  
  RAISE NOTICE '✅ Created new mapping to Governance & Leadership';
  
  -- Verify the mapping is correct
  PERFORM 1
  FROM unified_requirement_mappings urm
  JOIN unified_requirements ur ON urm.unified_requirement_id = ur.id
  JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
  WHERE urm.requirement_id = v_requirement_id
    AND ucc.name = 'Governance & Leadership';
    
  IF FOUND THEN
    RAISE NOTICE '🎉 SUCCESS: ISO/IEC 27001 9.1 is now correctly mapped to Governance & Leadership';
  ELSE
    RAISE NOTICE '❌ FAILED: Mapping verification failed';
  END IF;
  
  -- Show final mapping
  RAISE NOTICE '📋 Final mapping verification:';
  FOR rec IN 
    SELECT ucc.name as category_name
    FROM unified_requirement_mappings urm
    JOIN unified_requirements ur ON urm.unified_requirement_id = ur.id
    JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
    WHERE urm.requirement_id = v_requirement_id
  LOOP
    RAISE NOTICE '   → ISO/IEC 27001 9.1 mapped to: %', rec.category_name;
  END LOOP;
  
END $$;