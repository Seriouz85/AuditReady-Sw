-- Enhance Unified Requirements with Detailed Compliance Procedures
-- This migration adds much more detailed, specific guidance to unified requirements
-- including GDPR 72-hour notifications, NIS2 24-hour reporting, and comprehensive procedures

DO $$
DECLARE
  v_incident_category_id UUID;
  v_incident_unified_req_id UUID;
  v_detailed_incident_guidance TEXT;
  v_governance_category_id UUID;
  v_governance_unified_req_id UUID;
  v_detailed_governance_guidance TEXT;
  v_access_category_id UUID;
  v_access_unified_req_id UUID;
  v_detailed_access_guidance TEXT;
  v_risk_category_id UUID;
  v_risk_unified_req_id UUID;
  v_detailed_risk_guidance TEXT;
BEGIN
  RAISE NOTICE 'Starting unified requirements detail enhancement...';

  -- ===========================================
  -- INCIDENT RESPONSE & RECOVERY ENHANCEMENTS
  -- ===========================================
  
  SELECT id INTO v_incident_category_id
  FROM unified_compliance_categories 
  WHERE name = 'Incident Response & Recovery';
  
  IF v_incident_category_id IS NOT NULL THEN
    SELECT id INTO v_incident_unified_req_id
    FROM unified_requirements
    WHERE category_id = v_incident_category_id
    LIMIT 1;
    
    -- Define comprehensive incident response guidance with specific timelines
    v_detailed_incident_guidance := 'INCIDENT RESPONSE & RECOVERY UNIFIED REQUIREMENTS

## CRITICAL TIMING REQUIREMENTS - IMMEDIATE ACTION NEEDED

a) IMMEDIATE RESPONSE (0-1 Hours): Upon incident detection, immediately activate incident response team and begin containment. Document time of detection, initial assessment, and immediate actions taken. Notify CISO/Security Lead within 30 minutes of detection.

b) CRITICAL NOTIFICATIONS - GDPR 72-HOUR REQUIREMENT: For personal data breaches, notify Data Protection Authority within 72 hours of becoming aware. Required information: nature of breach, categories and number of data subjects affected, likely consequences, and measures taken/proposed. Use standardized breach notification forms. Maintain detailed incident log for audit purposes.

c) NIS2 24-HOUR EARLY WARNING: For essential/important service disruptions, submit early warning to competent authority within 24 hours. Include: incident type, service impact, preliminary assessment, and immediate response measures. Use national reporting framework and designated contact points.

d) NIS2 72-HOUR DETAILED REPORT: Submit comprehensive incident report within 72 hours including: detailed incident description, technical analysis, impact assessment, timeline of events, root cause analysis, and remediation actions taken.

e) DATA SUBJECT NOTIFICATION (High-Risk Breaches): When breach likely results in high risk to rights and freedoms, notify affected individuals without undue delay. Use clear, plain language explaining: nature of breach, contact point for more information, likely consequences, and measures taken to address the breach.

## COMPREHENSIVE INCIDENT MANAGEMENT PROCEDURES

f) INCIDENT CLASSIFICATION FRAMEWORK: Categorize incidents by severity (Critical/High/Medium/Low) based on: data volume affected, service disruption level, regulatory implications, and potential business impact. Critical incidents require C-level notification within 2 hours.

g) FORENSIC EVIDENCE PRESERVATION: Secure and preserve all digital evidence including: system logs, network traffic captures, memory dumps, and affected system images. Maintain chain of custody documentation. Engage forensic specialists for critical incidents.

h) CONTAINMENT STRATEGY IMPLEMENTATION: Execute immediate containment (isolate affected systems), short-term containment (temporary patches/workarounds), and long-term containment (system rebuilding/replacement). Document all containment actions and their effectiveness.

i) ERADICATION AND RECOVERY PROCEDURES: Remove malware/threats, apply security patches, rebuild compromised systems, and restore from clean backups. Verify system integrity before returning to production. Implement additional monitoring during recovery phase.

j) COMMUNICATION MANAGEMENT: Establish communication protocols for: internal stakeholders, external partners, customers, media, and regulators. Use pre-approved templates and messaging. Designate single point of contact for external communications.

k) POST-INCIDENT REVIEW AND IMPROVEMENT: Conduct thorough post-incident review within 30 days including: timeline analysis, response effectiveness assessment, lessons learned documentation, and improvement recommendations. Update incident response procedures based on findings.

## REGULATORY COMPLIANCE INTEGRATION

l) CROSS-FRAMEWORK REQUIREMENT MAPPING: Ensure incident response procedures satisfy ISO 27001 A.16, GDPR Articles 33-34, NIS2 Articles 23-24, and other applicable frameworks. Maintain compliance matrix showing requirement coverage.

m) CONTINUOUS MONITORING AND DETECTION: Implement 24/7 security monitoring using SIEM/SOAR platforms, threat intelligence feeds, and automated alerting. Define clear escalation thresholds and response triggers.

n) TRAINING AND PREPAREDNESS: Conduct quarterly incident response drills, annual tabletop exercises, and role-specific training. Maintain incident response team contact lists and ensure 24/7 availability.

o) VENDOR AND THIRD-PARTY INCIDENT COORDINATION: Establish procedures for incidents involving suppliers, cloud providers, or partners. Define notification requirements, coordination protocols, and shared responsibility models.

## IMPLEMENTATION PRIORITY AND TIMELINE
1. IMMEDIATE (Day 1): Establish 24/7 monitoring and basic response procedures
2. WEEK 1: Complete GDPR/NIS2 notification templates and authority contacts  
3. MONTH 1: Full incident response team training and initial drill
4. MONTH 2: Complete forensic capabilities and evidence handling procedures
5. ONGOING: Quarterly drills, annual reviews, and continuous improvement';

    IF v_incident_unified_req_id IS NOT NULL THEN
      UPDATE unified_requirements
      SET 
        title = 'Comprehensive Incident Response & Recovery Requirements',
        description = 'Detailed incident response procedures with specific GDPR 72-hour and NIS2 24-hour notification requirements, comprehensive response procedures, and regulatory compliance integration',
        implementation_guidance = v_detailed_incident_guidance,
        updated_at = NOW()
      WHERE id = v_incident_unified_req_id;
      
      RAISE NOTICE '✅ Enhanced Incident Response requirements with detailed GDPR/NIS2 procedures';
    END IF;
  END IF;

  -- ===========================================  
  -- GOVERNANCE & LEADERSHIP ENHANCEMENTS
  -- ===========================================
  
  SELECT id INTO v_governance_category_id
  FROM unified_compliance_categories 
  WHERE name = 'Governance & Leadership';
  
  IF v_governance_category_id IS NOT NULL THEN
    SELECT id INTO v_governance_unified_req_id
    FROM unified_requirements
    WHERE category_id = v_governance_category_id
    LIMIT 1;
    
    -- Enhanced governance guidance with specific implementation steps
    v_detailed_governance_guidance := 'GOVERNANCE & LEADERSHIP UNIFIED REQUIREMENTS

## SECTION 1: Strategic Leadership & ISMS Foundation

a) INFORMATION SECURITY MANAGEMENT SYSTEM (ISMS): Establish comprehensive ISMS covering scope definition, risk assessment methodology, security objectives, and performance metrics. Implement systematic approach using Plan-Do-Check-Act cycle. Conduct annual ISMS reviews with C-level participation. Document all ISMS processes and maintain version control.

b) SCOPE AND BOUNDARIES DEFINITION: Define precise ISMS boundaries including: organizational units, geographic locations, information assets, business processes, and technology systems. Consider internal/external issues, interested parties, and regulatory requirements. Review scope annually or when significant changes occur.

c) EXECUTIVE LEADERSHIP COMMITMENT: Top management must demonstrate visible commitment through: resource allocation, policy approval, objective setting, and regular ISMS reviews. CEO/Board must formally approve information security policy and receive quarterly security briefings. Document leadership decisions and communications.

d) INFORMATION SECURITY POLICY FRAMEWORK: Develop hierarchical policy structure with: overarching security policy (Board-approved), domain-specific policies (20+ areas), standards and procedures. Ensure alignment with business objectives, regulatory requirements, and risk appetite. Review policies annually with stakeholder input.

e) ORGANIZATIONAL SECURITY ROLES AND RESPONSIBILITIES: Define clear security roles including: CISO/Security Officer, Data Protection Officer, Business Continuity Manager, and security champions network. Create RACI matrices for security activities. Establish security committees with cross-functional representation.

## SECTION 2: Resource Management & Strategic Alignment

f) RESOURCE ALLOCATION AND BUDGET PLANNING: Establish dedicated information security budget (typically 3-10% of IT budget). Allocate resources for: personnel, technology, training, and incident response. Justify investments with risk-based business cases. Review budget quarterly and adjust based on threat landscape changes.

g) STRATEGIC PLANNING AND SECURITY ROADMAP: Develop 3-year security roadmap aligned with business strategy. Set measurable security objectives with KPIs and targets. Conduct annual strategic security planning sessions with business stakeholders. Maintain technology refresh and upgrade schedules.

h) RISK APPETITE AND TOLERANCE FRAMEWORKS: Define quantitative and qualitative risk appetite statements. Establish risk tolerance levels by business function and information type. Create risk acceptance criteria and escalation thresholds. Review risk appetite annually or when business context changes significantly.

i) GOVERNANCE STRUCTURE AND OVERSIGHT: Establish multi-level governance with: Board-level oversight, executive steering committee, operational working groups. Define clear reporting lines, meeting frequencies, and decision authorities. Maintain governance charter documents and review effectiveness annually.

## SECTION 3: Operational Excellence & Compliance

j) SEGREGATION OF DUTIES AND CONTROLS: Implement appropriate separation of conflicting duties in: financial processes, IT administration, data access, and audit functions. Document segregation requirements in role definitions. Monitor for violations using automated controls where possible.

k) MANAGEMENT REVIEW AND CONTINUOUS IMPROVEMENT: Conduct formal management reviews quarterly covering: ISMS performance, security metrics, incident trends, and improvement opportunities. Document review outcomes and action items. Track improvement initiative progress and effectiveness.

l) PERSONNEL SECURITY AND BACKGROUND VERIFICATION: Implement comprehensive background screening including: criminal background checks, employment verification, education confirmation, and reference checks. Define screening requirements by role sensitivity. Maintain screening records and conduct periodic re-screening for high-risk positions.

m) COMPETENCE MANAGEMENT AND TRAINING PROGRAMS: Assess security competence requirements by role and establish development programs. Provide role-specific security training including: general awareness (annual), specialized technical training, and leadership development. Maintain training records and assess effectiveness.

## SECTION 4: Monitoring, Audit & Assurance

n) PERFORMANCE MONITORING AND METRICS: Establish comprehensive security metrics program covering: technical indicators (vulnerability counts, incident response times), process metrics (training completion, policy compliance), and business metrics (risk reduction, cost avoidance). Produce monthly and quarterly dashboards.

o) INTERNAL AUDIT AND ASSESSMENT: Conduct annual internal ISMS audits using qualified personnel. Perform regular self-assessments, control testing, and compliance reviews. Engage external auditors for independent validation. Maintain audit programs and track corrective actions to completion.

p) CORRECTIVE ACTION AND IMPROVEMENT: Implement formal corrective and preventive action process for: audit findings, incidents, non-conformities, and improvement opportunities. Use root cause analysis techniques. Track actions to completion and verify effectiveness through follow-up assessments.

## IMPLEMENTATION ROADMAP
PHASE 1 (Months 1-3): Establish basic governance structure, policies, and ISMS framework
PHASE 2 (Months 4-6): Implement operational procedures, training programs, and monitoring  
PHASE 3 (Months 7-12): Mature governance processes, conduct audits, and drive continuous improvement
ONGOING: Regular reviews, updates, and enhancement based on changing business needs and threat landscape';

    IF v_governance_unified_req_id IS NOT NULL THEN
      UPDATE unified_requirements
      SET 
        title = 'Strategic Governance & Leadership Requirements',
        description = 'Comprehensive governance framework with detailed ISMS implementation, executive leadership requirements, resource management procedures, and continuous improvement processes',
        implementation_guidance = v_detailed_governance_guidance,
        updated_at = NOW()
      WHERE id = v_governance_unified_req_id;
      
      RAISE NOTICE '✅ Enhanced Governance & Leadership requirements with strategic implementation guidance';
    END IF;
  END IF;

  -- ===========================================
  -- ACCESS CONTROL & IDENTITY MANAGEMENT ENHANCEMENTS  
  -- ===========================================
  
  SELECT id INTO v_access_category_id
  FROM unified_compliance_categories 
  WHERE name = 'Access Control & Identity Management';
  
  IF v_access_category_id IS NOT NULL THEN
    SELECT id INTO v_access_unified_req_id
    FROM unified_requirements
    WHERE category_id = v_access_category_id
    LIMIT 1;
    
    -- Detailed access control guidance with specific procedures
    v_detailed_access_guidance := 'ACCESS CONTROL & IDENTITY MANAGEMENT UNIFIED REQUIREMENTS

## CRITICAL ACCESS CONTROL FOUNDATIONS

a) IDENTITY LIFECYCLE MANAGEMENT: Implement comprehensive identity management covering: user onboarding (complete within 1 business day), role changes (update within 4 hours), and offboarding (disable within 1 hour of termination). Maintain identity repository with single source of truth. Automate provisioning/deprovisioning where possible.

b) MULTI-FACTOR AUTHENTICATION (MFA) IMPLEMENTATION: Deploy MFA for all privileged accounts, remote access, and sensitive system access. Support multiple authentication factors: something you know (password), something you have (token/phone), something you are (biometrics). Require MFA registration within 48 hours of account creation.

c) PRIVILEGED ACCESS MANAGEMENT (PAM): Implement dedicated PAM solution for administrative accounts including: password vaulting, session recording, just-in-time access, and approval workflows. Rotate privileged passwords at least every 90 days. Monitor and log all privileged activities.

d) ROLE-BASED ACCESS CONTROL (RBAC): Design role hierarchy based on job functions and principle of least privilege. Define standard roles with pre-approved access packages. Implement role mining and certification processes. Review role assignments quarterly and re-certify annually.

## AUTHENTICATION AND PASSWORD REQUIREMENTS

e) PASSWORD POLICY ENFORCEMENT: Implement strong password requirements: minimum 12 characters, complexity requirements, password history (12 previous), maximum age (180 days for standard users, 90 days for privileged). Prohibit common passwords using blacklists. Enable account lockout after 5 failed attempts.

f) SINGLE SIGN-ON (SSO) INTEGRATION: Deploy enterprise SSO solution supporting SAML 2.0, OAuth 2.0, and OpenID Connect. Integrate minimum 80% of business applications. Implement session management with appropriate timeouts. Support mobile and cloud application access.

g) AUTHENTICATION INFRASTRUCTURE HARDENING: Secure authentication services with: network segmentation, encryption in transit/at rest, redundancy and high availability, regular security updates. Monitor authentication logs for suspicious activities and implement alerting for security events.

## ACCESS GOVERNANCE AND MONITORING

h) ACCESS REQUEST AND APPROVAL PROCESS: Implement formal access request workflow with: business justification, manager approval, security review (for privileged access), and time-bound approvals. Maintain audit trail of all access decisions. Set automatic expiration for temporary access.

i) PERIODIC ACCESS REVIEWS AND RECERTIFICATION: Conduct quarterly access reviews for all users covering: active accounts, role assignments, group memberships, and application access. Require managers to certify direct report access. Implement automated compliance reporting and exception tracking.

j) SEGREGATION OF DUTIES (SoD) CONTROLS: Identify and document SoD conflicts in critical business processes. Implement preventive controls where possible, compensating controls where necessary. Monitor for SoD violations using automated tools. Maintain SoD risk register and mitigation plans.

k) SHARED AND SERVICE ACCOUNT MANAGEMENT: Minimize shared accounts and implement strong controls where required: documented business justification, enhanced monitoring, password vaulting, and regular access reviews. Prefer service accounts with API keys for automated processes.

## TECHNICAL ACCESS CONTROLS

l) NETWORK ACCESS CONTROL (NAC): Implement network access controls including: device authentication, health checks, VLAN assignment, and quarantine capabilities. Deploy 802.1X for wired networks and WPA3-Enterprise for wireless. Maintain device inventory and compliance status.

m) APPLICATION-LEVEL ACCESS CONTROLS: Implement fine-grained authorization controls within applications including: function-level security, data-level permissions, and context-aware access decisions. Use attribute-based access control (ABAC) for complex authorization scenarios.

n) DATABASE AND SYSTEM ACCESS CONTROLS: Implement database security controls including: encrypted connections, privileged account monitoring, query logging, and data masking for non-production environments. Restrict direct database access and prefer application-mediated access.

## COMPLIANCE AND AUDIT CONTROLS

o) ACCESS LOGGING AND MONITORING: Log all authentication events, access attempts, and privilege changes. Implement real-time monitoring for: failed login attempts, after-hours access, geographic anomalies, and privilege escalations. Retain logs per regulatory requirements (minimum 1 year).

p) GDPR DATA SUBJECT ACCESS MANAGEMENT: Implement controls supporting GDPR rights including: data subject identification verification, access request fulfillment (within 30 days), data portability, and erasure capabilities. Maintain audit logs of data subject interactions.

q) EMERGENCY ACCESS PROCEDURES: Establish break-glass procedures for emergency access including: approval workflows, time-limited access, enhanced monitoring, and mandatory review. Document emergency scenarios and maintain updated emergency contact lists.

## IMPLEMENTATION TIMELINE
IMMEDIATE (Week 1): Deploy MFA for all privileged accounts and external access
MONTH 1: Complete identity management system deployment and basic RBAC
MONTH 2: Implement PAM solution and privileged account controls  
MONTH 3: Complete SSO integration and access governance processes
ONGOING: Quarterly access reviews, annual recertification, and continuous monitoring';

    IF v_access_unified_req_id IS NOT NULL THEN
      UPDATE unified_requirements
      SET 
        title = 'Comprehensive Access Control & Identity Management',
        description = 'Detailed access control framework with MFA requirements, privileged access management, RBAC implementation, GDPR compliance controls, and comprehensive monitoring procedures',
        implementation_guidance = v_detailed_access_guidance,
        updated_at = NOW()
      WHERE id = v_access_unified_req_id;
      
      RAISE NOTICE '✅ Enhanced Access Control requirements with detailed implementation procedures';
    END IF;
  END IF;

  -- ===========================================
  -- RISK MANAGEMENT ENHANCEMENTS
  -- ===========================================
  
  SELECT id INTO v_risk_category_id
  FROM unified_compliance_categories 
  WHERE name = 'Risk Management';
  
  IF v_risk_category_id IS NOT NULL THEN
    SELECT id INTO v_risk_unified_req_id
    FROM unified_requirements
    WHERE category_id = v_risk_category_id
    LIMIT 1;
    
    -- Comprehensive risk management guidance
    v_detailed_risk_guidance := 'RISK MANAGEMENT UNIFIED REQUIREMENTS

## RISK ASSESSMENT FRAMEWORK AND METHODOLOGY

a) COMPREHENSIVE RISK IDENTIFICATION: Conduct systematic risk identification covering: information assets, business processes, technologies, third parties, and external threats. Use multiple techniques including: asset inventories, threat modeling, scenario analysis, and stakeholder interviews. Update risk register monthly and conduct full assessment annually.

b) QUANTITATIVE AND QUALITATIVE RISK ANALYSIS: Implement hybrid risk analysis approach using: quantitative methods (ALE, SLE calculations) for financial impacts and qualitative methods (risk matrices) for difficult-to-quantify risks. Use industry standard risk frameworks (ISO 31000, NIST RMF) and maintain consistent risk scoring methodology.

c) RISK EVALUATION AND PRIORITIZATION: Establish risk evaluation criteria considering: likelihood of occurrence, magnitude of impact, velocity of impact, and organizational risk appetite. Create risk heat maps and priority rankings. Define clear thresholds for risk acceptance, mitigation, and escalation decisions.

d) BUSINESS IMPACT ANALYSIS (BIA): Conduct comprehensive BIA for all critical business processes including: recovery time objectives (RTO), recovery point objectives (RPO), maximum tolerable downtime, and financial impact calculations. Update BIA annually or when significant business changes occur.

## REGULATORY AND COMPLIANCE RISK MANAGEMENT

e) GDPR COMPLIANCE RISK ASSESSMENT: Perform detailed GDPR risk assessments covering: lawful basis validation, data processing activities, international transfers, and data subject rights. Conduct Data Protection Impact Assessments (DPIAs) for high-risk processing activities. Maintain Article 30 processing records and review quarterly.

f) NIS2 DIRECTIVE RISK MANAGEMENT: For applicable organizations, implement NIS2 risk management requirements including: network and information system security measures, supply chain risk assessments, and cybersecurity governance frameworks. Conduct sector-specific risk assessments based on essential/important service classification.

g) CROSS-FRAMEWORK RISK MAPPING: Maintain compliance risk registers mapping organizational risks to regulatory requirements across ISO 27001, GDPR, NIS2, and other applicable frameworks. Ensure risk treatments address multiple compliance obligations simultaneously.

## RISK TREATMENT AND CONTROL IMPLEMENTATION

h) RISK TREATMENT STRATEGY DEVELOPMENT: Define risk treatment options for each identified risk: accept (with formal approval), avoid (eliminate activity), mitigate (reduce likelihood/impact), or transfer (insurance/contractual). Document treatment decisions and implementation timelines.

i) SECURITY CONTROL IMPLEMENTATION: Deploy appropriate security controls based on risk assessment findings using recognized frameworks (ISO 27001, NIST CSF, CIS Controls). Prioritize controls based on risk reduction potential and implementation feasibility. Maintain control effectiveness documentation.

j) CONTROL EFFECTIVENESS MONITORING: Establish Key Risk Indicators (KRIs) and Key Performance Indicators (KPIs) for security controls. Implement automated monitoring where possible and manual assessments for process controls. Report control effectiveness monthly and conduct detailed reviews quarterly.

k) RESIDUAL RISK MANAGEMENT: Calculate and document residual risk after control implementation. Ensure residual risks align with organizational risk appetite. Obtain formal acceptance for residual risks exceeding tolerance thresholds. Re-evaluate residual risks when threat landscape changes.

## THIRD-PARTY AND SUPPLY CHAIN RISK

l) VENDOR RISK ASSESSMENT: Implement comprehensive vendor risk assessment process including: security questionnaires, on-site assessments, certification reviews, and continuous monitoring. Categorize vendors by risk level and apply appropriate due diligence requirements.

m) SUPPLY CHAIN SECURITY CONTROLS: Assess and monitor supply chain risks including: software integrity, hardware tampering, service availability, and data protection. Require security certifications from critical suppliers and implement supply chain resilience measures.

n) CONTRACTUAL RISK MITIGATION: Include comprehensive security and privacy clauses in vendor contracts covering: data protection obligations, security requirements, incident notification, audit rights, and termination procedures. Review contracts annually and update based on regulatory changes.

## RISK MONITORING AND REPORTING

o) CONTINUOUS RISK MONITORING: Implement continuous risk monitoring using threat intelligence, vulnerability scanners, security metrics, and business change notifications. Automate risk indicator collection and establish real-time alerting for critical risk threshold breaches.

p) EXECUTIVE RISK REPORTING: Provide regular risk reporting to executive leadership including: risk dashboard, trend analysis, treatment progress, and emerging threats. Conduct quarterly risk committee meetings and annual board-level risk reviews. Use consistent risk communication frameworks.

q) RISK CULTURE AND AWARENESS: Develop organizational risk culture through: role-specific risk training, risk assessment participation, and risk-aware decision making. Establish risk champion networks and integrate risk considerations into business processes and project management.

## CRISIS AND EMERGING RISK MANAGEMENT

r) EMERGING THREAT ASSESSMENT: Monitor emerging threats including: new attack vectors, regulatory changes, technology risks, and geopolitical factors. Participate in threat intelligence sharing and industry risk forums. Conduct scenario planning for high-impact, low-likelihood events.

s) CRISIS MANAGEMENT INTEGRATION: Integrate risk management with crisis management procedures including: escalation protocols, communication plans, and recovery procedures. Test crisis response through tabletop exercises and update plans based on lessons learned.

## IMPLEMENTATION ROADMAP
PHASE 1 (Month 1): Complete comprehensive risk assessment and establish risk register
PHASE 2 (Month 2-3): Implement priority risk treatments and monitoring controls  
PHASE 3 (Month 4-6): Deploy continuous monitoring and reporting capabilities
ONGOING: Monthly risk register updates, quarterly assessments, and annual methodology reviews';

    IF v_risk_unified_req_id IS NOT NULL THEN
      UPDATE unified_requirements
      SET 
        title = 'Comprehensive Risk Management Framework',
        description = 'Detailed risk management requirements covering quantitative/qualitative assessment, GDPR/NIS2 compliance risks, third-party risk management, continuous monitoring, and crisis management integration',
        implementation_guidance = v_detailed_risk_guidance,
        updated_at = NOW()
      WHERE id = v_risk_unified_req_id;
      
      RAISE NOTICE '✅ Enhanced Risk Management requirements with comprehensive assessment and treatment procedures';
    END IF;
  END IF;

  RAISE NOTICE '🎯 UNIFIED REQUIREMENTS DETAIL ENHANCEMENT COMPLETED';
  RAISE NOTICE '✅ Enhanced Incident Response with GDPR 72-hour and NIS2 24-hour requirements';  
  RAISE NOTICE '✅ Enhanced Governance & Leadership with strategic implementation guidance';
  RAISE NOTICE '✅ Enhanced Access Control with detailed MFA and PAM procedures';
  RAISE NOTICE '✅ Enhanced Risk Management with comprehensive assessment framework';
  RAISE NOTICE '📋 All unified requirements now include specific timelines, procedures, and regulatory details';
  
END $$;