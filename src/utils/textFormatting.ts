/**
 * Utility functions for text formatting and cleaning
 */

/**
 * Cleans markdown-style formatting from text, particularly for compliance requirement descriptions
 * @param text - The text to clean
 * @returns Cleaned text without markdown formatting
 */
export function cleanMarkdownFormatting(text: string): string {
  if (!text) return '';
  
  // Remove all types of markdown formatting and special characters
  let cleaned = text;
  
  // Preserve bold for subsection titles and Framework References using temporary markers
  // First preserve the ones we want to keep by marking them temporarily
  cleaned = cleaned.replace(/\*\*([a-p]\)\s[^*]+)\*\*/g, '§§§PRESERVE_BOLD§§§$1§§§PRESERVE_BOLD§§§');
  cleaned = cleaned.replace(/\*\*(Framework References:?)\*\*/g, '§§§PRESERVE_BOLD§§§$1§§§PRESERVE_BOLD§§§');
  
  // Remove all other bold markdown formatting
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.*?)__/g, '$1');
  
  // Restore the kept bold formatting
  cleaned = cleaned.replace(/§§§PRESERVE_BOLD§§§([^§]+)§§§PRESERVE_BOLD§§§/g, '**$1**');
  
  // Remove italic markdown formatting (* or _)
  cleaned = cleaned.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '$1');
  cleaned = cleaned.replace(/(?<!_)_(?!_)([^_]+)_(?!_)/g, '$1');
  
  // Remove all remaining stars and asterisks
  cleaned = cleaned.replace(/\*/g, '');
  
  // Remove Unicode symbols and special characters (fixed with u flag)
  cleaned = cleaned.replace(/[⚡🔥💡⭐✨🎯🚀💪📋🔒⚠📊📈📉🔍]/gu, '');
  cleaned = cleaned.replace(/[★☆✓✔❌❗❓⚙🔧🛠]/gu, '');
  
  // Remove emoji modifiers and zero-width characters
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // Remove bullet point markers and list formatting
  cleaned = cleaned.replace(/^\s*[\*\-\+•]\s+/gm, '');
  cleaned = cleaned.replace(/^[\s]*[\d]+[\.\)]\s+/gm, ''); // numbered lists
  
  // Replace multiple bullet points or dashes with periods
  cleaned = cleaned.replace(/•\s*/g, '. ');
  // Only replace dashes that are clearly list separators, not hyphenated words
  // Look for dashes at start of lines or with significant spacing, but preserve hyphenated words like "THIRD-PARTY"
  cleaned = cleaned.replace(/^[\s]*-[\s]+/gm, '. '); // Line-starting dashes (bullet points)
  cleaned = cleaned.replace(/[\s]{2,}-[\s]{2,}/g, '. '); // Dashes with multiple spaces (separators)
  
  // Remove excessive technical jargon indicators
  cleaned = cleaned.replace(/\b(REGULATORY|REQUIREMENTS?|OBLIGATIONS?|COMPLIANCE|DIRECTIVE)\b:?\s*/gi, '');
  
  // Simplify overly complex phrases
  cleaned = cleaned.replace(/This may seem overwhelming at first, but with proper preparation and understanding,?\s*/gi, '');
  cleaned = cleaned.replace(/The key is to understand that\s*/gi, '');
  cleaned = cleaned.replace(/The good news is that\s*/gi, '');
  cleaned = cleaned.replace(/\bAdditionally,?\s*/gi, 'Also, ');
  cleaned = cleaned.replace(/\bFurthermore,?\s*/gi, 'Also, ');
  cleaned = cleaned.replace(/\bMoreover,?\s*/gi, 'Also, ');
  
  // Shorten overly long sentences by breaking them
  cleaned = cleaned.replace(/(\w+),\s*especially\s+([^,]+),\s*/gi, '$1. For $2, ');
  cleaned = cleaned.replace(/(\w+),\s*depending\s+on\s+([^,]+),\s*/gi, '$1. This varies by $2. ');
  
  // Clean up excessive whitespace and normalize spacing
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\s*\.\s*\./g, '.');
  cleaned = cleaned.replace(/\s*;\s*/g, '. ');
  cleaned = cleaned.replace(/\s*,\s*,/g, ',');
  
  // Remove trailing punctuation duplicates
  cleaned = cleaned.replace(/([.!?])+/g, '$1');
  
  // Trim 
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Specialized cleaning for compliance sub-requirements to make them concise and gentle
 * @param text - The sub-requirement text to clean
 * @returns Clean, concise, and gentle compliance text
 */
export function cleanComplianceSubRequirement(text: string): string {
  if (!text) return '';
  
  // Clean HTML tags first if present
  let cleaned = text;
  
  // Remove HTML tags but preserve the text content
  cleaned = cleaned.replace(/<strong>(.*?)<\/strong>/g, '**$1**'); // Convert to markdown for later processing
  cleaned = cleaned.replace(/<sup>(.*?)<\/sup>/g, '($1)'); // Convert superscript to parentheses
  
  // Do NOT use cleanMarkdownFormatting here - we want to preserve bold formatting for UI display
  // Instead, do minimal cleaning while preserving important bold formatting
  
  // Clean HTML tags but keep markdown
  cleaned = cleaned.replace(/<[^>]*>/g, ''); // Remove HTML tags but keep markdown
  
  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // COMPREHENSIVE AUDIT EVIDENCE REMOVAL - Remove all audit evidence patterns from requirements display
  // This mirrors the logic in AuditEvidenceExtractor to ensure consistency
  
  const lines = cleaned.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return true; // Keep empty lines
    
    // Remove audit evidence headers and sections
    if (/^•?\s*📋.*?audit.*?ready.*?evidence.*?collection/gi.test(trimmedLine)) return false;
    if (/^•?\s*audit.*?ready.*?evidence.*?collection.*?essential.*?documentation.*?required/gi.test(trimmedLine)) return false;
    if (/^•?\s*essential.*?documentation.*?required/gi.test(trimmedLine)) return false;
    if (/technical.*?evidence.*?to.*?collect/gi.test(trimmedLine)) return false;
    
    // Remove common audit evidence bullet points (same patterns as AuditEvidenceExtractor)
    const evidencePatterns = [
      // Generic audit evidence patterns
      /^•?\s*documented.*?policy.*?with.*?management.*?approval/gi,
      /^•?\s*implementation.*?procedures.*?and.*?workflows/gi,
      /^•?\s*training.*?records.*?and.*?competency.*?assessments/gi,
      /^•?\s*regular.*?review.*?and.*?update.*?documentation/gi,
      /^•?\s*compliance.*?monitoring.*?and.*?reporting.*?records/gi,
      
      // Software inventory specific patterns
      /^•?\s*unauthorized.*?software.*?detection.*?and.*?removal.*?procedures/gi,
      /^•?\s*software.*?allowlisting.*?blocklisting.*?policies.*?and.*?enforcement.*?mechanisms/gi,
      /^•?\s*incident.*?response.*?procedures.*?for.*?unauthorized.*?software.*?discoveries/gi,
      /^•?\s*regular.*?software.*?audit.*?reports.*?showing.*?unauthorized.*?software.*?findings/gi,
      /^•?\s*user.*?access.*?controls.*?preventing.*?unauthorized.*?software.*?installation/gi,
      /^•?\s*application.*?allowlisting.*?tool.*?configuration.*?and.*?blocked.*?execution.*?logs/gi,
      /^•?\s*software.*?discovery.*?scans.*?comparing.*?found.*?software.*?against.*?approved.*?inventory/gi,
      /^•?\s*group.*?policy.*?or.*?endpoint.*?management.*?configurations.*?preventing.*?installations/gi,
      
      // Network security patterns
      /^•?\s*.*?deployment.*?coverage.*?reports.*?across.*?critical.*?enterprise.*?assets/gi,
      /^•?\s*.*?agent.*?configuration.*?and.*?detection.*?rule.*?sets/gi,
      /^•?\s*.*?alert.*?generation.*?and.*?investigation.*?logs/gi,
      /^•?\s*.*?system.*?performance.*?and.*?resource.*?utilization.*?monitoring/gi,
      /^•?\s*.*?integration.*?with.*?centralized.*?security.*?monitoring.*?and.*?siem.*?systems/gi,
      /^•?\s*.*?signature.*?and.*?rule.*?update.*?procedures.*?and.*?schedules/gi,
      
      // Infrastructure patterns
      /^•?\s*.*?network.*?infrastructure.*?inventory.*?with.*?current.*?firmware.*?software.*?versions/gi,
      /^•?\s*.*?patch.*?management.*?procedures.*?for.*?network.*?devices/gi,
      /^•?\s*.*?update.*?testing.*?results.*?and.*?rollback.*?procedures/gi,
      /^•?\s*.*?vulnerability.*?scans.*?of.*?network.*?infrastructure.*?showing.*?current.*?patch.*?levels/gi,
      
      // SIEM patterns
      /^•?\s*.*?siem.*?system.*?deployment.*?architecture.*?and.*?data.*?flow.*?diagrams/gi,
      /^•?\s*.*?log.*?source.*?configuration.*?and.*?collection.*?status.*?across.*?enterprise.*?assets/gi,
      /^•?\s*.*?security.*?event.*?correlation.*?rules.*?and.*?alerting.*?thresholds.*?configuration/gi,
      /^•?\s*.*?siem.*?dashboard.*?and.*?reporting.*?capabilities.*?demonstration/gi,
      /^•?\s*.*?security.*?event.*?storage.*?retention.*?and.*?backup.*?procedures/gi,
      
      // HIDS patterns
      /^•?\s*.*?host.*?based.*?intrusion.*?detection.*?system.*?deployment.*?policy.*?and.*?standards/gi,
      /^•?\s*.*?enterprise.*?asset.*?risk.*?assessment.*?and.*?hids.*?deployment.*?prioritization/gi,
      /^•?\s*.*?hids.*?agent.*?configuration.*?and.*?rule.*?management.*?procedures/gi,
      /^•?\s*.*?hids.*?alert.*?investigation.*?and.*?response.*?procedures/gi,
      /^•?\s*.*?hids.*?system.*?architecture.*?and.*?integration.*?documentation/gi,
      /^•?\s*.*?hids.*?performance.*?monitoring.*?and.*?tuning.*?procedures/gi
    ];
    
    // Check if this line matches any audit evidence pattern
    return !evidencePatterns.some(pattern => pattern.test(trimmedLine));
  });
  
  cleaned = filteredLines.join('\n');

  // Remove overly formal compliance language
  cleaned = cleaned.replace(/^REGULATORY\s+INCIDENT\s+REPORTING\s+REQUIREMENTS?:?\s*/gi, '');
  cleaned = cleaned.replace(/^CRITICAL\s+TIMING:?\s*/gi, 'Timing: ');
  cleaned = cleaned.replace(/^IMPORTANT\s+DUAL\s+OBLIGATIONS?:?\s*/gi, 'Note: ');
  cleaned = cleaned.replace(/^PRACTICAL\s+PREPARATION\s+TIPS?:?\s*/gi, 'Preparation: ');
  
  // Simplify authority reporting language
  cleaned = cleaned.replace(/You are required to report significant cybersecurity incidents to the CSIRT \(Computer Security Incident Response Team\) authority or supervisory authority responsible for your sector\./gi, 'Report cybersecurity incidents to your sector\'s CSIRT or supervisory authority.');
  
  // Simplify timing requirements
  cleaned = cleaned.replace(/Three-Step Reporting Timeline:\s*/gi, 'Reporting timeline: ');
  cleaned = cleaned.replace(/Early warning within 24 hours \(NIS2 requirement\) - Initial notification of significant incidents/gi, '24 hours: Initial notification (NIS2)');
  cleaned = cleaned.replace(/Incident report within 72 hours \(Both NIS2 detailed report and GDPR breach notification\) - Comprehensive incident details/gi, '72 hours: Detailed report (NIS2 + GDPR if applicable)');
  cleaned = cleaned.replace(/Final report within 1 month \(NIS2 requirement\) - Complete analysis and remediation steps/gi, '1 month: Final analysis report (NIS2)');
  
  // Simplify dual obligations
  cleaned = cleaned.replace(/If an incident affects both critical services AND personal data, you'll need to report to both your sector's supervisory authority \(for NIS2 compliance\) and your national data protection authority \(for GDPR compliance\)\./gi, 'For incidents affecting both services and personal data, report to both NIS2 supervisory authority and data protection authority.');
  
  // Simplify preparation tips
  cleaned = cleaned.replace(/Maintain an updated contact list of relevant authorities for your sector/gi, 'Keep updated authority contact lists');
  cleaned = cleaned.replace(/Prepare incident report templates that cover both NIS2 and GDPR requirements/gi, 'Prepare report templates for NIS2 and GDPR');
  cleaned = cleaned.replace(/Establish clear internal escalation procedures to meet tight deadlines/gi, 'Set up clear escalation procedures');
  cleaned = cleaned.replace(/Consider appointing a Data Protection Officer \(DPO\) who can help coordinate reporting obligations/gi, 'Consider appointing a DPO for coordination');
  
  // Shorten overly long explanations
  if (cleaned.length > 200) {
    // Split long sentences and take the most important parts
    const sentences = cleaned.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    // Keep only the most essential sentences (first 2-3)
    if (sentences.length > 3) {
      cleaned = sentences.slice(0, 3).join('. ') + '.';
    }
  }
  
  // Final cleanup
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Ensure it ends properly
  if (cleaned && !cleaned.match(/[.!?]$/)) {
    cleaned += '.';
  }
  
  return cleaned;
}

/**
 * Formats text for display with proper HTML structure
 * @param text - The text to format
 * @returns Formatted text with HTML structure
 */
export function formatComplianceText(text: string): string {
  if (!text) return '';
  
  // First clean the markdown
  let formatted = cleanMarkdownFormatting(text);
  
  // Split by bullet points or periods to create list items
  const items = formatted
    .split(/[.•]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
  
  // If we have multiple items, format as a list
  if (items.length > 1) {
    return items.map(item => `• ${item}`).join('\n');
  }
  
  return formatted;
}

/**
 * Extracts and formats bullet points from compliance text
 * @param text - The text containing bullet points
 * @returns Array of cleaned bullet point items
 */
export function extractBulletPoints(text: string): string[] {
  if (!text) return [];
  
  // Split by lines and extract bullet points
  const lines = text.split('\n');
  const items: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check if line starts with bullet point indicators
    const bulletMatch = trimmed.match(/^[•\*\-\+]|\d+[\.\)]/) ;
    if (bulletMatch) {
      // Remove the bullet indicator and clean the text
      const content = trimmed.replace(/^[•\*\-\+]\s*|\d+[\.\)]\s*/, '').trim();
      if (content.length > 0) {
        items.push(cleanMarkdownFormatting(content));
      }
    }
  }
  
  return items;
}

/**
 * Converts markdown-formatted text to plain text while preserving structure
 * @param markdown - The markdown text to convert
 * @returns Plain text with preserved structure
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) return '';
  
  let plainText = markdown;
  
  // Convert headers to uppercase
  plainText = plainText.replace(/^#{1,6}\s+(.+)$/gm, (_, header) => header.toUpperCase());
  
  // Convert bold text
  plainText = plainText.replace(/\*\*(.*?)\*\*/g, '$1');
  plainText = plainText.replace(/__(.*?)__/g, '$1');
  
  // Convert italic text
  plainText = plainText.replace(/\*(.*?)\*/g, '$1');
  plainText = plainText.replace(/_(.*?)_/g, '$1');
  
  // Convert code blocks
  plainText = plainText.replace(/```[^`]*```/g, (match) => {
    return match.replace(/```/g, '').trim();
  });
  
  // Convert inline code
  plainText = plainText.replace(/`([^`]+)`/g, '$1');
  
  // Convert links
  plainText = plainText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Clean up extra whitespace
  plainText = plainText.replace(/\n{3,}/g, '\n\n');
  plainText = plainText.trim();
  
  return plainText;
}