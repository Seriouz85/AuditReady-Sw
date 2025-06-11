const fs = require('fs');

// Database standard mapping
const standardMapping = {
  'iso-27001': '55742f4e-769b-4efe-912c-1371de5e1cd6',
  'iso-27002-2022': '8508cfb0-3457-4226-b39a-851be52ef7ea',
  'cis-v8': 'afe9728d-2084-4b6b-8653-b04e1e92cdff',
  'cis-ig1': 'afe9728d-2084-4b6b-8653-b04e1e92cdff',
  'cis-ig2': '05501cbc-c463-4668-ae84-9acb1a4d5332',
  'cis-ig3': 'b1d9e82f-b0c3-40e2-89d7-4c51e216214e',
  'nist-csf': '8ed562f0-915c-40ad-851e-27f6bddaa54e', // Using NIS2 as placeholder
  'gdpr': '73869227-cd63-47db-9981-c0d633a3d47b'
};

// Read the mock data file to extract full requirement details
const mockDataContent = fs.readFileSync('/Users/payam/audit-readiness-hub/src/data/mockData.ts', 'utf8');

// Read missing codes
const missingCodes = fs.readFileSync('/tmp/missing_codes.txt', 'utf8').trim().split('\n');
const uniqueMissingCodes = [...new Set(missingCodes)];

console.log('Processing', uniqueMissingCodes.length, 'unique missing codes');

// Extract requirements array using regex
const requirementsMatch = mockDataContent.match(/export const requirements: Requirement\[\] = \[([\s\S]*?)\];/);
if (!requirementsMatch) {
  console.error('Could not find requirements array');
  process.exit(1);
}

const requirementsStr = requirementsMatch[1];

// Parse requirements looking for our missing codes
const missingRequirements = [];

// Split by requirement boundaries
const reqParts = requirementsStr.split(/\s*{\s*id:\s*'/);

for (let i = 1; i < reqParts.length; i++) {
  const reqStr = '{' + "'" + reqParts[i];
  
  try {
    // Extract fields with better regex
    const codeMatch = reqStr.match(/code:\s*'([^']+)'/);
    
    if (codeMatch && uniqueMissingCodes.includes(codeMatch[1])) {
      const idMatch = reqStr.match(/id:\s*'([^']+)'/);
      const standardIdMatch = reqStr.match(/standardId:\s*'([^']+)'/);
      const sectionMatch = reqStr.match(/section:\s*'([^']*?)'/);
      const nameMatch = reqStr.match(/name:\s*'([^']*?)'/);
      const descriptionMatch = reqStr.match(/description:\s*'([^']*?)'/);
      const guidanceMatch = reqStr.match(/guidance:\s*'([^']*?)'/);
      const statusMatch = reqStr.match(/status:\s*'([^']*?)'/);
      const notesMatch = reqStr.match(/notes:\s*'([^']*?)'/);
      const responsiblePartyMatch = reqStr.match(/responsibleParty:\s*'([^']*?)'/);
      const tagsMatch = reqStr.match(/tags:\s*\[([^\]]*?)\]/);
      
      if (idMatch && standardIdMatch && nameMatch) {
        let tags = [];
        if (tagsMatch) {
          const tagsStr = tagsMatch[1];
          tags = tagsStr.split(',').map(t => t.trim().replace(/['"]/g, ''));
        }
        
        const req = {
          id: idMatch[1],
          standardId: standardIdMatch[1],
          section: sectionMatch ? sectionMatch[1] : '',
          code: codeMatch[1],
          name: nameMatch[1],
          description: descriptionMatch ? descriptionMatch[1] : '',
          guidance: guidanceMatch ? guidanceMatch[1] : '',
          status: statusMatch ? statusMatch[1] : 'not-fulfilled',
          notes: notesMatch ? notesMatch[1] : '',
          responsibleParty: responsiblePartyMatch ? responsiblePartyMatch[1] : '',
          tags: tags.filter(t => t.length > 0),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        missingRequirements.push(req);
      }
    }
  } catch (e) {
    console.error('Error parsing requirement:', e);
  }
}

console.log(`Found ${missingRequirements.length} missing requirements with full data`);

// Group by standard for better organization
const byStandard = {};
missingRequirements.forEach(req => {
  if (!byStandard[req.standardId]) {
    byStandard[req.standardId] = [];
  }
  byStandard[req.standardId].push(req);
});

console.log('Requirements by standard:');
Object.keys(byStandard).forEach(standardId => {
  console.log(`  ${standardId}: ${byStandard[standardId].length} requirements`);
});

// Save the data
fs.writeFileSync('/tmp/missing_requirements_full.json', JSON.stringify(missingRequirements, null, 2));

// Create SQL insert statements
const sqlStatements = [];

missingRequirements.forEach(req => {
  const dbStandardId = standardMapping[req.standardId] || req.standardId;
  
  // Escape single quotes in strings
  const escape = (str) => str ? str.replace(/'/g, "''") : '';
  
  const sql = `INSERT INTO requirements_library (
    id, 
    standard_id, 
    control_id, 
    title, 
    description, 
    category, 
    priority, 
    order_index,
    created_at, 
    updated_at, 
    is_active
  ) VALUES (
    gen_random_uuid(),
    '${dbStandardId}',
    '${req.code}',
    '${escape(req.name)}',
    '${escape(req.description)}',
    '${escape(req.section)}',
    'medium',
    0,
    now(),
    now(),
    true
  );`;
  
  sqlStatements.push(sql);
});

fs.writeFileSync('/tmp/missing_requirements.sql', sqlStatements.join('\n\n'));

console.log(`Created SQL file with ${sqlStatements.length} INSERT statements`);
console.log('Files created:');
console.log('  /tmp/missing_requirements_full.json - Full requirement data');
console.log('  /tmp/missing_requirements.sql - SQL INSERT statements');