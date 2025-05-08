const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockData.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Helper function to generate guidance for CIS IG1
function cisIG1Guidance(name, description) {
  // Platform-aware, actionable guidance for each control
  // This is a simplified template; you can expand with more platform-specific logic if desired
  let tips = '';
  if (name.toLowerCase().includes('asset inventory')) {
    tips = '- Use automated discovery tools (e.g., Azure Resource Graph, AWS Config, SCCM, Intune, Jamf) to scan and inventory all devices.\n- Include cloud, on-prem, and mobile assets.';
  } else if (name.toLowerCase().includes('unauthorized assets')) {
    tips = '- Set up alerts for new or unknown devices.\n- Remove, quarantine, or block unauthorized assets using NAC or cloud policies.';
  } else if (name.toLowerCase().includes('software inventory')) {
    tips = '- Use software inventory tools (e.g., SCCM, JAMF, Azure Arc, AWS Systems Manager) to track installed software.';
  } else if (name.toLowerCase().includes('mfa')) {
    tips = '- Enforce MFA using Azure AD, AWS IAM, or your identity provider.\n- Test MFA enforcement regularly.';
  } else if (name.toLowerCase().includes('firewall')) {
    tips = '- Enable and configure host-based or virtual firewalls.\n- Use MDM or endpoint management tools to enforce firewall settings.';
  } else if (name.toLowerCase().includes('patch')) {
    tips = '- Use automated patch management tools (e.g., WSUS, Azure Update Management, AWS Systems Manager Patch Manager).';
  } else if (name.toLowerCase().includes('backup')) {
    tips = '- Automate backups using platform tools (e.g., Azure Backup, AWS Backup, Veeam).\n- Test recovery regularly.';
  } else if (name.toLowerCase().includes('encryption')) {
    tips = '- Enable full-disk encryption (e.g., BitLocker, FileVault, dm-crypt).\n- Enforce encryption via MDM or group policy.';
  } else if (name.toLowerCase().includes('account')) {
    tips = '- Use identity management tools (e.g., Azure AD, AWS IAM, LDAP) to automate account inventory and management.';
  } else if (name.toLowerCase().includes('incident')) {
    tips = '- Designate incident response personnel and backups.\n- Document and communicate incident response procedures.';
  } else if (name.toLowerCase().includes('data inventory')) {
    tips = '- Use data discovery tools (e.g., Azure Information Protection, AWS Macie) to automate inventory.';
  } else if (name.toLowerCase().includes('dns filtering')) {
    tips = '- Use DNS filtering services (e.g., Cisco Umbrella, Quad9, Cloudflare Gateway) on all devices.';
  } else if (name.toLowerCase().includes('anti-malware')) {
    tips = '- Deploy and maintain anti-malware software (e.g., Microsoft Defender, CrowdStrike, Sophos) on all assets.';
  } else if (name.toLowerCase().includes('security awareness')) {
    tips = '- Conduct security awareness training at hire and annually.\n- Use simulated phishing and regular reminders.';
  }
  return `Purpose: ${description}\n\nImplementation:\n${tips ? tips + '\n' : ''}- Review the organization\'s current practices related to "${name}".\n- Implement the steps and safeguards as described in the control.\n- Assign responsibilities and ensure regular review and improvement.\n`;
}

// Regex to find each requirement object
const requirementRegex = /({\s*id:\s*'cis-ig1-[^']+',[\s\S]*?)(\n\s*},)/g;

fileContent = fileContent.replace(requirementRegex, (match, objStart, objEnd) => {
  // Extract name and description
  const nameMatch = objStart.match(/name:\s*'([^']+)'/);
  const descMatch = objStart.match(/description:\s*'([^']+)'/);
  const name = nameMatch ? nameMatch[1] : '';
  const description = descMatch ? descMatch[1] : '';

  // Remove any existing auditReadyGuidance
  let cleanedObj = objStart.replace(/auditReadyGuidance:\s*`[^`]*`,?\n/, '');

  // Generate new guidance
  let guidance = cisIG1Guidance(name, description);

  // Insert auditReadyGuidance after guidance or description
  if (cleanedObj.includes('guidance:')) {
    cleanedObj = cleanedObj.replace(/(guidance:\s*'[^']*',\n)/, `$1    auditReadyGuidance: \`${guidance}\`,\n`);
  } else if (cleanedObj.includes('description:')) {
    cleanedObj = cleanedObj.replace(/(description:\s*'[^']*',\n)/, `$1    auditReadyGuidance: \`${guidance}\`,\n`);
  } else {
    cleanedObj += `    auditReadyGuidance: \`${guidance}\`,\n`;
  }

  return cleanedObj + objEnd;
});

fs.writeFileSync(filePath, fileContent, 'utf8');
console.log('Batch update complete!');
