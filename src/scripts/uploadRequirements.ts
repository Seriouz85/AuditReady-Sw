import { supabase } from '@/lib/supabase';
// Note: Requirements are now loaded from database - this script may need updating
// import { requirements } from '@/data/mockData'; // Removed - requirements array is now empty

// Map mock standard IDs to actual Supabase standard IDs
const standardIdMap: Record<string, string> = {
  'iso-27001': '55742f4e-769b-4efe-912c-1371de5e1cd6', // ISO/IEC 27001
  'iso-27002-2022': '8508cfb0-3457-4226-b39a-851be52ef7ea', // ISO/IEC 27002
  'nis2': '8ed562f0-915c-40ad-851e-27f6bddaa54e', // NIS2 Directive
  'gdpr': '73869227-cd63-47db-9981-c0d633a3d47b', // GDPR
  'cis-ig1': 'afe9728d-2084-4b6b-8653-b04e1e92cdff', // CIS Controls IG1
  'cis-ig2': '05501cbc-c463-4668-ae84-9acb1a4d5332', // CIS Controls IG2
  'cis-ig3': 'b1d9e82f-b0c3-40e2-89d7-4c51e216214e', // CIS Controls IG3
};

// Map requirement priority
const mapPriority = (status: string): string => {
  switch (status) {
    case 'fulfilled':
    case 'partial':
      return 'medium';
    case 'not-fulfilled':
      return 'high';
    default:
      return 'medium';
  }
};

export async function uploadRequirements() {
  console.log('Starting requirements upload...');
  
  // Group requirements by standard
  const requirementsByStandard: Record<string, typeof requirements> = {};
  
  requirements.forEach(req => {
    if (!requirementsByStandard[req.standardId]) {
      requirementsByStandard[req.standardId] = [];
    }
    requirementsByStandard[req.standardId].push(req);
  });
  
  let totalUploaded = 0;
  let totalErrors = 0;
  
  for (const [mockStandardId, standardRequirements] of Object.entries(requirementsByStandard)) {
    const supabaseStandardId = standardIdMap[mockStandardId];
    
    if (!supabaseStandardId) {
      console.warn(`No mapping found for standard: ${mockStandardId}`);
      continue;
    }
    
    console.log(`Processing ${standardRequirements.length} requirements for ${mockStandardId}...`);
    
    // First, delete existing requirements for this standard
    const { error: deleteError } = await supabase
      .from('requirements_library')
      .delete()
      .eq('standard_id', supabaseStandardId);
      
    if (deleteError) {
      console.error(`Error deleting existing requirements for ${mockStandardId}:`, deleteError);
      continue;
    }
    
    // Prepare requirements for upload
    const requirementsToUpload = standardRequirements.map((req, index) => ({
      standard_id: supabaseStandardId,
      control_id: req.code,
      title: req.name,
      description: req.description,
      category: req.section ? `Section ${req.section}` : 'General',
      priority: mapPriority(req.status),
      order_index: index + 1,
      is_active: true
    }));
    
    // Upload in batches of 50
    const batchSize = 50;
    for (let i = 0; i < requirementsToUpload.length; i += batchSize) {
      const batch = requirementsToUpload.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('requirements_library')
        .insert(batch);
        
      if (error) {
        console.error(`Error uploading batch for ${mockStandardId}:`, error);
        totalErrors += batch.length;
      } else {
        totalUploaded += batch.length;
        console.log(`Uploaded batch ${Math.floor(i / batchSize) + 1} for ${mockStandardId}`);
      }
    }
  }
  
  console.log(`\nUpload complete!`);
  console.log(`Total requirements uploaded: ${totalUploaded}`);
  console.log(`Total errors: ${totalErrors}`);
  
  // Verify counts
  const { data: standards } = await supabase
    .from('standards_library')
    .select('id, name');
    
  if (standards) {
    console.log('\nRequirement counts per standard:');
    for (const standard of standards) {
      const { count } = await supabase
        .from('requirements_library')
        .select('id', { count: 'exact', head: true })
        .eq('standard_id', standard.id);
        
      console.log(`${standard.name}: ${count || 0} requirements`);
    }
  }
}

// Make it available in the browser console
if (typeof window !== 'undefined') {
  (window as any).uploadRequirements = uploadRequirements;
}