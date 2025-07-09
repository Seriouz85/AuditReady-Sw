import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/monitoring/sentry';
import { analytics } from '@/lib/monitoring/analytics';
import { cacheService } from '@/lib/cache/cacheService';

export interface DocumentAnalysisResult {
  id: string;
  documentName: string;
  documentType: string;
  extractedRequirements: ExtractedRequirement[];
  mappedFrameworks: string[];
  confidence: number;
  processingTime: number;
  metadata: {
    pageCount?: number;
    wordCount?: number;
    language?: string;
    sections?: DocumentSection[];
  };
  createdAt: Date;
}

export interface ExtractedRequirement {
  text: string;
  category: string;
  mappedTo: MappedRequirement[];
  confidence: number;
  context?: string;
  keywords?: string[];
}

export interface MappedRequirement {
  requirementId: string;
  framework: string;
  title: string;
  similarity: number;
}

export interface DocumentSection {
  title: string;
  content: string;
  pageNumber?: number;
  requirementCount: number;
}

interface ProcessingOptions {
  frameworks?: string[];
  extractTables?: boolean;
  detectLanguage?: boolean;
  maxRequirements?: number;
}

class DocumentAnalysisService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly MIN_CONFIDENCE = 0.7;
  private readonly SIMILARITY_THRESHOLD = 0.75;

  // Compliance keywords and patterns
  private readonly COMPLIANCE_PATTERNS = {
    requirement: [
      /shall\s+\w+/gi,
      /must\s+\w+/gi,
      /required\s+to\s+\w+/gi,
      /needs?\s+to\s+\w+/gi,
      /responsible\s+for\s+\w+/gi,
      /ensure\s+that\s+\w+/gi,
      /comply\s+with\s+\w+/gi,
      /in\s+accordance\s+with\s+\w+/gi
    ],
    control: [
      /control\s*#?\s*\d+/gi,
      /section\s+\d+\.\d+/gi,
      /requirement\s+\d+/gi,
      /clause\s+\d+/gi,
      /article\s+\d+/gi
    ],
    category: {
      'Access Control': ['access', 'authentication', 'authorization', 'password', 'credential'],
      'Data Protection': ['encryption', 'confidentiality', 'privacy', 'personal data', 'sensitive'],
      'Incident Management': ['incident', 'breach', 'response', 'recovery', 'escalation'],
      'Risk Management': ['risk', 'threat', 'vulnerability', 'assessment', 'mitigation'],
      'Audit & Compliance': ['audit', 'compliance', 'review', 'evidence', 'documentation'],
      'Business Continuity': ['continuity', 'disaster', 'backup', 'recovery', 'availability'],
      'Security Operations': ['monitoring', 'logging', 'detection', 'alert', 'siem'],
      'Change Management': ['change', 'configuration', 'deployment', 'release', 'version']
    }
  };

  async analyzeDocument(input: {
    organizationId: string;
    documentUrl?: string;
    file?: any;
    frameworks?: string[];
  }): Promise<DocumentAnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Extract text from document
      const documentContent = await this.extractDocumentContent(input.documentUrl, input.file);
      
      // Process document
      const analysis = await this.processDocument(
        documentContent,
        {
          frameworks: input.frameworks,
          extractTables: true,
          detectLanguage: true,
          maxRequirements: 500
        }
      );

      // Store analysis result
      const result: DocumentAnalysisResult = {
        id: `doc_analysis_${Date.now()}`,
        documentName: input.file?.name || this.extractFilename(input.documentUrl || ''),
        documentType: this.detectDocumentType(documentContent),
        extractedRequirements: analysis.requirements,
        mappedFrameworks: analysis.frameworks,
        confidence: analysis.confidence,
        processingTime: Date.now() - startTime,
        metadata: analysis.metadata,
        createdAt: new Date()
      };

      // Cache result
      await cacheService.set(
        `doc_analysis:${result.id}`,
        result,
        this.CACHE_TTL
      );

      analytics.track('document_analyzed', {
        organization_id: input.organizationId,
        document_type: result.documentType,
        requirements_extracted: result.extractedRequirements.length,
        frameworks_mapped: result.mappedFrameworks.length,
        processing_time: result.processingTime,
        confidence: result.confidence
      });

      return result;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Document analysis failed'), {
        organization_id: input.organizationId,
        document_url: input.documentUrl
      });
      throw error;
    }
  }

  private async extractDocumentContent(url?: string, file?: any): Promise<string> {
    if (url) {
      // Fetch document from URL
      const response = await fetch(url);
      const blob = await response.blob();
      return this.extractTextFromBlob(blob);
    } else if (file) {
      return this.extractTextFromBlob(file);
    }
    
    throw new Error('No document provided');
  }

  private async extractTextFromBlob(blob: Blob): Promise<string> {
    // In a real implementation, this would use libraries like:
    // - PDF.js for PDFs
    // - Mammoth for Word documents
    // - XLSX for Excel files
    // For now, we'll simulate text extraction
    
    const text = await blob.text();
    return text;
  }

  private async processDocument(
    content: string,
    options: ProcessingOptions
  ): Promise<{
    requirements: ExtractedRequirement[];
    frameworks: string[];
    confidence: number;
    metadata: any;
  }> {
    // Split content into sections
    const sections = this.splitIntoSections(content);
    
    // Extract requirements from each section
    const requirements: ExtractedRequirement[] = [];
    
    for (const section of sections) {
      const sectionRequirements = await this.extractRequirements(section.content);
      
      // Categorize and map requirements
      for (const req of sectionRequirements) {
        const categorized = this.categorizeRequirement(req);
        const mapped = await this.mapToFrameworks(categorized, options.frameworks);
        
        if (categorized.confidence >= this.MIN_CONFIDENCE) {
          requirements.push({
            ...categorized,
            mappedTo: mapped,
            context: section.title
          });
        }
      }
    }

    // Detect applicable frameworks
    const detectedFrameworks = await this.detectFrameworks(content, requirements);
    const frameworks = options.frameworks?.length 
      ? options.frameworks 
      : detectedFrameworks;

    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(requirements);

    // Generate metadata
    const metadata = {
      pageCount: this.estimatePageCount(content),
      wordCount: content.split(/\s+/).length,
      language: options.detectLanguage ? this.detectLanguage(content) : 'en',
      sections: sections.map(s => ({
        ...s,
        requirementCount: requirements.filter(r => r.context === s.title).length
      }))
    };

    return {
      requirements: requirements.slice(0, options.maxRequirements),
      frameworks,
      confidence,
      metadata
    };
  }

  private splitIntoSections(content: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    
    // Common section patterns
    const sectionPatterns = [
      /^#+\s+(.+)$/gm,  // Markdown headers
      /^(\d+\.?\d*)\s+(.+)$/gm,  // Numbered sections
      /^([A-Z][A-Z\s]+)$/gm,  // All caps titles
      /^(Section|Chapter|Part)\s+\d+[:\s]+(.+)$/gim  // Explicit sections
    ];

    let lastIndex = 0;
    const matches: Array<{ index: number; title: string }> = [];

    // Find all section headers
    for (const pattern of sectionPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        matches.push({
          index: match.index,
          title: match[1] || match[2] || match[0]
        });
      }
    }

    // Sort by position
    matches.sort((a, b) => a.index - b.index);

    // Create sections
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = i < matches.length - 1 ? matches[i + 1].index : content.length;
      
      sections.push({
        title: matches[i].title.trim(),
        content: content.substring(start, end),
        requirementCount: 0
      });
    }

    // If no sections found, treat entire content as one section
    if (sections.length === 0) {
      sections.push({
        title: 'Document',
        content: content,
        requirementCount: 0
      });
    }

    return sections;
  }

  private async extractRequirements(text: string): Promise<Array<{ text: string; keywords: string[] }>> {
    const requirements: Array<{ text: string; keywords: string[] }> = [];
    const sentences = this.splitIntoSentences(text);

    for (const sentence of sentences) {
      let isRequirement = false;
      const keywords: string[] = [];

      // Check requirement patterns
      for (const pattern of this.COMPLIANCE_PATTERNS.requirement) {
        if (pattern.test(sentence)) {
          isRequirement = true;
          const matches = sentence.match(pattern);
          if (matches) {
            keywords.push(...matches.map(m => m.toLowerCase()));
          }
        }
      }

      // Check control patterns
      for (const pattern of this.COMPLIANCE_PATTERNS.control) {
        if (pattern.test(sentence)) {
          isRequirement = true;
          const matches = sentence.match(pattern);
          if (matches) {
            keywords.push(...matches.map(m => m.toLowerCase()));
          }
        }
      }

      if (isRequirement && sentence.length > 20) {
        requirements.push({
          text: sentence.trim(),
          keywords: [...new Set(keywords)]
        });
      }
    }

    return requirements;
  }

  private categorizeRequirement(requirement: { text: string; keywords: string[] }): ExtractedRequirement {
    let bestCategory = 'General';
    let highestScore = 0;
    const allKeywords = new Set<string>();

    // Extract additional keywords from text
    const words = requirement.text.toLowerCase().split(/\s+/);
    
    for (const [category, categoryKeywords] of Object.entries(this.COMPLIANCE_PATTERNS.category)) {
      let score = 0;
      
      for (const keyword of categoryKeywords) {
        if (requirement.text.toLowerCase().includes(keyword)) {
          score += 1;
          allKeywords.add(keyword);
        }
      }

      // Check existing keywords
      for (const kw of requirement.keywords) {
        if (categoryKeywords.some(ck => kw.includes(ck))) {
          score += 0.5;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestCategory = category;
      }
    }

    // Calculate confidence based on keyword matches and text clarity
    const confidence = Math.min(1, 0.5 + (highestScore * 0.1) + (requirement.keywords.length * 0.05));

    return {
      text: requirement.text,
      category: bestCategory,
      mappedTo: [],
      confidence,
      keywords: [...allKeywords, ...requirement.keywords]
    };
  }

  private async mapToFrameworks(
    requirement: ExtractedRequirement,
    targetFrameworks?: string[]
  ): Promise<MappedRequirement[]> {
    const mappings: MappedRequirement[] = [];

    // Get framework requirements from database
    let query = supabase
      .from('framework_requirements')
      .select('id, framework, title, description, keywords');

    if (targetFrameworks?.length) {
      query = query.in('framework', targetFrameworks);
    }

    const { data: frameworkRequirements } = await query;

    if (!frameworkRequirements) return mappings;

    // Calculate similarity scores
    for (const frameworkReq of frameworkRequirements) {
      const similarity = this.calculateSimilarity(
        requirement,
        {
          title: frameworkReq.title,
          description: frameworkReq.description,
          keywords: frameworkReq.keywords || []
        }
      );

      if (similarity >= this.SIMILARITY_THRESHOLD) {
        mappings.push({
          requirementId: frameworkReq.id,
          framework: frameworkReq.framework,
          title: frameworkReq.title,
          similarity
        });
      }
    }

    // Sort by similarity and limit to top 5
    return mappings
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  private calculateSimilarity(
    extracted: ExtractedRequirement,
    framework: { title: string; description: string; keywords: string[] }
  ): number {
    // Simple similarity calculation based on keyword overlap and text similarity
    const extractedWords = new Set([
      ...extracted.text.toLowerCase().split(/\s+/),
      ...extracted.keywords
    ]);

    const frameworkWords = new Set([
      ...framework.title.toLowerCase().split(/\s+/),
      ...framework.description.toLowerCase().split(/\s+/),
      ...framework.keywords
    ]);

    // Calculate Jaccard similarity
    const intersection = new Set([...extractedWords].filter(x => frameworkWords.has(x)));
    const union = new Set([...extractedWords, ...frameworkWords]);
    
    const jaccardSimilarity = intersection.size / union.size;

    // Category matching bonus
    const categoryBonus = extracted.category.toLowerCase() === framework.title.toLowerCase() ? 0.2 : 0;

    return Math.min(1, jaccardSimilarity + categoryBonus);
  }

  private async detectFrameworks(
    content: string,
    requirements: ExtractedRequirement[]
  ): Promise<string[]> {
    const frameworkMentions: Record<string, number> = {};
    
    // Common framework patterns
    const frameworkPatterns = {
      'SOC2': /\bSOC\s*2\b|\bService Organization Control\b/gi,
      'ISO27001': /\bISO\s*27001\b|\bISO\/IEC\s*27001\b/gi,
      'GDPR': /\bGDPR\b|\bGeneral Data Protection Regulation\b/gi,
      'HIPAA': /\bHIPAA\b|\bHealth Insurance Portability\b/gi,
      'PCI-DSS': /\bPCI[\s-]DSS\b|\bPayment Card Industry\b/gi,
      'NIST': /\bNIST\b|\bNational Institute of Standards\b/gi,
      'CCPA': /\bCCPA\b|\bCalifornia Consumer Privacy\b/gi
    };

    // Count mentions in content
    for (const [framework, pattern] of Object.entries(frameworkPatterns)) {
      const matches = content.match(pattern);
      if (matches) {
        frameworkMentions[framework] = matches.length;
      }
    }

    // Count mapped frameworks from requirements
    for (const req of requirements) {
      for (const mapping of req.mappedTo) {
        frameworkMentions[mapping.framework] = 
          (frameworkMentions[mapping.framework] || 0) + 1;
      }
    }

    // Return frameworks with significant mentions
    return Object.entries(frameworkMentions)
      .filter(([_, count]) => count > 2)
      .sort((a, b) => b[1] - a[1])
      .map(([framework]) => framework);
  }

  private calculateOverallConfidence(requirements: ExtractedRequirement[]): number {
    if (requirements.length === 0) return 0;
    
    const avgConfidence = requirements.reduce((sum, req) => sum + req.confidence, 0) / requirements.length;
    const mappingRate = requirements.filter(req => req.mappedTo.length > 0).length / requirements.length;
    
    return Math.round((avgConfidence * 0.7 + mappingRate * 0.3) * 100) / 100;
  }

  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting - in production would use NLP library
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  private detectDocumentType(content: string): string {
    const typePatterns = {
      'policy': /\bpolicy\b|\bpolicies\b|\bprocedure\b/gi,
      'audit_report': /\baudit\s+report\b|\bfindings\b|\bassessment\s+report\b/gi,
      'compliance_guide': /\bcompliance\s+guide\b|\bframework\b|\bstandard\b/gi,
      'contract': /\bagreement\b|\bcontract\b|\bterms\s+and\s+conditions\b/gi,
      'regulation': /\bregulation\b|\bact\b|\blaw\b|\bstatute\b/gi
    };

    let bestType = 'general';
    let highestCount = 0;

    for (const [type, pattern] of Object.entries(typePatterns)) {
      const matches = content.match(pattern);
      if (matches && matches.length > highestCount) {
        highestCount = matches.length;
        bestType = type;
      }
    }

    return bestType;
  }

  private detectLanguage(content: string): string {
    // Simple language detection based on common words
    // In production would use a proper language detection library
    const englishWords = /\b(the|and|of|to|in|is|for|with|on|at)\b/gi;
    const matches = content.match(englishWords);
    
    return matches && matches.length > 10 ? 'en' : 'unknown';
  }

  private estimatePageCount(content: string): number {
    // Rough estimate: 500 words per page
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 500));
  }

  private extractFilename(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'document';
  }
}

// Create singleton instance
export const documentAnalysisService = new DocumentAnalysisService();

export default documentAnalysisService;