// Quick script to fix ISO/IEC 27001 9.1 mapping
// Run this to immediately update the database mapping

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixISO27001_9_1_Mapping() {
  try {
    console.log('🔍 Finding ISO/IEC 27001 requirement 9.1...');
    
    // Find the requirement
    const { data: requirements, error: reqError } = await supabase
      .from('requirements_library')
      .select(`
        id,
        control_id,
        title,
        standards_library!inner(name)
      `)
      .eq('control_id', '9.1')
      .ilike('standards_library.name', '%ISO%27001%')
      .ilike('title', '%Monitoring, measurement, analysis and evaluation%');
    
    if (reqError) {
      console.error('Error finding requirement:', reqError);
      return;
    }
    
    if (!requirements || requirements.length === 0) {
      console.error('❌ ISO/IEC 27001 requirement 9.1 not found');
      return;
    }
    
    const requirement = requirements[0];
    console.log('✅ Found requirement:', requirement.title);
    
    // Find Governance & Leadership category
    const { data: category, error: catError } = await supabase
      .from('unified_compliance_categories')
      .select('id')
      .eq('name', 'Governance & Leadership')
      .single();
    
    if (catError || !category) {
      console.error('❌ Governance & Leadership category not found:', catError);
      return;
    }
    
    console.log('✅ Found Governance & Leadership category');
    
    // Find or create unified requirement for governance
    let { data: unifiedReq, error: unifiedError } = await supabase
      .from('unified_requirements')
      .select('id')
      .eq('category_id', category.id)
      .limit(1)
      .single();
    
    if (unifiedError && unifiedError.code !== 'PGRST116') {
      console.error('Error finding unified requirement:', unifiedError);
      return;
    }
    
    if (!unifiedReq) {
      // Create unified requirement
      const { data: newUnifiedReq, error: createError } = await supabase
        .from('unified_requirements')
        .insert({
          category_id: category.id,
          title: 'Governance & Leadership Requirements',
          description: 'Unified requirements for governance and leadership controls',
          implementation_guidance: 'Implement governance controls including monitoring, measurement, analysis and evaluation'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating unified requirement:', createError);
        return;
      }
      
      unifiedReq = newUnifiedReq;
      console.log('✅ Created new unified requirement for Governance & Leadership');
    }
    
    // Delete existing mapping
    const { error: deleteError } = await supabase
      .from('unified_requirement_mappings')
      .delete()
      .eq('requirement_id', requirement.id);
    
    if (deleteError) {
      console.error('Error deleting old mapping:', deleteError);
      return;
    }
    
    console.log('🗑️ Deleted old mapping');
    
    // Create new mapping
    const { error: insertError } = await supabase
      .from('unified_requirement_mappings')
      .insert({
        requirement_id: requirement.id,
        unified_requirement_id: unifiedReq.id
      });
    
    if (insertError) {
      console.error('Error creating new mapping:', insertError);
      return;
    }
    
    console.log('✅ SUCCESS: ISO/IEC 27001 9.1 "Monitoring, measurement, analysis and evaluation" is now mapped to Governance & Leadership');
    
    // Verify the mapping
    const { data: verification, error: verifyError } = await supabase
      .from('unified_requirement_mappings')
      .select(`
        unified_requirements!inner(
          unified_compliance_categories!inner(name)
        )
      `)
      .eq('requirement_id', requirement.id);
    
    if (verification && verification.length > 0) {
      const categoryName = verification[0].unified_requirements.unified_compliance_categories.name;
      console.log('🔍 Verification: Requirement is now in category:', categoryName);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixISO27001_9_1_Mapping().then(() => {
  console.log('🎉 Fix completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});