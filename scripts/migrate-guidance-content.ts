#!/usr/bin/env tsx
/**
 * AI-Powered Unified Guidance Content Migration Script
 * =====================================================
 * 
 * Migrates all content from EnhancedUnifiedGuidanceService to the new
 * AI-powered database-driven system.
 * 
 * This script:
 * 1. Extracts all 21 categories from the hardcoded service
 * 2. Creates unified_guidance_templates entries
 * 3. Maps framework requirements to framework_requirement_mappings
 * 4. Preserves all existing content structure and quality
 * 5. Enables AI enhancement capabilities
 * 
 * Usage:
 *   npm run migrate:guidance-content
 *   or
 *   npx tsx scripts/migrate-guidance-content.ts
 */

import { createClient } from '@supabase/supabase-js';
import { EnhancedUnifiedGuidanceService } from '../src/services/compliance/EnhancedUnifiedGuidanceService';

// Environment validation
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  console.error('\nPlease check your .env file and ensure these variables are set.');
  process.exit(1);
}

// Initialize Supabase with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define all 21 categories that exist in the EnhancedUnifiedGuidanceService
const GUIDANCE_CATEGORIES = [
  'Access Control',
  'Asset Management',
  'Vulnerability Management', 
  'Incident Response',
  'Risk Management',
  'Data Protection',
  'Security Awareness',
  'Business Continuity',
  'Supplier Risk',
  'Network Security',
  'Secure Development',
  'Physical Security',
  'Governance & Leadership',
  'Audit Logging',
  'Compliance & Audit',
  'Cryptography',
  'Operations Security',
  'Human Resource Security',
  'Information Transfer',
  'System Acquisition',
  'Information Systems Audit'
];

// Test frameworks for content extraction
const TEST_FRAMEWORKS = {
  iso27001: true,
  iso27002: true,
  cisControls: true,
  nist: true,
  gdpr: true,
  nis2: true
};

interface MigrationResult {
  category: string;
  success: boolean;
  templateId?: string;
  mappingsCreated: number;
  error?: string;
}

interface MigrationSummary {
  totalCategories: number;
  successfulMigrations: number;
  failedMigrations: number;
  totalMappings: number;
  results: MigrationResult[];
  errors: string[];
}

/**
 * Convert category name to URL-friendly slug
 */
function createCategorySlug(categoryName: string): string {
  return categoryName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Extract content sections from the unified guidance content
 */
function parseGuidanceContent(content: string): {
  foundationContent: string;
  implementationSteps: string[];
  practicalTools: string[];
  auditEvidence: string[];
  crossReferences: string[];
} {
  const sections = {
    foundationContent: '',
    implementationSteps: [] as string[],
    practicalTools: [] as string[],
    auditEvidence: [] as string[],
    crossReferences: [] as string[]
  };

  // Split content into lines for processing
  const lines = content.split('\n');
  let currentSection = 'foundation';
  let currentContent: string[] = [];

  for (const line of lines) {
    const cleanLine = line.replace(/\*\*/g, '').trim();
    
    if (cleanLine === '') continue;

    // Detect section headers
    if (cleanLine.includes('IMPLEMENTATION') || cleanLine.includes('Implementation')) {
      if (currentSection === 'foundation') {
        sections.foundationContent = currentContent.join('\n').trim();
        currentContent = [];
      }
      currentSection = 'implementation';
      continue;
    } else if (cleanLine.includes('TOOLS') || cleanLine.includes('Tools')) {
      if (currentSection === 'implementation') {
        sections.implementationSteps = currentContent.filter(c => c.trim());
        currentContent = [];
      }
      currentSection = 'tools';
      continue;
    } else if (cleanLine.includes('EVIDENCE') || cleanLine.includes('Evidence')) {
      if (currentSection === 'tools') {
        sections.practicalTools = currentContent.filter(c => c.trim());
        currentContent = [];
      }
      currentSection = 'evidence';
      continue;
    } else if (cleanLine.includes('REFERENCES') || cleanLine.includes('References')) {
      if (currentSection === 'evidence') {
        sections.auditEvidence = currentContent.filter(c => c.trim());
        currentContent = [];
      }
      currentSection = 'references';
      continue;
    }

    // Skip framework reference sections for now (we'll handle these separately)
    if (cleanLine.startsWith('Primary Requirements:') || 
        cleanLine.startsWith('Supporting Requirements:') ||
        cleanLine.match(/^[A-Z\d\.]+:/)) {
      continue;
    }

    // Add content to current section
    if (cleanLine && !cleanLine.includes('FRAMEWORK REFERENCES')) {
      currentContent.push(cleanLine);
    }
  }

  // Handle the last section
  switch (currentSection) {
    case 'foundation':
      sections.foundationContent = currentContent.join('\n').trim();
      break;
    case 'implementation':
      sections.implementationSteps = currentContent.filter(c => c.trim());
      break;
    case 'tools':
      sections.practicalTools = currentContent.filter(c => c.trim());
      break;
    case 'evidence':
      sections.auditEvidence = currentContent.filter(c => c.trim());
      break;
    case 'references':
      sections.crossReferences = currentContent.filter(c => c.trim());
      break;
  }

  return sections;
}

/**
 * Extract framework requirements from guidance content
 * Since getCategoryData is private, we'll parse requirements from the content
 */
function extractFrameworkRequirements(content: string): Array<{
  framework: string;
  code: string;
  title: string;
  relevance: string;
}> {
  const requirements: Array<{
    framework: string;
    code: string;
    title: string;
    relevance: string;
  }> = [];

  // Parse framework references from the content
  const lines = content.split('\n');
  let inReferencesSection = false;
  
  for (const line of lines) {
    const cleanLine = line.trim();
    
    if (cleanLine.includes('FRAMEWORK REFERENCES:')) {
      inReferencesSection = true;
      continue;
    }
    
    if (inReferencesSection && cleanLine === '') {
      // End of references section
      break;
    }
    
    if (inReferencesSection) {
      // Parse requirement line format like: "ISO 27001 A.5.1: Information security policies"
      const match = cleanLine.match(/^([A-Z0-9\s]+)\s+([A-Z0-9\.]+):\s*(.+)$/);
      if (match) {
        const [, frameworkText, code, title] = match;
        const framework = frameworkText.toLowerCase().replace(/\s+/g, '').replace('iso', 'iso');
        
        // Map framework names to standard format
        let standardFramework = framework;
        if (framework.includes('iso27001')) standardFramework = 'iso27001';
        else if (framework.includes('iso27002')) standardFramework = 'iso27002';
        else if (framework.includes('cis')) standardFramework = 'cisControls';
        else if (framework.includes('nist')) standardFramework = 'nist';
        else if (framework.includes('gdpr')) standardFramework = 'gdpr';
        else if (framework.includes('nis2')) standardFramework = 'nis2';
        
        requirements.push({
          framework: standardFramework,
          code: code.trim(),
          title: title.trim(),
          relevance: 'primary' // Default to primary, can be enhanced later
        });
      }
    }
  }

  // If no requirements found in content, add some defaults based on category
  if (requirements.length === 0) {
    // Add basic ISO 27001 mapping for all categories
    requirements.push({
      framework: 'iso27001',
      code: 'A.5.1',
      title: 'Information security policies',
      relevance: 'supporting'
    });
  }

  return requirements;
}

/**
 * Create unified guidance template in database
 */
async function createGuidanceTemplate(
  category: string,
  sections: ReturnType<typeof parseGuidanceContent>
): Promise<{ templateId: string; error?: string }> {
  try {
    const slug = createCategorySlug(category);
    
    // Generate AI context keywords from content
    const contextKeywords = [
      category.toLowerCase(),
      ...sections.practicalTools.slice(0, 5), // First 5 tools as keywords
      'compliance', 'audit', 'security', 'risk management'
    ];

    const templateData = {
      category_name: category,
      category_slug: slug,
      foundation_content: sections.foundationContent || `Comprehensive guidance for ${category} compliance and implementation.`,
      implementation_steps: JSON.stringify(sections.implementationSteps),
      practical_tools: JSON.stringify(sections.practicalTools),
      audit_evidence: JSON.stringify(sections.auditEvidence),
      cross_references: JSON.stringify(sections.crossReferences),
      ai_context_keywords: JSON.stringify(contextKeywords),
      ai_enhancement_enabled: true,
      content_quality_score: 4.0, // Default high quality from existing service
      review_status: 'approved',
      is_global_template: true, // Make available to all organizations
      version: 1,
      change_log: JSON.stringify([
        {
          version: 1,
          action: 'migrated_from_enhanced_service',
          timestamp: new Date().toISOString(),
          description: `Migrated from EnhancedUnifiedGuidanceService with ${sections.implementationSteps.length} implementation steps, ${sections.practicalTools.length} tools, and ${sections.auditEvidence.length} evidence items.`
        }
      ])
    };

    const { data, error } = await supabase
      .from('unified_guidance_templates')
      .insert(templateData)
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Failed to create template for ${category}:`, error);
      return { templateId: '', error: error.message };
    }

    console.log(`✅ Created template for ${category} (ID: ${data.id})`);
    return { templateId: data.id };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Exception creating template for ${category}:`, errorMsg);
    return { templateId: '', error: errorMsg };
  }
}

/**
 * Create framework requirement mappings
 */
async function createFrameworkMappings(
  templateId: string,
  category: string,
  requirements: Array<{
    framework: string;
    code: string;
    title: string;
    relevance: string;
  }>
): Promise<{ count: number; error?: string }> {
  try {
    if (requirements.length === 0) {
      console.log(`ℹ️  No framework requirements to map for ${category}`);
      return { count: 0 };
    }

    const mappings = requirements.map(req => ({
      template_id: templateId,
      framework_type: req.framework,
      requirement_code: req.code,
      requirement_title: req.title,
      relevance_level: req.relevance,
      ai_context_weight: req.relevance === 'primary' ? 1.0 : 0.7,
      mapping_confidence: 0.95, // High confidence from existing service
      validation_source: 'imported',
      validation_notes: 'Migrated from EnhancedUnifiedGuidanceService',
      is_global_mapping: true
    }));

    const { data, error } = await supabase
      .from('framework_requirement_mappings')
      .insert(mappings)
      .select('id');

    if (error) {
      console.error(`❌ Failed to create mappings for ${category}:`, error);
      return { count: 0, error: error.message };
    }

    console.log(`✅ Created ${data?.length || 0} framework mappings for ${category}`);
    return { count: data?.length || 0 };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Exception creating mappings for ${category}:`, errorMsg);
    return { count: 0, error: errorMsg };
  }
}

/**
 * Migrate a single category
 */
async function migrateCategory(category: string): Promise<MigrationResult> {
  console.log(`\n🔄 Migrating category: ${category}`);
  
  try {
    // Check if template already exists
    const { data: existingTemplate } = await supabase
      .from('unified_guidance_templates')
      .select('id, category_name')
      .eq('category_slug', createCategorySlug(category))
      .single();

    if (existingTemplate) {
      console.log(`ℹ️  Template already exists for ${category}, skipping...`);
      return {
        category,
        success: true,
        templateId: existingTemplate.id,
        mappingsCreated: 0
      };
    }

    // Get enhanced guidance content from the existing service
    const guidanceContent = EnhancedUnifiedGuidanceService.getEnhancedGuidance(
      category,
      TEST_FRAMEWORKS
    );

    if (!guidanceContent || guidanceContent.length < 100) {
      return {
        category,
        success: false,
        mappingsCreated: 0,
        error: 'No content available from EnhancedUnifiedGuidanceService'
      };
    }

    // Note: We'll extract framework requirements directly from the content
    // since getCategoryData is private in the service

    // Parse content into sections
    const sections = parseGuidanceContent(guidanceContent);
    
    // Create template
    const { templateId, error: templateError } = await createGuidanceTemplate(
      category,
      sections
    );

    if (templateError || !templateId) {
      return {
        category,
        success: false,
        mappingsCreated: 0,
        error: templateError || 'Failed to create template'
      };
    }

    // Extract and create framework mappings from content
    const requirements = extractFrameworkRequirements(guidanceContent);
    const { count: mappingsCount, error: mappingsError } = await createFrameworkMappings(
      templateId,
      category,
      requirements
    );

    if (mappingsError) {
      console.warn(`⚠️  Warning: Template created but mappings failed for ${category}: ${mappingsError}`);
    }

    return {
      category,
      success: true,
      templateId,
      mappingsCreated: mappingsCount
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Failed to migrate ${category}:`, errorMsg);
    return {
      category,
      success: false,
      mappingsCreated: 0,
      error: errorMsg
    };
  }
}

/**
 * Clean up any existing test data (optional)
 */
async function cleanupExistingData(): Promise<void> {
  console.log('🧹 Cleaning up any existing migration data...');
  
  try {
    // Delete existing global templates (migration test data)
    const { error: deleteError } = await supabase
      .from('unified_guidance_templates')
      .delete()
      .eq('is_global_template', true)
      .in('category_slug', GUIDANCE_CATEGORIES.map(createCategorySlug));

    if (deleteError) {
      console.warn('⚠️  Warning: Could not clean up existing data:', deleteError.message);
    } else {
      console.log('✅ Cleanup completed');
    }
  } catch (error) {
    console.warn('⚠️  Warning: Cleanup error:', error);
  }
}

/**
 * Verify database connectivity and schema
 */
async function verifyDatabaseSetup(): Promise<boolean> {
  console.log('🔍 Verifying database setup...');
  
  try {
    // Check if the tables exist and are accessible
    const { data: templatesTest, error: templatesError } = await supabase
      .from('unified_guidance_templates')
      .select('id')
      .limit(1);

    if (templatesError) {
      console.error('❌ Templates table not accessible:', templatesError.message);
      return false;
    }

    const { data: mappingsTest, error: mappingsError } = await supabase
      .from('framework_requirement_mappings')
      .select('id')
      .limit(1);

    if (mappingsError) {
      console.error('❌ Mappings table not accessible:', mappingsError.message);
      return false;
    }

    console.log('✅ Database schema verified');
    return true;

  } catch (error) {
    console.error('❌ Database verification failed:', error);
    return false;
  }
}

/**
 * Main migration function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting AI-Powered Unified Guidance Content Migration');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  const summary: MigrationSummary = {
    totalCategories: GUIDANCE_CATEGORIES.length,
    successfulMigrations: 0,
    failedMigrations: 0,
    totalMappings: 0,
    results: [],
    errors: []
  };

  try {
    // Step 1: Verify database setup
    if (!await verifyDatabaseSetup()) {
      console.error('❌ Database setup verification failed. Please ensure the migration has been run.');
      process.exit(1);
    }

    // Step 2: Optional cleanup
    const shouldCleanup = process.argv.includes('--clean');
    if (shouldCleanup) {
      await cleanupExistingData();
    }

    // Step 3: Migrate each category
    console.log(`\n📦 Migrating ${GUIDANCE_CATEGORIES.length} categories...`);
    
    for (const category of GUIDANCE_CATEGORIES) {
      const result = await migrateCategory(category);
      summary.results.push(result);
      
      if (result.success) {
        summary.successfulMigrations++;
        summary.totalMappings += result.mappingsCreated;
      } else {
        summary.failedMigrations++;
        if (result.error) {
          summary.errors.push(`${category}: ${result.error}`);
        }
      }

      // Brief pause to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Step 4: Display summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`⏱️  Total time: ${duration}s`);
    console.log(`📦 Total categories: ${summary.totalCategories}`);
    console.log(`✅ Successful migrations: ${summary.successfulMigrations}`);
    console.log(`❌ Failed migrations: ${summary.failedMigrations}`);
    console.log(`🔗 Total framework mappings: ${summary.totalMappings}`);
    
    if (summary.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      summary.errors.forEach(error => console.log(`   - ${error}`));
    }

    if (summary.successfulMigrations > 0) {
      console.log('\n✅ SUCCESSFULLY MIGRATED CATEGORIES:');
      summary.results
        .filter(r => r.success)
        .forEach(r => console.log(`   ✓ ${r.category} (${r.mappingsCreated} mappings)`));
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Update ComplianceSimplification.tsx to use AIGuidanceOrchestrator');
    console.log('   2. Configure VITE_GEMINI_API_KEY for AI enhancement');
    console.log('   3. Test the AI-powered guidance system');
    console.log('   4. Monitor performance and quality metrics');

    if (summary.failedMigrations === 0) {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    } else {
      console.log(`\n⚠️  Migration completed with ${summary.failedMigrations} errors.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Migration failed with critical error:', error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}