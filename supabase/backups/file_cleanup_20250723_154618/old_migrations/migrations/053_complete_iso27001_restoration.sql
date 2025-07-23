-- ============================================================================
-- Complete ISO 27001:2022 Requirements Restoration
-- Restore ALL ISO 27001 clauses from 4.1 to 10.2
-- ============================================================================

-- First, clean up existing ISO 27001 entries to start fresh
DELETE FROM requirements_library 
WHERE standard_id = '55742f4e-769b-4efe-912c-1371de5e1cd6';

-- Insert complete ISO 27001:2022 requirement set (all clauses from 4.1 to 10.2)
INSERT INTO requirements_library (id, standard_id, requirement_code, section, title, official_description, implementation_guidance, audit_ready_guidance, priority, tags, sort_order, created_at, updated_at) VALUES

-- Section 4: Context of the organization
(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '4.1', '4', 'Understanding the organization and its context', 'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcome(s) of its information security management system.', 'Identify and document all relevant internal and external factors that impact information security.', '**Purpose**: Understand internal and external factors affecting the ISMS.
**Implementation**:
• Conduct environmental scanning for external factors
• Analyze internal capabilities and constraints
• Document relevant issues and their impact
• Review context at planned intervals', 'high', ARRAY['governance', 'context', 'planning'], 1, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '4.2', '4', 'Understanding the needs and expectations of interested parties', 'The organization shall determine: a) the interested parties that are relevant to the information security management system; b) the relevant requirements of these interested parties; c) which of these requirements will be addressed through the information security management system.', 'Identify stakeholders and their security requirements.', '**Purpose**: Identify and understand stakeholder requirements for information security.
**Implementation**:
• Identify all relevant interested parties
• Document their security requirements
• Determine which requirements to address
• Maintain stakeholder communication', 'high', ARRAY['governance', 'stakeholders', 'requirements'], 2, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '4.3', '4', 'Determining the scope of the information security management system', 'The organization shall determine the boundaries and applicability of the information security management system to establish its scope. When determining this scope, the organization shall consider: a) the external and internal issues referred to in 4.1; b) the requirements referred to in 4.2; c) interfaces and dependencies between activities performed by the organization, and those that are performed by other organizations. The scope shall be available as documented information.', 'Define which parts of the organization are covered by the ISMS.', '**Purpose**: Define clear boundaries and applicability of the ISMS.
**Implementation**:
• Define physical and logical boundaries
• Consider internal and external issues
• Document interfaces and dependencies
• Make scope available as documented information', 'high', ARRAY['governance', 'scope', 'documentation'], 3, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '4.4', '4', 'Information security management system', 'The organization shall establish, implement, maintain and continually improve an information security management system, including the processes needed and their interactions, in accordance with the requirements of this document.', 'Implement a systematic approach to managing information security.', '**Purpose**: Establish and maintain the ISMS according to ISO 27001 requirements.
**Implementation**:
• Establish ISMS processes and interactions
• Implement according to standard requirements
• Maintain and continually improve
• Document process interactions', 'high', ARRAY['governance', 'isms', 'processes'], 4, NOW(), NOW()),

-- Section 5: Leadership
(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '5.1', '5', 'Leadership and commitment', 'Top management shall demonstrate leadership and commitment with respect to the information security management system by: a) ensuring the information security policy and objectives are established; b) ensuring integration of ISMS requirements; c) ensuring resources are available; d) communicating importance of effective information security; e) ensuring ISMS achieves intended outcomes; f) directing and supporting persons; g) promoting continual improvement.', 'Ensure top management demonstrates leadership and commitment to the ISMS.', '**Purpose**: Ensure top management actively leads and supports the ISMS.
**Implementation**:
• Establish security policy and objectives
• Integrate ISMS into business processes
• Provide adequate resources
• Communicate importance of security
• Monitor ISMS effectiveness', 'high', ARRAY['governance', 'leadership', 'management'], 5, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '5.2', '5', 'Policy', 'Top management shall establish an information security policy that: a) is appropriate to the purpose of the organization; b) includes information security objectives or provides framework for setting them; c) includes commitment to satisfy applicable requirements; d) includes commitment to continual improvement. The policy shall be available as documented information, communicated within the organization, and available to interested parties as appropriate.', 'Establish and maintain an information security policy.', '**Purpose**: Establish appropriate information security policy with management commitment.
**Implementation**:
• Develop policy appropriate to organization
• Include security objectives framework
• Commit to requirements and improvement
• Communicate policy throughout organization', 'high', ARRAY['governance', 'policy', 'documentation'], 6, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '5.3', '5', 'Organizational roles, responsibilities and authorities', 'Top management shall ensure that the responsibilities and authorities for roles relevant to information security are assigned and communicated. Top management shall assign responsibility and authority for: a) ensuring ISMS conforms to requirements; b) reporting on ISMS performance to top management.', 'Define and communicate information security roles and responsibilities.', '**Purpose**: Assign and communicate security roles, responsibilities and authorities.
**Implementation**:
• Define security roles and responsibilities
• Assign authorities for ISMS conformance
• Establish reporting lines to management
• Communicate roles throughout organization', 'high', ARRAY['governance', 'roles', 'responsibilities'], 7, NOW(), NOW()),

-- Section 6: Planning
(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '6.1.1', '6', 'General (Actions to address risks and opportunities)', 'When planning for the information security management system, the organization shall consider the issues referred to in 4.1 and requirements in 4.2 and determine risks and opportunities that need to be addressed.', 'Plan the ISMS considering context and requirements to address risks and opportunities.', '**Purpose**: Identify risks and opportunities when planning the ISMS.
**Implementation**:
• Consider context and requirements
• Identify relevant risks and opportunities
• Plan actions to address them
• Integrate into ISMS processes', 'high', ARRAY['planning', 'risk', 'opportunities'], 8, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '6.1.2', '6', 'Information security risk assessment', 'The organization shall define and apply an information security risk assessment process that: a) establishes risk criteria; b) ensures repeated assessments produce consistent results; c) identifies risks; d) analyzes risks; e) evaluates risks. The organization shall retain documented information about the process.', 'Define and implement a risk assessment process.', '**Purpose**: Establish systematic process for assessing information security risks.
**Implementation**:
• Define risk assessment criteria
• Identify information security risks
• Analyze risk likelihood and impact
• Evaluate risks against criteria
• Document assessment process', 'high', ARRAY['risk-management', 'assessment', 'analysis'], 9, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '6.1.3', '6', 'Information security risk treatment', 'The organization shall define and apply an information security risk treatment process to: a) select appropriate risk treatment options; b) determine controls necessary; c) compare controls with Annex A; d) produce Statement of Applicability; e) formulate risk treatment plan; f) obtain risk owners'' approval. The organization shall retain documented information.', 'Define and implement a risk treatment process.', '**Purpose**: Establish process for treating identified information security risks.
**Implementation**:
• Select risk treatment options
• Determine necessary controls
• Create Statement of Applicability
• Develop risk treatment plan
• Obtain risk owner approval', 'high', ARRAY['risk-management', 'treatment', 'controls'], 10, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '6.2', '6', 'Information security objectives and planning to achieve them', 'The organization shall establish information security objectives at relevant functions and levels. Objectives shall be: a) consistent with policy; b) measurable; c) consider requirements; d) consider risk results; e) monitored; f) communicated; g) updated. When planning to achieve objectives, the organization shall determine what, resources, who, when, and how results will be evaluated.', 'Establish measurable security objectives and plans to achieve them.', '**Purpose**: Set measurable information security objectives with clear plans.
**Implementation**:
• Establish objectives aligned with policy
• Ensure objectives are measurable
• Plan actions, resources, and timelines
• Assign responsibilities
• Define evaluation criteria', 'high', ARRAY['planning', 'objectives', 'measurement'], 11, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '6.3', '6', 'Planning of changes', 'When the organization determines the need for changes to the information security management system, the changes shall be carried out in a planned manner.', 'Plan and control changes to the ISMS.', '**Purpose**: Ensure changes to ISMS are planned and controlled.
**Implementation**:
• Identify need for ISMS changes
• Plan change implementation
• Consider risks of changes
• Control change execution
• Review change effectiveness', 'medium', ARRAY['planning', 'change-management', 'control'], 12, NOW(), NOW()),

-- Section 7: Support
(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '7.1', '7', 'Resources', 'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the information security management system.', 'Provide adequate resources for the ISMS.', '**Purpose**: Ensure adequate resources for ISMS implementation and improvement.
**Implementation**:
• Identify resource requirements
• Provide necessary resources
• Consider human and technical resources
• Allocate budget appropriately
• Monitor resource adequacy', 'high', ARRAY['support', 'resources', 'management'], 13, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '7.2', '7', 'Competence', 'The organization shall: a) determine necessary competence; b) ensure persons are competent based on education, training or experience; c) where applicable, take actions to acquire competence; d) retain documented information as evidence.', 'Ensure personnel have necessary security competence.', '**Purpose**: Ensure personnel are competent for their security responsibilities.
**Implementation**:
• Define competence requirements
• Assess current competencies
• Provide training where needed
• Maintain competence records
• Evaluate training effectiveness', 'high', ARRAY['support', 'competence', 'training'], 14, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '7.3', '7', 'Awareness', 'Persons doing work under the organization''s control shall be aware of: a) the information security policy; b) their contribution to ISMS effectiveness; c) implications of not conforming with ISMS requirements.', 'Ensure personnel are aware of security policies and their responsibilities.', '**Purpose**: Create security awareness among all personnel.
**Implementation**:
• Communicate security policy
• Explain individual contributions
• Clarify consequences of non-compliance
• Conduct regular awareness sessions
• Measure awareness effectiveness', 'high', ARRAY['support', 'awareness', 'training'], 15, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '7.4', '7', 'Communication', 'The organization shall determine the need for internal and external communications relevant to the information security management system including: a) on what to communicate; b) when to communicate; c) with whom to communicate; d) who shall communicate; e) the processes by which communication shall be effected.', 'Establish effective communication processes for security matters.', '**Purpose**: Plan and implement effective security communication.
**Implementation**:
• Define communication requirements
• Establish communication channels
• Determine target audiences
• Assign communication responsibilities
• Monitor communication effectiveness', 'medium', ARRAY['support', 'communication', 'processes'], 16, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '7.5.1', '7', 'General (Documented information)', 'The organization''s information security management system shall include: a) documented information required by this document; b) documented information determined by the organization as necessary.', 'Maintain required ISMS documentation.', '**Purpose**: Ensure ISMS includes all required documented information.
**Implementation**:
• Identify documentation requirements
• Create required documents
• Determine additional documentation needs
• Establish documentation standards
• Maintain document currency', 'medium', ARRAY['support', 'documentation', 'records'], 17, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '7.5.2', '7', 'Creating and updating', 'When creating and updating documented information, the organization shall ensure appropriate: a) identification and description; b) format and media; c) review and approval for suitability and adequacy.', 'Control creation and updating of documented information.', '**Purpose**: Ensure proper control when creating and updating documents.
**Implementation**:
• Use consistent identification
• Define format standards
• Implement review processes
• Obtain proper approvals
• Track document versions', 'medium', ARRAY['support', 'documentation', 'control'], 18, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '7.5.3', '7', 'Control of documented information', 'Documented information shall be controlled to ensure: a) it is available and suitable for use; b) it is adequately protected. For control, the organization shall address: distribution, access, retrieval, use, storage, preservation, control of changes, retention and disposition.', 'Control access and changes to documented information.', '**Purpose**: Protect and control documented information throughout lifecycle.
**Implementation**:
• Control document distribution
• Manage access permissions
• Protect document integrity
• Track changes and versions
• Define retention periods', 'medium', ARRAY['support', 'documentation', 'control'], 19, NOW(), NOW()),

-- Section 8: Operation
(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '8.1', '8', 'Operational planning and control', 'The organization shall plan, implement and control the processes needed to meet requirements and to implement actions determined in Clause 6 by: establishing criteria, implementing control, keeping documented information, controlling planned changes and reviewing unintended changes.', 'Plan and control operations to meet security requirements.', '**Purpose**: Plan and control operational processes for information security.
**Implementation**:
• Establish operational criteria
• Implement process controls
• Document operational procedures
• Control planned changes
• Review unintended changes', 'high', ARRAY['operation', 'planning', 'control'], 20, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '8.2', '8', 'Information security risk assessment', 'The organization shall perform information security risk assessments at planned intervals or when significant changes are proposed or occur, taking account of the criteria established in 6.1.2. The organization shall retain documented information of the results.', 'Conduct regular risk assessments.', '**Purpose**: Perform risk assessments at planned intervals and when changes occur.
**Implementation**:
• Schedule regular assessments
• Assess when changes occur
• Use established criteria
• Document assessment results
• Track risk trends', 'high', ARRAY['operation', 'risk-assessment', 'monitoring'], 21, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '8.3', '8', 'Information security risk treatment', 'The organization shall implement the information security risk treatment plan. The organization shall retain documented information of the results of the information security risk treatment.', 'Implement the risk treatment plan.', '**Purpose**: Execute risk treatment plans and document results.
**Implementation**:
• Execute treatment plans
• Monitor implementation progress
• Document treatment results
• Verify control effectiveness
• Update plans as needed', 'high', ARRAY['operation', 'risk-treatment', 'implementation'], 22, NOW(), NOW()),

-- Section 9: Performance evaluation
(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '9.1', '9', 'Monitoring, measurement, analysis and evaluation', 'The organization shall evaluate the information security performance and the effectiveness of the information security management system. The organization shall determine: a) what needs monitoring and measurement; b) methods for monitoring, measurement, analysis and evaluation; c) when to perform; d) who shall perform; e) when results shall be analyzed; f) who shall analyze and evaluate. The organization shall retain documented information as evidence.', 'Monitor and measure ISMS performance.', '**Purpose**: Monitor, measure and evaluate ISMS performance and effectiveness.
**Implementation**:
• Define monitoring requirements
• Select measurement methods
• Schedule monitoring activities
• Assign monitoring responsibilities
• Document and analyze results', 'high', ARRAY['evaluation', 'monitoring', 'measurement'], 23, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '9.2.1', '9', 'General (Internal audit)', 'The organization shall conduct internal audits at planned intervals to provide information on whether the information security management system conforms to requirements and is effectively implemented and maintained.', 'Conduct regular internal audits of the ISMS.', '**Purpose**: Conduct internal audits to verify ISMS conformance and effectiveness.
**Implementation**:
• Plan audit schedule
• Define audit scope and criteria
• Select qualified auditors
• Conduct systematic audits
• Report audit findings', 'high', ARRAY['evaluation', 'audit', 'compliance'], 24, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '9.2.2', '9', 'Internal audit programme', 'The organization shall plan, establish, implement and maintain an audit programme(s) including frequency, methods, responsibilities, planning requirements and reporting. The audit programme shall take into consideration the importance of processes and results of previous audits. The organization shall: a) define audit criteria and scope; b) select auditors ensuring objectivity; c) ensure results are reported to management; d) retain documented information.', 'Establish and maintain an internal audit programme.', '**Purpose**: Establish comprehensive internal audit programme for the ISMS.
**Implementation**:
• Develop audit programme
• Consider process importance
• Ensure auditor independence
• Report to management
• Maintain audit records', 'high', ARRAY['evaluation', 'audit', 'programme'], 25, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '9.3.1', '9', 'General (Management review)', 'Top management shall review the organization''s information security management system at planned intervals to ensure its continuing suitability, adequacy and effectiveness.', 'Conduct management reviews of the ISMS.', '**Purpose**: Ensure top management reviews ISMS for continued suitability.
**Implementation**:
• Schedule regular reviews
• Prepare review inputs
• Conduct management reviews
• Document review outcomes
• Track action items', 'high', ARRAY['evaluation', 'management-review', 'governance'], 26, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '9.3.2', '9', 'Management review inputs', 'The management review shall include consideration of: a) status of actions from previous reviews; b) changes in external and internal issues; c) feedback on information security performance including trends in: nonconformities, monitoring and measurement results, audit results, fulfilment of objectives; d) feedback from interested parties; e) results of risk assessment and status of risk treatment; f) opportunities for continual improvement.', 'Provide comprehensive inputs for management review.', '**Purpose**: Ensure management review considers all relevant inputs.
**Implementation**:
• Review previous actions
• Analyze performance trends
• Compile audit results
• Gather stakeholder feedback
• Present risk status', 'high', ARRAY['evaluation', 'management-review', 'inputs'], 27, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '9.3.3', '9', 'Management review results', 'The results of the management review shall include decisions related to continual improvement opportunities and any needs for changes to the information security management system. The organization shall retain documented information as evidence of the results of management reviews.', 'Document management review outcomes and decisions.', '**Purpose**: Document decisions and improvement opportunities from management review.
**Implementation**:
• Document review decisions
• Identify improvement opportunities
• Plan necessary changes
• Assign action items
• Track implementation', 'high', ARRAY['evaluation', 'management-review', 'results'], 28, NOW(), NOW()),

-- Section 10: Improvement
(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '10.1', '10', 'Continual improvement', 'The organization shall continually improve the suitability, adequacy and effectiveness of the information security management system.', 'Continuously improve the ISMS.', '**Purpose**: Drive continual improvement of ISMS effectiveness.
**Implementation**:
• Identify improvement opportunities
• Implement improvement actions
• Measure improvement results
• Share improvement learnings
• Embed improvement culture', 'high', ARRAY['improvement', 'continual', 'effectiveness'], 29, NOW(), NOW()),

(gen_random_uuid(), '55742f4e-769b-4efe-912c-1371de5e1cd6', '10.2', '10', 'Nonconformity and corrective action', 'When a nonconformity occurs, the organization shall: a) react to the nonconformity and take action; b) evaluate the need for action to eliminate causes; c) implement any action needed; d) review effectiveness of corrective action; e) make changes to ISMS if necessary. The organization shall retain documented information as evidence.', 'Manage nonconformities and implement corrective actions.', '**Purpose**: Effectively manage nonconformities and prevent recurrence.
**Implementation**:
• React to nonconformities promptly
• Analyze root causes
• Implement corrective actions
• Verify action effectiveness
• Update ISMS as needed', 'high', ARRAY['improvement', 'nonconformity', 'corrective-action'], 30, NOW(), NOW());

-- Update the standard description to reflect complete restoration
UPDATE standards_library 
SET description = 'Information Security Management System standard that provides requirements for establishing, implementing, maintaining and continually improving an ISMS. Complete with all 30 clauses from 4.1 to 10.2.'
WHERE id = '55742f4e-769b-4efe-912c-1371de5e1cd6';