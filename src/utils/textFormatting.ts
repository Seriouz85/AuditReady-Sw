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
  
  // Remove bold markdown formatting (** or __)
  let cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.*?)__/g, '$1');
  
  // Remove italic markdown formatting (* or _)
  cleaned = cleaned.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '$1');
  cleaned = cleaned.replace(/(?<!_)_(?!_)([^_]+)_(?!_)/g, '$1');
  
  // Remove bullet point markers at the beginning of lines
  cleaned = cleaned.replace(/^\s*[\*\-\+]\s+/gm, '');
  
  // Replace multiple bullet points with proper separation
  cleaned = cleaned.replace(/•\s*/g, '. ');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Ensure sentences end with proper punctuation
  cleaned = cleaned.replace(/\.\s*\./g, '.');
  
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