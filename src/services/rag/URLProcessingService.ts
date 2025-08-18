/**
 * URL Processing Service
 * Handles URL validation, content analysis, and category identification
 */

export class URLProcessingService {
  /**
   * Validate if URL is accessible and contains relevant content
   */
  static async validateURL(url: string): Promise<boolean> {
    try {
      // Basic URL validation
      new URL(url);
      
      // Check if URL is accessible
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('URL validation failed:', error);
      return false;
    }
  }

  /**
   * Identify relevant compliance categories from content
   */
  static async identifyRelevantCategories(content: string): Promise<string[]> {
    const lowerContent = content.toLowerCase();
    const categories: string[] = [];

    const categoryKeywords = {
      'governance': ['governance', 'leadership', 'management', 'strategy', 'policy'],
      'access_control': ['access', 'authentication', 'authorization', 'identity', 'login'],
      'asset_management': ['asset', 'inventory', 'classification', 'handling', 'lifecycle'],
      'cryptography': ['encryption', 'cryptography', 'key', 'certificate', 'hash'],
      'physical_security': ['physical', 'facility', 'environmental', 'premises', 'building'],
      'operations_security': ['operations', 'procedure', 'change', 'capacity', 'backup'],
      'communications_security': ['network', 'communication', 'transmission', 'protocol'],
      'system_development': ['development', 'testing', 'coding', 'application', 'software'],
      'supplier_relationships': ['supplier', 'vendor', 'third-party', 'outsourcing'],
      'incident_management': ['incident', 'response', 'recovery', 'emergency', 'breach'],
      'business_continuity': ['continuity', 'disaster', 'recovery', 'resilience'],
      'compliance': ['compliance', 'regulatory', 'legal', 'audit', 'requirement'],
      'risk_management': ['risk', 'threat', 'vulnerability', 'assessment', 'analysis'],
      'training': ['training', 'awareness', 'education', 'competency', 'skills'],
      'monitoring': ['monitoring', 'logging', 'detection', 'surveillance', 'alerting'],
      'vulnerability_management': ['vulnerability', 'patch', 'remediation', 'scanning'],
      'data_protection': ['data protection', 'privacy', 'personal data', 'gdpr'],
      'identity_management': ['identity', 'directory', 'provisioning', 'lifecycle'],
      'security_architecture': ['architecture', 'design', 'security by design'],
      'threat_intelligence': ['threat intelligence', 'intelligence', 'indicators'],
      'security_testing': ['penetration', 'testing', 'assessment', 'evaluation']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const relevanceScore = keywords.filter(keyword => 
        lowerContent.includes(keyword)
      ).length / keywords.length;

      if (relevanceScore >= 0.3) { // 30% keyword match threshold
        categories.push(category);
      }
    }

    return categories.length > 0 ? categories : ['compliance']; // Default fallback
  }
}