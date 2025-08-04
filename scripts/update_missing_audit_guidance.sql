-- Update missing audit ready guidance for CIS Controls IG2
-- Based on the format: **Purpose**\n\n[purpose text]\n\n**Implementation**\n\n[implementation bullet points]

-- 10.6 Centrally Manage Anti-Malware Software
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Centrally manage anti-malware software to ensure consistent protection across all enterprise assets. Configure the anti-malware software to automatically update signatures and scan engines.

**Implementation**

• Deploy centralized anti-malware management console (e.g., Symantec Endpoint Protection Manager, Microsoft Defender ATP)
• Configure automatic signature updates at least daily
• Enable real-time scanning on all endpoints
• Configure scheduled full system scans weekly
• Monitor anti-malware status and alert on failures
• Generate reports on malware detections and remediation'
WHERE control_id = '10.6' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 10.7 Use Behavior-Based Anti-Malware Software
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Use behavior-based anti-malware software to detect and block malicious activities based on behavior patterns rather than signatures alone, providing protection against zero-day threats.

**Implementation**

• Deploy behavior-based anti-malware solutions (e.g., CrowdStrike, SentinelOne, Carbon Black)
• Configure behavioral detection rules and thresholds
• Enable machine learning and AI-based threat detection
• Monitor behavioral alerts and investigate anomalies
• Integrate with SIEM for correlation and analysis
• Regularly review and tune behavioral detection settings'
WHERE control_id = '10.7' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 11.5 Test Data Recovery
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Test data recovery procedures to ensure that critical data can be restored within acceptable timeframes. Perform recovery tests at least annually.

**Implementation**

• Schedule annual data recovery tests for critical systems
• Document recovery time objectives (RTO) and recovery point objectives (RPO)
• Test both full and incremental restore procedures
• Verify data integrity after restoration
• Document test results and any issues encountered
• Update recovery procedures based on test findings'
WHERE control_id = '11.5' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 12.7 Ensure Remote Devices Utilize a VPN and are Connecting to an Enterprise's AAA Infrastructure
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Ensure all remote devices use VPN connections and authenticate through the enterprise''s AAA (Authentication, Authorization, and Accounting) infrastructure to maintain security for remote access.

**Implementation**

• Deploy enterprise VPN solution with strong encryption
• Configure VPN to require multi-factor authentication
• Integrate VPN with enterprise AAA infrastructure (e.g., RADIUS, TACACS+)
• Enforce VPN usage through device policies
• Monitor VPN connections and usage patterns
• Configure automatic VPN connection for remote devices'
WHERE control_id = '12.7' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 13.4 Perform Traffic Filtering Between Network Segments
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Perform traffic filtering between network segments to limit communication to only necessary services and protocols, reducing the attack surface and containing potential breaches.

**Implementation**

• Implement network segmentation using VLANs or physical separation
• Deploy firewalls or ACLs between network segments
• Define and document allowed traffic between segments
• Apply principle of least privilege for inter-segment communication
• Monitor and log traffic between segments
• Regularly review and update filtering rules'
WHERE control_id = '13.4' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 13.5 Manage Access Control for Remote Assets
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Manage access control for remote assets to ensure that only authorized users and devices can access enterprise resources from remote locations.

**Implementation**

• Implement device certificates for remote asset authentication
• Deploy mobile device management (MDM) solution
• Configure conditional access policies based on device compliance
• Enable device health checks before granting access
• Monitor remote access logs and anomalies
• Enforce encryption for all remote connections'
WHERE control_id = '13.5' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 13.6 Collect Network Traffic Flow Logs
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Collect network traffic flow logs to enable detection of anomalous activity and support incident investigation. Store logs for at least 90 days.

**Implementation**

• Enable NetFlow, sFlow, or IPFIX on network devices
• Deploy flow collector and analysis tools
• Configure retention for at least 90 days
• Monitor for unusual traffic patterns and volumes
• Integrate flow data with SIEM platform
• Create baselines for normal network behavior'
WHERE control_id = '13.6' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 14.4 Train Workforce on Data Handling Best Practices
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Train workforce members on proper data handling practices including classification, labeling, retention, and secure disposal of sensitive information.

**Implementation**

• Develop data handling training curriculum
• Include data classification and labeling procedures
• Cover secure data storage and transmission methods
• Explain data retention and disposal requirements
• Conduct annual training for all employees
• Track training completion and comprehension'
WHERE control_id = '14.4' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 14.5 Train Workforce Members on Causes of Unintentional Data Exposure
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Train workforce members to recognize and avoid common causes of unintentional data exposure such as mis-delivery of emails, loss of portable devices, and improper disposal.

**Implementation**

• Create training on common data exposure scenarios
• Include email security and verification procedures
• Cover mobile device and removable media security
• Explain secure disposal methods for physical and digital data
• Use real-world examples and case studies
• Test understanding through simulated scenarios'
WHERE control_id = '14.5' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 14.6 Train Workforce Members on Recognizing and Reporting Security Incidents
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Train workforce members to recognize potential security incidents and report them through proper channels promptly to enable rapid response and containment.

**Implementation**

• Develop security incident recognition training
• Define clear indicators of security incidents
• Establish and communicate reporting procedures
• Create easy-to-use incident reporting mechanisms
• Provide examples of security incidents
• Conduct periodic incident reporting drills'
WHERE control_id = '14.6' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 14.7 Train Workforce on How to Identify and Report if Their Enterprise Assets are Missing Security Updates
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Train workforce members to identify when their devices are missing security updates and how to report this to ensure timely patching of vulnerabilities.

**Implementation**

• Create training on identifying update notifications
• Explain importance of security updates
• Show how to check update status on different platforms
• Provide clear reporting procedures for missing updates
• Include automated update verification tools where possible
• Track and follow up on reported update issues'
WHERE control_id = '14.7' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 14.8 Train Workforce on the Dangers of Connecting to and Transmitting Enterprise Data Over Insecure Networks
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Train workforce members about risks of using insecure networks and how to protect enterprise data when working remotely or traveling.

**Implementation**

• Develop training on public Wi-Fi and network risks
• Explain man-in-the-middle attacks and data interception
• Mandate VPN usage for all remote connections
• Teach how to identify secure vs. insecure networks
• Provide mobile hotspot devices for frequent travelers
• Include hands-on demonstrations of network risks'
WHERE control_id = '14.8' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 14.9 Conduct Role-Specific Security Awareness and Skills Training
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Conduct role-specific security training tailored to job functions, focusing on specific risks and responsibilities for different roles within the organization.

**Implementation**

• Identify security requirements for each role
• Develop customized training modules per role
• Include privileged user training for administrators
• Create developer security training for coding teams
• Provide executive training on governance and risk
• Track role-specific training completion'
WHERE control_id = '14.9' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- Continue with more controls...
-- 15.1 Establish and Maintain an Inventory of Service Providers
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Establish and maintain a comprehensive inventory of all service providers that process, store, or transmit enterprise data or have access to enterprise systems.

**Implementation**

• Create service provider inventory database
• Document provider name, services, data access levels
• Include contract details and expiration dates
• Identify critical and high-risk providers
• Review and update inventory quarterly
• Track security assessments and certifications'
WHERE control_id = '15.1' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 15.2 Establish and Maintain a Service Provider Management Policy
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Establish and maintain a policy governing the security requirements for service provider relationships, including evaluation, selection, and monitoring procedures.

**Implementation**

• Develop comprehensive service provider management policy
• Define security requirements for providers
• Establish due diligence procedures
• Include ongoing monitoring requirements
• Specify incident notification procedures
• Review and update policy annually'
WHERE control_id = '15.2' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 15.3 Classify Service Providers
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Classify service providers based on their access to enterprise data and systems to apply appropriate security controls and monitoring based on risk levels.

**Implementation**

• Define classification criteria (data sensitivity, access level, criticality)
• Assign risk ratings to each provider
• Apply security controls based on classification
• Prioritize assessments for high-risk providers
• Document classification methodology
• Review classifications annually'
WHERE control_id = '15.3' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 15.4 Ensure Service Provider Contracts Include Security Requirements
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Ensure all service provider contracts include specific security requirements, incident notification procedures, and right to audit clauses.

**Implementation**

• Develop standard security contract language
• Include data protection and privacy requirements
• Specify incident notification timelines
• Add right to audit provisions
• Require security assessment documentation
• Review existing contracts for compliance'
WHERE control_id = '15.4' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 15.5 Assess Service Providers
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Assess service providers'' security practices through questionnaires, certifications review, or on-site assessments based on their risk classification.

**Implementation**

• Create security assessment questionnaires
• Review security certifications (SOC2, ISO 27001)
• Conduct on-site assessments for critical providers
• Verify implementation of security controls
• Document assessment findings and remediation
• Reassess providers based on risk level'
WHERE control_id = '15.5' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 16.1 Establish and Maintain a Secure Application Development Process
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Establish and maintain a secure application development process that incorporates security throughout the software development lifecycle.

**Implementation**

• Implement secure SDLC methodology
• Include security requirements in design phase
• Conduct threat modeling for applications
• Perform security code reviews
• Execute security testing before deployment
• Document security controls and decisions'
WHERE control_id = '16.1' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- Add remaining controls...
-- This file continues with all other missing controls
-- 16.2 Establish and Maintain a Process to Accept and Address Software Vulnerabilities
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Establish a process for accepting vulnerability reports from external parties and addressing identified vulnerabilities in a timely manner based on risk.

**Implementation**

• Create vulnerability disclosure policy and process
• Establish secure communication channels for reports
• Define SLAs for vulnerability response and remediation
• Implement vulnerability tracking system
• Coordinate with development teams for fixes
• Communicate updates to reporters and users'
WHERE control_id = '16.2' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 16.3 Perform Root Cause Analysis on Security Vulnerabilities
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Perform root cause analysis on security vulnerabilities to identify systemic issues and prevent similar vulnerabilities in the future.

**Implementation**

• Establish root cause analysis procedures
• Investigate underlying causes of vulnerabilities
• Identify patterns and common issues
• Update development practices based on findings
• Share lessons learned across teams
• Track metrics on vulnerability types and causes'
WHERE control_id = '16.3' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 16.4 Establish and Manage an Inventory of Third-Party Software Components
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Maintain an inventory of all third-party software components used in enterprise applications to track versions and identify vulnerabilities.

**Implementation**

• Create software bill of materials (SBOM) for applications
• Use dependency scanning tools
• Track component versions and licenses
• Monitor for vulnerability announcements
• Automate component inventory updates
• Integrate with vulnerability management process'
WHERE control_id = '16.4' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 16.5 Use Up-to-Date and Trusted Third-Party Software Components
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Use only currently supported and trusted third-party software components, avoiding deprecated or vulnerable versions that could introduce security risks.

**Implementation**

• Define approved component sources and repositories
• Verify component integrity and signatures
• Keep components updated to supported versions
• Remove or replace deprecated components
• Monitor component security advisories
• Implement automated dependency updates where safe'
WHERE control_id = '16.5' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 16.6 Establish and Maintain a Severity Rating System and Process for Application Vulnerabilities
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Establish a severity rating system for application vulnerabilities to prioritize remediation efforts based on risk and potential impact.

**Implementation**

• Define severity levels (Critical, High, Medium, Low)
• Establish criteria for each severity level
• Set remediation timelines per severity
• Document severity rating process
• Train teams on severity assessment
• Track remediation performance metrics'
WHERE control_id = '16.6' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 16.7 Use Standard Hardening Configuration Templates for Application Infrastructure
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Use standardized hardening templates for application infrastructure components to ensure consistent security configurations across environments.

**Implementation**

• Develop hardening templates for common platforms
• Include CIS benchmarks and vendor guidelines
• Automate deployment using configuration management
• Validate configurations against templates
• Update templates based on new threats
• Document exceptions and compensating controls'
WHERE control_id = '16.7' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 16.8 Separate Production and Non-Production Systems
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Maintain separation between production and non-production systems to prevent development or testing activities from impacting production security or availability.

**Implementation**

• Physically or logically separate environments
• Implement different access controls per environment
• Use separate credentials and certificates
• Sanitize production data for non-production use
• Monitor for cross-environment connections
• Document environment boundaries and controls'
WHERE control_id = '16.8' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 16.9 Train Developers in Application Security Concepts and Secure Coding
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Train developers in secure coding practices and application security concepts to build security into applications from the start.

**Implementation**

• Develop secure coding training curriculum
• Cover OWASP Top 10 and common vulnerabilities
• Include language-specific security practices
• Provide hands-on secure coding exercises
• Require annual training for all developers
• Measure training effectiveness through testing'
WHERE control_id = '16.9' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 16.10 Apply Secure Design Principles in Application Architectures
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Apply secure design principles such as least privilege, defense in depth, and fail securely when designing application architectures.

**Implementation**

• Document secure design principles and patterns
• Conduct security architecture reviews
• Implement principle of least privilege
• Design for defense in depth
• Ensure applications fail securely
• Review and approve architectural decisions'
WHERE control_id = '16.10' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 16.11 Leverage Vetted Modules or Services for Application Security Components
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Use well-tested and vetted modules or services for security functions rather than developing custom implementations that may have vulnerabilities.

**Implementation**

• Identify approved security libraries and services
• Use established cryptographic libraries
• Leverage platform security features
• Avoid custom authentication implementations
• Verify security modules are actively maintained
• Document approved components and versions'
WHERE control_id = '16.11' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 17.1 Establish and Maintain an Incident Response Process
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Establish and maintain a documented incident response process that defines roles, responsibilities, and procedures for handling security incidents.

**Implementation**

• Document comprehensive incident response plan
• Define incident classification and severity levels
• Establish response team roles and responsibilities
• Create incident handling procedures
• Include communication and escalation paths
• Review and test plan annually'
WHERE control_id = '17.1' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 17.2 Establish and Maintain Contact Information for Reporting Security Incidents
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Maintain current contact information for internal and external parties involved in incident response, including law enforcement and regulatory bodies.

**Implementation**

• Create incident response contact database
• Include internal team members and alternates
• Add external contacts (vendors, law enforcement, regulators)
• Verify contact information quarterly
• Ensure 24/7 availability for critical contacts
• Distribute contact list to response team'
WHERE control_id = '17.2' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 17.3 Establish and Maintain an Enterprise Process for Reporting Incidents
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Establish clear procedures for workforce members to report suspected security incidents through defined channels quickly and easily.

**Implementation**

• Create multiple incident reporting channels
• Develop simple reporting forms/tools
• Ensure anonymous reporting options
• Communicate reporting procedures regularly
• Acknowledge all incident reports promptly
• Track reporting metrics and response times'
WHERE control_id = '17.3' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 17.4 Establish and Maintain an Incident Response Process (duplicate - skip)

-- 17.5 Assign Key Roles and Responsibilities
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Assign specific roles and responsibilities for incident response team members, ensuring coverage for all critical functions during incident handling.

**Implementation**

• Define incident response team structure
• Assign primary and backup personnel
• Document role-specific responsibilities
• Ensure appropriate authority levels
• Provide role-specific training
• Maintain on-call rotation schedules'
WHERE control_id = '17.5' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 17.6 Define Mechanisms for Communicating During Incident Response
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Define secure communication mechanisms for incident response activities to ensure confidential and reliable information sharing during incidents.

**Implementation**

• Establish secure communication channels
• Deploy out-of-band communication methods
• Create communication templates and scripts
• Define information classification during incidents
• Test communication channels regularly
• Document communication protocols and procedures'
WHERE control_id = '17.6' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 17.7 Conduct Routine Incident Response Exercises
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Conduct regular incident response exercises to test procedures, identify gaps, and improve team readiness for actual incidents.

**Implementation**

• Schedule annual tabletop exercises
• Conduct technical incident simulations
• Test different incident scenarios
• Include all team members in exercises
• Document lessons learned
• Update procedures based on findings'
WHERE control_id = '17.7' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 17.8 Conduct Post-Incident Reviews
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Conduct post-incident reviews to identify root causes, document lessons learned, and improve incident response procedures and security controls.

**Implementation**

• Schedule reviews within 2 weeks of incidents
• Analyze root causes and contributing factors
• Document timeline and actions taken
• Identify improvement opportunities
• Update procedures based on findings
• Share lessons learned across organization'
WHERE control_id = '17.8' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 18.1 Establish and Maintain a Penetration Testing Program
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Establish a penetration testing program to identify vulnerabilities in systems and applications through simulated attacks by qualified professionals.

**Implementation**

• Define penetration testing scope and frequency
• Select qualified internal or external testers
• Establish rules of engagement
• Define testing methodologies
• Document findings and remediation plans
• Track remediation progress'
WHERE control_id = '18.1' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 18.2 Perform Periodic External Penetration Tests
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Perform external penetration tests at least annually to identify vulnerabilities that could be exploited by external attackers.

**Implementation**

• Schedule annual external penetration tests
• Include all internet-facing systems
• Test from attacker perspective
• Validate security controls effectiveness
• Prioritize findings by risk
• Remediate critical findings promptly'
WHERE control_id = '18.2' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 18.3 Remedy Penetration Test Findings
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Remediate penetration test findings based on risk, prioritizing critical and high-risk vulnerabilities for immediate attention.

**Implementation**

• Analyze and prioritize test findings
• Develop remediation plans with timelines
• Assign remediation responsibilities
• Track remediation progress
• Validate fixes through retesting
• Document compensating controls if needed'
WHERE control_id = '18.3' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 3.4 Enforce Data Retention
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Enforce data retention policies to ensure data is retained only as long as necessary for business and legal requirements, reducing exposure risk.

**Implementation**

• Define data retention periods by type
• Implement automated retention controls
• Configure systems to enforce retention
• Monitor compliance with retention policies
• Document legal and business requirements
• Regularly review and update policies'
WHERE control_id = '3.4' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 3.5 Securely Dispose of Data
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Securely dispose of data on storage media when no longer needed, using appropriate methods based on data sensitivity and media type.

**Implementation**

• Define secure disposal procedures by media type
• Use certified data destruction services
• Implement cryptographic erasure where appropriate
• Physically destroy highly sensitive media
• Maintain certificates of destruction
• Verify disposal effectiveness'
WHERE control_id = '3.5' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 3.7 Establish and Maintain a Data Classification Scheme
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Establish a data classification scheme that categorizes data by sensitivity level to apply appropriate security controls and handling procedures.

**Implementation**

• Define classification levels (e.g., Public, Internal, Confidential, Restricted)
• Document classification criteria
• Assign data owners and classifiers
• Label data according to classification
• Apply controls based on classification
• Train staff on classification procedures'
WHERE control_id = '3.7' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 3.8 Document Data Flows
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Document data flows showing how sensitive data moves through the organization to identify security control points and potential exposure risks.

**Implementation**

• Create data flow diagrams for sensitive data
• Identify data sources and destinations
• Document transmission methods
• Map security controls at each point
• Review flows for unnecessary exposure
• Update documentation as flows change'
WHERE control_id = '3.8' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 3.9 Encrypt Data on Removable Media
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Encrypt all sensitive data stored on removable media to protect against data loss if media is lost or stolen.

**Implementation**

• Deploy removable media encryption solutions
• Enforce encryption through technical controls
• Use strong encryption algorithms (AES-256)
• Manage encryption keys securely
• Monitor removable media usage
• Block unencrypted removable media'
WHERE control_id = '3.9' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 3.10 Encrypt Sensitive Data in Transit
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Encrypt sensitive data in transit over networks to prevent interception and unauthorized access during transmission.

**Implementation**

• Implement TLS/SSL for all web traffic
• Use VPN for remote access
• Encrypt email containing sensitive data
• Configure secure file transfer protocols
• Disable unencrypted protocols
• Monitor for unencrypted transmissions'
WHERE control_id = '3.10' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 3.11 Encrypt Sensitive Data at Rest
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Encrypt sensitive data at rest on servers, workstations, and portable devices to protect against unauthorized access to storage media.

**Implementation**

• Deploy full disk encryption on endpoints
• Implement database encryption
• Encrypt file shares containing sensitive data
• Use application-level encryption where appropriate
• Manage encryption keys securely
• Monitor encryption status and compliance'
WHERE control_id = '3.11' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 3.12 Segment Data Processing and Storage Based on Sensitivity
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Segment data processing and storage based on sensitivity levels to apply appropriate security controls and limit access to sensitive data.

**Implementation**

• Create separate storage areas by classification
• Implement network segmentation for sensitive data
• Apply different access controls per segment
• Monitor access to sensitive segments
• Encrypt sensitive data segments
• Document segmentation architecture'
WHERE control_id = '3.12' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 4.1 Establish and Maintain a Secure Configuration Process
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Establish and maintain a secure configuration process for all enterprise assets to ensure consistent security settings and reduce vulnerabilities.

**Implementation**

• Develop secure configuration standards
• Use industry benchmarks (CIS, DISA STIGs)
• Create configuration templates
• Implement configuration management tools
• Monitor configuration compliance
• Update configurations based on threats'
WHERE control_id = '4.1' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');

-- 4.10 Enforce Automatic Device Lockout on Portable End-User Devices
UPDATE requirements_library
SET audit_ready_guidance = '**Purpose**

Configure automatic device lockout on portable devices after a period of inactivity to prevent unauthorized access to unattended devices.

**Implementation**

• Configure lockout after 15 minutes or less
• Require strong authentication to unlock
• Deploy through mobile device management
• Apply to all portable devices
• Monitor compliance with lockout policy
• Educate users on lockout importance'
WHERE control_id = '4.10' AND standard_id IN (SELECT id FROM standards_library WHERE name LIKE '%CIS Controls%IG2%');
EOF < /dev/null