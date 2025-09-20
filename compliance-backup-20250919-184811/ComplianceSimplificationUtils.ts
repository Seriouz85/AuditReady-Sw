import { supabase } from '@/lib/supabase';
import { complianceCacheService } from '@/services/compliance/ComplianceCacheService';
import { CleanUnifiedRequirementsGenerator } from '@/services/compliance/CleanUnifiedRequirementsGenerator';
import { FrameworkSelection } from '@/types/ComplianceSimplificationTypes';

// Helper function to get framework badges for a mapping
export const getFrameworkBadges = (mapping: any, selectedFrameworks: FrameworkSelection) => {
  const badges: { name: string; color: string; variant: 'default' | 'secondary' | 'outline' }[] = [];
  
  if (selectedFrameworks.iso27001 && mapping.frameworks?.iso27001?.length > 0) {
    badges.push({ name: 'ISO 27001', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', variant: 'default' });
  }
  if (selectedFrameworks.iso27002 && mapping.frameworks?.iso27002?.length > 0) {
    badges.push({ name: 'ISO 27002', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', variant: 'default' });
  }
  if (selectedFrameworks.cisControls && mapping.frameworks?.cisControls?.length > 0) {
    badges.push({ name: `CIS ${selectedFrameworks.cisControls.toUpperCase()}`, color: 'bg-green-500/20 text-green-300 border-green-500/30', variant: 'default' });
  }
  if (selectedFrameworks.gdpr && mapping.frameworks?.gdpr?.length > 0) {
    badges.push({ name: 'GDPR', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', variant: 'default' });
  }
  if (selectedFrameworks.nis2 && mapping.frameworks?.nis2?.length > 0) {
    badges.push({ name: 'NIS2', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', variant: 'default' });
  }
  if (selectedFrameworks.dora && mapping.frameworks?.dora?.length > 0) {
    badges.push({ name: 'DORA', color: 'bg-red-500/20 text-red-300 border-red-500/30', variant: 'default' });
  }
  
  return badges;
};

// Function to generate dynamic content for a category
export const generateDynamicContentForCategory = async (
  categoryName: string,
  selectedFrameworks: FrameworkSelection,
  filteredUnifiedMappings: any[]
): Promise<any[]> => {
  const startTime = Date.now();
  try {
    console.log('🚀 [CLEAN-GEN] Generating unified requirements for:', categoryName);
    console.log('📋 [CLEAN-GEN] Selected frameworks:', Object.entries(selectedFrameworks).filter(([_, selected]) => selected));
    
    // Clear old cache for fresh generation
    complianceCacheService.clear();
    
    // Find the category mapping
    const categoryMapping = filteredUnifiedMappings.find(m => 
      m.category === categoryName || 
      m.category?.replace(/^\d+\.\s*/, '') === categoryName ||
      (m.auditReadyUnified?.title && m.auditReadyUnified.title.includes(categoryName.replace(/^\d+\.\s*/, '')))
    );
    
    if (!categoryMapping) {
      console.log(`⚠️ [CLEAN-GEN] No mapping found for category: ${categoryName}`);
      return [`No requirements mapping found for ${categoryName}. Please ensure frameworks are selected and mapped properly.`];
    }
    
    // Use the clean unified generator
    const cleanGenerator = new CleanUnifiedRequirementsGenerator();
    const unifiedRequirements = await cleanGenerator.generateForCategory(
      categoryName,
      selectedFrameworks,
      categoryMapping
    );
    
    console.log(`✅ [CLEAN-GEN] Generated ${unifiedRequirements.length} unified requirements for ${categoryName}`);
    console.log(`⚡ [PERFORMANCE] Content generation completed in ${Date.now() - startTime}ms`);
    
    return unifiedRequirements;

  } catch (error) {
    console.error(`❌ [ERROR] Failed to generate content for ${categoryName}:`, error);
    return [`Error generating content for ${categoryName}: ${error instanceof Error ? error.message : 'Unknown error'}`];
  }
};

// Fallback guidance content
export const getGuidanceContentFallback = (cleanCategory: string) => {
  const fallbackGuidances: Record<string, string> = {
    'Asset Management': `**Asset Management Implementation Guidance**

**1. ASSET INVENTORY AND CLASSIFICATION**
✅ **Maintain a comprehensive inventory of all information assets** including hardware, software, data, personnel, documentation, and facilities
✅ **Classify assets based on their criticality and sensitivity** using a standardized classification scheme (e.g., Public, Internal, Confidential, Restricted)
✅ **Document asset ownership and custodianship** clearly defining who is responsible for each asset's security throughout its lifecycle

**2. ASSET LIFECYCLE MANAGEMENT**
✅ **Implement proper asset handling procedures** from acquisition through disposal, ensuring security controls are maintained at each stage
✅ **Regular asset reviews and updates** to ensure the inventory remains accurate and classification reflects current business needs
✅ **Secure disposal procedures** for assets containing sensitive information, including data sanitization and certificate of destruction

💡 **PRO TIP**: Use automated discovery tools to maintain accurate asset inventories in dynamic environments, and integrate asset management with your configuration management database (CMDB).

**Framework References for Selected Standards:**
ISO 27001: A.8.1.1 (Inventory of assets), A.8.2.1 (Classification of information)
ISO 27002: 8.1.1, 8.1.2, 8.2.1, 8.2.2
CIS Controls v8: 1.1 (Establish and Maintain Detailed Enterprise Asset Inventory), 13.1 (Maintain an Inventory of Sensitive Information)`,

    'Access Control': `**Access Control Implementation Guidance**

**1. IDENTITY AND ACCESS MANAGEMENT (IAM)**
✅ **Implement centralized identity management** with single sign-on (SSO) capabilities and multi-factor authentication (MFA)
✅ **Follow principle of least privilege** ensuring users have only the minimum access necessary for their job functions
✅ **Regular access reviews** conducted quarterly for privileged accounts and annually for standard user accounts

**2. PRIVILEGED ACCESS MANAGEMENT**
✅ **Separate privileged accounts** from regular user accounts with additional security controls and monitoring
✅ **Implement just-in-time (JIT) access** for administrative functions with time-limited sessions
✅ **Session recording and monitoring** for all privileged access activities

💡 **PRO TIP**: Implement risk-based authentication that adjusts security requirements based on user behavior, location, and device trust levels.

**Framework References for Selected Standards:**
ISO 27001: A.9.1.1 (Access control policy), A.9.2.1 (User registration), A.9.4.1 (Information access restriction)
ISO 27002: 9.1.1, 9.2.1, 9.2.2, 9.4.1
CIS Controls v8: 6.1 (Establish an Access Granting Process), 6.2 (Establish an Access Revoking Process)`,

    'Cryptography': `**Cryptography Implementation Guidance**

**1. ENCRYPTION STANDARDS AND POLICIES**
✅ **Use industry-standard encryption algorithms** (AES-256 for symmetric, RSA-4096 or ECC for asymmetric encryption)
✅ **Implement encryption for data at rest and in transit** with proper key management procedures
✅ **Regular cryptographic reviews** to ensure algorithms remain secure against current threat landscape

**2. KEY MANAGEMENT**
✅ **Centralized key management system** with proper key generation, distribution, storage, and destruction procedures
✅ **Key rotation policies** with automated rotation for high-risk environments
✅ **Hardware security modules (HSMs)** for protecting high-value cryptographic keys

💡 **PRO TIP**: Plan for crypto-agility by designing systems that can easily update cryptographic algorithms as new standards emerge and quantum computing threats develop.

**Framework References for Selected Standards:**
ISO 27001: A.10.1.1 (Policy on the use of cryptographic controls), A.10.1.2 (Key management)
ISO 27002: 10.1.1, 10.1.2
CIS Controls v8: 3.11 (Encrypt Sensitive Data at Rest), 3.10 (Encrypt Sensitive Data in Transit)`,

    'Physical & Environmental Security': `**Physical & Environmental Security Implementation Guidance**

**1. SECURE AREAS AND FACILITIES**
✅ **Implement layered physical security** with multiple security perimeters and access controls
✅ **Environmental monitoring and controls** for temperature, humidity, fire detection, and suppression systems
✅ **Visitor management procedures** with escort requirements and access logging

**2. EQUIPMENT PROTECTION**
✅ **Secure equipment placement** away from environmental threats and unauthorized access
✅ **Power protection systems** including UPS and backup generators for critical systems
✅ **Secure disposal procedures** for equipment containing sensitive data

💡 **PRO TIP**: Integrate physical security systems with IT security monitoring to provide comprehensive incident detection and response capabilities.

**Framework References for Selected Standards:**
ISO 27001: A.11.1.1 (Physical security perimeter), A.11.2.1 (Physical entry controls)
ISO 27002: 11.1.1, 11.1.2, 11.2.1
CIS Controls v8: 12.8 (Establish and Maintain Dedicated Computing Resources for All Administrative Work)`,

    'Operations Security': `**Operations Security Implementation Guidance**

**1. OPERATIONAL PROCEDURES**
✅ **Document all operational procedures** with step-by-step instructions and security considerations
✅ **Implement change management processes** with security impact assessments and rollback procedures
✅ **Regular security monitoring and logging** with automated alerting for security events

**2. SYSTEM MANAGEMENT**
✅ **Patch management procedures** with timely application of security updates
✅ **Capacity management** to ensure systems can handle current and projected loads
✅ **Backup and recovery procedures** tested regularly with documented recovery time objectives

💡 **PRO TIP**: Implement automation for routine operational tasks to reduce human error and ensure consistent application of security controls.

**Framework References for Selected Standards:**
ISO 27001: A.12.1.1 (Documented operating procedures), A.12.6.1 (Management of technical vulnerabilities)
ISO 27002: 12.1.1, 12.1.2, 12.6.1
CIS Controls v8: 7.1 (Establish and Maintain a Vulnerability Management Process), 11.1 (Establish and Maintain a Data Recovery Process)`,

    'Communications Security': `**Communications Security Implementation Guidance**

**1. NETWORK SECURITY MANAGEMENT**
✅ **Implement network segmentation** with firewalls and network access controls
✅ **Secure network protocols** (HTTPS, SFTP, VPN) for all data transmission
✅ **Network monitoring and intrusion detection** with 24/7 security operations center (SOC) coverage

**2. INFORMATION TRANSFER**
✅ **Secure file transfer procedures** with encryption and integrity checking
✅ **Email security controls** including anti-malware, anti-spam, and data loss prevention
✅ **Mobile device management** for secure access to corporate resources

💡 **PRO TIP**: Implement zero-trust network architecture principles where no network traffic is trusted by default, regardless of source location.

**Framework References for Selected Standards:**
ISO 27001: A.13.1.1 (Network controls), A.13.2.1 (Information transfer policies)
ISO 27002: 13.1.1, 13.1.2, 13.2.1
CIS Controls v8: 12.1 (Ensure Network Infrastructure is Up-to-Date), 13.3 (Monitor and Block Unauthorized Network Ports)`,

    'System Acquisition Development & Maintenance': `**System Acquisition, Development & Maintenance Implementation Guidance**

**1. SECURE DEVELOPMENT LIFECYCLE**
✅ **Implement security by design** principles throughout the development lifecycle
✅ **Regular security testing** including static analysis, dynamic testing, and penetration testing
✅ **Secure coding standards** with developer training and code review procedures

**2. SYSTEM SECURITY REQUIREMENTS**
✅ **Define security requirements** early in the development process
✅ **Third-party security assessments** for vendor-developed systems and components
✅ **Vulnerability management** for applications with regular security updates

💡 **PRO TIP**: Integrate security tools into your DevOps pipeline to automate security testing and ensure consistent application of security controls.

**Framework References for Selected Standards:**
ISO 27001: A.14.1.1 (Information security requirements analysis), A.14.2.1 (Secure development policy)
ISO 27002: 14.1.1, 14.1.2, 14.2.1
CIS Controls v8: 16.1 (Establish and Maintain a Secure Application Development Process), 16.11 (Leverage Vetted Modules or Services for Application Security Components)`,

    'Supplier Relationships': `**Supplier Relationships Implementation Guidance**

**1. SUPPLIER SECURITY MANAGEMENT**
✅ **Due diligence procedures** for evaluating supplier security capabilities
✅ **Contractual security requirements** including specific security controls and audit rights
✅ **Regular supplier assessments** to ensure ongoing compliance with security requirements

**2. SUPPLY CHAIN SECURITY**
✅ **Risk assessment of supplier dependencies** including single points of failure
✅ **Incident response coordination** with suppliers for security incidents
✅ **Secure development requirements** for custom software and services

💡 **PRO TIP**: Implement a supplier risk rating system that considers both the criticality of services provided and the security maturity of the supplier.

**Framework References for Selected Standards:**
ISO 27001: A.15.1.1 (Information security policy for supplier relationships), A.15.2.1 (Monitoring and review of supplier services)
ISO 27002: 15.1.1, 15.1.2, 15.2.1
CIS Controls v8: 15.1 (Establish and Maintain an Inventory of Authorized Software), 15.2 (Ensure Authorized Software is Currently Supported)`,

    'Information Security Incident Management': `**Information Security Incident Management Implementation Guidance**

**1. INCIDENT RESPONSE PLANNING**
✅ **Formal incident response plan** with defined roles, responsibilities, and procedures
✅ **24/7 incident response capability** with trained response team members
✅ **Regular incident response testing** through tabletop exercises and simulations

**2. INCIDENT HANDLING PROCEDURES**
✅ **Incident classification and prioritization** based on business impact and urgency
✅ **Evidence collection and preservation** for forensic analysis and legal proceedings
✅ **Communication procedures** for internal stakeholders and external parties

💡 **PRO TIP**: Integrate threat intelligence feeds into your incident response procedures to improve detection and attribution of security incidents.

**Framework References for Selected Standards:**
ISO 27001: A.16.1.1 (Responsibilities and procedures), A.16.1.2 (Reporting information security events)
ISO 27002: 16.1.1, 16.1.2, 16.1.3
CIS Controls v8: 17.1 (Designate Personnel to Manage Incident Handling), 17.2 (Establish and Maintain Contact Information for Reporting Security Incidents)`,

    'Information Security Aspects of Business Continuity Management': `**Business Continuity Management Implementation Guidance**

**1. BUSINESS CONTINUITY PLANNING**
✅ **Business impact analysis (BIA)** to identify critical business processes and dependencies
✅ **Recovery time and point objectives** defined for all critical systems and data
✅ **Alternative processing facilities** with tested failover procedures

**2. CONTINUITY TESTING AND MAINTENANCE**
✅ **Regular testing of continuity plans** through simulations and actual failover tests
✅ **Plan maintenance procedures** to ensure plans remain current with business changes
✅ **Staff training and awareness** on business continuity procedures

💡 **PRO TIP**: Integrate cybersecurity incident response with business continuity planning to ensure coordinated response to cyber incidents that impact business operations.

**Framework References for Selected Standards:**
ISO 27001: A.17.1.1 (Planning information security continuity), A.17.2.1 (Information security continuity)
ISO 27002: 17.1.1, 17.1.2, 17.2.1
CIS Controls v8: 11.1 (Establish and Maintain a Data Recovery Process), 11.2 (Perform Automated Backups)`,

    'Compliance': `**Compliance Implementation Guidance**

**1. REGULATORY COMPLIANCE MANAGEMENT**
✅ **Compliance monitoring program** to track adherence to applicable laws and regulations
✅ **Regular compliance assessments** including internal audits and external certifications
✅ **Legal and regulatory change management** to address new requirements

**2. AUDIT AND REVIEW PROCEDURES**
✅ **Independent security reviews** conducted by qualified internal or external assessors
✅ **Management review procedures** for ongoing evaluation of security program effectiveness
✅ **Corrective action procedures** for addressing identified compliance gaps

💡 **PRO TIP**: Implement a governance, risk, and compliance (GRC) platform to automate compliance monitoring and reporting across multiple regulatory frameworks.

**Framework References for Selected Standards:**
ISO 27001: A.18.1.1 (Identification of applicable legislation), A.18.2.1 (Independent review of information security)
ISO 27002: 18.1.1, 18.1.2, 18.2.1
CIS Controls v8: 17.3 (Establish and Maintain an Enterprise Process for Reporting Incidents), 17.9 (Establish and Maintain Security Awareness and Training)`,

    'Governance & Leadership': `**Governance & Leadership Implementation Guidance**

**1. LEADERSHIP COMMITMENT AND ACCOUNTABILITY**
✅ **Executive leadership commitment** to information security with documented policies and regular communication
✅ **Information security governance structure** with clear roles, responsibilities, and reporting lines
✅ **Regular management reviews** of security program effectiveness and strategic alignment

**2. ORGANIZATIONAL SECURITY STRUCTURE**
✅ **Chief Information Security Officer (CISO)** or equivalent role with appropriate authority and resources
✅ **Security committees and working groups** for governance oversight and operational coordination
✅ **Security awareness and training programs** for all personnel with role-specific requirements

💡 **PRO TIP**: Establish security metrics and KPIs that align with business objectives to demonstrate the value of security investments to executive leadership.

**Framework References for Selected Standards:**
ISO 27001: Clause 5.1 (Leadership and commitment), A.6.1.1 (Information security roles and responsibilities)
ISO 27002: 6.1.1, 6.1.2, 6.1.3
CIS Controls v8: 17.1 (Designate Personnel to Manage Incident Handling), 17.9 (Establish and Maintain Security Awareness and Training)`
  };

  return fallbackGuidances[cleanCategory] || `**${cleanCategory} Implementation Guidance**

This section provides guidance for implementing ${cleanCategory} controls.

✅ **Review applicable standards** for specific requirements
✅ **Develop implementation plan** with clear timelines and responsibilities  
✅ **Implement monitoring and measurement** procedures
✅ **Regular reviews and improvements** based on effectiveness assessments

💡 **PRO TIP**: Align implementation efforts with business objectives and risk appetite to ensure sustainable and effective security controls.`;
};