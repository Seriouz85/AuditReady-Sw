import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';

interface RequirementEmbedding {
  requirementId: string;
  title: string;
  description: string;
  embedding: number[];
  framework: string;
}

interface SimilarityResult {
  targetRequirement: string;
  sourceRequirement: string;
  similarityScore: number;
  mappingStrength: 'exact' | 'strong' | 'partial' | 'related';
  confidence: number;
}

export class SemanticMappingEngine {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is required for semantic mapping');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Step 1: Generate embeddings for requirement text using Gemini
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
      
      const result = await model.embedContent(text);
      const embedding = result.embedding;
      
      if (!embedding || !embedding.values) {
        throw new Error('No embedding values returned from Gemini API');
      }
      
      return embedding.values;
    } catch (error) {
      console.error('Error generating embedding with Gemini:', error);
      throw error;
    }
  }

  /**
   * Step 2: Store embeddings for all existing unified requirements
   */
  async indexExistingRequirements(): Promise<void> {
    console.log('🔄 Indexing existing unified requirements...');
    
    // Get all unified requirements
    const { data: unifiedReqs } = await supabase
      .from('unified_requirements')
      .select(`
        id,
        title,
        description,
        implementation_guidance,
        category:unified_compliance_categories(name)
      `);

    if (!unifiedReqs) return;

    for (const req of unifiedReqs) {
      // Combine title, description, and guidance for richer context
      const fullText = `${req.title} ${req.description} ${req.implementation_guidance || ''}`;
      
      try {
        const embedding = await this.generateEmbedding(fullText);
        
        // Store in database (you'll need to create this table)
        await supabase
          .from('requirement_embeddings')
          .upsert({
            requirement_id: req.id,
            requirement_type: 'unified',
            title: req.title,
            description: req.description,
            framework: 'unified',
            embedding: embedding,
            indexed_at: new Date().toISOString()
          });
          
        console.log(`✅ Indexed: ${req.title}`);
        
        // Rate limiting to avoid API limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error indexing ${req.title}:`, error);
      }
    }
    
    console.log('🎉 Indexing complete!');
  }

  /**
   * Step 3: Find similar requirements using cosine similarity
   */
  async findSimilarRequirements(
    newRequirement: { title: string; description: string; framework: string },
    threshold: number = 0.7
  ): Promise<SimilarityResult[]> {
    
    // Generate embedding for new requirement
    const newText = `${newRequirement.title} ${newRequirement.description}`;
    const newEmbedding = await this.generateEmbedding(newText);
    
    // Get all existing embeddings
    const { data: existingEmbeddings } = await supabase
      .from('requirement_embeddings')
      .select('*')
      .eq('requirement_type', 'unified');
      
    if (!existingEmbeddings) return [];
    
    const similarities: SimilarityResult[] = [];
    
    for (const existing of existingEmbeddings) {
      const similarity = this.cosineSimilarity(newEmbedding, existing.embedding);
      
      if (similarity >= threshold) {
        similarities.push({
          targetRequirement: existing.requirement_id,
          sourceRequirement: newRequirement.title,
          similarityScore: similarity,
          mappingStrength: this.determineMappingStrength(similarity),
          confidence: Math.round(similarity * 100)
        });
      }
    }
    
    // Sort by similarity score (highest first)
    return similarities.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  /**
   * Step 4: Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Step 5: Determine mapping strength based on similarity score
   */
  private determineMappingStrength(similarity: number): 'exact' | 'strong' | 'partial' | 'related' {
    if (similarity >= 0.95) return 'exact';
    if (similarity >= 0.85) return 'strong';
    if (similarity >= 0.75) return 'partial';
    return 'related';
  }

  /**
   * Step 6: Batch process new framework requirements
   */
  async processNewFramework(
    frameworkName: string,
    newRequirements: Array<{ title: string; description: string; code: string }>
  ): Promise<{
    autoMapped: SimilarityResult[];
    needsReview: Array<{ requirement: any; reason: string }>;
    newCategories: string[];
  }> {
    
    console.log(`🔄 Processing ${newRequirements.length} requirements from ${frameworkName}...`);
    
    const autoMapped: SimilarityResult[] = [];
    const needsReview: Array<{ requirement: any; reason: string }> = [];
    const potentialNewCategories: Set<string> = new Set();
    
    for (const req of newRequirements) {
      try {
        const similarities = await this.findSimilarRequirements({
          title: req.title,
          description: req.description,
          framework: frameworkName
        });
        
        if (similarities.length === 0) {
          needsReview.push({
            requirement: req,
            reason: 'No similar requirements found - may need new unified requirement'
          });
          
          // AI suggests category for unmapped requirements
          const suggestedCategory = await this.suggestCategory(req);
          potentialNewCategories.add(suggestedCategory);
          
        } else if (similarities[0].confidence >= 85) {
          // High confidence - auto-map
          autoMapped.push(similarities[0]);
          
        } else {
          // Low confidence - human review needed
          needsReview.push({
            requirement: req,
            reason: `Low confidence mapping (${similarities[0].confidence}%) - human review recommended`
          });
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error processing ${req.title}:`, error);
        needsReview.push({
          requirement: req,
          reason: `Processing error: ${error}`
        });
      }
    }
    
    return {
      autoMapped,
      needsReview,
      newCategories: Array.from(potentialNewCategories)
    };
  }

  /**
   * Step 7: AI suggests category for unmapped requirements using Gemini
   */
  private async suggestCategory(requirement: { title: string; description: string }): Promise<string> {
    const prompt = `
Given this compliance requirement:
Title: ${requirement.title}
Description: ${requirement.description}

Existing categories:
- Governance & Leadership
- Risk Management & Assessment
- Access Control & Identity Management
- Data Protection & Privacy
- Network Security
- Incident Response & Recovery
- Physical Security
- Supplier Risk Management
- Asset Management
- Business Continuity

Which existing category fits best, or suggest a new category name if none fit well.
Respond with just the category name.`;

    try {
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      return text || 'General Security';
    } catch (error) {
      console.error('Error suggesting category with Gemini:', error);
      return 'General Security';
    }
  }
}

// Usage in your compliance service
export const semanticMapper = new SemanticMappingEngine();