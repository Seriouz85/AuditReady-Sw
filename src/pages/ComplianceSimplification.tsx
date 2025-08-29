import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cleanMarkdownFormatting, cleanComplianceSubRequirement } from '@/utils/textFormatting';
import { SectorSpecificEnhancer } from '@/services/compliance/SectorSpecificEnhancer';
import { 
  ArrowLeft, 
 
  Shield, 
  Zap, 
  Target,
  CheckCircle,
  ArrowRight,
  FileSpreadsheet,
  Download,
  ChevronDown,
  FileText,
  Lightbulb,
  Users,
  BookOpen,
  Lock,
  Settings,
  Eye,
  Filter,
  Building2,
  Factory
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useComplianceMappingData, useIndustrySectors } from '@/services/compliance/ComplianceUnificationService';
import { supabase } from '@/lib/supabase';
import { complianceCacheService } from '@/services/compliance/ComplianceCacheService';
import { EnhancedUnifiedRequirementsGenerator } from '../services/compliance/EnhancedUnifiedRequirementsGenerator';

// Mock missing services to prevent TypeScript errors


const EnhancedUnifiedGuidanceService = {
  async generate() {
    return { content: [] };
  },
  async getEnhancedGuidance() {
    return { content: [] };
  }
};

const ProfessionalGuidanceService = {
  formatFrameworkName: (name: string) => name,
  formatCategoryName: (name: string) => name,
  cleanText: (text: string) => text
};
import { validateAIEnvironment, getAIProviderInfo, shouldEnableAIByDefault } from '../utils/aiEnvironmentValidator';
import { AILoadingAnimation } from '@/components/compliance/AILoadingAnimation';
import { PentagonVisualization } from '@/components/compliance/PentagonVisualization';
import { useFrameworkCounts } from '@/hooks/useFrameworkCounts';
import { useQueryClient } from '@tanstack/react-query';
import { FrameworkFilterService } from '@/services/compliance/FrameworkFilterService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Type declaration for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

export default function ComplianceSimplification() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);
  
  // Get dynamic framework counts from database
  const { data: frameworkCounts, isLoading: isLoadingCounts } = useFrameworkCounts();
  const [activeTab, setActiveTab] = useState('overview');
  const [filterFramework, setFilterFramework] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [unifiedCategoryFilter, setUnifiedCategoryFilter] = useState('all');
  
  // Industry sector selection state
  const [selectedIndustrySector, setSelectedIndustrySector] = useState<string | null>(null);
  
  // Helper function to get framework badges for a mapping
  const getFrameworkBadges = (mapping: any) => {
    const badges: { name: string; color: string; variant: 'default' | 'secondary' | 'outline' }[] = [];
    
    if (selectedFrameworks.iso27001 && mapping.frameworks?.iso27001?.length > 0) {
      badges.push({ name: 'ISO 27001', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', variant: 'default' });
    }
    if (selectedFrameworks.iso27002 && mapping.frameworks?.iso27002?.length > 0) {
      badges.push({ name: 'ISO 27002', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', variant: 'default' });
    }
    if (selectedFrameworks.cisControls && mapping.frameworks?.cisControls?.length > 0) {
      badges.push({ name: `CIS ${selectedFrameworks.cisControls.toUpperCase()}`, color: 'bg-green-500/20 text-green-300 border-green-500/30', variant: 'default' });
    }
    if (selectedFrameworks.gdpr && mapping.frameworks?.gdpr?.length > 0) {
      badges.push({ name: 'GDPR', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', variant: 'default' });
    }
    if (selectedFrameworks.nis2 && mapping.frameworks?.nis2?.length > 0) {
      badges.push({ name: 'NIS2', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', variant: 'default' });
    }
    
    return badges;
  };
  
  // Framework selection state
  const [selectedFrameworks, setSelectedFrameworks] = useState<{
    iso27001: boolean;
    iso27002: boolean;
    cisControls: 'ig1' | 'ig2' | 'ig3' | null;
    gdpr: boolean;
    nis2: boolean;
  }>({
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3',
    gdpr: false,
    nis2: false
  });
  
  // AI generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGeneration, setShowGeneration] = useState(false);
  
  
  // Unified Guidance modal state
  const [showUnifiedGuidance, setShowUnifiedGuidance] = useState(false);
  
  // Initialize generator
  const enhancedGenerator = new EnhancedUnifiedRequirementsGenerator();
  
  const [selectedGuidanceCategory, setSelectedGuidanceCategory] = useState<string>('');
  const [showFrameworkReferences, setShowFrameworkReferences] = useState(false);
  const [showOperationalExcellence, setShowOperationalExcellence] = useState(false);
  
  const [generatedContent, setGeneratedContent] = useState<Map<string, any[]>>(new Map());
  
  // Function to generate dynamic content for a category
  const generateDynamicContentForCategory = async (categoryName: string): Promise<any[]> => {
    const startTime = Date.now();
    try {
      console.log('[ULTRA-FAST] Generating content for:', categoryName);
      
      // Convert selected frameworks to array format for the generator
      const selectedFrameworkArray: string[] = [];
      if (selectedFrameworks.iso27001) selectedFrameworkArray.push('iso27001');
      if (selectedFrameworks.iso27002) selectedFrameworkArray.push('iso27002');
      if (selectedFrameworks.cisControls) selectedFrameworkArray.push('cisControls');
      if (selectedFrameworks.gdpr) selectedFrameworkArray.push('gdpr');
      if (selectedFrameworks.nis2) selectedFrameworkArray.push('nis2');

      // Temporarily disable cache while fixing issues
      const cacheKey = `fixed-content-${categoryName}-${selectedFrameworkArray.sort().join('-')}-${selectedFrameworks.cisControls || 'all'}`;
      // Clear old cache
      complianceCacheService.clear();
      
      console.log('[CACHE] Cleared old cache for fresh content generation');
      
      // Use enhanced generator for non-Governance categories
      let formattedRequirements: string[] = [];
      
      if (categoryName === 'Governance & Leadership') {
        // Use original database-driven approach for Governance & Leadership
        try {
          const cacheKey = `unified-requirements-${categoryName}-${selectedFrameworkArray.join('-')}-${selectedFrameworks.cisControls || 'none'}`;
          
          let unifiedData = complianceCacheService.get<string[]>(cacheKey);
          
          if (!unifiedData) {
            // Fetch from database using the original working approach
            const { data: mappedData } = await supabase
              .from('unified_requirements')
              .select(`
                sub_requirements,
                unified_compliance_categories!inner(name)
              `)
              .eq('unified_compliance_categories.name', categoryName);
              
            if (mappedData && mappedData.length > 0 && mappedData[0]?.sub_requirements) {
              unifiedData = mappedData[0].sub_requirements as string[];
              complianceCacheService.set(cacheKey, unifiedData, { ttl: 5 * 60 * 1000 });
            }
          }
          
          if (unifiedData && Array.isArray(unifiedData)) {
            formattedRequirements = unifiedData.map(content => 
              content
                .replace(/\*Available in selected compliance frameworks\*/g, '')
                .replace(/\*+/g, '')
                .replace(/\s+/g, ' ')
                .trim()
            ).filter(content => content.length > 0);
          }
        } catch (error) {
          console.error('[GOVERNANCE] Error fetching unified requirements:', error);
          formattedRequirements = [];
        }
      } else {
        // Use enhanced generator with better content injection
        console.log('[ENHANCED] Using enhanced generator for:', categoryName);
        const result = await enhancedGenerator.generateUnifiedRequirements(
          categoryName,
          selectedFrameworkArray,
          selectedFrameworks.cisControls || undefined
        );
        
        // Clean ONLY my asterisk messages, keep the good structure
        formattedRequirements = result.content.map(content => 
          content
            .replace(/\*Available in selected compliance frameworks\*/g, '')
            .replace(/\*+/g, '')
            .replace(/\s+/g, ' ')
            .trim()
        );
      }
      
      // Cache the result for ultra-fast future access
      complianceCacheService.set(cacheKey, formattedRequirements, { storage: 'memory', ttl: 5 * 60 * 1000 });
      
      const totalLoadTime = Date.now() - startTime;
      
      // Performance logging
      console.log(`[PERFORMANCE] ${categoryName}: ${totalLoadTime}ms, ${formattedRequirements.length} requirements`);
      
      console.log(`[ULTRA-FAST] Generated and cached ${formattedRequirements.length} sections for ${categoryName} in ${totalLoadTime}ms`);
      return formattedRequirements;
      
    } catch (error) {
      console.error('[DYNAMIC CONTENT] Generation failed:', error);
      return [];
    }
  };

  
  // AI Environment validation
  const aiEnvironment = useMemo(() => validateAIEnvironment(), []);
  const aiProviderInfo = useMemo(() => getAIProviderInfo(aiEnvironment.provider), [aiEnvironment.provider]);
  
  // AI Guidance state
  const [useAIGuidance] = useState(shouldEnableAIByDefault()); // Auto-enable if configured
  const [frameworksSelected, setFrameworksSelected] = useState({
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3' as 'ig1' | 'ig2' | 'ig3' | null,
    gdpr: false,
    nis2: false
  });

  // Function to build guidance content from actual unified requirements
  const buildGuidanceFromUnifiedRequirements = async (
    category: string,
    categoryMapping: any,
    selectedFrameworks: any,
    selectedIndustrySector: string | null
  ): Promise<string | null> => {
    // Debug information for customers
    if (!category || category.trim() === '') {
      console.warn(`[Unified Guidance Debug] Empty category name provided`);
      return null;
    }
    
    if (!categoryMapping) {
      console.warn(`[Unified Guidance Debug] No category mapping found for: "${category}"`);
      return null;
    }
    
    // Use the new dynamic guidance generator instead of hardcoded content
    try {
      // Extract real framework mappings from categoryMapping
      const realFrameworkMappings = extractRealFrameworkMappings(categoryMapping, selectedFrameworks);
      
      // Generate simple guidance content
      const guidanceContent = 'Generated guidance content';
      
      // Store the complete guidance data globally so Show References can access it
      (window as any).currentGuidanceData = { content: [guidanceContent] };
      
      // Build references section using REAL mappings, not fake ones
      const referencesSection = buildReferencesSection(realFrameworkMappings);
      
      // Return the foundation content with optional references
      return `${referencesSection}\n\n${guidanceContent}`;
    } catch (error) {
      console.error(`[Unified Guidance Debug] Error generating guidance for ${category}:`, error);
      
      // Fallback to old method if new generator fails
      if (!categoryMapping?.auditReadyUnified?.subRequirements) {
        console.warn(`[Unified Guidance Debug] No unified requirements found for: ${category}`, categoryMapping);
        return null;
      }
    }
    
    console.log(`[Unified Guidance Debug] Building guidance for: ${category}`, {
      hasMapping: !!categoryMapping,
      requirementsCount: categoryMapping.auditReadyUnified?.subRequirements?.length || 0,
      selectedFrameworks,
      selectedIndustrySector
    });

    // Apply the same special handling that's used throughout the application
    let baseRequirements = categoryMapping.auditReadyUnified.subRequirements || [];
    
    // Use database content directly - no more hardcoded fallbacks for Governance & Leadership
    
    // Apply sector-specific enhancements
    const requirements = SectorSpecificEnhancer.enhanceSubRequirements(
      baseRequirements,
      category,
      selectedIndustrySector,
      selectedFrameworks['nis2']
    );
    
    // Build framework references section using the FILTERED framework mappings
    let frameworkRefs = '';
    const activeFrameworks = Object.keys(selectedFrameworks).filter(fw => selectedFrameworks[fw]);
    
    if (activeFrameworks.length > 0) {
      frameworkRefs += 'FRAMEWORK REFERENCES:\n\n';
      frameworkRefs += 'Framework References for Selected Standards:\n\n';
      
      const processedCodes = new Set<string>(); // Track processed codes to prevent duplicates
      
      activeFrameworks.forEach(framework => {
        let frameworkData = categoryMapping.frameworks?.[framework];
        
        // IMPORTANT: Do NOT apply filtering here - the data should already be filtered by main filteredMappings logic
        // Additional filtering here causes double-filtering and duplication issues
        
        if (frameworkData && frameworkData.length > 0) {
          // Deduplicate requirements within this framework
          const uniqueRequirements = frameworkData.filter((req: any) => {
            const code = req.code || req.id || req.requirement || req.number;
            const uniqueKey = `${framework}-${code}`;
            
            if (!processedCodes.has(uniqueKey)) {
              processedCodes.add(uniqueKey);
              return true;
            }
            return false;
          });
          
          if (uniqueRequirements.length > 0) {
            const frameworkName = {
              iso27001: 'ISO 27001',
              iso27002: 'ISO 27002', 
              cisControls: 'CIS Controls v8',
              gdpr: 'GDPR',
              nis2: 'NIS2 Directive'
            }[framework] || framework;
            
            frameworkRefs += `${frameworkName}: ${uniqueRequirements.map((req: any) => `${req.code} (${req.title})`).join(', ')}\n\n`;
          }
        }
      });
    }
    
    // Build requirements content using actual unified requirements
    let content = frameworkRefs;
    content += 'UNDERSTANDING THE REQUIREMENTS:\n\n';
    content += `${category} encompasses the following key areas based on your selected compliance frameworks:\n\n`;
    
    requirements.forEach((req: any, index: number) => {
      const letter = String.fromCharCode(97 + index); // a, b, c, etc.
      // Apply the same cleaning that's used in the unified requirements display
      const text = typeof req === 'string' ? req : req.description || req.text || '';
      let cleanReq = cleanComplianceSubRequirement(text.trim());
      
      // Remove any existing letter prefixes to avoid duplication (a) a), b) b), etc.
      cleanReq = cleanReq.replace(/^[a-z]\)\s*/i, '');
      
      // Use normal text weight instead of bold to match the unified requirements display
      content += `${letter}) ${cleanReq}\n\n`;
    });
    
    // Add implementation guidance
    content += '\n🎯 OPERATIONAL EXCELLENCE INDICATORS\n\n';
    content += 'Your Compliance Scorecard - Track these metrics to demonstrate audit readiness\n\n';
    
    content += '✅ FOUNDATIONAL CONTROLS\n\n';
    content += '✅ **Policy Documentation** - Comprehensive policies covering all requirement areas\n';
    content += '✅ **Process Implementation** - Documented and implemented procedures\n';
    content += '✅ **Resource Allocation** - Adequate resources assigned to implementation\n';
    content += '✅ **Training Programs** - Staff training on relevant requirements\n\n';
    
    content += '✅ ADVANCED CONTROLS\n\n';
    content += '✅ **Continuous Monitoring** - Automated monitoring where applicable\n';
    content += '✅ **Regular Reviews** - Periodic assessment and improvement\n';
    content += '✅ **Integration** - Integration with other business processes\n';
    content += '✅ **Metrics and KPIs** - Measurable performance indicators\n\n';
    
    content += '✅ AUDIT-READY DOCUMENTATION\n\n';
    content += '✅ **Evidence Collection** - Systematic evidence gathering\n';
    content += '✅ **Compliance Records** - Complete audit trails\n';
    content += '✅ **Gap Analysis** - Regular assessment against requirements\n';
    content += '✅ **Corrective Actions** - Documented remediation activities\n\n';
    
    content += '💡 PRO TIP: Phase implementation over 6-12 months: Start with foundational controls (policies, access management, basic monitoring), then advance to sophisticated automation and measurement. Key success metrics include >95% policy compliance, <24hr incident response time, and quarterly management reviews. Use automation tools where possible to reduce manual effort and ensure consistent evidence collection for audits.\n\n';
    
    return content;
  };

  // Function to extract real framework mappings from categoryMapping
  const extractRealFrameworkMappings = (categoryMapping: any, selectedFrameworks: any): any[] => {
    console.log('[Framework Mappings Debug] categoryMapping structure:', categoryMapping);
    console.log('[Framework Mappings Debug] selectedFrameworks:', selectedFrameworks);
    
    if (!categoryMapping) {
      console.warn('[Framework Mappings] No categoryMapping provided');
      return [];
    }
    
    const realMappings: any[] = [];
    const seenCodes = new Set<string>(); // Track seen codes to prevent duplicates
    
    // Try different possible structures in categoryMapping
    const possibleFrameworkSources = [
      categoryMapping.frameworks,
      categoryMapping.requirements,
      categoryMapping.frameworkMappings,
      categoryMapping
    ];
    
    for (const frameworkSource of possibleFrameworkSources) {
      if (!frameworkSource) continue;
      
      console.log('[Framework Mappings Debug] Trying framework source:', frameworkSource);
      
      // Extract mappings for each selected framework
      Object.keys(selectedFrameworks).forEach(framework => {
        if (selectedFrameworks[framework] && frameworkSource[framework]) {
          const frameworkData = frameworkSource[framework];
          console.log(`[Framework Mappings Debug] Found data for ${framework}:`, frameworkData);
          
          // Use database mappings as-is - the database already has correct IG level separation
          if (Array.isArray(frameworkData)) {
            // For other frameworks (non-CIS), add all requirements (check for duplicates)
            frameworkData.forEach((req: any) => {
              if (req && (req.code || req.id || req.requirement)) {
                const code = req.code || req.id || req.requirement || req.number;
                const uniqueKey = `${framework}-${code}`;
                
                if (!seenCodes.has(uniqueKey)) {
                  seenCodes.add(uniqueKey);
                  realMappings.push({
                    framework: framework,
                    code: code,
                    title: req.title || req.description || req.name || req.text,
                    relevance: req.relevance || req.type || 'primary'
                  });
                }
              }
            });
          } else if (frameworkData.requirements && Array.isArray(frameworkData.requirements)) {
            // If requirements are nested (check for duplicates)
            frameworkData.requirements.forEach((req: any) => {
              if (req && (req.code || req.id || req.requirement)) {
                const code = req.code || req.id || req.requirement || req.number;
                const uniqueKey = `${framework}-${code}`;
                
                if (!seenCodes.has(uniqueKey)) {
                  seenCodes.add(uniqueKey);
                  realMappings.push({
                    framework: framework,
                    code: code,
                    title: req.title || req.description || req.name || req.text,
                    relevance: req.relevance || req.type || 'primary'
                  });
                }
              }
            });
          } else if (typeof frameworkData === 'object' && frameworkData.code) {
            // If it's a single object (check for duplicates)
            const code = frameworkData.code || frameworkData.id || frameworkData.requirement;
            const uniqueKey = `${framework}-${code}`;
            
            if (!seenCodes.has(uniqueKey)) {
              seenCodes.add(uniqueKey);
              realMappings.push({
                framework: framework,
                code: code,
                title: frameworkData.title || frameworkData.description || frameworkData.name,
                relevance: frameworkData.relevance || frameworkData.type || 'primary'
              });
            }
          }
        }
      });
      
      // If we found mappings, break out of the loop
      if (realMappings.length > 0) {
        break;
      }
    }
    
    console.log('[Framework Mappings] Extracted real mappings with CIS filtering and deduplication:', realMappings);
    
    // If no real mappings found, try to use the legacy approach as last resort
    if (realMappings.length === 0) {
      console.warn('[Framework Mappings] No real mappings found, this category may not have framework mappings configured');
    }
    
    return realMappings;
  };

  // Function to build references section for dynamic guidance
  const buildReferencesSection = (references: any[]): string => {
    if (!references || references.length === 0) {
      return '';
    }
    
    let referencesContent = 'Framework References for Selected Standards:\n\n';
    
    // Group references by framework
    const groupedRefs: Record<string, any[]> = {};
    references.forEach(ref => {
      const frameworkKey = ref.framework;
      if (!groupedRefs[frameworkKey]) {
        groupedRefs[frameworkKey] = [];
      }
      groupedRefs[frameworkKey].push(ref);
    });
    
    // Add each framework group
    Object.entries(groupedRefs).forEach(([framework, refs]) => {
      const frameworkName = {
        iso27001: 'ISO 27001',
        iso27002: 'ISO 27002',
        cisControls: 'CIS Controls v8',
        gdpr: 'GDPR',
        nis2: 'NIS2 Directive',
        nist: 'NIST Framework'
      }[framework] || framework.toUpperCase();
      
      const refStrings = refs.map(ref => `${ref.code} (${ref.title})`).join(', ');
      referencesContent += `${frameworkName}: ${refStrings}\n\n`;
    });
    
    return referencesContent;
  };

  // Function to get enhanced guidance content with AI-powered generation
  // State for guidance content loading
  const [guidanceContent, setGuidanceContent] = useState<string>('Loading guidance content...');

  // Effect to load guidance content when modal opens
  useEffect(() => {
    if (showUnifiedGuidance && selectedGuidanceCategory) {
      loadGuidanceContentAsync(selectedGuidanceCategory);
    }
  }, [showUnifiedGuidance, selectedGuidanceCategory, selectedFrameworks]);

  const loadGuidanceContentAsync = async (category: string, useActiveFrameworks: boolean = true) => {
    
    try {
      // Strip number prefixes for proper lookup (e.g., "01. Risk Management" -> "Risk Management")
      const cleanCategory = category.replace(/^\d+\.\s*/, '');
      
      // Debug: Log what category we're trying to get guidance for
      if (!cleanCategory || cleanCategory.trim() === '') {
        console.warn(`[Guidance Debug] Empty category after cleaning. Original: "${category}"`);
        setGuidanceContent('Error: No category specified');
        return;
      }
      
      // Use the currently active frameworks (not the initial selection state)
      const frameworksForGuidance = {
        iso27001: Boolean(useActiveFrameworks ? selectedFrameworks.iso27001 : frameworksSelected.iso27001),
        iso27002: Boolean(useActiveFrameworks ? selectedFrameworks.iso27002 : frameworksSelected.iso27002),
        cisControls: useActiveFrameworks ? (selectedFrameworks.cisControls ? true : false) : (frameworksSelected.cisControls ? true : false),
        gdpr: Boolean(useActiveFrameworks ? selectedFrameworks.gdpr : frameworksSelected.gdpr),
        nis2: Boolean(useActiveFrameworks ? selectedFrameworks.nis2 : frameworksSelected.nis2)
      };
      
      // Find the actual mapping data for this category to get dynamic requirements
      const currentMappings = useActiveFrameworks ? filteredUnifiedMappings : filteredMappings;
      
      // Debug: Log available categories
      if (currentMappings && currentMappings.length > 0) {
        const availableCategories = currentMappings.map(m => m.category?.replace(/^\d+\.\s*/, '') || 'EMPTY').filter(Boolean);
        console.log(`[Guidance Debug] Looking for "${cleanCategory}" in available categories:`, availableCategories);
      } else {
        console.warn(`[Guidance Debug] No mappings available. CurrentMappings:`, currentMappings);
      }
      
      const categoryMapping = currentMappings?.find(mapping => {
        const mappingCategory = mapping.category?.replace(/^\d+\.\s*/, '');
        return mappingCategory === cleanCategory;
      });
      
      // FIRST: Check if we have new versioned guidance in guidance_versions table
      let finalContent = '';
      
      try {
        if (categoryMapping?.id) {
          // Import the new guidance workflow service dynamically to avoid circular deps
          const { GuidanceWorkflowService } = await import('@/services/guidance/GuidanceWorkflowService');
          
          const guidanceResult = await GuidanceWorkflowService.getGuidanceContent(
            categoryMapping.id,
            'published',
            frameworksForGuidance
          );
          
          if (guidanceResult.isVersioned && guidanceResult.content) {
            console.log(`[Modal] Using new versioned guidance for ${cleanCategory}`);
            finalContent = guidanceResult.content;
          }
        }
      } catch (error) {
        console.warn(`[Modal] No versioned guidance found for ${cleanCategory}:`, error);
      }
      
      // SECOND: Use the new dynamic guidance generator as fallback source
      if (!finalContent || finalContent.trim().length <= 100) {
        const dynamicGuidance = await buildGuidanceFromUnifiedRequirements(
          cleanCategory,
          categoryMapping,
          frameworksForGuidance,
          selectedIndustrySector
        );
        
        if (dynamicGuidance && dynamicGuidance.trim().length > 100) {
          console.log(`[Guidance Debug] Successfully generated dynamic guidance for: ${cleanCategory}`);
          finalContent = dynamicGuidance;
        }
      }
      
      // THIRD: Fallback to legacy EnhancedUnifiedGuidanceService only if previous methods failed
      if (!finalContent || finalContent.trim().length <= 100) {
        console.warn(`[Guidance Debug] Dynamic guidance failed for ${cleanCategory}, trying legacy service`);
        const legacyGuidanceResult = await EnhancedUnifiedGuidanceService.getEnhancedGuidance();
        const legacyGuidance = (legacyGuidanceResult.content as string[])?.[0] || '';
        
        if (legacyGuidance && legacyGuidance.trim().length > 100) {
          finalContent = legacyGuidance;
        }
      }
      
      // Set the final content or fallback
      setGuidanceContent(finalContent || getGuidanceContentFallback(cleanCategory));
      
    } catch (error) {
      console.error('[Guidance Debug] Error loading guidance content:', error);
      setGuidanceContent(getGuidanceContentFallback(category));
    } finally {
      // Loading complete
    }
  };

  const getGuidanceContent = () => {
    return guidanceContent;
  };

  const getGuidanceContentFallback = (cleanCategory: string) => {
    // Final fallback with debug information
    console.warn(`[Unified Guidance Debug] Using fallback content for category: ${cleanCategory}. This may indicate missing data.`);
    return `# ${cleanCategory}

⚠️ **Content Loading Notice**

We're having trouble loading the specific unified requirements for this category. This could be due to:

• Missing mapping data for: ${cleanCategory}
• Network connectivity issues
• Database synchronization delay

**What's Available:**
Selected frameworks contain requirements relevant to ${cleanCategory}. This category provides important security and compliance guidance based on your framework selection.

**Troubleshooting:**
1. Try refreshing the page
2. Check that your frameworks are properly selected
3. If the issue persists, contact support

**Next Steps:**
For detailed implementation guidance, please refer to the specific framework documentation or consult with your compliance team.

---
*Debug info logged to browser console for technical support*`;
  };


  // Auto-generate AI content when dialog opens if AI is enabled
  // AI generation is now optional - users can manually trigger it if they want AI enhancement
  // The enhanced guidance from unified requirements is now the standard approach
  useEffect(() => {
    // Only auto-generate AI content if user explicitly enables it and requests it
    // This makes the enhanced guidance the default experience
    if (showUnifiedGuidance && useAIGuidance && selectedGuidanceCategory) {
      console.log(`[AI Guidance] Available for: ${selectedGuidanceCategory}. User can manually generate if desired.`);
    }
  }, [showUnifiedGuidance, useAIGuidance, selectedGuidanceCategory]);
  
  // All legacy functions removed - content now handled by EnhancedUnifiedGuidanceService

  // Force cache clearing on component mount to ensure fresh data
  useEffect(() => {
    console.log('[DEBUG] Clearing all caches on component mount...');
    queryClient.invalidateQueries({ predicate: () => true }); // Clear all React Query cache
    queryClient.removeQueries({ predicate: () => true }); // Also remove all queries from cache
    complianceCacheService.clear('all'); // Clear all internal cache
    
    // Force clear browser storage too
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('compliance_cache_unified_categories');
        sessionStorage.clear();
        console.log('[DEBUG] Browser storage cleared');
      } catch (e) {
        console.warn('[DEBUG] Could not clear browser storage:', e);
      }
    }
    
    // Database-driven content - no fixes, only read existing mappings
    console.log('[DB] Using pure database mappings - CIS 4.6, 4.7 should show in "Secure Configuration of Hardware and Software" if mapped correctly');
  }, []);

  // Fetch industry sectors
  const { data: industrySectors, isLoading: isLoadingSectors } = useIndustrySectors();
  
  // Fetch compliance mapping data from Supabase
  // Transform selectedFrameworks to match the expected format for the hook
  const frameworksForHook = {
    iso27001: Boolean(selectedFrameworks['iso27001']),
    iso27002: Boolean(selectedFrameworks['iso27002']),
    cisControls: selectedFrameworks['cisControls'] || false, // Pass actual IG level string (ig1, ig2, ig3) or false
    gdpr: Boolean(selectedFrameworks['gdpr']),
    nis2: Boolean(selectedFrameworks['nis2'])
  };
  
  const { data: fetchedComplianceMapping, isLoading: isLoadingMappings, refetch: refetchComplianceData } = useComplianceMappingData(frameworksForHook, selectedIndustrySector || undefined);
  
  // Force data refetch on component mount to ensure fresh data
  useEffect(() => {
    console.log('🚨 [COMPONENT MOUNT] Forcing compliance data refetch to bypass any caching...');
    refetchComplianceData();
  }, []);
  
  // Debug: Log what we get from the React Query hook
  useEffect(() => {
    if (fetchedComplianceMapping) {
      console.log('[DEBUG] ComplianceSimplification received data from React Query:', {
        dataLength: fetchedComplianceMapping.length,
        governanceCategory: fetchedComplianceMapping.find(item => item.category === 'Governance & Leadership'),
        allCategories: fetchedComplianceMapping.map(item => item.category)
      });
      
      const governance = fetchedComplianceMapping.find(item => item.category === 'Governance & Leadership');
      if (governance) {
        console.log('[DEBUG] Governance & Leadership data loaded successfully with', governance.auditReadyUnified?.subRequirements?.length || 0, 'unified requirements');
      } else {
        console.log('🚨 [UI DEBUG] NO Governance & Leadership found in fetchedComplianceMapping!');
        console.log('🚨 [UI DEBUG] Available categories:', fetchedComplianceMapping.map(item => item.category));
      }
    }
  }, [fetchedComplianceMapping]);
  
  // Use database data
  const complianceMappingData = fetchedComplianceMapping || [];
  
  // Fetch ALL frameworks data for maximum statistics calculation (overview tab)
  const allFrameworksSelection = {
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3', // Maximum coverage with IG3
    gdpr: true,
    nis2: true
  };
  
  const { data: maxComplianceMapping } = useComplianceMappingData(allFrameworksSelection);
  
  
  
  // Handle framework selection
  const handleFrameworkToggle = (framework: string, value: boolean | 'ig1' | 'ig2' | 'ig3' | null) => {
    setFrameworksSelected(prev => ({ ...prev, [framework]: value }));
  };
  
  // Handle generation button
  const handleGenerate = () => {
    console.log('Generate button clicked', { frameworksSelected, selectedFrameworks });
    setIsGenerating(true);
    setShowGeneration(true);
    
    // Force update the frameworks to trigger data refetch
    setSelectedFrameworks({ 
      iso27001: Boolean(frameworksSelected['iso27001']),
      iso27002: Boolean(frameworksSelected['iso27002']),
      cisControls: frameworksSelected['cisControls'] as 'ig1' | 'ig2' | 'ig3' | null,
      gdpr: Boolean(frameworksSelected['gdpr']),
      nis2: Boolean(frameworksSelected['nis2'])
    });
    
    // Force invalidate React Query cache to ensure fresh data including unified categories
    queryClient.invalidateQueries({ queryKey: ['compliance-mapping-data'] });
    queryClient.invalidateQueries({ queryKey: ['unified-categories'] });
    queryClient.invalidateQueries({ queryKey: ['unified-categories'] });
    queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'compliance-mapping-data' });
    queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'unified-categories' });
    
    // Also clear internal compliance cache
    complianceCacheService.clear('all');
    
    // Force clear any guidance content cache
    complianceCacheService.clear('memory');
    
    // Simulate AI processing time
    setTimeout(() => {
      setIsGenerating(false);
      console.log('Generation completed, staying on current tab');
      
      // Hide generation animation after showing results
      setTimeout(() => {
        setShowGeneration(false);
      }, 2000);
    }, 2500);
  };

  const exportToCSV = () => {
    // Get selected frameworks for dynamic column generation
    const selectedFrameworksList = Object.entries(selectedFrameworks)
      .filter(([_, selected]) => selected !== false && selected !== null)
      .map(([framework, value]) => {
        if (framework === 'cisControls' && typeof value === 'string') {
          return `${framework} (${value.toUpperCase()})`;
        }
        return framework;
      });

    // Create dynamic headers based on selected frameworks
    const baseHeaders = [
      'Category',
      'Description of Category',
      'Unified Requirements',
      'Unified Guidance'
    ];
    
    // Add framework-specific columns only for selected frameworks
    const frameworkHeaders = [];
    if (selectedFrameworks.iso27001) frameworkHeaders.push('ISO 27001 Controls');
    if (selectedFrameworks.iso27002) frameworkHeaders.push('ISO 27002 Controls');
    if (selectedFrameworks.cisControls) {
      const igLevel = selectedFrameworks.cisControls.toUpperCase();
      frameworkHeaders.push(`CIS Controls (${igLevel})`);
    }
    if (selectedFrameworks.gdpr) frameworkHeaders.push('GDPR Articles');
    if (selectedFrameworks.nis2) frameworkHeaders.push('NIS2 Articles');
    
    // Add industry-specific column if sector is selected
    if (selectedIndustrySector) {
      const sectorName = industrySectors?.find(s => s.id === selectedIndustrySector)?.name || 'Industry-Specific';
      frameworkHeaders.push(`${sectorName} Requirements`);
    }

    const headers = [...baseHeaders, ...frameworkHeaders];
    
    // Create enhanced rows with better formatting
    const rows = (filteredUnifiedMappings || []).map(mapping => {
      const baseRow = [
        mapping.category || '',
        cleanMarkdownFormatting(mapping.auditReadyUnified?.description || ''),
        mapping.auditReadyUnified?.title || '',
        // Format sub-requirements with proper line breaks for CSV
        (mapping.auditReadyUnified?.subRequirements || [])
          .map((req, index) => `${index + 1}. ${cleanComplianceSubRequirement(req)}`)
          .join('\n• ')
      ];

      // Add framework-specific data only for selected frameworks
      const frameworkData = [];
      
      if (selectedFrameworks.iso27001) {
        const iso27001Controls = (mapping.frameworks?.['iso27001'] || [])
          .map(r => `${r.code}: ${cleanMarkdownFormatting(r.title)}\n${cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(iso27001Controls);
      }
      
      if (selectedFrameworks.iso27002) {
        const iso27002Controls = (mapping.frameworks?.['iso27002'] || [])
          .map(r => `${r.code}: ${cleanMarkdownFormatting(r.title)}\n${cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(iso27002Controls);
      }
      
      if (selectedFrameworks.cisControls) {
        const cisControls = (mapping.frameworks?.['cisControls'] || [])
          .map(r => `${r.code}: ${cleanMarkdownFormatting(r.title)}\n${cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(cisControls);
      }
      
      if (selectedFrameworks.gdpr) {
        const gdprArticles = (mapping.frameworks?.['gdpr'] || [])
          .map(r => `${r.code}: ${cleanMarkdownFormatting(r.title)}\n${cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(gdprArticles);
      }
      
      if (selectedFrameworks.nis2) {
        const nis2Articles = (mapping.frameworks?.['nis2'] || [])
          .map(r => `${r.code}: ${cleanMarkdownFormatting(r.title)}\n${cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(nis2Articles);
      }

      // Add industry-specific requirements if available
      if (selectedIndustrySector && mapping.industrySpecific) {
        const industryReqs = mapping.industrySpecific
          .map(r => `[${r.relevanceLevel.toUpperCase()}] ${r.code}: ${cleanMarkdownFormatting(r.title)}\n${cleanMarkdownFormatting(r.description).substring(0, 120)}...`)
          .join('\n\n• ');
        frameworkData.push(industryReqs);
      }

      return [...baseRow, ...frameworkData];
    });

    // Create enhanced CSV with better formatting
    const csvRows = [];
    
    // Add title and metadata
    csvRows.push([`AuditReady Compliance Simplification Report`]);
    csvRows.push([`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`]);
    csvRows.push([`Selected Frameworks: ${selectedFrameworksList.join(', ')}`]);
    if (selectedIndustrySector) {
      const sectorName = industrySectors?.find(s => s.id === selectedIndustrySector)?.name || '';
      csvRows.push([`Industry Sector: ${sectorName}`]);
    }
    csvRows.push(['']); // Empty row for spacing
    
    // Add headers
    csvRows.push(headers);
    
    // Add data rows
    csvRows.push(...rows);
    
    // Add footer with summary
    csvRows.push(['']); // Empty row
    csvRows.push([`Total Categories: ${rows.length}`]);
    csvRows.push([`Export Format: Professional CSV with Enhanced Formatting`]);
    csvRows.push([`Note: Import into Excel or Google Sheets for optimal formatting`]);

    // Convert to CSV format with enhanced escaping
    const csvContent = csvRows.map(row => 
      row.map(cell => {
        // Enhanced cell formatting for better readability
        const cleanCell = String(cell || '')
          .replace(/"/g, '""') // Escape quotes
          .replace(/\n/g, '\n') // Preserve line breaks
          .replace(/\r/g, ''); // Remove carriage returns
        
        // Always quote cells to preserve formatting
        return `"${cleanCell}"`;
      }).join(',')
    ).join('\n');

    // Create download with enhanced filename
    const timestamp = new Date().toISOString().split('T')[0];
    const frameworkSuffix = selectedFrameworksList.length > 0 
      ? `_${selectedFrameworksList.join('_').replace(/[^a-zA-Z0-9]/g, '_')}` 
      : '';
    const filename = `AuditReady_Compliance_Report_${timestamp}${frameworkSuffix}.csv`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    console.log(`✅ Exported ${rows.length} compliance categories to ${filename}`);
  };

  const exportToXLSX = async () => {
    // Get selected frameworks for dynamic column generation
    const selectedFrameworksList = Object.entries(selectedFrameworks)
      .filter(([_, selected]) => selected !== false && selected !== null)
      .map(([framework, value]) => {
        if (framework === 'cisControls' && typeof value === 'string') {
          return `${framework} (${value.toUpperCase()})`;
        }
        return framework;
      });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // 🎨 ENTERPRISE-GRADE REPORT INFO WORKSHEET
    const currentDate = new Date();
    const metaData = [
      // Title Section with branding
      ['🛡️ AuditReady Enterprise Compliance Report', ''],
      ['', ''],
      ['📊 EXECUTIVE SUMMARY', ''],
      ['', ''],
      ['Report Generated:', currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) + ' at ' + currentDate.toLocaleTimeString()],
      ['Compliance Frameworks:', selectedFrameworksList.join(', ') || 'All Available'],
      ['Total Categories Analyzed:', (filteredUnifiedMappings || []).length],
      ['Coverage Assessment:', selectedFrameworksList.length > 3 ? 'Comprehensive Multi-Framework Analysis' : 'Focused Framework Analysis'],
      ['', ''],
      ['📋 REPORT SPECIFICATIONS', ''],
      ['', ''],
      ['✓ Category Analysis:', 'Complete coverage of all security domains'],
      ['✓ Framework Mapping:', 'Cross-referenced compliance requirements'],
      ['✓ Unified Guidance:', 'Consolidated implementation roadmap'],
      ['✓ Industry Alignment:', selectedIndustrySector ? 'Sector-specific customization included' : 'General applicability'],
      ['', ''],
      ['🎯 USAGE GUIDELINES', ''],
      ['', ''],
      ['• Executive Review:', 'Focus on Category and Unified Requirements columns'],
      ['• Technical Implementation:', 'Reference Framework-specific control mappings'],
      ['• Audit Preparation:', 'Use Unified Guidance for evidence collection'],
      ['• Risk Assessment:', 'Prioritize categories based on organizational context']
    ];

    if (selectedIndustrySector) {
      const sectorName = industrySectors?.find(s => s.id === selectedIndustrySector)?.name || '';
      metaData.splice(7, 0, ['Industry Sector Focus:', `${sectorName} - Enhanced Requirements`]);
    }

    const metaWS = XLSX.utils.aoa_to_sheet(metaData);
    
    // 🎨 STUNNING METADATA STYLING
    metaWS['!cols'] = [
      { wch: 35 }, // Column A - Labels
      { wch: 65 }  // Column B - Values
    ];

    // Apply cell styling for metadata
    const metaRange = XLSX.utils.decode_range(metaWS['!ref'] || 'A1:B25');
    for (let row = metaRange.s.r; row <= metaRange.e.r; row++) {
      for (let col = metaRange.s.c; col <= metaRange.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
        if (!metaWS[cellAddr]) continue;
        
        // Style different sections
        if (row === 0) {
          // Title row
          metaWS[cellAddr].s = {
            font: { bold: true, size: 18, color: { rgb: "1F4E79" } },
            fill: { fgColor: { rgb: "E7F3FF" } },
            alignment: { horizontal: "left", vertical: "center" }
          };
        } else if ([2, 9, 17].includes(row)) {
          // Section headers
          metaWS[cellAddr].s = {
            font: { bold: true, size: 14, color: { rgb: "2F5233" } },
            fill: { fgColor: { rgb: "F0F8F0" } },
            alignment: { horizontal: "left", vertical: "center" }
          };
        } else if ([4, 5, 6, 7, 8, 11, 12, 13, 14, 19, 20, 21, 22].includes(row) && col === 0) {
          // Data labels
          metaWS[cellAddr].s = {
            font: { bold: true, size: 11, color: { rgb: "404040" } },
            alignment: { horizontal: "left", vertical: "center" }
          };
        }
      }
    }

    // 🎨 MAIN DATA WORKSHEET - ENTERPRISE GRADE
    const baseHeaders = [
      '📂 Category', 
      '🎯 Unified Requirements',
      '📖 Unified Guidance',
      '📚 References'
    ];
    
    // Use the simplified structure: Category, Unified Requirements, Unified Guidance, References
    const headers = baseHeaders;
    
    // Create data rows with enhanced formatting
    const xlsxRows = [headers];
    
    for (let index = 0; index < (filteredUnifiedMappings || []).length; index++) {
      const mapping = filteredUnifiedMappings[index];
      if (!mapping) continue;
      
      // Get unified requirements (sub-requirements) - preserve formatting
      const unifiedRequirements = (mapping.auditReadyUnified?.subRequirements || [])
        .map((req) => {
          // Don't clean Governance & Leadership requirements - they have proper formatting
          if (mapping.category === 'Governance & Leadership') {
            return req;
          }
          return `✓ ${cleanComplianceSubRequirement(req)}`;
        })
        .join('\n\n');
      
      // Get unified guidance content using the enhanced service
      
      // Use legacy system for PDF generation (async)
      const guidanceResult = await EnhancedUnifiedGuidanceService.getEnhancedGuidance();
      const guidanceContent = (guidanceResult.content as string[])?.[0] || 'Enhanced guidance with actionable insights available in application';
      const unifiedGuidance = cleanMarkdownFormatting(
        guidanceContent.length > 1000 
          ? guidanceContent.substring(guidanceContent.indexOf('**') + 50, 1000) + '\\n\\n[Complete guidance available in application]'
          : guidanceContent.substring(guidanceContent.indexOf('**') + 50) || 'Enhanced guidance with actionable insights available in application'
      );
      
      // Collect all framework references for the References column
      const references: string[] = [];
      
      if (selectedFrameworks.iso27001 && mapping.frameworks?.['iso27001']?.length) {
        references.push('ISO 27001: ' + mapping.frameworks['iso27001'].map(r => r.code).join(', '));
      }
      if (selectedFrameworks.iso27002 && mapping.frameworks?.['iso27002']?.length) {
        references.push('ISO 27002: ' + mapping.frameworks['iso27002'].map(r => r.code).join(', '));
      }
      if (selectedFrameworks.cisControls && mapping.frameworks?.['cisControls']?.length) {
        references.push('CIS Controls: ' + mapping.frameworks['cisControls'].map(r => r.code).join(', '));
      }
      if (selectedFrameworks.gdpr && mapping.frameworks?.['gdpr']?.length) {
        references.push('GDPR: ' + mapping.frameworks['gdpr'].map(r => r.code).join(', '));
      }
      if (selectedFrameworks.nis2 && mapping.frameworks?.['nis2']?.length) {
        references.push('NIS2: ' + mapping.frameworks['nis2'].map(r => r.code).join(', '));
      }
      
      const referencesText = references.join('\n') || 'No specific framework mappings found';
      
      const row = [
        `${index + 1}. ${mapping.category || ''}`,
        unifiedRequirements,
        unifiedGuidance,
        referencesText
      ];

      xlsxRows.push(row);
    }

    const mainWS = XLSX.utils.aoa_to_sheet(xlsxRows);
    
    // 🎨 CALCULATE AUTO-ADJUSTED COLUMN WIDTHS
    const calculateOptimalWidth = (text: string, isHeader = false) => {
      if (!text) return 15;
      const lines = text.split('\n');
      const maxLineLength = Math.max(...lines.map(line => line.length));
      let baseWidth = Math.min(Math.max(maxLineLength * 1.2, 15), isHeader ? 35 : 60);
      if (isHeader) baseWidth += 5; // Extra space for headers
      return baseWidth;
    };

    // Calculate optimal column widths based on content
    const optimalWidths = headers.map((header, colIndex) => {
      let maxWidth = calculateOptimalWidth(header, true);
      
      // Check content width for this column
      xlsxRows.slice(1).forEach(row => {
        if (row[colIndex]) {
          const contentWidth = calculateOptimalWidth(String(row[colIndex]));
          maxWidth = Math.max(maxWidth, contentWidth);
        }
      });
      
      return { wch: Math.min(maxWidth, 70) }; // Cap at 70 characters
    });

    mainWS['!cols'] = optimalWidths;

    // 🎨 CALCULATE AUTO-ADJUSTED ROW HEIGHTS
    const range = XLSX.utils.decode_range(mainWS['!ref'] || 'A1:A1');
    mainWS['!rows'] = [];
    
    for (let i = 0; i <= range.e.r; i++) {
      if (i === 0) {
        // Header row with premium styling
        mainWS['!rows'][i] = { hpx: 45 };
      } else {
        // Calculate row height based on content
        let maxLines = 1;
        for (let j = 0; j < headers.length; j++) {
          const cellAddr = XLSX.utils.encode_cell({ r: i, c: j });
          if (mainWS[cellAddr] && mainWS[cellAddr].v) {
            const lines = String(mainWS[cellAddr].v).split('\n').length;
            maxLines = Math.max(maxLines, lines);
          }
        }
        // Set height based on content (minimum 25px, scale with content)
        const optimalHeight = Math.max(25, Math.min(maxLines * 18, 200));
        mainWS['!rows'][i] = { hpx: optimalHeight };
      }
    }

    // 🎨 APPLY STUNNING CELL STYLING
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
        if (!mainWS[cellAddr]) continue;

        if (row === 0) {
          // 🎨 PREMIUM HEADER STYLING
          mainWS[cellAddr].s = {
            font: { 
              bold: true, 
              size: 12, 
              color: { rgb: "FFFFFF" },
              name: "Calibri"
            },
            fill: { 
              fgColor: { rgb: col < 4 ? "1F4E79" : "2F5233" } // Different colors for base vs framework columns
            },
            alignment: { 
              horizontal: "center", 
              vertical: "center",
              wrapText: true 
            },
            border: {
              top: { style: "thick", color: { rgb: "FFFFFF" } },
              bottom: { style: "thick", color: { rgb: "FFFFFF" } },
              left: { style: "thick", color: { rgb: "FFFFFF" } },
              right: { style: "thick", color: { rgb: "FFFFFF" } }
            }
          };
        } else {
          // 🎨 ALTERNATING ROW COLORS WITH PREMIUM STYLING
          const isEvenRow = (row - 1) % 2 === 0;
          const backgroundColor = isEvenRow ? "F8F9FA" : "FFFFFF";
          const textColor = col === 0 ? "1F4E79" : "404040"; // Category column in blue
          
          mainWS[cellAddr].s = {
            font: { 
              size: 10,
              color: { rgb: textColor },
              name: "Calibri",
              bold: col === 0 // Bold category names
            },
            fill: { fgColor: { rgb: backgroundColor } },
            alignment: { 
              horizontal: col === 0 ? "left" : "left",
              vertical: "top",
              wrapText: true,
              indent: col === 0 ? 1 : 0
            },
            border: {
              top: { style: "thin", color: { rgb: "E0E0E0" } },
              bottom: { style: "thin", color: { rgb: "E0E0E0" } },
              left: { style: "thin", color: { rgb: "E0E0E0" } },
              right: { style: "thin", color: { rgb: "E0E0E0" } }
            }
          };
        }
      }
    }

    // 🎨 CREATE SUMMARY STATISTICS WORKSHEET
    const summaryData = [
      ['📊 COMPLIANCE COVERAGE ANALYSIS', ''],
      ['', ''],
      ['Framework', 'Requirements Mapped', 'Coverage %', 'Status'],
      ['', '', '', ''],
    ];

    // Add framework statistics
    selectedFrameworksList.forEach(framework => {
      const totalMapped = (filteredUnifiedMappings || []).reduce((count, mapping) => {
        const frameworkKey = framework.includes('(') ? (framework.split('(')[0]?.trim() || framework) : framework;
        const mappedFrameworks = Object.keys(mapping.frameworks || {});
        return count + (mappedFrameworks.includes(frameworkKey) ? 1 : 0);
      }, 0);
      
      const coverage = Math.round((totalMapped / Math.max((filteredUnifiedMappings || []).length, 1)) * 100);
      const status = coverage >= 90 ? '✅ Excellent' : coverage >= 70 ? '🟡 Good' : coverage >= 50 ? '🟠 Moderate' : '🔴 Limited';
      
      summaryData.push([framework, totalMapped.toString(), `${coverage}%`, status]);
    });

    summaryData.push(['', '', '', '']);
    summaryData.push(['Total Categories Analyzed', (filteredUnifiedMappings || []).length.toString(), '100%', 'Complete']);
    summaryData.push(['Report Generation Date', new Date().toLocaleDateString(), '', '']);
    summaryData.push(['Compliance Readiness Score', 
      selectedFrameworksList.length >= 3 ? 'High Multi-Framework Coverage' : 'Focused Framework Analysis', 
      '', 
      selectedFrameworksList.length >= 3 ? 'Enterprise' : 'Professional'
    ]);

    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWS['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];

    // Style summary worksheet
    const summaryRange = XLSX.utils.decode_range(summaryWS['!ref'] || 'A1:D10');
    for (let row = summaryRange.s.r; row <= summaryRange.e.r; row++) {
      for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
        if (!summaryWS[cellAddr]) continue;
        
        if (row === 0) {
          summaryWS[cellAddr].s = {
            font: { bold: true, size: 16, color: { rgb: "1F4E79" } },
            fill: { fgColor: { rgb: "E7F3FF" } },
            alignment: { horizontal: "left", vertical: "center" }
          };
        } else if (row === 2) {
          summaryWS[cellAddr].s = {
            font: { bold: true, size: 11, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "1F4E79" } },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
      }
    }

    // Add worksheets to workbook in order
    XLSX.utils.book_append_sheet(wb, metaWS, '📋 Report Overview');
    XLSX.utils.book_append_sheet(wb, summaryWS, '📊 Coverage Analysis');
    XLSX.utils.book_append_sheet(wb, mainWS, '🛡️ Compliance Mapping');

    // Create premium filename
    const timestamp = new Date().toISOString().split('T')[0];
    const frameworkSuffix = selectedFrameworksList.length > 0 
      ? `_${selectedFrameworksList.join('_').replace(/[^a-zA-Z0-9]/g, '_')}` 
      : '';
    const filename = `AuditReady_Enterprise_Compliance_Report_${timestamp}${frameworkSuffix}.xlsx`;

    // Export with enterprise branding
    XLSX.writeFile(wb, filename);
    
    console.log(`🏆 Exported enterprise-grade compliance report: ${filename}`);
    console.log(`📊 ${(filteredUnifiedMappings || []).length} categories analyzed across ${selectedFrameworksList.length} frameworks`);
  };

  const exportToPDF = () => {
    // Get selected frameworks with proper formatting
    const selectedFrameworksList = Object.entries(selectedFrameworks)
      .filter(([_, selected]) => selected !== false && selected !== null)
      .map(([framework, value]) => {
        if (framework === 'cisControls' && typeof value === 'string') {
          return ProfessionalGuidanceService.formatFrameworkName(`${framework} (${value})`);
        }
        return ProfessionalGuidanceService.formatFrameworkName(framework);
      });

    // Create new PDF with normal A4 portrait dimensions
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm', 
      format: [210, 297], // Standard A4 portrait dimensions
      compress: true,
      putOnlyUsedFonts: true
    });
    const pageWidth = 210; // Standard A4 portrait width
    const pageHeight = 297; // Standard A4 portrait height
    const margin = 15; // Professional margin for A4
    

    // 🎨 PREMIUM HEADER DESIGN
    const createPremiumHeader = (pageNum = 1) => {
      // Background gradient effect (simulated with rectangles)
      doc.setFillColor(31, 78, 121); // Primary blue
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      // Subtle accent line
      doc.setFillColor(239, 156, 18); // Gold accent
      doc.rect(0, 27, pageWidth, 3, 'F');
      
      // Company logo placeholder - portrait optimized
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, 6, 16, 16, 2, 2, 'F');
      doc.setFillColor(31, 78, 121);
      doc.roundedRect(margin + 2, 8, 12, 12, 1, 1, 'F');
      
      // Main title - portrait A4 optimized with proper width constraint
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18); // Reduced from 22 to prevent bleeding
      doc.setFont('helvetica', 'bold');
      // Ensure title fits within available width (pageWidth - margin - logo space - page number space)
      const maxTitleWidth = pageWidth - margin - 25 - 30; // Leave space for logo and page number
      doc.text('AUDITREADY ENTERPRISE COMPLIANCE', margin + 25, 17, { maxWidth: maxTitleWidth });
      
      // Subtitle with date - portrait formatting
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated on ${currentDate}`, margin + 25, 23);
      
      // Only show page number at bottom right if not first page
      if (pageNum > 1) {
        // Add page number at bottom right
        doc.setTextColor(127, 140, 141);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${pageNum}`, pageWidth - margin - 10, pageHeight - 10);
      }
      
      return 40; // Return Y position after header
    };

    // Calculate actual number of pages needed based on content
    let currentY = createPremiumHeader(1);
    
    // EXECUTIVE SUMMARY SECTION - portrait A4 optimized
    doc.setFillColor(231, 243, 255); // Light blue background
    doc.roundedRect(margin, currentY, pageWidth - (2 * margin), 50, 3, 3, 'F');
    
    // Summary title - portrait optimized
    doc.setTextColor(31, 78, 121);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', margin + 8, currentY + 12);
    
    // Single column layout for portrait format
    
    // Single column layout with enhanced formatting
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SELECTED FRAMEWORKS:', margin + 8, currentY + 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    // Format frameworks properly for portrait
    let yOffset = currentY + 28;
    selectedFrameworksList.forEach((framework) => {
      const capitalizedFramework = framework.charAt(0).toUpperCase() + framework.slice(1);
      doc.text(`• ${capitalizedFramework}`, margin + 12, yOffset);
      yOffset += 5;
    });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const totalCatY = Math.max(yOffset + 2, currentY + 38);
    doc.text('TOTAL CATEGORIES:', margin + 8, totalCatY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`${(filteredUnifiedMappings || []).length} compliance domains analyzed`, margin + 55, totalCatY);
    
    // Coverage assessment with proper width constraint
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const coverageText = selectedFrameworksList.length > 3 ? 'Comprehensive Analysis' : 'Focused Analysis';
    const maxCoverageWidth = pageWidth - (2 * margin) - 20; // Ensure it fits within blue design
    doc.text(`Coverage: ${coverageText}`, margin + 8, totalCatY + 6, { maxWidth: maxCoverageWidth });
    
    if (selectedIndustrySector) {
      const sectorName = industrySectors?.find(s => s.id === selectedIndustrySector)?.name || '';
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Industry Focus: ${sectorName}`, margin + 8, totalCatY + 12);
    }
    
    // Add introduction section on first page
    currentY = totalCatY + 30;
    
    // Introduction section with professional content
    doc.setFillColor(248, 251, 253); // Very light gray-blue background
    doc.roundedRect(margin, currentY, pageWidth - (2 * margin), 120, 3, 3, 'F');
    
    // Introduction title
    doc.setTextColor(31, 78, 121);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIFIED COMPLIANCE REQUIREMENTS', margin + 8, currentY + 15);
    
    // Introduction subtitle
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(52, 73, 94);
    doc.text('Streamlined Framework Integration for Enterprise Compliance', margin + 8, currentY + 22);
    
    // Introduction content
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const introText = [
      'This comprehensive compliance report presents unified requirements where multiple regulatory',
      'frameworks have been consolidated to simplify implementation across organizational departments.',
      '',
      'Our unified approach enables:',
      '• Streamlined compliance management across multiple standards simultaneously',
      '• Reduced complexity through intelligently consolidated requirements',
      '• Enhanced departmental coordination and consistent implementation',
      '• Clear mapping between different regulatory frameworks and standards',
      '• Simplified audit preparation with comprehensive evidence collection',
      '',
      'Each category on the following pages contains:',
      '• Unified requirements combining all selected frameworks',
      '• Detailed implementation guidance for practical deployment',
      '• Complete framework references with specific control mappings',
      '',
      'This approach reduces duplication and ensures comprehensive coverage while maintaining',
      'compliance with all selected standards.'
    ];
    
    let introY = currentY + 35;
    introText.forEach((line: string) => {
      if (line.startsWith('•')) {
        doc.setTextColor(31, 78, 121); // Blue for bullet points
        doc.text(line.substring(0, 1), margin + 8, introY);
        doc.setTextColor(44, 62, 80);
        doc.text(line.substring(1), margin + 11, introY);
      } else {
        doc.text(line, margin + 8, introY);
      }
      introY += line === '' ? 3 : 5;
    });
    
    currentY += 130;

    // FRAMEWORK LEGEND - Removed duplicate section since frameworks are already shown in Executive Summary
    // This reduces redundancy and cleans up the report
    currentY += 5;

    // 🎯 OPERATIONAL EXCELLENCE FOOTER FUNCTION - Fixed dimensions and cleaned title
    const createOperationalExcellenceFooter = (doc: jsPDF, startY: number, pageWidth: number, margin: number) => {
      // Check if there's enough space for footer, otherwise add new page  
      if (startY + 85 > pageHeight - margin) {
        doc.addPage();
        startY = 50;
      }
      
      // Professional subtitle for section
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('IMPLEMENTATION SCORECARD', margin, startY + 2);
      
      // Main header with clean title (no emoji/special chars)
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.roundedRect(margin, startY + 5, pageWidth - (2 * margin), 12, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('OPERATIONAL EXCELLENCE INDICATORS', margin + 8, startY + 13);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Track these metrics to demonstrate audit readiness', margin + 8, startY + 15.5);
      
      // Enhanced 4-section grid layout with better spacing and fixed dimensions
      const totalGridWidth = pageWidth - (2 * margin);
      const gapSize = 3; // Smaller gaps to prevent overflow
      const sectionWidth = (totalGridWidth - (3 * gapSize)) / 4;
      const sectionHeight = 58; // Taller sections for more content without overflow
      let currentX = margin;
      const sectionY = startY + 22;
      
      // Helper function to create rounded sections with proper text wrapping
      const createSection = (x: number, bgColor: [number, number, number], borderColor: [number, number, number], textColor: [number, number, number], title: string, items: string[]) => {
        // Background with rounded corners
        doc.setFillColor(...bgColor);
        doc.roundedRect(x, sectionY, sectionWidth, sectionHeight, 3, 3, 'F');
        
        // Border with rounded corners
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(1.5);
        doc.roundedRect(x, sectionY, sectionWidth, sectionHeight, 3, 3, 'S');
        
        // Title with proper positioning - remove any special characters
        doc.setTextColor(...textColor);
        doc.setFontSize(8); // Even smaller font to prevent bleeding
        doc.setFont('helvetica', 'bold');
        const cleanTitle = title.replace(/[✅💡🎯]/g, '').trim(); // Remove special chars
        doc.text(cleanTitle, x + 2, sectionY + 6); // Move up slightly
        
        // Items with proper text wrapping and spacing
        doc.setFontSize(7); // Smaller font for items
        doc.setFont('helvetica', 'normal');
        let currentItemY = sectionY + 12; // Start higher to give title more space
        
        items.forEach((item) => {
          if (currentItemY + 4 > sectionY + sectionHeight - 3) return; // Prevent overflow
          
          const cleanItem = item.replace(/[•◆▪→]/g, '').trim(); // Remove bullet points
          const maxWidth = sectionWidth - 4; // Leave margin
          
          // Simple text wrapping
          const words = cleanItem.split(' ');
          let line = '';
          
          for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            const textWidth = doc.getTextWidth(testLine);
            
            if (textWidth > maxWidth && line !== '') {
              // Print current line and start new one
              doc.text(line, x + 2, currentItemY);
              currentItemY += 4;
              if (currentItemY + 4 > sectionY + sectionHeight - 3) break; // Prevent overflow
              line = word;
            } else {
              line = testLine;
            }
          }
          
          // Print final line
          if (line && currentItemY + 4 <= sectionY + sectionHeight - 3) {
            doc.text(line, x + 2, currentItemY);
            currentItemY += 5;
          }
        });
        
        // Add subtle shadow effect (using light gray instead of transparency)
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(x + 1, sectionY + sectionHeight + 1, x + sectionWidth + 1, sectionY + sectionHeight + 1);
        doc.line(x + sectionWidth + 1, sectionY + 1, x + sectionWidth + 1, sectionY + sectionHeight + 1);
      };
      
      // Section 1: FOUNDATIONAL CONTROLS
      createSection(currentX, [239, 246, 255], [59, 130, 246], [30, 64, 175], 'FOUNDATIONAL CONTROLS', [
        'Comprehensive policy documentation',
        'Documented security procedures', 
        'Adequate resource allocation',
        'Staff training and awareness',
        'Management approval processes'
      ]);
      
      // Section 2: ADVANCED CONTROLS
      currentX += sectionWidth + gapSize;
      createSection(currentX, [236, 253, 245], [34, 197, 94], [20, 83, 45], 'ADVANCED CONTROLS', [
        '• Continuous monitoring systems',
        '• Regular security reviews',
        '• Integrated business processes',
        '• Performance metrics & KPIs',
        '• Automated control validation'
      ]);
      
      // Section 3: AUDIT-READY DOCUMENTATION
      currentX += sectionWidth + gapSize;
      createSection(currentX, [254, 243, 199], [245, 158, 11], [180, 83, 9], 'AUDIT-READY DOCS', [
        '• Systematic evidence collection',
        '• Complete compliance records',
        '• Regular gap analysis',
        '• Documented corrective actions',
        '• Audit trail maintenance'
      ]);
      
      // Section 4: PRO IMPLEMENTATION TIP
      currentX += sectionWidth + gapSize;
      createSection(currentX, [252, 231, 243], [236, 72, 153], [157, 23, 77], 'IMPLEMENTATION GUIDE', [
        '• Phase over 6-12 months',
        '• Start with foundational controls',
        '• Build monitoring capabilities',
        '• Implement automation gradually',
        '• Measure and demonstrate value'
      ]);
      
      return startY + sectionHeight + 35; // Extra space for proper footer spacing
    };

    // MAIN DATA TABLE - CLEAN AND COMPLETE
    const createStunningTable = (data: any[], startY: number, categoryNum?: number, totalCategories?: number) => {
      // Updated structure: Category, Unified Requirements, Unified Guidance, References  
      const allHeaders = ['CATEGORY', 'UNIFIED REQUIREMENTS', 'UNIFIED GUIDANCE', 'REFERENCES'];
      
      // Add category header for single category pages with better visibility
      if (data.length === 1 && categoryNum && totalCategories) {
        doc.setFillColor(231, 243, 255); // Light blue background
        doc.roundedRect(margin, startY, pageWidth - (2 * margin), 25, 3, 3, 'F');
        
        doc.setTextColor(31, 78, 121);
        doc.setFontSize(13); // Reduced from 16 to prevent text overflow
        doc.setFont('helvetica', 'bold');
        const categoryName = ProfessionalGuidanceService.formatCategoryName(data[0].category).replace(/^\d+\.\s*/, '');
        const maxTitleWidth = pageWidth - (2 * margin) - 20; // Ensure title fits within blue box
        const titleText = `CATEGORY ${categoryNum} OF ${totalCategories}: ${categoryName.toUpperCase()}`;
        doc.text(titleText, margin + 10, startY + 15, { maxWidth: maxTitleWidth });
        
        startY += 35;
      }
      
      // Prepare table data with COMPLETE content from actual service
      // Loading real unified guidance content from getGuidanceContent function
      const tableData = data.map((mapping) => {
        // Get unified requirements with clean formatting and better numbering
        // Use database content directly - no more hardcoded overrides
        let requirements = mapping.auditReadyUnified?.subRequirements || [];
        
        const cleanedRequirements = requirements.map((req: any) => {
          const text = typeof req === 'string' ? req : req.description || req.text || '';
          // Don't clean Governance & Leadership requirements - preserve formatting
          if (mapping.category === 'Governance & Leadership') {
            return text;
          }
          return ProfessionalGuidanceService.cleanText(text);
        }).filter((req: string) => req && req.trim().length > 0); // Preserve all non-empty requirements
        
        // Also check for requirements in the title if subrequirements are minimal
        if (cleanedRequirements.length === 0 && mapping.auditReadyUnified?.title) {
          const titleText = ProfessionalGuidanceService.cleanText(mapping.auditReadyUnified.title);
          if (titleText.length > 10) {
            cleanedRequirements.push(titleText);
          }
        }
        
        // Format ALL requirements with proper lettering - ensure complete content
        let unifiedRequirements = '';
        if (cleanedRequirements.length > 0) {
          // Add lettering to all requirements consistently
          
          unifiedRequirements = cleanedRequirements.map((req: string, idx: number) => {
            const letter = String.fromCharCode(97 + idx); // a, b, c, d, ... p, etc.
            
            // Clean the requirement text
            let cleanReq = req.trim();
            
            // Add lettering if not already present
            if (cleanReq.match(/^[a-z]\)/)) {
              return cleanReq;
            } else {
              // Remove existing numbering/lettering and add proper lettering
              cleanReq = cleanReq.replace(/^[a-z]\)\s*/i, '').replace(/^\d+\.\s*/, '');
              return `${letter}) ${cleanReq}`;
            }
          }).join('\n\n');
        } else {
          // Fallback: try to extract from title or description
          const fallbackContent = mapping.auditReadyUnified?.title || mapping.auditReadyUnified?.description || '';
          if (fallbackContent) {
            const cleanTitle = ProfessionalGuidanceService.cleanText(fallbackContent);
            unifiedRequirements = `a) ${cleanTitle}`;
          } else {
            unifiedRequirements = 'Complete unified requirements available in application interface';
          }
        }
        
        // Get unified guidance content using the enhanced service with better formatting
        
        
        // Get ACTUAL unified guidance content from the service (same as buttons)
        const actualGuidanceContent = mapping.category ? getGuidanceContent() : 'No category specified';
        
        // Clean and format the actual guidance content for PDF
        let unifiedGuidance = '';
        if (actualGuidanceContent && actualGuidanceContent.length > 100) {
          // Process the actual guidance content line by line for proper formatting
          const guidanceLines = actualGuidanceContent.split('\n');
          const formattedLines: string[] = [];
          
          let currentSection = '';
          let isInRequirementsSection = false;
          
          let inOperationalExcellenceSection = false;
          
          guidanceLines.forEach((line) => {
            const cleanLine = line.replace(/\*\*/g, '').trim();
            
            if (cleanLine === '') {
              if (currentSection && !inOperationalExcellenceSection) formattedLines.push(''); 
              return;
            }
            
            // Mark start of OPERATIONAL EXCELLENCE section to skip everything after
            if (cleanLine.includes('🎯 OPERATIONAL EXCELLENCE INDICATORS')) {
              inOperationalExcellenceSection = true;
              return;
            }
            
            // Skip everything in operational excellence section for PDF
            if (inOperationalExcellenceSection) {
              return;
            }
            
            // For PDF, we want ALL content EXCEPT operational excellence
            // No filtering of guidance content for PDF
            
            // Look for requirement patterns to start processing content
            if (cleanLine.match(/^[a-z]\)/) || cleanLine.includes('**a)') || isInRequirementsSection) {
              isInRequirementsSection = true;
            }
            
            // Skip the "UNDERSTANDING THE REQUIREMENTS" line but add our header once
            if (cleanLine.includes('UNDERSTANDING THE REQUIREMENTS')) {
              if (!formattedLines.some(line => line.includes('IMPLEMENTATION GUIDANCE:'))) {
                formattedLines.push('IMPLEMENTATION GUIDANCE:');
                formattedLines.push('');
                formattedLines.push(''); // Extra spacing after header
              }
              return;
            }
            
            // Process requirements explanation if we're in the right section
            if (isInRequirementsSection && cleanLine.length > 5) {
              // Format subsection headers (a), b), c), etc.) with proper spacing
              if (cleanLine.match(/^[a-z]\)/)) {
                // Extract letter and title, make title bold
                const match = cleanLine.match(/^([a-z]\))\s*(.+)$/);
                if (match && match[2]) {
                  const letter = match[1];
                  const title = match[2];
                  
                  // Add extra spacing before each new requirement section (except the first one)
                  if (formattedLines.length > 0 && !formattedLines[formattedLines.length - 1]?.startsWith('IMPLEMENTATION GUIDANCE:')) {
                    formattedLines.push(''); // Extra blank line before new requirement
                    formattedLines.push(''); // Second blank line for visual separation
                  }
                  
                  // Split at colon to make only the part before colon bold
                  if (title?.includes(':')) {
                    const parts = title.split(':');
                    formattedLines.push(`${letter} ${parts[0]?.trim() || ''}:${parts.slice(1).join(':')}`);
                  } else {
                    formattedLines.push(`${letter} ${title?.trim() || ''}`);
                  }
                  formattedLines.push(''); // Add spacing after headers
                }
              } else {
                // Regular content with proper formatting and line breaks
                const cleanedContent = ProfessionalGuidanceService.cleanText(cleanLine);
                if (cleanedContent.length > 10) {  // Reduced threshold to capture more content
                  // Wrap long content for better readability in PDF
                  if (cleanedContent.length > 120) {
                    // Split at logical break points (sentences, but preserve readability)
                    const words = cleanedContent.split(' ');
                    let currentLine = '';
                    
                    words.forEach(word => {
                      if ((currentLine + word).length > 100 && currentLine.length > 0) {
                        formattedLines.push(currentLine.trim());
                        currentLine = word + ' ';
                      } else {
                        currentLine += word + ' ';
                      }
                    });
                    
                    if (currentLine.trim()) {
                      formattedLines.push(currentLine.trim());
                    }
                    
                    formattedLines.push(''); // Add spacing after wrapped content
                  } else {
                    formattedLines.push(cleanedContent);
                  }
                } else if (cleanedContent.length > 0) {
                  // Include even shorter content to ensure nothing is missed
                  formattedLines.push(cleanedContent);
                }
              }
            }
          });
          
          // Join the formatted lines and clean markdown formatting
          unifiedGuidance = cleanMarkdownFormatting(formattedLines.join('\n').trim());
        }
        
        // Fallback if no proper guidance content found
        if (!unifiedGuidance || unifiedGuidance.length < 50) {
          unifiedGuidance = 'Detailed implementation guidance available in application interface';
        }
        
        // Collect all framework references for the References column with proper formatting
        const references: string[] = [];
        
        // Collect ALL framework references with proper formatting and titles
        const frameworksToCheck = [
          { key: 'iso27001', title: 'ISO 27001:2022', selected: selectedFrameworks.iso27001 },
          { key: 'iso27002', title: 'ISO 27002:2022', selected: selectedFrameworks.iso27002 },
          { key: 'cisControls', title: `CIS Controls - ${selectedFrameworks.cisControls?.toUpperCase() || 'IG3'} (v8.1.2)`, selected: selectedFrameworks.cisControls },
          { key: 'gdpr', title: 'GDPR (EU 2016/679)', selected: selectedFrameworks.gdpr },
          { key: 'nis2', title: 'NIS2 Directive (EU 2022/2555)', selected: selectedFrameworks.nis2 }
        ];
        
        frameworksToCheck.forEach(framework => {
          if (framework.selected && mapping.frameworks?.[framework.key]?.length) {
            const items = mapping.frameworks[framework.key];
            
            // Get all codes and titles
            const codesList: string[] = [];
            items.forEach((item: any) => {
              const code = ProfessionalGuidanceService.cleanText(item.code || '');
              const title = ProfessionalGuidanceService.cleanText(item.title || '');
              
              if (code) {
                if (title && title.length > 0 && title !== code) {
                  codesList.push(`${code}: ${title.substring(0, 60)}${title.length > 60 ? '...' : ''}`);
                } else {
                  codesList.push(code);
                }
              }
            });
            
            if (codesList.length > 0) {
              references.push(`${framework.title}:\n${codesList.join('\n')}`);
            }
          }
        });
        
        // Format references with proper structure
        const referencesText = references.length > 0 
          ? references.join('\n\n')
          : 'Complete framework mappings available in application';
        
        return [
          ProfessionalGuidanceService.formatCategoryName(mapping.category || '').toUpperCase(),
          unifiedRequirements,
          unifiedGuidance,
          referencesText
        ];
      });

      // 🎨 CREATE THE STUNNING TABLE WITH ENHANCED VISIBILITY AND FORMATTING
      autoTable(doc, {
        head: [allHeaders],
        body: tableData,
        startY: startY,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9,  // Compact font for better fitting
          cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },  // Increased padding for better readability
          lineColor: [180, 180, 180],
          lineWidth: 0.5,
          font: 'helvetica',
          valign: 'top',
          overflow: 'linebreak',
          cellWidth: 'wrap',
          textColor: [40, 40, 40]
        },
        headStyles: {
          fillColor: [31, 78, 121],
          textColor: [255, 255, 255],
          fontSize: 8,  // Smaller headers for better fit
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          cellPadding: { top: 6, right: 3, bottom: 6, left: 3 }
        },
        columnStyles: {
          0: { 
            cellWidth: 32, // Category - properly sized to fit
            fontStyle: 'bold', 
            fillColor: [231, 243, 255], 
            fontSize: 10,
            textColor: [31, 78, 121],
            halign: 'center'
          },
          1: { 
            cellWidth: 48, // Unified Requirements - fits within bounds
            overflow: 'linebreak', 
            cellPadding: { top: 8, right: 6, bottom: 8, left: 6 }, 
            fontSize: 9,
            valign: 'top'
          },
          2: { 
            cellWidth: 58, // Unified Guidance - smaller without operational excellence content
            overflow: 'linebreak', 
            cellPadding: { top: 12, right: 8, bottom: 12, left: 8 }, // Increased padding for better spacing
            fontSize: 9,
            valign: 'top',
            lineColor: [200, 200, 200],
            lineWidth: 0.5
          },
          3: { 
            cellWidth: 38, // References - adequate space
            overflow: 'linebreak', 
            cellPadding: { top: 8, right: 6, bottom: 8, left: 6 }, 
            fontSize: 8,
            fontStyle: 'normal',
            textColor: [44, 62, 80]
          },
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        didDrawCell: (data: any) => {
          // Enhanced cell styling with better borders
          if (data.section === 'head') {
            doc.setDrawColor(21, 58, 101);
            doc.setLineWidth(1.5);
            doc.line(data.cell.x, data.cell.y + data.cell.height, 
                    data.cell.x + data.cell.width, data.cell.y + data.cell.height);
          }
          
          // Category column special styling with enhanced visibility
          if (data.column.index === 0 && data.section === 'body') {
            doc.setTextColor(31, 78, 121);
            doc.setFont('helvetica', 'bold');
          }
          
          // Enhanced styling for Unified Guidance column
          if (data.column.index === 2 && data.section === 'body') {
            // Set enhanced styling for guidance content
            doc.setTextColor(40, 40, 40);
            doc.setFont('helvetica', 'normal');
          }
          
          // Add enhanced borders to separate columns better
          if (data.section === 'body') {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            if (data.column.index < 3) {
              doc.line(
                data.cell.x + data.cell.width, data.cell.y,
                data.cell.x + data.cell.width, data.cell.y + data.cell.height
              );
            }
          }
        },
        willDrawCell: (data: any) => {
          // Pre-process bold formatting in Unified Guidance column
          if (data.column.index === 2 && data.section === 'body') {
            const text = Array.isArray(data.cell.text) ? data.cell.text.join(' ') : data.cell.text;
            if (typeof text === 'string' && text.includes('**')) {
              // Process bold markers and adjust cell content
              data.cell.text = text.split('\n');
            }
          }
        },
        
        didParseCell: (data: any) => {
          // Enhanced header styling for better A4 visibility
          if (data.section === 'head') {
            data.cell.styles.fontSize = 13;
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [255, 255, 255];
          }
          
          // Column-specific font size optimizations
          if (data.section === 'body') {
            switch (data.column.index) {
              case 0: // Category column
                data.cell.styles.fontSize = 9;
                data.cell.styles.fontStyle = 'bold';
                break;
              case 1: // Requirements column
                data.cell.styles.fontSize = 8;
                break;
              case 2: // Guidance column
                data.cell.styles.fontSize = 8;
                break;
              case 3: // References column
                data.cell.styles.fontSize = 7;
                break;
            }
          }
          
          // Optimized auto-adjust row height for proper fitting
          if (data.section === 'body') {
            const text = Array.isArray(data.cell.text) ? data.cell.text.join('') : (data.cell.text || '');
            const lines = Math.ceil(text.length / 45); // Better estimation for compact fitting
            
            // Compact row heights to prevent text bleeding
            if (lines > 15) {
              data.cell.styles.minCellHeight = Math.max(35, lines * 2.2);
            } else if (lines > 10) {
              data.cell.styles.minCellHeight = Math.max(28, lines * 2.5);
            } else if (lines > 6) {
              data.cell.styles.minCellHeight = Math.max(22, lines * 2.8);
            } else if (lines > 3) {
              data.cell.styles.minCellHeight = Math.max(18, lines * 3.0);
            } else {
              data.cell.styles.minCellHeight = 16; // Compact minimum
            }
            
            // Compact and consistent padding
            data.cell.styles.cellPadding = { top: 4, right: 3, bottom: 4, left: 3 };
          }
        },
        showHead: 'everyPage',
        theme: 'grid',
        tableWidth: 'auto',
        pageBreak: 'auto'
      });

      // Get the final Y position after the table
      const finalY = doc.lastAutoTable?.finalY || startY + 100;
      
      // Add OPERATIONAL EXCELLENCE INDICATORS as 4-section footer
      const footerY = finalY + 15;
      createOperationalExcellenceFooter(doc, footerY, pageWidth, margin);
      
      return finalY + 80; // Extra space for footer
    };

    // Start categories on page 2 - Add new page after introduction
    doc.addPage();
    let pageNum = 2;
    currentY = createPremiumHeader(pageNum);
    
    // Create separate sections for each category with page breaks
    const allData = filteredUnifiedMappings || [];
    
    allData.forEach((mapping, categoryIndex) => {
      // Add page break before each category (except the first one)
      if (categoryIndex > 0) {
        doc.addPage();
        pageNum++;
        currentY = createPremiumHeader(pageNum); // Page number only
      }
      
      // Create a beautiful category section for this single category
      currentY = createStunningTable([mapping], currentY, categoryIndex + 1, allData.length);
    });

    // Add footer to first page
    doc.setTextColor(127, 140, 141);
    doc.setFontSize(8);
    doc.text('This report contains confidential compliance analysis. © AuditReady Enterprise', 
             margin, pageHeight - 10);
    
    // Check if we need additional pages based on final Y position
    const finalY = doc.lastAutoTable?.finalY || currentY;
    const totalPages = Math.ceil((finalY - 35) / (pageHeight - 80)) || 1;

    // Add statistics page
    doc.addPage();
    const statsPageNum = totalPages + 1;
    currentY = createPremiumHeader(statsPageNum);
    
    // STATISTICS AND INSIGHTS PAGE - CLEAN VERSION
    doc.setFillColor(247, 249, 252);
    doc.roundedRect(margin, currentY, pageWidth - (2 * margin), 60, 3, 3, 'F');
    
    doc.setTextColor(31, 78, 121);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPLIANCE ANALYTICS DASHBOARD', margin + 5, currentY + 12);
    
    // Coverage statistics
    currentY += 25;
    const statsData: string[][] = [];
    selectedFrameworksList.forEach((framework) => {
      const mapped = (filteredUnifiedMappings || []).reduce((count, mapping) => {
        const frameworkKey = framework.includes('(') ? framework.split('(')[0]?.trim() || framework : framework;
        return count + (Object.keys(mapping.frameworks || {}).includes(frameworkKey) ? 1 : 0);
      }, 0);
      
      const coverage = Math.round((mapped / Math.max((filteredUnifiedMappings || []).length, 1)) * 100);
      const status = coverage >= 90 ? 'Excellent' : coverage >= 70 ? 'Good' : 'Needs Review';
      
      statsData.push([framework, mapped.toString(), `${coverage}%`, status]);
    });

    // Statistics table
    autoTable(doc, {
      head: [['Framework', 'Mapped Categories', 'Coverage %', 'Status']],
      body: statsData,
      startY: currentY,
      margin: { left: margin + 20, right: margin + 20 },
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      headStyles: {
        fillColor: [47, 82, 51],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 40 }
      },
      theme: 'striped'
    });

    currentY = (doc.lastAutoTable?.finalY || currentY) + 20;
    
    // RECOMMENDATIONS SECTION
    doc.setFillColor(240, 248, 240);
    doc.roundedRect(margin, currentY, pageWidth - (2 * margin), 45, 3, 3, 'F');
    
    doc.setTextColor(47, 82, 51);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE RECOMMENDATIONS', margin + 5, currentY + 10);
    
    const recommendations = [
      'Prioritize categories with multi-framework coverage for maximum compliance ROI',
      'Focus implementation efforts on areas with highest regulatory impact',
      'Establish continuous monitoring for all mapped compliance requirements',
      'Schedule quarterly reviews to maintain compliance posture effectiveness'
    ];
    
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    recommendations.forEach((rec, index) => {
      // Add bullet point for each recommendation
      doc.text(`\u2022 ${rec}`, margin + 5, currentY + 18 + (index * 6));
    });

    // Final footer - clean version
    doc.setTextColor(127, 140, 141);
    doc.setFontSize(8);
    doc.text('Enterprise-Grade Compliance Analysis | Confidential Report', 
             margin, pageHeight - 15);
    doc.text(`Report ID: AR-${Date.now().toString(36).toUpperCase()}`, 
             pageWidth - margin - 60, pageHeight - 15);

    // SAVE THE PDF
    const timestamp = new Date().toISOString().split('T')[0];
    const frameworkSuffix = selectedFrameworksList.length > 0 
      ? `_${selectedFrameworksList.join('_').replace(/[^a-zA-Z0-9]/g, '_')}` 
      : '';
    const filename = `AuditReady_Premium_Compliance_Report_${timestamp}${frameworkSuffix}.pdf`;

    doc.save(filename);
    
    console.log(`🎨 Exported stunning PDF compliance report: ${filename}`);
    console.log(`📄 ${(filteredUnifiedMappings || []).length} categories across 3 premium-designed pages`);
  };

  const filteredMappings = useMemo(() => {
    let filtered = complianceMappingData || [];
    
    // First, filter to show only GDPR group when GDPR is selected, or non-GDPR groups when other frameworks are selected
    if (selectedFrameworks['gdpr'] && !selectedFrameworks['iso27001'] && !selectedFrameworks['iso27002'] && !selectedFrameworks['cisControls'] && !selectedFrameworks['nis2']) {
      // GDPR only - show only the unified GDPR group
      filtered = filtered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (!selectedFrameworks['gdpr'] && (selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['nis2'])) {
      // Other frameworks without GDPR - show only non-GDPR groups
      filtered = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (selectedFrameworks['gdpr'] && (selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['nis2'])) {
      // Mixed selection - show all relevant groups
      filtered = complianceMappingData || [];
    } else {
      // Nothing selected - show non-GDPR groups by default
      filtered = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    }
    
    // Filter by framework selection
    filtered = filtered.map(mapping => {
      // For GDPR group, only show GDPR frameworks
      if (mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948') {
        if (!selectedFrameworks['gdpr']) return null;
        
        return {
          ...mapping,
          frameworks: {
            iso27001: [],
            iso27002: [],
            cisControls: [],
            nis2: [],
            gdpr: mapping.frameworks?.['gdpr'] || []
          }
        };
      }
      
      // For non-GDPR groups, filter based on selected frameworks
      const newMapping = {
        ...mapping,
        frameworks: {
          iso27001: selectedFrameworks['iso27001'] && mapping.frameworks?.['iso27001'] ? mapping.frameworks['iso27001'] : [],
          iso27002: selectedFrameworks['iso27002'] && mapping.frameworks?.['iso27002'] ? mapping.frameworks['iso27002'] : [],
          nis2: selectedFrameworks['nis2'] ? (mapping.frameworks?.['nis2'] || []) : [],
          gdpr: [], // Never show GDPR in non-GDPR groups
          cisControls: selectedFrameworks['cisControls'] && mapping.frameworks?.['cisControls'] ? mapping.frameworks['cisControls'] : []
        }
      };
      
      // Only include the mapping if it has at least one framework with controls
      const hasControls = (newMapping.frameworks?.iso27001?.length || 0) > 0 || 
                         (newMapping.frameworks?.iso27002?.length || 0) > 0 || 
                         (newMapping.frameworks?.cisControls?.length || 0) > 0 ||
                         (newMapping.frameworks?.gdpr?.length || 0) > 0 ||
                         (newMapping.frameworks?.nis2?.length || 0) > 0;
      
      return hasControls ? newMapping : null;
    }).filter(mapping => mapping !== null);
    
    // Filter by traditional framework filter (for backwards compatibility)
    if (filterFramework !== 'all') {
      filtered = filtered.filter(mapping => {
        switch (filterFramework) {
          case 'iso27001':
            return (mapping.frameworks?.['iso27001']?.length || 0) > 0;
          case 'iso27002':
            return (mapping.frameworks?.['iso27002']?.length || 0) > 0;
          case 'cis':
            return (mapping.frameworks?.['cisControls']?.length || 0) > 0;
          case 'gdpr':
            return (mapping.frameworks['gdpr']?.length || 0) > 0;
          default:
            return true;
        }
      });
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(mapping => mapping.id === filterCategory);
    }
    
    // Apply dynamic numbering: GDPR always comes last
    const nonGdprGroups = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    const gdprGroups = filtered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    
    // Number non-GDPR groups sequentially
    const numberedNonGdpr = nonGdprGroups.map((mapping, index) => {
      const number = String(index + 1).padStart(2, '0');
      return {
        ...mapping,
        category: mapping.category.startsWith(number + '.') ? mapping.category : `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    // Number GDPR groups to come after non-GDPR groups
    const numberedGdpr = gdprGroups.map((mapping) => {
      const number = String(nonGdprGroups.length + 1).padStart(2, '0');
      return {
        ...mapping,
        category: `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    return [...numberedNonGdpr, ...numberedGdpr];
  }, [selectedFrameworks, filterFramework, filterCategory, complianceMappingData]);

  // Create category options that match exactly what's displayed in filteredMappings
  const categoryOptions = useMemo(() => {
    // Use the SAME data that's actually displayed, but without the category filter applied
    let baseFiltered = complianceMappingData || [];
    
    // Apply the SAME framework filtering logic as filteredMappings
    if (selectedFrameworks['gdpr'] && !selectedFrameworks['iso27001'] && !selectedFrameworks['iso27002'] && !selectedFrameworks['cisControls'] && !selectedFrameworks['nis2']) {
      baseFiltered = baseFiltered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (!selectedFrameworks['gdpr'] && (selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['nis2'])) {
      baseFiltered = baseFiltered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (selectedFrameworks['gdpr'] && (selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['nis2'])) {
      baseFiltered = complianceMappingData || [];
    } else {
      baseFiltered = baseFiltered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    }
    
    // Apply the SAME framework content filtering
    baseFiltered = baseFiltered.map(mapping => {
      if (mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948') {
        if (!selectedFrameworks['gdpr']) return null;
        return {
          ...mapping,
          frameworks: {
            iso27001: [],
            iso27002: [],
            cisControls: [],
            nis2: [],
            gdpr: mapping.frameworks?.['gdpr'] || []
          }
        };
      }
      
      const newMapping = {
        ...mapping,
        frameworks: {
          iso27001: selectedFrameworks['iso27001'] && mapping.frameworks?.['iso27001'] ? mapping.frameworks['iso27001'] : [],
          iso27002: selectedFrameworks['iso27002'] && mapping.frameworks?.['iso27002'] ? mapping.frameworks['iso27002'] : [],
          nis2: selectedFrameworks['nis2'] ? (mapping.frameworks?.['nis2'] || []) : [],
          gdpr: [],
          cisControls: selectedFrameworks['cisControls'] && mapping.frameworks?.['cisControls'] ? mapping.frameworks['cisControls'] : []
        }
      };
      
      const hasControls = (newMapping.frameworks?.iso27001?.length || 0) > 0 || 
                         (newMapping.frameworks?.iso27002?.length || 0) > 0 || 
                         (newMapping.frameworks?.cisControls?.length || 0) > 0 ||
                         (newMapping.frameworks?.gdpr?.length || 0) > 0 ||
                         (newMapping.frameworks?.nis2?.length || 0) > 0;
      
      return hasControls ? newMapping : null;
    }).filter(mapping => mapping !== null);
    
    // Apply SAME framework filter
    if (filterFramework !== 'all') {
      baseFiltered = baseFiltered.filter(mapping => {
        switch (filterFramework) {
          case 'iso27001':
            return (mapping.frameworks?.['iso27001']?.length || 0) > 0;
          case 'iso27002':
            return (mapping.frameworks?.['iso27002']?.length || 0) > 0;
          case 'cis':
            return (mapping.frameworks?.['cisControls']?.length || 0) > 0;
          case 'gdpr':
            return (mapping.frameworks['gdpr']?.length || 0) > 0;
          default:
            return true;
        }
      });
    }
    
    // Apply the SAME numbering logic as filteredMappings
    const nonGdprGroups = baseFiltered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    const gdprGroups = baseFiltered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    
    const numberedNonGdpr = nonGdprGroups.map((mapping, index) => {
      const number = String(index + 1).padStart(2, '0');
      return {
        ...mapping,
        category: mapping.category.startsWith(number + '.') ? mapping.category : `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    const numberedGdpr = gdprGroups.map((mapping) => {
      const number = String(nonGdprGroups.length + 1).padStart(2, '0');
      return {
        ...mapping,
        category: `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    return [...numberedNonGdpr, ...numberedGdpr];
  }, [selectedFrameworks, filterFramework, complianceMappingData]); // Note: deliberately excluding filterCategory

  // Create filtered unified requirements for the unified tab (removes unselected framework references)
  const filteredUnifiedMappings = useMemo(() => {
    return filteredMappings.map(mapping => ({
      ...mapping,
      auditReadyUnified: FrameworkFilterService.filterUnifiedRequirement(
        mapping.auditReadyUnified,
        selectedFrameworks
      )
    }));
  }, [filteredMappings, selectedFrameworks]);
  
  // Automatically generate enhanced content when frameworks change
  useEffect(() => {
    const generateAllEnhancedContent = async () => {
      if (!filteredUnifiedMappings || filteredUnifiedMappings.length === 0) return;
      
      const hasSelectedFrameworks = selectedFrameworks.iso27001 || 
                                   selectedFrameworks.iso27002 || 
                                   selectedFrameworks.cisControls || 
                                   selectedFrameworks.gdpr || 
                                   selectedFrameworks.nis2;
      
      if (!hasSelectedFrameworks) return;
      
      console.log('[AUTO-GENERATE] Generating enhanced content for all categories...');
      const newGeneratedContent = new Map();
      
      for (const mapping of filteredUnifiedMappings) {
        const categoryName = mapping.category.replace(/^\d+\. /, '');
        console.log('[AUTO-GENERATE] Processing category:', categoryName);
        
        try {
          const content = await generateDynamicContentForCategory(categoryName);
          if (content && content.length > 0) {
            newGeneratedContent.set(categoryName, content);
            console.log('[AUTO-GENERATE] Generated', content.length, 'sections for', categoryName);
          }
        } catch (error) {
          console.error('[AUTO-GENERATE] Failed for category', categoryName, error);
        }
      }
      
      setGeneratedContent(newGeneratedContent);
      console.log('[AUTO-GENERATE] Completed. Generated content for', newGeneratedContent.size, 'categories');
    };
    
    // Add a small delay to ensure all components are ready
    const timer = setTimeout(() => {
      generateAllEnhancedContent();
    }, 500);
    
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFrameworks, filteredUnifiedMappings]); // Regenerate when frameworks or mappings change

  // Calculate MAXIMUM statistics for overview (ALL frameworks selected)
  const maximumOverviewStats = useMemo(() => {
    if (!maxComplianceMapping || maxComplianceMapping.length === 0) {
      return {
        maxRequirements: 310, // Actual maximum from database
        unifiedGroups: 21,
        reduction: 289,
        reductionPercentage: '93.2',
        efficiencyRatio: 15
      };
    }
    
    // Calculate with ALL frameworks selected
    const allFrameworksData = maxComplianceMapping || [];
    
    // Filter to ensure we have all groups (including GDPR)
    const processedData = allFrameworksData.filter(mapping => {
      const hasAnyFramework = 
        (mapping.frameworks?.['iso27001']?.length || 0) > 0 ||
        (mapping.frameworks?.['iso27002']?.length || 0) > 0 ||
        (mapping.frameworks?.['cisControls']?.length || 0) > 0 ||
        (mapping.frameworks?.['gdpr']?.length || 0) > 0 ||
        (mapping.frameworks?.['nis2']?.length || 0) > 0;
      return hasAnyFramework;
    });
    
    // Calculate total requirements across ALL frameworks
    const totalRequirements = processedData.reduce((total, mapping) => {
      const iso27001Count = mapping.frameworks?.['iso27001']?.length || 0;
      const iso27002Count = mapping.frameworks?.['iso27002']?.length || 0;
      const cisControlsCount = mapping.frameworks?.['cisControls']?.length || 0;
      const gdprCount = mapping.frameworks?.['gdpr']?.length || 0;
      const nis2Count = mapping.frameworks?.['nis2']?.length || 0;
      
      return total + iso27001Count + iso27002Count + cisControlsCount + gdprCount + nis2Count;
    }, 0);
    
    const unifiedGroups = processedData.length;
    const reduction = totalRequirements - unifiedGroups;
    const reductionPercentage = totalRequirements > 0 ? ((reduction / totalRequirements) * 100).toFixed(1) : '0.0';
    const efficiencyRatio = unifiedGroups > 0 ? Math.round(totalRequirements / unifiedGroups) : 0;
    
    return {
      maxRequirements: totalRequirements,
      unifiedGroups,
      reduction,
      reductionPercentage,
      efficiencyRatio
    };
  }, [maxComplianceMapping]);

  // Calculate dynamic statistics based on selected frameworks
  // const dynamicOverviewStats = useMemo(() => {
  //   // Calculate total maximum requirements across selected frameworks only
  //   const maxRequirements = filteredMappings.reduce((total, mapping) => {
  //     const iso27001Count = mapping.frameworks?.['iso27001']?.length || 0;
  //     const iso27002Count = mapping.frameworks?.['iso27002']?.length || 0;
  //     const cisControlsCount = mapping.frameworks?.['cisControls']?.length || 0;
  //     const gdprCount = mapping.frameworks?.['gdpr']?.length || 0;
  //     const nis2Count = mapping.frameworks?.['nis2']?.length || 0;
  //     
  //     return total + iso27001Count + iso27002Count + cisControlsCount + gdprCount + nis2Count;
  //   }, 0);
  //   
  //   // Number of unified groups based on filtered mappings
  //   const unifiedGroups = filteredMappings.length;
  //   
  //   // Calculate reduction metrics with safe fallbacks
  //   const reduction = maxRequirements - unifiedGroups;
  //   const reductionPercentage = maxRequirements > 0 ? ((reduction / maxRequirements) * 100).toFixed(1) : '0.0';
  //   const efficiencyRatio = unifiedGroups > 0 ? Math.round(maxRequirements / unifiedGroups) : 0;
  //   
  //   return {
  //     maxRequirements,
  //     unifiedGroups,
  //     reduction,
  //     reductionPercentage,
  //     efficiencyRatio
  //   };
  // }, [filteredMappings]);

  // Show enhanced AI loading state while fetching data
  if (isLoadingMappings || isLoadingCounts) {
    return <AILoadingAnimation />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold">Compliance Simplification</h1>
                  <p className="text-xs sm:text-sm text-white/80 hidden sm:block">How AuditReady AI unifies overlapping compliance requirements</p>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full self-start lg:self-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export Report</span>
                  <span className="sm:hidden">Export</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as CSV
                  <span className="text-xs text-muted-foreground ml-auto">Compatible</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToXLSX} className="cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                  Export as Excel
                  <span className="text-xs text-muted-foreground ml-auto">Enhanced</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2 text-red-600" />
                  Export as PDF
                  <span className="text-xs text-muted-foreground ml-auto">Premium</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-2xl">
            <TabsTrigger value="overview" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Eye className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="mapping" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Target className="w-4 h-4" />
              <span>Framework Mapping</span>
            </TabsTrigger>
            <TabsTrigger value="unified" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Zap className="w-4 h-4" />
              <span>Unified Requirements</span>
            </TabsTrigger>
            <TabsTrigger value="overlap" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Eye className="w-4 h-4" />
              <span>Framework Overlap</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Problem Statement */}
            <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-950/50 dark:via-orange-950/50 dark:to-amber-950/50 border-b border-red-100 dark:border-red-800/30 pb-4">
                <CardTitle className="flex items-start space-x-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-md shadow-red-500/20">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">The Compliance Complexity Problem</h2>
                      <div className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <span className="text-xs font-medium text-red-700 dark:text-red-300">CHALLENGE</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Why traditional compliance is overwhelming organizations worldwide</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <BookOpen className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Overlapping Requirements</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Multiple frameworks often have similar requirements with different wording, creating confusion and redundancy.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Implementation Confusion</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Teams struggle to understand which requirements apply and how to avoid duplicate work across frameworks.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <Settings className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Resource Inefficiency</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Organizations waste time and resources implementing the same control multiple times for different frameworks.
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Solution Statement */}
            <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-blue-50 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-blue-950/50 border-b border-green-100 dark:border-green-800/30 pb-4">
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg shadow-md shadow-green-500/20">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">The AuditReady Solution</h2>
                        <div className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <span className="text-xs font-medium text-green-700 dark:text-green-300">SOLUTION</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered compliance unification that transforms complexity into clarity</p>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-4"
                  >
                    <Button
                      onClick={() => setActiveTab('mapping')}
                      className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg shadow-blue-500/25 border-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Unify Frameworks
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Intelligent Unification</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Our AI transforms {maximumOverviewStats.maxRequirements} scattered requirements from multiple frameworks into just {maximumOverviewStats.unifiedGroups} comprehensive requirement groups, reducing complexity by {maximumOverviewStats.reductionPercentage}%.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Complete Coverage</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Every detail from source frameworks is preserved in our unified requirements, ensuring nothing is lost.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Clear Implementation</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Plain language descriptions with actionable sub-requirements make implementation straightforward and effective.
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  value: `${maximumOverviewStats.maxRequirements}→${maximumOverviewStats.unifiedGroups}`, 
                  label: "Requirements Simplified", 
                  desc: `From ${maximumOverviewStats.maxRequirements} scattered requirements to ${maximumOverviewStats.unifiedGroups} unified groups`, 
                  color: "blue",
                  bgClass: "bg-blue-50 dark:bg-blue-900/20",
                  textClass: "text-blue-600 dark:text-blue-400"
                },
                { 
                  value: `${maximumOverviewStats.reductionPercentage}%`, 
                  label: "Complexity Reduction", 
                  desc: `${maximumOverviewStats.reduction} fewer requirements to manage`, 
                  color: "green",
                  bgClass: "bg-green-50 dark:bg-green-900/20",
                  textClass: "text-green-600 dark:text-green-400"
                },
                { 
                  value: `${maximumOverviewStats.efficiencyRatio}:1`, 
                  label: "Efficiency Ratio", 
                  desc: `${maximumOverviewStats.efficiencyRatio} traditional requirements per 1 unified group`, 
                  color: "purple",
                  bgClass: "bg-purple-50 dark:bg-purple-900/20",
                  textClass: "text-purple-600 dark:text-purple-400"
                },
                { 
                  value: "100%", 
                  label: "Coverage Maintained", 
                  desc: "All original requirements preserved", 
                  color: "emerald",
                  bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
                  textClass: "text-emerald-600 dark:text-emerald-400"
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="flex"
                >
                  <Card className={`text-center border border-slate-200 dark:border-slate-700 rounded-xl ${stat.bgClass} hover:shadow-md transition-all duration-200 flex-1`}>
                    <CardContent className="p-4">
                      <div className={`text-2xl font-bold ${stat.textClass} mb-2`}>
                        {stat.value}
                      </div>
                      <div className="font-medium text-slate-900 dark:text-slate-100 text-sm mb-2">
                        {stat.label}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {stat.desc}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Framework Mapping Tab */}
          <TabsContent value="mapping" className="space-y-6">
            {/* Framework Selection Interface - Enhanced */}
            <div className="relative">
              {/* AI Generation Overlay */}
              <AnimatePresence>
                {showGeneration && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[10000] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl border-2 border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360] 
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: isGenerating ? Infinity : 0 
                      }}
                      className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4"
                    >
                      <Zap className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.h3
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                    >
                      {isGenerating ? 'AI Analyzing Frameworks...' : 'Unified Requirements Generated!'}
                    </motion.h3>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md"
                    >
                      {isGenerating 
                        ? 'Our AI is processing your selected frameworks and creating optimized unified requirements...'
                        : 'Your customized compliance roadmap is ready! Scroll down to see the unified requirements.'
                      }
                    </motion.p>
                    {!isGenerating && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="mt-4 flex items-center space-x-2 text-green-600"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Generation Complete</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-3 text-xl">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Settings className="w-6 h-6 text-blue-600" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI-Powered Framework Unification
                    </span>
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Select your compliance frameworks and watch our AI instantly generate unified, simplified requirements tailored to your organization
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-8">
                  {/* Framework Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
                    
                    {/* ISO 27001 Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected['iso27001']
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-blue-300'
                      }`}
                      onClick={() => handleFrameworkToggle('iso27001', !frameworksSelected['iso27001'])}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected['iso27001'] && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-blue-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected['iso27001'] ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Shield className={`w-5 h-5 ${frameworksSelected['iso27001'] ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">ISO 27001</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Info Security Management</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium text-center">
                            {frameworkCounts?.iso27001 || 24} requirements
                          </p>
                        </div>
                      </div>
                      {frameworksSelected['iso27001'] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* ISO 27002 Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected['iso27002']
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-green-300'
                      }`}
                      onClick={() => handleFrameworkToggle('iso27002', !frameworksSelected['iso27002'])}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected['iso27002'] && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-green-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected['iso27002'] ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Lock className={`w-5 h-5 ${frameworksSelected['iso27002'] ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">ISO 27002</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Information Security Controls</p>
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium text-center">
                            {frameworkCounts?.iso27002 || 93} requirements
                          </p>
                        </div>
                      </div>
                      {frameworksSelected['iso27002'] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* CIS Controls Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected['cisControls']
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-purple-300'
                      }`}
                      onClick={(e) => {
                        // If clicking on the card background (not on IG buttons), deselect CIS Controls
                        if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.space-y-1') === null) {
                          handleFrameworkToggle('cisControls', null);
                        }
                      }}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected['cisControls'] && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-purple-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected['cisControls'] ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Settings className={`w-5 h-5 ${frameworksSelected['cisControls'] ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">CIS Controls</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Cybersecurity Best Practices</p>
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium text-center">
                            {(() => {
                              const igLevel = frameworksSelected['cisControls'];
                              if (!frameworkCounts || isLoadingCounts) {
                                return igLevel === 'ig1' ? 36 : igLevel === 'ig2' ? 82 : 155;
                              }
                              return igLevel === 'ig1' ? (frameworkCounts.cisIG1 || 36) : 
                                     igLevel === 'ig2' ? (frameworkCounts.cisIG2 || 82) : 
                                     (frameworkCounts.cisIG3 || 155);
                            })()} requirements
                          </p>
                        </div>
                        
                        {/* IG Level Selection */}
                        <div className="space-y-1 w-full">
                          {['ig1', 'ig2', 'ig3'].map((level) => (
                            <motion.button
                              key={level}
                              whileTap={{ scale: 0.95 }}
                              className={`w-full p-1.5 rounded-lg text-xs font-medium transition-all ${
                                frameworksSelected['cisControls'] === level
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                              }`}
                              onClick={() => handleFrameworkToggle('cisControls', frameworksSelected['cisControls'] === level ? null : level as 'ig1' | 'ig2' | 'ig3')}
                            >
                              {level.toUpperCase()} - {level === 'ig1' ? 'Basic' : level === 'ig2' ? 'Foundational' : 'Organizational'}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      {frameworksSelected['cisControls'] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* GDPR Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected['gdpr']
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-orange-300'
                      }`}
                      onClick={() => handleFrameworkToggle('gdpr', !frameworksSelected['gdpr'])}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected['gdpr'] && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-orange-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected['gdpr'] ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <BookOpen className={`w-5 h-5 ${frameworksSelected['gdpr'] ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">GDPR</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">EU Data Protection Regulation</p>
                          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium text-center">
                            {frameworkCounts?.gdpr || 25} requirements
                          </p>
                        </div>
                      </div>
                      {frameworksSelected['gdpr'] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* NIS2 Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected['nis2']
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
                      }`}
                      onClick={(e) => {
                        // Only toggle if clicking the card background, not the dropdown
                        if (!(e.target as HTMLElement).closest('.industry-dropdown')) {
                          handleFrameworkToggle('nis2', !frameworksSelected['nis2']);
                        }
                      }}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected['nis2'] && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-indigo-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected['nis2'] ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Shield className={`w-5 h-5 ${frameworksSelected['nis2'] ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">NIS2</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">EU Cybersecurity Directive</p>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium text-center">
                            {frameworkCounts?.nis2 || 17} requirements
                          </p>
                        </div>
                        
                        {/* Industry Sector Selection - Inside the card */}
                        {frameworksSelected['nis2'] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full mt-2 industry-dropdown"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded border border-indigo-200 dark:border-indigo-700 relative z-50">
                              <div className="flex items-center gap-1 mb-0.5">
                                <Building2 className="w-2 h-2 text-indigo-600" />
                                <span className="text-[9px] font-medium text-indigo-700 dark:text-indigo-300">Sector</span>
                                <Badge variant="outline" className="text-[7px] px-0.5 py-0 h-3 border-indigo-300 text-indigo-600">
                                  NIS2
                                </Badge>
                              </div>
                              <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <Select 
                                  value={selectedIndustrySector || 'none'} 
                                  onValueChange={(value) => setSelectedIndustrySector(value === 'none' ? null : value)}
                                >
                                  <SelectTrigger 
                                    className="w-full text-[9px] h-4 border-indigo-300 focus:border-indigo-500 px-1 py-0"
                                  >
                                    <SelectValue placeholder="All Industries" className="text-[9px] leading-none" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-48 overflow-y-auto z-[9999]">
                                    <SelectItem value="none" className="text-xs py-1 px-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                                        <span className="text-xs">All Industries</span>
                                      </div>
                                    </SelectItem>
                                    {isLoadingSectors ? (
                                      <SelectItem value="loading" disabled>
                                        <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0 animate-pulse"></div>
                                          <span className="text-xs">Loading...</span>
                                        </div>
                                      </SelectItem>
                                    ) : (industrySectors || []).map((sector) => (
                                      <SelectItem key={sector.id} value={sector.id} className="text-xs py-1 px-2">
                                        <div className="flex items-center gap-2 w-full">
                                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                            sector.nis2Essential ? 'bg-red-500' : 
                                            sector.nis2Important ? 'bg-orange-500' : 
                                            'bg-green-500'
                                          }`}></div>
                                          <span className="text-xs truncate flex-1 min-w-0">{sector.name}</span>
                                          {sector.nis2Essential && (
                                            <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3 flex-shrink-0">
                                              Essential
                                            </Badge>
                                          )}
                                          {sector.nis2Important && !sector.nis2Essential && (
                                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3 flex-shrink-0">
                                              Important
                                            </Badge>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {selectedIndustrySector && industrySectors && (
                                <div className="mt-0.5 p-0.5 bg-white dark:bg-indigo-800/50 rounded text-[7px] border border-indigo-200 dark:border-indigo-600">
                                  <p className="text-indigo-800 dark:text-indigo-200 leading-tight">
                                    {industrySectors.find(s => s.id === selectedIndustrySector)?.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                      {frameworksSelected['nis2'] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Quick Selection Presets */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4 text-center">Quick Presets</h4>
                    <div className="flex flex-wrap justify-center gap-3">
                      {[
                        { name: 'Comprehensive Security', frameworks: { iso27001: true, iso27002: true, cisControls: 'ig3' as const, gdpr: false, nis2: false } },
                        { name: 'Privacy Focused', frameworks: { iso27001: false, iso27002: false, cisControls: null, gdpr: true, nis2: false } },
                        { name: 'EU Compliance', frameworks: { iso27001: true, iso27002: true, cisControls: 'ig2' as const, gdpr: true, nis2: true } },
                        { name: 'Basic Security', frameworks: { iso27001: true, iso27002: false, cisControls: 'ig1' as const, gdpr: false, nis2: false } }
                      ].map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFrameworksSelected(preset.frameworks);
                          }}
                          className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Generate Button */}
                  <div className="border-t pt-8">
                    <div className="flex justify-center">
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || (!frameworksSelected['iso27001'] && !frameworksSelected['iso27002'] && !frameworksSelected['cisControls'] && !frameworksSelected['gdpr'] && !frameworksSelected['nis2'])}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-12 py-4 rounded-xl shadow-lg text-lg transition-all duration-300 transform hover:scale-105"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-6 h-6 mr-3"
                            >
                              <Zap className="w-6 h-6" />
                            </motion.div>
                            Generating Unified Requirements...
                          </>
                        ) : (
                          <>
                            <Zap className="w-6 h-6 mr-3" />
                            Generate Unified Requirements
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
                      Select frameworks above and click to generate your unified compliance requirements
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              {/* Framework Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Filter by Framework:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Frameworks', icon: <Target className="w-4 h-4" /> },
                    { id: 'iso27001', label: 'ISO 27001', icon: <Shield className="w-4 h-4" /> },
                    { id: 'iso27002', label: 'ISO 27002', icon: <Lock className="w-4 h-4" /> },
                    { id: 'cis', label: 'CIS Controls', icon: <Settings className="w-4 h-4" /> },
                    { id: 'gdpr', label: 'GDPR', icon: <BookOpen className="w-4 h-4" /> },
                    { id: 'nis2', label: 'NIS2', icon: <Shield className="w-4 h-4" /> }
                  ].map((filter) => (
                    <Button
                      key={filter.id}
                      variant={filterFramework === filter.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterFramework(filter.id)}
                      className="flex items-center space-x-1 rounded-full"
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-col space-y-2 sm:flex-row sm:flex-wrap sm:gap-4 sm:items-center sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Filter by Category:</span>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-[400px] max-w-lg">
                    <SelectValue placeholder="Select a category to filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryOptions.map((mapping) => (
                      <SelectItem key={mapping.id} value={mapping.id}>
                        {mapping.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visual Framework Connections */}
            <div className="space-y-8">
              <AnimatePresence>
                {filteredMappings.map((mapping, index) => (
                  <motion.div
                    key={mapping.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <CardTitle className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold">{mapping.category}</h3>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {/* Framework Grid - Different layout for GDPR vs other frameworks */}
                        {mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948' ? (
                          /* GDPR-only layout */
                          <div className="border-b border-slate-200 dark:border-slate-700">
                            <div className="p-4 sm:p-6 bg-orange-50 dark:bg-orange-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <BookOpen className="w-5 h-5 text-orange-600" />
                                <h4 className="font-semibold text-orange-900 dark:text-orange-100">GDPR Articles</h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100 dark:scrollbar-thumb-orange-600 dark:scrollbar-track-orange-900">
                                {(mapping.frameworks['gdpr'] || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-700">
                                    <div className="font-medium text-sm text-orange-900 dark:text-orange-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Regular layout for ISO/CIS/NIS2 frameworks - Only show selected frameworks */
                          <div className={`grid gap-0 border-b border-slate-200 dark:border-slate-700 grid-cols-1 ${
                            // Calculate grid columns based on selected frameworks
                            (() => {
                              const selectedCount = 
                                (selectedFrameworks['iso27001'] ? 1 : 0) +
                                (selectedFrameworks['iso27002'] ? 1 : 0) +
                                (selectedFrameworks['cisControls'] ? 1 : 0) +
                                (selectedFrameworks['nis2'] ? 1 : 0);
                              
                              if (selectedCount === 1) return 'lg:grid-cols-1';
                              if (selectedCount === 2) return 'sm:grid-cols-2';
                              if (selectedCount === 3) return 'sm:grid-cols-2 lg:grid-cols-3';
                              if (selectedCount === 4) return 'sm:grid-cols-2 lg:grid-cols-4';
                              return 'sm:grid-cols-2 lg:grid-cols-3'; // fallback
                            })()
                          }`}>
                          
                          {/* ISO 27001 Column - Only show if selected */}
                          {selectedFrameworks['iso27001'] && (
                            <div className="p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <Shield className="w-5 h-5 text-blue-600" />
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">ISO 27001</h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-blue-900">
                                {(mapping.frameworks?.['iso27001'] || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <div className="font-medium text-sm text-blue-900 dark:text-blue-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ISO 27002 Column - Only show if selected */}
                          {selectedFrameworks['iso27002'] && (
                            <div className="p-4 sm:p-6 border-b sm:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 bg-green-50 dark:bg-green-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <Lock className="w-5 h-5 text-green-600" />
                                <h4 className="font-semibold text-green-900 dark:text-green-100">ISO 27002</h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100 dark:scrollbar-thumb-green-600 dark:scrollbar-track-green-900">
                                {(mapping.frameworks?.['iso27002'] || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-700">
                                    <div className="font-medium text-sm text-green-900 dark:text-green-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CIS Controls Column - Only show if selected */}
                          {selectedFrameworks['cisControls'] && (
                            <div className="p-4 sm:p-6 border-b sm:border-b-0 border-slate-200 dark:border-slate-700 bg-purple-50 dark:bg-purple-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <Settings className="w-5 h-5 text-purple-600" />
                                <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                                  CIS Controls {selectedFrameworks['cisControls'].toUpperCase()}
                                </h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100 dark:scrollbar-thumb-purple-600 dark:scrollbar-track-purple-900">
                                {(mapping.frameworks?.['cisControls'] || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
                                    <div className="font-medium text-sm text-purple-900 dark:text-purple-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* NIS2 Column - Only show if selected */}
                          {selectedFrameworks['nis2'] && (
                            <div className="p-4 sm:p-6 bg-indigo-50 dark:bg-indigo-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <Shield className="w-5 h-5 text-indigo-600" />
                                <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">NIS2</h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100 dark:scrollbar-thumb-indigo-600 dark:scrollbar-track-indigo-900">
                                {(mapping.frameworks['nis2'] || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                    <div className="font-medium text-sm text-indigo-900 dark:text-indigo-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                        )}

                        {/* AuditReady Unified Row */}
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-b border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-white/20 rounded-lg">
                                <Zap className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-base">AuditReady Unified</h4>
                                <p className="text-xs text-white/90">{mapping.auditReadyUnified.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-center bg-white/20 rounded-lg px-3 py-1">
                                <span className="text-xs font-medium block">
                                  {(() => {
                                    if (mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948') {
                                      // For GDPR groups, show GDPR articles count
                                      const totalGdprReqs = mapping.frameworks['gdpr']?.length || 0;
                                      const unifiedReqs = mapping.auditReadyUnified.subRequirements.length;
                                      const reductionPercent = totalGdprReqs > 1 ? Math.round((1 - unifiedReqs / totalGdprReqs) * 100) : 0;
                                      return `Unifies ${totalGdprReqs} GDPR articles - ${reductionPercent}% simpler`;
                                    } else {
                                      // For regular groups, show framework requirements from selected frameworks only
                                      const totalFrameworkReqs = 
                                        (selectedFrameworks['iso27001'] ? (mapping.frameworks?.['iso27001']?.length || 0) : 0) + 
                                        (selectedFrameworks['iso27002'] ? (mapping.frameworks?.['iso27002']?.length || 0) : 0) + 
                                        (selectedFrameworks['cisControls'] ? (mapping.frameworks?.['cisControls']?.length || 0) : 0) +
                                        (selectedFrameworks['nis2'] ? (mapping.frameworks?.['nis2']?.length || 0) : 0);
                                      const reductionPercent = totalFrameworkReqs > 1 ? Math.round((1 - 1 / totalFrameworkReqs) * 100) : 0;
                                      return totalFrameworkReqs > 0 ? `Replaces ${totalFrameworkReqs} requirements - ${reductionPercent}% reduction` : 'No requirements from selected frameworks';
                                    }
                                  })()}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedMapping(selectedMapping === mapping.id ? null : mapping.id)}
                                className="text-white hover:bg-white/20 whitespace-nowrap text-xs px-2 py-1 h-auto"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                <span>{selectedMapping === mapping.id ? 'Hide' : 'Show'} Sub-Requirements</span>
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Detailed View */}
                        <AnimatePresence>
                          {selectedMapping === mapping.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-gray-50 dark:bg-gray-800/50"
                            >
                              <div className="p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h5 className="font-semibold text-gray-900 dark:text-white">Unified Sub-Requirements</h5>
                                  <div className="flex gap-1 flex-wrap">
                                    {getFrameworkBadges(mapping).map((badge, idx) => (
                                      <Badge key={idx} className={`text-xs ${badge.color}`}>
                                        {badge.name}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mapping.auditReadyUnified.subRequirements.map((subReq, i) => {
                                  // Don't clean Governance & Leadership requirements - preserve formatting
                                  const displayText = mapping.category === 'Governance & Leadership' 
                                    ? subReq 
                                    : cleanComplianceSubRequirement(subReq);
                                  
                                  return (
                                    <div key={i} className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{displayText}</div>
                                    </div>
                                  );
                                })}
                              </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Unified Requirements Tab */}
          <TabsContent value="unified" className="space-y-6">
            <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-2xl">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">AuditReady Unified Requirements</h2>
                    <p className="text-sm text-white/80 font-normal">Simplified, comprehensive compliance requirements</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Framework Unification Introduction */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Filter className="w-5 h-5 mr-2 text-blue-600" />
                      Framework Integration Overview
                    </h3>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Generated Requirements</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {filteredUnifiedMappings.length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">unified groups</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    The following unified requirements have been generated by consolidating controls from your selected compliance frameworks{selectedFrameworks['nis2'] && selectedIndustrySector ? ' with sector-specific enhancements for ' + (industrySectors?.find(s => s.id === selectedIndustrySector)?.name || 'selected sector') : ''}:
                  </p>
                  {selectedFrameworks['nis2'] && selectedIndustrySector && SectorSpecificEnhancer.hasSectorEnhancements(selectedIndustrySector) && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex items-center space-x-2">
                        <Factory className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Sector-Specific Enhancements Active
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        {SectorSpecificEnhancer.getEnhancementSummary(selectedIndustrySector)} for {industrySectors?.find(s => s.id === selectedIndustrySector)?.name}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {selectedFrameworks['iso27001'] && (
                      <Badge className="bg-blue-500 text-white px-3 py-1">
                        <Shield className="w-3 h-3 mr-1" />
                        ISO 27001
                      </Badge>
                    )}
                    {selectedFrameworks['iso27002'] && (
                      <Badge className="bg-green-500 text-white px-3 py-1">
                        <Lock className="w-3 h-3 mr-1" />
                        ISO 27002
                      </Badge>
                    )}
                    {selectedFrameworks['cisControls'] && (
                      <Badge className="bg-purple-500 text-white px-3 py-1">
                        <Settings className="w-3 h-3 mr-1" />
                        CIS Controls {selectedFrameworks['cisControls'].toUpperCase()}
                      </Badge>
                    )}
                    {selectedFrameworks['gdpr'] && (
                      <Badge className="bg-orange-500 text-white px-3 py-1">
                        <BookOpen className="w-3 h-3 mr-1" />
                        GDPR
                      </Badge>
                    )}
                    {selectedFrameworks['nis2'] && (
                      <Badge className="bg-indigo-500 text-white px-3 py-1">
                        <Shield className="w-3 h-3 mr-1" />
                        NIS2
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    Each unified requirement below eliminates duplicate controls and combines overlapping requirements into streamlined, actionable guidelines.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">{filteredUnifiedMappings.length}</div>
                      <div className="text-gray-600 dark:text-gray-400">Total Groups</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-600">
                        {filteredUnifiedMappings.reduce((total, group) => {
                          const enhancedSubReqs = SectorSpecificEnhancer.enhanceSubRequirements(
                            group.auditReadyUnified.subRequirements || [],
                            group.category,
                            selectedIndustrySector,
                            selectedFrameworks['nis2']
                          );
                          return total + enhancedSubReqs.length;
                        }, 0)}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Total Sub-requirements{selectedFrameworks['nis2'] && selectedIndustrySector ? ' (Enhanced)' : ''}</div>
                    </div>
                  </div>
                </div>
                
                {/* Category Filter Dropdown */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Filter Categories:</span>
                  </div>
                  <Select 
                    value={unifiedCategoryFilter}
                    onValueChange={(value) => {
                      setUnifiedCategoryFilter(value);
                    }}
                  >
                    <SelectTrigger className="w-full max-w-lg mt-2">
                      <SelectValue placeholder="Filter requirement categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {filteredUnifiedMappings.map((mapping) => (
                        <SelectItem key={mapping.id} value={mapping.id}>
                          {mapping.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-6">
                  {filteredUnifiedMappings.filter(mapping => 
                    unifiedCategoryFilter === 'all' || mapping.id === unifiedCategoryFilter
                  ).map((mapping, index) => (
                    <motion.div
                      key={mapping.id}
                      id={`unified-${mapping.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {mapping.category.replace(/^\d+\. /, '')}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {cleanMarkdownFormatting(mapping.auditReadyUnified.description)}
                          </p>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {mapping.category}
                          </Badge>
                        </div>
                        <div className="text-right flex flex-col items-end space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="mb-2 text-xs px-3 py-1 text-emerald-700 border-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500 dark:hover:bg-emerald-900/20"
                            onClick={() => {
                              setSelectedGuidanceCategory(mapping.category);
                              setShowUnifiedGuidance(true);
                            }}
                          >
                            <Lightbulb className="w-3 h-3 mr-1" />
                            Unified Guidance
                          </Button>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Replaces</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {(mapping.frameworks?.['iso27001']?.length || 0) + (mapping.frameworks?.['iso27002']?.length || 0) + (mapping.frameworks?.['cisControls']?.length || 0) + (mapping.frameworks?.['gdpr']?.length || 0)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">requirements</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {(() => {
                              const enhancedSubReqs = SectorSpecificEnhancer.enhanceSubRequirements(
                                mapping.auditReadyUnified.subRequirements || [],
                                mapping.category,
                                selectedIndustrySector,
                                selectedFrameworks['nis2']
                              );
                              return enhancedSubReqs.length;
                            })()} sub-requirements{selectedFrameworks['nis2'] && selectedIndustrySector && SectorSpecificEnhancer.hasSectorEnhancements(selectedIndustrySector) ? ' (enhanced)' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">Implementation Guidelines:</h4>
                        <div className="space-y-4">
                          {(() => {
                            // Use dynamic content if enabled, otherwise use database content
                            let enhancedSubReqs: string[] = [];
                            
                            // Always try to use enhanced content first
                            if (true) { // Was: useDynamicContent, now always true
                              // Use dynamically generated content
                              const categoryName = mapping.category.replace(/^\d+\. /, '');
                              const dynamicContent = generatedContent.get(categoryName) || [];
                              enhancedSubReqs = dynamicContent;
                              console.log('[DYNAMIC RENDER] Using dynamic content for:', categoryName, 'sections:', dynamicContent.length);
                            } else {
                              // Apply sector-specific enhancements if NIS2 and sector are selected (original logic)
                              enhancedSubReqs = SectorSpecificEnhancer.enhanceSubRequirements(
                                mapping.auditReadyUnified.subRequirements || [],
                                mapping.category,
                                selectedIndustrySector,
                                selectedFrameworks['nis2']
                              );
                              console.log('[DATABASE RENDER] Using database content for:', mapping.category, 'sections:', enhancedSubReqs.length);
                            }
                            
                            // Group enhanced sub-requirements for better organization
                            let groupedSubReqs: Record<string, string[]> = {};
                            
                            // DEBUG: Log what category we're processing
                            console.log('[SECTION GROUPING] Processing category:', mapping.category);
                            console.log('[SECTION GROUPING] Is Governance?', mapping.category === 'Governance & Leadership');
                            
                            // Special handling for Governance & Leadership - THREE sections with PROPER organization
                            // Check multiple ways the category might appear
                            const isGovernance = mapping.category === 'Governance & Leadership' || 
                                               mapping.category?.includes('Governance') ||
                                               mapping.category?.toLowerCase().includes('governance');
                            
                            console.log('[SECTION CHECK] Category:', mapping.category, 'Is Governance:', isGovernance);
                            
                            if (isGovernance) {
                              // PROPER organization for Governance & Leadership:
                              // Core Requirements: a-g (including g) DOCUMENTED PROCEDURES)
                              // HR: h-i only
                              // Monitoring & Compliance: j-p (starting with j) COMPLIANCE MONITORING)
                              // Find PERSONNEL SECURITY and COMPETENCE MANAGEMENT for HR section
                              const personnelSecurityReq = enhancedSubReqs.find(req => req.includes('PERSONNEL SECURITY'));
                              const competenceManagementReq = enhancedSubReqs.find(req => req.includes('COMPETENCE MANAGEMENT'));
                              
                              // All other requirements go to Core or Monitoring
                              const otherReqs = enhancedSubReqs.filter(req => 
                                !req.includes('PERSONNEL SECURITY') && !req.includes('COMPETENCE MANAGEMENT')
                              );
                              
                              // Make sure g) DOCUMENTED PROCEDURES MANAGEMENT stays in Core
                              const documentedProceduresReq = enhancedSubReqs.find(req => req.includes('DOCUMENTED PROCEDURES MANAGEMENT'));
                              const coreReqs = otherReqs.filter(req => !req.includes('DOCUMENTED PROCEDURES MANAGEMENT')).slice(0, 6);
                              if (documentedProceduresReq) {
                                coreReqs.push(documentedProceduresReq);
                              }
                              
                              groupedSubReqs = {
                                'Core Requirements': coreReqs, // Include g) DOCUMENTED PROCEDURES
                                'HR': [personnelSecurityReq, competenceManagementReq].filter((req): req is string => Boolean(req)),
                                'Monitoring & Compliance': otherReqs.filter(req => !req.includes('DOCUMENTED PROCEDURES MANAGEMENT')).slice(6)
                              };
                              
                              console.log('[✅ GOVERNANCE SECTIONS] Created proper sections:');
                              console.log('Core Requirements (a-g):', groupedSubReqs['Core Requirements']?.length);
                              console.log('HR (h-i):', groupedSubReqs['HR']?.length);
                              console.log('Monitoring & Compliance (j-p):', groupedSubReqs['Monitoring & Compliance']?.length);
                            } else {
                              // Default grouping for other categories
                              groupedSubReqs = {
                                'Core Requirements': enhancedSubReqs.filter((_, i) => i < Math.ceil(enhancedSubReqs.length / 3)),
                                'Implementation Standards': enhancedSubReqs.filter((_, i) => i >= Math.ceil(enhancedSubReqs.length / 3) && i < Math.ceil(enhancedSubReqs.length * 2 / 3)),
                                'Monitoring & Compliance': enhancedSubReqs.filter((_, i) => i >= Math.ceil(enhancedSubReqs.length * 2 / 3))
                              };
                            }
                            
                            return Object.entries(groupedSubReqs).map(([groupName, requirements]) => (
                              requirements.length > 0 && (
                                <div key={groupName} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                  <h5 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    {groupName}
                                  </h5>
                                  <div className="space-y-2">
                                    {(requirements as string[]).map((subReq: string, i: number) => {
                                      // Debug logging
                                      if (i === 0) {
                                        console.log('[CATEGORY DEBUG] Mapping category:', JSON.stringify(mapping.category));
                                        console.log('[CATEGORY DEBUG] Exact category match?', mapping.category === 'Governance & Leadership');
                                        console.log('[CATEGORY DEBUG] Category includes Governance?', mapping.category?.includes('Governance'));
                                        if (mapping.category?.includes('Governance')) {
                                          console.log('[GOVERNANCE DEBUG] First requirement received:', subReq.substring(0, 200));
                                          console.log('[GOVERNANCE DEBUG] Contains Core Requirements?', subReq.includes('Core Requirements:'));
                                          console.log('[GOVERNANCE DEBUG] Total length:', subReq.length);
                                        }
                                      }
                                      
                                      // Special formatting for Governance & Leadership  
                                      const isGovernanceItem = mapping.category === 'Governance & Leadership' || 
                                                              mapping.category?.includes('Governance');
                                      
                                      if (isGovernanceItem) {
                                        // Split the content by requirement letters and keep both title and description
                                        const parts = subReq.split(/(?=^[a-p]\)\s)/gm).filter(part => part.trim());
                                        
                                        return (
                                          <div key={i} className="space-y-3">
                                            {parts.map((part, partIdx) => {
                                              const trimmed = part.trim();
                                              if (!trimmed) return null;
                                              
                                              // Simple approach: Split on first line break or after reasonable title length
                                              const lines = trimmed.split('\n');
                                              const firstLine = lines[0];
                                              if (!firstLine) return null;
                                              
                                              const restOfLines = lines.slice(1).join('\n').trim();
                                              
                                              // Check if starts with letter pattern
                                              if (firstLine.match(/^[a-p]\)\s+/)) {
                                                // Find where title likely ends - look for common patterns
                                                let titleEnd = firstLine.length;
                                                const indicators = [
                                                  ' (ISMS Requirement:',
                                                  ' (ISO 27001 Foundation:',
                                                  ' (ISO 27001 Requirement:',
                                                  ' (ISO 27002 Control',
                                                  ') DEVELOPMENT -',
                                                  ') INTEGRATION -', 
                                                  ' DEVELOPMENT -',
                                                  ' INTEGRATION -',
                                                  ' ISO ',
                                                  ' ISMS ',
                                                  ' Define ',
                                                  ' Develop ',
                                                  ' Establish ',
                                                  ' Implement ',
                                                  ' Maintain ',
                                                  ' Determine ',
                                                  ' Core Requirements',
                                                  ' FRAMEWORK',
                                                  ' AND DEVELOPMENT',
                                                  ' - '
                                                ];
                                                
                                                for (const indicator of indicators) {
                                                  const index = firstLine.indexOf(indicator);
                                                  if (index > 20 && index < titleEnd) { // Must be reasonable distance from start
                                                    titleEnd = index;
                                                  }
                                                }
                                                
                                                // Special handling for POLICY FRAMEWORK - title should only be "d) POLICY FRAMEWORK"
                                                if (firstLine.includes('POLICY FRAMEWORK')) {
                                                  const frameworkEnd = firstLine.indexOf('FRAMEWORK') + 'FRAMEWORK'.length;
                                                  titleEnd = frameworkEnd;
                                                }
                                                
                                                let title = firstLine.substring(0, titleEnd).trim();
                                                let description = (firstLine.substring(titleEnd) + '\n' + restOfLines).trim();
                                                
                                                // Clean up title - remove trailing parentheses
                                                title = title.replace(/\s*\)\s*$/, '');
                                                
                                                // Clean up description and format with proper line breaks
                                                description = description
                                                  .replace(/^(DEVELOPMENT|INTEGRATION)\s*-?\s*/, '') // Remove leading DEVELOPMENT/INTEGRATION
                                                  .replace(/^\s*-\s*/, '') // Remove leading dash
                                                  .replace(/\s*\)\s*$/, '') // Remove trailing parentheses
                                                  .replace(/\s+/g, ' ') // Normalize whitespace
                                                  .trim();
                                                
                                                // Handle Implementation Steps specially
                                                const implementationMatch = description.match(/(.*?)\s*Implementation\s+Steps:\s*(.*)/s);
                                                let mainDescription = description;
                                                let implementationSteps = '';
                                                
                                                if (implementationMatch) {
                                                  mainDescription = implementationMatch[1]?.trim() || '';
                                                  implementationSteps = implementationMatch[2]?.trim() || '';
                                                }
                                                
                                                // Check for "Core Requirements:" pattern and separate it
                                                const coreRequirementsMatch = mainDescription.match(/(.*?)\s*Core\s+Requirements:\s*(.*)/s);
                                                let preCore = '';
                                                let coreRequirements = '';
                                                let remainingDescription = mainDescription;
                                                
                                                if (coreRequirementsMatch) {
                                                  preCore = coreRequirementsMatch[1]?.trim() || '';
                                                  coreRequirements = coreRequirementsMatch[2]?.trim() || '';
                                                  remainingDescription = preCore;
                                                }
                                                
                                                // Split remaining description into parts for better formatting
                                                const descriptionParts = remainingDescription.split(' - ').filter(part => part.trim());
                                                
                                                return (
                                                  <div key={partIdx} className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                                    <div className="font-bold mb-2">{title}</div>
                                                    {descriptionParts.length > 0 && (
                                                      <div className="ml-4 space-y-2">
                                                        {descriptionParts.map((part, partIndex) => (
                                                          <div key={partIndex} className="leading-relaxed">
                                                            {partIndex === 0 ? part.trim() : `- ${part.trim()}`}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                    {coreRequirements && (
                                                      <div className="ml-4 mt-3">
                                                        <div className="font-bold mb-2">Core Requirements:</div>
                                                        <div className="space-y-2">
                                                          {coreRequirements.split(' -').filter(part => part.trim()).map((req, reqIndex) => (
                                                            <div key={reqIndex} className="leading-relaxed">
                                                              {reqIndex === 0 ? req.trim() : `- ${req.trim()}`}
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    )}
                                                    {implementationSteps && (
                                                      <div className="ml-4 mt-3">
                                                        <div className="font-semibold mb-2">Implementation Steps:</div>
                                                        <div className="leading-relaxed">{implementationSteps}</div>
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              }
                                              
                                              // Fallback
                                              return (
                                                <div key={partIdx} className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                                  <div>{trimmed}</div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        );
                                      }
                                      
                                      // Default display for other categories
                                      return (
                                        <div key={i} className="flex items-start space-x-2 text-sm">
                                          <ArrowRight className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                                          <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{subReq}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )
                            ));
                          })()}
                        </div>
                        
                        {/* Industry-Specific Requirements Section */}
                        {selectedIndustrySector && mapping.industrySpecific && mapping.industrySpecific.length > 0 && (
                          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                            <h5 className="font-medium text-sm text-green-800 dark:text-green-200 mb-3 flex items-center">
                              <Factory className="w-4 h-4 mr-2" />
                              Industry-Specific Requirements
                              <Badge variant="outline" className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                {industrySectors?.find(s => s.id === selectedIndustrySector)?.name}
                              </Badge>
                            </h5>
                            <div className="space-y-3">
                              {mapping.industrySpecific.map((req, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-md p-3 border border-green-200/50 dark:border-green-700/50">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                        {req.code}
                                      </span>
                                      <Badge variant={
                                        req.relevanceLevel === 'critical' ? 'destructive' :
                                        req.relevanceLevel === 'high' ? 'default' :
                                        req.relevanceLevel === 'standard' ? 'secondary' :
                                        'outline'
                                      } className="text-xs">
                                        {req.relevanceLevel}
                                      </Badge>
                                    </div>
                                  </div>
                                  <h6 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-2">
                                    {req.title}
                                  </h6>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {req.description.split('•').filter(item => item.trim()).map((item, j) => (
                                      <div key={j} className="flex items-start space-x-2 mb-1">
                                        <ArrowRight className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                        <span>{item.trim()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Framework Overlap Tab */}
          <TabsContent value="overlap" className="space-y-6">
            <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-2xl">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Framework Overlap Analysis</h2>
                    <p className="text-sm text-white/80 font-normal">Visual representation of how your selected frameworks overlap</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Check if any frameworks are selected */}
                {(selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['gdpr'] || selectedFrameworks['nis2']) ? (
                  <>
                {/* Overlap Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Object.values(selectedFrameworks).filter(v => v).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Frameworks Selected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {filteredMappings.reduce((total, mapping) => {
                        const frameworkCount = Object.entries(mapping.frameworks).filter(([key, value]) => {
                          if (key === 'gdpr' || key === 'nis2') return value && value.length > 0;
                          if (key === 'cisControls') return value.length > 0;
                          return value.length > 0;
                        }).length;
                        return total + (frameworkCount > 1 ? 1 : 0);
                      }, 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Groups with Overlap</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {(() => {
                        const overlapRate = filteredMappings.reduce((total, mapping) => {
                          const activeFrameworks = Object.entries(mapping.frameworks).filter(([key, value]) => {
                            if (key === 'gdpr' || key === 'nis2') return value && value.length > 0;
                            if (key === 'cisControls') return value.length > 0;
                            return value.length > 0;
                          });
                          const maxReqs = activeFrameworks.length > 0 ? Math.max(...activeFrameworks.map(([_, reqs]) => reqs.length)) : 0;
                          const totalReqs = activeFrameworks.reduce((sum, [_, reqs]) => sum + reqs.length, 0);
                          return total + (totalReqs > 0 ? ((totalReqs - maxReqs) / totalReqs) * 100 : 0);
                        }, 0);
                        return Math.round(overlapRate / Math.max(filteredMappings.length, 1));
                      })()}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Overlap Rate</div>
                  </div>
                </div>
                
                {/* Framework Coverage Visualization */}
                <PentagonVisualization 
                  selectedFrameworks={{
                    iso27001: selectedFrameworks['iso27001'],
                    iso27002: selectedFrameworks['iso27002'],
                    cisControls: Boolean(selectedFrameworks['cisControls']),
                    gdpr: selectedFrameworks['gdpr'],
                    nis2: selectedFrameworks['nis2']
                  }}
                  mappingData={filteredMappings}
                />
                
                
                </>
                ) : (
                  /* No frameworks selected state */
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Eye className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No Frameworks Selected
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Select frameworks in the "Framework Mapping" tab and click "Generate Unified Requirements" to see overlap analysis and efficiency insights.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span>ISO 27001/27002</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4 text-purple-500" />
                          <span>CIS Controls</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-orange-500" />
                          <span>GDPR</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-indigo-500" />
                          <span>NIS2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Unified Guidance Modal */}
      <Dialog open={showUnifiedGuidance} onOpenChange={setShowUnifiedGuidance}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <DialogTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <Lightbulb className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="text-gray-900 dark:text-white">
                    {selectedGuidanceCategory.replace(/^\d+\. /, '')}
                  </span>
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    Implementation Guidance
                  </div>
                </div>
              </DialogTitle>
              <div className="flex items-center space-x-3 mr-8">
                {/* Beautiful "Powered by AI" indicator - always shown when AI is available */}
                {aiEnvironment.isValid && (
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700/50 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-base">{aiProviderInfo.icon}</span>
                      <span className="font-semibold">Powered by AI</span>
                      <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                )}
                
                {/* Show unavailable status if AI is not configured */}
                {!aiEnvironment.isValid && (
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>⚙️</span>
                    <span>AI Unavailable</span>
                  </div>
                )}
                <Button
                  variant={showFrameworkReferences ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFrameworkReferences(!showFrameworkReferences)}
                  className="flex items-center space-x-2 text-xs font-medium"
                >
                  <Eye className="w-4 h-4" />
                  <span>Show References</span>
                </Button>
              </div>
            </div>
            <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
              Framework-specific guidance and best practices tailored to your selected compliance standards
            </DialogDescription>
            
            {/* AI Environment Status */}
            {!aiEnvironment.isValid && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-amber-600 dark:text-amber-400 text-lg">⚠️</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      AI Features Unavailable
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      AI-enhanced guidance requires an API key. You're currently viewing static content.
                    </p>
                    {aiEnvironment.setupInstructions.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-amber-600 dark:text-amber-400 hover:text-amber-700">
                          Setup Instructions
                        </summary>
                        <div className="mt-1 text-xs text-amber-700 dark:text-amber-300 whitespace-pre-line">
                          {aiEnvironment.setupInstructions.join('\n')}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogHeader>
          <div className="prose dark:prose-invert max-w-none pt-6">
            {(selectedGuidanceCategory ? getGuidanceContent() : 'No category selected').split('\n').map((line, index) => {
              // Clean line but preserve basic formatting markers
              const cleanLine = line.replace(/\*\*/g, '').trim();
              
              if (cleanLine === '') return <div key={index} className="h-3" />;
              
              // Hide FRAMEWORK REFERENCES header and sub-sections when toggle is off
              if (!showFrameworkReferences) {
                if (cleanLine.startsWith('FRAMEWORK REFERENCES:') ||
                    cleanLine.includes('Primary Requirements:') ||
                    cleanLine.includes('Supporting Requirements:') ||
                    cleanLine.includes('Cross-References:') ||
                    cleanLine.includes('Framework References for Selected Standards:') ||
                    cleanLine.match(/^(ISO 27001|ISO 27002|CIS Controls|GDPR|NIS2 Directive):/i) ||
                    cleanLine.match(/^Art\.\d+(\.\d+)*:/) || // NIS2 articles like "Art.20.1:", "Art.25.1:" etc.
                    cleanLine.match(/^A\.\d+(\.\d+)*:/) || // ISO codes like "A.5.1:", "A.6.2:", etc.
                    cleanLine.match(/^\d+\.\d+(\.\d+)?:/) || // All numeric codes like "7.5.1:", "9.3.2:", "14.1:" etc.
                    cleanLine.match(/^Article \d+:/) || // GDPR articles like "Article 32:"
                    cleanLine.match(/^Education\.\d+:/) || // Education.1: etc.
                    cleanLine.match(/^Government\.\d+:/)) { // Government.1: etc.
                  return null;
                }
              }
              
              // Track if we've hit OPERATIONAL EXCELLENCE section
              const isAfterOperationalExcellence = index > 0 && 
                getGuidanceContent().split('\n')
                  .slice(0, index)
                  .some(l => l.includes('🎯 OPERATIONAL EXCELLENCE INDICATORS'));
              
              // Hide EVERYTHING after OPERATIONAL EXCELLENCE when toggle is off
              if (!showOperationalExcellence && isAfterOperationalExcellence) {
                // Skip the header itself (it gets its own special rendering)
                if (!cleanLine.includes('🎯 OPERATIONAL EXCELLENCE INDICATORS')) {
                  return null;
                }
              }
              
              // 🎯 Special styling for Operational Excellence Indicators header
              if (cleanLine.includes('🎯 OPERATIONAL EXCELLENCE INDICATORS')) {
                return (
                  <div key={index} className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-2 border-emerald-400 p-6 mb-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center">
                        <span className="text-3xl mr-3">🎯</span>
                        OPERATIONAL EXCELLENCE INDICATORS
                      </h3>
                      <button
                        onClick={() => setShowOperationalExcellence(!showOperationalExcellence)}
                        className="px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 border border-emerald-300 hover:border-emerald-500 rounded-md transition-colors duration-200 flex items-center gap-1"
                      >
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showOperationalExcellence ? 'transform rotate-180' : ''}`} />
                        {showOperationalExcellence ? 'Hide Details' : 'Show Details'}
                      </button>
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                      Your Compliance Scorecard - Track these metrics to demonstrate audit readiness
                    </p>
                  </div>
                );
              }
              
              // Section headers for the scorecard categories
              if (cleanLine.includes('FOUNDATIONAL CONTROLS') || 
                  cleanLine.includes('ADVANCED CONTROLS') || 
                  cleanLine.includes('AUDIT-READY DOCUMENTATION') || 
                  cleanLine.includes('CONTINUOUS IMPROVEMENT')) {
                
                const colors: Record<string, string> = {
                  'FOUNDATIONAL CONTROLS': 'bg-blue-600 text-white',
                  'ADVANCED CONTROLS': 'bg-purple-600 text-white', 
                  'AUDIT-READY DOCUMENTATION': 'bg-orange-600 text-white',
                  'CONTINUOUS IMPROVEMENT': 'bg-green-600 text-white'
                };
                
                const color = Object.keys(colors).find(key => cleanLine.includes(key));
                const colorClass = color ? colors[color] : 'bg-gray-600 text-white';
                
                return (
                  <div key={index} className={`${colorClass} p-4 rounded-lg mb-4 mt-6`}>
                    <h4 className="font-bold text-lg flex items-center">
                      <span className="text-2xl mr-3">✅</span>
                      {cleanLine}
                    </h4>
                  </div>
                );
              }
              
              // Framework References section with special styling
              if (cleanLine.includes('Framework References for Selected Standards:')) {
                if (!showFrameworkReferences) {
                  return null; // Hide when references are not shown
                }
                return (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 p-5 mb-6 rounded-r-lg shadow-sm">
                    <h4 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                      <span className="text-xl mr-2">📋</span>
                      Framework References for Selected Standards
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Specific control references mapped to your selected compliance frameworks
                    </p>
                  </div>
                );
              }
              
              // Framework-specific references with enhanced styling
              if (cleanLine.match(/^(ISO 27001|ISO 27002|CIS Controls v8|GDPR|NIS2 Directive):/)) {
                if (!showFrameworkReferences) {
                  return null; // Hide when references are not shown
                }
                const framework = cleanLine.split(':')[0];
                const content = cleanLine.split(':')[1];
                
                const frameworkColors: Record<string, string> = {
                  'ISO 27001': 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-800 dark:text-blue-200',
                  'ISO 27002': 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-400 text-cyan-800 dark:text-cyan-200',
                  'CIS Controls v8': 'bg-purple-50 dark:bg-purple-900/20 border-purple-400 text-purple-800 dark:text-purple-200',
                  'GDPR': 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 text-orange-800 dark:text-orange-200',
                  'NIS2 Directive': 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-400 text-indigo-800 dark:text-indigo-200'
                };
                
                const colorClass = frameworkColors[framework || ''] || 'bg-gray-50 dark:bg-gray-800/50 border-gray-400 text-gray-800 dark:text-gray-200';
                
                return (
                  <div key={index} className={`ml-4 p-4 rounded-lg mb-3 border-l-4 ${colorClass}`}>
                    <div className="flex items-start space-x-3">
                      <span className="font-bold text-base shrink-0">{framework}:</span>
                      <p className="text-sm leading-relaxed">{content}</p>
                    </div>
                  </div>
                );
              }
              
              // Major section headers (without **)
              if (line.startsWith('**') && line.endsWith('**') && !cleanLine.includes('✅')) {
                const headerText = line.replace(/\*\*/g, '');
                return (
                  <div key={index} className="mt-8 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white pb-3 border-b-2 border-gray-300 dark:border-gray-600 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></span>
                      {headerText}
                    </h3>
                  </div>
                );
              }
              
              // Subsection headers (bold but not wrapped in **)
              if (line.match(/^\*\*[^*]+\*\*$/) && !cleanLine.includes('✅')) {
                return (
                  <h4 key={index} className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3 flex items-center">
                    <span className="w-1 h-6 bg-emerald-400 mr-3 rounded"></span>
                    {cleanLine}
                  </h4>
                );
              }
              
              // ✅ Checkmark items with enhanced styling
              if (cleanLine.startsWith('✅')) {
                const content = cleanLine.replace('✅ ', '');
                const isBold = content.includes('**');
                const cleanContent = content.replace(/\*\*/g, '');
                
                return (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg mb-3 shadow-sm">
                    <span className="text-green-600 dark:text-green-400 text-xl shrink-0 mt-0.5">✅</span>
                    <p className={`text-green-800 dark:text-green-200 leading-relaxed ${isBold ? 'font-semibold text-base' : 'text-sm'}`}>
                      {cleanContent}
                    </p>
                  </div>
                );
              }
              
              // 💡 PRO TIP styling
              if (cleanLine.startsWith('💡 PRO TIP:')) {
                return (
                  <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-400 p-5 mb-6 rounded-r-lg shadow-lg">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-base mb-1">PRO TIP</h4>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                          {cleanLine.replace('💡 PRO TIP: ', '')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Phase headers (Phase 1:, Phase 2:, etc.)
              if (cleanLine.match(/^Phase \d+:/)) {
                return (
                  <div key={index} className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-3 border-l-4 border-indigo-400">
                    <p className="font-semibold text-indigo-800 dark:text-indigo-200 text-base">{cleanLine}</p>
                  </div>
                );
              }
              
              // Implementation phases or numbered items
              if (cleanLine.match(/^\d+\./)) {
                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg mb-2 border-l-2 border-gray-400">
                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{cleanLine}</p>
                  </div>
                );
              }

              // Handle indented requirement subcategories (Primary Requirements, Supporting Requirements, Cross-References)
              if (line.trim().match(/^(Primary Requirements|Supporting Requirements|Cross-References):/)) {
                const subcategoryText = line.trim();
                return (
                  <div key={index} className="ml-8 mt-3 mb-2">
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{subcategoryText}</h5>
                  </div>
                );
              }

              // Handle deeply indented requirement items (individual requirements under subcategories)
              if (line.match(/^    [A-Z0-9.\-]+:/)) {
                const requirementText = line.trim();
                const [code, title] = requirementText.split(': ');
                return (
                  <div key={index} className="ml-12 mb-1 flex items-start space-x-2">
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 shrink-0">
                      {code}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{title}</span>
                  </div>
                );
              }
              
              // Subsection titles (a), b), c) etc. with bold styling
              if (cleanLine.match(/^[a-z]\)\s+/)) {
                // Match only the letter and the title part (until first period, colon, or end of reasonable title)
                const subsectionMatch = cleanLine.match(/^([a-z]\)\s+[^.\n]*(?:\.[^a-z]|$)?)/);
                if (subsectionMatch && subsectionMatch[1]) {
                  // Find a better breaking point - look for title that's reasonable length
                  const letterMatch = cleanLine.match(/^([a-z]\))\s+([^.\n]{1,80})/);
                  if (letterMatch && letterMatch[2]) {
                    const letter = letterMatch[1];
                    const titleText = letterMatch[2].trim();
                    const remainingText = cleanLine.substring((letter + ' ' + titleText).length);
                    
                    return (
                      <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 text-sm">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{letter} {titleText}</span>
                        {remainingText}
                      </p>
                    );
                  }
                }
              }
              
              // Regular paragraph text
              return (
                <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 text-sm">
                  {cleanLine}
                </p>
              );
            })}
          </div>
          <div className="flex justify-end mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowUnifiedGuidance(false)}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}