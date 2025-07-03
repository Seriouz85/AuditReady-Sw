import { cleanMarkdownFormatting, formatComplianceText, extractBulletPoints, markdownToPlainText } from '../textFormatting';

describe('textFormatting utilities', () => {
  describe('cleanMarkdownFormatting', () => {
    it('should remove bold markdown formatting', () => {
      const input = '**Implementation for Critical Infrastructure**';
      const expected = 'Implementation for Critical Infrastructure';
      expect(cleanMarkdownFormatting(input)).toBe(expected);
    });

    it('should remove multiple bold sections', () => {
      const input = '**Network Segmentation**: Establish **clear separation** between IT and OT networks';
      const expected = 'Network Segmentation: Establish clear separation between IT and OT networks';
      expect(cleanMarkdownFormatting(input)).toBe(expected);
    });

    it('should remove bullet points', () => {
      const input = '• Network Segmentation: IT/OT separation\n• Access Controls: MFA required';
      const expected = '. Network Segmentation: IT/OT separation . Access Controls: MFA required';
      expect(cleanMarkdownFormatting(input)).toBe(expected);
    });

    it('should handle NIS2 formatted text', () => {
      const input = `**Implementation for Critical Infrastructure**

• **Network Segmentation**: Establish clear separation between IT and OT networks using firewalls, DMZs, and secure gateways
• **Industrial Protocol Security**: Secure industrial protocols (Modbus, DNP3, IEC 61850) with authentication and encryption where possible`;
      
      const expected = 'Implementation for Critical Infrastructure . Network Segmentation: Establish clear separation between IT and OT networks using firewalls, DMZs, and secure gateways . Industrial Protocol Security: Secure industrial protocols (Modbus, DNP3, IEC 61850) with authentication and encryption where possible';
      expect(cleanMarkdownFormatting(input)).toBe(expected);
    });

    it('should handle empty or null input', () => {
      expect(cleanMarkdownFormatting('')).toBe('');
      expect(cleanMarkdownFormatting(null as any)).toBe('');
      expect(cleanMarkdownFormatting(undefined as any)).toBe('');
    });

    it('should clean up extra whitespace', () => {
      const input = '**Bold**    text     with    spaces';
      const expected = 'Bold text with spaces';
      expect(cleanMarkdownFormatting(input)).toBe(expected);
    });
  });

  describe('formatComplianceText', () => {
    it('should format text with bullet points', () => {
      const input = '**Section 1**: First item. **Section 2**: Second item';
      const result = formatComplianceText(input);
      expect(result).toContain('• Section 1: First item');
      expect(result).toContain('• Section 2: Second item');
    });

    it('should return cleaned text for single item', () => {
      const input = '**Single requirement** with no bullets';
      const expected = 'Single requirement with no bullets';
      expect(formatComplianceText(input)).toBe(expected);
    });
  });

  describe('extractBulletPoints', () => {
    it('should extract bullet points from text', () => {
      const input = `• First point with **bold**
• Second point with *italic*
• Third point`;
      
      const result = extractBulletPoints(input);
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('First point with bold');
      expect(result[1]).toBe('Second point with italic');
      expect(result[2]).toBe('Third point');
    });

    it('should handle numbered lists', () => {
      const input = `1. First item
2. Second item
3. Third item`;
      
      const result = extractBulletPoints(input);
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('First item');
    });
  });

  describe('markdownToPlainText', () => {
    it('should convert complete markdown to plain text', () => {
      const input = `# Header
**Bold text** and *italic text*
[Link text](https://example.com)
\`inline code\``;
      
      const result = markdownToPlainText(input);
      expect(result).toContain('HEADER');
      expect(result).toContain('Bold text and italic text');
      expect(result).toContain('Link text');
      expect(result).toContain('inline code');
      expect(result).not.toContain('**');
      expect(result).not.toContain('`');
    });
  });
});