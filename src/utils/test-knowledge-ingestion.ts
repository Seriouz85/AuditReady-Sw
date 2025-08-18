/**
 * Simple test for knowledge ingestion using a lightweight web scraper
 */

// Simple content extraction test
export async function testKnowledgeExtraction(url: string): Promise<{ success: boolean; contentLength: number; error?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AuditReady Knowledge Bot 1.0'
      }
    });
    
    if (!response.ok) {
      return { success: false, contentLength: 0, error: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    
    // Very basic content extraction (remove scripts, styles, and get text)
    const cleanText = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return { success: true, contentLength: cleanText.length };
    
  } catch (error) {
    return { 
      success: false, 
      contentLength: 0, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Test compliance-relevant content detection
export function analyzeContentForCompliance(content: string): { 
  relevanceScore: number; 
  detectedTopics: string[];
  wordCount: number;
} {
  const lowerContent = content.toLowerCase();
  
  // Compliance keywords to detect
  const complianceKeywords = [
    'compliance', 'security', 'risk', 'audit', 'governance', 'policy',
    'control', 'framework', 'implementation', 'requirement', 'standard',
    'iso', 'nist', 'gdpr', 'nis2', 'cis', 'management', 'assessment',
    'procedure', 'documentation', 'monitoring', 'incident', 'access',
    'data protection', 'information security', 'cyber', 'threat'
  ];
  
  const detectedTopics: string[] = [];
  let relevanceScore = 0;
  
  complianceKeywords.forEach(keyword => {
    if (lowerContent.includes(keyword)) {
      detectedTopics.push(keyword);
      relevanceScore += 1;
    }
  });
  
  // Normalize relevance score (0-1)
  relevanceScore = Math.min(relevanceScore / complianceKeywords.length, 1);
  
  const wordCount = content.split(/\s+/).length;
  
  return {
    relevanceScore,
    detectedTopics,
    wordCount
  };
}