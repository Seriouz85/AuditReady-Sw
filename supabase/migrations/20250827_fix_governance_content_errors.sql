-- Fix critical content errors in Governance & Leadership unified requirements
-- This migration corrects mismatched content and wrong references

DO $$
DECLARE
  v_governance_category_id UUID;
  v_governance_unified_req_id UUID;
  v_corrected_requirements TEXT[];
BEGIN
  RAISE NOTICE 'Starting Governance & Leadership content error fixes...';
  
  -- Get the Governance & Leadership category ID
  SELECT id INTO v_governance_category_id
  FROM unified_compliance_categories 
  WHERE name = 'Governance & Leadership';
  
  IF v_governance_category_id IS NULL THEN
    RAISE NOTICE '❌ Governance & Leadership category not found';
    RETURN;
  END IF;
  
  -- Get the unified requirement ID
  SELECT id INTO v_governance_unified_req_id
  FROM unified_requirements
  WHERE category_id = v_governance_category_id
  LIMIT 1;
  
  IF v_governance_unified_req_id IS NULL THEN
    RAISE NOTICE '❌ Governance & Leadership unified requirement not found';
    RETURN;
  END IF;
  
  -- Define corrected sub-requirements array with FIXED content
  v_corrected_requirements := ARRAY[
    'a) LEADERSHIP COMMITMENT AND ACCOUNTABILITY - Executive leadership must demonstrate visible commitment to information security (ISO 27001 Clause 5.1) - Assign specific accountability for security decisions and outcomes',
    
    'b) SCOPE AND BOUNDARIES DEFINITION - Define and document the scope of your information security management system (ISMS), including all assets, locations, and business processes that require protection - Document all systems, data, and infrastructure within security scope (ISO 27001 Clause 4.3) - Identify interfaces with external parties and third-party services (ISO 27001 Clause 4.3) - Define geographical and organizational boundaries clearly - Regular review and updates when business changes occur',
    
    'c) ORGANIZATIONAL STRUCTURE (ISMS Requirement: Define roles and responsibilities as part of your ISMS implementation) AND GOVERNANCE - Establish clear roles, responsibilities, and reporting lines for information security governance throughout the organization - Define security governance structure with clear hierarchy (ISO 27001 Clause 5.3) - Assign specific security responsibilities to key personnel (ISO 27001 Annex A.5.2) - Establish information security committee or steering group',
    
    'd) POLICY FRAMEWORK (ISO 27001 Foundation: Your information security policy becomes the cornerstone document where many governance requirements can be documented, approved, and communicated) DEVELOPMENT - Develop, implement, and maintain a comprehensive information security policy framework aligned with business objectives and regulatory requirements - Create overarching information security policy approved by management (ISO 27001 Clause 5.2) - Develop supporting policies for specific security domains (ISO 27001 Annex A.5.1) - Ensure policies reflect current threats and business requirements - Regular review and update cycle for all security policies',
    
    'e) PROJECT MANAGEMENT (ISO 27002 Control 5.8: Information security in project management) INTEGRATION - Integrate information security requirements into all project management processes, ensuring security is considered from project inception through completion - Include security requirements in project planning and design (ISO 27002 Control 5.8) - Conduct security risk assessments for all new projects (ISO 27001 Annex A.5.8) - Implement security testing and validation before deployment - Maintain security documentation throughout project lifecycle',
    
    'f) ASSET USE AND DISPOSAL GOVERNANCE - Define acceptable use policies for information and associated assets, including secure disposal procedures to prevent unauthorized disclosure - Establish clear guidelines for acceptable use of organizational assets (ISO 27001 Annex A.5.10) - Define procedures for secure disposal of equipment and media (ISO 27001 Annex A.7.14) - Implement asset tracking throughout its lifecycle (ISO 27001 Annex A.5.9) - Ensure data is properly sanitized before disposal or reuse',
    
    'g) DOCUMENTED PROCEDURES MANAGEMENT - Maintain documented operating procedures for all security processes, ensuring consistent implementation and compliance with requirements - Document all security processes and procedures clearly (ISO 27001 Clause 7.5.1) - Ensure procedures are accessible to relevant personnel (ISO 27001 Clause 7.5.3) - Maintain version control for all security documentation (ISO 27001 Clause 7.5.2) - Regular review and testing of documented procedures',
    
    'h) PERSONNEL SECURITY FRAMEWORK (ISO 27002 Control 6.2: Terms and conditions of employment, Control 6.5: Responsibilities after termination or change of employment) - Implement comprehensive personnel security controls including background verification, confidentiality agreements, and clear responsibilities after employment termination - Conduct appropriate background checks for personnel (ISO 27001 Annex A.6.1) - Include security responsibilities in employment contracts (ISO 27001 Annex A.6.2) - Implement confidentiality and non-disclosure agreements - Define responsibilities after termination or change of employment (ISO 27002 Control 6.5) - Ensure proper return of assets upon employment termination',
    
    'i) COMPETENCE MANAGEMENT AND DEVELOPMENT - Determine and ensure the necessary competence of persons whose work affects information security performance - Define competency requirements for security-related roles (ISO 27001 Clause 7.2) - Assess current competency levels against requirements (ISO 27001 Clause 7.2) - Provide training and development to address gaps - Maintain records of competency assessments and training',
    
    'j) COMPLIANCE MONITORING AND OVERSIGHT - Establish monitoring, measurement, analysis and evaluation processes to ensure ongoing compliance with security requirements - Define monitoring processes for security controls effectiveness - Implement regular compliance assessments and audits - Establish metrics and KPIs for security performance - Regular reporting to management on compliance status',
    
    'k) CHANGE MANAGEMENT GOVERNANCE - Establish formal change management processes for all system modifications affecting information security - Define change approval processes and authorities - Assess security impact of all proposed changes - Implement change testing and validation procedures - Maintain change logs and documentation',
    
    'l) REGULATORY RELATIONSHIPS MANAGEMENT - Establish and maintain appropriate relationships with regulatory authorities and other external stakeholders - Maintain contact with special interest groups (ISO 27002 Control 5.6) - Establish communication channels with regulatory bodies - Participate in relevant security forums and associations - Monitor regulatory changes and compliance requirements',
    
    'm) INCIDENT RESPONSE GOVERNANCE STRUCTURE - Establish governance structures for incident response including roles, responsibilities, and escalation procedures - Define incident response team structure and authorities - Establish escalation procedures for critical incidents - Define communication protocols during incidents - Regular testing and updating of incident response procedures',
    
    'n) THIRD-PARTY GOVERNANCE FRAMEWORK - Implement governance controls for managing information security risks in third-party relationships - Establish supplier risk assessment processes - Define security requirements for third-party agreements - Implement ongoing monitoring of supplier security performance - Regular review and audit of third-party security controls',
    
    'o) CONTINUOUS IMPROVEMENT GOVERNANCE - Implement formal processes for continual improvement of the information security management system - Establish improvement identification and prioritization processes - Define roles and responsibilities for improvement initiatives - Implement tracking and measurement of improvement effectiveness - Regular review of improvement program effectiveness',
    
    'p) AWARENESS TRAINING GOVERNANCE - Establish comprehensive security awareness training programs at the governance level to ensure organizational security culture - Design role-specific awareness training programs - Implement regular training updates and assessments - Measure training effectiveness and participation - Maintain training records and competency documentation'
  ];
  
  -- Update the unified requirement with corrected content
  UPDATE unified_requirements
  SET 
    sub_requirements = v_corrected_requirements,
    updated_at = NOW()
  WHERE id = v_governance_unified_req_id;
  
  RAISE NOTICE '✅ Fixed content errors in Governance & Leadership requirements';
  RAISE NOTICE '✅ Corrected h) PERSONNEL SECURITY to focus on NDAs and termination responsibilities';
  RAISE NOTICE '✅ Fixed e) PROJECT MANAGEMENT to reference ISO 27002 Control 5.8';
  RAISE NOTICE '✅ Moved ISO 27002 Control 5.6 to only l) REGULATORY RELATIONSHIPS MANAGEMENT';
  RAISE NOTICE '✅ Reviewed and corrected all sub-requirement content alignment';
  
END $$;