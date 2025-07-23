// Execute the ISO/IEC 27001 9.1 database fix
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixISO27001_9_1_Mapping() {
  console.log('🔧 Starting ISO/IEC 27001 9.1 database fix...');
  
  try {
    // Execute the fix using RPC or direct SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        DECLARE
          v_req_id UUID;
          v_gov_cat_id UUID;
          v_gov_unified_id UUID;
          v_old_mappings INT;
        BEGIN
          -- Find ISO/IEC 27001 9.1 requirement
          SELECT rl.id INTO v_req_id
          FROM requirements_library rl
          JOIN standards_library sl ON rl.standard_id = sl.id
          WHERE sl.name ILIKE '%27001%' 
            AND rl.control_id = '9.1'
            AND rl.title ILIKE '%Monitoring, measurement, analysis and evaluation%';
          
          IF v_req_id IS NULL THEN
            RAISE EXCEPTION 'ISO/IEC 27001 9.1 requirement not found';
          END IF;
          
          RAISE NOTICE 'Found requirement 9.1: %', v_req_id;
          
          -- Find Governance & Leadership category
          SELECT id INTO v_gov_cat_id
          FROM unified_compliance_categories
          WHERE name = 'Governance & Leadership';
          
          IF v_gov_cat_id IS NULL THEN
            RAISE EXCEPTION 'Governance & Leadership category not found';
          END IF;
          
          -- Find or create governance unified requirement
          SELECT id INTO v_gov_unified_id
          FROM unified_requirements
          WHERE category_id = v_gov_cat_id
          LIMIT 1;
          
          IF v_gov_unified_id IS NULL THEN
            INSERT INTO unified_requirements (category_id, title, description, created_at, updated_at)
            VALUES (v_gov_cat_id, 'Governance & Leadership Requirements', 'Governance and leadership controls including monitoring and evaluation', NOW(), NOW())
            RETURNING id INTO v_gov_unified_id;
            RAISE NOTICE 'Created governance unified requirement: %', v_gov_unified_id;
          END IF;
          
          -- Count existing mappings
          SELECT COUNT(*) INTO v_old_mappings
          FROM unified_requirement_mappings
          WHERE requirement_id = v_req_id;
          
          -- Delete existing mapping and create correct one
          DELETE FROM unified_requirement_mappings WHERE requirement_id = v_req_id;
          
          INSERT INTO unified_requirement_mappings (requirement_id, unified_requirement_id, created_at)
          VALUES (v_req_id, v_gov_unified_id, NOW())
          ON CONFLICT (requirement_id, unified_requirement_id) DO NOTHING;
          
          RAISE NOTICE '✅ SUCCESS: ISO/IEC 27001 9.1 now maps to Governance & Leadership (removed % old mappings)', v_old_mappings;
        END $$;
      `
    });

    if (error) {
      console.error('❌ RPC call failed, trying direct execution...');
      console.error('Error:', error);
      
      // Fallback: Try step by step approach
      await executeStepByStep();
    } else {
      console.log('✅ Fix executed successfully!');
      await verifyFix();
    }
    
  } catch (error) {
    console.error('❌ Error executing fix:', error);
    console.log('📋 Manual steps:');
    console.log('1. Go to your Supabase SQL Editor');
    console.log('2. Copy the content from quick-fix-9-1.sql'); 
    console.log('3. Run it manually');
  }
}

async function executeStepByStep() {
  console.log('🔧 Executing step-by-step fix...');
  
  try {
    // Step 1: Find the requirement
    const { data: requirements, error: reqError } = await supabase
      .from('requirements_library')
      .select(`
        id,
        control_id,
        title,
        standards_library!inner(name)
      `)
      .eq('control_id', '9.1')
      .ilike('standards_library.name', '%27001%')
      .ilike('title', '%Monitoring, measurement, analysis and evaluation%');
    
    if (reqError || !requirements || requirements.length === 0) {
      throw new Error('Could not find ISO/IEC 27001 9.1 requirement');
    }
    
    const requirement = requirements[0];
    console.log('✅ Found requirement:', requirement.title);
    
    // Step 2: Find Governance category
    const { data: govCategory, error: catError } = await supabase
      .from('unified_compliance_categories')
      .select('id')
      .eq('name', 'Governance & Leadership')
      .single();
    
    if (catError || !govCategory) {
      throw new Error('Could not find Governance & Leadership category');
    }
    
    console.log('✅ Found Governance & Leadership category');
    
    // Step 3: Find or create unified requirement
    let { data: unifiedReq, error: unifiedError } = await supabase
      .from('unified_requirements')
      .select('id')
      .eq('category_id', govCategory.id)
      .limit(1)
      .single();
    
    if (unifiedError && unifiedError.code === 'PGRST116') {
      // Create it
      const { data: newUnified, error: createError } = await supabase
        .from('unified_requirements')
        .insert({
          category_id: govCategory.id,
          title: 'Governance & Leadership Requirements',
          description: 'Governance controls including monitoring and evaluation'
        })
        .select()
        .single();
      
      if (createError) throw createError;
      unifiedReq = newUnified;
      console.log('✅ Created governance unified requirement');
    }
    
    // Step 4: Delete old mappings
    const { error: deleteError } = await supabase
      .from('unified_requirement_mappings')
      .delete()
      .eq('requirement_id', requirement.id);
    
    if (deleteError) {
      console.warn('⚠️  Could not delete old mappings:', deleteError.message);
    }
    
    // Step 5: Create new mapping
    const { error: insertError } = await supabase
      .from('unified_requirement_mappings')
      .insert({
        requirement_id: requirement.id,
        unified_requirement_id: unifiedReq.id
      });
    
    if (insertError) {
      throw insertError;
    }
    
    console.log('✅ SUCCESS: Created new mapping to Governance & Leadership');
    await verifyFix();
    
  } catch (error) {
    console.error('❌ Step-by-step execution failed:', error);
    throw error;
  }
}

async function verifyFix() {
  console.log('🔍 Verifying the fix...');
  
  try {
    const { data: verification, error } = await supabase
      .from('unified_requirement_mappings')
      .select(`
        requirement:requirements_library(
          control_id,
          title,
          standards_library(name)
        ),
        unified_requirement:unified_requirements(
          unified_compliance_categories(name)
        )
      `)
      .eq('requirement.control_id', '9.1');
    
    if (error) {
      console.error('Verification query failed:', error);
      return;
    }
    
    const iso27001_9_1 = verification?.find(v => 
      v.requirement?.standards_library?.name?.includes('27001') &&
      v.requirement?.control_id === '9.1'
    );
    
    if (iso27001_9_1) {
      const categoryName = iso27001_9_1.unified_requirement?.unified_compliance_categories?.name;
      console.log(`🎉 VERIFICATION SUCCESS: ISO/IEC 27001 9.1 is now in "${categoryName}" category`);
      
      if (categoryName === 'Governance & Leadership') {
        console.log('✅ Fix confirmed! ISO/IEC 27001 9.1 is correctly mapped to Governance & Leadership');
      } else {
        console.log(`⚠️  Warning: Expected "Governance & Leadership" but found "${categoryName}"`);
      }
    } else {
      console.log('❌ Could not verify the mapping');
    }
    
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

// Run the fix
fixISO27001_9_1_Mapping().then(() => {
  console.log('🎉 Database fix process completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fix process failed:', error);
  process.exit(1);
});