const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockData.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Information gathered from https://cas8.docs.cisecurity.org/en/latest/
function getEnhancedCISGuidance(section, code, name, description, existingGuidance) {
  let enhancedGuidance = existingGuidance || '';
  
  // Extract existing purpose and implementation sections
  let purpose = '';
  let implementation = '';
  
  if (enhancedGuidance.includes('Purpose:')) {
    const purposeMatch = enhancedGuidance.match(/Purpose:(.*?)(?=\n\n)/s);
    if (purposeMatch && purposeMatch[1]) {
      purpose = purposeMatch[1].trim();
    }
    
    const implementationMatch = enhancedGuidance.match(/Implementation:\n([\s\S]*)/);
    if (implementationMatch && implementationMatch[1]) {
      implementation = implementationMatch[1].trim();
    }
  } else {
    purpose = description;
    implementation = enhancedGuidance;
  }
  
  // Enhanced guidance based on CIS documentation
  let additionalGuidance = [];
  
  // CIS Control 1: Inventory and Control of Enterprise Assets
  if (section === '1') {
    if (code === '1.1') { // Asset Inventory
      additionalGuidance = [
        'Implement automated asset discovery tools to maintain an up-to-date inventory',
        'Include all enterprise assets: end-user devices, network devices, IoT devices, and servers',
        'Record key information for each asset: network address, hardware address, machine name, owner, department',
        'Ensure both on-premises and cloud-based assets are included in the inventory',
        'Review and update the inventory at least bi-annually'
      ];
    } else if (code === '1.2') { // Address Unauthorized Assets
      additionalGuidance = [
        'Establish a formal process for detecting and addressing unauthorized assets',
        'Implement network access control (NAC) to detect and limit unauthorized devices',
        'Define response procedures: removal, denial of network access, or quarantine',
        'Execute the process on a weekly basis',
        'Document exceptions with appropriate risk acceptance'
      ];
    } else if (code === '1.3' || code === '1.4') { // Additional IG2/IG3 controls
      additionalGuidance = [
        'Utilize DHCP logging to update asset inventory',
        'Deploy port-level access control',
        'Implement certificate-based authentication for network access',
        'Use network access control solutions to validate security configuration compliance before connection'
      ];
    }
  }
  
  // CIS Control 2: Inventory and Control of Software Assets
  else if (section === '2') {
    if (code === '2.1') { // Software Inventory
      additionalGuidance = [
        'Create and maintain a comprehensive inventory of all authorized software',
        'Document title, publisher, installation date, business purpose, and license information',
        'Use automated software inventory tools where possible',
        'Include mobile applications, cloud-based software, and development tools',
        'Review and update the inventory bi-annually'
      ];
    } else if (code === '2.2') { // Ensure Authorized Software is Currently Supported
      additionalGuidance = [
        'Verify that all authorized software is currently supported by the vendor',
        'Document exceptions for unsupported software with mitigating controls',
        'Mark unsupported software without exceptions as unauthorized',
        'Review software support status at least monthly',
        'Implement automated tools to check for supported versions'
      ];
    } else if (code === '2.3') { // Address Unauthorized Software
      additionalGuidance = [
        'Implement application control or allowlisting technologies',
        'Establish processes to remove or disable unauthorized software',
        'Create documented exception procedures for necessary unauthorized software',
        'Conduct monthly reviews to identify and address unauthorized software',
        'Use automated tools to detect and block unauthorized software installation'
      ];
    }
  }
  
  // CIS Control 3: Data Protection
  else if (section === '3') {
    if (code === '3.1') { // Data Management Process
      additionalGuidance = [
        'Document a formal data management process covering the entire data lifecycle',
        'Define data sensitivity levels and corresponding handling requirements',
        'Specify data retention limits and disposal methods for each type of data',
        'Identify data owners responsible for classification and protection',
        'Review and update the process annually or when significant changes occur'
      ];
    } else if (code === '3.2') { // Data Inventory
      additionalGuidance = [
        'Create and maintain an inventory of all sensitive data',
        'Include data location, format, owner, and sensitivity classification',
        'Use automated data discovery tools where possible',
        'Prioritize the most sensitive data types for additional protection',
        'Review and update the inventory at least annually'
      ];
    } else if (code === '3.3') { // Data Access Control Lists
      additionalGuidance = [
        'Implement access controls based on the principle of least privilege',
        'Configure data access control lists for all locations where sensitive data is stored',
        'Apply controls to file systems, databases, cloud storage, and applications',
        'Review access permissions regularly to ensure continued business need',
        'Implement a formal process for requesting, reviewing, and revoking access'
      ];
    } else if (code === '3.4') { // Data Retention
      additionalGuidance = [
        'Document minimum and maximum retention periods for different data types',
        'Implement automated processes to enforce retention policies',
        'Ensure compliance with legal, regulatory, and business requirements',
        'Create procedures for archiving data that must be retained long-term',
        'Conduct regular audits to verify compliance with retention policies'
      ];
    } else if (code === '3.5') { // Securely Dispose of Data
      additionalGuidance = [
        'Implement secure data deletion processes based on sensitivity level',
        'Use appropriate methods: secure wiping, cryptographic erasure, or physical destruction',
        'Document procedures for each data type and storage medium',
        'Train personnel responsible for data disposal',
        'Maintain logs of secure disposal activities for sensitive data'
      ];
    } else if (code === '3.6') { // Encrypt Data on End-User Devices
      additionalGuidance = [
        'Deploy full-disk encryption on all devices storing sensitive data',
        'Use platform-appropriate solutions (BitLocker, FileVault, dm-crypt)',
        'Implement central management of encryption solutions',
        'Configure encryption to start automatically and require authentication',
        'Create secure processes for recovery keys management'
      ];
    }
  }
  
  // CIS Control 4: Secure Configuration of Enterprise Assets and Software
  else if (section === '4') {
    if (code === '4.1') { // Secure Configuration Process
      additionalGuidance = [
        'Establish documented secure configuration standards for all asset types',
        'Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)',
        'Include hardening procedures, services removal, and port restrictions',
        'Create a process to validate and update configurations',
        'Review and update documentation annually'
      ];
    } else if (code === '4.2') { // Secure Configuration Process for Network Infrastructure
      additionalGuidance = [
        'Document secure configurations for network devices (firewalls, routers, switches)',
        'Include protocols, ports, services, authentication, and logging requirements',
        'Create standard templates for consistent deployment',
        'Implement a change management process for network devices',
        'Update documentation at least annually'
      ];
    } else if (code === '4.3') { // Configure Automatic Session Locking
      additionalGuidance = [
        'Implement automatic screen locking after 15 minutes of inactivity (2 minutes for mobile devices)',
        'Configure policy through centralized management systems',
        'Ensure lock requires authentication to unlock',
        'Apply to all enterprise assets including servers, workstations, and mobile devices',
        'Regularly audit compliance with session locking policy'
      ];
    } else if (code === '4.4') { // Implement and Manage a Firewall on Servers
      additionalGuidance = [
        'Configure host-based firewalls on all servers',
        'Implement default-deny rules that block all traffic except what is explicitly allowed',
        'Document required services and ports for each server type',
        'Use templates to ensure consistent configuration',
        'Regularly review and validate firewall rules'
      ];
    } else if (code === '4.5') { // Implement and Manage a Firewall on End-User Devices
      additionalGuidance = [
        'Deploy host-based firewalls on all end-user devices',
        'Configure with default-deny rules only allowing necessary connections',
        'Use central management tools to enforce and monitor firewall settings',
        'Create standard configurations for different user groups or roles',
        'Regularly audit firewall configurations'
      ];
    }
  }
  
  // CIS Control 5: Account Management
  else if (section === '5') {
    if (code === '5.1') { // Establish and Maintain an Inventory of Accounts
      additionalGuidance = [
        'Create and maintain a comprehensive inventory of all accounts',
        'Include user accounts, administrator accounts, service accounts, and application accounts',
        'Document key information: person\'s name, username, start/stop dates, department',
        'Validate all active accounts are authorized at least quarterly',
        'Establish a formal process for account lifecycle management'
      ];
    } else if (code === '5.2') { // Use Unique Passwords
      additionalGuidance = [
        'Implement minimum password complexity requirements (at least 8 characters for MFA accounts, 14 characters for non-MFA)',
        'Configure systems to enforce password requirements',
        'Prevent password reuse across multiple accounts or services',
        'Use password managers to generate and store strong, unique passwords',
        'Train users on creating strong passphrases'
      ];
    } else if (code === '5.3') { // Disable Dormant Accounts
      additionalGuidance = [
        'Implement automated account monitoring to identify inactive accounts',
        'Disable accounts after 45 days of inactivity',
        'Create procedures for requesting reactivation of legitimately dormant accounts',
        'Document accounts that should remain active despite inactivity',
        'Regularly audit disabled accounts to ensure they remain disabled'
      ];
    } else if (code === '5.4') { // Restrict Administrator Privileges
      additionalGuidance = [
        'Separate administrative and regular user accounts for personnel with administrative duties',
        'Require use of regular, non-privileged accounts for daily activities',
        'Configure systems to allow administrative actions only from dedicated admin accounts',
        'Monitor the use of administrative accounts',
        'Document procedures for administrative access'
      ];
    }
  }
  
  // CIS Control 6: Access Control Management
  else if (section === '6') {
    if (code === '6.1') { // Establish an Access Granting Process
      additionalGuidance = [
        'Document a formal process for granting access to enterprise assets',
        'Include approval workflows based on the sensitivity of resources',
        'Implement the principle of least privilege when granting access',
        'Create standardized access levels for common job functions',
        'Automate the access provisioning process where possible'
      ];
    } else if (code === '6.2') { // Establish an Access Revoking Process
      additionalGuidance = [
        'Implement a formal process for revoking access immediately upon termination or role change',
        'Disable accounts rather than deleting them to preserve audit trails',
        'Create procedures for emergency access revocation',
        'Automate the revocation process where possible',
        'Conduct regular access reconciliation to verify access removal'
      ];
    } else if (code === '6.3' || code === '6.4' || code === '6.5') { // MFA requirements
      additionalGuidance = [
        'Deploy multi-factor authentication for all externally-exposed applications',
        'Require MFA for remote network access',
        'Implement MFA for all administrative access',
        'Use a combination of something you know, something you have, and/or something you are',
        'Ensure MFA cannot be bypassed once implemented'
      ];
    }
  }
  
  // CIS Control 7: Continuous Vulnerability Management
  else if (section === '7') {
    if (code === '7.1') { // Vulnerability Management Process
      additionalGuidance = [
        'Establish a documented vulnerability management process',
        'Include scanning, prioritization, remediation, and verification steps',
        'Define roles and responsibilities for vulnerability management',
        'Determine scanning frequency based on system criticality',
        'Review and update the process annually or when significant changes occur'
      ];
    } else if (code === '7.2') { // Remediation Process
      additionalGuidance = [
        'Document a risk-based remediation strategy for addressing vulnerabilities',
        'Define timelines for remediation based on vulnerability severity',
        'Create processes for addressing false positives and exceptions',
        'Establish procedures for verifying remediation effectiveness',
        'Review the remediation process monthly'
      ];
    } else if (code === '7.3' || code === '7.4') { // Patch Management
      additionalGuidance = [
        'Implement automated patch management for operating systems and applications',
        'Establish processes for testing patches before deployment',
        'Define patch deployment schedules based on criticality',
        'Create procedures for emergency patching',
        'Monitor patch compliance across the enterprise'
      ];
    }
  }
  
  // CIS Control 8: Audit Log Management
  else if (section === '8') {
    if (code.startsWith('8.')) {
      additionalGuidance = [
        'Establish a process for collecting and reviewing audit logs',
        'Configure logging on all enterprise assets and software',
        'Include key events: authentication, authorization, and system changes',
        'Implement secure centralized log collection',
        'Ensure logs contain sufficient detail for investigation',
        'Protect logs from unauthorized access, modification, and deletion',
        'Establish log retention policies aligned with organizational requirements'
      ];
    }
  }
  
  // CIS Control 9: Email and Web Browser Protections
  else if (section === '9') {
    if (code.startsWith('9.')) {
      additionalGuidance = [
        'Deploy DNS filtering services to block access to known malicious domains',
        'Configure email security controls to filter spam and malicious messages',
        'Implement and maintain up-to-date web browsers',
        'Use browser security extensions and configurations',
        'Disable unnecessary browser plugins and features',
        'Configure email systems to authenticate outgoing mail'
      ];
    }
  }
  
  // CIS Control 10: Malware Defenses
  else if (section === '10') {
    if (code.startsWith('10.')) {
      additionalGuidance = [
        'Deploy and maintain anti-malware software on all enterprise assets',
        'Configure real-time scanning for all files and software',
        'Implement centralized management and monitoring of anti-malware solutions',
        'Regularly update malware definitions and engines',
        'Configure systems to automatically scan removable media',
        'Enable application allowlisting to prevent unauthorized code execution'
      ];
    }
  }
  
  // CIS Control 14: Security Awareness and Skills Training
  else if (section === '14') {
    if (code.startsWith('14.')) {
      additionalGuidance = [
        'Establish a comprehensive security awareness program',
        'Conduct training at onboarding and at least annually thereafter',
        'Include topics like phishing, passwords, data handling, and social engineering',
        'Tailor training to specific roles and responsibilities',
        'Use simulated phishing exercises to reinforce awareness',
        'Measure the effectiveness of training through assessments and metrics'
      ];
    }
  }
  
  // CIS Control 17: Incident Response Management
  else if (section === '17') {
    if (code.startsWith('17.')) {
      additionalGuidance = [
        'Establish a documented incident response process',
        'Define roles and responsibilities for incident handling',
        'Create procedures for identification, containment, eradication, and recovery',
        'Conduct regular incident response exercises and tabletops',
        'Document lessons learned from incidents and exercises',
        'Update incident response plans based on emerging threats'
      ];
    }
  }
  
  // If we have additional guidance but no existing implementation
  if (additionalGuidance.length > 0 && !implementation) {
    implementation = additionalGuidance.map(item => `- ${item}`).join('\n');
  } 
  // If we have both, add the new guidance as additional bullet points
  else if (additionalGuidance.length > 0) {
    // Check if implementation already has these points to avoid duplication
    for (const item of additionalGuidance) {
      // Only add if not already present (case insensitive check)
      if (!implementation.toLowerCase().includes(item.toLowerCase())) {
        implementation += `\n- ${item}`;
      }
    }
  }
  
  // Construct the enhanced guidance
  return `Purpose: ${purpose}\n\nImplementation:\n${implementation}`;
}

// Process all three CIS Implementation Group levels (IG1, IG2, IG3)
function processCISControls(igLevel) {
  // Modified regex to find each CIS requirement object for the specified implementation group
  const requirementRegex = new RegExp(`({\s*id:\s*'cis-${igLevel}-[^']+',[\s\S]*?)(\n\s*},)`, 'g');
  
  let newFileContent = fileContent;
  
  // Use matchAll to find all matches first
  const matches = [...fileContent.matchAll(requirementRegex)];
  
  for (const match of matches) {
    const objStart = match[1];
    const objEnd = match[2];
    
    // Extract section, code, name, description, and existing guidance
    const sectionMatch = objStart.match(/section:\s*'([^']+)'/);
    const codeMatch = objStart.match(/code:\s*'([^']+)'/);
    const nameMatch = objStart.match(/name:\s*'([^']+)'/);
    const descMatch = objStart.match(/description:\s*'([^']+)'/);
    const guidanceMatch = objStart.match(/auditReadyGuidance:\s*`([^`]*)`/);
    
    const section = sectionMatch ? sectionMatch[1] : '';
    const code = codeMatch ? codeMatch[1] : '';
    const name = nameMatch ? nameMatch[1] : '';
    const description = descMatch ? descMatch[1] : '';
    const existingGuidance = guidanceMatch ? guidanceMatch[1] : '';
    
    // Generate enhanced guidance
    const enhancedGuidance = getEnhancedCISGuidance(section, code, name, description, existingGuidance);
    
    // Check if auditReadyGuidance already exists and needs to be replaced or added
    let newObj;
    if (objStart.includes('auditReadyGuidance:')) {
      // Replace existing auditReadyGuidance
      newObj = objStart.replace(/auditReadyGuidance:\s*`[^`]*`/, `auditReadyGuidance: \`${enhancedGuidance}\``);
    } else {
      // Add auditReadyGuidance field before the end of the object
      if (objStart.includes('tags:')) {
        // Add before tags
        newObj = objStart.replace(/(tags:[\s\S]*?)$/, `auditReadyGuidance: \`${enhancedGuidance}\`,\n    $1`);
      } else if (objStart.includes('lastAssessmentDate:')) {
        // Add after lastAssessmentDate
        newObj = objStart.replace(/(lastAssessmentDate:.*?(?:,|null)),?(\s*)/, `$1,\n    auditReadyGuidance: \`${enhancedGuidance}\`,$2`);
      } else if (objStart.includes('responsibleParty:')) {
        // Add after responsibleParty
        newObj = objStart.replace(/(responsibleParty:.*?(?:,|'')),?(\s*)/, `$1,\n    auditReadyGuidance: \`${enhancedGuidance}\`,$2`);
      } else {
        // Add at the end before the closing brace
        newObj = objStart + `\n    auditReadyGuidance: \`${enhancedGuidance}\`,`;
      }
    }
    
    // Replace the entire object in the file content
    newFileContent = newFileContent.replace(objStart + objEnd, newObj + objEnd);
  }
  
  return newFileContent;
}

// Process each implementation group
fileContent = processCISControls('ig1');
fileContent = processCISControls('ig2');
fileContent = processCISControls('ig3');

fs.writeFileSync(filePath, fileContent, 'utf8');
console.log('Enhanced CIS controls guidance with information from CIS documentation.'); 