const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockData.ts');
const fileContent = fs.readFileSync(filePath, 'utf8');

// Function to generate CIS guidance
function generateCISGuidance(section, code, description) {
  // Create a basic guidance structure
  const purpose = description;
  let implementation = [];
  
  // CIS Control 1: Inventory and Control of Enterprise Assets
  if (section === '1') {
    implementation = [
      'Implement automated asset discovery tools to maintain an up-to-date inventory',
      'Include all enterprise assets: end-user devices, network devices, IoT devices, and servers',
      'Record key information for each asset: network address, hardware address, machine name, owner, department',
      'Ensure both on-premises and cloud-based assets are included in the inventory',
      'Review and update the inventory at least bi-annually',
      'For unauthorized assets, establish a formal process for detection and remediation'
    ];
  }
  // CIS Control 2: Inventory and Control of Software Assets
  else if (section === '2') {
    implementation = [
      'Create and maintain a comprehensive inventory of all authorized software',
      'Document title, publisher, installation date, business purpose, and license information',
      'Use automated software inventory tools where possible',
      'Include mobile applications, cloud-based software, and development tools',
      'Review and update the inventory bi-annually',
      'Verify that all authorized software is currently supported by the vendor'
    ];
  }
  // CIS Control 3: Data Protection
  else if (section === '3') {
    implementation = [
      'Document a formal data management process covering the entire data lifecycle',
      'Define data sensitivity levels and corresponding handling requirements',
      'Create and maintain an inventory of all sensitive data',
      'Configure data access control lists based on the principle of least privilege',
      'Implement data retention policies with minimum and maximum timelines',
      'Deploy full-disk encryption on all devices storing sensitive data'
    ];
  }
  // CIS Control 4: Secure Configuration
  else if (section === '4') {
    implementation = [
      'Establish documented secure configuration standards for all asset types',
      'Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)',
      'Configure automatic session locking on all enterprise assets',
      'Implement host-based firewalls on servers and end-user devices',
      'Use secure protocols for management access (SSH, HTTPS)',
      'Manage default accounts by disabling or reconfiguring them'
    ];
  }
  // CIS Control 5: Account Management
  else if (section === '5') {
    implementation = [
      'Create and maintain a comprehensive inventory of all accounts',
      'Implement strong password policies (minimum 14 characters for non-MFA accounts)',
      'Disable accounts after 45 days of inactivity',
      'Separate administrative and regular user accounts',
      'Review and audit account access quarterly',
      'Implement account lockout after failed authentication attempts'
    ];
  }
  // CIS Control 6: Access Control Management
  else if (section === '6') {
    implementation = [
      'Document formal processes for granting and revoking access',
      'Implement the principle of least privilege for access rights',
      'Deploy multi-factor authentication for externally-exposed applications',
      'Require MFA for remote network access and administrative accounts',
      'Implement automated provisioning and deprovisioning',
      'Conduct regular access reviews to validate continued business need'
    ];
  }
  // CIS Control 7: Continuous Vulnerability Management
  else if (section === '7') {
    implementation = [
      'Establish a documented vulnerability management process',
      'Implement automated vulnerability scanning tools',
      'Define risk-based remediation timelines based on severity',
      'Deploy automated patch management for operating systems and applications',
      'Verify remediation effectiveness after implementing fixes',
      'Conduct regular penetration testing to validate security controls'
    ];
  }
  // CIS Control 8: Audit Log Management
  else if (section === '8') {
    implementation = [
      'Configure comprehensive logging across all enterprise assets',
      'Include authentication, authorization, and system configuration changes in logs',
      'Implement secure centralized log collection',
      'Protect log data from unauthorized access and modification',
      'Establish log retention policies aligned with organizational requirements',
      'Review logs regularly for suspicious activity'
    ];
  }
  // CIS Control 9: Email and Web Browser Protections
  else if (section === '9') {
    implementation = [
      'Deploy DNS filtering services to block access to known malicious domains',
      'Implement email security controls (SPF, DKIM, DMARC)',
      'Configure web content filtering to prevent access to malicious websites',
      'Use only fully supported web browsers with security extensions',
      'Disable unnecessary browser plugins and features',
      'Implement automated updates for browsers and email clients'
    ];
  }
  // CIS Control 10: Malware Defenses
  else if (section === '10') {
    implementation = [
      'Deploy anti-malware software on all enterprise assets',
      'Configure real-time scanning for files and applications',
      'Implement centralized management of malware defenses',
      'Regularly update malware definitions and engines',
      'Scan removable media automatically',
      'Implement application allowlisting to prevent unauthorized code execution'
    ];
  }
  // Default implementation steps for other controls
  else {
    implementation = [
      'Document formal policies and procedures related to this control',
      'Implement appropriate technical controls',
      'Train personnel on related security practices',
      'Monitor and audit compliance with this control',
      'Regularly review and update implementation as needed',
      'Maintain documentation of compliance evidence'
    ];
  }
  
  const formattedImpl = implementation.map(item => `- ${item}`).join('\\n');
  return `Purpose: ${purpose}\\n\\nImplementation:\\n${formattedImpl}`;
}

let newContent = fileContent;

// Find all CIS control patterns
const regex = /id:\s*'cis-(ig[123])-([^']+)',[\s\S]*?description:\s*'([^']+)',[\s\S]*?guidance:\s*'',[\s\S]*?lastAssessmentDate:\s*null,/g;

// Use a different approach with string replacement
let match;
let offset = 0;

// Collect all matches first
const matches = [];
while ((match = regex.exec(fileContent)) !== null) {
  matches.push({
    full: match[0],
    ig: match[1],
    code: match[2],
    desc: match[3],
    index: match.index
  });
}

// Apply replacements in reverse order to avoid shifting indexes
matches.sort((a, b) => b.index - a.index).forEach(match => {
  const guidance = generateCISGuidance(match.code.split('.')[0], match.code, match.desc);
  
  // Create replacement with auditReadyGuidance
  const replacement = 
    match.full + 
    `    auditReadyGuidance: \`${guidance}\`,\\n`;
  
  // Replace in the content
  newContent = newContent.substring(0, match.index + match.full.length) + 
               `    auditReadyGuidance: \`${guidance}\`,\n` + 
               newContent.substring(match.index + match.full.length);
});

// Write the updated content back to the file
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Added guidance to CIS controls successfully!'); 