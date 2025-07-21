import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testTableStructure() {
  // Try to get one record to see the structure
  const { data, error } = await supabase
    .from('requirements_library')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Table structure (first record):');
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
      console.log('Sample data:', data[0]);
    } else {
      console.log('No data found');
    }
  }
}

testTableStructure();