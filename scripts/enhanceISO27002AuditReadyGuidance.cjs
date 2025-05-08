const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockData.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Information gathered from https://www.avisoconsultancy.co.uk/iso-27001-2022#controls
function getEnhancedISO27002Guidance(code, name, description, existingGuidance) {
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
  
  // Enhanced guidance based on Aviso information
  let additionalGuidance = [];
  
  // Organizational controls (A5)
  if (code.startsWith('A5.1')) { // Information security policies
    additionalGuidance = [
      'Define and document comprehensive information security policies approved by management',
      'Ensure policies are communicated to all employees and relevant external parties',
      'Review policies regularly and update when significant changes occur',
      'Consider the four domains: Organizational, People, Physical, and Technological controls'
    ];
  } else if (code.startsWith('A5.2')) { // Information security roles and responsibilities
    additionalGuidance = [
      'Clearly define and document information security roles and responsibilities',
      'Ensure roles are aligned with organizational needs and structure',
      'Communicate responsibilities to all relevant personnel',
      'Include responsibilities for managing risks and ensuring compliance'
    ];
  } else if (code.startsWith('A5.3')) { // Segregation of duties
    additionalGuidance = [
      'Identify and document conflicting duties and areas of responsibility',
      'Implement separation of duties to prevent conflicts of interest',
      'Ensure no single person can access, modify, or use assets without authorization',
      'Consider technical and procedural controls where segregation is difficult'
    ];
  } else if (code.startsWith('A5.4')) { // Management responsibilities
    additionalGuidance = [
      'Establish management oversight of information security policy implementation',
      'Require management to enforce compliance with policies and procedures',
      'Ensure management leads by example in security practices',
      'Implement regular reporting on security compliance to management'
    ];
  } else if (code.startsWith('A5.5')) { // Contact with authorities
    additionalGuidance = [
      'Identify and document relevant authorities (e.g., law enforcement, regulatory bodies)',
      'Establish formal procedures for contacting authorities during incidents',
      'Maintain up-to-date contact information for authorities',
      'Conduct periodic reviews of authority relationships and procedures'
    ];
  } else if (code.startsWith('A5.6')) { // Contact with special interest groups
    additionalGuidance = [
      'Identify relevant security forums and professional associations',
      'Establish formal memberships or relationships with these groups',
      'Implement procedures for sharing and receiving security information',
      'Regularly review the value and relevance of these relationships'
    ];
  } else if (code.startsWith('A5.7')) { // Threat intelligence
    additionalGuidance = [
      'Establish formal processes for collecting threat intelligence information',
      'Implement tools and procedures for analyzing threat data',
      'Create mechanisms to distribute relevant threat intelligence internally',
      'Regularly review and update threat intelligence sources and processes'
    ];
  } else if (code.startsWith('A5.9')) { // Inventory of information and other associated assets
    additionalGuidance = [
      'Develop and maintain a comprehensive asset inventory system',
      'Include all information assets, hardware, software, and supporting services',
      'Assign ownership and classification to each asset',
      'Regularly update and validate the inventory'
    ];
  } else if (code.startsWith('A5.10')) { // Acceptable use of information and other associated assets
    additionalGuidance = [
      'Document clear acceptable use policies for all information and assets',
      'Cover all types of information handling including electronic, physical, and verbal',
      'Ensure policies are communicated to all users',
      'Implement monitoring for policy compliance'
    ];
  } else if (code.startsWith('A5.12')) { // Classification of information
    additionalGuidance = [
      'Establish a formal information classification scheme',
      'Base classification on legal requirements, value, and sensitivity',
      'Define handling requirements for each classification level',
      'Implement procedures for reviewing and updating classifications'
    ];
  } else if (code.startsWith('A5.14')) { // Information transfer
    additionalGuidance = [
      'Establish formal policies for all types of information transfer',
      'Include transfers via electronic, physical, and verbal communications',
      'Implement appropriate security controls for each transfer method',
      'Regularly review and test transfer security measures'
    ];
  } else if (code.startsWith('A5.15')) { // Access control
    additionalGuidance = [
      'Implement comprehensive access control policies and procedures',
      'Include both physical and logical access controls',
      'Base access decisions on the principle of least privilege',
      'Regularly review and validate access rights'
    ];
  } else if (code.startsWith('A5.16')) { // Identity management
    additionalGuidance = [
      'Establish formal identity lifecycle management processes',
      'Include procedures for registration, provisioning, changes, and deprovisioning',
      'Implement regular reviews of identity information',
      'Ensure coordination between HR and IT for identity changes'
    ];
  }
  
  // People controls (A6)
  else if (code.startsWith('A6.1')) { // Screening
    additionalGuidance = [
      'Implement background verification checks in accordance with laws and regulations',
      'Scale verification depth based on role sensitivity and information access',
      'Document screening procedures and requirements',
      'Review and update screening processes regularly'
    ];
  } else if (code.startsWith('A6.2')) { // Terms and conditions of employment
    additionalGuidance = [
      'Include information security responsibilities in employment contracts',
      'Ensure terms apply before granting access to sensitive information',
      'Clearly define consequences of non-compliance',
      'Update terms when roles or responsibilities change'
    ];
  } else if (code.startsWith('A6.3')) { // Information security awareness, education and training
    additionalGuidance = [
      'Develop a comprehensive security awareness program',
      'Include regular training, updates, and awareness communications',
      'Tailor training to specific roles and responsibilities',
      'Measure effectiveness through testing and practical assessments'
    ];
  } else if (code.startsWith('A6.7')) { // Remote working
    additionalGuidance = [
      'Establish formal policies and procedures for secure remote working',
      'Address physical, environmental, and communication security requirements',
      'Implement technical controls for remote access and data protection',
      'Regularly review and update remote working arrangements'
    ];
  } else if (code.startsWith('A6.8')) { // Information security event reporting
    additionalGuidance = [
      'Establish formal procedures for reporting security events and weaknesses',
      'Implement multiple reporting channels for different types of incidents',
      'Ensure all personnel understand reporting responsibilities',
      'Regularly test reporting mechanisms and response procedures'
    ];
  }
  
  // Physical controls (A7)
  else if (code.startsWith('A7.1')) { // Physical security perimeters
    additionalGuidance = [
      'Define clear security perimeters for areas with sensitive information',
      'Implement appropriate physical barriers and entry controls',
      'Document perimeter security requirements',
      'Regularly review and test perimeter security effectiveness'
    ];
  } else if (code.startsWith('A7.2')) { // Physical entry
    additionalGuidance = [
      'Implement appropriate entry controls based on area sensitivity',
      'Use multi-factor authentication for highly sensitive areas',
      'Maintain logs of all access to secure areas',
      'Regularly review and audit access records'
    ];
  } else if (code.startsWith('A7.4')) { // Physical security monitoring
    additionalGuidance = [
      'Implement comprehensive monitoring of physical access points',
      'Use appropriate technologies (CCTV, intrusion detection, etc.)',
      'Establish procedures for monitoring, logging, and responding to events',
      'Regularly review monitoring effectiveness and coverage'
    ];
  } else if (code.startsWith('A7.9')) { // Clear desk and clear screen
    additionalGuidance = [
      'Establish formal clear desk and clear screen policies',
      'Include requirements for handling sensitive information when unattended',
      'Implement technical controls to enforce screen locking',
      'Conduct regular compliance checks'
    ];
  }
  
  // Technological controls (A8)
  else if (code.startsWith('A8.1')) { // User endpoint devices
    additionalGuidance = [
      'Develop and implement endpoint security policies and procedures',
      'Include requirements for encryption, authentication, and access controls',
      'Implement technical controls through MDM or other management tools',
      'Regularly audit compliance with endpoint policies'
    ];
  } else if (code.startsWith('A8.2')) { // Privileged access rights
    additionalGuidance = [
      'Implement strict controls for privileged account management',
      'Restrict and monitor privileged access allocation',
      'Use just-in-time access where possible',
      'Review privileged access rights regularly'
    ];
  } else if (code.startsWith('A8.7')) { // Protection against malware
    additionalGuidance = [
      'Implement multi-layered anti-malware protection',
      'Include technical controls and user awareness',
      'Keep protection mechanisms updated',
      'Regularly test effectiveness against current threats'
    ];
  } else if (code.startsWith('A8.9')) { // Configuration management
    additionalGuidance = [
      'Establish baseline configurations for all systems and networks',
      'Document, implement, and monitor configuration standards',
      'Use automation for configuration compliance checking',
      'Regularly review and update baseline configurations'
    ];
  } else if (code.startsWith('A8.10')) { // Information deletion
    additionalGuidance = [
      'Develop secure deletion procedures for different types of information',
      'Use appropriate methods based on media type and data sensitivity',
      'Document deletion requirements and verification processes',
      'Maintain records of secure deletions for sensitive information'
    ];
  } else if (code.startsWith('A8.11')) { // Data masking
    additionalGuidance = [
      'Implement data masking for sensitive information',
      'Align masking with access control policies and legal requirements',
      'Use appropriate techniques based on data type and use case',
      'Regularly review masking effectiveness'
    ];
  } else if (code.startsWith('A8.22')) { // Web filtering
    additionalGuidance = [
      'Implement web filtering technologies across the organization',
      'Define policies for acceptable web access',
      'Block known malicious sites and content categories',
      'Regularly update filtering rules based on threat intelligence'
    ];
  } else if (code.startsWith('A8.28')) { // Secure coding
    additionalGuidance = [
      'Establish secure coding standards and guidelines',
      'Include requirements for input validation, authentication, and error handling',
      'Implement security testing throughout the development lifecycle',
      'Provide regular training on secure coding practices'
    ];
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

// Regex to find each ISO 27002 requirement object
const requirementRegex = /({\s*id:\s*'iso-27001-A[^']+',[\s\S]*?standardId:\s*'iso-27002-2022'[\s\S]*?)(\n\s*},)/g;

fileContent = fileContent.replace(requirementRegex, (match, objStart, objEnd) => {
  // Extract code, name, description, and existing guidance
  const codeMatch = objStart.match(/code:\s*'([^']+)'/);
  const nameMatch = objStart.match(/name:\s*'([^']+)'/);
  const descMatch = objStart.match(/description:\s*'([^']+)'/);
  const guidanceMatch = objStart.match(/auditReadyGuidance:\s*`([^`]*)`/);
  
  const code = codeMatch ? codeMatch[1] : '';
  const name = nameMatch ? nameMatch[1] : '';
  const description = descMatch ? descMatch[1] : '';
  const existingGuidance = guidanceMatch ? guidanceMatch[1] : '';
  
  // Generate enhanced guidance
  const enhancedGuidance = getEnhancedISO27002Guidance(code, name, description, existingGuidance);
  
  // Remove any existing auditReadyGuidance
  let cleanedObj = objStart.replace(/auditReadyGuidance:\s*`[^`]*`,?\n/, '');
  
  // Insert the enhanced guidance
  if (cleanedObj.includes('guidance:')) {
    cleanedObj = cleanedObj.replace(/(guidance:\s*'[^']*',\n)/, `$1    auditReadyGuidance: \`${enhancedGuidance}\`,\n`);
  } else if (cleanedObj.includes('description:')) {
    cleanedObj = cleanedObj.replace(/(description:\s*'[^']*',\n)/, `$1    auditReadyGuidance: \`${enhancedGuidance}\`,\n`);
  } else {
    cleanedObj += `    auditReadyGuidance: \`${enhancedGuidance}\`,\n`;
  }
  
  return cleanedObj + objEnd;
});

fs.writeFileSync(filePath, fileContent, 'utf8');
console.log('Enhanced ISO 27002 guidance with information from Aviso Consultancy.'); 