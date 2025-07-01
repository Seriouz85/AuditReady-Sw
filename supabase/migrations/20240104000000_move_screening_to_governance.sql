-- ============================================================================
-- Move Screening Requirement from Security Awareness to Governance & Leadership
-- ============================================================================

-- First, update the Governance & Leadership requirement to include screening
UPDATE unified_requirements
SET sub_requirements = ARRAY[
    'a) UNIFIED POLICY FRAMEWORK: Establish comprehensive information security policy that satisfies ISO 27001 leadership requirements, ISO 27002 policy controls, GDPR data protection principles, and NIS2 governance measures - ensuring top management commitment and regulatory compliance across all frameworks',
    'b) UNIFIED GOVERNANCE STRUCTURE: Define integrated governance with clear roles, responsibilities, and authorities that address ISO 27001 ISMS scope, ISO 27002 organizational controls, GDPR controller/processor responsibilities, and NIS2 cybersecurity governance requirements including management approval of cybersecurity risk policies (Art. 21(2)(a)), management responsibilities for implementation (Art. 21(2)(f)), and board oversight of cybersecurity strategy',
    'c) UNIFIED RISK MANAGEMENT: Implement consolidated risk assessment and treatment processes that satisfy ISO 27001 risk management (clauses 6.1.2, 6.1.3, 8.2, 8.3), ISO 27002 threat intelligence collection (A.5.7), GDPR data protection impact assessments (Art. 35, 36), and NIS2 cybersecurity risk management measures including risk analysis policies (Art. 21(2)(a)) and effectiveness assessment procedures (Art. 21(2)(g))',
    'd) UNIFIED COMPLIANCE MONITORING: Establish integrated audit, monitoring, and review processes that meet ISO 27001 internal audit requirements, ISO 27002 independent reviews, GDPR compliance monitoring, and NIS2 effectiveness assessment obligations',
    'e) UNIFIED DOCUMENTATION SYSTEM: Maintain comprehensive documentation framework that satisfies ISO 27001 documented information requirements, ISO 27002 operating procedures, GDPR records of processing, and NIS2 policy documentation mandates',
    'f) UNIFIED STAKEHOLDER ENGAGEMENT: Establish consolidated communication with authorities, special interest groups, and relevant parties as required by ISO 27002 contacts, GDPR supervisory authority relations, and NIS2 incident reporting obligations',
    'g) UNIFIED CONTINUOUS IMPROVEMENT: Implement integrated improvement processes that address ISO 27001 continual improvement, ISO 27002 learning from incidents, GDPR regular review requirements, and NIS2 effectiveness evaluation measures',
    'h) SCREENING: Conduct background verification checks on candidates for employment, contractors, and third-party users in accordance with applicable laws, regulations, and ethical considerations, proportional to business requirements, data classification, and perceived risks'
]
WHERE title = 'Information Security Governance & Leadership'
AND category_id = (SELECT id FROM unified_compliance_categories WHERE name = 'Governance & Leadership');

-- Then, update the Security Awareness requirement to remove screening
UPDATE unified_requirements
SET sub_requirements = ARRAY[
    'a) Establish and maintain a formal security awareness program',
    'b) Conduct training at hire and annually for all personnel',
    'c) Provide role-specific security training based on job responsibilities',
    'd) Train workforce on data handling, classification, and transfer procedures',
    'e) Educate employees on malware protection and safe computing practices',
    'f) Conduct secure coding training for development personnel',
    'g) Provide network security awareness for remote workers',
    'h) Train staff on patch management and software update procedures',
    'i) Implement advanced social engineering awareness for high-profile roles'
]
WHERE title = 'Security Awareness & Skills Training Program'
AND category_id = (SELECT id FROM unified_compliance_categories WHERE name = 'Security Awareness');

-- Update the timestamps
UPDATE unified_requirements SET updated_at = NOW() 
WHERE title IN ('Information Security Governance & Leadership', 'Security Awareness & Skills Training Program');