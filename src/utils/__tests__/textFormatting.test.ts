import { cleanMarkdownFormatting, formatComplianceText, extractBulletPoints, markdownToPlainText, cleanComplianceSubRequirement } from '../textFormatting';

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

  describe('cleanComplianceSubRequirement', () => {
    it('should clean compliance sub-requirements to be concise and gentle', () => {
      const input = '**REGULATORY INCIDENT REPORTING REQUIREMENTS:** When security incidents occur, especially those involving personal data or critical services, you have specific obligations to contact relevant authorities. **Three-Step Reporting Timeline:** • **Early warning within 24 hours** (NIS2 requirement) - Initial notification of significant incidents • **Incident report within 72 hours** (Both NIS2 detailed report and GDPR breach notification) - Comprehensive incident details';
      const result = cleanComplianceSubRequirement(input);
      
      expect(result).toBe('When security incidents occur, for those involving personal data or critical services, you have specific obligations to contact relevant authorities. Reporting timeline: 24 hours: Initial notification (NIS2). 72 hours: Detailed report (NIS2 + GDPR if applicable).');
      expect(result.length).toBeLessThan(300); // Should be significantly shorter
      expect(result).not.toContain('**');
      expect(result).not.toContain('REGULATORY');
      expect(result).not.toContain('•');
    });

    it('should handle overly long compliance text by truncating appropriately', () => {
      const longInput = 'REGULATORY INCIDENT REPORTING REQUIREMENTS: When security incidents occur, especially those involving personal data or critical services, you have specific obligations to contact relevant authorities. This may seem overwhelming at first, but with proper preparation and understanding, these requirements become manageable. The key is to understand that different types of incidents may require reporting to different authorities depending on your sector and the nature of the incident. **Authority Reporting Process:** You are required to report significant cybersecurity incidents to the CSIRT (Computer Security Incident Response Team) authority or supervisory authority responsible for your sector. Additionally, if personal data is involved, you must also notify your national data protection authority.';
      
      const result = cleanComplianceSubRequirement(longInput);
      
      expect(result.length).toBeLessThan(400); // Should be much shorter than original
      expect(result).not.toContain('**');
      expect(result).not.toContain('REGULATORY');
      expect(result).not.toContain('This may seem overwhelming');
      expect(result).not.toContain('•');
    });

    it('should simplify authority reporting language', () => {
      const input = 'You are required to report significant cybersecurity incidents to the CSIRT (Computer Security Incident Response Team) authority or supervisory authority responsible for your sector.';
      const result = cleanComplianceSubRequirement(input);
      
      expect(result).toBe('Report cybersecurity incidents to your sector\'s CSIRT or supervisory authority.');
    });

    it('should remove star keys and weird symbols', () => {
      const input = '★ **Critical requirement** ⚡️ with ✨ emoji ⭐️ and other *** symbols ***';
      const result = cleanComplianceSubRequirement(input);
      
      expect(result).not.toContain('★');
      expect(result).not.toContain('⚡️');
      expect(result).not.toContain('✨');
      expect(result).not.toContain('⭐️');
      expect(result).not.toContain('**');
      expect(result).not.toContain('***');
    });
  });
});