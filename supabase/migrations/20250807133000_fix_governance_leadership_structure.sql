-- Fix Governance & Leadership unified requirement structure
-- This migration updates the structure to match user requirements:
-- 1. Proper a, b, c, d ordering for all requirements
-- 2. Three sections: Leadership, HR (2 items), Monitoring & Compliance (3 items)  
-- 3. First 2 requirements: a) ISMS, b) Scope and boundaries

DO $$
DECLARE
  v_governance_category_id UUID;
  v_governance_unified_req_id UUID;
  v_corrected_guidance TEXT;
BEGIN
  RAISE NOTICE 'Starting Governance & Leadership structure correction...';
  
  -- Get the Governance & Leadership category ID
  SELECT id INTO v_governance_category_id
  FROM unified_compliance_categories 
  WHERE name = 'Governance & Leadership';
  
  IF v_governance_category_id IS NULL THEN
    RAISE NOTICE 'L Governance & Leadership category not found';
    RETURN;
  END IF;
  
  RAISE NOTICE ' Found Governance & Leadership category: %', v_governance_category_id;
  
  -- Get or create the unified requirement
  SELECT id INTO v_governance_unified_req_id
  FROM unified_requirements
  WHERE category_id = v_governance_category_id
  LIMIT 1;
  
  -- Define the corrected implementation guidance with proper structure
  v_corrected_guidance := 'GOVERNANCE & LEADERSHIP UNIFIED REQUIREMENTS

This unified requirement is organized into three distinct sections with proper a, b, c, d ordering:

## SECTION 1: Leadership (Core Requirements)
a) ISMS (Information Security Management System) - Establish and maintain a systematic approach to managing information security risks, policies, and procedures across the organization
b) Scope and boundaries - Define the boundaries and applicability of the information security management system, including internal and external issues  
c) Leadership commitment and responsibility - Top management must demonstrate leadership and commitment with respect to the information security management system
d) Information security policy framework - Develop, approve, communicate, and regularly review comprehensive information security policies aligned with business objectives
e) Organizational roles and responsibilities - Define and assign clear information security roles, responsibilities, and authorities throughout the organization
f) Resource allocation and management - Ensure adequate resources are provided for establishing, implementing, maintaining and continually improving the ISMS
g) Strategic planning and alignment - Align information security objectives with business strategy and ensure security planning supports organizational goals
h) Risk appetite and tolerance - Define and communicate the organization''s risk appetite and tolerance levels for information security risks
i) Governance structure and oversight - Establish appropriate governance structures with clear oversight responsibilities for information security
j) Segregation of duties - Implement proper segregation of conflicting duties and areas of responsibility to reduce risk of misuse
k) Management review and decision-making - Conduct regular management reviews of the ISMS performance and make strategic decisions for improvement

## SECTION 2: HR (Personnel Requirements - 2 items only)
l) Personnel Security Framework - Implement comprehensive background verification, screening procedures, and security clearance processes for personnel
m) Competence Management - Ensure personnel have appropriate competence, awareness, and training for their information security responsibilities

## SECTION 3: Monitoring & Compliance (Oversight Requirements - 3 items only)
n) Monitoring, measurement, analysis and evaluation - Establish processes to monitor, measure, analyze and evaluate the performance and effectiveness of the ISMS
o) Internal audit and compliance verification - Conduct planned internal audits to verify ISMS conformity and effective implementation
p) Continual improvement and corrective actions - Implement processes for continual improvement including corrective actions and management of nonconformities

## Implementation Priority
1. Start with a) ISMS and b) Scope and boundaries as the foundation
2. Build the Leadership section (c through k) to establish governance
3. Implement HR requirements (l and m) for personnel security
4. Complete with Monitoring & Compliance (n, o, p) for ongoing oversight';

  IF v_governance_unified_req_id IS NULL THEN
    -- Create new unified requirement with corrected structure
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
      'Unified requirements for governance and leadership controls with proper organizational structure organized into Leadership, HR, and Monitoring & Compliance sections',
      v_corrected_guidance,
      NOW(),
      NOW()
    ) RETURNING id INTO v_governance_unified_req_id;
    
    RAISE NOTICE ' Created new corrected governance unified requirement: %', v_governance_unified_req_id;
  ELSE
    -- Update existing unified requirement with corrected structure
    UPDATE unified_requirements
    SET 
      title = 'Governance & Leadership Requirements',
      description = 'Unified requirements for governance and leadership controls with proper organizational structure organized into Leadership, HR, and Monitoring & Compliance sections',
      implementation_guidance = v_corrected_guidance,
      updated_at = NOW()
    WHERE id = v_governance_unified_req_id;
    
    RAISE NOTICE ' Updated existing governance unified requirement: %', v_governance_unified_req_id;
  END IF;
  
  -- Verify the structure is correct
  SELECT implementation_guidance INTO v_corrected_guidance
  FROM unified_requirements
  WHERE id = v_governance_unified_req_id;
  
  IF v_corrected_guidance LIKE '%a) ISMS%' AND v_corrected_guidance LIKE '%b) Scope and boundaries%' THEN
    RAISE NOTICE '<‰ SUCCESS: Governance & Leadership structure now has proper a, b, c, d ordering';
    RAISE NOTICE '<‰ SUCCESS: First 2 requirements are a) ISMS and b) Scope and boundaries';
    RAISE NOTICE '<‰ SUCCESS: Organized into Leadership, HR (2 items), Monitoring & Compliance (3 items)';
  ELSE
    RAISE NOTICE 'L FAILED: Structure verification failed';
  END IF;
  
END $$;