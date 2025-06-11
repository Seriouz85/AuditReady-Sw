const fs = require('fs');

// Database standard ID mapping
const standardMapping = {
  'iso-27001': '55742f4e-769b-4efe-912c-1371de5e1cd6',
  'iso-27002-2022': '8508cfb0-3457-4226-b39a-851be52ef7ea',
  'iso-27005-2022': '13868d04-c5f4-40c1-847a-7281cf9d5bf8',
  'cis-ig1': 'afe9728d-2084-4b6b-8653-b04e1e92cdff',
  'cis-ig2': '05501cbc-c463-4668-ae84-9acb1a4d5332',
  'cis-ig3': 'b1d9e82f-b0c3-40e2-89d7-4c51e216214e',
  'nist-csf-2.0': '4ab62bec-94ed-44f0-84c1-7882bb137af4',
  'gdpr': '73869227-cd63-47db-9981-c0d633a3d47b',
  'nis2': '8ed562f0-915c-40ad-851e-27f6bddaa54e'
};

// Read the missing codes
const missingCodes = fs.readFileSync('/tmp/missing_codes.txt', 'utf8').trim().split('\n');
const uniqueMissingCodes = [...new Set(missingCodes)];

console.log('Processing', uniqueMissingCodes.length, 'unique missing codes');

// Read the mock data file
const mockDataContent = fs.readFileSync('/Users/payam/audit-readiness-hub/src/data/mockData.ts', 'utf8');

// Extract the requirements array content
const requirementsStart = mockDataContent.indexOf('export const requirements: Requirement[] = [');
const requirementsEnd = mockDataContent.indexOf('];', requirementsStart);
const requirementsContent = mockDataContent.substring(requirementsStart, requirementsEnd + 2);

// Find all requirements with our missing codes
const sqlStatements = [];
let processedCount = 0;

uniqueMissingCodes.forEach(code => {
  console.log(`Processing code: ${code}`);
  
  // Create a more specific regex to find complete requirement objects with this code
  const codeEscaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const reqRegex = new RegExp(`\\{[^}]*?id:\\s*'([^']*)'[^}]*?standardId:\\s*'([^']*)'[^}]*?code:\\s*'${codeEscaped}'[^}]*?name:\\s*'([^']*?)'[^}]*?description:\\s*'([^']*?)'(?:[^}]*?section:\\s*'([^']*?)')?[^}]*?\\}`, 'g');
  
  let match;
  let foundForThisCode = 0;
  
  while ((match = reqRegex.exec(requirementsContent)) !== null) {
    const [fullMatch, id, standardId, name, description, section] = match;
    
    // Only process if we have the standard mapping
    if (standardMapping[standardId]) {
      foundForThisCode++;
      
      // Escape single quotes for SQL
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
        '${standardMapping[standardId]}',
        '${code}',
        '${escape(name)}',
        '${escape(description)}',
        '${escape(section || '')}',
        'medium',
        ${processedCount},
        now(),
        now(),
        true
      );`;
      
      sqlStatements.push(sql);
      processedCount++;
      
      console.log(`  Found: ${id} (${standardId}) - ${name.substring(0, 50)}...`);
    }
  }
  
  if (foundForThisCode === 0) {
    console.log(`  ⚠️  No requirements found for code ${code}`);
  }
});

console.log(`\nGenerated ${sqlStatements.length} SQL statements`);

// Save SQL statements to file
fs.writeFileSync('/tmp/upload_missing_requirements.sql', sqlStatements.join('\n\n'));

// Also create batches for easier execution
const batchSize = 10;
const batches = [];

for (let i = 0; i < sqlStatements.length; i += batchSize) {
  const batch = sqlStatements.slice(i, i + batchSize);
  batches.push(batch.join('\n\n'));
}

batches.forEach((batch, index) => {
  fs.writeFileSync(`/tmp/batch_${index + 1}.sql`, batch);
});

console.log(`Created ${batches.length} batch files`);
console.log('Files created:');
console.log('  /tmp/upload_missing_requirements.sql - All statements');
batches.forEach((_, index) => {
  console.log(`  /tmp/batch_${index + 1}.sql - Batch ${index + 1}`);
});