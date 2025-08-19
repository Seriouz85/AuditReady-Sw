import { useState, useEffect, useCallback } from 'react';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  Download,
  Database,
  Target,
  BookOpen,
  Sparkles,
  Layers,
  Activity,
  TrendingUp,
  Shield,
  Cpu,
  Network,
  Rocket,
  X,
  Search,
  Filter,
  Award,
  ShieldCheck,
  FileSpreadsheet,
  Scale,
  Edit
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ComprehensiveGuidanceService } from '@/services/rag/ComprehensiveGuidanceService';
import { SubGuidanceGenerationService, SubGuidanceItem, SubGuidanceResult } from '@/services/rag/SubGuidanceGenerationService';
import { RequirementsIntegrationService, ExportFormat, IntegrationResult } from '@/services/rag/RequirementsIntegrationService';
import { useComplianceMappingData } from '@/services/compliance/ComplianceUnificationService';
import { UnifiedRequirementsService } from '@/services/compliance/UnifiedRequirementsService';
import { CorrectedGovernanceService } from '@/services/compliance/CorrectedGovernanceService';
import { UnifiedGuidanceGenerator } from '@/services/compliance/UnifiedGuidanceGenerator';
import { useAuth } from '@/contexts/AuthContext';

// Real types based on your actual database schema
interface UnifiedCategory {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  icon?: string;
  is_active: boolean;
}

interface UnifiedRequirement {
  id: string;
  category_id: string;
  title: string;
  description: string;
  ai_guidance?: string;
  guidance_confidence?: number;
  guidance_sources?: string[];
  created_at: string;
  updated_at: string;
  category?: UnifiedCategory;
}

interface KnowledgeSource {
  id: string;
  url: string;
  domain: string;
  title?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  authority_score: number;
  content_quality: number;
  last_scraped?: string;
  created_at: string;
}

// Removed unused RequirementValidation interface

export default function RealAIMappingDashboard() {
  const { user, organization, isPlatformAdmin } = useAuth();
  
  // Debug logging for auth context
  console.log('🔍 RealAIMappingDashboard Auth State:', {
    user: user?.id || 'null',
    organization: organization?.id || 'null',
    orgName: organization?.name || 'null',
    isPlatformAdmin: isPlatformAdmin || false
  });
  
  // Framework selection for loading compliance data
  const [selectedFrameworks] = useState({
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3',
    gdpr: true,
    nis2: true
  });
  
  // Load compliance mapping data to get existing sub-requirements
  const { data: complianceMappings, isLoading: isLoadingMappings } = useComplianceMappingData(selectedFrameworks);
  
  // State
  const [categories, setCategories] = useState<UnifiedCategory[]>([]);
  const [requirements, setRequirements] = useState<UnifiedRequirement[]>([]);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  
  // PHASE 1: Search and filter state
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'with_guidance' | 'pending_suggestions'>('all');
  const [activeCategory, setActiveCategory] = useState<UnifiedCategory | null>(null);
  
  // Sub-requirements editing focus
  const [categoryGuidances, setCategoryGuidances] = useState<any[]>([]);
  const [selectedCategoryGuidance, setSelectedCategoryGuidance] = useState<any | null>(null);
  
  // PHASE 2: URL Processing and Sub-guidance Generation
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [url3, setUrl3] = useState('');
  const [aiReferenceUrl, setAiReferenceUrl] = useState('');
  const [isProcessingUrls, setIsProcessingUrls] = useState(false);
  const [urlProcessingProgress, setUrlProcessingProgress] = useState(0);
  const [subGuidanceItems, setSubGuidanceItems] = useState<SubGuidanceItem[]>([]);
  const [subGuidanceResult, setSubGuidanceResult] = useState<SubGuidanceResult | null>(null);

  // PHASE 3: Admin Review and Approval Workflow
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editReason, setEditReason] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reviewComment, setReviewComment] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  // PHASE 4: Integration and Export State
  const [integrationStatus, setIntegrationStatus] = useState<any>(null);
  const [isIntegrating, setIsIntegrating] = useState(false);
  const [integrationProgress, setIntegrationProgress] = useState(0);
  const [integrationResult, setIntegrationResult] = useState<IntegrationResult | null>(null);
  const [availableExportFormats, setAvailableExportFormats] = useState<ExportFormat[]>([]);
  const [selectedExportFormats, setSelectedExportFormats] = useState<string[]>([]);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);

  // Load real data from your database
  useEffect(() => {
    loadRealData();
  }, [organization]);

  const loadRealData = async () => {
    setLoading(true);
    try {
      // Load basic data (always needed)
      await Promise.all([
        loadCategories(),
        loadRequirements(),
        loadKnowledgeSources()
      ]);

      // Load organization-specific data only if not platform admin
      if (!isPlatformAdmin && organization) {
        await Promise.all([
          loadComprehensiveGuidance(),
          loadIntegrationData()
        ]);
      } else if (isPlatformAdmin) {
        // Platform Admin mode - load demo/example data instead
        console.log('🔒 Platform Admin mode - loading demo data');
        setIntegrationStatus({
          total_categories: categories.length,
          categories_with_approved_guidance: 0,
          integrated_requirements: 0,
          pending_integration: 0,
          export_formats_available: 6,
          last_integration: null
        });
        const formats = RequirementsIntegrationService.getAvailableExportFormats();
        setAvailableExportFormats(formats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔗 PHASE 4: Load integration status and available export formats
   */
  const loadIntegrationData = async () => {
    if (!organization && !isPlatformAdmin) return;

    try {
      if (isPlatformAdmin) {
        // Platform admin gets demo data
        setIntegrationStatus({
          total_categories: 15,
          categories_with_approved_guidance: 5,
          integrated_requirements: 12,
          pending_integration: 3,
          export_formats_available: 6,
          last_integration: new Date().toISOString()
        });
      } else if (organization) {
        // Real organization data
        const status = await RequirementsIntegrationService.getIntegrationStatus(organization.id);
        setIntegrationStatus(status);
      }
      
      // Load available export formats
      const formats = RequirementsIntegrationService.getAvailableExportFormats();
      setAvailableExportFormats(formats);
      
      console.log('✅ Loaded integration data:', {
        isPlatformAdmin,
        exportFormats: formats.length
      });
    } catch (error) {
      console.error('Error loading integration data:', error);
    }
  };

  /**
   * 📋 Load existing sub-requirements from compliance simplification data
   */
  const loadExistingSubRequirements = async (categoryName: string) => {
    try {
      if (!complianceMappings || complianceMappings.length === 0) {
        console.log(`⚠️ No compliance mappings available for ${categoryName}`);
        return null;
      }

      // Clean category name (remove number prefixes)
      const cleanCategory = categoryName.replace(/^\d+\.\s*/, '');
      
      // Find the category mapping
      const categoryMapping = complianceMappings.find((mapping: any) => {
        const mappingCategory = mapping.category?.replace(/^\d+\.\s*/, '');
        return mappingCategory === cleanCategory;
      });

      if (!categoryMapping) {
        console.log(`⚠️ No mapping found for category: ${cleanCategory}`);
        return null;
      }

      // Extract unified requirements using the same logic as compliance simplification
      const categoryRequirements = UnifiedRequirementsService.extractUnifiedRequirements(categoryMapping);
      
      // Apply special handling for Governance & Leadership
      let subRequirements = categoryMapping.auditReadyUnified?.subRequirements || [];
      if (CorrectedGovernanceService.isGovernanceCategory(categoryMapping.category)) {
        const correctedStructure = CorrectedGovernanceService.getCorrectedStructure();
        subRequirements = [
          ...correctedStructure.sections['Leadership'] || [],
          ...correctedStructure.sections['HR'] || [],
          ...correctedStructure.sections['Monitoring & Compliance'] || []
        ];
      }

      console.log(`✅ Found ${subRequirements.length} sub-requirements for ${cleanCategory}`);
      return {
        category: cleanCategory,
        mapping: categoryMapping,
        subRequirements: subRequirements,
        requirements: categoryRequirements
      };
    } catch (error) {
      console.error(`Error loading existing sub-requirements for ${categoryName}:`, error);
      return null;
    }
  };

  /**
   * 🔄 Convert existing sub-requirements to SubGuidanceItem format for editing
   */
  const convertSubRequirementsToSubGuidance = (subRequirements: any[], categoryName: string): SubGuidanceItem[] => {
    console.log(`🔍 Converting ${subRequirements.length} sub-requirements for ${categoryName}:`, 
      subRequirements.map((req, i) => `${i}: ${JSON.stringify(req).substring(0, 100)}...`)
    );
    
    return subRequirements.map((subReq, index) => {
      // Generate label (a), b), c), etc.
      const label = String.fromCharCode(97 + index) + ')';
      
      // Try multiple possible content fields to find the actual text
      let content = '';
      
      // Debug: Log the structure of this sub-requirement
      console.log(`🔍 Sub-requirement ${index} (${label}) structure:`, Object.keys(subReq), subReq);
      
      // Try different possible field names
      if (typeof subReq === 'string') {
        content = subReq;
      } else if (subReq.content) {
        content = subReq.content;
      } else if (subReq.text) {
        content = subReq.text;
      } else if (subReq.requirement) {
        content = subReq.requirement;
      } else if (subReq.description) {
        content = subReq.description;
      } else if (subReq.guidance) {
        content = subReq.guidance;
      } else if (subReq.details) {
        content = subReq.details;
      } else {
        // If no standard fields, try to stringify the whole object
        content = JSON.stringify(subReq, null, 2);
      }
      
      // Ensure it's a string
      if (typeof content !== 'string') {
        content = JSON.stringify(content);
      }
      
      // Clean markdown formatting and ensure proper line breaks
      content = content
        .replace(/\*\*/g, '')  // Remove bold markdown
        .replace(/\*/g, '')    // Remove italic markdown
        .replace(/\n\s*\n/g, '\n')  // Remove multiple line breaks
        .trim();

      // If content is still empty, create a placeholder
      if (!content || content.length < 10) {
        content = `Placeholder content for ${categoryName} requirement ${label}.\nThis item needs to be enhanced with proper guidance text.\nCurrent data structure may not contain readable content.\nConsider using URL enhancement to improve this requirement.`;
      }

      console.log(`✅ Sub-requirement ${index} (${label}) final content length: ${content.length} chars, ${content.split('\n').length} lines`);

      return {
        id: `existing-${categoryName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        label: label,
        content: content,
        sources: ['Existing Compliance Requirements'],
        confidence: 1.0, // Existing requirements are 100% confident
        status: 'approved', // Existing requirements are already approved
        reviewerId: 'system',
        reviewerName: 'System Import',
        reviewedAt: new Date().toISOString(),
        reviewComments: 'Imported from existing compliance simplification system'
      } as SubGuidanceItem;
    });
  };

  /**
   * 🎯 Generate real unified guidance for Platform Admin mode (same as compliance simplification)
   */
  const generateRealUnifiedGuidance = async (categoryName: string): Promise<SubGuidanceItem[]> => {
    try {
      console.log(`🔄 Generating real unified guidance for ${categoryName}...`);
      
      // Clean category name (remove number prefixes)
      const cleanCategory = categoryName.replace(/^\d+\.\s*/, '');
      
      if (!complianceMappings || complianceMappings.length === 0) {
        console.warn('⚠️ No compliance mappings available for real guidance generation');
        return [];
      }

      // Find the category mapping (same logic as compliance simplification)
      const categoryMapping = complianceMappings.find((mapping: any) => {
        const mappingCategory = mapping.category?.replace(/^\d+\.\s*/, '');
        return mappingCategory === cleanCategory;
      });

      if (!categoryMapping) {
        console.warn(`⚠️ No mapping found for category: ${cleanCategory}`);
        return [];
      }

      console.log(`✅ Found category mapping for ${cleanCategory}:`, {
        hasUnified: !!categoryMapping.auditReadyUnified,
        subRequirementsCount: categoryMapping.auditReadyUnified?.subRequirements?.length || 0
      });

      // Extract unified requirements using the same logic as compliance simplification
      const categoryRequirements = UnifiedRequirementsService.extractUnifiedRequirements(categoryMapping);
      
      // Apply special handling for Governance & Leadership (same as compliance simplification)
      let subRequirements = categoryMapping.auditReadyUnified?.subRequirements || [];
      if (CorrectedGovernanceService.isGovernanceCategory(categoryMapping.category)) {
        const correctedStructure = CorrectedGovernanceService.getCorrectedStructure();
        subRequirements = [
          ...correctedStructure.sections['Leadership'] || [],
          ...correctedStructure.sections['HR'] || [],
          ...correctedStructure.sections['Monitoring & Compliance'] || []
        ];
        console.log(`🔧 Applied governance correction - ${subRequirements.length} items`);
      }

      // Generate dynamic guidance based on the requirements (same as compliance simplification)
      const generatedGuidance = UnifiedGuidanceGenerator.generateGuidance(categoryRequirements);
      
      console.log(`✅ Generated guidance for ${cleanCategory}:`, {
        subRequirementsFound: subRequirements.length,
        guidanceGenerated: !!generatedGuidance,
        guidanceLength: generatedGuidance?.foundationContent?.length || 0
      });

      // Convert sub-requirements to SubGuidanceItem format
      if (subRequirements.length > 0) {
        return convertSubRequirementsToSubGuidance(subRequirements, cleanCategory);
      } else {
        console.warn(`⚠️ No sub-requirements found for ${cleanCategory}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ Error generating real unified guidance for ${categoryName}:`, error);
      return [];
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('unified_compliance_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .limit(21); // Limit to 21 unified categories only

      if (error) throw error;
      setCategories((data as unknown as UnifiedCategory[]) || []);
      console.log('✅ Loaded 21 unified categories:', data?.length || 0);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadRequirements = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('unified_requirements')
        .select(`
          *,
          category:unified_compliance_categories(*)
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequirements((data as unknown as UnifiedRequirement[]) || []);
      console.log('✅ Loaded real requirements:', data?.length || 0);
    } catch (error) {
      console.error('Error loading requirements:', error);
    }
  };

  const loadKnowledgeSources = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKnowledgeSources((data as unknown as KnowledgeSource[]) || []);
      console.log('✅ Loaded knowledge sources:', data?.length || 0);
    } catch (error) {
      console.error('Error loading knowledge sources:', error);
    }
  };

  const loadComprehensiveGuidance = async () => {
    if (!organization) return;

    try {
      const guidances = await ComprehensiveGuidanceService.loadComprehensiveGuidance(organization.id);
      setCategoryGuidances(guidances);
      console.log('✅ Loaded comprehensive guidances:', guidances.length);
    } catch (error) {
      console.error('Error loading comprehensive guidance:', error);
    }
  };



  /**
   * 🚀 PHASE 2: Process URLs and generate sub-guidance items
   */
  const handleProcessUrls = async () => {
    if (!activeCategory || !organization) {
      console.warn('No active category or organization selected');
      return;
    }

    // Collect non-empty URLs
    const urls = [url1, url2, url3].filter(url => url.trim().length > 0);
    if (urls.length === 0) {
      console.warn('No URLs provided for processing');
      return;
    }

    // Get unified requirement from selected category guidance or create one
    const unifiedRequirement = selectedCategoryGuidance?.comprehensive_guidance 
      || `Implement comprehensive ${activeCategory.name.toLowerCase()} controls and procedures to ensure organizational compliance and security. Address all aspects including policy development, implementation procedures, monitoring mechanisms, and continuous improvement processes.`;

    setIsProcessingUrls(true);
    setUrlProcessingProgress(0);
    setSubGuidanceResult(null);

    try {
      console.log('🚀 Starting URL processing for sub-guidance generation');
      console.log('Category:', activeCategory.name);
      console.log('URLs:', urls);
      console.log('Unified requirement:', unifiedRequirement.slice(0, 200) + '...');

      const result = await SubGuidanceGenerationService.generateSubGuidanceFromUrls(
        {
          categoryId: activeCategory.id,
          categoryName: activeCategory.name,
          unifiedRequirement,
          authoritativeUrls: urls,
          organizationId: organization.id
        },
        {
          onProgress: (progress: number, message?: string) => {
            setUrlProcessingProgress(progress);
            console.log(`📊 Progress: ${progress}% - ${message}`);
          },
          maxSubItems: 6
        }
      );

      setSubGuidanceResult(result);

      if (result.success) {
        setSubGuidanceItems(result.subGuidanceItems);
        console.log('✅ Sub-guidance generation completed successfully');
        console.log('Generated items:', result.subGuidanceItems.length);
        
        // Store the results in database for persistence
        if (result.subGuidanceItems.length > 0) {
          await SubGuidanceGenerationService.storeSubGuidance(
            organization.id,
            activeCategory.id,
            result.subGuidanceItems
          );
        }
      } else {
        console.error('❌ Sub-guidance generation failed:', result.error);
      }

    } catch (error) {
      console.error('Error processing URLs:', error);
      setSubGuidanceResult({
        success: false,
        subGuidanceItems: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsProcessingUrls(false);
      setUrlProcessingProgress(0);
    }
  };

  /**
   * 🔄 PHASE 3: Load existing sub-guidance for review
   */
  const loadSubGuidanceForReview = useCallback(async () => {
    if (!activeCategory || !organization) return;

    try {
      const items = await SubGuidanceGenerationService.loadSubGuidanceForReview(
        organization.id,
        activeCategory.id
      );
      
      if (items.length > 0) {
        setSubGuidanceItems(items);
        console.log(`✅ Loaded ${items.length} sub-guidance items for review`);
      } else {
        setSubGuidanceItems([]); // Clear items if none found
        console.log(`ℹ️ No sub-guidance items found for ${activeCategory.name}`);
      }
    } catch (error) {
      console.error('Error loading sub-guidance for review:', error);
      setSubGuidanceItems([]); // Clear on error
    }
  }, [activeCategory, organization]);

  // Load sub-guidance when category changes
  useEffect(() => {
    if (activeCategory && organization) {
      loadSubGuidanceForReview();
    }
  }, [activeCategory?.id, organization?.id, loadSubGuidanceForReview]);

  /**
   * ✏️ Start editing a sub-guidance item
   */
  const handleStartEdit = (item: SubGuidanceItem) => {
    setEditingItemId(item.id);
    setEditContent(item.content);
    setEditReason('');
  };

  /**
   * 💾 Save edited sub-guidance item
   */
  const handleSaveEdit = async () => {
    if (!editingItemId || !activeCategory || !organization || !user) return;

    try {
      const result = await SubGuidanceGenerationService.editSubGuidanceItem(
        organization.id,
        activeCategory.id,
        editingItemId,
        editContent,
        user.id,
        user.user_metadata?.['full_name'] || user.email || 'Unknown User',
        editReason
      );

      if (result.success) {
        // Reload sub-guidance items
        await loadSubGuidanceForReview();
        
        // Reset edit state
        setEditingItemId(null);
        setEditContent('');
        setEditReason('');
        
        console.log('✅ Sub-guidance item edited successfully');
      } else {
        console.error('❌ Edit failed:', result.error);
        alert(`Edit failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving edit:', error);
      alert('An error occurred while saving the edit');
    }
  };

  /**
   * ❌ Cancel editing
   */
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditContent('');
    setEditReason('');
  };

  /**
   * ✅ Approve individual sub-guidance item
   */
  const handleApproveItem = async (itemId: string) => {
    if (!activeCategory || !organization || !user) return;

    setIsProcessingApproval(true);
    try {
      const result = await SubGuidanceGenerationService.approveSubGuidanceItem(
        organization.id,
        activeCategory.id,
        itemId,
        user.id,
        user.user_metadata?.['full_name'] || user.email || 'Unknown Reviewer',
        reviewComment
      );

      if (result.success) {
        await loadSubGuidanceForReview();
        setReviewComment('');
        console.log('✅ Item approved successfully');
      } else {
        console.error('❌ Approval failed:', result.error);
        alert(`Approval failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving item:', error);
      alert('An error occurred during approval');
    } finally {
      setIsProcessingApproval(false);
    }
  };

  /**
   * ❌ Reject individual sub-guidance item
   */
  const handleRejectItem = async (itemId: string, comments: string) => {
    if (!activeCategory || !organization || !user) return;

    setIsProcessingApproval(true);
    try {
      const result = await SubGuidanceGenerationService.rejectSubGuidanceItem(
        organization.id,
        activeCategory.id,
        itemId,
        user.id,
        user.user_metadata?.['full_name'] || user.email || 'Unknown Reviewer',
        comments
      );

      if (result.success) {
        await loadSubGuidanceForReview();
        setReviewComment('');
        console.log('✅ Item rejected successfully');
      } else {
        console.error('❌ Rejection failed:', result.error);
        alert(`Rejection failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error rejecting item:', error);
      alert('An error occurred during rejection');
    } finally {
      setIsProcessingApproval(false);
    }
  };

  /**
   * 📦 Bulk approve selected items
   */
  const handleBulkApprove = async () => {
    if (selectedItems.length === 0 || !activeCategory || !organization || !user) return;

    setIsProcessingApproval(true);
    try {
      const result = await SubGuidanceGenerationService.bulkApproveSubGuidanceItems(
        organization.id,
        activeCategory.id,
        selectedItems,
        user.id,
        user.user_metadata?.['full_name'] || user.email || 'Unknown Reviewer',
        reviewComment
      );

      if (result.success) {
        await loadSubGuidanceForReview();
        setSelectedItems([]);
        setReviewComment('');
        setShowApprovalDialog(false);
        console.log(`✅ Bulk approval completed: ${result.approved} items approved`);
      } else {
        console.error('❌ Bulk approval failed:', result.error);
        alert(`Bulk approval failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in bulk approval:', error);
      alert('An error occurred during bulk approval');
    } finally {
      setIsProcessingApproval(false);
    }
  };

  /**
   * 🔄 Submit items for review
   */
  const handleSubmitForReview = async () => {
    if (selectedItems.length === 0 || !activeCategory || !organization) return;

    try {
      const result = await SubGuidanceGenerationService.submitForReview(
        organization.id,
        activeCategory.id,
        selectedItems
      );

      if (result.success) {
        await loadSubGuidanceForReview();
        setSelectedItems([]);
        console.log('✅ Items submitted for review');
      } else {
        console.error('❌ Submit for review failed:', result.error);
        alert(`Submit for review failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting for review:', error);
      alert('An error occurred while submitting for review');
    }
  };

  /**
   * 🚀 PHASE 4: Integrate approved sub-guidance with existing requirements
   */
  const handleIntegrateApprovedGuidance = async () => {
    if (!organization) return;

    setIsIntegrating(true);
    setIntegrationProgress(0);
    setIntegrationResult(null);

    try {
      console.log('🚀 Starting Phase 4 requirements integration...');
      
      // Get selected categories or use all if none selected
      const categoryIds = activeCategory ? [activeCategory.id] : undefined;
      
      const result = await RequirementsIntegrationService.integrateApprovedSubGuidance(
        organization.id,
        {
          categoryIds: categoryIds || [],
          onProgress: (progress: number, message?: string) => {
            setIntegrationProgress(progress);
            console.log(`📊 Integration progress: ${progress}% - ${message}`);
          },
          createAuditTrail: true,
          autoExport: selectedExportFormats.length > 0,
          exportFormats: availableExportFormats.filter(format => 
            selectedExportFormats.includes(format.format)
          )
        }
      );

      setIntegrationResult(result);

      if (result.success) {
        console.log(`✅ Integration completed: ${result.integrated_requirements.length} requirements integrated`);
        
        // Refresh integration status
        await loadIntegrationData();
        
        // Close dialog
        setShowIntegrationDialog(false);
        setSelectedExportFormats([]);
      } else {
        console.error('❌ Integration failed:', result.failed_integrations);
      }

    } catch (error) {
      console.error('Error during integration:', error);
      setIntegrationResult({
        success: false,
        integrated_requirements: [],
        failed_integrations: [{ category_id: 'all', error: 'Integration process failed' }],
        audit_entries: []
      });
    } finally {
      setIsIntegrating(false);
      setIntegrationProgress(0);
    }
  };



  // Platform Admin mode doesn't need organization context
  const needsOrganization = !isPlatformAdmin;
  
  if (loading || isLoadingMappings || (needsOrganization && !organization)) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNavigation />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <Clock className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">
              {isPlatformAdmin 
                ? 'Loading platform admin data...' 
                : (!organization ? 'Loading organization context...' : 'Loading compliance data and mappings...')
              }
            </p>
            {!isPlatformAdmin && !organization && (
              <p className="text-xs text-gray-500 mt-2">
                Waiting for organization authentication...
              </p>
            )}
            {isPlatformAdmin && (
              <p className="text-xs text-emerald-500 mt-2">
                Platform Admin Mode - No organization required
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PHASE 1: Filter and search categories
  const filteredCategories = categories.filter(category => {
    // Search filter
    const matchesSearch = category.name.toLowerCase().includes(categorySearch.toLowerCase());
    
    // Category filter
    const guidance = categoryGuidances.find(cg => cg.category_id === category.id);
    let matchesFilter = true;
    
    if (categoryFilter === 'with_guidance') {
      matchesFilter = !!guidance;
    } else if (categoryFilter === 'pending_suggestions') {
      // TODO: Implement pending suggestions logic in later phases
      matchesFilter = !guidance; // For now, show categories without guidance as "pending"
    }
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminNavigation />
      
      <div className="flex-1 ml-64 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6">
          {/* Epic Header */}
          <div className="mb-8">
            <div className="relative">
              {/* Glowing background effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-25 animate-pulse"></div>
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Brain className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                        AI KNOWLEDGE NEXUS
                      </h1>
                      <div className="flex gap-2">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1" />
                          NEURAL
                        </Badge>
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                          <Rocket className="w-3 h-3 mr-1" />
                          LIVE
                        </Badge>
                      </div>
                    </div>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      🧠 <span className="text-purple-300 font-semibold">Neural Intelligence</span> meets 
                      <span className="text-blue-300 font-semibold"> Compliance Mastery</span> · 
                      Build the ultimate knowledge foundation for AI-powered guidance
                    </p>
                  </div>
                </div>

                {/* Neural Network Visualization */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
                      <span className="text-xs text-purple-300 font-medium">URLs → </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-400 animate-spin" />
                      <span className="text-xs text-blue-300 font-medium">Neural Processing → </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-pink-400 animate-pulse" />
                      <span className="text-xs text-pink-300 font-medium">Knowledge Graph → </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400 animate-bounce" />
                      <span className="text-xs text-green-300 font-medium">AI Guidance</span>
                    </div>
                  </div>
                  
                  {/* Neural Validation Controls */}
                  <div className="flex items-center gap-3">
                    {categoryGuidances.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-purple-500/20">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-purple-300 font-medium">
                          Coverage: {Math.round(categoryGuidances.reduce((sum, cg) => sum + cg.coverage_percentage, 0) / categoryGuidances.length)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>


              </div>
            </div>

            {/* Epic Neural Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Categories Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-white">{categories.length}</div>
                      <div className="text-xs text-purple-300 font-medium">NEURAL CATEGORIES</div>
                    </div>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-purple-500/30 to-purple-600/30 rounded-full">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full w-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Requirements Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-white">{requirements.length}</div>
                      <div className="text-xs text-green-300 font-medium">REQUIREMENTS</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300">{requirements.filter(r => r.ai_guidance).length} with AI guidance</span>
                  </div>
                </div>
              </div>

              {/* Knowledge Sources Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-white">{knowledgeSources.length}</div>
                      <div className="text-xs text-blue-300 font-medium">KNOWLEDGE NODES</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                    <span className="text-blue-300">{knowledgeSources.filter(s => s.status === 'completed').length} active</span>
                  </div>
                </div>
              </div>

              {/* Coverage Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-rose-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-6 hover:border-pink-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-white">
                        {requirements.length > 0 ? Math.round((requirements.filter(r => r.ai_guidance).length / requirements.length) * 100) : 0}%
                      </div>
                      <div className="text-xs text-pink-300 font-medium">AI COVERAGE</div>
                    </div>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-pink-500/30 to-rose-600/30 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${requirements.length > 0 ? Math.round((requirements.filter(r => r.ai_guidance).length / requirements.length) * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* PHASE 4: Integration Status Card */}
            {integrationStatus && (
              <div className="relative group mb-8">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Requirements Integration</h3>
                        <p className="text-xs text-emerald-300">Phase 4: Connect approved guidance to unified requirements</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowIntegrationDialog(true)}
                      disabled={isIntegrating}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                    >
                      {isIntegrating ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Integrating... ({integrationProgress}%)
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Rocket className="w-4 h-4" />
                          Start Integration
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Integration Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-black/40 rounded-xl border border-emerald-500/10">
                      <div className="text-2xl font-bold text-white">{integrationStatus.total_categories}</div>
                      <div className="text-xs text-emerald-300">Categories</div>
                    </div>
                    <div className="text-center p-3 bg-black/40 rounded-xl border border-emerald-500/10">
                      <div className="text-2xl font-bold text-white">{integrationStatus.categories_with_approved_guidance}</div>
                      <div className="text-xs text-emerald-300">With Guidance</div>
                    </div>
                    <div className="text-center p-3 bg-black/40 rounded-xl border border-emerald-500/10">
                      <div className="text-2xl font-bold text-white">{integrationStatus.integrated_requirements}</div>
                      <div className="text-xs text-emerald-300">Integrated</div>
                    </div>
                    <div className="text-center p-3 bg-black/40 rounded-xl border border-emerald-500/10">
                      <div className="text-2xl font-bold text-white">{integrationStatus.pending_integration}</div>
                      <div className="text-xs text-emerald-300">Pending</div>
                    </div>
                    <div className="text-center p-3 bg-black/40 rounded-xl border border-emerald-500/10">
                      <div className="text-2xl font-bold text-white">{integrationStatus.export_formats_available}</div>
                      <div className="text-xs text-emerald-300">Export Formats</div>
                    </div>
                  </div>

                  {/* Last Integration */}
                  {integrationStatus.last_integration && (
                    <div className="mt-4 text-center text-xs text-gray-400">
                      Last integration: {new Date(integrationStatus.last_integration).toLocaleString()}
                    </div>
                  )}

                  {/* Integration Progress */}
                  {isIntegrating && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
                        <span>Integration Progress</span>
                        <span>{integrationProgress}%</span>
                      </div>
                      <div className="w-full bg-emerald-900/30 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${integrationProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Integration Result */}
                  {integrationResult && (
                    <div className="mt-4 p-3 rounded-xl border">
                      {integrationResult.success ? (
                        <div className="border-green-500/20 bg-green-500/10">
                          <div className="text-sm text-green-300 font-semibold mb-2">✅ Integration Completed Successfully</div>
                          <div className="text-xs text-green-200">
                            • {integrationResult.integrated_requirements.length} requirements integrated
                            • {integrationResult.audit_entries.length} audit entries created
                            {integrationResult.export_summary && (
                              <span> • Exported to {integrationResult.export_summary.formats.length} formats</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="border-red-500/20 bg-red-500/10">
                          <div className="text-sm text-red-300 font-semibold mb-2">❌ Integration Failed</div>
                          <div className="text-xs text-red-200">
                            {integrationResult.failed_integrations.map(failure => 
                              `• ${failure.category_id}: ${failure.error}`
                            ).join('\n')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Comprehensive Guidance Previews */}
            <div className="space-y-6">
              {/* Epic Comprehensive Guidance Header */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Comprehensive Guidance</h3>
                      <p className="text-xs text-cyan-300">All-frameworks unified guidance previews</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{categoryGuidances.length}</div>
                      <div className="text-xs text-cyan-300">Categories</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {categoryGuidances.reduce((sum, cg) => sum + cg.frameworks_included.length, 0)}
                      </div>
                      <div className="text-xs text-cyan-300">Frameworks</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {categoryGuidances.length > 0 ? Math.round(categoryGuidances.reduce((sum, cg) => sum + cg.coverage_percentage, 0) / categoryGuidances.length) : 0}%
                      </div>
                      <div className="text-xs text-cyan-300">Coverage</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PHASE 1: Search and Filter Interface */}
              <div className="relative group mb-6">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-purple-400" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as any)}
                        className="px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="with_guidance">With Guidance</option>
                        <option value="pending_suggestions">Pending Enhancement</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-300">
                      Showing {filteredCategories.length} of {categories.length} categories
                    </span>
                    <span className="text-purple-300">
                      {filteredCategories.filter(cat => categoryGuidances.find(cg => cg.category_id === cat.id)).length} with AI guidance
                    </span>
                  </div>
                </div>
              </div>

              {/* PHASE 1: Enhanced Category Container */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-15"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl">
                  {/* Header */}
                  <div className="p-4 border-b border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-white">Category Management</h4>
                      <div className="text-xs text-purple-300">
                        🎯 Click any category to load unified guidance
                      </div>
                    </div>
                  </div>
                  
                  {/* Scrollable Categories */}
                  <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                    {filteredCategories.map((category, index) => {
                  const guidance = categoryGuidances.find(cg => cg.category_id === category.id);
                  const categoryRequirements = requirements.filter(r => r.category_id === category.id);
                  
                  return (
                    <div key={category.id} className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>
                      <div 
                        className={`relative bg-black/50 backdrop-blur-xl border rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                          selectedCategoryGuidance?.category_id === category.id
                            ? 'border-purple-400/60 bg-purple-500/10'
                            : 'border-purple-500/20 hover:border-purple-500/40'
                        }`}
                        onClick={async () => {
                          console.log(`🔄 Category clicked: ${category.name}`, {
                            organization: organization?.id || 'null',
                            user: user?.id || 'null',
                            isPlatformAdmin: isPlatformAdmin || false,
                            complianceMappings: complianceMappings?.length || 'null'
                          });
                          
                          // Set selected category first
                          setActiveCategory(category);
                          
                          // Clear previous guidance and sub-guidance initially
                          setSelectedCategoryGuidance(null);
                          setSubGuidanceItems([]);
                          
                          if (isPlatformAdmin) {
                            // Platform Admin mode - generate real unified guidance (same as compliance simplification)
                            console.log('🔒 Platform Admin mode - generating real unified guidance');
                            try {
                              const realSubGuidance = await generateRealUnifiedGuidance(category.name);
                              setSubGuidanceItems(realSubGuidance);
                              console.log(`✅ Generated ${realSubGuidance.length} real sub-guidance items for ${category.name}:`,
                                realSubGuidance.map(item => `${item.label}(${item.content.split('\n').length} lines)`).join(', ')
                              );
                            } catch (error) {
                              console.error('Error generating real unified guidance:', error);
                              setSubGuidanceItems([]);
                            }
                            return;
                          }

                          // Regular organization mode
                          if (!organization) {
                            console.error('❌ No organization context available - cannot load data');
                            return;
                          }

                          // Check for compliance mappings
                          if (!complianceMappings || complianceMappings.length === 0) {
                            console.warn('⚠️ No compliance mappings available - loading without sub-requirements');
                          }
                          
                          console.log(`🔄 Loading unified guidance for category: ${category.name}`);
                          try {
                            // Load comprehensive guidance first
                            const freshGuidances = await ComprehensiveGuidanceService.loadComprehensiveGuidance(organization.id);
                            setCategoryGuidances(freshGuidances);
                            
                            // Find and set the specific category guidance
                            const categoryGuidance = freshGuidances.find(cg => cg.category_id === category.id);
                            if (categoryGuidance) {
                              setSelectedCategoryGuidance(categoryGuidance);
                              console.log(`✅ Loaded comprehensive guidance for ${category.name}:`, {
                                coverage: categoryGuidance.coverage_percentage,
                                frameworks: categoryGuidance.frameworks_included.length,
                                confidence: categoryGuidance.confidence_score
                              });
                            } else {
                              console.log(`⚠️ No comprehensive guidance found for ${category.name}`);
                              setSelectedCategoryGuidance(null);
                            }
                            
                            // Try to load existing sub-requirements
                            if (complianceMappings && complianceMappings.length > 0) {
                              const complianceData = await loadExistingSubRequirements(category.name);
                              
                              if (complianceData && complianceData.subRequirements?.length > 0) {
                                const convertedSubGuidance = convertSubRequirementsToSubGuidance(complianceData.subRequirements, category.name);
                                setSubGuidanceItems(convertedSubGuidance);
                                console.log(`✅ Loaded ${convertedSubGuidance.length} existing sub-requirements for ${category.name}:`, 
                                  convertedSubGuidance.map(item => `${item.label}(${item.content.split('\n').length} lines)`).join(', ')
                                );
                              } else {
                                setSubGuidanceItems([]);
                                console.log(`ℹ️ No existing sub-requirements found for ${category.name}`);
                              }
                            } else {
                              console.log(`⚠️ No compliance mappings - cannot load sub-requirements for ${category.name}`);
                              setSubGuidanceItems([]);
                            }
                            
                          } catch (error) {
                            console.error('Error loading category data:', error);
                            setSelectedCategoryGuidance(null);
                            setSubGuidanceItems([]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-sm">{category.name}</h4>
                            <p className="text-xs text-gray-300">{categoryRequirements.length} requirements</p>
                          </div>
                          {guidance && (
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                guidance.coverage_percentage >= 80 ? 'bg-green-400' :
                                guidance.coverage_percentage >= 60 ? 'bg-yellow-400' :
                                'bg-red-400'
                              } animate-pulse`}></div>
                              <span className="text-xs text-white font-medium">{guidance.coverage_percentage}%</span>
                            </div>
                          )}
                        </div>

                        {guidance ? (
                          <div className="space-y-2">
                            <div className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                              {guidance.comprehensive_guidance.slice(0, 150)}...
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {guidance.key_topics.slice(0, 3).map((topic: string, index: number) => (
                                <Badge key={index} className="bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs">
                                  {topic}
                                </Badge>
                              ))}
                              {guidance.frameworks_included.length > 0 && (
                                <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs">
                                  {guidance.frameworks_included.length} frameworks
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              Updated: {new Date(guidance.last_generated).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="text-xs text-gray-400 mb-2">No sub-requirements guidance yet</div>
                            <div className="text-xs text-purple-300">Select a category to begin editing</div>
                          </div>
                        )}
                        
                        {selectedCategoryGuidance?.category_id === category.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Comprehensive Guidance Viewer */}
            <div className="space-y-6">
              {/* PHASE 2: Triple URL Input System - Above Content Viewer */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Authoritative URL Ingestion</h3>
                      <p className="text-xs text-purple-300">Add up to 3 expert sources to enhance unified guidance</p>
                    </div>
                  </div>
                  
                  {/* Three URL Input Fields */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-300 text-xs font-bold">1</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://www.nist.gov/cybersecurity-framework"
                        value={url1}
                        onChange={(e) => setUrl1(e.target.value)}
                        className="flex-1 px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-300 text-xs font-bold">2</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://csrc.nist.gov/publications/detail/sp/800-53"
                        value={url2}
                        onChange={(e) => setUrl2(e.target.value)}
                        className="flex-1 px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-300 text-xs font-bold">3</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://www.cisa.gov/cybersecurity-best-practices"
                        value={url3}
                        onChange={(e) => setUrl3(e.target.value)}
                        className="flex-1 px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* AI Reference URL */}
                  <div className="pt-4 border-t border-purple-500/20">
                    <label className="text-xs text-purple-300 mb-2 block flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      AI Reference URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={aiReferenceUrl}
                      onChange={(e) => setAiReferenceUrl(e.target.value)}
                      placeholder="https://example.com/compliance-doc"
                      className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">Provide a URL for AI to consider during guidance generation</p>
                  </div>
                  
                  {/* Process URLs Button */}
                  <div className="mt-4">
                    <Button
                      onClick={handleProcessUrls}
                      disabled={isProcessingUrls || !activeCategory || [url1, url2, url3].filter(url => url.trim()).length === 0}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                    >
                      {isProcessingUrls ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processing URLs... ({urlProcessingProgress}%)
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Generate Sub-Guidance from URLs
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Knowledge Bank Display */}
                  <div className="mt-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-semibold text-purple-300">AI Knowledge Bank</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { 
                          title: 'ISO 27001/27002', 
                          version: '2022', 
                          files: ['ISO 27001.pdf', 'ISO_27001_27002_Requirements_Extraction.md'], 
                          pages: 214,
                          icon: Award,
                          type: 'iso'
                        },
                        { 
                          title: 'NIS2 Directive', 
                          version: '2022/2555', 
                          files: ['CELEX_32022L2555_EN_TXT.pdf'], 
                          pages: 78,
                          icon: ShieldCheck,
                          type: 'directive'
                        },
                        { 
                          title: 'CIS Controls', 
                          version: '8.1.2', 
                          files: ['CIS_Controls_Version_8.1.2___March_2025.xlsx'], 
                          pages: 45,
                          icon: FileSpreadsheet,
                          type: 'controls'
                        },
                        { 
                          title: 'GDPR', 
                          version: '2016/679', 
                          files: ['gdpr.pdf'], 
                          pages: 88,
                          icon: Scale,
                          type: 'regulation'
                        }
                      ].map(standard => {
                        const IconComponent = standard.icon;
                        return (
                          <div key={standard.title} className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20 hover:border-purple-400/30 transition-colors">
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-3 h-3 text-purple-400" />
                              <div>
                                <div className="text-xs font-medium text-white">{standard.title}</div>
                                <div className="text-xs text-purple-300">v{standard.version}</div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 font-medium">{standard.pages}p</div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">Standards available for AI-powered analysis</p>
                  </div>

                  {/* URL Processing Progress */}
                  {isProcessingUrls && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-purple-300 mb-1">
                        <span>Processing Progress</span>
                        <span>{urlProcessingProgress}%</span>
                      </div>
                      <div className="w-full bg-purple-900/30 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${urlProcessingProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* URL Processing Status */}
                  <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="text-xs text-purple-200 mb-2">URL Processing Workflow:</div>
                    <div className="text-xs text-gray-300">1. Admin inputs authoritative URLs above</div>
                    <div className="text-xs text-gray-300">2. AI processes and validates content</div>
                    <div className="text-xs text-gray-300">3. Admin reviews and approves sub-requirement enhancements</div>
                  </div>
                  
                  {/* Processing Status */}
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    {subGuidanceResult ? (
                      subGuidanceResult.success ? (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-300">
                            ✅ Generated {subGuidanceItems.length} sub-guidance items
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                          <span className="text-red-300">❌ Processing failed: {subGuidanceResult.error}</span>
                        </>
                      )
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-purple-300">
                          {activeCategory ? 'Ready to process URLs for sub-guidance' : 'Select a category first'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {activeCategory ? (
                <>
                  {/* Epic Category Details */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-black/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{activeCategory.name}</h3>
                          <p className="text-xs text-purple-300">
                            {selectedCategoryGuidance ? 'Comprehensive all-frameworks guidance' : 'Ready for URL enhancement'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="text-center p-3 bg-black/40 rounded-xl border border-purple-500/10">
                          <div className="text-lg font-bold text-white">
                            {selectedCategoryGuidance ? `${selectedCategoryGuidance.coverage_percentage}%` : '0%'}
                          </div>
                          <div className="text-xs text-purple-300">Coverage</div>
                        </div>
                        <div className="text-center p-3 bg-black/40 rounded-xl border border-purple-500/10">
                          <div className="text-lg font-bold text-white">
                            {selectedCategoryGuidance ? selectedCategoryGuidance.frameworks_included.length : 0}
                          </div>
                          <div className="text-xs text-purple-300">Frameworks</div>
                        </div>
                        <div className="text-center p-3 bg-black/40 rounded-xl border border-purple-500/10">
                          <div className="text-lg font-bold text-white">
                            {selectedCategoryGuidance ? `${Math.round(selectedCategoryGuidance.confidence_score * 100)}%` : 'N/A'}
                          </div>
                          <div className="text-xs text-purple-300">Confidence</div>
                        </div>
                        <div className="text-center p-3 bg-black/40 rounded-xl border border-purple-500/10">
                          <div className="text-lg font-bold text-white">
                            {selectedCategoryGuidance ? selectedCategoryGuidance.total_requirements : requirements.filter(r => r.category_id === activeCategory.id).length}
                          </div>
                          <div className="text-xs text-purple-300">Requirements</div>
                        </div>
                      </div>

                      {/* Frameworks Included */}
                      {selectedCategoryGuidance ? (
                        <div className="mb-4">
                          <h4 className="text-xs text-purple-300 mb-2">🌐 Frameworks Included:</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCategoryGuidance.frameworks_included.map((framework: string, index: number) => (
                              <Badge key={index} className="bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs">
                                {framework}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 text-center py-6 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                          <div className="text-yellow-300 text-sm mb-2">⚠️ No guidance generated yet</div>
                          <div className="text-xs text-gray-400">Input URLs above and process with AI to generate guidance</div>
                        </div>
                      )}

                      {/* Key Topics */}
                      {selectedCategoryGuidance && selectedCategoryGuidance.key_topics.length > 0 && (
                        <div>
                          <h4 className="text-xs text-purple-300 mb-2">🎯 Key Topics:</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCategoryGuidance.key_topics.map((topic: string, index: number) => (
                              <Badge key={index} className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Epic Comprehensive Guidance Content */}
                  {selectedCategoryGuidance ? (
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                      <div className="relative bg-black/60 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">Comprehensive Guidance</h3>
                              <p className="text-xs text-indigo-300">Maximum framework coverage analysis</p>
                            </div>
                          </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-200 hover:bg-gradient-to-r hover:from-indigo-500/30 hover:to-purple-500/30">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-200 hover:bg-gradient-to-r hover:from-indigo-500/30 hover:to-purple-500/30">
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                      
                      {/* Guidance Content */}
                      <div className="relative p-6 bg-black/40 rounded-xl border border-indigo-500/10 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/50">
                        <div className="absolute top-2 right-2 flex gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                        </div>
                        <div 
                          className="text-sm leading-relaxed text-gray-200 prose prose-sm prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: selectedCategoryGuidance.comprehensive_guidance.replace(/\n/g, '<br/>') 
                          }}
                        />
                      </div>

                      {/* Implementation Steps */}
                      {selectedCategoryGuidance.implementation_steps.length > 0 && (
                        <div className="mt-4 p-4 bg-black/40 rounded-xl border border-indigo-500/10">
                          <h4 className="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Implementation Steps
                          </h4>
                          <div className="space-y-2">
                            {selectedCategoryGuidance.implementation_steps.map((step: string, index: number) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-bold mt-0.5">
                                  {index + 1}
                                </div>
                                <div className="text-xs text-gray-300 leading-relaxed">{step}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Compliance Notes */}
                      {selectedCategoryGuidance.compliance_notes.length > 0 && (
                        <div className="mt-4 p-4 bg-black/40 rounded-xl border border-indigo-500/10">
                          <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Framework Compliance Notes
                          </h4>
                          <div className="space-y-2">
                            {selectedCategoryGuidance.compliance_notes.map((note: string, index: number) => (
                              <div key={index} className="text-xs text-gray-300 leading-relaxed">
                                • {note}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Generation Info */}
                      <div className="mt-4 pt-4 border-t border-indigo-500/10 text-xs text-gray-400">
                        Generated: {new Date(selectedCategoryGuidance.last_generated).toLocaleString()} • 
                        Confidence: {Math.round(selectedCategoryGuidance.confidence_score * 100)}% • 
                        Frameworks: {selectedCategoryGuidance.frameworks_included.length}
                      </div>
                    </div>
                  </div>
                  ) : null}

                  {/* Sub-Guidance Items Viewer */}
                  {subGuidanceItems.length > 0 && (
                    <div className="relative group mt-6">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                      <div className="relative bg-black/60 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">Sub-Guidance Items (a, b, c...)</h3>
                              <p className="text-xs text-green-300">
                                {subGuidanceItems.length} items • 8-10 lines each • Generated from {[url1, url2, url3].filter(url => url.trim()).length} URLs
                              </p>
                            </div>
                          </div>
                          
                          {/* Validation Report Summary */}
                          {subGuidanceResult?.validationReport && (
                            <div className="flex gap-2">
                              <div className="text-center p-2 bg-black/40 rounded-lg border border-green-500/10">
                                <div className="text-sm font-bold text-white">
                                  {subGuidanceResult.validationReport.qualityScore}%
                                </div>
                                <div className="text-xs text-green-300">Quality</div>
                              </div>
                              <div className="text-center p-2 bg-black/40 rounded-lg border border-green-500/10">
                                <div className="text-sm font-bold text-white">
                                  {subGuidanceResult.validationReport.lineCountCompliance ? '✅' : '⚠️'}
                                </div>
                                <div className="text-xs text-green-300">Lines</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Bulk Actions Header */}
                        <div className="mb-4 p-3 bg-black/40 rounded-xl border border-green-500/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                checked={selectedItems.length === subGuidanceItems.length && subGuidanceItems.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems(subGuidanceItems.map(item => item.id));
                                  } else {
                                    setSelectedItems([]);
                                  }
                                }}
                                className="w-4 h-4 text-green-600 bg-black border-green-500/30 rounded focus:ring-green-500"
                              />
                              <span className="text-sm text-green-300">
                                {selectedItems.length > 0 
                                  ? `${selectedItems.length} selected` 
                                  : 'Select all'
                                }
                              </span>
                            </div>
                            
                            {selectedItems.length > 0 && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={handleSubmitForReview}
                                  className="bg-blue-500/20 border border-blue-400/30 text-blue-200 hover:bg-blue-500/30"
                                >
                                  <Upload className="w-3 h-3 mr-1" />
                                  Submit for Review
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    setApprovalAction('approve');
                                    setShowApprovalDialog(true);
                                  }}
                                  disabled={isProcessingApproval}
                                  className="bg-green-500/20 border border-green-400/30 text-green-200 hover:bg-green-500/30"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Bulk Approve
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Sub-Guidance Items Grid */}
                        <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/50">
                          {subGuidanceItems.map((item) => {
                            const lines = item.content.split('\n').filter(line => line.trim().length > 0);
                            const isCompliant = lines.length >= 8 && lines.length <= 10;
                            const isEditing = editingItemId === item.id;
                            const isSelected = selectedItems.includes(item.id);
                            
                            const getStatusColor = (status?: string) => {
                              switch (status) {
                                case 'approved': return 'border-green-500/40 bg-green-500/5';
                                case 'rejected': return 'border-red-500/40 bg-red-500/5';
                                case 'pending_review': return 'border-blue-500/40 bg-blue-500/5';
                                case 'needs_revision': return 'border-orange-500/40 bg-orange-500/5';
                                default: return isCompliant 
                                  ? 'border-green-500/20 hover:border-green-500/40' 
                                  : 'border-yellow-500/20 hover:border-yellow-500/40';
                              }
                            };
                            
                            return (
                              <div key={item.id} className="relative group">
                                <div className={`relative border rounded-xl p-4 transition-all duration-300 ${
                                  isSelected ? 'border-purple-500/60 bg-purple-500/10' : getStatusColor(item.status)
                                }`}>
                                  <div className="flex items-start gap-3">
                                    {/* Selection Checkbox */}
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedItems([...selectedItems, item.id]);
                                        } else {
                                          setSelectedItems(selectedItems.filter(id => id !== item.id));
                                        }
                                      }}
                                      className="mt-1 w-4 h-4 text-purple-600 bg-black border-purple-500/30 rounded focus:ring-purple-500"
                                    />

                                    {/* Label Badge */}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                                      item.status === 'approved' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                      item.status === 'rejected' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                      item.status === 'pending_review' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                      item.status === 'needs_revision' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                      isCompliant 
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                        : 'bg-gradient-to-r from-yellow-500 to-orange-600'
                                    }`}>
                                      <span className="text-white text-sm font-bold">{item.label}</span>
                                    </div>
                                    
                                    <div className="flex-1">
                                      {/* Status Badge */}
                                      {item.status && (
                                        <div className="mb-2">
                                          <Badge className={`text-xs ${
                                            item.status === 'approved' ? 'bg-green-500/20 text-green-200 border-green-400/30' :
                                            item.status === 'rejected' ? 'bg-red-500/20 text-red-200 border-red-400/30' :
                                            item.status === 'pending_review' ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' :
                                            item.status === 'needs_revision' ? 'bg-orange-500/20 text-orange-200 border-orange-400/30' :
                                            'bg-gray-500/20 text-gray-200 border-gray-400/30'
                                          }`}>
                                            {item.status.replace('_', ' ').toUpperCase()}
                                          </Badge>
                                        </div>
                                      )}

                                      {/* Content Editor or Display */}
                                      <div className="mb-3">
                                        {isEditing ? (
                                          <div className="space-y-3">
                                            <textarea
                                              value={editContent}
                                              onChange={(e) => setEditContent(e.target.value)}
                                              rows={10}
                                              className="w-full px-3 py-2 bg-black/50 border border-gray-500/30 rounded text-gray-200 text-sm resize-none focus:outline-none focus:border-purple-400"
                                              placeholder="Edit sub-guidance content (8-10 lines)..."
                                            />
                                            <input
                                              type="text"
                                              value={editReason}
                                              onChange={(e) => setEditReason(e.target.value)}
                                              placeholder="Reason for edit..."
                                              className="w-full px-3 py-2 bg-black/50 border border-gray-500/30 rounded text-gray-200 text-xs focus:outline-none focus:border-purple-400"
                                            />
                                            <div className="flex gap-2">
                                              <Button 
                                                size="sm" 
                                                onClick={handleSaveEdit}
                                                className="bg-green-500/20 border border-green-400/30 text-green-200"
                                              >
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Save
                                              </Button>
                                              <Button 
                                                size="sm" 
                                                onClick={handleCancelEdit}
                                                className="bg-red-500/20 border border-red-400/30 text-red-200"
                                              >
                                                <X className="w-3 h-3 mr-1" />
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-sm leading-relaxed text-gray-200 whitespace-pre-line">
                                            {item.content}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Review Comments */}
                                      {item.reviewComments && (
                                        <div className="mb-3 p-2 bg-black/40 rounded border border-gray-500/20">
                                          <div className="text-xs text-gray-400 mb-1">
                                            Review by {item.reviewerName} on {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : 'Unknown date'}
                                          </div>
                                          <div className="text-xs text-gray-300">{item.reviewComments}</div>
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-4">
                                          <span className={`${isCompliant ? 'text-green-300' : 'text-yellow-300'}`}>
                                            {lines.length} lines {isCompliant ? '✅' : '⚠️'}
                                          </span>
                                          <span className="text-gray-400">
                                            Confidence: {Math.round(item.confidence * 100)}%
                                          </span>
                                          {item.revisionHistory && item.revisionHistory.length > 0 && (
                                            <span className="text-blue-300">
                                              {item.revisionHistory.length} revision{item.revisionHistory.length !== 1 ? 's' : ''}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Globe className="w-3 h-3 text-blue-400" />
                                          <span className="text-blue-300">{item.sources.length} sources</span>
                                        </div>
                                      </div>

                                      {/* Individual Action Buttons */}
                                      {!isEditing && (
                                        <div className="mt-3 flex gap-2">
                                          <Button 
                                            size="sm" 
                                            onClick={() => handleStartEdit(item)}
                                            className="bg-blue-500/20 border border-blue-400/30 text-blue-200 hover:bg-blue-500/30"
                                          >
                                            <Edit className="w-3 h-3 mr-1" />
                                            Edit
                                          </Button>
                                          
                                          {item.status !== 'approved' && (
                                            <Button 
                                              size="sm" 
                                              onClick={() => handleApproveItem(item.id)}
                                              disabled={isProcessingApproval}
                                              className="bg-green-500/20 border border-green-400/30 text-green-200 hover:bg-green-500/30"
                                            >
                                              <CheckCircle className="w-3 h-3 mr-1" />
                                              Approve
                                            </Button>
                                          )}
                                          
                                          {item.status !== 'rejected' && (
                                            <Button 
                                              size="sm" 
                                              onClick={() => {
                                                const comments = prompt('Enter rejection reason:');
                                                if (comments) handleRejectItem(item.id, comments);
                                              }}
                                              disabled={isProcessingApproval}
                                              className="bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30"
                                            >
                                              <X className="w-3 h-3 mr-1" />
                                              Reject
                                            </Button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Summary Action Buttons */}
                        <div className="mt-6 pt-4 border-t border-green-500/10">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-green-300">
                              {subGuidanceItems.filter(item => item.status === 'approved').length} approved • {' '}
                              {subGuidanceItems.filter(item => item.status === 'pending_review').length} pending • {' '}
                              {subGuidanceItems.filter(item => item.status === 'draft').length} draft
                            </div>
                            <div className="flex gap-3">
                              <Button 
                                size="sm" 
                                onClick={() => loadSubGuidanceForReview()}
                                className="bg-gradient-to-r from-blue-500/20 to-blue-500/20 border border-blue-400/30 text-blue-200 hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-blue-500/30"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Refresh
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-200 hover:bg-gradient-to-r hover:from-green-500/30 hover:to-emerald-500/30"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Export Results
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 via-slate-600 to-gray-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-black/60 backdrop-blur-xl border border-gray-500/20 rounded-2xl p-6">
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-r from-gray-500/20 to-slate-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Comprehensive Guidance Viewer</h3>
                      <p className="text-gray-300 mb-4">
                        Select a category from the left to view comprehensive guidance
                      </p>
                      <p className="text-xs text-gray-400">
                        📚 All-frameworks unified guidance with maximum coverage
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 3: Bulk Approval Dialog */}
      {showApprovalDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-black/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  {approvalAction === 'approve' ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {approvalAction === 'approve' ? 'Bulk Approve Items' : 'Bulk Reject Items'}
                  </h3>
                  <p className="text-xs text-gray-300">
                    {selectedItems.length} items selected
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">
                  Review Comments {approvalAction === 'reject' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded text-gray-200 text-sm resize-none focus:outline-none focus:border-purple-400"
                  placeholder={
                    approvalAction === 'approve' 
                      ? 'Add any approval comments...' 
                      : 'Explain why these items are being rejected...'
                  }
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowApprovalDialog(false);
                    setReviewComment('');
                    setApprovalAction(null);
                  }}
                  className="flex-1 bg-gray-500/20 border border-gray-400/30 text-gray-200 hover:bg-gray-500/30"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkApprove}
                  disabled={isProcessingApproval || (approvalAction === 'reject' && !reviewComment.trim())}
                  className={`flex-1 ${
                    approvalAction === 'approve' 
                      ? 'bg-green-500/20 border border-green-400/30 text-green-200 hover:bg-green-500/30'
                      : 'bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30'
                  }`}
                >
                  {isProcessingApproval ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {approvalAction === 'approve' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      {approvalAction === 'approve' ? 'Approve All' : 'Reject All'}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4: Integration Dialog */}
      {showIntegrationDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-black/90 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-20"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Requirements Integration</h3>
                    <p className="text-sm text-emerald-300">Connect approved sub-guidance to unified requirements</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setShowIntegrationDialog(false);
                    setSelectedExportFormats([]);
                  }}
                  className="bg-gray-500/20 border border-gray-400/30 text-gray-200 hover:bg-gray-500/30"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Integration Scope */}
              <div className="mb-6 p-4 bg-black/40 rounded-xl border border-emerald-500/10">
                <h4 className="text-sm font-bold text-emerald-300 mb-3">Integration Scope</h4>
                <div className="text-sm text-gray-300">
                  {activeCategory ? (
                    <div>
                      <div className="mb-2">🎯 <strong>Selected Category:</strong> {activeCategory.name}</div>
                      <div className="text-xs text-gray-400">
                        Only approved sub-guidance from this category will be integrated
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2">🌐 <strong>All Categories:</strong> Organization-wide integration</div>
                      <div className="text-xs text-gray-400">
                        All approved sub-guidance items from all categories will be integrated
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Export Format Selection */}
              <div className="mb-6 p-4 bg-black/40 rounded-xl border border-emerald-500/10">
                <h4 className="text-sm font-bold text-emerald-300 mb-3">Export Formats (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableExportFormats.map(format => (
                    <div key={format.format} className="flex items-start gap-3 p-3 bg-black/30 rounded-lg border border-emerald-500/10">
                      <input
                        type="checkbox"
                        checked={selectedExportFormats.includes(format.format)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExportFormats([...selectedExportFormats, format.format]);
                          } else {
                            setSelectedExportFormats(selectedExportFormats.filter(f => f !== format.format));
                          }
                        }}
                        className="mt-1 w-4 h-4 text-emerald-600 bg-black border-emerald-500/30 rounded focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{format.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{format.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedExportFormats.length > 0 && (
                  <div className="mt-3 text-xs text-emerald-300">
                    {selectedExportFormats.length} format{selectedExportFormats.length !== 1 ? 's' : ''} selected for automatic export
                  </div>
                )}
              </div>

              {/* Integration Workflow */}
              <div className="mb-6 p-4 bg-black/40 rounded-xl border border-emerald-500/10">
                <h4 className="text-sm font-bold text-emerald-300 mb-3">Integration Workflow</h4>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>1. Load all approved sub-guidance items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>2. Create unified requirements structure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>3. Store integrated requirements in database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>4. Create comprehensive audit trail</span>
                  </div>
                  {selectedExportFormats.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>5. Export to selected compliance frameworks</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowIntegrationDialog(false);
                    setSelectedExportFormats([]);
                  }}
                  className="flex-1 bg-gray-500/20 border border-gray-400/30 text-gray-200 hover:bg-gray-500/30"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleIntegrateApprovedGuidance}
                  disabled={isIntegrating}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                >
                  {isIntegrating ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Integrating... ({integrationProgress}%)
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      Start Integration
                      {selectedExportFormats.length > 0 && <span className="text-xs">& Export</span>}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
