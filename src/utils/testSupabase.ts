import { supabase } from '@/lib/supabase';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    console.log('Session check:', { session, sessionError });
    
    // Test 2: Try to fetch standards
    const { data: standards, error: standardsError } = await supabase
      .from('standards_library')
      .select('*')
      .eq('is_active', true);
      
    console.log('Standards query result:', { standards, standardsError });
    
    // Test 3: Check table permissions
    const { data: tableInfo, error: tableError } = await supabase
      .from('standards_library')
      .select('id')
      .limit(1);
      
    console.log('Table access test:', { tableInfo, tableError });
    
    return { standards, session };
  } catch (error) {
    console.error('Test failed:', error);
    return { error };
  }
}

// Make it available on window for testing
if (typeof window !== 'undefined') {
  (window as any).testSupabase = testSupabaseConnection;
}