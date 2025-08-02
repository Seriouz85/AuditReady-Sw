-- Migration: Apply unified category mappings for all unmapped requirements
-- This maps all 123 unmapped requirements to their appropriate unified categories

-- First, let's create a temporary mapping table
CREATE TEMP TABLE temp_requirement_mappings (
  control_id TEXT,
  standard_name TEXT,
  category_name TEXT
);

-- Insert all the mappings
INSERT INTO temp_requirement_mappings (control_id, standard_name, category_name) VALUES
-- ISO/IEC 27001 mappings
('4.1', 'ISO/IEC 27001', 'Governance & Leadership'),
('4.2', 'ISO/IEC 27001', 'Governance & Leadership'),
('4.3', 'ISO/IEC 27001', 'Governance & Leadership'),
('4.4', 'ISO/IEC 27001', 'Governance & Leadership'),
('5.1', 'ISO/IEC 27001', 'Governance & Leadership'),
('5.2', 'ISO/IEC 27001', 'Governance & Leadership'),
('5.3', 'ISO/IEC 27001', 'Governance & Leadership'),
('6.1.1', 'ISO/IEC 27001', 'Risk Management'),
('6.1.2', 'ISO/IEC 27001', 'Risk Management'),
('6.1.3', 'ISO/IEC 27001', 'Risk Management'),
('6.2', 'ISO/IEC 27001', 'Governance & Leadership'),
('6.3', 'ISO/IEC 27001', 'Governance & Leadership'),
('7.1', 'ISO/IEC 27001', 'Governance & Leadership'),
('7.2', 'ISO/IEC 27001', 'Security Awareness & Skills Training'),
('7.3', 'ISO/IEC 27001', 'Security Awareness & Skills Training'),
('7.4', 'ISO/IEC 27001', 'Governance & Leadership'),
('7.5.1', 'ISO/IEC 27001', 'Governance & Leadership'),
('7.5.2', 'ISO/IEC 27001', 'Governance & Leadership'),
('7.5.3', 'ISO/IEC 27001', 'Governance & Leadership'),
('8.1', 'ISO/IEC 27001', 'Governance & Leadership'),
('8.2', 'ISO/IEC 27001', 'Risk Management'),
('8.3', 'ISO/IEC 27001', 'Risk Management'),
('9.1', 'ISO/IEC 27001', 'Governance & Leadership'),
('9.2.1', 'ISO/IEC 27001', 'Audit Log Management'),
('9.2.2', 'ISO/IEC 27001', 'Audit Log Management'),
('9.3.1', 'ISO/IEC 27001', 'Governance & Leadership'),
('9.3.2', 'ISO/IEC 27001', 'Governance & Leadership'),
('9.3.3', 'ISO/IEC 27001', 'Governance & Leadership'),
('10.1', 'ISO/IEC 27001', 'Governance & Leadership'),
('10.2', 'ISO/IEC 27001', 'Governance & Leadership'),

-- ISO/IEC 27002 mappings
('5.1', 'ISO/IEC 27002', 'Governance & Leadership'),
('5.2', 'ISO/IEC 27002', 'Governance & Leadership'),
('5.3', 'ISO/IEC 27002', 'Identity & Access Management'),
('5.4', 'ISO/IEC 27002', 'Governance & Leadership'),
('5.5', 'ISO/IEC 27002', 'Governance & Leadership'),
('5.6', 'ISO/IEC 27002', 'Governance & Leadership'),
('5.7', 'ISO/IEC 27002', 'Network Monitoring & Defense'),
('5.8', 'ISO/IEC 27002', 'Governance & Leadership'),
('5.9', 'ISO/IEC 27002', 'Inventory and Control of Hardware Assets'),
('5.10', 'ISO/IEC 27002', 'Data Protection'),
('5.11', 'ISO/IEC 27002', 'Inventory and Control of Hardware Assets'),
('5.12', 'ISO/IEC 27002', 'Data Protection'),
('5.13', 'ISO/IEC 27002', 'Data Protection'),
('5.14', 'ISO/IEC 27002', 'Data Protection'),
('5.15', 'ISO/IEC 27002', 'Identity & Access Management'),
('5.16', 'ISO/IEC 27002', 'Identity & Access Management'),
('5.17', 'ISO/IEC 27002', 'Identity & Access Management'),
('5.18', 'ISO/IEC 27002', 'Identity & Access Management'),
('5.19', 'ISO/IEC 27002', 'Supplier & Third-Party Risk Management'),
('5.20', 'ISO/IEC 27002', 'Supplier & Third-Party Risk Management'),
('5.21', 'ISO/IEC 27002', 'Supplier & Third-Party Risk Management'),
('5.22', 'ISO/IEC 27002', 'Supplier & Third-Party Risk Management'),
('5.23', 'ISO/IEC 27002', 'Supplier & Third-Party Risk Management'),
('5.24', 'ISO/IEC 27002', 'Incident Response Management'),
('5.25', 'ISO/IEC 27002', 'Incident Response Management'),
('5.26', 'ISO/IEC 27002', 'Incident Response Management'),
('5.27', 'ISO/IEC 27002', 'Incident Response Management'),
('5.28', 'ISO/IEC 27002', 'Incident Response Management'),
('5.29', 'ISO/IEC 27002', 'Business Continuity & Disaster Recovery Management'),
('5.30', 'ISO/IEC 27002', 'Business Continuity & Disaster Recovery Management'),
('5.31', 'ISO/IEC 27002', 'Governance & Leadership'),
('5.32', 'ISO/IEC 27002', 'Data Protection'),
('5.33', 'ISO/IEC 27002', 'Data Protection'),
('5.34', 'ISO/IEC 27002', 'GDPR Unified Compliance'),
('5.35', 'ISO/IEC 27002', 'Audit Log Management'),
('5.36', 'ISO/IEC 27002', 'Governance & Leadership'),
('5.37', 'ISO/IEC 27002', 'Governance & Leadership'),
('6.1', 'ISO/IEC 27002', 'Security Awareness & Skills Training'),
('6.2', 'ISO/IEC 27002', 'Security Awareness & Skills Training'),
('6.3', 'ISO/IEC 27002', 'Security Awareness & Skills Training'),
('6.4', 'ISO/IEC 27002', 'Security Awareness & Skills Training'),
('6.5', 'ISO/IEC 27002', 'Security Awareness & Skills Training'),
('6.6', 'ISO/IEC 27002', 'Data Protection'),
('6.7', 'ISO/IEC 27002', 'Identity & Access Management'),
('6.8', 'ISO/IEC 27002', 'Incident Response Management'),
('7.1', 'ISO/IEC 27002', 'Physical & Environmental Security Controls'),
('7.2', 'ISO/IEC 27002', 'Physical & Environmental Security Controls'),
('7.3', 'ISO/IEC 27002', 'Physical & Environmental Security Controls'),
('7.4', 'ISO/IEC 27002', 'Physical & Environmental Security Controls'),
('7.5', 'ISO/IEC 27002', 'Physical & Environmental Security Controls'),
('7.6', 'ISO/IEC 27002', 'Physical & Environmental Security Controls'),
('7.7', 'ISO/IEC 27002', 'Physical & Environmental Security Controls'),
('7.8', 'ISO/IEC 27002', 'Physical & Environmental Security Controls'),
('7.9', 'ISO/IEC 27002', 'Physical & Environmental Security Controls'),
('7.10', 'ISO/IEC 27002', 'Data Protection'),
('7.11', 'ISO/IEC 27002', 'Physical & Environmental Security Controls'),
('7.12', 'ISO/IEC 27002', 'Physical & Environmental Security Controls'),
('7.13', 'ISO/IEC 27002', 'Physical & Environmental Security Controls'),
('7.14', 'ISO/IEC 27002', 'Physical & Environmental Security Controls'),
('8.1', 'ISO/IEC 27002', 'Secure Configuration of Hardware and Software'),
('8.2', 'ISO/IEC 27002', 'Identity & Access Management'),
('8.3', 'ISO/IEC 27002', 'Identity & Access Management'),
('8.4', 'ISO/IEC 27002', 'Identity & Access Management'),
('8.5', 'ISO/IEC 27002', 'Identity & Access Management'),
('8.6', 'ISO/IEC 27002', 'Network Infrastructure Management'),
('8.7', 'ISO/IEC 27002', 'Malware Defenses'),
('8.8', 'ISO/IEC 27002', 'Vulnerability Management'),
('8.9', 'ISO/IEC 27002', 'Secure Configuration of Hardware and Software'),
('8.10', 'ISO/IEC 27002', 'Data Protection'),
('8.11', 'ISO/IEC 27002', 'Data Protection'),
('8.12', 'ISO/IEC 27002', 'Data Protection'),
('8.13', 'ISO/IEC 27002', 'Business Continuity & Disaster Recovery Management'),
('8.14', 'ISO/IEC 27002', 'Business Continuity & Disaster Recovery Management'),
('8.15', 'ISO/IEC 27002', 'Audit Log Management'),
('8.16', 'ISO/IEC 27002', 'Network Monitoring & Defense'),
('8.17', 'ISO/IEC 27002', 'Network Infrastructure Management'),
('8.18', 'ISO/IEC 27002', 'Identity & Access Management'),
('8.19', 'ISO/IEC 27002', 'Secure Configuration of Hardware and Software'),
('8.20', 'ISO/IEC 27002', 'Network Infrastructure Management'),
('8.21', 'ISO/IEC 27002', 'Network Infrastructure Management'),
('8.22', 'ISO/IEC 27002', 'Network Infrastructure Management'),
('8.23', 'ISO/IEC 27002', 'Email & Web Browser Protections'),
('8.24', 'ISO/IEC 27002', 'Data Protection'),
('8.25', 'ISO/IEC 27002', 'Secure Software Development'),
('8.26', 'ISO/IEC 27002', 'Secure Software Development'),
('8.27', 'ISO/IEC 27002', 'Secure Software Development'),
('8.28', 'ISO/IEC 27002', 'Secure Software Development'),
('8.29', 'ISO/IEC 27002', 'Secure Software Development'),
('8.30', 'ISO/IEC 27002', 'Supplier & Third-Party Risk Management'),
('8.31', 'ISO/IEC 27002', 'Secure Software Development'),
('8.32', 'ISO/IEC 27002', 'Secure Configuration of Hardware and Software'),
('8.33', 'ISO/IEC 27002', 'Secure Software Development'),
('8.34', 'ISO/IEC 27002', 'Penetration Testing');

-- Now apply the mappings
DO $$
DECLARE
  v_requirement_id UUID;
  v_category_id UUID;
  v_unified_req_id UUID;
  v_mapping RECORD;
BEGIN
  -- Loop through each mapping
  FOR v_mapping IN 
    SELECT 
      trm.control_id,
      trm.standard_name,
      trm.category_name,
      rl.id as requirement_id
    FROM temp_requirement_mappings trm
    JOIN standards_library sl ON sl.name = trm.standard_name
    JOIN requirements_library rl ON rl.standard_id = sl.id AND rl.control_id = trm.control_id
  LOOP
    -- Get the category ID
    SELECT id INTO v_category_id
    FROM unified_compliance_categories
    WHERE name = v_mapping.category_name;
    
    IF v_category_id IS NOT NULL THEN
      -- Check if unified requirement exists for this category
      SELECT id INTO v_unified_req_id
      FROM unified_requirements
      WHERE category_id = v_category_id
      LIMIT 1;
      
      -- If no unified requirement exists, create one
      IF v_unified_req_id IS NULL THEN
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
          v_category_id,
          v_mapping.category_name || ' Requirements',
          'Unified requirements for ' || v_mapping.category_name,
          'Implement controls as per the ' || v_mapping.category_name || ' category guidelines',
          NOW(),
          NOW()
        ) RETURNING id INTO v_unified_req_id;
      END IF;
      
      -- Create the mapping if it doesn't exist
      INSERT INTO unified_requirement_mappings (
        id,
        requirement_id,
        unified_requirement_id,
        created_at
      ) VALUES (
        gen_random_uuid(),
        v_mapping.requirement_id,
        v_unified_req_id,
        NOW()
      ) ON CONFLICT (requirement_id, unified_requirement_id) DO NOTHING;
      
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Successfully mapped all requirements to unified categories';
END $$;

-- Clean up
DROP TABLE temp_requirement_mappings;

-- Verify the mappings
DO $$
DECLARE
  v_unmapped_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_unmapped_count
  FROM requirements_library rl
  LEFT JOIN unified_requirement_mappings urm ON rl.id = urm.requirement_id
  WHERE urm.id IS NULL;
  
  RAISE NOTICE 'Remaining unmapped requirements: %', v_unmapped_count;
END $$;