import { supabase } from '../lib/supabase';
import { EnhancedUnifiedRequirementsGenerator } from '../services/compliance/EnhancedUnifiedRequirementsGenerator';
import { FrameworkMapping } from '../types/compliance';

export class RequirementExtractionDebugger {
  private generator = new EnhancedUnifiedRequirementsGenerator();

  async runCompleteTest(): Promise<void> {
    console.log('🔍 STARTING COMPREHENSIVE REQUIREMENT EXTRACTION DEBUG TEST');
    console.log('='.repeat(80));

    try {
      // Test 1: Direct database query
      await this.testDirectDatabaseQuery();
      
      // Test 2: Framework mapping resolution
      await this.testFrameworkMapping();
      
      // Test 3: Content processing pipeline
      await this.testContentProcessing();
      
      // Test 4: Final output generation
      await this.testFinalOutput();

    } catch (error) {
      console.error('❌ DEBUG TEST FAILED:', error);
    }
  }

  private async testDirectDatabaseQuery(): Promise<void> {
    console.log('\n📊 TEST 1: Direct Database Query');
    console.log('-'.repeat(40));

    try {
      // Query CIS IG3 requirements directly
      const { data, error } = await supabase
        .from('requirements_library')
        .select('*')
        .ilike('standard_name', '%CIS Controls%')
        .ilike('implementation_group', '%IG3%')
        .limit(5);

      if (error) {
        console.error('❌ Database query error:', error);
        return;
      }

      console.log(`✅ Found ${data?.length || 0} CIS IG3 requirements`);
      
      if (data && data.length > 0) {
        const firstReq = data[0];
        console.log('\n📋 Sample requirement:');
        console.log('ID:', firstReq.id);
        console.log('Standard:', firstReq.standard_name);
        console.log('Control ID:', firstReq.control_id);
        console.log('Title:', firstReq.title);
        console.log('Description length:', typeof firstReq.description === 'string' ? firstReq.description.length : 0);
        console.log('First 200 chars of description:', 
          (typeof firstReq.description === 'string' ? firstReq.description.substring(0, 200) + '...' : 'No description'));
        
        // Check for technical details in description
        const hasFileExtensions = /\.\w{2,4}\b/g.test(firstReq.description || '');
        const hasPercentages = /\d+%/g.test(firstReq.description || '');
        const hasTimeframes = /\d+\s*(day|hour|minute|month|year)/gi.test(firstReq.description || '');
        
        console.log('\n🔍 Technical Detail Analysis:');
        console.log('Has file extensions (.dll, .exe, etc.):', hasFileExtensions);
        console.log('Has percentages:', hasPercentages);
        console.log('Has timeframes:', hasTimeframes);
        
        if (hasFileExtensions) {
          const extensions = (firstReq.description || '').match(/\.\w{2,4}\b/g);
          console.log('Found extensions:', extensions);
        }
      } else {
        console.log('⚠️  No CIS IG3 requirements found in database');
      }
    } catch (error) {
      console.error('❌ Database test failed:', error);
    }
  }

  private async testFrameworkMapping(): Promise<void> {
    console.log('\n🗺️  TEST 2: Framework Mapping Resolution');
    console.log('-'.repeat(40));

    try {
      const testMappings: FrameworkMapping[] = [
        {
          framework: 'cisControls',
          level: 'ig3',
          categories: ['Inventory and Control of Enterprise Assets']
        },
        {
          framework: 'iso27001',
          level: 'all',
          categories: ['Access Control']
        }
      ];

      for (const mapping of testMappings) {
        console.log(`\n🔍 Testing mapping: ${mapping.framework} (${mapping.level})`);
        
        // Test the private method through the generator
        const requirements = await this.generator.getMappedRequirements(
          mapping.categories,
          [mapping]
        );

        console.log(`✅ Retrieved ${requirements.length} requirements`);
        
        if (requirements.length > 0) {
          const sample = requirements[0];
          console.log('Sample requirement ID:', sample.id);
          console.log('Standard:', sample.standard_name);
          console.log('Description preview:', 
            sample.description?.substring(0, 150) + '...' || 'No description');
        }
      }
    } catch (error) {
      console.error('❌ Framework mapping test failed:', error);
    }
  }

  private async testContentProcessing(): Promise<void> {
    console.log('\n⚙️  TEST 3: Content Processing Pipeline');
    console.log('-'.repeat(40));

    try {
      // Get some real requirements
      const { data: sampleReqs } = await supabase
        .from('requirements_library')
        .select('*')
        .limit(3);

      if (!sampleReqs || sampleReqs.length === 0) {
        console.log('⚠️  No requirements found for processing test');
        return;
      }

      for (const req of sampleReqs) {
        console.log(`\n🔍 Processing requirement: ${req.control_id}`);
        console.log('Original description length:', req.description?.length || 0);

        // Test technical detail extraction (this would normally be private)
        const description = req.description || '';
        
        // Simulate the extraction logic from the generator
        const details: string[] = [];

        // File extensions
        const fileExtensions = description.match(/\.\w{2,4}\b/g);
        if (fileExtensions && fileExtensions.length > 0) {
          details.push(`including ${[...new Set(fileExtensions)].join(', ')} files`);
        }

        // Percentages
        const percentages = description.match(/\d+%/g);
        if (percentages && percentages.length > 0) {
          details.push(`with thresholds of ${percentages.join(', ')}`);
        }

        // Time periods
        const timePeriods = description.match(/\d+\s*(day|hour|minute|month|year)s?/gi);
        if (timePeriods && timePeriods.length > 0) {
          details.push(`over ${timePeriods.join(', ')} periods`);
        }

        // Technical terms
        const techTerms = description.match(/\b(authentication|encryption|firewall|monitoring|logging|backup|patch|vulnerability|malware|incident)\b/gi);
        if (techTerms && techTerms.length > 0) {
          const uniqueTerms = [...new Set(techTerms.map(t => t.toLowerCase()))];
          details.push(`covering ${uniqueTerms.join(', ')}`);
        }

        console.log('Extracted details:', details.length);
        details.forEach((detail, index) => {
          console.log(`  ${index + 1}. ${detail}`);
        });

        if (details.length === 0) {
          console.log('⚠️  No technical details extracted from this requirement');
        }
      }
    } catch (error) {
      console.error('❌ Content processing test failed:', error);
    }
  }

  private async testFinalOutput(): Promise<void> {
    console.log('\n📤 TEST 4: Final Output Generation');
    console.log('-'.repeat(40));

    try {
      // Test the complete generator workflow
      const testMappings: FrameworkMapping[] = [
        {
          framework: 'cisControls',
          level: 'ig3',
          categories: ['Inventory and Control of Enterprise Assets']
        }
      ];

      console.log('🚀 Running complete generator workflow...');
      
      const result = await this.generator.generateRequirements(
        testMappings,
        ['Inventory and Control of Enterprise Assets']
      );

      console.log('\n📋 Generator Results:');
      console.log('Success:', result.success);
      console.log('Content items:', result.content?.length || 0);
      
      if (result.content && result.content.length > 0) {
        console.log('\n📝 Sample generated content:');
        result.content.slice(0, 2).forEach((content, index) => {
          console.log(`\n--- Content Item ${index + 1} ---`);
          console.log('Length:', content.length);
          console.log('Preview:', content.substring(0, 300) + '...');
          
          // Check if technical details made it through
          const hasDetails = /\.(dll|exe|ocx|so|jar)\b/i.test(content) ||
                           /\d+%/.test(content) ||
                           /\d+\s*(day|hour|minute)/i.test(content);
          
          console.log('Contains technical details:', hasDetails);
          
          if (hasDetails) {
            console.log('✅ Technical details preserved in output');
          } else {
            console.log('❌ Technical details missing in output');
          }
        });
      }

      if (result.errors && result.errors.length > 0) {
        console.log('\n❌ Generation errors:');
        result.errors.forEach(error => console.log('  -', error));
      }

    } catch (error) {
      console.error('❌ Final output test failed:', error);
    }
  }

  // Quick test method for immediate debugging
  async quickDatabaseTest(): Promise<void> {
    console.log('🚀 QUICK DATABASE TEST');
    
    try {
      const { data, error } = await supabase
        .from('requirements_library')
        .select('id, control_id, title, description')
        .contains('description', '.dll')
        .limit(3);

      if (error) {
        console.error('Query error:', error);
        return;
      }

      console.log(`Found ${data?.length || 0} requirements containing '.dll'`);
      
      if (data && data.length > 0) {
        data.forEach(req => {
          console.log(`\n📋 ${req.control_id}: ${req.title}`);
          console.log('Description contains technical details:', 
            /\.(dll|exe|ocx)/i.test(req.description || ''));
        });
      }
    } catch (error) {
      console.error('Quick test failed:', error);
    }
  }
}

// Export for console debugging
(window as any).debugRequirementExtraction = async () => {
  const debugInstance = new RequirementExtractionDebugger();
  await debugInstance.runCompleteTest();
};

(window as any).quickDbTest = async () => {
  const debugInstance = new RequirementExtractionDebugger();
  await debugInstance.quickDatabaseTest();
};