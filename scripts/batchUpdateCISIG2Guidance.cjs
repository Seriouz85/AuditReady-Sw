const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockData.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

function cisIG2Guidance(name, description) {
  let tips = [];
  if (name.toLowerCase().includes('asset inventory')) {
    tips.push('Use automated discovery tools (e.g., Azure Resource Graph, AWS Config, SCCM, Intune, Jamf) to scan and inventory all devices.');
    tips.push('Include cloud, on-prem, and mobile assets.');
  } else if (name.toLowerCase().includes('unauthorized assets')) {
    tips.push('Set up alerts for new or unknown devices.');
    tips.push('Remove, quarantine, or block unauthorized assets using NAC or cloud policies.');
  } else if (name.toLowerCase().includes('software inventory')) {
    tips.push('Use software inventory tools (e.g., SCCM, JAMF, Azure Arc, AWS Systems Manager) to track installed software.');
  } else if (name.toLowerCase().includes('mfa')) {
    tips.push('Enforce MFA using Azure AD, AWS IAM, or your identity provider.');
    tips.push('Test MFA enforcement regularly.');
  } else if (name.toLowerCase().includes('firewall')) {
    tips.push('Enable and configure host-based or virtual firewalls.');
    tips.push('Use MDM or endpoint management tools to enforce firewall settings.');
  } else if (name.toLowerCase().includes('patch')) {
    tips.push('Use automated patch management tools (e.g., WSUS, Azure Update Management, AWS Systems Manager Patch Manager).');
  } else if (name.toLowerCase().includes('backup')) {
    tips.push('Automate backups using platform tools (e.g., Azure Backup, AWS Backup, Veeam).');
    tips.push('Test recovery regularly.');
  } else if (name.toLowerCase().includes('encryption')) {
    tips.push('Enable full-disk encryption (e.g., BitLocker, FileVault, dm-crypt).');
    tips.push('Enforce encryption via MDM or group policy.');
  } else if (name.toLowerCase().includes('account')) {
    tips.push('Use identity management tools (e.g., Azure AD, AWS IAM, LDAP) to automate account inventory and management.');
  } else if (name.toLowerCase().includes('incident')) {
    tips.push('Designate incident response personnel and backups.');
    tips.push('Document and communicate incident response procedures.');
  } else if (name.toLowerCase().includes('data inventory')) {
    tips.push('Use data discovery tools (e.g., Azure Information Protection, AWS Macie) to automate inventory.');
  } else if (name.toLowerCase().includes('dns filtering')) {
    tips.push('Use DNS filtering services (e.g., Cisco Umbrella, Quad9, Cloudflare Gateway) on all devices.');
  } else if (name.toLowerCase().includes('anti-malware')) {
    tips.push('Deploy and maintain anti-malware software (e.g., Microsoft Defender, CrowdStrike, Sophos) on all assets.');
  } else if (name.toLowerCase().includes('security awareness')) {
    tips.push('Conduct security awareness training at hire and annually.');
    tips.push('Use simulated phishing and regular reminders.');
  }
  tips.push(`Review the organization's current practices related to "${name}".`);
  tips.push('Implement the steps and safeguards as described in the control.');
  tips.push('Assign responsibilities and ensure regular review and improvement.');

  let guidance = '';
  if (description && description.trim().length > 0) {
    guidance += `Purpose: ${description}\n\n`;
  }
  guidance += 'Implementation:\n';
  for (const tip of tips) {
    guidance += `- ${tip}\n`;
  }
  return guidance;
}

const requirementRegex = /({\s*id:\s*'cis-ig2-[^']+',[\s\S]*?)(\n\s*},)/g;

fileContent = fileContent.replace(requirementRegex, (match, objStart, objEnd) => {
  const nameMatch = objStart.match(/name:\s*'([^']+)'/);
  const descMatch = objStart.match(/description:\s*'([^']+)'/);
  const name = nameMatch ? nameMatch[1] : '';
  const description = descMatch ? descMatch[1] : '';

  let cleanedObj = objStart.replace(/auditReadyGuidance:\s*`[^`]*`,?\n/, '');

  let guidance = cisIG2Guidance(name, description);

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
