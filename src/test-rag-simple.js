/**
 * Simple test for RAG ingestion
 */

import { supabase } from './lib/supabase.js';

async function testRAGIngestion() {
  console.log('🚀 Testing RAG Knowledge System...');
  
  try {
    // Test 1: Check if tables exist
    console.log('\n📋 Checking database tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('knowledge_sources')
      .select('count(*)')
      .limit(1);
    
    if (tablesError) {
      console.error('❌ Database tables not accessible:', tablesError.message);
      return;
    }
    
    console.log('✅ Database tables accessible');
    
    // Test 2: Check existing sources
    console.log('\n📊 Checking existing knowledge sources...');
    const { data: sources, error: sourcesError } = await supabase
      .from('knowledge_sources')
      .select('*');
    
    if (sourcesError) {
      console.error('❌ Failed to fetch sources:', sourcesError.message);
      return;
    }
    
    console.log(`✅ Found ${sources?.length || 0} knowledge sources`);
    
    if (sources && sources.length > 0) {
      sources.forEach(source => {
        console.log(`   • ${source.title} (${source.domain}) - Authority: ${source.authority_score}/10`);
      });
    }
    
    // Test 3: Check content chunks
    console.log('\n📝 Checking knowledge content...');
    const { data: content, error: contentError } = await supabase
      .from('knowledge_content')
      .select('count(*)')
      .limit(1);
    
    if (contentError) {
      console.error('❌ Failed to check content:', contentError.message);
      return;
    }
    
    console.log('✅ Knowledge content table accessible');
    
    // Test 4: Check generation history
    console.log('\n📈 Checking RAG generation history...');
    const { data: history, error: historyError } = await supabase
      .from('rag_generation_history')
      .select('count(*)')
      .limit(1);
    
    if (historyError) {
      console.error('❌ Failed to check history:', historyError.message);
      return;
    }
    
    console.log('✅ RAG generation history table accessible');
    
    console.log('\n🎉 RAG Knowledge System is ready!');
    console.log('\nNext steps:');
    console.log('1. Visit /admin/semantic-mapping in your browser');
    console.log('2. Click on "Knowledge Enhancement RAG" tab');
    console.log('3. Add new knowledge sources and test ingestion');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRAGIngestion();