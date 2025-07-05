// Script to generate SQL for updating CIS control descriptions
const fs = require('fs');

// Read the CIS controls data
const cisData = JSON.parse(fs.readFileSync('cis_controls_data.json', 'utf8'));

// Function to convert "1.1.1" format to "1.1" format 
function convertControlId(id) {
  const parts = id.split('.');
  if (parts.length === 3) {
    return `${parts[0]}.${parts[1]}`;
  }
  return id;
}

// Group by simplified control ID and use the first description
const controlDescriptions = {};
cisData.forEach(control => {
  const simplifiedId = convertControlId(control.control_id);
  if (!controlDescriptions[simplifiedId]) {
    controlDescriptions[simplifiedId] = {
      id: simplifiedId,
      title: control.control_title,
      description: control.official_description
    };
  }
});

// Generate SQL
let sql = `-- Update CIS Controls with detailed descriptions from Excel
-- This migration updates all CIS Controls with comprehensive descriptions

`;

Object.values(controlDescriptions).forEach(control => {
  // Escape single quotes in the description
  const escapedDesc = control.description.replace(/'/g, "''");
  const escapedTitle = control.title.replace(/'/g, "''");
  
  sql += `-- Update ${control.id}
UPDATE requirements_library 
SET 
  title = '${escapedTitle}',
  description = '${escapedDesc}',
  updated_at = NOW()
WHERE control_id = '${control.id}' 
AND standard_id IN (
  'afe9728d-2084-4b6b-8653-b04e1e92cdff', 
  '05501cbc-c463-4668-ae84-9acb1a4d5332', 
  'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
);

`;
});

// Write to file
fs.writeFileSync('supabase/migrations/20250104100000_update_cis_descriptions.sql', sql);
console.log('Generated migration file: supabase/migrations/20250104100000_update_cis_descriptions.sql');
console.log(`Generated updates for ${Object.keys(controlDescriptions).length} controls`);