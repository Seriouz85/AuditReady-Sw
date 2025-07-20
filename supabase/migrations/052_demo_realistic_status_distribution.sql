-- Update demo organization requirements with realistic status distribution
-- Including setting penetration test requirements as 'not applicable'

DO $$
DECLARE
  demo_org_id uuid := '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid;
  total_requirements integer;
  target_fulfilled integer;
  target_partial integer;
  target_not_applicable integer;
  requirements_cursor CURSOR FOR 
    SELECT or_tbl.id, rl.title, rl.description
    FROM organization_requirements or_tbl
    JOIN requirements_library rl ON or_tbl.requirement_id = rl.id
    WHERE or_tbl.organization_id = demo_org_id
    ORDER BY RANDOM();
  req_record RECORD;
  counter integer := 0;
BEGIN
  -- Get total count of requirements for demo org
  SELECT COUNT(*) INTO total_requirements
  FROM organization_requirements
  WHERE organization_id = demo_org_id;

  -- Calculate targets based on desired distribution
  -- 67% fulfilled, 20% partially fulfilled, 10% not fulfilled, 3% not applicable
  target_fulfilled := ROUND(total_requirements * 0.67);
  target_partial := ROUND(total_requirements * 0.20);
  target_not_applicable := ROUND(total_requirements * 0.03);

  RAISE NOTICE 'Demo org has % requirements. Targets: % fulfilled, % partial, % not applicable', 
    total_requirements, target_fulfilled, target_partial, target_not_applicable;

  -- First pass: Set penetration test and pen test requirements as not applicable
  UPDATE organization_requirements
  SET status = 'not-applicable'::requirement_status
  WHERE organization_id = demo_org_id
    AND requirement_id IN (
      SELECT rl.id 
      FROM requirements_library rl
      WHERE rl.title ILIKE '%penetration test%' 
         OR rl.title ILIKE '%pen test%'
         OR rl.title ILIKE '%pentest%'
         OR rl.description ILIKE '%penetration test%'
         OR rl.description ILIKE '%pen test%'
         OR rl.description ILIKE '%pentest%'
         OR rl.title ILIKE '%vulnerability assessment%'
         OR rl.title ILIKE '%ethical hacking%'
    );

  -- Get updated count of not applicable after pen test update
  SELECT COUNT(*) INTO counter
  FROM organization_requirements
  WHERE organization_id = demo_org_id AND status = 'not-applicable';

  RAISE NOTICE 'Set % penetration test requirements as not applicable', counter;

  -- Second pass: Update remaining requirements with realistic distribution
  counter := 0;
  
  FOR req_record IN requirements_cursor LOOP
    -- Skip if already set to not-applicable (pen test requirements)
    IF (SELECT status FROM organization_requirements WHERE id = req_record.id) = 'not-applicable' THEN
      CONTINUE;
    END IF;

    counter := counter + 1;
    
    -- Set status based on targets and current progress
    IF counter <= target_fulfilled THEN
      UPDATE organization_requirements
      SET 
        status = 'fulfilled'::requirement_status,
        fulfillment_percentage = 100,
        evidence = 'Demo evidence: Implementation completed and verified.',
        notes = 'Demo note: This requirement has been fully implemented.',
        responsible_party = CASE 
          WHEN req_record.title ILIKE '%policy%' OR req_record.title ILIKE '%procedure%' THEN 'IT Security Manager'
          WHEN req_record.title ILIKE '%technical%' OR req_record.title ILIKE '%system%' THEN 'System Administrator'
          WHEN req_record.title ILIKE '%training%' OR req_record.title ILIKE '%awareness%' THEN 'HR Manager'
          ELSE 'Compliance Officer'
        END,
        updated_at = NOW()
      WHERE id = req_record.id;
      
    ELSIF counter <= (target_fulfilled + target_partial) THEN
      UPDATE organization_requirements
      SET 
        status = 'partially-fulfilled'::requirement_status,
        fulfillment_percentage = 50 + FLOOR(RANDOM() * 40), -- 50-89%
        evidence = 'Demo evidence: Partially implemented, additional work needed.',
        notes = 'Demo note: Implementation in progress, target completion next quarter.',
        responsible_party = CASE 
          WHEN req_record.title ILIKE '%policy%' OR req_record.title ILIKE '%procedure%' THEN 'IT Security Manager'
          WHEN req_record.title ILIKE '%technical%' OR req_record.title ILIKE '%system%' THEN 'System Administrator'
          WHEN req_record.title ILIKE '%training%' OR req_record.title ILIKE '%awareness%' THEN 'HR Manager'
          ELSE 'Compliance Officer'
        END,
        updated_at = NOW()
      WHERE id = req_record.id;
      
    ELSE
      -- Remaining requirements become not-fulfilled or not-started
      UPDATE organization_requirements
      SET 
        status = CASE 
          WHEN RANDOM() < 0.7 THEN 'not-fulfilled'::requirement_status
          ELSE 'not-started'::requirement_status
        END,
        fulfillment_percentage = CASE 
          WHEN RANDOM() < 0.7 THEN FLOOR(RANDOM() * 30) -- 0-29% for not-fulfilled
          ELSE 0 -- 0% for not-started
        END,
        evidence = CASE 
          WHEN RANDOM() < 0.5 THEN 'Demo evidence: Initial assessment completed, gaps identified.'
          ELSE NULL
        END,
        notes = 'Demo note: Planned for implementation in upcoming compliance cycle.',
        responsible_party = CASE 
          WHEN req_record.title ILIKE '%policy%' OR req_record.title ILIKE '%procedure%' THEN 'IT Security Manager'
          WHEN req_record.title ILIKE '%technical%' OR req_record.title ILIKE '%system%' THEN 'System Administrator'
          WHEN req_record.title ILIKE '%training%' OR req_record.title ILIKE '%awareness%' THEN 'HR Manager'
          ELSE 'Compliance Officer'
        END,
        updated_at = NOW()
      WHERE id = req_record.id;
    END IF;
  END LOOP;

  -- Final statistics
  SELECT 
    COUNT(*) FILTER (WHERE status = 'fulfilled') as fulfilled_count,
    COUNT(*) FILTER (WHERE status = 'partially-fulfilled') as partial_count,
    COUNT(*) FILTER (WHERE status = 'not-fulfilled') as not_fulfilled_count,
    COUNT(*) FILTER (WHERE status = 'not-applicable') as not_applicable_count,
    COUNT(*) FILTER (WHERE status = 'not-started') as not_started_count,
    COUNT(*) as total_count
  FROM organization_requirements
  WHERE organization_id = demo_org_id
  INTO req_record;

  RAISE NOTICE 'Final demo status distribution:';
  RAISE NOTICE '  Fulfilled: % (%.1f%%)', req_record.fulfilled_count, (req_record.fulfilled_count::float / req_record.total_count * 100);
  RAISE NOTICE '  Partially Fulfilled: % (%.1f%%)', req_record.partial_count, (req_record.partial_count::float / req_record.total_count * 100);
  RAISE NOTICE '  Not Fulfilled: % (%.1f%%)', req_record.not_fulfilled_count, (req_record.not_fulfilled_count::float / req_record.total_count * 100);
  RAISE NOTICE '  Not Applicable: % (%.1f%%)', req_record.not_applicable_count, (req_record.not_applicable_count::float / req_record.total_count * 100);
  RAISE NOTICE '  Not Started: % (%.1f%%)', req_record.not_started_count, (req_record.not_started_count::float / req_record.total_count * 100);
  RAISE NOTICE '  Total: %', req_record.total_count;

END $$;