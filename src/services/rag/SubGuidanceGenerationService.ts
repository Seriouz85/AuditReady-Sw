import { supabase } from '@/lib/supabase';
import { KnowledgeIngestionService } from './KnowledgeIngestionService';
import { RAGGenerationService } from './RAGGenerationService';

export interface SubGuidanceItem {
  id: string;
  label: string; // a), b), c), etc.
  content: string; // 8-10 lines max
  sources: string[];
  confidence: number;
  // Phase 3: Approval workflow fields
  status?: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'needs_revision';
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewComments?: string;
  revisionHistory?: SubGuidanceRevision[];
  originalContent?: string; // Store original before edits
}

export interface SubGuidanceRevision {
  id: string;
  content: string;
  editedBy: string;
  editedByName: string;
  editedAt: string;
  reason: string;
  previousContent: string;
}

export interface SubGuidanceRequest {
  categoryId: string;
  categoryName: string;
  unifiedRequirement: string;
  authoritativeUrls: string[];
  organizationId: string;
}

export interface SubGuidanceResult {
  success: boolean;
  subGuidanceItems: SubGuidanceItem[];
  error?: string;
  validationReport?: {
    qualityScore: number;
    lineCountCompliance: boolean;
    sourceRelevance: number;
    requirementAlignment: number;
  };
}

/**
 * 🎯 Service for generating sub-guidance items (a, b, c, etc.) from authoritative URLs
 * that answer and explain unified requirements in 8-10 lines each
 */
export class SubGuidanceGenerationService {
  
  /**
   * 🚀 Main method to process URLs and generate sub-guidance items
   */
  static async generateSubGuidanceFromUrls(
    request: SubGuidanceRequest,
    options: {
      onProgress?: (progress: number, message?: string) => void;
      maxSubItems?: number;
    } = {}
  ): Promise<SubGuidanceResult> {
    const { onProgress, maxSubItems = 6 } = options;
    
    try {
      console.log('🎯 Starting sub-guidance generation from URLs...', request);
      onProgress?.(10, 'Processing authoritative URLs...');

      // Step 1: Ingest content from all provided URLs
      const urlContents = await this.ingestMultipleUrls(
        request.authoritativeUrls, 
        { onProgress: (p) => onProgress?.(10 + p * 0.3) }
      );

      onProgress?.(40, 'Analyzing content for sub-requirements...');

      // Step 2: Generate sub-guidance items using AI
      const subGuidanceItems = await this.generateSubRequirements(
        request,
        urlContents,
        maxSubItems
      );

      onProgress?.(70, 'Validating sub-guidance quality...');

      // Step 3: Validate each sub-guidance item
      const validatedItems = await this.validateSubGuidanceItems(
        subGuidanceItems,
        request.unifiedRequirement
      );

      onProgress?.(90, 'Finalizing sub-guidance...');

      // Step 4: Generate validation report
      const validationReport = this.generateValidationReport(validatedItems);

      onProgress?.(100, 'Sub-guidance generation completed');

      return {
        success: true,
        subGuidanceItems: validatedItems,
        validationReport
      };

    } catch (error) {
      console.error('❌ Sub-guidance generation failed:', error);
      return {
        success: false,
        subGuidanceItems: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * 📚 Ingest content from multiple URLs
   */
  private static async ingestMultipleUrls(
    urls: string[],
    options: { onProgress?: (progress: number) => void } = {}
  ): Promise<Array<{ url: string, content: string, title?: string }>> {
    const { onProgress } = options;
    const results = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      onProgress?.(((i + 1) / urls.length) * 100);
      
      try {
        console.log(`📚 Ingesting URL ${i + 1}/${urls.length}: ${url}`);
        
        const result = await KnowledgeIngestionService.ingestFromURL(url, {
          includeSubpages: false, // Focus on main content for sub-guidance
          maxDepth: 1,
          extractTextOnly: true
        });

        if (result.success && result.content) {
          results.push({
            url,
            content: result.content,
            title: result.title
          });
        }
      } catch (error) {
        console.warn(`⚠️ Failed to ingest URL: ${url}`, error);
        // Continue with other URLs even if one fails
      }
    }

    console.log(`✅ Successfully ingested ${results.length}/${urls.length} URLs`);
    return results;
  }

  /**
   * 🧠 Generate sub-requirements using AI based on ingested content
   */
  private static async generateSubRequirements(
    request: SubGuidanceRequest,
    urlContents: Array<{ url: string, content: string, title?: string }>,
    maxSubItems: number
  ): Promise<SubGuidanceItem[]> {
    
    // Combine all URL content into a comprehensive knowledge base
    const combinedContent = urlContents.map(uc => 
      `Source: ${uc.url}\nTitle: ${uc.title || 'N/A'}\nContent: ${uc.content}`
    ).join('\n\n---\n\n');

    const prompt = this.buildSubGuidancePrompt(
      request.categoryName,
      request.unifiedRequirement,
      combinedContent,
      maxSubItems
    );

    try {
      // Use RAG service to generate structured sub-guidance
      const mockRequirement = {
        id: `sub-guidance-${request.categoryId}`,
        title: `Sub-guidance for ${request.categoryName}`,
        description: prompt,
        category_id: request.categoryId,
        organization_id: request.organizationId
      };

      const result = await RAGGenerationService.generateGuidance(
        mockRequirement,
        request.categoryName,
        { 'Authoritative Sources': true } // Use the ingested content as framework
      );

      if (!result.success || !result.guidance) {
        throw new Error('Failed to generate AI guidance');
      }

      // Parse the AI response into structured sub-guidance items
      return this.parseSubGuidanceResponse(result.guidance, urlContents.map(uc => uc.url));

    } catch (error) {
      console.error('Error generating sub-requirements:', error);
      
      // Fallback: Create basic sub-guidance structure
      return this.createFallbackSubGuidance(request, urlContents);
    }
  }

  /**
   * 📝 Build the AI prompt for generating sub-guidance
   */
  private static buildSubGuidancePrompt(
    categoryName: string,
    unifiedRequirement: string,
    combinedContent: string,
    maxSubItems: number
  ): string {
    return `
TASK: Generate ${maxSubItems} specific sub-guidance items (a, b, c, etc.) that answer and explain the unified requirement below.

CATEGORY: ${categoryName}

UNIFIED REQUIREMENT:
${unifiedRequirement}

AUTHORITATIVE CONTENT:
${combinedContent.slice(0, 8000)} // Limit content to avoid token limits

INSTRUCTIONS:
1. Create exactly ${maxSubItems} sub-guidance items labeled a), b), c), etc.
2. Each sub-guidance item must be EXACTLY 8-10 lines long
3. Each item should directly answer or expand on the unified requirement
4. Use authoritative content provided above as the source material
5. Make each item practical and implementable
6. Ensure no duplication between items
7. Focus on different aspects/angles of the unified requirement

FORMAT:
a) [8-10 lines of specific guidance that answers the unified requirement]

b) [8-10 lines of specific guidance that answers the unified requirement from a different angle]

c) [Continue this pattern...]

Begin generation:
    `.trim();
  }

  /**
   * 🔍 Parse AI response into structured sub-guidance items
   */
  private static parseSubGuidanceResponse(
    aiResponse: string,
    sourceUrls: string[]
  ): SubGuidanceItem[] {
    const items: SubGuidanceItem[] = [];
    
    // Match patterns like "a)", "b)", etc. followed by content
    const itemPattern = /([a-z])\)\s*([\s\S]*?)(?=\n[a-z]\)|$)/gi;
    const matches = Array.from(aiResponse.matchAll(itemPattern));

    matches.forEach((match, index) => {
      const label = match[1].toLowerCase() + ')';
      const content = match[2].trim();
      
      // Validate line count (should be 8-10 lines)
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      
      if (lines.length >= 6 && lines.length <= 12) { // Allow some flexibility
        items.push({
          id: `sub-guidance-${index + 1}`,
          label,
          content: this.enforceLineLimit(content, 10),
          sources: sourceUrls,
          confidence: 0.85
        });
      }
    });

    // If parsing failed, try alternative patterns
    if (items.length === 0) {
      return this.parseAlternativeFormat(aiResponse, sourceUrls);
    }

    return items;
  }

  /**
   * 🔄 Parse alternative response formats
   */
  private static parseAlternativeFormat(
    aiResponse: string,
    sourceUrls: string[]
  ): SubGuidanceItem[] {
    const items: SubGuidanceItem[] = [];
    
    // Try numbered format like "1.", "2.", etc.
    const numberedPattern = /(\d+)\.?\s*([\s\S]*?)(?=\n\d+\.|$)/gi;
    const matches = Array.from(aiResponse.matchAll(numberedPattern));

    matches.forEach((match, index) => {
      const content = match[2].trim();
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      
      if (lines.length >= 6) {
        const letter = String.fromCharCode(97 + index); // Convert to a, b, c, etc.
        items.push({
          id: `sub-guidance-${index + 1}`,
          label: `${letter})`,
          content: this.enforceLineLimit(content, 10),
          sources: sourceUrls,
          confidence: 0.8
        });
      }
    });

    return items.slice(0, 6); // Limit to 6 items max
  }

  /**
   * ✂️ Enforce line limit for sub-guidance content
   */
  private static enforceLineLimit(content: string, maxLines: number): string {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length <= maxLines) {
      return content;
    }
    
    // Truncate to max lines and add continuation indicator if needed
    const truncated = lines.slice(0, maxLines);
    const lastLine = truncated[truncated.length - 1];
    
    // Ensure the last line ends properly
    if (!lastLine.endsWith('.') && !lastLine.endsWith('?') && !lastLine.endsWith('!')) {
      truncated[truncated.length - 1] = lastLine + '...';
    }
    
    return truncated.join('\n');
  }

  /**
   * ✅ Validate sub-guidance items for quality and compliance
   */
  private static async validateSubGuidanceItems(
    items: SubGuidanceItem[],
    unifiedRequirement: string
  ): Promise<SubGuidanceItem[]> {
    
    return items.map(item => {
      const lines = item.content.split('\n').filter(line => line.trim().length > 0);
      const lineCount = lines.length;
      
      // Adjust confidence based on line count compliance
      let adjustedConfidence = item.confidence;
      if (lineCount < 8 || lineCount > 10) {
        adjustedConfidence = Math.max(0.6, adjustedConfidence - 0.2);
      }
      
      // Check requirement alignment (basic keyword matching)
      const requirementWords = unifiedRequirement.toLowerCase().split(/\s+/);
      const contentWords = item.content.toLowerCase().split(/\s+/);
      const commonWords = requirementWords.filter(word => 
        word.length > 3 && contentWords.includes(word)
      ).length;
      
      const alignmentScore = Math.min(1, commonWords / Math.max(1, requirementWords.filter(w => w.length > 3).length));
      adjustedConfidence = (adjustedConfidence + alignmentScore) / 2;
      
      return {
        ...item,
        confidence: Math.round(adjustedConfidence * 100) / 100
      };
    });
  }

  /**
   * 📊 Generate validation report
   */
  private static generateValidationReport(items: SubGuidanceItem[]) {
    const totalItems = items.length;
    
    // Line count compliance
    const compliantItems = items.filter(item => {
      const lines = item.content.split('\n').filter(line => line.trim().length > 0);
      return lines.length >= 8 && lines.length <= 10;
    }).length;
    
    const lineCountCompliance = compliantItems === totalItems;
    
    // Average confidence/quality
    const averageConfidence = totalItems > 0 
      ? items.reduce((sum, item) => sum + item.confidence, 0) / totalItems 
      : 0;
    
    return {
      qualityScore: Math.round(averageConfidence * 100),
      lineCountCompliance,
      sourceRelevance: Math.round(averageConfidence * 100), // Simplified
      requirementAlignment: Math.round(averageConfidence * 100) // Simplified
    };
  }

  /**
   * 🚨 Create fallback sub-guidance when AI fails
   */
  private static createFallbackSubGuidance(
    request: SubGuidanceRequest,
    urlContents: Array<{ url: string, content: string, title?: string }>
  ): SubGuidanceItem[] {
    const fallbackItems: SubGuidanceItem[] = [];
    
    // Create basic sub-guidance structure based on common compliance areas
    const commonAspects = [
      'Establish comprehensive policies and procedures for implementation',
      'Implement monitoring and measurement mechanisms for continuous oversight', 
      'Ensure proper documentation and evidence collection for audit purposes',
      'Provide training and awareness programs for all stakeholders involved',
      'Conduct regular risk assessments and update controls accordingly',
      'Maintain incident response procedures and recovery capabilities'
    ];
    
    commonAspects.slice(0, Math.min(6, commonAspects.length)).forEach((aspect, index) => {
      const letter = String.fromCharCode(97 + index); // a, b, c, etc.
      
      // Expand each aspect to 8-10 lines
      const expandedContent = this.expandAspectToGuidance(
        aspect, 
        request.categoryName, 
        urlContents
      );
      
      fallbackItems.push({
        id: `fallback-${index + 1}`,
        label: `${letter})`,
        content: expandedContent,
        sources: urlContents.map(uc => uc.url),
        confidence: 0.7
      });
    });
    
    return fallbackItems;
  }

  /**
   * 📝 Expand a single aspect into 8-10 lines of guidance
   */
  private static expandAspectToGuidance(
    aspect: string, 
    categoryName: string, 
    urlContents: Array<{ url: string, content: string, title?: string }>
  ): string {
    
    // Create detailed guidance based on the aspect and category
    const expansions: Record<string, string> = {
      'policies': `Develop comprehensive ${categoryName.toLowerCase()} policies that align with organizational objectives and regulatory requirements.
Ensure policies are regularly reviewed, updated, and communicated to all relevant stakeholders across the organization.
Establish clear roles and responsibilities for policy implementation, maintenance, and compliance monitoring.
Create standardized procedures that provide step-by-step guidance for consistent implementation across all departments.
Implement version control and approval processes to maintain policy integrity and traceability.
Ensure policies are accessible, understandable, and translated into operational procedures for practical application.
Regular training should be provided to ensure all staff understand their responsibilities under these policies.
Document all policy exceptions and deviations with appropriate justification and approval processes.`,

      'monitoring': `Implement continuous monitoring systems that provide real-time visibility into ${categoryName.toLowerCase()} performance and compliance.
Establish key performance indicators (KPIs) and metrics that align with organizational objectives and regulatory requirements.
Deploy automated monitoring tools and dashboards to track compliance status and identify potential issues promptly.
Create regular reporting mechanisms that provide stakeholders with accurate, timely information about system performance.
Establish alerting systems that notify appropriate personnel when thresholds are exceeded or anomalies are detected.
Conduct periodic reviews and assessments to validate the effectiveness of monitoring controls and processes.
Ensure monitoring data is properly collected, stored, and analyzed to support decision-making and continuous improvement.
Maintain audit trails and documentation to demonstrate compliance and support regulatory reporting requirements.`,

      'documentation': `Maintain comprehensive documentation that supports ${categoryName.toLowerCase()} implementation, operation, and compliance verification.
Establish document management systems with proper version control, access controls, and retention policies in place.
Ensure all critical processes, procedures, and controls are properly documented with clear, actionable guidance.
Create standardized templates and formats to ensure consistency and completeness across all documentation types.
Implement regular review cycles to ensure documentation remains current, accurate, and reflects actual operational practices.
Establish clear ownership and accountability for document maintenance, updates, and quality assurance processes.
Ensure documentation is easily accessible to authorized personnel and properly protected from unauthorized access.
Maintain evidence of compliance activities, including records of reviews, assessments, and corrective actions taken.`
    };

    // Match aspect to expansion or create generic expansion
    const lowerAspect = aspect.toLowerCase();
    if (lowerAspect.includes('polic')) {
      return expansions['policies'];
    } else if (lowerAspect.includes('monitor')) {
      return expansions['monitoring'];  
    } else if (lowerAspect.includes('document')) {
      return expansions['documentation'];
    }
    
    // Generic expansion
    return `${aspect} within the context of ${categoryName.toLowerCase()} to ensure comprehensive coverage and effectiveness.
This requires establishing clear objectives, scope, and success criteria that align with organizational goals.
Implement appropriate controls and safeguards to mitigate identified risks and ensure regulatory compliance.
Assign qualified personnel with necessary authority and resources to oversee implementation and maintenance.
Establish regular review and assessment processes to evaluate effectiveness and identify improvement opportunities.
Ensure integration with existing organizational processes and systems to avoid duplication and inefficiency.
Provide adequate training and awareness programs to ensure all stakeholders understand their roles and responsibilities.
Maintain proper documentation and evidence to demonstrate compliance and support audit activities.`;
  }

  /**
   * 💾 Store sub-guidance items in database (optional)
   */
  static async storeSubGuidance(
    organizationId: string,
    categoryId: string,
    items: SubGuidanceItem[]
  ): Promise<void> {
    try {
      // Set initial status for new items
      const itemsWithStatus = items.map(item => ({
        ...item,
        status: item.status || 'draft',
        originalContent: item.originalContent || item.content
      }));

      const subGuidanceData = {
        organization_id: organizationId,
        category_id: categoryId,
        sub_guidance_items: itemsWithStatus,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await supabase
        .from('category_sub_guidance')
        .upsert(subGuidanceData);
        
      console.log('✅ Sub-guidance stored successfully');
    } catch (error) {
      console.error('Error storing sub-guidance:', error);
      // Don't throw - sub-guidance generation can succeed without storage
    }
  }

  /**
   * 🔍 Load existing sub-guidance items for review
   */
  static async loadSubGuidanceForReview(
    organizationId: string,
    categoryId: string
  ): Promise<SubGuidanceItem[]> {
    try {
      const { data, error } = await supabase
        .from('category_sub_guidance')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('category_id', categoryId)
        .single();

      if (error) throw error;
      return data?.sub_guidance_items || [];
    } catch (error) {
      console.error('Error loading sub-guidance for review:', error);
      return [];
    }
  }

  /**
   * ✏️ Edit a sub-guidance item with revision tracking
   */
  static async editSubGuidanceItem(
    organizationId: string,
    categoryId: string,
    itemId: string,
    newContent: string,
    editedBy: string,
    editedByName: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Load current sub-guidance
      const items = await this.loadSubGuidanceForReview(organizationId, categoryId);
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return { success: false, error: 'Sub-guidance item not found' };
      }

      const currentItem = items[itemIndex];
      
      // Validate line count
      const lines = newContent.split('\n').filter(line => line.trim().length > 0);
      if (lines.length < 6 || lines.length > 12) {
        return { 
          success: false, 
          error: `Content must be 6-12 lines (currently ${lines.length} lines)` 
        };
      }

      // Create revision entry
      const revision: SubGuidanceRevision = {
        id: `revision-${Date.now()}`,
        content: newContent,
        editedBy,
        editedByName,
        editedAt: new Date().toISOString(),
        reason,
        previousContent: currentItem.content
      };

      // Update item with new content and revision
      const updatedItem = {
        ...currentItem,
        content: newContent,
        status: 'needs_revision' as const,
        revisionHistory: [...(currentItem.revisionHistory || []), revision]
      };

      // Update items array
      items[itemIndex] = updatedItem;

      // Store updated sub-guidance
      await this.storeSubGuidance(organizationId, categoryId, items);
      
      console.log('✅ Sub-guidance item edited successfully');
      return { success: true };

    } catch (error) {
      console.error('Error editing sub-guidance item:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * ✅ Approve a sub-guidance item
   */
  static async approveSubGuidanceItem(
    organizationId: string,
    categoryId: string,
    itemId: string,
    reviewerId: string,
    reviewerName: string,
    comments?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const items = await this.loadSubGuidanceForReview(organizationId, categoryId);
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return { success: false, error: 'Sub-guidance item not found' };
      }

      // Update item status
      items[itemIndex] = {
        ...items[itemIndex],
        status: 'approved',
        reviewerId,
        reviewerName,
        reviewedAt: new Date().toISOString(),
        reviewComments: comments
      };

      await this.storeSubGuidance(organizationId, categoryId, items);
      console.log('✅ Sub-guidance item approved');
      return { success: true };

    } catch (error) {
      console.error('Error approving sub-guidance item:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * ❌ Reject a sub-guidance item
   */
  static async rejectSubGuidanceItem(
    organizationId: string,
    categoryId: string,
    itemId: string,
    reviewerId: string,
    reviewerName: string,
    comments: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const items = await this.loadSubGuidanceForReview(organizationId, categoryId);
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return { success: false, error: 'Sub-guidance item not found' };
      }

      // Update item status
      items[itemIndex] = {
        ...items[itemIndex],
        status: 'rejected',
        reviewerId,
        reviewerName,
        reviewedAt: new Date().toISOString(),
        reviewComments: comments
      };

      await this.storeSubGuidance(organizationId, categoryId, items);
      console.log('✅ Sub-guidance item rejected');
      return { success: true };

    } catch (error) {
      console.error('Error rejecting sub-guidance item:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * 📦 Bulk approve multiple sub-guidance items
   */
  static async bulkApproveSubGuidanceItems(
    organizationId: string,
    categoryId: string,
    itemIds: string[],
    reviewerId: string,
    reviewerName: string,
    comments?: string
  ): Promise<{ success: boolean; approved: number; failed: number; error?: string }> {
    try {
      const items = await this.loadSubGuidanceForReview(organizationId, categoryId);
      let approved = 0;
      let failed = 0;

      // Update each item
      itemIds.forEach(itemId => {
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          items[itemIndex] = {
            ...items[itemIndex],
            status: 'approved',
            reviewerId,
            reviewerName,
            reviewedAt: new Date().toISOString(),
            reviewComments: comments
          };
          approved++;
        } else {
          failed++;
        }
      });

      await this.storeSubGuidance(organizationId, categoryId, items);
      console.log(`✅ Bulk approval completed: ${approved} approved, ${failed} failed`);
      
      return { success: true, approved, failed };

    } catch (error) {
      console.error('Error in bulk approval:', error);
      return { 
        success: false, 
        approved: 0, 
        failed: itemIds.length,
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * 🔄 Submit items for review (draft -> pending_review)
   */
  static async submitForReview(
    organizationId: string,
    categoryId: string,
    itemIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const items = await this.loadSubGuidanceForReview(organizationId, categoryId);
      
      itemIds.forEach(itemId => {
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1 && items[itemIndex].status === 'draft') {
          items[itemIndex].status = 'pending_review';
        }
      });

      await this.storeSubGuidance(organizationId, categoryId, items);
      console.log('✅ Items submitted for review');
      return { success: true };

    } catch (error) {
      console.error('Error submitting for review:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}